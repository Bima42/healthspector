"use client";

import dynamic from "next/dynamic";
import { Map3DProvider } from "@/components/map/Map3DProvider";
import { api } from "@/lib/trpc/client";
import { MapPosition } from "@/server/types/Map";

/**
 * Lazy load Map3D component - 3D rendering is heavy and client-only.
 * SSR disabled because Map3DElement requires browser APIs.
 */
const Map3D = dynamic(
  () => import("@/components/map/Map3D").then((mod) => mod.Map3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-2 text-slate-600">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
          <span className="text-sm">Loading map component...</span>
        </div>
      </div>
    ),
  }
);

/**
 * San Francisco downtown as default center point
 */
const DEFAULT_CENTER = {
  lat: 37.7749,
  lng: -122.4194,
  altitude: 500,
};

export default function MapPage() {
  const { data: locations, isLoading, error } = api.locations.getAll.useQuery();
  const EMPTY_LOCATIONS: MapPosition[] = [];
  console.log("Fetched locations:", locations);

  // Loading state - show spinner while fetching locations
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
          <span className="text-sm font-medium">Loading locations...</span>
        </div>
      </div>
    );
  }

  // Error state - show user-friendly error message
  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3 text-red-600">
          <svg
            className="h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium">Failed to load locations</span>
          <span className="text-xs text-slate-500">{error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <Map3DProvider>
        <Map3D
          center={DEFAULT_CENTER}
          tilt={60}
          heading={45}
          range={3000}
          mode="HYBRID"
          markers={locations ?? EMPTY_LOCATIONS}
          className="h-full w-full"
        />
      </Map3DProvider>
    </div>
  );
}