import { createStore } from 'zustand/vanilla';
import type { SessionWithPainPoints } from '@/types/TSession';
import type { PainPoint, PainPointUpdate } from '@/types/TPainPoint';
import type { SessionHistorySlot } from '@/types/TSessionHistory';

export interface SessionStoreState {
  session: SessionWithPainPoints | null;
  isLoading: boolean;
  selectedPinId: string | null;
  
  historySlots: SessionHistorySlot[];
  
  setSession: (session: SessionWithPainPoints) => void;
  setLoading: (isLoading: boolean) => void;
  
  addPainPoint: (point: PainPoint) => void;
  updatePainPoint: (id: string, updates: PainPointUpdate) => void;
  removePainPoint: (id: string) => void;
  
  selectPin: (id: string | null) => void;
  clearSelection: () => void;
  
  setHistory: (slots: SessionHistorySlot[]) => void;
  addHistorySlot: (slot: SessionHistorySlot) => void;
  
  reset: () => void;
}

export const sessionStore = createStore<SessionStoreState>()((set) => ({
  session: null,
  isLoading: false,
  selectedPinId: null,
  historySlots: [],

  setSession: (session: SessionWithPainPoints) => {
    set({ 
      session,
      isLoading: false 
    });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

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
        selectedPinId: state.selectedPinId === id ? null : state.selectedPinId,
      };
    });
  },

  selectPin: (id: string | null) => {
    set({ selectedPinId: id });
  },

  clearSelection: () => {
    set({ selectedPinId: null });
  },

  setHistory: (slots: SessionHistorySlot[]) => {
    set({ historySlots: slots });
  },

  addHistorySlot: (slot: SessionHistorySlot) => {
    set((state) => ({
      historySlots: [...state.historySlots, slot],
    }));
  },

  reset: () => {
    set({
      session: null,
      isLoading: false,
      selectedPinId: null,
      historySlots: [],
    });
  },
}));