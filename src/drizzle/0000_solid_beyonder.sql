-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."EmailLabel" AS ENUM('inbox', 'sent', 'draft');--> statement-breakpoint
CREATE TYPE "public"."MeetingMessageMethod" AS ENUM('request', 'reply', 'cancel', 'counter', 'other');--> statement-breakpoint
CREATE TYPE "public"."Sensitivity" AS ENUM('normal', 'private', 'personal', 'confidential');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionStatus" AS ENUM('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'PAST_DUE');--> statement-breakpoint
CREATE TABLE "ContactMessage" (
	"id" text PRIMARY KEY NOT NULL,
	"fromEmail" varchar(255) NOT NULL,
	"subject" varchar(255) DEFAULT 'No subject' NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatBotInteraction" (
	"id" text PRIMARY KEY NOT NULL,
	"day" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"paddleSubscriptionId" text NOT NULL,
	"customerID" text NOT NULL,
	"addressId" text NOT NULL,
	"businessId" text,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"startedAt" timestamp(3) NOT NULL,
	"endedAt" timestamp(3),
	"nextBilledAt" timestamp(3),
	"pausedAt" timestamp(3),
	"canceledAt" timestamp(3),
	"status" "SubscriptionStatus" NOT NULL,
	"billingInterval" text NOT NULL,
	"billingFrequency" integer NOT NULL,
	"planId" text NOT NULL,
	CONSTRAINT "Subscription_userId_key" UNIQUE("userId"),
	CONSTRAINT "Subscription_paddleSubscriptionId_key" UNIQUE("paddleSubscriptionId")
);
--> statement-breakpoint
CREATE TABLE "_ToEmails" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_ReplyToEmails" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_CcEmails" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_BccEmails" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Thread" (
	"id" text PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"lastMessageDate" timestamp(3) NOT NULL,
	"participantsIds" text[] NOT NULL,
	"accountId" text,
	"done" boolean DEFAULT false NOT NULL,
	"inboxStatus" boolean DEFAULT true NOT NULL,
	"draftStatus" boolean DEFAULT false NOT NULL,
	"sentStatus" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "EmailAttachment" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"mimeType" text NOT NULL,
	"size" integer NOT NULL,
	"inline" boolean NOT NULL,
	"contentId" text,
	"content" text,
	"contentLocation" text,
	"emailId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Email" (
	"id" text PRIMARY KEY NOT NULL,
	"threadId" text NOT NULL,
	"createdTime" timestamp(3) NOT NULL,
	"lastModifiedTime" timestamp(3) NOT NULL,
	"sentAt" timestamp(3) NOT NULL,
	"receivedAt" timestamp(3) NOT NULL,
	"internetMessageId" text NOT NULL,
	"subject" text NOT NULL,
	"sysLabels" text[] NOT NULL,
	"keywords" text[] NOT NULL,
	"sysClassifications" text[] NOT NULL,
	"sensitivity" "Sensitivity" DEFAULT 'normal' NOT NULL,
	"meetingMessageMethod" "MeetingMessageMethod",
	"fromId" text NOT NULL,
	"hasAttachments" boolean NOT NULL,
	"body" text,
	"bodySnippet" text,
	"inReplyTo" text,
	"references" text,
	"threadIndex" text,
	"internetHeaders" jsonb[] NOT NULL,
	"nativeProperties" jsonb,
	"folderId" text,
	"omitted" text[] NOT NULL,
	"emailLabel" "EmailLabel" DEFAULT 'inbox' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "EmailAddress" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"address" text NOT NULL,
	"raw" text,
	"accountId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"emailAddress" text NOT NULL,
	"accessToken" text NOT NULL,
	"name" text NOT NULL,
	"oramaIndex" jsonb,
	"nextDeltaToken" text,
	CONSTRAINT "Account_accessToken_key" UNIQUE("accessToken")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"emailAddress" text NOT NULL,
	"firstName" text,
	"lastName" text,
	"imageUrl" text,
	CONSTRAINT "User_emailAddress_key" UNIQUE("emailAddress")
);
--> statement-breakpoint
ALTER TABLE "chatBotInteraction" ADD CONSTRAINT "chatBotInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_ToEmails" ADD CONSTRAINT "_ToEmails_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Email"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_ToEmails" ADD CONSTRAINT "_ToEmails_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."EmailAddress"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_ReplyToEmails" ADD CONSTRAINT "_ReplyToEmails_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Email"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_ReplyToEmails" ADD CONSTRAINT "_ReplyToEmails_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."EmailAddress"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_CcEmails" ADD CONSTRAINT "_CcEmails_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Email"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_CcEmails" ADD CONSTRAINT "_CcEmails_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."EmailAddress"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_BccEmails" ADD CONSTRAINT "_BccEmails_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Email"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_BccEmails" ADD CONSTRAINT "_BccEmails_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."EmailAddress"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "EmailAttachment" ADD CONSTRAINT "EmailAttachment_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Email" ADD CONSTRAINT "Email_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "public"."EmailAddress"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Email" ADD CONSTRAINT "Email_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "public"."Thread"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "EmailAddress" ADD CONSTRAINT "EmailAddress_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "chatBotInteraction_day_userId_idx" ON "chatBotInteraction" USING btree ("day" text_ops,"userId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "chatBotInteraction_day_userId_key" ON "chatBotInteraction" USING btree ("day" text_ops,"userId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "chatBotInteraction_userId_key" ON "chatBotInteraction" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "_ToEmails_AB_unique" ON "_ToEmails" USING btree ("A" text_ops,"B" text_ops);--> statement-breakpoint
CREATE INDEX "_ToEmails_B_index" ON "_ToEmails" USING btree ("B" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "_ReplyToEmails_AB_unique" ON "_ReplyToEmails" USING btree ("A" text_ops,"B" text_ops);--> statement-breakpoint
CREATE INDEX "_ReplyToEmails_B_index" ON "_ReplyToEmails" USING btree ("B" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "_CcEmails_AB_unique" ON "_CcEmails" USING btree ("A" text_ops,"B" text_ops);--> statement-breakpoint
CREATE INDEX "_CcEmails_B_index" ON "_CcEmails" USING btree ("B" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "_BccEmails_AB_unique" ON "_BccEmails" USING btree ("A" text_ops,"B" text_ops);--> statement-breakpoint
CREATE INDEX "_BccEmails_B_index" ON "_BccEmails" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "Thread_accountId_idx" ON "Thread" USING btree ("accountId" text_ops);--> statement-breakpoint
CREATE INDEX "Thread_done_idx" ON "Thread" USING btree ("done" bool_ops);--> statement-breakpoint
CREATE INDEX "Thread_draftStatus_idx" ON "Thread" USING btree ("draftStatus" bool_ops);--> statement-breakpoint
CREATE INDEX "Thread_inboxStatus_idx" ON "Thread" USING btree ("inboxStatus" bool_ops);--> statement-breakpoint
CREATE INDEX "Thread_lastMessageDate_idx" ON "Thread" USING btree ("lastMessageDate" timestamp_ops);--> statement-breakpoint
CREATE INDEX "Thread_sentStatus_idx" ON "Thread" USING btree ("sentStatus" bool_ops);--> statement-breakpoint
CREATE INDEX "Email_emailLabel_idx" ON "Email" USING btree ("emailLabel" enum_ops);--> statement-breakpoint
CREATE INDEX "Email_sentAt_idx" ON "Email" USING btree ("sentAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "Email_threadId_idx" ON "Email" USING btree ("threadId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "EmailAddress_accountId_address_key" ON "EmailAddress" USING btree ("accountId" text_ops,"address" text_ops);
*/