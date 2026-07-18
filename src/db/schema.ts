import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("group_members_group_id_idx").on(table.groupId),
    index("group_members_user_id_idx").on(table.userId),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("messages_group_id_idx").on(table.groupId),
    index("messages_created_at_idx").on(table.createdAt),
  ]
);

export const typingIndicators = pgTable(
  "typing_indicators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isTyping: boolean("is_typing").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("typing_indicators_group_id_idx").on(table.groupId),
    index("typing_indicators_user_id_idx").on(table.userId),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(groupMembers),
  messages: many(messages),
  typingIndicators: many(typingIndicators),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  messages: many(messages),
  typingIndicators: many(typingIndicators),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [messages.groupId],
    references: [groups.id],
  }),
}));

export const typingIndicatorsRelations = relations(typingIndicators, ({ one }) => ({
  user: one(users, {
    fields: [typingIndicators.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [typingIndicators.groupId],
    references: [groups.id],
  }),
}));

