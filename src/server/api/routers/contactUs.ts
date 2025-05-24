import { create } from "@orama/orama";
import { z } from "zod";
import nodemailer from "nodemailer";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { error } from "console";
import * as schema from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import cuid from "cuid";
import { eq } from "drizzle-orm";

export const contactRouter = createTRPCRouter({
  manageWaitList: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { email } = input;
        const existingWaitList = await db
          .select()
          .from(schema.waitlist)
          .where(eq(schema.waitlist.email, email));
        if (existingWaitList.length > 0) {
          throw new Error("Email already in waitlist");
        }
        const existingUser = await db
          .select()
          .from(schema.user)
          .where(eq(schema.user.emailAddress, email));
        if (existingUser.length > 0) {
          throw new Error("You're an existing user, please sign in");
        }
        await db.insert(schema.waitlist).values({
          id: cuid(),
          email,
          approved: false,
        });
        return {
          success: true,
          message: "Your email is added to the waitlist",
        };
      } catch (err) {
        console.error("Error in manageWaitList:", err);
        return {
          success: false,
          message:
            err instanceof Error
              ? err.message
              : "Failed to process waitlist request. Please try again later.",
        };
      }
    }),
  sendMessage: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { email, message, subject } = input;
        const messageId = cuid();
        const now = new Date().toISOString();

        // Insert using Drizzle
        await db.insert(schema.contactMessage).values({
          id: messageId,
          fromEmail: email,
          subject,
          message,
          updatedAt: now,
        });

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.CONTACT_EMAIL,
            pass: process.env.MAIL_APP_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: email,
          to: "jsgokul123@gmail.com",
          subject: subject ?? "New Contact Form Message For Mailyx",
          text: `
          ${message}
          ReplyTo - ${email}
          `,
        });

        return {
          success: true,
          message: "Message sent successfully",
        };
      } catch (err) {
        console.error("Error in sendMessage:", err);
        // Check if it's a database error or email sending error
        if (err instanceof Error && err.message.includes("nodemailer")) {
          return {
            success: false,
            message: "Failed to send email. Please try again later.",
          };
        }
        return {
          success: false,
          message: "Failed to process your message. Please try again later.",
        };
      }
    }),
});
