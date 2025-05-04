import {
  EmailAttachment,
  EmailMessage,
  EmailAddress as EmailAddressType,
} from "./types";
import pLimit from "p-limit";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { OramaClient } from "./orama";
import { turndown } from "./turndown";
import { getEmbeddings } from "./embedding";
import { clerkClient, auth } from "@clerk/nextjs/server";
import {
  EmailLabel,
  Sensitivity,
  MeetingMessageMethod,
} from "@/server/db/schema/emails";

// Define types based on schema for clarity
type EmailAddressDb = typeof schema.emailAddresses.$inferSelect;
type ThreadDb = typeof schema.threads.$inferSelect;
type EmailDb = typeof schema.emails.$inferSelect;

export async function syncEmailsToDatabase(
  emails: EmailMessage[],
  accountId: string,
) {
  console.log(`Syncing ${emails.length} emails to database`);
  const limit = pLimit(5);
  const orama = new OramaClient(accountId);
  await orama.init();
  try {
    async function syncToOrama() {
      await Promise.all(
        emails.map((email) => {
          return limit(async () => {
            const body = turndown.turndown(
              email.body ?? email.bodySnippet ?? "",
            );
            const payload = `From: ${email.from.name} <${email.from.address}>\nTo: ${email.to.map((t) => `${t.name} <${t.address}>`).join(", ")}\nSubject: ${email.subject}\nBody: ${body}\n SentAt: ${new Date(email.sentAt).toLocaleString()}`;
            const bodyEmbedding = await getEmbeddings(payload);
            await orama.insert({
              title: email.subject,
              body: body,
              rawBody: email.bodySnippet ?? "",
              from: `${email.from.name} <${email.from.address}>`,
              to: email.to.map((t) => `${t.name} <${t.address}>`),
              sentAt: new Date(email.sentAt).toLocaleString(),
              embeddings: bodyEmbedding,
              threadId: email.threadId,
            });
          });
        }),
      );
    }

    async function syncToDB() {
      for (const [index, email] of emails.entries()) {
        await upsertEmail(email, accountId, index);
      }
    }
    await Promise.all([syncToOrama(), syncToDB()]);

    await orama.saveIndex();
    // await Promise.all(
    //   emails?.map((email, index) => upsertEmail(email, accountId, index)),
    // );
  } catch (error) {
    console.log("Error");
  }
}

