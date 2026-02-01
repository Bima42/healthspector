import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { sessions, painPoints, sessionHistory } from "@/server/db/schema";
import { eq, asc } from "drizzle-orm";
import { buildSessionPrompt, SESSION_SYSTEM_MESSAGE } from "@/lib/llm/session-prompt";
import { llmInvoke } from "@/lib/llm/llm";
import { aiSessionUpdateSchema, type AIPainPoint, type AISessionUpdate } from "@/types/TAISessionUpdate";
import type { PredefinedPainPoint } from "@/types/TPainPoint";

const predefinedPainPointSchema = z.object({
  name: z.string(),
  position: z.tuple([z.number(), z.number(), z.number()]),
  label: z.string(),
  category: z.string(),
});

function resolveMeshNames(
  aiPoints: AIPainPoint[],
  predefinedPoints: PredefinedPainPoint[],
  sessionId: string
) {
  return aiPoints.map((point) => {
    const predefined = predefinedPoints.find((p) => p.name === point.meshName);
    if (!predefined) {
      throw new Error(`Mesh "${point.meshName}" not found in predefined points`);
    }

    return {
      sessionId,
      posX: predefined.position[0],
      posY: predefined.position[1],
      posZ: predefined.position[2],
      label: point.label,
      type: point.type,
      notes: point.notes ?? null,
      rating: point.rating,
    };
  });
}

export const aiRouter = createTRPCRouter({
  processMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        userMessage: z.string().min(1),
        predefinedPoints: z.array(predefinedPainPointSchema),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.query.sessions.findFirst({
        where: eq(sessions.id, input.sessionId),
        with: {
          painPoints: true,
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      const historySlots = await ctx.db.query.sessionHistory.findMany({
        where: eq(sessionHistory.sessionId, input.sessionId),
        orderBy: asc(sessionHistory.index),
      });

      const prompt = buildSessionPrompt(
        input.predefinedPoints,
        historySlots,
        input.userMessage
      );

      console.log("[AI] Input:\n", prompt);

      const aiResponse = await llmInvoke<AISessionUpdate>(
        prompt,
        aiSessionUpdateSchema,
        SESSION_SYSTEM_MESSAGE
      );

      console.log("[AI] Output:", JSON.stringify(aiResponse, null, 2));

      if (aiResponse.painPoints !== undefined) {
        await ctx.db.delete(painPoints).where(eq(painPoints.sessionId, input.sessionId));

        if (aiResponse.painPoints.length > 0) {
          const resolvedPoints = resolveMeshNames(
            aiResponse.painPoints,
            input.predefinedPoints,
            input.sessionId
          );

          await ctx.db.insert(painPoints).values(resolvedPoints);
        }
      }

      const currentPainPoints = await ctx.db.query.painPoints.findMany({
        where: eq(painPoints.sessionId, input.sessionId),
      });

      const [historySlot] = await ctx.db
        .insert(sessionHistory)
        .values({
          sessionId: input.sessionId,
          painPoints: currentPainPoints,
          notes: aiResponse.notes ?? null,
          userMessage: input.userMessage,
          index: historySlots.length,
        })
        .returning();

      const updatedSession = await ctx.db.query.sessions.findFirst({
        where: eq(sessions.id, input.sessionId),
        with: {
          painPoints: true,
        },
      });

      return { session: updatedSession!, historySlot };
    }),
});