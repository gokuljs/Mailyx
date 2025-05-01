import { EmailAddress, emailAddressSchema } from "./../../../lib/types";
import { Select } from "@/components/ui/select";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { db } from "@/server/db";
import { threadId } from "worker_threads";
import { Account } from "@/lib/accounts";
import { OramaClient } from "@/lib/orama";
import { catchFirst } from "@/lib/redisCatchFetch";

export const authorizeAccountAccess = async (
  accountId: string,
  userId: string,
) => {
  const account = await db.account.findFirst({
    where: {
      id: accountId,
      userId,
    },
    select: {
      id: true,
      emailAddress: true,
      accessToken: true,
      name: true,
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
        return ctx.db.account.findMany({
          where: {
            userId,
          },
          select: {
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
        input?.accountId,
        ctx?.auth?.userId,
      );

      let filter: any = {};
      if (input?.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input?.tab === "draft") {
        filter.draftStatus = true;
      } else {
        filter.sentStatus = true;
      }
      return ctx.db.thread?.count({
        where: {
          accountId: account.id,
          ...filter,
        },
      });
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
      const acc = new Account(account?.accessToken);
      acc.syncEmails().catch(console.error);
      const threads = await catchFirst(
        key,
        async () => {
          const account = await authorizeAccountAccess(input.accountId, userId);
          let filter: any = {};
          if (input.tab === "inbox") {
            filter.inboxStatus = true;
          } else if (input.tab === "draft") {
            filter.draftStatus = true;
          } else {
            filter.sentStatus = true;
          }
          filter.done = {
            equals: input.done,
          };

          return ctx.db.thread.findMany({
            where: {
              accountId: account.id,
              ...filter,
            },
            include: {
              email: {
                orderBy: {
                  sentAt: "asc",
                },
                select: {
                  from: true,
                  body: true,
                  bodySnippet: true,
                  emailLabel: true,
                  subject: true,
                  sysLabels: true,
                  id: true,
                  sentAt: true,
                },
              },
            },
            take: 50,
            orderBy: {
              lastMessageDate: "desc",
            },
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
      return await ctx.db.emailAddress.findMany({
        where: {
          accountId: input?.accountId,
        },
        select: {
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
      const thread = await ctx.db.thread.findFirst({
        where: {
          id: input?.threadId,
        },
        include: {
          email: {
            orderBy: {
              sentAt: "asc",
            },
            select: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              sentAt: true,
              subject: true,
              internetMessageId: true,
            },
          },
        },
      });
      console.log(JSON.stringify(thread, null, 2), account.emailAddress);
      if (!thread || thread.email.length === 0)
        throw new Error("Email not found");
      const messages = thread.email;
      const lastExternal = messages
        .slice()
        .reverse()
        .find((e) => e.from.address.trim() !== account.emailAddress.trim());
      const lastSent = messages
        .slice()
        .reverse()
        .find((e) => e.from.address.trim() === account.emailAddress.trim());
      const email = lastExternal ?? lastSent;
      if (!email) {
        throw new Error("No emails in this thread to reply to");
      }
      let toRecipients: typeof email.to = [];
      let ccRecipients: typeof email.cc = [];
      if (lastExternal) {
        // incoming: reply TO the sender, and CC anyone else you already had in the thread
        toRecipients = [
          lastExternal.from,
          ...lastExternal.to.filter(
            (r) => r.address !== account.emailAddress.trim(),
          ),
        ];
        ccRecipients = lastExternal.cc.filter(
          (r) => r.address !== account.emailAddress.trim(),
        );
      } else {
        // no incoming: “reply” to your own last sent → just re‑use its recipients
        toRecipients = lastSent!.to.filter(
          (r) => r.address !== account.emailAddress.trim(),
        );
        ccRecipients = lastSent!.cc.filter(
          (r) => r.address !== account.emailAddress.trim(),
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
      const orama = new OramaClient(account?.id);
      await orama.init();
      const result = await orama.search({
        term: input.query,
      });
      return result;
    }),
});
