import { db } from "@/drizzle/db";
import { account } from "@/drizzle/schema";
import { type AnyOrama, create, insert, search } from "@orama/orama";
import { restore, persist } from "@orama/plugin-data-persistence";
import { getEmbeddings } from "./embedding";
import { eq } from "drizzle-orm";
import { S3Storage } from "./s3";

export class OramaClient {
  private orama!: AnyOrama;
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  // S3 key for this account's index
  private get s3Key(): string {
    return `orama-indices/${this.accountId}.json`;
  }

  async saveIndex() {
    if (!this.orama) {
      console.error("Cannot save index: Orama instance not initialized");
      return;
    }

    const index = await persist(this.orama, "json");

    // Save to S3
    await S3Storage.putObject(this.s3Key, index);

    // Also update the database reference (can be removed if fully migrated to S3)
    // Convert Buffer to string if needed for database storage
    const indexForDb = typeof index === "string" ? index : index.toString();
    await db
      .update(account)
      .set({ oramaIndex: indexForDb })
      .where(eq(account.id, this.accountId));
  }

  async init() {
    console.log("Orama init");

    // Try to load from S3 first
    const s3Index = await S3Storage.getObject(this.s3Key);

    if (s3Index) {
      try {
        this.orama = await restore("json", s3Index);
        console.log("Successfully restored index from S3");
        return;
      } catch (error) {
        console.error("Error restoring Orama index from S3:", error);
        // Continue to fallback methods
      }
    }

    // Fallback to database if S3 retrieval failed
    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.id, this.accountId))
      .limit(1);

    const accountData = accounts[0];
    console.log("Orama index type:", typeof accountData?.oramaIndex);

    if (!accountData) throw new Error("Account not found");

    if (accountData.oramaIndex) {
      // Handle both string and object formats for compatibility
      const indexData =
        typeof accountData.oramaIndex === "string"
          ? accountData.oramaIndex
          : JSON.stringify(accountData.oramaIndex);

      try {
        this.orama = await restore("json", indexData);
      } catch (error) {
        console.error("Error restoring Orama index from database:", error);
        // Create a new index if restoration fails
        await this.createNewIndex();
        await this.saveIndex();
      }
    } else {
      await this.createNewIndex();
      await this.saveIndex();
    }
  }

  // Helper method to create a new index with the schema
  private async createNewIndex() {
    this.orama = await create({
      schema: {
        subject: "string",
        from: "string",
        to: "string[]",
        body: "string",
        sentAt: "string",
        threadId: "string",
        embeddings: "vector[1536]",
      },
    });
  }

  async vectorSearch({ term }: { term: string }) {
    console.log(`Performing vector search for: "${term}"`);
    const cleanTerm = term.trim();

    if (!cleanTerm) {
      return { hits: [] };
    }

    const embedding = await getEmbeddings(cleanTerm);
    const result = await search(this.orama, {
      mode: "hybrid",
      term: cleanTerm,
      properties: ["subject", "from", "to", "body"],
      boost: {
        subject: 2, // Boost matches in subject
        body: 1, // Normal priority for body
      },
      vector: {
        value: embedding,
        property: "embeddings",
      },
      similarity: 0.7, // Slightly lower similarity threshold for more results
      limit: 50,
    });

    console.log(`Vector search found ${result.hits.length} results`);
    return result;
  }

  async search({ term }: { term: string }) {
    console.log(`Performing search for: "${term}"`);
    const cleanTerm = term.trim();

    if (!cleanTerm) {
      return { hits: [] };
    }

    // Perform search with improved configuration
    const result = await search(this.orama, {
      term: cleanTerm,
    });

    console.log(`Search found ${result.hits.length} results`);
    return result;
  }

  async insert(document: any) {
    await insert(this.orama, document);
    await this.saveIndex();
  }
}
