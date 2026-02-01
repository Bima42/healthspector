import { pgTable, uuid, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sessions } from "./sessions";
import type { PainPoint } from "./pain-points";

export const sessionHistory = pgTable("session_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => sessions.id, { onDelete: "cascade" })
    .notNull(),
  painPoints: jsonb("pain_points").$type<PainPoint[]>().notNull(),
  notes: text("notes"),
  userMessage: text("user_message"),
  index: integer("index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionHistoryRelations = relations(sessionHistory, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionHistory.sessionId],
    references: [sessions.id],
  }),
}));

export type SessionHistorySlot = typeof sessionHistory.$inferSelect;
export type NewSessionHistorySlot = typeof sessionHistory.$inferInsert;