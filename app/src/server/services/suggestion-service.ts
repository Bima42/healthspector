import { db } from "../db";
import { suggestions } from "../db/schema";
import { eq, asc } from "drizzle-orm";

export const SuggestionService = {
  async replaceAll(
    sessionId: string,
    newSuggestions: Array<{ title: string; description: string }>
  ) {
    await db.delete(suggestions).where(eq(suggestions.sessionId, sessionId));

    if (newSuggestions.length === 0) {
      return [];
    }

    const inserted = await db
      .insert(suggestions)
      .values(
        newSuggestions.map((suggestion, index) => ({
          sessionId,
          title: suggestion.title,
          description: suggestion.description,
          index,
        }))
      )
      .returning();

    return inserted;
  },

  async getBySessionId(sessionId: string) {
    return await db.query.suggestions.findMany({
      where: eq(suggestions.sessionId, sessionId),
      orderBy: asc(suggestions.index),
    });
  },

  async deleteAll(sessionId: string) {
    await db.delete(suggestions).where(eq(suggestions.sessionId, sessionId));
  },
};