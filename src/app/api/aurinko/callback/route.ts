import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aruinko";
import redisHandler from "@/lib/redis";
import { db } from "@/drizzle/db";
import { account } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { eq, or } from "drizzle-orm";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  const params = req.nextUrl.searchParams;
  if (!userId) {
    return NextResponse.json(
      {
        message: "unauthorized",
      },
      {
        status: 401,
      },
    );
  }
  const status = params.get("status");
  if (status != "success") {
    return NextResponse.json({
      message: "failed to link account",
      status: 401,
    });
  }
  const code = params.get("code");
  if (!code) {
    return NextResponse.json({
      message: "No code provided",
      status: 401,
    });
  }
  const token = await exchangeCodeForAccessToken(code);
  if (!token) {
    return NextResponse.json({
      message: "Failed to exchange token",
      status: 401,
    });
  }
  const accountDetails = await getAccountDetails(token.accessToken);

  // Check if account exists by email first, then by ID
  const existingAccount = await db
    .select()
    .from(account)
    .where(
      or(
        eq(account.emailAddress, accountDetails?.email || ""),
        eq(account.id, token.accountId.toString()),
      ),
    )
    .limit(1);
  console.log({ existingAccount });
  if (existingAccount.length > 0) {
    // Update existing account
    await db
      .update(account)
      .set({ accessToken: token.accessToken })
      .where(
        eq(account.id, existingAccount[0]?.id || token.accountId.toString()),
      );
  } else {
    // Create new account
    await db.insert(account).values({
      id: token.accountId.toString(),
      userId,
      accessToken: token.accessToken,
      emailAddress: accountDetails?.email || "",
      name: accountDetails?.name || "",
    });
  }

  const key = `accounts:user:${userId}`;
  await redisHandler.del(key);

  //   trigger initial sync
  //   nextjs function
  after(async () => {
    try {
      const data = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/initial-sync`,
        {
          accountId: token.accountId.toString(),
          userId,
        },
      );
      console.log("Initial sync triggered", data);
    } catch (error) {
      console.log(error);
    }
  });

  return NextResponse.redirect(new URL("/mail", req.url));
};
