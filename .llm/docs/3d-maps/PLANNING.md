# Execution Planning: 3D Map with Markers & Location Features

## Current State

We have a **working 3D map implementation** using Google's Maps 3D Element (beta):

- ✅ Map3D component rendering in `/map` page
- ✅ Map3DProvider with Google Maps API loaded (beta version)
- ✅ Camera controls: center, tilt, heading, range, mode
- ✅ Type definitions for MapPosition (id, lat, lng, altitude, label, type)
- ✅ Basic tRPC router/service structure for locations (getAll, getById, getByType)
- ✅ Lazy loading with SSR disabled for client-only 3D rendering

**Current center:** San Francisco (37.7749, -122.4194, altitude 500)

---

## Why We're Building This

The original TECHNICAL-APPROACH.md focused on AI-powered review analysis—**that's not our current scope**.

We're building a **3D map exploration tool** with these core capabilities:

1. Visual markers/pins on the 3D map
2. Display sample locations (simulating API results)
3. Show user's current location

This is foundational work before adding any discovery/search features.

---

## How We're Going to Execute

### Feature 1: Mark/Pin in 3D Maps

**Goal:** Add ability to display markers on the 3D map.

**Approach:** Use `Marker3DElement` from Google Maps 3D API (see `marker-add.md` docs).

**Key Implementation Details:**

```typescript
// Programmatic marker creation (from docs)
const marker = new Marker3DElement({
  position: { lat: 47.6093, lng: -122.3402 }, // Required
  altitudeMode: "ABSOLUTE", // Optional: default is CLAMP_TO_GROUND
  extruded: true, // Optional: draws line from ground to marker
  label: "Basic Marker", // Optional
});

map.append(marker); // Must append to map instance
```

**Files to modify:**

1. **`src/components/map/Map3D.tsx`**
   - Add `markers` prop: `MapPosition[]`
   - Store marker instances in a ref: `markersRef.useRef<Marker3DElement[]>([])`
   - Create function `addMarker(position: MapPosition)`
   - Effect to sync markers when prop changes
   - Cleanup markers on unmount

2. **`src/server/types/Map.ts`**
   - Already has `MapPosition` type ✅
   - May need to add `Marker3DElement` to global declarations

3. **`src/app/map/page.tsx`**
   - Pass test markers to Map3D component
   - Example: `[{ id: "1", lat: 37.7749, lng: -122.4194, label: "Test Pin" }]`

**Pattern to implement:**

```typescript
// In Map3D.tsx
useEffect(() => {
  if (!mapRef.current || !markers) return;

  // Clear existing markers
  markersRef.current.forEach((m) => m.remove());
  markersRef.current = [];

  // Add new markers
  markers.forEach(async (pos) => {
    const { Marker3DElement } = await google.maps.importLibrary("maps3d");
    const marker = new Marker3DElement({
      position: { lat: pos.lat, lng: pos.lng, altitude: pos.altitude ?? 0 },
      label: pos.label,
      altitudeMode: "CLAMP_TO_GROUND",
    });
    mapRef.current.append(marker);
    markersRef.current.push(marker);
  });
}, [markers]);
```

---

### Feature 2: Fake Google Places API Call (1-3 Locations)

**Goal:** Simulate fetching locations and display them as markers.

**Approach:**

- Create mock locations data
- Use existing tRPC `locationsRouter`
- Fetch on page load and pass to Map3D

**Mock Data Strategy:**

Create 2-3 interesting SF locations as test data:

```typescript
// Example locations to mock
const MOCK_LOCATIONS = [
  {
    id: "poi-1",
    lat: 37.8199,
    lng: -122.4783,
    altitude: 0,
    label: "Golden Gate Bridge",
    type: "poi" as const,
  },
  {
    id: "poi-2",
    lat: 37.7749,
    lng: -122.4194,
    altitude: 0,
    label: "Downtown SF",
    type: "poi" as const,
  },
];
```

**Files to modify:**

