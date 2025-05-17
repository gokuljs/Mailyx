import { emailAddressSchema } from "./../../../lib/types";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import * as schema from "@/drizzle/schema";
import { eq, and, count, type SQL, desc, asc, inArray } from "drizzle-orm";

import { Account } from "@/lib/accounts";
import { OramaClient } from "@/lib/orama";
import { catchFirst } from "@/lib/redisCatchFetch";
import { FREE_CREDITS_PER_DAY } from "@/lib/Constants";
import { db } from "@/drizzle/db";

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

export const accountRouter = createTRPCRouter({
  getAccounts: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx?.auth?.userId;
    const key = `accounts:user:${userId}`;
    const accounts = await catchFirst(
      key,
      async () => {
        return ctx.db.query.account.findMany({
          where: (fields, { eq }) => eq(fields.userId, userId),
          columns: {
            id: true,
            emailAddress: true,
            name: true,
          },
        });
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
      console.log("Searching Db orama");
      const orama = new OramaClient(account?.id);
      await orama.init();
      const result = await orama.search({
        term: input.query,
      });
      return result;
    }),
  chatBotInteraction: privateProcedure
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
