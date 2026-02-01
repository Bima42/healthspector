import { db } from "@/server/db";
import { sessions, sessionHistory, painPoints } from "@/server/db/schema";
import { eq, asc } from "drizzle-orm";

export const SessionService = {
  async create(title?: string) {
    const [session] = await db
      .insert(sessions)
      .values({ title: title || "Nouvelle session" })
      .returning();
    return session!;
  },

  async getById(id: string) {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, id),
      with: {
        painPoints: true,
      },
    });
    return session;
  },

  async createHistorySlot(sessionId: string, userMessage: string, notes?: string) {
    const currentPainPoints = await db.query.painPoints.findMany({
      where: eq(painPoints.sessionId, sessionId),
    });

    const existingSlots = await db.query.sessionHistory.findMany({
      where: eq(sessionHistory.sessionId, sessionId),
    });

    const [slot] = await db
      .insert(sessionHistory)
      .values({
        sessionId,
        painPoints: currentPainPoints,
        notes: notes ?? null,
        userMessage,
        index: existingSlots.length,
      })
      .returning();

    return slot!;
  },

  async getHistory(sessionId: string) {
    return await db.query.sessionHistory.findMany({
      where: eq(sessionHistory.sessionId, sessionId),
      orderBy: asc(sessionHistory.index),
    });
  },
};