import { db } from "@/server/db";

export const POST = async (req: Request) => {
  try {
    const { data } = await req.json();
    const emailAddress = data?.email_addresses?.[0]?.email_address;
    const firstName = data?.first_name;
    const lastName = data?.last_name;
    const imageUrl = data?.image_url;
    const id = data?.id;

    if (!id || !emailAddress) {
      console.error("Missing required fields", { id, emailAddress });
      return new Response("Missing required user fields", { status: 400 });
    }

    await db.user.create({
      data: {
        id,
        emailAddress,
        firstName,
        lastName,
        imageUrl,
      },
    });

    return new Response("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Error in POST webhook handler:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
