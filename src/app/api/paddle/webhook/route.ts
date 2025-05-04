import { NextRequest, NextResponse } from "next/server";
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { SubscriptionStatus } from "@/server/db/schema/subscriptions";
import { eq } from "drizzle-orm";

const paddle = new Paddle(process.env.PADDLE_API_KEY as string, {
  environment: process.env.PADDLE_ENV as Environment,
});

export const POST = async (req: NextRequest) => {
  console.log("Paddle Webhook initiated");
  const signature = req.headers.get("paddle-signature") || "";
  // req.body should be of type `buffer`, convert to string before passing it to `unmarshal`.
  // If express returned a JSON, remove any other middleware that might have processed raw request to object
  const rawRequestBody = (await req.text()) || "";
  // Replace `WEBHOOK_SECRET_KEY` with the secret key in notifications from vendor dashboard
  const secretKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET || "";

  try {
    if (signature && rawRequestBody) {
      // The `unmarshal` function will validate the integrity of the webhook and return an entity
      const eventData = await paddle.webhooks.unmarshal(
        rawRequestBody,
        secretKey,
        signature,
      );
      switch (eventData.eventType) {
        case EventName.SubscriptionCreated:
          await handleSubscriptionCreated(eventData.data);
          console.log("subscription created", eventData.data);
          break;
        case EventName.SubscriptionUpdated:
          await handleSubscriptionUpdated(eventData.data);
          console.log("subscription updated", eventData.data);
          break;
        default:
          console.log(eventData.eventType);
      }
    } else {
      console.log("Signature missing in header");
    }
  } catch (e) {
    // Handle signature mismatch or other runtime errors
    console.log(e);
  }
  // Return a response to acknowledge
  return new NextResponse("Processed webhook event");
};

const handleSubscriptionCreated = async (data: any) => {
  try {
    const userId = data.customData?.userId;
    console.log("created subscription for", userId);
    if (!userId) {
      console.error("No userId found in subscription data");
      return;
    }

    const values = {
      userId,
      paddleSubscriptionId: data.id,
      customerID: data.customerId,
      addressId: data.addressId,
      businessId: data.businessId,
      startedAt: new Date(data.currentBillingPeriod.startsAt),
      endedAt: new Date(data.currentBillingPeriod.endsAt),
      nextBilledAt: data.nextBilledAt ? new Date(data.nextBilledAt) : null,
      pausedAt: data.pausedAt ? new Date(data.pausedAt) : null,
      canceledAt: data.canceledAt ? new Date(data.canceledAt) : null,
      status: data.status.toUpperCase() as SubscriptionStatus,
      billingInterval: data.billingCycle.interval,
      billingFrequency: data.billingCycle.frequency,
      planId: data.customData?.planType || "",
    };

    await db
      .insert(schema.subscriptions)
      .values(values)
      .onConflictDoUpdate({
        target: schema.subscriptions.userId,
        set: {
          paddleSubscriptionId: values.paddleSubscriptionId,
          customerID: values.customerID,
          addressId: values.addressId,
          businessId: values.businessId,
          startedAt: values.startedAt,
          endedAt: values.endedAt,
          nextBilledAt: values.nextBilledAt,
          pausedAt: values.pausedAt,
          canceledAt: values.canceledAt,
          status: values.status,
          billingInterval: values.billingInterval,
          billingFrequency: values.billingFrequency,
          planId: values.planId,
        },
      });

    console.log(`Subscription created/updated for user ${userId}`);
  } catch (error) {
    console.error("Error creating subscription:", error);
  }
};

const handleSubscriptionUpdated = async (data: any) => {
  try {
    console.log("updated subscription data", data);
    const paddleSubscriptionId = data.id;
    if (!paddleSubscriptionId) {
      console.error(
        "No paddleSubscriptionId found in updated subscription data",
      );
      return;
    }

    const updateData = {
      customerID: data.customerId,
      addressId: data.addressId,
      businessId: data.businessId,
      startedAt: new Date(data.currentBillingPeriod.startsAt),
      endedAt: new Date(data.currentBillingPeriod.endsAt),
      nextBilledAt: data.nextBilledAt ? new Date(data.nextBilledAt) : null,
      pausedAt: data.pausedAt ? new Date(data.pausedAt) : null,
      canceledAt: data.canceledAt ? new Date(data.canceledAt) : null,
      status: data.status.toUpperCase() as SubscriptionStatus,
      billingInterval: data.billingCycle.interval,
      billingFrequency: data.billingCycle.frequency,
      planId: data.customData?.planType || "",
    };

    await db
      .update(schema.subscriptions)
      .set(updateData)
      .where(
        eq(schema.subscriptions.paddleSubscriptionId, paddleSubscriptionId),
      );

    console.log(`Subscription updated for ${paddleSubscriptionId}`);
  } catch (error) {
    console.error("Error updating subscription:", error);
  }
};
