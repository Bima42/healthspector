import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "@/server/api/trpc";
import { locationsService } from "@/server/services/locations";

export const locationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return locationsService.getAll();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return locationsService.getById(input.id);
    }),

  getByType: publicProcedure
    .input(z.object({ type: z.enum(["poi", "user", "event"]) }))
    .query(({ input }) => {
      return locationsService.getByType(input.type);
    }),
});