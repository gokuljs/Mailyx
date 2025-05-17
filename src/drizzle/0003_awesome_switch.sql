CREATE INDEX "emailEmbedding_accountId_idx" ON "EmailEmbedding" USING btree ("accountId");--> statement-breakpoint
CREATE INDEX "emailEmbedding_userId_idx" ON "EmailEmbedding" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "emailEmbedding_emailId_idx" ON "EmailEmbedding" USING btree ("emailId");