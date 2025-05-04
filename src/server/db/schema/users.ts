import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { accounts } from "./accounts";
import { relations } from "drizzle-orm";
import { subscriptions } from "./subscriptions";

export const users = pgTable("User", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()), // cuid() equivalent
  emailAddress: text("emailAddress").unique().notNull(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  imageUrl: text("imageUrl"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
}));
