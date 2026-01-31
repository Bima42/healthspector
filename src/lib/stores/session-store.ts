import { create } from "zustand";

export interface PainPin {
  id: string;
  position: [number, number, number];
  label: string;
  notes?: string;
}

interface SessionStore {
  selectedPinId: string | null;

  selectPin: (id: string | null) => void;
  clearSelection: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  selectedPinId: null,

  selectPin: (id) => set({ selectedPinId: id }),
  clearSelection: () => set({ selectedPinId: null }),
}));
