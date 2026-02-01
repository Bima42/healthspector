import { db } from "../db";
import { painPoints, type PainType } from "../db/schema";
import { eq, isNotNull, isNull, and } from "drizzle-orm";
import type { PainPointUpdate } from "@/types/TSessionUpdate";
import type { PredefinedPainPoint } from "@/types/TPainPoint";

export const PainPointService = {
  async add(data: {
    sessionId: string;
    position: { x: number; y: number; z: number };
    label?: string;
    type?: PainType;
    notes?: string;
    rating?: number;
    meshName?: string; // null for user-placed
  }) {
    const [point] = await db
      .insert(painPoints)
      .values({
        sessionId: data.sessionId,
        posX: data.position.x,
        posY: data.position.y,
        posZ: data.position.z,
        meshName: data.meshName ?? null,
        label: data.label ?? "",
        type: data.type ?? "other",
        notes: data.notes,
        rating: data.rating ?? 5,
      })
      .returning();
    return point!;
  },

  async update(
    id: string,
    data: {
      label?: string;
      type?: PainType;
      notes?: string;
      rating?: number;
    }
  ) {
    const [updated] = await db
      .update(painPoints)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(painPoints.id, id))
      .returning();
    return updated!;
  },

  async delete(id: string) {
    await db.delete(painPoints).where(eq(painPoints.id, id));
    return { success: true };
  },

  /**
   * Delete only AI-placed points (meshName is not null)
   */
  async deleteAIPoints(sessionId: string) {
    await db
      .delete(painPoints)
      .where(
        and(
          eq(painPoints.sessionId, sessionId),
          isNotNull(painPoints.meshName)
        )
      );
  },

  /**
   * Delete only user-placed points (meshName is null)
   */
  async deleteUserPoints(sessionId: string) {
    await db
      .delete(painPoints)
      .where(
        and(
          eq(painPoints.sessionId, sessionId),
          isNull(painPoints.meshName)
        )
      );
  },

  /**
   * Delete all points (both user and AI)
   */
  async deleteAll(sessionId: string) {
    await db.delete(painPoints).where(eq(painPoints.sessionId, sessionId));
  },

  async bulkInsert(
    points: Array<{
      sessionId: string;
      posX: number;
      posY: number;
      posZ: number;
      meshName: string;
      label: string;
      type: PainType;
      notes: string | null;
      rating: number;
    }>
  ) {
    if (points.length === 0) return;
    await db.insert(painPoints).values(points);
  },

  async getBySessionId(sessionId: string) {
    return await db.query.painPoints.findMany({
      where: eq(painPoints.sessionId, sessionId),
    });
  },

  /**
   * Resolve mesh names to coordinates for AI-placed points
   */
  resolveMeshNames(
    aiPoints: PainPointUpdate[],
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
        meshName: point.meshName || "",
        label: point.label,
        type: point.type,
        notes: point.notes ?? null,
        rating: point.rating,
      };
    });
  },
};