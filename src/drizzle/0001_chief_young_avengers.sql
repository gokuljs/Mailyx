CREATE TABLE "EmailEmbedding" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emailId" text NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"createdAt" timestamp(3) DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "EmailEmbedding" ADD CONSTRAINT "EmailEmbedding_emailId_Email_id_fk" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE cascade ON UPDATE cascade;