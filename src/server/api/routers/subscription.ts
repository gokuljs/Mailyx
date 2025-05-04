import { z } from "zod";
import nodemailer from "nodemailer";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { error } from "console";

export const subscriptionRouter = createTRPCRouter({
  getSubscriptionInfo: privateProcedure.query(async ({ ctx, input }) => {
    try {
      const userId = ctx?.auth?.userId;
      if (!userId) {
        throw new Error("User not found");
      }
      const subscription = await ctx.db.subscription.findUnique({
        where: { userId },
        select: {
          endedAt: true,
          userId: true,
          status: true,
          paddleSubscriptionId: true,
          customerID: true,
          addressId: true,
          businessId: true,
          planId: true,
        },
      });
      return subscription;
    } catch (e) {
      console.log(e);
    }
  }),
});
