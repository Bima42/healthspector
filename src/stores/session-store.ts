import { createStore } from 'zustand/vanilla';
import type { SessionWithPainPoints } from '@/types/TSession';
import type { PainPoint, PainPointUpdate } from '@/types/TPainPoint';

/**
 * Session Store State Interface
 */
export interface SessionStoreState {
  // Session data
  session: SessionWithPainPoints | null;
  isLoading: boolean;
  
  // UI state
  selectedPinId: string | null;
  
  // Actions - Session
  setSession: (session: SessionWithPainPoints) => void;
  setLoading: (isLoading: boolean) => void;
  
  // Actions - Pain Points
  addPainPoint: (point: PainPoint) => void;
  updatePainPoint: (id: string, updates: PainPointUpdate) => void;
  removePainPoint: (id: string) => void;
  
  // Actions - UI
  selectPin: (id: string | null) => void;
  clearSelection: () => void;
  
  // Actions - Reset
  reset: () => void;
}

/**
 * Session Store
 * 
 * Centralized state management for pain mapping sessions
 */
export const sessionStore = createStore<SessionStoreState>()((set) => ({
  // Initial state
  session: null,
  isLoading: false,
  selectedPinId: null,

  // Session actions
  setSession: (session: SessionWithPainPoints) => {
    set({ 
      session,
      isLoading: false 
    });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  // Pain points actions
  addPainPoint: (point: PainPoint) => {
    set((state) => {
      if (!state.session) return {};
      
      return {
        session: {
          ...state.session,
          painPoints: [...state.session.painPoints, point],
        },
      };
    });
  },

  updatePainPoint: (id: string, updates: PainPointUpdate) => {
    set((state) => {
      if (!state.session) return {};
      
      return {
        session: {
          ...state.session,
          painPoints: state.session.painPoints.map((point) =>
            point.id === id 
              ? { ...point, ...updates, updatedAt: new Date() }
              : point
          ),
        },
      };
    });
  },

  removePainPoint: (id: string) => {
    set((state) => {
      if (!state.session) return {};
      
      return {
        session: {
          ...state.session,
          painPoints: state.session.painPoints.filter((point) => point.id !== id),
        },
        // Clear selection if the removed point was selected
        selectedPinId: state.selectedPinId === id ? null : state.selectedPinId,
      };
    });
  },

  // UI actions
  selectPin: (id: string | null) => {
    set({ selectedPinId: id });
  },

  clearSelection: () => {
    set({ selectedPinId: null });
  },

  // Reset
  reset: () => {
    set({
      session: null,
      isLoading: false,
      selectedPinId: null,
    });
  },
}));