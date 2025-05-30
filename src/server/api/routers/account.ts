import { emailAddressSchema } from "./../../../lib/types";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import * as schema from "@/drizzle/schema";
import {
  eq,
  and,
  count,
  type SQL,
  desc,
  asc,
  inArray,
  or,
  sql,
} from "drizzle-orm";

import { Account } from "@/lib/accounts";
import { OramaClient } from "@/lib/orama";
import { catchFirst } from "@/lib/redisCatchFetch";
import { FREE_ACCOUNTS_PER_USER, FREE_CREDITS_PER_DAY } from "@/lib/Constants";
import { db } from "@/drizzle/db";
import redisHandler from "@/lib/redis";

export const authorizeAccountAccess = async (
  accountId: string,
  userId: string,
) => {
  const account = await db.query.account.findFirst({
    where: (fields, { eq, and }) =>
      and(eq(fields.id, accountId), eq(fields.userId, userId)),
    columns: {
      id: true,
      emailAddress: true,
      accessToken: true,
      name: true,
      nextDeltaToken: true,
    },
  });
  if (!account) throw new Error("unAuthorized Access ");
  return account;
};

export async function invalidatedUserThreadCache(
  accountId: string,
  userId: String,
) {
  console.log("Invalidating Thread Cache");
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

export const accountRouter = createTRPCRouter({
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx?.auth?.userId;
    const key = `accounts:user:${userId}`;

    // Check subscription status
    const subscription = await db.query.subscription.findFirst({
      where: (fields, { eq }) => eq(fields.userId, userId),
      columns: {
        status: true,
        endedAt: true,
      },
    });

    // Check if user is a premium subscriber
    const currentDate = new Date();
    const endDate = subscription?.endedAt
      ? new Date(subscription.endedAt)
      : null;
    const isPremium =
      subscription?.status === "ACTIVE" && (!endDate || currentDate < endDate);

    const accounts = await catchFirst(
      key,
      async () => {
        let query = db.query.account.findMany({
          where: (fields, { eq }) => eq(fields.userId, userId),
          columns: {
            id: true,
            emailAddress: true,
            name: true,
          },
        });

        const accounts = await query;

        // If not premium, return just the first account (or empty array if no accounts)
        return isPremium ? accounts : accounts.slice(0, FREE_ACCOUNTS_PER_USER);
      },
      300,
    );
    return accounts;
  }),

  deleteAccount: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      console.log(`Deleting account: ${account.id} (${account.emailAddress})`);

      try {
        // Start a transaction to ensure atomicity
        await db.transaction(async (tx) => {
          // First delete data from all dependent tables
          // Since EmailEmbedding has cascade delete, we don't need to handle it explicitly

          // Get all threads for this account
          const threads = await tx
            .select({ id: schema.thread.id })
            .from(schema.thread)
            .where(eq(schema.thread.accountId, account.id));

          const threadIds = threads.map((t) => t.id);

          if (threadIds.length > 0) {
            // Get all emails for these threads
            const emails = await tx
              .select({ id: schema.email.id })
              .from(schema.email)
              .where(inArray(schema.email.threadId, threadIds));

            const emailIds = emails.map((e) => e.id);

            if (emailIds.length > 0) {
              // Delete email relationships (to, cc, bcc, etc.)
              await tx
                .delete(schema.toEmails)
                .where(inArray(schema.toEmails.a, emailIds));

              await tx
                .delete(schema.ccEmails)
                .where(inArray(schema.ccEmails.a, emailIds));

              await tx
                .delete(schema.bccEmails)
                .where(inArray(schema.bccEmails.a, emailIds));

              await tx
                .delete(schema.replyToEmails)
                .where(inArray(schema.replyToEmails.a, emailIds));

              // Delete attachments
              await tx
                .delete(schema.emailAttachment)
                .where(inArray(schema.emailAttachment.emailId, emailIds));

              // Delete emails
              await tx
                .delete(schema.email)
                .where(inArray(schema.email.id, emailIds));
            }

            // Delete threads
            await tx
              .delete(schema.thread)
              .where(inArray(schema.thread.id, threadIds));
          }

          // Delete email addresses
          await tx
            .delete(schema.emailAddress)
            .where(eq(schema.emailAddress.accountId, account.id));

          // Finally delete the account
          await tx
            .delete(schema.account)
            .where(eq(schema.account.id, account.id));
        });

        // Clear cached data
        const userId = ctx.auth.userId;
        const key = `accounts:user:${userId}`;

        // Clear the Redis cache
        try {
          await redisHandler.del(key);
        } catch (error) {
          console.warn(`Failed to clear cache for key: ${key}`, error);
        }

        return { success: true, message: "Account deleted successfully" };
      } catch (error) {
        console.error("Error deleting account:", error);
        throw new Error("Failed to delete account and related data");
      }
    }),

  getNumThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      const conditions: SQL[] = [eq(schema.thread.accountId, account.id)];

      if (input.tab === "inbox") {
        conditions.push(eq(schema.thread.inboxStatus, true));
      } else if (input.tab === "draft") {
        conditions.push(eq(schema.thread.draftStatus, true));
      } else {
        conditions.push(eq(schema.thread.sentStatus, true));
      }

      const result = await ctx.db
        .select({ value: count() })
        .from(schema.thread)
        .where(and(...conditions));

      return result[0]?.value ?? 0;
    }),
  getThreads: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input?.accountId,
        ctx?.auth?.userId,
      );
      const userId = ctx?.auth?.userId;
      const key = `threads:user:${userId}:account:${input.accountId}:tab:${input.tab}:done:${input.done ?? "all"}`;
      if (account?.nextDeltaToken) {
        const acc = new Account(account?.accessToken);
        acc.syncEmails().catch(console.error);
      }

      const threads = await catchFirst(
        key,
        async () => {
          const account = await authorizeAccountAccess(input.accountId, userId);

          // Build conditions for filtering
          const conditions: SQL[] = [eq(schema.thread.accountId, account.id)];

          if (input.tab === "inbox") {
            conditions.push(eq(schema.thread.inboxStatus, true));
          } else if (input.tab === "draft") {
            conditions.push(eq(schema.thread.draftStatus, true));
          } else {
            conditions.push(eq(schema.thread.sentStatus, true));
          }

          if (input.done !== undefined) {
            conditions.push(eq(schema.thread.done, input.done));
          }

          // Fetch threads
          console.time("DB:getThreads");
          const threads = await db
            .select()
            .from(schema.thread)
            .where(and(...conditions))
            .orderBy(desc(schema.thread.lastMessageDate))
            .limit(500);

          const threadIds = threads.map((t) => t.id);
          if (threadIds.length === 0) return [];

          // Fetch email previews for those threads (excluding full body)
          const emails = await db
            .select({
              threadId: schema.email.threadId,
              Email: {
                id: schema.email.id,
                subject: schema.email.subject,
                sentAt: schema.email.sentAt,
                emailLabel: schema.email.emailLabel,
                sysLabels: schema.email.sysLabels,
                bodySnippet: schema.email.bodySnippet,
              },
              EmailAddress: {
                name: schema.emailAddress.name,
                address: schema.emailAddress.address,
              },
            })
            .from(schema.email)
            .where(inArray(schema.email.threadId, threadIds))
            .orderBy(asc(schema.email.sentAt))
            .leftJoin(
              schema.emailAddress,
              eq(schema.email.fromId, schema.emailAddress.id),
            );

          // Group emails by threadId
          const groupedEmails = new Map<string, any[]>();
          for (const row of emails) {
            const formatted = {
              from: row.EmailAddress,
              bodySnippet: row.Email.bodySnippet ?? "",
              emailLabel: row.Email.emailLabel,
              subject: row.Email.subject,
              sysLabels: row.Email.sysLabels,
              id: row.Email.id,
              sentAt: row.Email.sentAt,
            };
            if (!groupedEmails.has(row.threadId)) {
              groupedEmails.set(row.threadId, []);
            }
            groupedEmails.get(row.threadId)!.push(formatted);
          }

          // Map threads to include grouped emails
          const threadResults = threads.map((thread) => ({
            ...thread,
            email: groupedEmails.get(thread.id) ?? [],
          }));

          console.timeEnd("DB:getThreads");
          return threadResults;
        },
        100,
      );
      return threads;
    }),

  getThreadWithEmails: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      console.log("getThreadWithEmails", input);
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId,
      );

      if (!input.threadId) {
        throw new Error("Thread ID is required");
      }
      if (!input.accountId) {
        throw new Error("Account ID is required");
      }

      // Fetch thread
      const thread = await db
        .select()
        .from(schema.thread)
        .where(
          and(
            eq(schema.thread.id, input.threadId),
            eq(schema.thread.accountId, account.id),
          ),
        )
        .limit(1);

      if (thread.length === 0) {
        throw new Error("Thread not found");
      }

      // Fetch emails with complete bodies
      const emails = await db
        .select({
          Email: {
            id: schema.email.id,
            subject: schema.email.subject,
            sentAt: schema.email.sentAt,
            emailLabel: schema.email.emailLabel,
            sysLabels: schema.email.sysLabels,
            body: schema.email.body,
            bodySnippet: schema.email.bodySnippet,
          },
          EmailAddress: {
            name: schema.emailAddress.name,
            address: schema.emailAddress.address,
          },
        })
        .from(schema.email)
        .where(eq(schema.email.threadId, input.threadId))
        .orderBy(asc(schema.email.sentAt))
        .leftJoin(
          schema.emailAddress,
          eq(schema.email.fromId, schema.emailAddress.id),
        );

      const formattedEmails = emails.map((row) => ({
        from: row.EmailAddress,
        body: row.Email.body ?? "",
        bodySnippet: row.Email.bodySnippet ?? "",
        emailLabel: row.Email.emailLabel,
        subject: row.Email.subject,
        sysLabels: row.Email.sysLabels,
        id: row.Email.id,
        sentAt: row.Email.sentAt,
      }));

      return {
        ...thread[0],
        email: formattedEmails,
      };
    }),

  getSuggestions: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input?.accountId,
        ctx?.auth?.userId,
      );
      return await ctx.db.query.emailAddress.findMany({
        where: (fields, { eq }) => eq(fields.accountId, input?.accountId),
        columns: {
          address: true,
          name: true,
        },
      });
    }),
  getReplyDetails: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input?.accountId,
        ctx?.auth?.userId,
      );
      console.log("getReplyDetails", input);
      // Fetch the thread and emails separately as a workaround
      const thread = await db
        .select()
        .from(schema.thread)
        .where(eq(schema.thread.id, input?.threadId))
        .limit(1);

      if (!thread || thread.length === 0) {
        throw new Error("Thread not found");
      }

      // Fetch emails for this thread
      const emailsData = await db
        .select({
          email: schema.email,
          from: schema.emailAddress,
        })
        .from(schema.email)
        .where(eq(schema.email.threadId, input?.threadId))
        .orderBy(asc(schema.email.sentAt))
        .leftJoin(
          schema.emailAddress,
          eq(schema.email.fromId, schema.emailAddress.id),
        );

      if (!emailsData || emailsData.length === 0) {
        throw new Error("Email not found");
      }

      // Get to/cc/bcc recipients for each email
      const messages = [];

      for (const emailData of emailsData) {
        // Get 'to' recipients
        const toRecipients = await db
          .select({
            emailAddress: schema.emailAddress,
          })
          .from(schema.toEmails)
          .where(eq(schema.toEmails.a, emailData.email.id))
          .leftJoin(
            schema.emailAddress,
            eq(schema.toEmails.b, schema.emailAddress.id),
          );

        // Get 'cc' recipients
        const ccRecipients = await db
          .select({
            emailAddress: schema.emailAddress,
          })
          .from(schema.ccEmails)
          .where(eq(schema.ccEmails.a, emailData.email.id))
          .leftJoin(
            schema.emailAddress,
            eq(schema.ccEmails.b, schema.emailAddress.id),
          );

        // Get 'bcc' recipients
        const bccRecipients = await db
          .select({
            emailAddress: schema.emailAddress,
          })
          .from(schema.bccEmails)
          .where(eq(schema.bccEmails.a, emailData.email.id))
          .leftJoin(
            schema.emailAddress,
            eq(schema.bccEmails.b, schema.emailAddress.id),
          );

        messages.push({
          from: emailData.from,
          to: toRecipients.map((r) => r.emailAddress),
          cc: ccRecipients.map((r) => r.emailAddress),
          bcc: bccRecipients.map((r) => r.emailAddress),
          sentAt: emailData.email.sentAt,
          subject: emailData.email.subject,
          internetMessageId: emailData.email.internetMessageId,
        });
      }

      // Handle potential null references by adding null checks
      const lastExternal = messages
        .slice()
        .reverse()
        .find((e) => e.from?.address?.trim() !== account.emailAddress.trim());
      const lastSent = messages
        .slice()
        .reverse()
        .find((e) => e.from?.address?.trim() === account.emailAddress.trim());
      const email = lastExternal ?? lastSent;

      if (!email) {
        throw new Error("No emails in this thread to reply to");
      }

      let toRecipients = [];
      let ccRecipients = [];
      if (lastExternal) {
        // incoming: reply TO the sender, and CC anyone else you already had in the thread
        toRecipients = [
          lastExternal.from,
          ...lastExternal.to.filter(
            (r) => r?.address !== account.emailAddress.trim(),
          ),
        ];
        ccRecipients = lastExternal.cc.filter(
          (r) => r?.address !== account.emailAddress.trim(),
        );
      } else {
        // no incoming: "reply" to your own last sent → just re‑use its recipients
        toRecipients = lastSent!.to.filter(
          (r) => r?.address !== account.emailAddress.trim(),
        );
        ccRecipients = lastSent!.cc.filter(
          (r) => r?.address !== account.emailAddress.trim(),
        );
      }

      let subject = email.subject || "";
      if (!/^Re:/i.test(subject)) {
        subject = `Re: ${subject}`;
      }

      return {
        subject: subject,
        to: toRecipients,
        cc: ccRecipients,
        from: {
          name: account?.name,
          address: account?.emailAddress,
        },
        id: email.internetMessageId,
      };
    }),
  sendEmail: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        body: z.string(),
        subject: z.string(),
        from: emailAddressSchema,
        cc: z.array(emailAddressSchema).optional(),
        bcc: z.array(emailAddressSchema).optional(),
        to: z.array(emailAddressSchema),
        replyTo: emailAddressSchema,
        threadId: z.string().optional(),
        inReplyTo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input?.accountId,
        ctx?.auth?.userId,
      );
      const acc = new Account(account?.accessToken);
      await acc.sendEMail({
        body: input?.body,
        subject: input?.subject,
        from: input?.from,
        to: input?.to,
        cc: input?.cc,
        bcc: input?.bcc,
        replyTo: input?.replyTo,
        inReplyTo: input?.inReplyTo,
        threadId: input?.threadId,
      });
      invalidatedUserThreadCache(account.id, ctx.auth.userId);
    }),

  searchEmails: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
        query: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input?.accountId,
        ctx?.auth?.userId,
      );

      console.log("Searching with PostgreSQL");

      // Extract search terms and prepare for search
      const searchQuery = input.query.trim();

      if (!searchQuery) {
        return [];
      }

      try {
        // Find all threads with the matching account ID first
        const threadsWithMatchingAccount = await db
          .select()
          .from(schema.thread)
          .where(eq(schema.thread.accountId, account.id));

        if (threadsWithMatchingAccount.length === 0) {
          return [];
        }

        const threadIds = threadsWithMatchingAccount.map((t) => t.id);

        // Convert the search query into OR-ed terms, wrapped in parentheses
        const processedQuery = `(${searchQuery.trim().split(/\s+/).join(" OR ")})`;

        const matchingEmails = await db
          .select({
            threadId: schema.email.threadId,
            id: schema.email.id,
            rank: sql`ts_rank(
      setweight(to_tsvector('english', ${schema.email.subject}), 'A') || 
      setweight(to_tsvector('english', COALESCE(${schema.email.body}, '')), 'B') ||
      setweight(to_tsvector('english', COALESCE(${schema.email.bodySnippet}, '')), 'C'),
      websearch_to_tsquery('english', ${processedQuery})
    )`.as("rank"),
          })
          .from(schema.email)
          .where(
            and(
              inArray(schema.email.threadId, threadIds),
              sql`
        setweight(to_tsvector('english', ${schema.email.subject}), 'A') || 
        setweight(to_tsvector('english', COALESCE(${schema.email.body}, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(${schema.email.bodySnippet}, '')), 'C')
        @@ websearch_to_tsquery('english', ${processedQuery})
      `,
            ),
          )
          .orderBy(sql`rank DESC`)
          .groupBy(schema.email.threadId, schema.email.id);

        if (matchingEmails.length === 0) {
          return [];
        }

        const matchingThreadIds = matchingEmails.map((email) => email.threadId);

        // Get threads based on the matching email IDs
        const threads = await db
          .select()
          .from(schema.thread)
          .where(
            and(
              eq(schema.thread.accountId, account.id),
              inArray(schema.thread.id, matchingThreadIds),
            ),
          )
          .limit(500);

        const filteredThreadIds = threads.map((t) => t.id);
        if (filteredThreadIds.length === 0) return [];

        // Fetch email previews for those threads (excluding full body)
        const emails = await db
          .select({
            threadId: schema.email.threadId,
            Email: {
              id: schema.email.id,
              subject: schema.email.subject,
              sentAt: schema.email.sentAt,
              emailLabel: schema.email.emailLabel,
              sysLabels: schema.email.sysLabels,
              bodySnippet: schema.email.bodySnippet,
            },
            EmailAddress: {
              name: schema.emailAddress.name,
              address: schema.emailAddress.address,
            },
          })
          .from(schema.email)
          .where(inArray(schema.email.threadId, filteredThreadIds))
          .orderBy(asc(schema.email.sentAt))
          .leftJoin(
            schema.emailAddress,
            eq(schema.email.fromId, schema.emailAddress.id),
          );

        // Group emails by threadId
        const groupedEmails = new Map<string, any[]>();
        for (const row of emails) {
          const formatted = {
            from: row.EmailAddress,
            bodySnippet: row.Email.bodySnippet ?? "",
            emailLabel: row.Email.emailLabel,
            subject: row.Email.subject,
            sysLabels: row.Email.sysLabels,
            id: row.Email.id,
            sentAt: row.Email.sentAt,
          };
          if (!groupedEmails.has(row.threadId)) {
            groupedEmails.set(row.threadId, []);
          }
          groupedEmails.get(row.threadId)!.push(formatted);
        }
        console.log("groupedEmails", threads);
        // Map threads to include grouped emails
        return threads.map((thread) => ({
          ...thread,
          email: groupedEmails.get(thread.id) ?? [],
        }));
      } catch (error) {
        console.error("Error searching emails:", error);
        throw new Error("Failed to search emails");
      }
    }),
  chatBotInteraction: privateProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx?.auth?.userId;
      if (!userId) throw new Error("Unauthorized");
      const today = new Date().toDateString();

      const result = await db
        .select({ count: schema.chatBotInteraction.count })
        .from(schema.chatBotInteraction)
        .where(
          and(
            eq(schema.chatBotInteraction.userId, userId),
            eq(schema.chatBotInteraction.day, today),
          ),
        );

      const remainingCredits = FREE_CREDITS_PER_DAY - (result[0]?.count ?? 0);
      return remainingCredits;
    }),
});
