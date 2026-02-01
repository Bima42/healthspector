import { z } from "zod";
import { painTypeEnum } from "@/server/db/schema";

export const aiPainPointSchema = z.object({
  meshName: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(painTypeEnum.enumValues),
  notes: z.string().optional(),
  rating: z.number().int().min(0).max(10),
});

export const aiSessionUpdateSchema = z.object({
  notes: z.string().optional(),
  painPoints: z.array(aiPainPointSchema).optional(),
});

export type AIPainPoint = z.infer<typeof aiPainPointSchema>;
export type AISessionUpdate = z.infer<typeof aiSessionUpdateSchema>;