async function upsertEmail(
  email: EmailMessage,
  accountId: string,
  index: number,
) {
  console.log("Upsert Email", index);

  try {
    let emailLabelType: EmailLabel = "inbox"; // Use imported Drizzle enum type
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
    const addressToUpsert = new Map<string, EmailAddressType>();
    for (const address of [
      email?.from,
      ...email.to,
      ...email.cc,
      ...email.bcc,
      ...email.replyTo,
    ].filter((a): a is EmailAddressType => !!a)) {
      // Ensure address is not null/undefined
      if (address.address) {
        addressToUpsert.set(address.address, address);
      }
    }

    const upsertedAddresses: (EmailAddressDb | null)[] = await Promise.all(
      Array.from(addressToUpsert.values()).map((addr) =>
        upsertEmailAddress(addr, accountId),
      ),
    );

    const addressMap = new Map<string, EmailAddressDb>(
      upsertedAddresses
        .filter((a): a is EmailAddressDb => !!a)
        .map((address) => [address.address, address]),
    );

    const fromAddress = email.from?.address
      ? addressMap.get(email.from.address)
      : undefined;
    if (!fromAddress) {
      console.log(
        `Failed to find/upsert 'from' address (${email.from?.address}) for email snippet: "${email.bodySnippet}"`,
      );
      return;
    }
    const toAddresses = email.to
      .map((addr) => (addr.address ? addressMap.get(addr.address) : undefined))
      .filter((a): a is EmailAddressDb => !!a);
    const ccAddresses = email.cc
      .map((addr) => (addr.address ? addressMap.get(addr.address) : undefined))
      .filter((a): a is EmailAddressDb => !!a);
    const bccAddresses = email.bcc
      .map((addr) => (addr.address ? addressMap.get(addr.address) : undefined))
      .filter((a): a is EmailAddressDb => !!a);
    const replyToAddresses = email.replyTo
      .map((addr) => (addr.address ? addressMap.get(addr.address) : undefined))
      .filter((a): a is EmailAddressDb => !!a);

    // --- 2. Upsert Thread ---
    const threadValues = {
      id: email.threadId,
      subject: email.subject,
      accountId,
      lastMessageDate: new Date(email.sentAt),
      done: false,
      participantsIds: [
        ...new Set([
          fromAddress.id,
          ...toAddresses.map((a) => a.id),
          ...ccAddresses.map((a) => a.id),
          ...bccAddresses.map((a) => a.id),
        ]),
      ],
      // Set initial status based on the first email encountered for this thread
      draftStatus: emailLabelType === "draft",
      inboxStatus: emailLabelType === "inbox",
      sentStatus: emailLabelType === "sent",
    };

    const upsertedThread = await db
      .insert(schema.threads)
      .values(threadValues)
      .onConflictDoUpdate({
        target: schema.threads.id,
        set: {
          // Only update fields that should change if thread exists
          subject: threadValues.subject, // Keep subject potentially updated
          lastMessageDate: threadValues.lastMessageDate, // Always update last message date
          participantsIds: threadValues.participantsIds, // Update participants
          // Don't update accountId or initial status flags on conflict
          done: false, // Reset done status on new message? Review logic
        },
      })
      .returning(); // Return the inserted/updated thread

    const thread = upsertedThread[0];
    if (!thread) {
      console.error(`Failed to upsert thread ${email.threadId}`);
      return;
    }

    // --- 3. Upsert Email ---
    const emailValues = {
      id: email.id,
      threadId: thread.id,
      createdTime: new Date(email.createdTime),
      lastModifiedTime: new Date(), // Use DB default? Check schema
      sentAt: new Date(email.sentAt),
      receivedAt: new Date(email.receivedAt),
      internetMessageId: email.internetMessageId,
      subject: email.subject,
      sysLabels: email.sysLabels,
      keywords: email.keywords,
      sysClassifications: email.sysClassifications,
      sensitivity: email.sensitivity as Sensitivity, // Use imported enum type
      meetingMessageMethod:
        email.meetingMessageMethod as MeetingMessageMethod | null, // Use imported enum type
      fromId: fromAddress.id,
      hasAttachments: email.hasAttachments,
      internetHeaders: email.internetHeaders as any, // JSON type handling
      body: email.body,
      bodySnippet: email.bodySnippet,
      inReplyTo: email.inReplyTo,
      references: email.references,
      threadIndex: email.threadIndex,
      nativeProperties: email.nativeProperties as any, // JSON type handling
      folderId: email.folderId,
      omitted: email.omitted,
      emailLabel: emailLabelType,
    };

    await db
      .insert(schema.emails)
      .values(emailValues)
      .onConflictDoUpdate({
        target: schema.emails.id,
        set: {
          // Update most fields on conflict, except immutable ones like id, threadId, createdTime?
          lastModifiedTime: new Date(),
          sentAt: emailValues.sentAt,
          receivedAt: emailValues.receivedAt,
          internetMessageId: emailValues.internetMessageId,
          subject: emailValues.subject,
          sysLabels: emailValues.sysLabels,
          keywords: emailValues.keywords,
          sysClassifications: emailValues.sysClassifications,
          sensitivity: emailValues.sensitivity,
          meetingMessageMethod: emailValues.meetingMessageMethod,
          fromId: emailValues.fromId,
          hasAttachments: emailValues.hasAttachments,
          internetHeaders: emailValues.internetHeaders,
          body: emailValues.body,
          bodySnippet: emailValues.bodySnippet,
          inReplyTo: emailValues.inReplyTo,
          references: emailValues.references,
          threadIndex: emailValues.threadIndex,
          nativeProperties: emailValues.nativeProperties,
          folderId: emailValues.folderId,
          omitted: emailValues.omitted,
          emailLabel: emailValues.emailLabel,
        },
      });

    // --- Handle M2M Relations (To, Cc, Bcc, ReplyTo) ---
    // Strategy: Delete existing relations for this email, then insert new ones.

    // Delete existing relations
    await Promise.all([
      db
        .delete(schema.emailsToEmailAddressesTo)
        .where(eq(schema.emailsToEmailAddressesTo.emailId, email.id)),
      db
        .delete(schema.emailsToEmailAddressesCc)
        .where(eq(schema.emailsToEmailAddressesCc.emailId, email.id)),
      db
        .delete(schema.emailsToEmailAddressesBcc)
        .where(eq(schema.emailsToEmailAddressesBcc.emailId, email.id)),
      db
        .delete(schema.emailsToEmailAddressesReplyTo)
        .where(eq(schema.emailsToEmailAddressesReplyTo.emailId, email.id)),
    ]);

    // Prepare new relation data
    const toInsertData = toAddresses.map((addr) => ({
      emailId: email.id,
      emailAddressId: addr.id,
    }));
    const ccInsertData = ccAddresses.map((addr) => ({
      emailId: email.id,
      emailAddressId: addr.id,
    }));
    const bccInsertData = bccAddresses.map((addr) => ({
      emailId: email.id,
      emailAddressId: addr.id,
    }));
    const replyToInsertData = replyToAddresses.map((addr) => ({
      emailId: email.id,
      emailAddressId: addr.id,
    }));

    // Insert new relations (ignore if empty)
    const insertPromises = [];
    if (toInsertData.length > 0) {
      insertPromises.push(
        db.insert(schema.emailsToEmailAddressesTo).values(toInsertData),
      );
    }
    if (ccInsertData.length > 0) {
      insertPromises.push(
        db.insert(schema.emailsToEmailAddressesCc).values(ccInsertData),
      );
    }
    if (bccInsertData.length > 0) {
      insertPromises.push(
        db.insert(schema.emailsToEmailAddressesBcc).values(bccInsertData),
      );
    }
    if (replyToInsertData.length > 0) {
      insertPromises.push(
        db
          .insert(schema.emailsToEmailAddressesReplyTo)
          .values(replyToInsertData),
      );
    }
    await Promise.all(insertPromises);

    // --- Update Thread Status based on all emails in thread ---
    const threadEmails = await db
      .select({ emailLabel: schema.emails.emailLabel })
      .from(schema.emails)
      .where(eq(schema.emails.threadId, thread.id));
    // .orderBy(asc(schema.emails.receivedAt)); // Order might not be needed just for status check

    let threadFolderType: EmailLabel = "sent"; // Default if no inbox/draft
    for (const threadEmail of threadEmails) {
      if (threadEmail.emailLabel === "inbox") {
        threadFolderType = "inbox";
        break; // Inbox takes precedence
      } else if (threadEmail.emailLabel === "draft") {
        threadFolderType = "draft"; // Draft is lower precedence than inbox
      }
    }

    await db
      .update(schema.threads)
      .set({
        draftStatus: threadFolderType === "draft",
        inboxStatus: threadFolderType === "inbox",
        sentStatus: threadFolderType === "sent",
      })
      .where(eq(schema.threads.id, thread.id));

    // --- 4. Upsert Attachments (already refactored) ---
    for (const attachment of email.attachments) {
      await upsertAttachment(email.id, attachment);
    }
  } catch (error) {
    console.log(`Error upserting email index ${index}:`, error);
  }
}

