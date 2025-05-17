import { EmailAttachment, EmailMessage } from "./types";
import pLimit from "p-limit";
import { db } from "@/drizzle/db";
import { turndown, processEmailText, normalizeText } from "./turndown";
import { getEmbeddings } from "./embedding";
import { auth } from "@clerk/nextjs/server";
import redisHandler from "./redis";
import { eq, and, desc, asc } from "drizzle-orm";
import {
  account,
  email as emailTable,
  emailAddress,
  emailAttachment,
  emailEmbedding,
  thread,
  toEmails,
  ccEmails,
  bccEmails,
  replyToEmails,
} from "@/drizzle/schema";

export async function syncEmailsToDatabase(
  emails: EmailMessage[],
  accountId: string,
) {
  console.log(`Syncing ${emails.length} emails to database`);
  const limit = pLimit(5);
  try {
    const embeddingPromises = [];

    for (const [index, email] of emails.entries()) {
      // First store the email
      await upsertEmail(email, accountId, index);

      // Trigger embedding generation without awaiting
      processEmailEmbedding(email, limit);

      await invalidatedUserThreadCache(accountId);
    }
  } catch (error) {
    console.log("Error");
  }
}

async function invalidatedUserThreadCache(accountId: string) {
  console.log("Invalidating Thread Cache");
  const { userId } = await auth();
  const tabs = ["inbox", "draft", "sent"];
  const doneStates = ["true", "false", "all"];
  const keys: string[] = [];
  for (const tab of tabs) {
    for (const done of doneStates) {
      keys.push(
        `threads:user:${userId}:account:${accountId}:tab:${tab}:done:${done}`,
      );
    }
  }

  for (const key of keys) {
    await redisHandler.del(key);
  }
}

