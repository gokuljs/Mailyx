import { z } from "zod";
import nodemailer from "nodemailer";
import { createTRPCRouter, privateProcedure } from "../trpc";
import * as schema from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { error } from "console";

export const subscriptionRouter = createTRPCRouter({
  getSubscriptionInfo: privateProcedure.query(async ({ ctx, input }) => {
    try {
      const userId = ctx?.auth?.userId;
      if (!userId) {
        throw new Error("User not found");
      }

      // Use Drizzle select
      const result = await ctx.db
        .select({
          endedAt: schema.subscriptions.endedAt,
          userId: schema.subscriptions.userId,
          status: schema.subscriptions.status,
          paddleSubscriptionId: schema.subscriptions.paddleSubscriptionId,
          customerID: schema.subscriptions.customerID,
          addressId: schema.subscriptions.addressId,
          businessId: schema.subscriptions.businessId,
          planId: schema.subscriptions.planId,
        })
        .from(schema.subscriptions)
        .where(eq(schema.subscriptions.userId, userId))
        .limit(1);

      const subscription = result[0]; // Drizzle returns array, take first element

      return subscription;
    } catch (e) {
      console.log(e);
    }
  }),
});
