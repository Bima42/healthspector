import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { sessions, painPoints } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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
});
