import { Account } from "@/lib/accounts";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";
import { db } from "@/server/db";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { accountId, userId } = await req.json();
  if (!accountId) {
    return NextResponse.json(
      {
        error: "Account Id is missing",
      },
      { status: 400 },
    );
  }
  if (!userId) {
    return NextResponse.json(
      {
        error: "user ID is missing",
      },
      { status: 400 },
    );
  }
  const dbAccount = await db.account.findUnique({
    where: {
      id: accountId,
      userId,
    },
  });
  if (!dbAccount)
    return NextResponse.json(
      {
        error: "user Account not found",
      },
      { status: 404 },
    );
  // performInitialSync
  const account = new Account(dbAccount.accessToken);
  const response = await account.performInitialSync();
  if (!response) {
    return NextResponse.json(
      {
        error: "Failed to Perform initial sync ",
      },
      {
        status: 500,
      },
    );
  }
  const { emails, deltaToken } = response;
  await db.account.update({
    where: {
      id: accountId,
    },
    data: {
      nextDeltaToken: deltaToken,
    },
  });
  // console.log("%%%%%%%%%%%%%%%");
  // console.log(JSON.stringify(emails.slice(0, 1), null, 2));
  await syncEmailsToDatabase(emails, accountId);
  return NextResponse.json(
    {
      success: true,
    },
    {
      status: 200,
    },
  );
};
