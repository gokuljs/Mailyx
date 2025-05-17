ALTER TABLE "EmailEmbedding" ADD COLUMN "accountId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "EmailEmbedding" ADD COLUMN "userId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "EmailEmbedding" ADD COLUMN "accountEmail" text NOT NULL;--> statement-breakpoint
ALTER TABLE "EmailEmbedding" ADD CONSTRAINT "EmailEmbedding_accountId_Account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "EmailEmbedding" ADD CONSTRAINT "EmailEmbedding_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;