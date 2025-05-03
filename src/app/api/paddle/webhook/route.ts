import { NextRequest, NextResponse } from "next/server";
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";

const paddle = new Paddle(process.env.PADDLE_API_KEY as string, {
  environment: process.env.PADDLE_ENV as Environment,
});

export async function POST(req: NextRequest) {
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
        case EventName.ProductUpdated:
          console.log(`Product ${eventData.data.id} was updated`);
          break;
        case EventName.SubscriptionUpdated:
          console.log(`Subscription ${eventData.data.id} was updated`);
          break;
        case EventName.TransactionPaid:
          console.log(`Transaction ${eventData.data.id} was paid`);
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
}
