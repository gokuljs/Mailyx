import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { createHmac } from "crypto";

export async function POST(req: NextRequest) {
  try {
    console.log(req);
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
