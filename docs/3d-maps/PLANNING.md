# Planning: 3D Google Maps Hackathon Implementation

## Situation Overview

**Stack:** Next.js 15 + Tailwind V3 + tRPC + Drizzle (existing boilerplate)

**Challenge:** Google's 3D Maps (`Map3DElement` / `gmp-map-3d`) is relatively new (beta). The popular React wrapper (`@vis.gl/react-google-maps`) primarily supports the 2D `Map` component. We need to bridge this gap.

---

## Problem & Constraints

| Constraint                                | Impact                                                   |
| ----------------------------------------- | -------------------------------------------------------- |
| 3D Maps is in **beta** (`v=beta`)         | Fewer examples, potential API changes                    |
| `@vis.gl/react-google-maps` focuses on 2D | No direct `<Map3D>` component—we need custom integration |
| Hackathon timeline                        | Must balance "clean" vs "working fast"                   |

---

## Chosen Approach

### Strategy: Hybrid Integration

Use `@vis.gl/react-google-maps` for **API loading** (`APIProvider`), but create a **custom 3D map component** that wraps the native `Map3DElement`.

**Why this approach:**

- `APIProvider` handles API key, loading state, and library management cleanly
- We get the 3D features without fighting against a 2D-focused abstraction
- Keeps React patterns (refs, effects, state) for interaction

---

## Implementation Breakdown

### 1. Dependencies

```bash
npm install @vis.gl/react-google-maps
```

### 2. Component Architecture

```
src/
├── components/
│   └── map/
│       ├── Map3DProvider.tsx    # Wraps APIProvider with our config
│       ├── Map3D.tsx            # Custom 3D map using Map3DElement
│       ├── Map3DMarker.tsx      # Marker component for 3D (TBD approach)
│       └── hooks/
│           └── useMap3D.ts      # Hook to access map instance
├── server/
│   ├── api/routers/
│   │   └── locations-router.ts  # tRPC endpoint for mock positions
│   └── services/
│       └── locations.ts         # Mock data generator
└── types/
    └── map.ts                   # Position, Marker types
```

### 3. API Loading (via vis.gl)

```tsx
// Map3DProvider.tsx
import { APIProvider } from "@vis.gl/react-google-maps";

export const Map3DProvider = ({ children }) => (
  <APIProvider
    apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}
    version="beta"
    libraries={["maps3d"]}
  >
    {children}
  </APIProvider>
);
```

### 4. 3D Map Component (Custom)

Key insight from docs: `Map3DElement` is a class, `gmp-map-3d` is the web component.

```tsx
// Map3D.tsx - Core pattern
"use client";

import { useEffect, useRef } from "react";
import { useApiIsLoaded } from "@vis.gl/react-google-maps";

export const Map3D = ({ center, tilt = 67.5, heading = 0, range = 1000 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.maps3d.Map3DElement | null>(null);
  const apiIsLoaded = useApiIsLoaded();

  useEffect(() => {
    if (!apiIsLoaded || !containerRef.current || mapRef.current) return;

    const init = async () => {
      const { Map3DElement } = await google.maps.importLibrary("maps3d");

      const map = new Map3DElement({
        center: { ...center, altitude: center.altitude ?? 0 },
        tilt,
        heading,
        range,
        mode: "HYBRID", // or 'SATELLITE'
      });

      containerRef.current.appendChild(map);
      mapRef.current = map;
    };

    init();
  }, [apiIsLoaded]);

  return <div ref={containerRef} className="w-full h-full" />;
};
```

### 5. Markers in 3D Maps

**Research needed:** 3D Maps marker support differs from 2D. Options:

- `Marker3DElement` (if available in beta)
- `Polygon3DElement` for custom shapes
- Overlay approach with CSS positioning (fallback)

Pattern to explore:

```tsx
// From docs - 3D uses different marker system
const { Marker3DElement } = await google.maps.importLibrary("maps3d");
```

### 6. Mock Locations API (tRPC)

```ts
// types/map.ts
export interface MapPosition {
  id: string;
  lat: number;
  lng: number;
  altitude?: number;
  label?: string;
  type?: "poi" | "user" | "event";
}

// server/services/locations.ts
export const locationService = {
  getMockLocations: (): MapPosition[] => [
    { id: "1", lat: 37.7749, lng: -122.4194, label: "SF Downtown" },
    { id: "2", lat: 37.8199, lng: -122.4783, label: "Golden Gate" },
    // ... more mock data
  ],
};

// server/api/routers/locations-router.ts
export const locationsRouter = router({
  getAll: publicProcedure.query(() => {
    return locationService.getMockLocations();
  }),
});
```

### 7. Page Integration

```tsx
// app/(app)/map/page.tsx
import { Map3DProvider } from "@/components/map/Map3DProvider";
import { Map3D } from "@/components/map/Map3D";
import { api } from "@/lib/trpc";

export default async function MapPage() {
  const locations = await api.locations.getAll();

  return (
    <Map3DProvider>
      <div className="h-screen w-full">
        <Map3D
          center={{ lat: 37.7749, lng: -122.4194, altitude: 500 }}
          tilt={60}
          range={2000}
        />
        {/* Markers rendered here or passed as children */}
      </div>
    </Map3DProvider>
  );
}
```

---

## Key Parameters Reference (3D Maps)

| Param     | Type                        | Description                           |
| --------- | --------------------------- | ------------------------------------- |
| `center`  | `{lat, lng, altitude}`      | Camera look-at point                  |
| `range`   | `number`                    | Distance from center (meters)         |
| `tilt`    | `number`                    | Camera angle (0=top-down, 90=horizon) |
| `heading` | `number`                    | Compass direction (0=North)           |
| `mode`    | `'HYBRID'` \| `'SATELLITE'` | Map rendering style                   |

---

## Performance Notes

- **Lazy load** the map component (Next.js `dynamic` with `ssr: false`)
- 3D rendering is GPU-intensive—test on target devices
- Consider `range` limits to avoid loading too much terrain

---

## Open Questions / To Verify

1. **3D Marker API** — Confirm `Marker3DElement` availability and syntax
2. **Click events** — How to handle map/marker clicks in 3D context
3. **Camera animation** — `flyTo` or similar for smooth transitions

---

## Execution Order

1. ✅ Set up `APIProvider` wrapper with 3D libraries
2. ✅ Create basic `Map3D` component rendering the map
3. 🔲 Add mock tRPC endpoint for locations
4. 🔲 Implement marker rendering on 3D map
5. 🔲 Add interaction (click marker → info panel or camera move)
6. 🔲 Polish: loading states, responsive container, error handling

---

**Ready to execute.** Want me to start with the Map3D component implementation?
