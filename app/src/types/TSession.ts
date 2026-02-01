/**
 * Session Types
 * 
 * Represents a pain mapping session
 */

import type { PainPoint } from './TPainPoint';

export interface Session {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionWithPainPoints extends Session {
  painPoints: PainPoint[];
}

export interface NewSession {
  title?: string;
}

export interface SessionUpdate {
  title?: string;
}