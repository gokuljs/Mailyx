import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3";

/**
 * S3Storage class to handle Orama index storage and retrieval
 */
export class S3Storage {
  private static client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });

  private static bucketName =
    process.env.S3_BUCKET_NAME || "mailyx-orama-indices";

  /**
   * Store an object in S3
   * @param key The S3 key (path)
   * @param data The data to store
   */
  static async putObject(key: string, data: string | Buffer): Promise<void> {
    // Convert buffer to string if needed
    const bodyContent = typeof data === "string" ? data : data.toString();

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: bodyContent,
      ContentType: "application/json",
    });

    await this.client.send(command);
  }

  /**
   * Get an object from S3
   * @param key The S3 key (path)
   * @returns The object data as string, or null if not found
   */
  static async getObject(key: string): Promise<string | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        return null;
      }

      // Convert the ReadableStream to string
      return await response.Body.transformToString();
    } catch (error) {
      // Return null if object doesn't exist
      if (error instanceof NoSuchKey) {
        return null;
      }
      // Otherwise rethrow the error
      throw error;
    }
  }
}
