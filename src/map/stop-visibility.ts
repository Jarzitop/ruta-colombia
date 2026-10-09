import type { Stop } from '../data/contract';

/**
 * A selected dated trip renders only its documented stops. Without a
 * selection the map may show the full catalog, not a recommended itinerary.
 */
export function visibleStopsForTrip<T extends Pick<Stop, 'id'>>(
  stops: T[], highlightedStopIds: string[] | null,
): T[] {
  if (highlightedStopIds === null) return stops;
  const selected = new Set(highlightedStopIds);
  return stops.filter((stop) => selected.has(stop.id));
}
