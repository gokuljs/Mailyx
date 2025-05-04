import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const contactMessages = pgTable("ContactMessage", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fromEmail: varchar("fromEmail", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).default("No subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
    .$onUpdate(() => new Date())
    .notNull(),
});
