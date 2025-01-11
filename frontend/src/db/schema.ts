import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  email: text("email").primaryKey(),
  username: text("username").unique(),
  credits: integer("credits").notNull().default(2),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export const storiesTable = sqliteTable("stories", {
  id: text("id")
    .primaryKey()
    .default(sql`(uuid())`),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.email, { onDelete: "cascade" }),
  title: text("title"),
  description: text("description"),
  timestamp: integer("timestamp").notNull().default(Date.now()),
  image: text("image"),
  public: integer("public").notNull().default(0),
  status: text("status", { enum: ["PROCESSING", "GENERATED", "ERROR"] })
    .notNull()
    .default("PROCESSING"),
  errorMessage: text("error_message"),
});

export type InsertStory = typeof storiesTable.$inferInsert;
export type SelectStory = typeof storiesTable.$inferSelect;

export const storyChoicesTable = sqliteTable("story_choices", {
  id: text("id")
    .primaryKey()
    .default(sql`(uuid())`),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.email, { onDelete: "cascade" }),
  storyId: text("story_id")
    .notNull()
    .references(() => storiesTable.id, { onDelete: "cascade" }),
  parentId: text("parent_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  isTerminal: integer("is_terminal").notNull().default(0),
  explored: integer("explored").notNull().default(0),
});

export type InsertStoryChoice = typeof storyChoicesTable.$inferInsert;
export type SelectStoryChoice = typeof storyChoicesTable.$inferSelect;
