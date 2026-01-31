"use client";

import dynamic from "next/dynamic";
import { Map3DProvider } from "@/components/map/Map3DProvider";

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
  return (
    <div className="h-screen w-full">
      <Map3DProvider>
        <Map3D
          center={DEFAULT_CENTER}
          tilt={60}
          heading={45}
          range={3000}
          mode="HYBRID"
          className="h-full w-full"
        />
      </Map3DProvider>
    </div>
  );
}