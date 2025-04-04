"use server";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { access } from "fs";

export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365",
) => {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("User not Authorized");
    const params = new URLSearchParams({
      clientId: process.env.NEXT_AURINKO_CLIENT_ID as string,
      serviceType,
      scopes: "Mail.Send Mail.Drafts Mail.Read Mail.ReadWrite Mail.All",
      responseType: "code",
      returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
    });
    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
  } catch (error) {
    console.log(error);
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
