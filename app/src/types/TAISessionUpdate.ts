import { z } from "zod";
import { painTypeEnum } from "../server/db/schema";

export const painPointUpdateSchema = z.object({
  meshName: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(painTypeEnum.enumValues),
  notes: z.string().optional(),
  rating: z.number().int().min(0).max(10),
});

export const sessionUpdateSchema = z.object({
  notes: z.string().optional(),
  painPoints: z.array(painPointUpdateSchema).optional(),
});

export type PainPointUpdate = z.infer<typeof painPointUpdateSchema>;
export type SessionUpdate = z.infer<typeof sessionUpdateSchema>;