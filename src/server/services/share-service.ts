import { db } from "@/server/db";
import { shares } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const ShareService = {
  async createShare(sessionId: string) {
    const token = crypto.randomBytes(16).toString("base64url"); // URL-safe token
    
    const [share] = await db
      .insert(shares)
      .values({ sessionId, token })
      .returning();
    
    return share!;
  },

  async getSessionByToken(token: string) {
    const share = await db.query.shares.findFirst({
      where: eq(shares.token, token),
      with: {
        session: {
          with: {
            painPoints: true,
          },
        },
      },
    });

    return share?.session ?? null;
  },
};