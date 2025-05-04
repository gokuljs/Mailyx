import { pgTable, text, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { emails } from "./emails";

export const emailAttachments = pgTable(
  "EmailAttachment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    mimeType: text("mimeType").notNull(),
    size: integer("size").notNull(),
    inline: boolean("inline").notNull(),
    contentId: text("contentId"),
    content: text("content"),
    contentLocation: text("contentLocation"),
    emailId: text("emailId")
      .notNull()
      .references(() => emails.id),
  },
  (table) => {
    return {
      emailIdIdx: index("EmailAttachment_emailId_idx").on(table.emailId),
    };
  },
);

export const emailAttachmentsRelations = relations(
  emailAttachments,
  ({ one }) => ({
    email: one(emails, {
      fields: [emailAttachments.emailId],
      references: [emails.id],
    }),
  }),
);
