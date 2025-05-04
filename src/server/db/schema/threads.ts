import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { accounts } from "./accounts";
import { emails } from "./emails";

export const threads = pgTable(
  "Thread",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    subject: text("subject").notNull(),
    lastMessageDate: timestamp("lastMessageDate", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    participantsIds: text("participantsIds").array().notNull(), // Map String[] to text[]
    accountId: text("accountId").references(() => accounts.id),
    done: boolean("done").default(false).notNull(),
    inboxStatus: boolean("inboxStatus").default(true).notNull(),
    draftStatus: boolean("draftStatus").default(false).notNull(),
    sentStatus: boolean("sentStatus").default(false).notNull(),
  },
  (table) => {
    return {
      accountIdIdx: index("Thread_accountId_idx").on(table.accountId),
      doneIdx: index("Thread_done_idx").on(table.done),
      inboxStatusIdx: index("Thread_inboxStatus_idx").on(table.inboxStatus),
      draftStatusIdx: index("Thread_draftStatus_idx").on(table.draftStatus),
      sentStatusIdx: index("Thread_sentStatus_idx").on(table.sentStatus),
      lastMessageDateIdx: index("Thread_lastMessageDate_idx").on(
        table.lastMessageDate,
      ),
    };
  },
);

export const threadsRelations = relations(threads, ({ one, many }) => ({
  account: one(accounts, {
    fields: [threads.accountId],
    references: [accounts.id],
  }),
  emails: many(emails),
}));
