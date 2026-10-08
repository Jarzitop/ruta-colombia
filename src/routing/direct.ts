import type { Route, RoutePattern, TransitDataset } from '../data/contract';

/** Search only documented, same-city, single-pattern direct journeys.
 * No time, fare, walking, or route geometry is inferred.
 */
export interface DirectQuery {
  cityId: string;
  originStopId: string;
  destinationStopId: string;
}

export interface DirectItinerary {
  kind: 'direct';
  routeId: string;
  routeName: string;
  routeCode?: string;
  patternId: string;
  directionId: string;
  headsign?: string;
  boardingStopId: string;
  alightingStopId: string;
  /** Includes boarding and alighting stops, in actual pattern order. */
  stopIds: string[];
  transfers: 0;
  /** No *inter-stop* pedestrian transfer is required by a direct service. */
  transferWalkingMeters: 0;
  sourceRefIds: string[];
}

export type DirectSearchResult =
  | { status: 'ok'; itineraries: DirectItinerary[] }
  | { status: 'not-covered'; reason: 'city' | 'origin' | 'destination' | 'cross-city'; itineraries: [] }
  | { status: 'same-stop'; itineraries: [] }
  | { status: 'invalid-data'; reason: 'invalid-pattern'; itineraries: [] }
  | { status: 'no-direct-service'; itineraries: [] };

function isValidPattern(pattern: RoutePattern, route: Route | undefined, dataset: TransitDataset): boolean {
  if (!route || route.cityId !== pattern.cityId || !pattern.directionId ||
      !Array.isArray(pattern.stops) || pattern.stops.length < 2) return false;

  let previousSequence = -Infinity;
  const usedStops = new Set<string>();
  for (const entry of pattern.stops) {
    const stop = dataset.stops.find((candidate) => candidate.id === entry.stopId);
    if (!stop || stop.cityId !== pattern.cityId || usedStops.has(entry.stopId) ||
        !Number.isInteger(entry.sequence) || entry.sequence <= previousSequence ||
        typeof entry.boardingAllowed !== 'boolean' ||
        typeof entry.alightingAllowed !== 'boolean') return false;
    usedStops.add(entry.stopId);
    previousSequence = entry.sequence;
  }
  return true;
}

export function findDirectItineraries(dataset: TransitDataset, query: DirectQuery): DirectSearchResult {
  if (!dataset.cities.some((city) => city.id === query.cityId)) {
    return { status: 'not-covered', reason: 'city', itineraries: [] };
  }

  const origin = dataset.stops.find((stop) => stop.id === query.originStopId);
  const destination = dataset.stops.find((stop) => stop.id === query.destinationStopId);
  if (!origin) return { status: 'not-covered', reason: 'origin', itineraries: [] };
  if (!destination) return { status: 'not-covered', reason: 'destination', itineraries: [] };
  if (origin.cityId !== query.cityId || destination.cityId !== query.cityId) {
    return { status: 'not-covered', reason: 'cross-city', itineraries: [] };
  }
  if (origin.id === destination.id) return { status: 'same-stop', itineraries: [] };

  const candidates = dataset.patterns.filter((pattern) => pattern.cityId === query.cityId);
  const routes = new Map(dataset.routes.map((route) => [route.id, route]));
  // Fail closed: a malformed pattern in the selected city's catalog can never generate an itinerary.
  if (candidates.some((pattern) => !isValidPattern(pattern, routes.get(pattern.routeId), dataset))) {
    return { status: 'invalid-data', reason: 'invalid-pattern', itineraries: [] };
  }

  const itineraries: DirectItinerary[] = [];
  for (const pattern of candidates) {
    const route = routes.get(pattern.routeId);
    if (!route) continue; // Defensive; rejected by isValidPattern above.

    const boardIndex = pattern.stops.findIndex((entry) =>
      entry.stopId === origin.id && entry.boardingAllowed,
    );
    const alightIndex = pattern.stops.findIndex((entry) =>
      entry.stopId === destination.id && entry.alightingAllowed,
    );
    if (boardIndex < 0 || alightIndex <= boardIndex) continue;

    itineraries.push({
      kind: 'direct',
      routeId: route.id,
      routeName: route.name,
      ...(route.publicCode ? { routeCode: route.publicCode } : {}),
      patternId: pattern.id,
      directionId: pattern.directionId,
      ...(pattern.headsign ? { headsign: pattern.headsign } : {}),
      boardingStopId: origin.id,
      alightingStopId: destination.id,
      stopIds: pattern.stops.slice(boardIndex, alightIndex + 1).map((entry) => entry.stopId),
      transfers: 0,
      transferWalkingMeters: 0,
      sourceRefIds: [...new Set([...pattern.sourceRefIds, ...route.sourceRefIds])],
    });
  }

  // Equal rank: 0 transfers and 0 documented transfer-walking meters.
  // Stable identifiers ensure deterministic display; they DO NOT imply speed or quality.
  itineraries.sort((a, b) =>
    a.routeId.localeCompare(b.routeId) || a.patternId.localeCompare(b.patternId),
  );
  return itineraries.length > 0
    ? { status: 'ok', itineraries }
    : { status: 'no-direct-service', itineraries: [] };
}
