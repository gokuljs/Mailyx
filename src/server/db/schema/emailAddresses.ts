import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { accounts } from "./accounts";
import { emails } from "./emails"; // Will be created next

export const emailAddresses = pgTable(
  "EmailAddress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    address: text("address").notNull(),
    raw: text("raw"),
    accountId: text("accountId")
      .notNull()
      .references(() => accounts.id),
  },
  (table) => {
    return {
      accountAddressUniqueIdx: uniqueIndex(
        "EmailAddress_accountId_address_key",
      ).on(table.accountId, table.address),
    };
  },
);

export const emailAddressesRelations = relations(
  emailAddresses,
  ({ one, many }) => ({
    account: one(accounts, {
      fields: [emailAddresses.accountId],
      references: [accounts.id],
    }),
    // Relations defined in emails.ts for M2M
    sentEmails: many(emails, { relationName: "FromEmail" }),
    receivedToEmails: many(emails, { relationName: "ToEmails" }),
    receivedCcEmails: many(emails, { relationName: "CcEmails" }),
    receivedBccEmails: many(emails, { relationName: "BccEmails" }),
    replyToEmails: many(emails, { relationName: "ReplyToEmails" }),
  }),
);
