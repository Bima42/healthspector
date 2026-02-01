import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { buildSessionPrompt } from "@/lib/llm/session-prompt-builder";
import { SESSION_SYSTEM_MESSAGE } from "@/lib/llm/session-prompt";
import { llmInvoke } from "@/lib/llm/llm";
import { sessionUpdateSchema, type SessionUpdate } from "@/types/TSessionUpdate";
import { SessionService } from "@/server/services/session-service";
import { PainPointService } from "@/server/services/pain-point-service";

const predefinedPainPointSchema = z.object({
  name: z.string(),
  position: z.tuple([z.number(), z.number(), z.number()]),
  label: z.string(),
  category: z.string(),
});

export const aiRouter = createTRPCRouter({
  processMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        userMessage: z.string().min(1),
        predefinedPoints: z.array(predefinedPainPointSchema),
      })
    )
    .mutation(async ({ input }) => {
      const session = await SessionService.getById(input.sessionId);

      if (!session) {
        throw new Error("Session not found");
      }

      const historySlots = await SessionService.getHistory(input.sessionId);

      const prompt = buildSessionPrompt(
        input.predefinedPoints,
        historySlots,
        input.userMessage
      );

      console.log("[AI] Prompt built successfully");

      const llmResponse = await llmInvoke<SessionUpdate>(
        prompt,
        sessionUpdateSchema,
        SESSION_SYSTEM_MESSAGE
      );

      console.log("[AI] Response received:", JSON.stringify(llmResponse, null, 2));

      if (llmResponse.painPoints !== undefined) {
        await PainPointService.deleteAll(input.sessionId);

        if (llmResponse.painPoints.length > 0) {
          const resolvedPoints = PainPointService.resolveMeshNames(
            llmResponse.painPoints,
            input.predefinedPoints,
            input.sessionId
          );

          await PainPointService.bulkInsert(resolvedPoints);
        }
      }

      const historySlot = await SessionService.createHistorySlot(
        input.sessionId,
        input.userMessage,
        llmResponse.notes ?? undefined
      );

      const updatedSession = await SessionService.getById(input.sessionId);

      return { session: updatedSession!, historySlot };
    }),
});