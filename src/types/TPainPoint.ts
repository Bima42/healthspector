/**
 * Pain Point Types
 * 
 * Represents a pain point marked on the 3D body model
 */

export const PAIN_TYPES = [
    "sharp",
    "dull",
    "burning",
    "tingling",
    "throbbing",
    "cramping",
    "shooting",
    "other",
  ] as const;
  
  export type PainType = typeof PAIN_TYPES[number];
  
  export interface PainPoint {
    id: string;
    sessionId: string;
    
    // 3D position on the model
    posX: number;
    posY: number;
    posZ: number;
    
    // Pain details
    label: string;
    type: PainType;
    notes: string | null;
    rating: number; // 0-10 scale
    
    // Timestamps
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface NewPainPoint {
    sessionId: string;
    posX: number;
    posY: number;
    posZ: number;
    label?: string;
    type?: PainType;
    notes?: string;
    rating?: number;
  }
  
  export interface PainPointUpdate {
    label?: string;
    type?: PainType;
    notes?: string;
    rating?: number;
  }