async function upsertEmailAddress(
  address: EmailAddressType,
  accountId: string,
) {
  try {
    const values = {
      address: address?.address ?? "",
      name: address?.name,
      raw: address?.raw,
      accountId,
    };

    // Attempt to insert, do nothing if conflict on unique index (accountId, address)
    await db
      .insert(schema.emailAddresses)
      .values(values)
      .onConflictDoNothing({
        target: [
          schema.emailAddresses.accountId,
          schema.emailAddresses.address,
        ],
      });

    // Select the (potentially) newly inserted or existing address
    const result = await db
      .select()
      .from(schema.emailAddresses)
      .where(
        and(
          eq(schema.emailAddresses.accountId, accountId),
          eq(schema.emailAddresses.address, values.address),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  } catch (error) {
    console.log("Failed to upsert Email Address", error);
    return null;
  }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
  try {
    const values = {
      id: attachment.id,
      emailId,
      name: attachment.name,
      mimeType: attachment.mimeType,
      size: attachment.size,
      inline: attachment.inline,
      contentId: attachment.contentId,
      content: attachment.content,
      contentLocation: attachment.contentLocation,
    };

    // Insert or update the attachment based on its ID
    await db
      .insert(schema.emailAttachments)
      .values(values)
      .onConflictDoUpdate({
        target: schema.emailAttachments.id,
        set: {
          // Only update fields that might change, assuming ID/emailId don't
          name: values.name,
          mimeType: values.mimeType,
          size: values.size,
          inline: values.inline,
          contentId: values.contentId,
          content: values.content,
          contentLocation: values.contentLocation,
        },
      });
  } catch (error) {
    console.log(`Failed to upsert attachment for email ${emailId}: ${error}`);
  }
}
