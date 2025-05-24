import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const waitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const result = waitlistSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const { email } = result.data;

    // Here you would typically:
    // 1. Check if email already exists in waitlist
    // 2. Save to database
    // 3. Send confirmation email
    // 4. Add to email marketing list (like Mailchimp, ConvertKit, etc.)

    // For now, we'll just simulate the process
    console.log(`New waitlist signup: ${email}`);

    // Simulate database save (replace with actual database logic)
    // await db.waitlist.create({ data: { email } });

    // You might want to integrate with services like:
    // - Mailchimp
    // - ConvertKit
    // - Airtable
    // - Notion
    // - Google Sheets

    return NextResponse.json(
      {
        success: true,
        message: "Successfully added to waitlist!",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Waitlist signup error:", error);

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