async function upsertEmail(
  email: EmailMessage,
  accountId: string,
  index: number,
) {
  console.log("Upsert Email", index);

  try {
    let emailLabelType: "inbox" | "draft" | "sent" = "inbox";
    if (
      email?.sysLabels?.includes("inbox") ||
      email?.sysLabels?.includes("important")
    ) {
      emailLabelType = "inbox";
    } else if (email?.sysLabels?.includes("sent")) {
      emailLabelType = "sent";
    } else if (email?.sysLabels?.includes("draft")) {
      emailLabelType = "draft";
    }
    const addressToUpsert = new Map();
    for (const address of [
      email?.from,
      ...email.to,
      ...email.cc,
      ...email.bcc,
      ...email.replyTo,
    ]) {
      addressToUpsert.set(address.address, address);
    }
    const upsertedAddresses: Awaited<ReturnType<typeof upsertEmailAddress>>[] =
      [];
    for (const address of addressToUpsert?.values()) {
      const upsertAddress = await upsertEmailAddress(address, accountId);
      upsertedAddresses.push(upsertAddress);
    }
    const addressMap = new Map(
      upsertedAddresses
        .filter(Boolean)
        ?.map((address) => [address!.address, address]),
    );
    const fromAddress = addressMap?.get(email?.from?.address);
    if (!fromAddress) {
      console.log(
        `Failed to upsert from address to email"${email.bodySnippet}`,
      );
      return;
    }
    const toAddresses = email.to
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);
    const ccAddresses = email.cc
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);
    const bccAddresses = email.bcc
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);
    const replyToAddresses = email.replyTo
      .map((addr) => addressMap.get(addr.address))
      .filter(Boolean);

    // 2. Upsert thread
    // First, check if thread exists
    const existingThread = await db
      .select()
      .from(thread)
      .where(eq(thread.id, email.threadId))
      .execute();

    let threadResult;
    const sentAtISOString = new Date(email.sentAt).toISOString();

    if (existingThread.length > 0) {
      // Update thread
      await db
        .update(thread)
        .set({
          subject: email.subject,
          accountId,
          lastMessageDate: sentAtISOString,
          done: false,
          participantsIds: [
            ...new Set([
              fromAddress.id,
              ...toAddresses.map((a) => a!.id),
              ...ccAddresses.map((a) => a!.id),
              ...bccAddresses.map((a) => a!.id),
            ]),
          ],
        })
        .where(eq(thread.id, email.threadId));

      threadResult = existingThread[0];
    } else {
      // Create thread
      const insertedThread = await db
        .insert(thread)
        .values({
          id: email.threadId,
          accountId,
          subject: email.subject,
          done: false,
          draftStatus: emailLabelType === "draft",
          inboxStatus: emailLabelType === "inbox",
          sentStatus: emailLabelType === "sent",
          lastMessageDate: sentAtISOString,
          participantsIds: [
            ...new Set([
              fromAddress.id,
              ...toAddresses.map((a) => a!.id),
              ...ccAddresses.map((a) => a!.id),
              ...bccAddresses.map((a) => a!.id),
            ]),
          ],
        })
        .returning();

      threadResult = insertedThread[0];
    }

    if (!threadResult) {
      console.log("Failed to create or update thread");
      return;
    }

    // 3. Upsert Email
    // First, check if email exists
    const existingEmail = await db
      .select()
      .from(emailTable)
      .where(eq(emailTable.id, email.id))
      .execute();

    const createdTimeISOString = new Date(email.createdTime).toISOString();
    const receivedAtISOString = new Date(email.receivedAt).toISOString();
    const nowISOString = new Date().toISOString();

    if (existingEmail.length > 0) {
      // Update email
      await db
        .update(emailTable)
        .set({
          threadId: threadResult.id,
          createdTime: createdTimeISOString,
          lastModifiedTime: nowISOString,
          sentAt: sentAtISOString,
          receivedAt: receivedAtISOString,
          internetMessageId: email.internetMessageId,
          subject: email.subject,
          sysLabels: email.sysLabels,
          keywords: email.keywords,
          sysClassifications: email.sysClassifications,
          sensitivity: email.sensitivity,
          meetingMessageMethod: email.meetingMessageMethod,
          fromId: fromAddress.id,
          hasAttachments: email.hasAttachments,
          internetHeaders: email.internetHeaders as any,
          body: email.body,
          bodySnippet: email.bodySnippet,
          inReplyTo: email.inReplyTo,
          references: email.references,
          threadIndex: email.threadIndex,
          nativeProperties: email.nativeProperties as any,
          folderId: email.folderId,
          omitted: email.omitted,
          emailLabel: emailLabelType,
        })
        .where(eq(emailTable.id, email.id));

      // For existing emails, delete existing relationships first to avoid duplicates
      await db.delete(toEmails).where(eq(toEmails.a, email.id));
      await db.delete(ccEmails).where(eq(ccEmails.a, email.id));
      await db.delete(bccEmails).where(eq(bccEmails.a, email.id));
      await db.delete(replyToEmails).where(eq(replyToEmails.a, email.id));

      // Re-add relationships
      // 'to' email relationships
      for (const toAddress of toAddresses) {
        if (toAddress) {
          await db
            .insert(toEmails)
            .values({
              a: email.id,
              b: toAddress.id,
            })
            .onConflictDoNothing();
        }
      }

      // 'cc' email relationships
      for (const ccAddress of ccAddresses) {
        if (ccAddress) {
          await db
            .insert(ccEmails)
            .values({
              a: email.id,
              b: ccAddress.id,
            })
            .onConflictDoNothing();
        }
      }

      // 'bcc' email relationships
      for (const bccAddress of bccAddresses) {
        if (bccAddress) {
          await db
            .insert(bccEmails)
            .values({
              a: email.id,
              b: bccAddress.id,
            })
            .onConflictDoNothing();
        }
      }

      // 'replyTo' email relationships
      for (const replyToAddress of replyToAddresses) {
        if (replyToAddress) {
          await db
            .insert(replyToEmails)
            .values({
              a: email.id,
              b: replyToAddress.id,
            })
            .onConflictDoNothing();
        }
      }
    } else {
      // Create email
      await db.insert(emailTable).values({
        id: email.id,
        emailLabel: emailLabelType,
        threadId: threadResult.id,
        createdTime: createdTimeISOString,
        lastModifiedTime: nowISOString,
        sentAt: sentAtISOString,
        receivedAt: receivedAtISOString,
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        internetHeaders: email.internetHeaders as any,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        hasAttachments: email.hasAttachments,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties: email.nativeProperties as any,
        folderId: email.folderId,
        omitted: email.omitted,
      });

      // Add initial relationships for new emails
      // 'to' email relationships
      for (const toAddress of toAddresses) {
        if (toAddress) {
          await db
            .insert(toEmails)
            .values({
              a: email.id,
              b: toAddress.id,
            })
            .onConflictDoNothing();
        }
      }

      // 'cc' email relationships
      for (const ccAddress of ccAddresses) {
        if (ccAddress) {
          await db
            .insert(ccEmails)
            .values({
              a: email.id,
              b: ccAddress.id,
            })
            .onConflictDoNothing();
        }
      }

      // 'bcc' email relationships
      for (const bccAddress of bccAddresses) {
        if (bccAddress) {
          await db
            .insert(bccEmails)
            .values({
              a: email.id,
              b: bccAddress.id,
            })
            .onConflictDoNothing();
        }
      }

      // 'replyTo' email relationships
      for (const replyToAddress of replyToAddresses) {
        if (replyToAddress) {
          await db
            .insert(replyToEmails)
            .values({
              a: email.id,
              b: replyToAddress.id,
            })
            .onConflictDoNothing();
        }
      }
    }

    // Update thread status based on emails
    const threadEmails = await db
      .select()
      .from(emailTable)
      .where(eq(emailTable.threadId, threadResult.id))
      .orderBy(asc(emailTable.receivedAt))
      .execute();

    let threadFolderType = "sent";
    for (const threadEmail of threadEmails) {
      if (threadEmail.emailLabel === "inbox") {
        threadFolderType = "inbox";
        break; // If any email is in inbox, the whole thread is in inbox
      } else if (threadEmail.emailLabel === "draft") {
        threadFolderType = "draft"; // Set to draft, but continue checking for inbox
      }
    }

    await db
      .update(thread)
      .set({
        draftStatus: threadFolderType === "draft",
        inboxStatus: threadFolderType === "inbox",
        sentStatus: threadFolderType === "sent",
      })
      .where(eq(thread.id, threadResult.id));

    // 4. Upsert Attachments
    for (const attachment of email.attachments) {
      await upsertAttachment(email.id, attachment);
    }
  } catch (error) {
    console.log(error);
  }
}

