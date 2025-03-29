import { auth } from "@clerk/nextjs/server";

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
