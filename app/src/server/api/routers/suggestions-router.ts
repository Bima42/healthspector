import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { SuggestionService } from "@/server/services/suggestion-service";
import { SessionService } from "@/server/services/session-service";
import { buildSuggestionsPrompt } from "@/lib/llm/suggestions-prompt-builder";
import { SUGGESTIONS_SYSTEM_MESSAGE } from "@/lib/llm/suggestions-prompt";
import { llmInvoke } from "@/lib/llm/llm";

const suggestionItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
});

const suggestionsResponseSchema = z.object({
  suggestions: z.array(suggestionItemSchema).max(4),
});

export const suggestionsRouter = createTRPCRouter({

  generate: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await SessionService.getById(input.sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const historySlots = await SessionService.getHistory(input.sessionId);

      const prompt = buildSuggestionsPrompt(session.painPoints, historySlots);

      console.log("[Suggestions] Generating for session:", input.sessionId);

      const llmResponse = await llmInvoke(
        prompt,
        suggestionsResponseSchema,
        SUGGESTIONS_SYSTEM_MESSAGE,
        "google/gemini-3-flash-preview"
      );

      console.log(
        `[Suggestions] LLM returned ${llmResponse.suggestions.length} suggestions`
      );

      const newSuggestions = await SuggestionService.replaceAll(
        input.sessionId,
        llmResponse.suggestions
      );

      return newSuggestions;
    }),

  getBySessionId: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      return await SuggestionService.getBySessionId(input.sessionId);
    }),
});