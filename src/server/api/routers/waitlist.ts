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
      try {
        const existingEntry = await db
          .select()
          .from(schema.waitlist)
          .where(eq(schema.waitlist.email, email)) // Using email as userId for non-authenticated users
          .limit(1);

        if (existingEntry.length > 0) {
          throw new Error("Email already exists in waitlist");
        }

        const waitlistId = cuid();
        await db.insert(schema.waitlist).values({
          id: waitlistId,
          email: email,
          approved: false,
        });

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
