import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import * as schema from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import cuid from "cuid";

export const waitlistRouter = createTRPCRouter({
  addToWaitlist: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      console.log("email", email);
      try {
        // Check if email already exists in user table (already a user)
        const existingUser = await db
          .select()
          .from(schema.user)
          .where(eq(schema.user.emailAddress, email))
          .limit(1);

        if (existingUser.length > 0) {
          throw new Error(
            "You're already registered! Please sign in to access Mailyx.",
          );
        }

        // Check if email already exists in waitlist
        const existingWaitlistEntry = await db
          .select()
          .from(schema.waitlist)
          .where(eq(schema.waitlist.email, email))
          .limit(1);

        if (existingWaitlistEntry.length > 0) {
          throw new Error("Email already exists in waitlist");
        }

        // Add to waitlist
        const waitlistId = cuid();
        await db.insert(schema.waitlist).values({
          id: waitlistId,
          email: email,
          approved: false,
        });

        console.log(`New waitlist signup: ${email}`);

        return {
          success: true,
          message: "Successfully added to waitlist!",
        };
      } catch (error) {
        console.error("Waitlist signup error:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        );
      }
    }),
});
