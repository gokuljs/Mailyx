import { z } from "zod";
import nodemailer from "nodemailer";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { error } from "console";
import axios from "axios";
import { plans } from "@/lib/Constants";
import * as schema from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";

export const subscriptionRouter = createTRPCRouter({
  getSubscriptionInfo: privateProcedure.query(async ({ ctx, input }) => {
    try {
      const userId = ctx?.auth?.userId;
      if (!userId) {
        throw new Error("User not found");
      }

      const subscriptions = await db
        .select({
          endedAt: schema.subscription.endedAt,
          userId: schema.subscription.userId,
          status: schema.subscription.status,
          paddleSubscriptionId: schema.subscription.paddleSubscriptionId,
          customerId: schema.subscription.customerId,
          addressId: schema.subscription.addressId,
          businessId: schema.subscription.businessId,
          planId: schema.subscription.planId,
        })
        .from(schema.subscription)
        .where(eq(schema.subscription.userId, userId))
        .limit(1);

      return subscriptions[0] || null;
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

      const subscriptions = await db
        .select({
          paddleSubscriptionId: schema.subscription.paddleSubscriptionId,
          customerId: schema.subscription.customerId,
        })
        .from(schema.subscription)
        .where(eq(schema.subscription.userId, userId))
        .limit(1);

      const subscription = subscriptions[0];

      if (!subscription?.customerId) {
        throw new Error("Customer ID not found");
      }

      const response = await axios.post(
        `${process.env.PADDLE_API_BASE_URL}/customers/${subscription.customerId}/portal-sessions`,
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
  getSubscriptionPlans: privateProcedure.query(async ({ ctx }) => {
    try {
      const subscriptions = await db
        .select({
          paddleSubscriptionId: schema.subscription.paddleSubscriptionId,
        })
        .from(schema.subscription)
        .where(eq(schema.subscription.userId, ctx.auth.userId))
        .limit(1);

      const subscription = subscriptions[0];

      if (!subscription?.paddleSubscriptionId) {
        throw new Error("Subscription not found");
      }

      const response = await axios.get(
        `${process.env.PADDLE_API_BASE_URL}/subscriptions/${subscription.paddleSubscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          },
        },
      );
      if (!response.data?.data?.items?.[0]?.price?.id) {
        throw new Error("price id not found");
      }
      return response.data?.data?.items?.[0]?.price?.id;
    } catch (e) {
      console.log(JSON.stringify(e, null, 2));
    }
  }),
  changePlan: privateProcedure
    .input(z.object({ newPriceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { newPriceId } = input;
        const userId = ctx.auth.userId;
        if (!userId) {
          throw new Error("User not found");
        }
        if (!newPriceId) {
          throw new Error("New price ID not found");
        }

        const subscriptions = await db
          .select({
            paddleSubscriptionId: schema.subscription.paddleSubscriptionId,
          })
          .from(schema.subscription)
          .where(eq(schema.subscription.userId, userId))
          .limit(1);

        const subscription = subscriptions[0];

        if (!subscription?.paddleSubscriptionId) {
          throw new Error("Subscription not found");
        }
        const response = await axios.patch(
          `${process.env.PADDLE_API_BASE_URL}/subscriptions/${subscription.paddleSubscriptionId}`,
          {
            proration_billing_mode: "prorated_immediately",
            items: [
              {
                price_id: newPriceId,
                quantity: 1,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
            },
          },
        );
      } catch (e) {
        console.log(JSON.stringify(e, null, 2));
      }
    }),
});
