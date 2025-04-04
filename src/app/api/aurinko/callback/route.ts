import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aruinko";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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
  await db.account.upsert({
    where: {
      id: token.accountId.toString(),
    },
    update: {
      accessToken: token.accessToken,
    },
    create: {
      id: token.accountId.toString(),
      userId,
      accessToken: token.accessToken,
      emailAddress: accountDetails?.email || "",
      name: accountDetails?.name || "",
    },
  });

  console.log({ userId, accountDetails });
  return NextResponse.json({
    message: "hello word",
  });
};
