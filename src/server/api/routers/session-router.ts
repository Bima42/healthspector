import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { painTypeEnum } from "@/server/db/schema";
import { SessionService } from "@/server/services/session-service";
import { PainPointService } from "@/server/services/pain-point-service";

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
      return await PainPointService.add({
        sessionId: input.sessionId,
        position: input.position,
        label: input.label,
        type: input.type,
        notes: input.notes,
        rating: input.rating,
      });
    }),

  updatePainPoint: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        label: z.string().optional(),
        type: painTypeSchema.optional(),
        notes: z.string().optional(),
        rating: z.number().int().min(0).max(10).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await PainPointService.update(id, data);
    }),

  deletePainPoint: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await PainPointService.delete(input.id);
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