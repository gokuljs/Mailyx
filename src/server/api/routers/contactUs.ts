import { z } from "zod";
import nodemailer from "nodemailer";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { error } from "console";
import * as schema from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import cuid from "cuid";

export const contactRouter = createTRPCRouter({
  manageWaitList: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email } = input;
      console.log(email);
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
      const { email, message, subject } = input;
      try {
        // Generate a unique ID for the message
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
          subject: input?.subject ?? "New Contact Form Message For Mailyx",
          text: `
          ${message}
          ReplyTo - ${email}
          `,
        });
      } catch (e) {
        console.log(error);
      }
    }),
});
