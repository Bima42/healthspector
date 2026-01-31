"use client";

import { env } from "@/config/env";
import { APIProvider } from "@vis.gl/react-google-maps";
import { type ReactNode } from "react";

interface Map3DProviderProps {
  children: ReactNode;
}

/**
 * Provides Google Maps API context configured for 3D maps.
 * Uses vis.gl's APIProvider for clean API loading management.
 * 
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_KEY environment variable.
 */
export function Map3DProvider({ children }: Map3DProviderProps) {
  const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  return (
    <APIProvider
      apiKey={apiKey}
      version="beta"
    >
      {children}
    </APIProvider>
  );
}