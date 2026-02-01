import type { PainPoint } from "./TPainPoint";

export interface SessionHistorySlot {
  id: string;
  sessionId: string;
  painPoints: PainPoint[];
  notes: string | null;
  userMessage: string | null;
  index: number;
  createdAt: Date;
}

export interface NewSessionHistorySlot {
  sessionId: string;
  painPoints: PainPoint[];
  notes?: string;
  userMessage?: string;
  index: number;
}