import { z } from "zod";
import nodemailer from "nodemailer";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { error } from "console";

export const contactRouter = createTRPCRouter({
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
        await ctx.db.contactMessage.create({
          data: {
            fromEmail: email,
            subject,
            message,
          },
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
