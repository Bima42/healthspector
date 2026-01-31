import { MapPosition } from "@/server/types/maps";

/**
 * Mock locations centered around San Francisco for demo purposes.
 * In production, this would fetch from database or external API.
 */
const MOCK_LOCATIONS: MapPosition[] = [
  {
    id: "1",
    lat: 37.7749,
    lng: -122.4194,
    altitude: 0,
    label: "SF Downtown",
    type: "poi",
  },
  {
    id: "2",
    lat: 37.8199,
    lng: -122.4783,
    altitude: 0,
    label: "Golden Gate Bridge",
    type: "poi",
  },
  {
    id: "3",
    lat: 37.8024,
    lng: -122.4058,
    altitude: 0,
    label: "Fisherman's Wharf",
    type: "event",
  },
  {
    id: "4",
    lat: 37.7694,
    lng: -122.4862,
    altitude: 0,
    label: "Golden Gate Park",
    type: "poi",
  },
  {
    id: "5",
    lat: 37.7956,
    lng: -122.3933,
    altitude: 0,
    label: "Ferry Building",
    type: "event",
  },
  {
    id: "6",
    lat: 37.8083,
    lng: -122.4156,
    altitude: 0,
    label: "Ghirardelli Square",
    type: "user",
  },
];

export const locationsService = {
  getAll(): MapPosition[] {
    return MOCK_LOCATIONS;
  },

  getById(id: string): MapPosition | undefined {
    return MOCK_LOCATIONS.find((loc) => loc.id === id);
  },

  getByType(type: MapPosition["type"]): MapPosition[] {
    return MOCK_LOCATIONS.filter((loc) => loc.type === type);
  },
};