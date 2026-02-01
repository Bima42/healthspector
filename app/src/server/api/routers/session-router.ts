import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { painTypeEnum } from "../../db/schema";
import { SessionService } from "../../services/session-service";
import { PainPointService } from "../../services/pain-point-service";
import { ShareService } from "../../services/share-service";

const painTypeSchema = z.enum(painTypeEnum.enumValues);

export const sessionRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ input }) => {
      return await SessionService.create(input.title);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      return await SessionService.getById(input.id);
    }),

  createShare: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await ShareService.createShare(input.sessionId);
    }),

  getByShareToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      return await ShareService.getSessionByToken(input.token);
    }),

  addPainPoint: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        position: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }),
        label: z.string().default(""),
        type: painTypeSchema.default("other"),
        notes: z.string().optional(),
        rating: z.number().int().min(0).max(10).default(5),
      })
    )
    .mutation(async ({ input }) => {
      const point = await PainPointService.add({
        sessionId: input.sessionId,
        position: input.position,
        label: input.label,
        type: input.type,
        notes: input.notes,
        rating: input.rating,
      });

      // Snapshot after user action
      await SessionService.createHistorySlot(
        input.sessionId,
        `[ACTION] Added pain point: ${input.label || "Unnamed"} (${input.type}, intensity: ${input.rating}/10)`
      );

      return point;
    }),

  updatePainPoint: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        sessionId: z.string().uuid(), // Added: need this for history
        label: z.string().optional(),
        type: painTypeSchema.optional(),
        notes: z.string().optional(),
        rating: z.number().int().min(0).max(10).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, sessionId, ...data } = input;
      const updated = await PainPointService.update(id, data);

      // Snapshot after user action
      await SessionService.createHistorySlot(
        sessionId,
        `[ACTION] Updated pain point: ${updated.label || "Unnamed"} (${updated.type}, intensity: ${updated.rating}/10)`
      );

      return updated;
    }),

  deletePainPoint: publicProcedure
    .input(z.object({ 
      id: z.string().uuid(),
      sessionId: z.string().uuid(), // Added: need this for history
    }))
    .mutation(async ({ input }) => {
      // Fetch before delete to get details for history
      const points = await PainPointService.getBySessionId(input.sessionId);
      const pointToDelete = points.find(p => p.id === input.id);
      
      await PainPointService.delete(input.id);

      // Snapshot after user action
      await SessionService.createHistorySlot(
        input.sessionId,
        `[ACTION] Deleted pain point: ${pointToDelete?.label || "Unnamed"}`
      );

      return { success: true };
    }),

  createHistorySlot: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        userMessage: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await SessionService.createHistorySlot(
        input.sessionId,
        input.userMessage,
        input.notes
      );
    }),

  getHistory: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await SessionService.getHistory(input.sessionId);
    }),
});