import axios from "axios";
import { error } from "console";
import { headers } from "next/headers";
import {
  EmailAddress,
  EmailMessage,
  SyncResponse,
  SyncUpdatedResponse,
} from "./types";
import { db } from "@/drizzle/db";
import { account } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { syncEmailsToDatabase } from "./sync-to-db";

export class Account {
  private token: string;
  constructor(token: string) {
    this.token = token;
  }

  private async startSync() {
    const response = await axios.post<SyncResponse>(
      "https://api.aurinko.io/v1/email/sync",
      {},
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params: {
          daysWithin: 3,
          bodyType: "html",
        },
      },
    );
    return response.data;
  }

  private async getUpdateEmails({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }) {
    let params: Record<string, string> = {};
    if (deltaToken) params.deltaToken = deltaToken;
    if (pageToken) params.pageToken = pageToken;

    // Validate token exists
    if (!this.token || this.token.trim() === "") {
      throw new Error("Authorization token is missing or empty");
    }

    try {
      const response = await axios.get<SyncUpdatedResponse>(
        `https://api.aurinko.io/v1/email/sync/updated`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params,
        },
      );
      return response.data;
    } catch (error: any) {
      console.error("API error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        params,
        tokenLength: this.token ? this.token.length : 0,
      });
      throw error;
    }
  }

  async performInitialSync() {
    try {
      //start sync response
      let syncResponse = await this.startSync();
      while (!syncResponse.ready) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        syncResponse = await this.startSync();
      }
      let storedDeltaToken: string = syncResponse.syncUpdatedToken;
      //get bookMark Delta token
      let updatedResponse = await this.getUpdateEmails({
        deltaToken: storedDeltaToken,
      });
      if (updatedResponse.nextDeltaToken) {
        // sync has completed
        storedDeltaToken = updatedResponse.nextDeltaToken;
      }
      let allEmails: EmailMessage[] = updatedResponse.records;
      //   fetch all pages
      while (updatedResponse?.nextPageToken) {
        updatedResponse = await this.getUpdateEmails({
          pageToken: updatedResponse?.nextPageToken,
        });
        allEmails = allEmails.concat(updatedResponse.records);
        if (updatedResponse?.nextDeltaToken) {
          //sync has ended
          storedDeltaToken = updatedResponse?.nextDeltaToken;
        }
      }

      return {
        emails: allEmails,
        deltaToken: storedDeltaToken,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async sendEMail({
    from,
    subject,
    body,
    inReplyTo,
    references,
    to,
    cc,
    bcc,
    replyTo,
    threadId,
  }: {
    from: EmailAddress;
    subject: string;
    body: string;
    inReplyTo?: string;
    threadId?: string;
    references?: string;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    replyTo?: EmailAddress;
  }) {
    try {
      console.log(this.token);
      const response = await axios.post(
        "https://api.aurinko.io/v1/email/messages",
        {
          from,
          subject,
          body,
          inReplyTo,
          references,
          to,
          threadId,
          cc,
          bcc,
          replyTo: [replyTo],
        },
        {
          params: {
            returnIds: true,
          },
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      console.log("Email sent", response.data);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async syncEmails() {
    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.accessToken, this.token))
      .limit(1);

    const accountData = accounts[0];
    if (!accountData) throw new Error("Account not found");
    if (!accountData.nextDeltaToken)
      throw new Error("Account not ready for sync");

    let response = await this.getUpdateEmails({
      deltaToken: accountData.nextDeltaToken,
    });

    let storedDeltaToken = accountData.nextDeltaToken;
    let allEmails: EmailMessage[] = response?.records;

    if (response?.nextDeltaToken) {
      storedDeltaToken = response?.nextDeltaToken;
    }

    while (response.nextPageToken) {
      response = await this.getUpdateEmails({
        pageToken: response.nextPageToken,
      });
      allEmails = allEmails.concat(response.records);
      if (response?.nextDeltaToken) {
        storedDeltaToken = response?.nextDeltaToken;
      }
    }

    try {
      syncEmailsToDatabase(allEmails, accountData.id);
    } catch (e) {
      console.error("Error during sync:", e);
    }

    await db
      .update(account)
      .set({ nextDeltaToken: storedDeltaToken })
      .where(eq(account.id, accountData.id));

    return {
      allEmails: allEmails,
      deltaToken: storedDeltaToken,
    };
  }
}
