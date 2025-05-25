"use server";
import { db } from "@/drizzle/db";
import { account } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { access } from "fs";
import { FREE_ACCOUNTS_PER_USER, PRO_ACCOUNTS_PER_USER } from "./Constants";
import { toast } from "sonner";
import { count, eq } from "drizzle-orm";

//  "Mail.Send Mail.Drafts Mail.Read Mail.ReadWrite Mail.All"

export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
  isSubscribed: boolean,
) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("User not Authorized");

    // Using Drizzle ORM to count accounts
    const result = await db
      .select({ value: count() })
      .from(account)
      .where(eq(account.userId, userId));

    const accountCount = result[0]?.value || 0;

    const maxAccounts = isSubscribed
      ? PRO_ACCOUNTS_PER_USER
      : FREE_ACCOUNTS_PER_USER;

    if (accountCount >= maxAccounts) {
      throw new Error("You have reached the maximum number of accounts");
    }
    const params = new URLSearchParams({
      clientId: process.env.NEXT_AURINKO_CLIENT_ID as string,
      serviceType,
      scopes: "Mail.Send Mail.Drafts Mail.Read",
      responseType: "code",
      returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
    });
    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
  } catch (error) {
    throw error;
  }
};

export const exchangeCodeForAccessToken = async (code: string) => {
  try {
    const response = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username: process.env.NEXT_AURINKO_CLIENT_ID as string,
          password: process.env.NEXT_AURINKO_CLIENT_SECRET as string,
        },
      },
    );
    return response.data as {
      accountId: string;
      accessToken: string;
      userId: string;
      userSession: string;
    };
  } catch (error) {
    console.log(error);
  }
};

export const getAccountDetails = async (accessToken: string) => {
  try {
    const response = await axios.get("https://api.aurinko.io/v1/account", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data as {
      email: string;
      name: string;
    };
  } catch (error) {
    console.log(error);
  }
};
