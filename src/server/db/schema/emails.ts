import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { threads } from "./threads";
import { emailAddresses } from "./emailAddresses";
import { emailAttachments } from "./emailAttachments";

// Define enums based on Prisma schema
export const sensitivityEnum = pgEnum("Sensitivity", [
  "normal",
  "private",
  "personal",
  "confidential",
]);
export type Sensitivity = (typeof sensitivityEnum.enumValues)[number];

export const meetingMessageMethodEnum = pgEnum("MeetingMessageMethod", [
  "request",
  "reply",
  "cancel",
  "counter",
  "other",
]);
export type MeetingMessageMethod =
  (typeof meetingMessageMethodEnum.enumValues)[number];

export const emailLabelEnum = pgEnum("EmailLabel", ["inbox", "sent", "draft"]);
export type EmailLabel = (typeof emailLabelEnum.enumValues)[number];

export const emails = pgTable(
  "Email",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    threadId: text("threadId")
      .notNull()
      .references(() => threads.id),
    createdTime: timestamp("createdTime", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    lastModifiedTime: timestamp("lastModifiedTime", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    sentAt: timestamp("sentAt", { mode: "date", withTimezone: true }).notNull(),
    receivedAt: timestamp("receivedAt", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    internetMessageId: text("internetMessageId").notNull(),
    subject: text("subject").notNull(),
    sysLabels: text("sysLabels").array().notNull(), // Map String[] to text[]
    keywords: text("keywords").array().notNull(), // Map String[] to text[]
    sysClassifications: text("sysClassifications").array().notNull(), // Map String[] to text[]
    sensitivity: sensitivityEnum("sensitivity").default("normal").notNull(),
    meetingMessageMethod: meetingMessageMethodEnum("meetingMessageMethod"),
    fromId: text("fromId")
      .notNull()
      .references(() => emailAddresses.id),
    hasAttachments: boolean("hasAttachments").notNull(),
    body: text("body"),
    bodySnippet: text("bodySnippet"),
    inReplyTo: text("inReplyTo"),
    references: text("references"),
    threadIndex: text("threadIndex"),
    internetHeaders: jsonb("internetHeaders").array().notNull(), // Map Json[] to jsonb[]
    nativeProperties: jsonb("nativeProperties"), // Map Json? to jsonb?
    folderId: text("folderId"),
    omitted: text("omitted").array().notNull(), // Map String[] to text[]
    emailLabel: emailLabelEnum("emailLabel").default("inbox").notNull(),
  },
  (table) => {
    return {
      threadIdIdx: index("Email_threadId_idx").on(table.threadId),
      emailLabelIdx: index("Email_emailLabel_idx").on(table.emailLabel),
      sentAtIdx: index("Email_sentAt_idx").on(table.sentAt),
      fromIdIdx: index("Email_fromId_idx").on(table.fromId), // Added index for FK
    };
  },
);

// Junction table for Email <-> EmailAddress (To)
export const emailsToEmailAddressesTo = pgTable(
  "_ToEmails",
  {
    emailId: text("A")
      .notNull()
      .references(() => emails.id),
    emailAddressId: text("B")
      .notNull()
      .references(() => emailAddresses.id),
  },
  (t) => ({ pk: index("_ToEmails_AB_unique").on(t.emailId, t.emailAddressId) }),
);

// Junction table for Email <-> EmailAddress (Cc)
export const emailsToEmailAddressesCc = pgTable(
  "_CcEmails",
  {
    emailId: text("A")
      .notNull()
      .references(() => emails.id),
    emailAddressId: text("B")
      .notNull()
      .references(() => emailAddresses.id),
  },
  (t) => ({ pk: index("_CcEmails_AB_unique").on(t.emailId, t.emailAddressId) }),
);

// Junction table for Email <-> EmailAddress (Bcc)
export const emailsToEmailAddressesBcc = pgTable(
  "_BccEmails",
  {
    emailId: text("A")
      .notNull()
      .references(() => emails.id),
    emailAddressId: text("B")
      .notNull()
      .references(() => emailAddresses.id),
  },
  (t) => ({
    pk: index("_BccEmails_AB_unique").on(t.emailId, t.emailAddressId),
  }),
);

// Junction table for Email <-> EmailAddress (ReplyTo)
export const emailsToEmailAddressesReplyTo = pgTable(
  "_ReplyToEmails",
  {
    emailId: text("A")
      .notNull()
      .references(() => emails.id),
    emailAddressId: text("B")
      .notNull()
      .references(() => emailAddresses.id),
  },
  (t) => ({
    pk: index("_ReplyToEmails_AB_unique").on(t.emailId, t.emailAddressId),
  }),
);

export const emailsRelations = relations(emails, ({ one, many }) => ({
  thread: one(threads, {
    fields: [emails.threadId],
    references: [threads.id],
  }),
  from: one(emailAddresses, {
    fields: [emails.fromId],
    references: [emailAddresses.id],
    relationName: "FromEmail",
  }),
  attachments: many(emailAttachments),

  // Many-to-many relations via junction tables
  to: many(emailsToEmailAddressesTo),
  cc: many(emailsToEmailAddressesCc),
  bcc: many(emailsToEmailAddressesBcc),
  replyTo: many(emailsToEmailAddressesReplyTo),
}));

// Relations for the junction tables
export const emailsToEmailAddressesToRelations = relations(
  emailsToEmailAddressesTo,
  ({ one }) => ({
    email: one(emails, {
      fields: [emailsToEmailAddressesTo.emailId],
      references: [emails.id],
    }),
    emailAddress: one(emailAddresses, {
      fields: [emailsToEmailAddressesTo.emailAddressId],
      references: [emailAddresses.id],
    }),
  }),
);

export const emailsToEmailAddressesCcRelations = relations(
  emailsToEmailAddressesCc,
  ({ one }) => ({
    email: one(emails, {
      fields: [emailsToEmailAddressesCc.emailId],
      references: [emails.id],
    }),
    emailAddress: one(emailAddresses, {
      fields: [emailsToEmailAddressesCc.emailAddressId],
      references: [emailAddresses.id],
    }),
  }),
);

export const emailsToEmailAddressesBccRelations = relations(
  emailsToEmailAddressesBcc,
  ({ one }) => ({
    email: one(emails, {
      fields: [emailsToEmailAddressesBcc.emailId],
      references: [emails.id],
    }),
    emailAddress: one(emailAddresses, {
      fields: [emailsToEmailAddressesBcc.emailAddressId],
      references: [emailAddresses.id],
    }),
  }),
);

export const emailsToEmailAddressesReplyToRelations = relations(
  emailsToEmailAddressesReplyTo,
  ({ one }) => ({
    email: one(emails, {
      fields: [emailsToEmailAddressesReplyTo.emailId],
      references: [emails.id],
    }),
    emailAddress: one(emailAddresses, {
      fields: [emailsToEmailAddressesReplyTo.emailAddressId],
      references: [emailAddresses.id],
    }),
  }),
);
