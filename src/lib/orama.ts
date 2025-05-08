import { db } from "@/drizzle/db";
import { account } from "@/drizzle/schema";
import { type AnyOrama, create, insert, search } from "@orama/orama";
import { restore, persist } from "@orama/plugin-data-persistence";
import { getEmbeddings } from "./embedding";
import { eq } from "drizzle-orm";

export class OramaClient {
  private orama!: AnyOrama;
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  async saveIndex() {
    const index = await persist(this.orama, "json");
    await db
      .update(account)
      .set({ oramaIndex: index })
      .where(eq(account.id, this.accountId));
  }

  async init() {
    console.log("Orama init");
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
        console.error("Error restoring Orama index:", error);
        // Create a new index if restoration fails
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
        await this.saveIndex();
      }
    } else {
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
      await this.saveIndex();
    }
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
      properties: ["subject", "from", "to", "body", "sentAt", "threadId"],
      limit: 50,
      tolerance: 1, // Allow 1 typo
      mode: "fulltext", // Use full text search mode
      boost: {
        subject: 2, // Boost matches in subject
        body: 1, // Normal priority for body
      },
      threshold: 0.3, // Lower threshold to catch more potential matches
    });

    console.log(`Search found ${result.hits.length} results`);
    return result;
  }

  async insert(document: any) {
    await insert(this.orama, document);
    await this.saveIndex();
  }
}
