CREATE TYPE "public"."EmailLabel" AS ENUM('inbox', 'sent', 'draft');--> statement-breakpoint
CREATE TYPE "public"."MeetingMessageMethod" AS ENUM('request', 'reply', 'cancel', 'counter', 'other');--> statement-breakpoint
CREATE TYPE "public"."Sensitivity" AS ENUM('normal', 'private', 'personal', 'confidential');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionStatus" AS ENUM('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'PAST_DUE');--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY NOT NULL,
	"emailAddress" text NOT NULL,
	"firstName" text,
	"lastName" text,
	"imageUrl" text,
	CONSTRAINT "User_emailAddress_unique" UNIQUE("emailAddress")
);
--> statement-breakpoint
CREATE TABLE "Account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"emailAddress" text NOT NULL,
	"accessToken" text NOT NULL,
	"name" text NOT NULL,
	"oramaIndex" json,
	"nextDeltaToken" text,
	CONSTRAINT "Account_accessToken_unique" UNIQUE("accessToken")
);
--> statement-breakpoint
CREATE TABLE "Thread" (
	"id" text PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"lastMessageDate" timestamp with time zone NOT NULL,
	"participantsIds" text[] NOT NULL,
	"accountId" text,
	"done" boolean DEFAULT false NOT NULL,
	"inboxStatus" boolean DEFAULT true NOT NULL,
	"draftStatus" boolean DEFAULT false NOT NULL,
	"sentStatus" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Email" (
	"id" text PRIMARY KEY NOT NULL,
	"threadId" text NOT NULL,
	"createdTime" timestamp with time zone NOT NULL,
	"lastModifiedTime" timestamp with time zone NOT NULL,
	"sentAt" timestamp with time zone NOT NULL,
	"receivedAt" timestamp with time zone NOT NULL,
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
CREATE TABLE "_BccEmails" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_CcEmails" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_ReplyToEmails" (
	"A" text NOT NULL,
	"B" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_ToEmails" (
	"A" text NOT NULL,
	"B" text NOT NULL
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
CREATE TABLE "Subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"paddleSubscriptionId" text NOT NULL,
	"customerID" text NOT NULL,
	"addressId" text NOT NULL,
	"businessId" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"startedAt" timestamp with time zone NOT NULL,
	"endedAt" timestamp with time zone,
	"nextBilledAt" timestamp with time zone,
	"pausedAt" timestamp with time zone,
	"canceledAt" timestamp with time zone,
	"status" "SubscriptionStatus" NOT NULL,
	"billingInterval" text NOT NULL,
	"billingFrequency" integer NOT NULL,
	"planId" text NOT NULL,
	CONSTRAINT "Subscription_userId_unique" UNIQUE("userId"),
	CONSTRAINT "Subscription_paddleSubscriptionId_unique" UNIQUE("paddleSubscriptionId")
);
--> statement-breakpoint
CREATE TABLE "ContactMessage" (
	"id" text PRIMARY KEY NOT NULL,
	"fromEmail" varchar(255) NOT NULL,
	"subject" varchar(255) DEFAULT 'No subject' NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_accountId_Account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Email" ADD CONSTRAINT "Email_threadId_Thread_id_fk" FOREIGN KEY ("threadId") REFERENCES "public"."Thread"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Email" ADD CONSTRAINT "Email_fromId_EmailAddress_id_fk" FOREIGN KEY ("fromId") REFERENCES "public"."EmailAddress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_BccEmails" ADD CONSTRAINT "_BccEmails_A_Email_id_fk" FOREIGN KEY ("A") REFERENCES "public"."Email"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_BccEmails" ADD CONSTRAINT "_BccEmails_B_EmailAddress_id_fk" FOREIGN KEY ("B") REFERENCES "public"."EmailAddress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_CcEmails" ADD CONSTRAINT "_CcEmails_A_Email_id_fk" FOREIGN KEY ("A") REFERENCES "public"."Email"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_CcEmails" ADD CONSTRAINT "_CcEmails_B_EmailAddress_id_fk" FOREIGN KEY ("B") REFERENCES "public"."EmailAddress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_ReplyToEmails" ADD CONSTRAINT "_ReplyToEmails_A_Email_id_fk" FOREIGN KEY ("A") REFERENCES "public"."Email"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_ReplyToEmails" ADD CONSTRAINT "_ReplyToEmails_B_EmailAddress_id_fk" FOREIGN KEY ("B") REFERENCES "public"."EmailAddress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_ToEmails" ADD CONSTRAINT "_ToEmails_A_Email_id_fk" FOREIGN KEY ("A") REFERENCES "public"."Email"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "_ToEmails" ADD CONSTRAINT "_ToEmails_B_EmailAddress_id_fk" FOREIGN KEY ("B") REFERENCES "public"."EmailAddress"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "EmailAddress" ADD CONSTRAINT "EmailAddress_accountId_Account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "EmailAttachment" ADD CONSTRAINT "EmailAttachment_emailId_Email_id_fk" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Account_userId_idx" ON "Account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Thread_accountId_idx" ON "Thread" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "Thread_done_idx" ON "Thread" USING btree ("done");--> statement-breakpoint
CREATE INDEX "Thread_inboxStatus_idx" ON "Thread" USING btree ("inboxStatus");--> statement-breakpoint
CREATE INDEX "Thread_draftStatus_idx" ON "Thread" USING btree ("draftStatus");--> statement-breakpoint
CREATE INDEX "Thread_sentStatus_idx" ON "Thread" USING btree ("sentStatus");--> statement-breakpoint
CREATE INDEX "Thread_lastMessageDate_idx" ON "Thread" USING btree ("lastMessageDate");--> statement-breakpoint
CREATE INDEX "Email_threadId_idx" ON "Email" USING btree ("threadId");--> statement-breakpoint
CREATE INDEX "Email_emailLabel_idx" ON "Email" USING btree ("emailLabel");--> statement-breakpoint
CREATE INDEX "Email_sentAt_idx" ON "Email" USING btree ("sentAt");--> statement-breakpoint
CREATE INDEX "Email_fromId_idx" ON "Email" USING btree ("fromId");--> statement-breakpoint
CREATE INDEX "_BccEmails_AB_unique" ON "_BccEmails" USING btree ("A","B");--> statement-breakpoint
CREATE INDEX "_CcEmails_AB_unique" ON "_CcEmails" USING btree ("A","B");--> statement-breakpoint
CREATE INDEX "_ReplyToEmails_AB_unique" ON "_ReplyToEmails" USING btree ("A","B");--> statement-breakpoint
CREATE INDEX "_ToEmails_AB_unique" ON "_ToEmails" USING btree ("A","B");--> statement-breakpoint
CREATE UNIQUE INDEX "EmailAddress_accountId_address_key" ON "EmailAddress" USING btree ("accountId","address");--> statement-breakpoint
CREATE INDEX "EmailAttachment_emailId_idx" ON "EmailAttachment" USING btree ("emailId");