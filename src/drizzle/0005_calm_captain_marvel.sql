ALTER TABLE "waitlist" RENAME COLUMN "user_id" TO "email";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_email" ON "waitlist" USING btree ("email");