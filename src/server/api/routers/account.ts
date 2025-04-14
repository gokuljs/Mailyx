import { Select } from "@/components/ui/select";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { db } from "@/server/db";

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
});
