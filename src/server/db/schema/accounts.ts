import { pgTable, text, json, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { threads } from "./threads";
import { emailAddresses } from "./emailAddresses";

export const accounts = pgTable(
  "Account",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id),
    emailAddress: text("emailAddress").notNull(),
    accessToken: text("accessToken").unique().notNull(),
    name: text("name").notNull(),
    oramaIndex: json("oramaIndex"), // Assuming Prisma Json maps to Drizzle json
    nextDeltaToken: text("nextDeltaToken"),
  },
  (table) => {
    return {
      userIdx: index("Account_userId_idx").on(table.userId),
    };
  },
);

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  threads: many(threads),
  emailAddresses: many(emailAddresses),
}));
