import axios from "axios";
import { error } from "console";
import { headers } from "next/headers";
import { EmailMessage, SyncResponse, SyncUpdatedResponse } from "./types";
import { EmailAddress } from "@clerk/nextjs/server";
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
          daysWithin: 1,
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
}
