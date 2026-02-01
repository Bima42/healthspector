import { createStore } from 'zustand/vanilla';
import type { SessionWithPainPoints } from '../types/TSession';
import type { PainPoint } from '../types/TPainPoint';
import type { PainPointUpdate } from "@/types/TSessionUpdate";
import type { SessionHistorySlot } from '../types/TSessionHistory';
import type { PredefinedPainPoint } from "../types/TPainPoint";
import type { Suggestion } from "../types/TSuggestion";

export interface SessionStoreState {
  session: SessionWithPainPoints | null;
  isLoading: boolean;
  selectedPinId: string | null;
  
  historySlots: SessionHistorySlot[];
  
  predefinedPainPoints: PredefinedPainPoint[];
  predefinedPainPointsLoaded: boolean;
  
  suggestions: Suggestion[];
  suggestionsLoading: boolean;
  
  setSession: (session: SessionWithPainPoints) => void;
  setLoading: (isLoading: boolean) => void;
  
  addPainPoint: (point: PainPoint) => void;
  updatePainPoint: (id: string, updates: PainPointUpdate) => void;
  removePainPoint: (id: string) => void;
  
  selectPin: (id: string | null) => void;
  clearSelection: () => void;
  
  setHistory: (slots: SessionHistorySlot[]) => void;
  addHistorySlot: (slot: SessionHistorySlot) => void;
  
  setPredefinedPainPoints: (points: PredefinedPainPoint[]) => void;
  getPredefinedPainPoint: (name: string) => PredefinedPainPoint | undefined;
  
  setSuggestions: (suggestions: Suggestion[]) => void;
  setSuggestionsLoading: (loading: boolean) => void;
  clearSuggestions: () => void;
  
  reset: () => void;
}

export const sessionStore = createStore<SessionStoreState>()((set, get) => ({
  session: null,
  isLoading: false,
  selectedPinId: null,
  historySlots: [],
  predefinedPainPoints: [],
  predefinedPainPointsLoaded: false,
  suggestions: [],
  suggestionsLoading: false,

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

  setPredefinedPainPoints: (points: PredefinedPainPoint[]) => {
    set({ predefinedPainPoints: points, predefinedPainPointsLoaded: true });
  },

  getPredefinedPainPoint: (name: string) => {
    return get().predefinedPainPoints.find(p => p.name === name);
  },

  setSuggestions: (suggestions: Suggestion[]) => {
    set({ suggestions, suggestionsLoading: false });
  },

  setSuggestionsLoading: (loading: boolean) => {
    set({ suggestionsLoading: loading });
  },

  clearSuggestions: () => {
    set({ suggestions: [] });
  },

  reset: () => {
    set({
      session: null,
      isLoading: false,
      selectedPinId: null,
      historySlots: [],
      predefinedPainPoints: [],
      predefinedPainPointsLoaded: false,
      suggestions: [],
      suggestionsLoading: false,
    });
  },
}));