async function upsertEmailAddress(address: any, accountId: string) {
  try {
    const existingAddress = await db
      .select()
      .from(emailAddress)
      .where(
        and(
          eq(emailAddress.accountId, accountId),
          eq(emailAddress.address, address.address ?? ""),
        ),
      )
      .execute();

    if (existingAddress.length > 0) {
      return existingAddress[0];
    } else {
      const newAddress = await db
        .insert(emailAddress)
        .values({
          id: crypto.randomUUID(), // Generate a UUID for the new address
          address: address?.address ?? "",
          name: address?.name,
          raw: address?.raw,
          accountId,
        })
        .returning();

      return newAddress[0];
    }
  } catch (error) {
    console.log("Failed to upsert Email Address", error);
    return null;
  }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
  try {
    const existingAttachment = await db
      .select()
      .from(emailAttachment)
      .where(eq(emailAttachment.id, attachment.id ?? ""))
      .execute();

    if (existingAttachment.length > 0) {
      await db
        .update(emailAttachment)
        .set({
          name: attachment.name,
          mimeType: attachment.mimeType,
          size: attachment.size,
          inline: attachment.inline,
          contentId: attachment.contentId,
          content: attachment.content,
          contentLocation: attachment.contentLocation,
        })
        .where(eq(emailAttachment.id, attachment.id ?? ""));
    } else {
      await db.insert(emailAttachment).values({
        id: attachment.id,
        emailId,
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      });
    }
  } catch (error) {
    console.log(`Failed to upsert attachment for email ${emailId}: ${error}`);
  }
}

async function storeEmailEmbedding(
  emailId: string,
  embedding: number[],
  payload: string,
) {
  try {
    const existingEmbedding = await db
      .select()
      .from(emailEmbedding)
      .where(eq(emailEmbedding.emailId, emailId))
      .execute();

    if (existingEmbedding.length > 0) {
      // Update existing embedding
      await db
        .update(emailEmbedding)
        .set({
          embedding: embedding,
          content: payload,
        })
        .where(eq(emailEmbedding.emailId, emailId));
    } else {
      // Insert new embedding
      await db.insert(emailEmbedding).values({
        id: crypto.randomUUID(),
        emailId: emailId,
        embedding: embedding,
        content: payload,
      });
    }
  } catch (error) {
    console.log(`Failed to store embedding for email ${emailId}: ${error}`);
  }
}

// Separate function to process email embedding asynchronously
function processEmailEmbedding(
  email: EmailMessage,
  limit: ReturnType<typeof pLimit>,
) {
  // No await here - this runs completely independently
  limit(async () => {
    try {
      const cleanBody = processEmailText(email.body ?? email.bodySnippet ?? "");
      const cleanSubject = normalizeText(email.subject);
      const payload = `From: ${email.from.name} <${email.from.address}>\nTo: ${email.to.map((t) => `${t.name} <${t.address}>`).join(", ")}\nSubject: ${cleanSubject}\nBody: ${cleanBody}\nSentAt: ${new Date(email.sentAt).toLocaleString()}`;
      const bodyEmbedding = await getEmbeddings(payload);
      await storeEmailEmbedding(email.id, bodyEmbedding, payload);
    } catch (error) {
      console.log(`Error processing embedding for email ${email.id}:`, error);
    }
  });
}
