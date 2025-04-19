import { EmailAddress, emailAddressSchema } from "./../../../lib/types";
import { Select } from "@/components/ui/select";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { db } from "@/server/db";
import { threadId } from "worker_threads";
import { Account } from "@/lib/accounts";

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
    return ctx.db.account.findMany({
      where: {
        userId: ctx?.auth?.userId,
      },
      select: {
        id: true,
        emailAddress: true,
        name: true,
      },
    });
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
      let filter: any = {};
      if (input?.tab === "inbox") {
        filter.inboxStatus = true;
      } else if (input?.tab === "draft") {
        filter.draftStatus = true;
      } else {
        filter.sentStatus = true;
      }
      filter.done = {
        equals: input?.done,
      };
      return await ctx.db.thread.findMany({
        where: filter,
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
        take: 15,
        orderBy: {
          lastMessageDate: "desc",
        },
      });
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
      if (!thread || thread.email.length === 0)
        throw new Error("Email not found");
      const lastExternalEmail = thread.email
        .reverse()
        .find((email) => email.from.address !== account.emailAddress);
      if (!lastExternalEmail)
        throw new Error("No external email founds in threads");
      return {
        subject: lastExternalEmail?.subject,
        to: [
          lastExternalEmail?.from,
          ...lastExternalEmail?.to?.filter(
            (item) => item?.address !== account?.emailAddress,
          ),
        ],
        cc: lastExternalEmail?.cc.filter(
          (item) => item?.address !== account?.emailAddress,
        ),
        from: {
          name: account?.name,
          address: account?.emailAddress,
        },
        id: lastExternalEmail.internetMessageId,
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
});
