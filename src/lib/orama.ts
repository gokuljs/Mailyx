import { db } from "@/drizzle/db";
import { account } from "@/drizzle/schema";
import { type AnyOrama, create, insert, search } from "@orama/orama";
import { restore, persist } from "@orama/plugin-data-persistence";
import { getEmbeddings } from "./embedding";
import { eq } from "drizzle-orm";
import { S3Storage } from "./s3";
import { compress, decompress } from "lz4js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// Maximum size for JSON chunks (100MB - well below JS string limit)
const MAX_CHUNK_SIZE = 100 * 1024 * 1024;

export class OramaClient {
  private orama!: AnyOrama;
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  // S3 key for this account's index
  private get s3Key(): string {
    return `orama-indices/${this.accountId}.json.lz4`;
  }

  async saveIndex() {
    if (!this.orama) {
      console.error("Cannot save index: Orama instance not initialized");
      return;
    }

    const index = await persist(this.orama, "json");

    // Get the index as a string if it's not already
    const indexStr = typeof index === "string" ? index : index.toString();

    // Convert to Uint8Array for compression
    const sourceData = new TextEncoder().encode(indexStr);

    // Compress the index with LZ4 for speed
    const compressedData = compress(sourceData);

    // Convert to Buffer for storage
    const compressedBuffer = Buffer.from(compressedData);

    // Save compressed index to S3
    await S3Storage.putObject(this.s3Key, compressedBuffer);

    // Also update the database reference (can be removed if fully migrated to S3)
    await db
      .update(account)
      .set({ oramaIndex: compressedBuffer.toString("base64") })
      .where(eq(account.id, this.accountId));
  }

  async init() {
    console.log("Orama init");

    // Try to load from S3 first
    const compressedS3Index = await S3Storage.getObject(this.s3Key);

    if (compressedS3Index) {
      try {
        // Ensure we have a Uint8Array for decompression
        const compressedArray = Buffer.isBuffer(compressedS3Index)
          ? new Uint8Array(compressedS3Index)
          : new Uint8Array(Buffer.from(compressedS3Index));

        // Decompress the index with LZ4 (fast decompression)
        const decompressedArray = decompress(compressedArray);

        // If the decompressed data is very large, save it to a temp file and read from there
        if (decompressedArray.length > MAX_CHUNK_SIZE) {
          console.log(
            `Large index detected (${decompressedArray.length} bytes), using file-based approach`,
          );

          try {
            // Create a temp file and write the decompressed data to it
            const tempDir = os.tmpdir();
            const tempFile = path.join(
              tempDir,
              `orama-index-${this.accountId}-${Date.now()}.json`,
            );

            // Write the buffer to the temp file
            fs.writeFileSync(tempFile, Buffer.from(decompressedArray));

            console.log(
              `Wrote decompressed index to temporary file: ${tempFile}`,
            );

            // Read the JSON from the file - this avoids loading the entire string into memory
            const fileContents = fs.readFileSync(tempFile, "utf8");
            this.orama = await restore("json", fileContents);

            // Clean up the temp file
            fs.unlinkSync(tempFile);
            console.log(`Cleaned up temporary file: ${tempFile}`);
          } catch (err) {
            console.error("Error during file-based index restoration:", err);
            throw err;
          }
        } else {
          // For smaller indices, we can use the simple approach
          const indexData = new TextDecoder().decode(decompressedArray);
          this.orama = await restore("json", indexData);
        }

        console.log("Successfully restored compressed index from S3");
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
      try {
        let indexData: string;

        // Check if the data is compressed (base64 string)
        if (
          typeof accountData.oramaIndex === "string" &&
          (accountData.oramaIndex.startsWith("{") ||
            accountData.oramaIndex.includes('"docmap":'))
        ) {
          // Looks like uncompressed JSON from before compression was added
          indexData = accountData.oramaIndex;
        } else {
          // Handle compressed data - try lz4js first
          try {
            const buffer =
              typeof accountData.oramaIndex === "string"
                ? Buffer.from(accountData.oramaIndex, "base64")
                : Buffer.from(String(accountData.oramaIndex));

            // Convert to Uint8Array for lz4js
            const compressedArray = new Uint8Array(buffer);

            // Decompress
            const decompressedArray = decompress(compressedArray);

            // If the array is very large, we need to process it through a temp file
            if (decompressedArray.length > MAX_CHUNK_SIZE) {
              console.log(
                `Large index detected (${decompressedArray.length} bytes), using file-based approach`,
              );

              // Create a temp file and write the decompressed data to it
              const tempDir = os.tmpdir();
              const tempFile = path.join(
                tempDir,
                `orama-index-${this.accountId}-${Date.now()}.json`,
              );

              // Write the buffer to the temp file
              fs.writeFileSync(tempFile, Buffer.from(decompressedArray));

              console.log(
                `Wrote decompressed index to temporary file: ${tempFile}`,
              );

              // Read the JSON from the file - this avoids loading the entire string into memory
              indexData = fs.readFileSync(tempFile, "utf8");

              // Clean up the temp file
              fs.unlinkSync(tempFile);
              console.log(`Cleaned up temporary file: ${tempFile}`);
            } else {
              // Convert back to string for smaller indices
              indexData = new TextDecoder().decode(decompressedArray);
            }
          } catch (error) {
            console.log(
              "LZ4JS decompression failed, trying to handle as legacy gzip format",
            );

            // Fallback to legacy gzip format if present
            const { gunzip } = await import("zlib");
            const { promisify } = await import("util");
            const gunzipPromise = promisify<Buffer, Buffer>(gunzip);

            const buffer =
              typeof accountData.oramaIndex === "string"
                ? Buffer.from(accountData.oramaIndex, "base64")
                : Buffer.from(String(accountData.oramaIndex));

            const decompressed = await gunzipPromise(buffer);

            // If the decompressed data is very large, use temp file approach
            if (decompressed.length > MAX_CHUNK_SIZE) {
              // Create a temp file and write the decompressed data to it
              const tempDir = os.tmpdir();
              const tempFile = path.join(
                tempDir,
                `orama-index-${this.accountId}-${Date.now()}.json`,
              );

              // Write the buffer to the temp file
              fs.writeFileSync(tempFile, decompressed);

              // Read the JSON from the file - this avoids loading the entire string into memory
              indexData = fs.readFileSync(tempFile, "utf8");

              // Clean up the temp file
              fs.unlinkSync(tempFile);
            } else {
              indexData = decompressed.toString();
            }
          }
        }

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
