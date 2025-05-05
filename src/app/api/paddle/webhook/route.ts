import { NextRequest, NextResponse } from "next/server";
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { db } from "@/server/db";
import { SubscriptionStatus } from "@prisma/client";

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

    await db.subscription.upsert({
      where: {
        userId: userId,
      },
      update: {
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
        updatedAt: new Date(),
        planId: data.customData?.planType || "",
      },
      create: {
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
      },
    });

    console.log(`Subscription created for user ${userId}`);
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

    await db.subscription.update({
      where: {
        paddleSubscriptionId: paddleSubscriptionId,
      },
      data: {
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
        updatedAt: new Date(),
        planId: data.customData?.planType || "",
      },
    });

    console.log(`Subscription updated for ${paddleSubscriptionId}`);
  } catch (error) {
    console.error("Error updating subscription:", error);
  }
};
