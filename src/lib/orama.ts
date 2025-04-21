import { db } from "@/server/db";
import { type AnyOrama, create, insert, search } from "@orama/orama";
import { restore, persist } from "@orama/plugin-data-persistence";
import { json } from "stream/consumers";
import { threadId } from "worker_threads";
export class OramaClient {
  private orama!: AnyOrama;
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  async saveIndex() {
    const index = await persist(this.orama, "json");
    const account = await db.account.update({
      where: {
        id: this.accountId,
      },
      data: {
        oramaIndex: index,
      },
    });
  }

  async init() {
    console.log("Orama inti");
    const account = await db.account.findUnique({
      where: {
        id: this.accountId,
      },
    });
    if (!account) throw new Error("Account not found");
    if (account.oramaIndex) {
      this.orama = await restore("json", account?.oramaIndex as any);
    } else {
      this.orama = await create({
        schema: {
          subject: "string",
          from: "string",
          to: "string[]",
          body: "string",
          sentAt: "string",
          threadId: "string",
        },
      });
      await this.saveIndex();
    }
  }

  async search({ term }: { term: string }) {
    return await search(this.orama, { term });
  }

  async insert(document: any) {
    await insert(this.orama, document);
    await this.saveIndex();
  }
}
