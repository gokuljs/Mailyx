import { pgTable, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// Define enums based on Prisma schema
export const subscriptionStatusEnum = pgEnum("SubscriptionStatus", [
  "ACTIVE",
  "PAUSED",
  "CANCELLED",
  "EXPIRED",
  "PAST_DUE",
]);

export type SubscriptionStatus =
  (typeof subscriptionStatusEnum.enumValues)[number];

export const subscriptions = pgTable("Subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .unique()
    .notNull()
    .references(() => users.id),
  paddleSubscriptionId: text("paddleSubscriptionId").unique().notNull(),
  customerID: text("customerID").notNull(),
  addressId: text("addressId").notNull(),
  businessId: text("businessId"),
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true })
    .$onUpdate(() => new Date())
    .notNull(),
  startedAt: timestamp("startedAt", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  endedAt: timestamp("endedAt", { mode: "date", withTimezone: true }),
  nextBilledAt: timestamp("nextBilledAt", {
    mode: "date",
    withTimezone: true,
  }),
  pausedAt: timestamp("pausedAt", { mode: "date", withTimezone: true }),
  canceledAt: timestamp("canceledAt", { mode: "date", withTimezone: true }),
  status: subscriptionStatusEnum("status").notNull(),
  billingInterval: text("billingInterval").notNull(),
  billingFrequency: integer("billingFrequency").notNull(),
  planId: text("planId").notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));
