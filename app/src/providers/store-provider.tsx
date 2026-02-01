'use client';

import { createContext, useContext, useRef, type ReactNode } from 'react';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand';
import { sessionStore, type SessionStoreState } from '../stores/session-store';

/**
 * Store Context Interface
 */
interface StoreContextValue {
  sessionStore: StoreApi<SessionStoreState>;
}

/**
 * Store Context
 */
const StoreContext = createContext<StoreContextValue | null>(null);

/**
 * Store Provider Component
 * 
 * Provides access to all Zustand stores via React Context
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<StoreContextValue>({
    sessionStore,
  });

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

/**
 * Session Store Hook
 * 
 * Access the session store with a selector
 * 
 * @example
 * const session = useSessionStore((state) => state.session);
 * const addPainPoint = useSessionStore((state) => state.addPainPoint);
 */
export function useSessionStore<T>(
  selector: (state: SessionStoreState) => T
): T {
  const store = useContext(StoreContext);
  
  if (!store) {
    throw new Error('useSessionStore must be used within a StoreProvider');
  }
  
  return useStore(store.sessionStore, selector);
}