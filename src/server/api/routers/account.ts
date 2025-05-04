import { EmailAddress, emailAddressSchema } from "./../../../lib/types";
import { Select } from "@/components/ui/select";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { db } from "@/server/db";
import { threadId } from "worker_threads";
import { Account } from "@/lib/accounts";
import { OramaClient } from "@/lib/orama";
import { catchFirst } from "@/lib/redisCatchFetch";
import * as schema from "@/server/db/schema";
import { eq, and, count, asc } from "drizzle-orm";

// Helper type for authorized account data
type AuthorizedAccount = Pick<
  typeof schema.accounts.$inferSelect,
  "id" | "emailAddress" | "accessToken" | "name"
>;

export const authorizeAccountAccess = async (
  accountId: string,
  userId: string,
): Promise<AuthorizedAccount> => {
  const result = await db
    .select({
      id: schema.accounts.id,
      emailAddress: schema.accounts.emailAddress,
      accessToken: schema.accounts.accessToken,
      name: schema.accounts.name,
    })
    .from(schema.accounts)
    .where(
      and(
        eq(schema.accounts.id, accountId),
        eq(schema.accounts.userId, userId),
      ),
    )
    .limit(1);

  const account = result[0];
  if (!account) throw new Error("unAuthorized Access ");
  return account;
};

