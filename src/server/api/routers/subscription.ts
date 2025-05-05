import { z } from "zod";
import nodemailer from "nodemailer";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { error } from "console";
import axios from "axios";

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
  getCustomerPortalInfo: privateProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx?.auth?.userId;
      if (!userId) {
        throw new Error("User not found");
      }
      const subscription = await ctx.db.subscription.findUnique({
        where: { userId },
        select: {
          paddleSubscriptionId: true,
          customerID: true,
        },
      });
      if (!subscription?.customerID) {
        throw new Error("Customer ID not found");
      }

      const response = await axios.post(
        `https://sandbox-api.paddle.com/customers/${subscription.customerID}/portal-sessions`,
        {
          subscription_ids: [subscription.paddleSubscriptionId],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );
      const portalUrl = response.data?.data?.urls;
      if (!portalUrl) {
        throw new Error("Failed to retrieve portal URL from Paddle");
      }
      return { portalUrl };
    } catch (e) {
      console.log(JSON.stringify(e, null, 2));
      // Re-throw the error or handle it more specifically
      throw new Error("Failed to create customer portal session");
    }
  }),
});
