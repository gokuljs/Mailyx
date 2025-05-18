import { Account } from "@/lib/accounts";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";
import { db } from "@/drizzle/db";
import { account } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  console.log("Initial sync triggered");
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

  const accounts = await db
    .select()
    .from(account)
    .where(and(eq(account.id, accountId), eq(account.userId, userId)))
    .limit(1);

  const dbAccount = accounts[0];

  if (!dbAccount)
    return NextResponse.json(
      {
        error: "user Account not found",
      },
      { status: 404 },
    );

  // performInitialSync
  const accountClient = new Account(dbAccount.accessToken);
  const response = await accountClient.performInitialSync();
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

  await db
    .update(account)
    .set({
      nextDeltaToken: deltaToken,
    })
    .where(eq(account.id, accountId));

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
