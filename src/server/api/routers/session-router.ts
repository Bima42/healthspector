import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { sessions, painPoints, painTypeEnum, sessionHistory } from "@/server/db/schema";
import { eq, asc } from "drizzle-orm";

const painTypeSchema = z.enum(painTypeEnum.enumValues);

export const sessionRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const [session] = await ctx.db
        .insert(sessions)
        .values({ title: input.title || "Nouvelle session" })
        .returning();
      return session;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.query.sessions.findFirst({
        where: eq(sessions.id, input.id),
        with: {
          painPoints: true,
        },
      });
      return session;
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [point] = await ctx.db
        .insert(painPoints)
        .values({
          sessionId: input.sessionId,
          posX: input.position.x,
          posY: input.position.y,
          posZ: input.position.z,
          label: input.label,
          type: input.type,
          notes: input.notes,
          rating: input.rating,
        })
        .returning();
      return point;
    }),

  updatePainPoint: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        label: z.string().optional(),
        type: painTypeSchema.optional(),
        notes: z.string().optional(),
        rating: z.number().int().min(0).max(10).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(painPoints)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(painPoints.id, id))
        .returning();
      return updated;
    }),

  deletePainPoint: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(painPoints).where(eq(painPoints.id, input.id));
      return { success: true };
    }),

  createHistorySlot: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        userMessage: z.string(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentPainPoints = await ctx.db.query.painPoints.findMany({
        where: eq(painPoints.sessionId, input.sessionId),
      });

      const existingSlots = await ctx.db.query.sessionHistory.findMany({
        where: eq(sessionHistory.sessionId, input.sessionId),
      });

      const [slot] = await ctx.db
        .insert(sessionHistory)
        .values({
          sessionId: input.sessionId,
          painPoints: currentPainPoints,
          notes: input.notes,
          userMessage: input.userMessage,
          index: existingSlots.length,
        })
        .returning();

      return slot;
    }),

  getHistory: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.sessionHistory.findMany({
        where: eq(sessionHistory.sessionId, input.sessionId),
        orderBy: asc(sessionHistory.index),
      });
    }),
});