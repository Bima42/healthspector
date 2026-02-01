// import { z } from "zod";

// export const mapPositionSchema = z.object({
//   id: z.string(),
//   lat: z.number().min(-90).max(90),
//   lng: z.number().min(-180).max(180),
//   label: z.string().optional(),
//   type: z.enum(["poi", "user", "event"]).default("poi"),
// });

// export type MapPosition = z.infer<typeof mapPositionSchema>;
import { z } from "zod";

export const mapPositionSchema = z.object({
  id: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  altitude: z.number().default(0),
  label: z.string().optional(),
  type: z.enum(["poi", "user", "event"]).default("poi"),
});

export type MapPosition = z.infer<typeof mapPositionSchema>;

export interface Map3DCameraProps {
  center: google.maps.LatLngAltitudeLiteral;
  range: number;
  tilt: number;
  heading: number;
}