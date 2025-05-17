import {
  pgTable,
  text,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  foreignKey,
  integer,
  unique,
  boolean,
  jsonb,
  pgEnum,
  vector,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const emailLabel = pgEnum("EmailLabel", ["inbox", "sent", "draft"]);
export const meetingMessageMethod = pgEnum("MeetingMessageMethod", [
  "request",
  "reply",
  "cancel",
  "counter",
  "other",
]);
export const sensitivity = pgEnum("Sensitivity", [
  "normal",
  "private",
  "personal",
  "confidential",
]);
export const subscriptionStatus = pgEnum("SubscriptionStatus", [
  "ACTIVE",
  "PAUSED",
  "CANCELLED",
  "EXPIRED",
  "PAST_DUE",
]);

export const contactMessage = pgTable("ContactMessage", {
  id: text().primaryKey().notNull(),
  fromEmail: varchar({ length: 255 }).notNull(),
  subject: varchar({ length: 255 }).default("No subject").notNull(),
  message: text().notNull(),
  createdAt: timestamp({ precision: 3, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
});

export const chatBotInteraction = pgTable(
  "chatBotInteraction",
  {
    id: text().primaryKey().notNull(),
    day: text().notNull(),
    count: integer().default(1).notNull(),
    userId: text().notNull(),
  },
  (table) => [
    index("chatBotInteraction_day_userId_idx").using(
      "btree",
      table.day.asc().nullsLast().op("text_ops"),
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("chatBotInteraction_day_userId_key").using(
      "btree",
      table.day.asc().nullsLast().op("text_ops"),
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    uniqueIndex("chatBotInteraction_userId_key").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "chatBotInteraction_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const subscription = pgTable(
  "Subscription",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    paddleSubscriptionId: text().notNull(),
    customerID: text().notNull(),
    addressId: text().notNull(),
    businessId: text(),
    createdAt: timestamp({ precision: 3, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    startedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    endedAt: timestamp({ precision: 3, mode: "string" }),
    nextBilledAt: timestamp({ precision: 3, mode: "string" }),
    pausedAt: timestamp({ precision: 3, mode: "string" }),
    canceledAt: timestamp({ precision: 3, mode: "string" }),
    status: subscriptionStatus().notNull(),
    billingInterval: text().notNull(),
    billingFrequency: integer().notNull(),
    planId: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Subscription_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    unique("Subscription_userId_key").on(table.userId),
    unique("Subscription_paddleSubscriptionId_key").on(
      table.paddleSubscriptionId,
    ),
  ],
);

export const toEmails = pgTable(
  "_ToEmails",
  {
    a: text("A").notNull(),
    b: text("B").notNull(),
  },
  (table) => [
    uniqueIndex("_ToEmails_AB_unique").using(
      "btree",
      table.a.asc().nullsLast().op("text_ops"),
      table.b.asc().nullsLast().op("text_ops"),
    ),
    index().using("btree", table.b.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.a],
      foreignColumns: [email.id],
      name: "_ToEmails_A_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.b],
      foreignColumns: [emailAddress.id],
      name: "_ToEmails_B_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const replyToEmails = pgTable(
  "_ReplyToEmails",
  {
    a: text("A").notNull(),
    b: text("B").notNull(),
  },
  (table) => [
    uniqueIndex("_ReplyToEmails_AB_unique").using(
      "btree",
      table.a.asc().nullsLast().op("text_ops"),
      table.b.asc().nullsLast().op("text_ops"),
    ),
    index().using("btree", table.b.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.a],
      foreignColumns: [email.id],
      name: "_ReplyToEmails_A_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.b],
      foreignColumns: [emailAddress.id],
      name: "_ReplyToEmails_B_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const ccEmails = pgTable(
  "_CcEmails",
  {
    a: text("A").notNull(),
    b: text("B").notNull(),
  },
  (table) => [
    uniqueIndex("_CcEmails_AB_unique").using(
      "btree",
      table.a.asc().nullsLast().op("text_ops"),
      table.b.asc().nullsLast().op("text_ops"),
    ),
    index().using("btree", table.b.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.a],
      foreignColumns: [email.id],
      name: "_CcEmails_A_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.b],
      foreignColumns: [emailAddress.id],
      name: "_CcEmails_B_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const bccEmails = pgTable(
  "_BccEmails",
  {
    a: text("A").notNull(),
    b: text("B").notNull(),
  },
  (table) => [
    uniqueIndex("_BccEmails_AB_unique").using(
      "btree",
      table.a.asc().nullsLast().op("text_ops"),
      table.b.asc().nullsLast().op("text_ops"),
    ),
    index().using("btree", table.b.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.a],
      foreignColumns: [email.id],
      name: "_BccEmails_A_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.b],
      foreignColumns: [emailAddress.id],
      name: "_BccEmails_B_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ],
);

export const thread = pgTable(
  "Thread",
  {
    id: text().primaryKey().notNull(),
    subject: text().notNull(),
    lastMessageDate: timestamp({ precision: 3, mode: "string" }).notNull(),
    participantsIds: text().array().notNull(),
    accountId: text(),
    done: boolean().default(false).notNull(),
    inboxStatus: boolean().default(true).notNull(),
    draftStatus: boolean().default(false).notNull(),
    sentStatus: boolean().default(false).notNull(),
  },
  (table) => [
    index("Thread_accountId_idx").using(
      "btree",
      table.accountId.asc().nullsLast().op("text_ops"),
    ),
    index("Thread_done_idx").using(
      "btree",
      table.done.asc().nullsLast().op("bool_ops"),
    ),
    index("Thread_draftStatus_idx").using(
      "btree",
      table.draftStatus.asc().nullsLast().op("bool_ops"),
    ),
    index("Thread_inboxStatus_idx").using(
      "btree",
      table.inboxStatus.asc().nullsLast().op("bool_ops"),
    ),
    index("Thread_lastMessageDate_idx").using(
      "btree",
      table.lastMessageDate.asc().nullsLast().op("timestamp_ops"),
    ),
    index("Thread_sentStatus_idx").using(
      "btree",
      table.sentStatus.asc().nullsLast().op("bool_ops"),
    ),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "Thread_accountId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ],
);

export const emailAttachment = pgTable(
  "EmailAttachment",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    mimeType: text().notNull(),
    size: integer().notNull(),
    inline: boolean().notNull(),
    contentId: text(),
    content: text(),
    contentLocation: text(),
    emailId: text().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.emailId],
      foreignColumns: [email.id],
      name: "EmailAttachment_emailId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const email = pgTable(
  "Email",
  {
    id: text().primaryKey().notNull(),
    threadId: text().notNull(),
    createdTime: timestamp({ precision: 3, mode: "string" }).notNull(),
    lastModifiedTime: timestamp({ precision: 3, mode: "string" }).notNull(),
    sentAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    receivedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
    internetMessageId: text().notNull(),
    subject: text().notNull(),
    sysLabels: text().array().notNull(),
    keywords: text().array().notNull(),
    sysClassifications: text().array().notNull(),
    sensitivity: sensitivity().default("normal").notNull(),
    meetingMessageMethod: meetingMessageMethod(),
    fromId: text().notNull(),
    hasAttachments: boolean().notNull(),
    body: text(),
    bodySnippet: text(),
    inReplyTo: text(),
    references: text(),
    threadIndex: text(),
    internetHeaders: jsonb().array().notNull(),
    nativeProperties: jsonb(),
    folderId: text(),
    omitted: text().array().notNull(),
    emailLabel: emailLabel().default("inbox").notNull(),
  },
  (table) => [
    index("Email_emailLabel_idx").using(
      "btree",
      table.emailLabel.asc().nullsLast().op("enum_ops"),
    ),
    index("Email_sentAt_idx").using(
      "btree",
      table.sentAt.asc().nullsLast().op("timestamp_ops"),
    ),
    index("Email_threadId_idx").using(
      "btree",
      table.threadId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.fromId],
      foreignColumns: [emailAddress.id],
      name: "Email_fromId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.threadId],
      foreignColumns: [thread.id],
      name: "Email_threadId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const emailAddress = pgTable(
  "EmailAddress",
  {
    id: text().primaryKey().notNull(),
    name: text(),
    address: text().notNull(),
    raw: text(),
    accountId: text().notNull(),
  },
  (table) => [
    uniqueIndex("EmailAddress_accountId_address_key").using(
      "btree",
      table.accountId.asc().nullsLast().op("text_ops"),
      table.address.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "EmailAddress_accountId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const account = pgTable(
  "Account",
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    emailAddress: text().notNull(),
    accessToken: text().notNull(),
    name: text().notNull(),
    oramaIndex: jsonb(),
    nextDeltaToken: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "Account_userId_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    unique("Account_accessToken_key").on(table.accessToken),
  ],
);

export const user = pgTable(
  "User",
  {
    id: text().primaryKey().notNull(),
    emailAddress: text().notNull(),
    firstName: text(),
    lastName: text(),
    imageUrl: text(),
  },
  (table) => [unique("User_emailAddress_key").on(table.emailAddress)],
);

export const emailEmbedding = pgTable(
  "EmailEmbedding",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    emailId: text("emailId")
      .notNull()
      .references(() => email.id, { onDelete: "cascade", onUpdate: "cascade" }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    accountId: text("accountId")
      .notNull()
      .references(() => account.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    accountEmail: text("accountEmail").notNull(),
    createdAt: timestamp("createdAt", {
      precision: 3,
      mode: "string",
    }).defaultNow(),
  },
  (table) => {
    return {
      embedIdx: sql`CREATE INDEX IF NOT EXISTS "emailEmbedding_embedding_idx" ON "EmailEmbedding" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`,
      accountIdIdx: index("emailEmbedding_accountId_idx").on(table.accountId),
      userIdIdx: index("emailEmbedding_userId_idx").on(table.userId),
      emailIdIdx: index("emailEmbedding_emailId_idx").on(table.emailId),
    };
  },
);