export const accountRouter = createTRPCRouter({
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx?.auth?.userId;
    if (!userId) throw new Error("User not authenticated");

    const key = `accounts:user:${userId}`;
    const accounts = await catchFirst(
      key,
      async () => {
        return ctx.db
          .select({
            id: schema.accounts.id,
            emailAddress: schema.accounts.emailAddress,
            name: schema.accounts.name,
          })
          .from(schema.accounts)
          .where(eq(schema.accounts.userId, userId));
      },
      5000,
    );
    return accounts;
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
        input?.accountId,
        ctx?.auth?.userId,
      );
      if (!account) throw new Error("Account not found or not authorized.");

      let filter: any = { accountId: account.id };
      if (input?.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input?.tab === "draft") {
        filter.draftStatus = true;
      } else if (input?.tab === "sent") {
        filter.sentStatus = true;
      } else {
        // Handle unknown tab? Maybe throw error or return 0?
        throw new Error(`Invalid tab: ${input.tab}`);
      }

      const result = await ctx.db
        .select({ value: count() })
        .from(schema.threads)
        .where(
          and(
            ...Object.entries(filter).map(([key, value]) => {
              const column =
                schema.threads[key as keyof typeof schema.threads.$inferSelect];
              return eq(column, value as any);
            }),
          ),
        );

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
      if (!account) throw new Error("Account not found or not authorized.");
      const userId = ctx?.auth?.userId;
      const key = `threads:user:${userId}:account:${input.accountId}:tab:${input.tab}:done:${input.done ?? "all"}`;

      // Trigger sync in background, don't await
      const acc = new Account(account?.accessToken);
      acc.syncEmails().catch(console.error);

      const threads = await catchFirst(
        key,
        async () => {
          const account = await authorizeAccountAccess(
            input.accountId,
            userId!,
          );
          let filter: any = { accountId: account.id }; // Start with accountId

          // Add status filter based on tab
          if (input.tab === "inbox") {
            filter.inboxStatus = true;
          } else if (input.tab === "draft") {
            filter.draftStatus = true;
          } else if (input.tab === "sent") {
            filter.sentStatus = true;
          } else {
            throw new Error(`Invalid tab: ${input.tab}`);
          }

          // Add done filter if provided
          if (input.done !== undefined) {
            filter.done = input.done;
          }

          // Build dynamic where clauses
          const whereClauses = Object.entries(filter).map(([key, value]) =>
            eq(
              schema.threads[key as keyof typeof schema.threads.$inferSelect],
              value as any,
            ),
          );

          // Use Drizzle relational query
          return ctx.db.query.threads.findMany({
            where: and(...whereClauses),
            with: {
              emails: {
                // Drizzle's with syntax for relations
                orderBy: (emails, { asc }) => [asc(emails.sentAt)],
                columns: {
                  // Select specific email columns
                  body: true,
                  bodySnippet: true,
                  emailLabel: true,
                  subject: true,
                  sysLabels: true,
                  id: true,
                  sentAt: true,
                },
                with: {
                  // Include the 'from' relation for emails
                  from: true, // Select all columns from the related emailAddress
                },
              },
            },
            limit: 50,
            orderBy: (threads, { desc }) => [desc(threads.lastMessageDate)],
          });
        },
        5000,
      );
      return threads;
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
      if (!account) throw new Error("Account not found or not authorized.");

      return await ctx.db
        .select({
          address: schema.emailAddresses.address,
          name: schema.emailAddresses.name,
        })
        .from(schema.emailAddresses)
        .where(eq(schema.emailAddresses.accountId, input.accountId));
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
      if (!account) throw new Error("Account not found or not authorized.");

      // Use Drizzle relational query to find the thread and include emails with relations
      const thread = await ctx.db.query.threads.findFirst({
        where: eq(schema.threads.id, input.threadId),
        with: {
          emails: {
            orderBy: (emails, { asc }) => [asc(emails.sentAt)],
            with: {
              // Include relations needed for recipient logic
              from: true,
              to: { with: { emailAddress: true } }, // Include junction table AND the target emailAddress
              cc: { with: { emailAddress: true } }, // Include junction table AND the target emailAddress
              bcc: { with: { emailAddress: true } }, // Include junction table AND the target emailAddress
            },
            // Select columns needed
            columns: {
              sentAt: true,
              subject: true,
              internetMessageId: true,
              // fromId is included via the 'from' relation
            },
          },
        },
      });

      if (!thread || !thread.emails || thread.emails.length === 0) {
        throw new Error("Email thread not found or has no emails");
      }

      const messages = thread.emails;

      // Define types for clarity in recipient logic
      type EmailWithRecipients = (typeof messages)[number];
      type EmailAddress = typeof schema.emailAddresses.$inferSelect;

      const lastExternal = messages
        .slice()
        .reverse()
        .find(
          (e: EmailWithRecipients) =>
            e.from?.address?.trim() !== account.emailAddress.trim(),
        );
      const lastSent = messages
        .slice()
        .reverse()
        .find(
          (e: EmailWithRecipients) =>
            e.from?.address?.trim() === account.emailAddress.trim(),
        );

      const email = lastExternal ?? lastSent;
      if (!email || !email.from) {
        // Check email and email.from exists
        throw new Error("No valid email found in this thread to reply to");
      }

      // Extract recipients, handling the structure returned by Drizzle relational queries
      // Drizzle includes the junction table entry AND the related entity
      const getAddresses = (
        rel: { emailAddress: EmailAddress }[] | undefined,
      ): EmailAddress[] => {
        return (
          rel
            ?.map((item) => item.emailAddress)
            .filter((a): a is EmailAddress => !!a) ?? []
        );
      };

      let toRecipients: EmailAddress[] = [];
      let ccRecipients: EmailAddress[] = [];

      if (lastExternal && lastExternal.from) {
        // Ensure lastExternal and its from exist
        // incoming: reply TO the sender, and CC anyone else you already had in the thread
        toRecipients = [
          lastExternal.from,
          ...getAddresses(lastExternal.to).filter(
            (r) => r.address !== account.emailAddress.trim(),
          ),
        ];
        ccRecipients = getAddresses(lastExternal.cc).filter(
          (r) => r.address !== account.emailAddress.trim(),
        );
      } else if (lastSent) {
        // Only proceed if lastSent is defined
        // no incoming: "reply" to your own last sent → just re‑use its recipients
        toRecipients = getAddresses(lastSent.to).filter(
          (r) => r.address !== account.emailAddress.trim(),
        );
        ccRecipients = getAddresses(lastSent.cc).filter(
          (r) => r.address !== account.emailAddress.trim(),
        );
      }

      let subject = email.subject || "";
      if (!/^Re:/i.test(subject)) {
        subject = `Re: ${subject}`;
      }

      return {
        subject: subject,
        // Map EmailAddress objects back to the expected format if necessary
        // Assuming the EmailAddressType is compatible or mapping is needed
        to: toRecipients,
        cc: ccRecipients,
        from: {
          name: account?.name,
          address: account?.emailAddress,
        },
        // inReplyTo and references would typically come from the chosen 'email'
        inReplyTo: email.internetMessageId,
        references: email.internetMessageId, // Simplification, might need more complex logic
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
      const orama = new OramaClient(account?.id);
      await orama.init();
      const result = await orama.search({
        term: input.query,
      });
      return result;
    }),
});
