import type { TransitDataset } from '../data/contract';

export type Bounds = [west: number, south: number, east: number, north: number];

/** Bounds of documented stop coordinates only, never inferred roadway geometry. */
export function boundsForStops(
  dataset: Pick<TransitDataset, 'stops'>,
  stopIds: string[],
): Bounds | null {
  const wanted = new Set(stopIds);
  const coords = dataset.stops
    .filter((stop) => wanted.has(stop.id))
    .filter((stop) =>
      Number.isFinite(stop.longitude) && stop.longitude >= -180 && stop.longitude <= 180 &&
      Number.isFinite(stop.latitude) && stop.latitude >= -90 && stop.latitude <= 90,
    );
  if (coords.length === 0) return null;

  const longs = coords.map((stop) => stop.longitude);
  const lats = coords.map((stop) => stop.latitude);
  const west = Math.min(...longs);
  const east = Math.max(...longs);
  const south = Math.min(...lats);
  const north = Math.max(...lats);

  // Prevent degenerate bounds for single-stop or aligned-stop selections.
  const marginX = Math.max((east - west) * 0.1, 0.0015);
  const marginY = Math.max((north - south) * 0.1, 0.0015);
  return [
    Math.max(-180, west - marginX),
    Math.max(-90, south - marginY),
    Math.min(180, east + marginX),
    Math.min(90, north + marginY),
  ];
}
