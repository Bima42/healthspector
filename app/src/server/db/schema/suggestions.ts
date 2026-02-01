import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sessions } from "./sessions";

export const suggestions = pgTable("suggestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => sessions.id, { onDelete: "cascade" })
    .notNull(),
  
  title: text("title").notNull(),
  
  description: text("description").notNull(),
  
  index: integer("index").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suggestionsRelations = relations(suggestions, ({ one }) => ({
  session: one(sessions, {
    fields: [suggestions.sessionId],
    references: [sessions.id],
  }),
}));

export type Suggestion = typeof suggestions.$inferSelect;
export type NewSuggestion = typeof suggestions.$inferInsert;