1. **`src/server/services/locations.ts`** (create if doesn't exist)
   - Implement `getAll()` to return mock locations
   - Later can be replaced with real Google Places API

2. **`src/app/map/page.tsx`**
   - Use tRPC to fetch: `const { data: locations } = api.locations.getAll.useQuery()`
   - Pass locations to Map3D as markers prop
   - Show loading state while fetching

**Pattern:**

```typescript
// In page.tsx
export default function MapPage() {
  const { data: locations, isLoading } = api.locations.getAll.useQuery();

  if (isLoading) return <LoadingSpinner />;

  return (
    <Map3DProvider>
      <Map3D
        center={DEFAULT_CENTER}
        markers={locations ?? []}
        // ... other props
      />
    </Map3DProvider>
  );
}
```

---

### Feature 3: Display Current Location

**Goal:** Show user's current position on the map.

**Approach:** Use browser Geolocation API + special marker styling for user location.

**Implementation:**

1. **Get user location:**

   ```typescript
   // Use browser API
   navigator.geolocation.getCurrentPosition(
     (position) => {
       const { latitude, longitude } = position.coords;
       setUserLocation({ lat: latitude, lng: longitude });
     },
     (error) => console.error("Location error:", error),
   );
   ```

2. **Display as distinct marker:**
   - Different color/style than POI markers
   - Could use `type: "user"` from MapPosition schema
   - Optionally re-center map on user location

**Files to modify:**

1. **`src/app/map/page.tsx`**
   - Add state: `const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)`
   - useEffect to get geolocation on mount
   - Combine user location with fetched locations
   - Optional: center map on user location when available

2. **`src/components/map/Map3D.tsx`**
   - Differentiate marker styling based on `type` field
   - User markers could have different label/color

**Pattern:**

```typescript
// In page.tsx
const [userLocation, setUserLocation] = useState<MapPosition | null>(null);

useEffect(() => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({
        id: "user-location",
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        label: "You are here",
        type: "user"
      });
    });
  }
}, []);

const allMarkers = [
  ...(locations ?? []),
  ...(userLocation ? [userLocation] : [])
];

return <Map3D markers={allMarkers} center={userLocation ?? DEFAULT_CENTER} />;
```

---

## Key References from Docs

### Adding Markers (`marker-add.md`)

**HTML approach:**

```html
<gmp-map-3d center="48.861000,2.335861">
  <gmp-marker-3d position="48.861000,2.335861"></gmp-marker-3d>
</gmp-map-3d>
```

**Programmatic approach** (what we'll use):

```typescript
const { Marker3DElement } = await google.maps.importLibrary("maps3d");
const marker = new Marker3DElement({
  position: { lat, lng },
  altitudeMode: "ABSOLUTE" | "CLAMP_TO_GROUND",
  extruded: true,
  label: "Label",
});
map.append(marker);
```

### Camera Controls (`vector-rotation.md`)

Already implemented in Map3D.tsx:

- `tilt`, `heading`, `range` props
- Can use `map.moveCamera()` to update multiple properties at once
- Useful if we want to auto-rotate/tilt when showing locations

### Place Search Example (`pin-from-place-search.md`)

**Not implementing yet**, but shows pattern for future:

```typescript
service.findPlaceFromQuery(
  { query: "Museum", fields: ["name", "geometry"] },
  (results, status) => {
    if (status === OK) {
      results.forEach((place) => createMarker(place));
    }
  },
);
```

This would replace our mock `locationsService` later.

---

## Type Definitions Already Available

From `src/server/types/Map.ts`:

```typescript
// Already defined ✅
export const mapPositionSchema = z.object({
  id: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  altitude: z.number().optional().default(0),
  label: z.string().optional(),
  type: z.enum(["poi", "user", "event"]).optional().default("poi"),
});

export type MapPosition = z.infer<typeof mapPositionSchema>;
```

**Need to add:** `Marker3DElement` type declarations (may already be in global namespace extension at bottom of file).

---

## Implementation Order

1. **Feature 1 first** - Get basic marker rendering working
   - Modify Map3D.tsx to accept and render markers
   - Test with hardcoded markers in page.tsx
   - Verify markers appear correctly in 3D space

2. **Feature 2 second** - Mock API integration
   - Create/update locations service with mock data
   - Fetch via tRPC in page.tsx
   - Display fetched locations as markers

3. **Feature 3 last** - User location
   - Add geolocation logic
   - Combine with other markers
   - Optional: auto-center on user

---

## Questions/Decisions

1. **Marker styling:** Should we use different visual styles for `poi` vs `user` vs `event` types?
   - Recommendation: Start simple (all same), refine later

2. **Error handling:** What if geolocation is denied/fails?
   - Show error message? Silently skip user marker?
   - Recommendation: Log error, continue without user location

3. **Map centering:** When user location loads, should map re-center?
   - Recommendation: Yes, smooth transition to user location if available

4. **Altitude mode:** `CLAMP_TO_GROUND` vs `ABSOLUTE`?
   - Recommendation: `CLAMP_TO_GROUND` for simplicity unless we need elevation data

---

## Success Criteria

- [ ] Map displays multiple markers at different coordinates
- [ ] Markers have visible labels
- [ ] tRPC endpoint returns 2-3 mock locations
- [ ] Page fetches and displays these locations
- [ ] User's current location appears as a marker (if permission granted)
- [ ] Map remains interactive (tilt, rotate, zoom still work)
- [ ] No console errors
- [ ] Markers are cleaned up properly on unmount/update
