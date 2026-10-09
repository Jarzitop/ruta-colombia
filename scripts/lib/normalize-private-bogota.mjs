/**
 * Convert audited, private GTFS temporal patterns into static stop catalog
 * patterns without inventing geometry, connections or permitted stops.
 * Contains no real GTFS data itself and is safe to keep in a public repo.
 */
export function normalizePrivateBogota(dataset, temporal) {
  const errors = [];
  if (!dataset || !temporal || dataset.publishable !== false ||
      temporal.publishable !== false) {
    errors.push('Both input files must remain nonpublishable');
  }
  if (dataset?.datasetVersion !== temporal?.catalogDatasetVersion) {
    errors.push('GTFS and temporal dataset versions differ');
  }
  if (temporal?.timezone !== 'America/Bogota') {
    errors.push('Unexpected GTFS timezone; verify before integrating');
  }
  if (!Array.isArray(dataset?.cities) || dataset.cities.length !== 1 ||
      dataset.cities[0]?.id !== 'bogota') {
    errors.push('Expected audited Bogotá city only');
  }
  if (!Array.isArray(dataset?.patterns) || !Array.isArray(temporal?.patterns) ||
      !Array.isArray(temporal?.trips) || temporal.patterns.length < 2) {
    errors.push('Audited pattern and trip collections missing');
  }
  if (errors.length) return { errors, dataset: null, temporal: null };

  const sourceRefs = new Set(dataset.sourceRefs.map((item) => item.id));
  const cities = new Set(dataset.cities.map((city) => city.id));
  const routes = new Map(dataset.routes.map((route) => [route.id, route]));
  const stops = new Map(dataset.stops.map((stop) => [stop.id, stop]));
  const basePatterns = new Map(dataset.patterns.map((pattern) => [pattern.id, pattern]));
  const seenIds = new Set();
  const converted = [];

  for (const pattern of temporal.patterns) {
    if (!pattern?.id || seenIds.has(pattern.id) || !routes.has(pattern.routeId) ||
        !Array.isArray(pattern.stops) || pattern.stops.length < 2 ||
        !pattern.sourceRefIds?.every((id) => sourceRefs.has(id))) {
      errors.push('Missing/duplicate variant, route or source reference');
      continue;
    }
    seenIds.add(pattern.id);
    const base = basePatterns.get(pattern.id);
    const validStops = pattern.stops.every((entry, index) =>
      entry?.stopId && stops.has(entry.stopId) &&
      stops.get(entry.stopId)?.cityId === 'bogota' &&
      entry.sequence === index + 1 &&
      typeof entry.boardingAllowed === 'boolean' &&
      typeof entry.alightingAllowed === 'boolean');
    if (!validStops) {
      errors.push('Invalid stop or boarding permissions in variant ' + pattern.id);
      continue;
    }
    // Geometry only if this exact ordered sequence is documented in the
    // static source catalog. Never share the full polyline with short trips.
    const exactSequence = base?.stops?.length === pattern.stops.length &&
      base.stops.every((s, i) =>
        s.stopId === pattern.stops[i].stopId &&
        s.sequence === pattern.stops[i].sequence &&
        s.boardingAllowed === pattern.stops[i].boardingAllowed &&
        s.alightingAllowed === pattern.stops[i].alightingAllowed);
    if (base && !exactSequence) {
      errors.push('Original GTFS pattern conflicts with temporary variant: ' + pattern.id);
      continue;
    }
    converted.push({
      id: pattern.id,
      cityId: 'bogota',
      routeId: pattern.routeId,
      directionId: pattern.directionId,
      // Headsign is not documented for all GTFS trips; do not invent.
      ...(base?.headsign ? { headsign: base.headsign } : {}),
      stops: pattern.stops.map((s) => ({
        stopId: s.stopId, sequence: s.sequence,
        boardingAllowed: s.boardingAllowed, alightingAllowed: s.alightingAllowed,
      })),
      ...(exactSequence && base?.geometry ? { geometry: base.geometry } : {}),
      sourceRefIds: pattern.sourceRefIds,
    });
  }

  const convertedMap = new Map(converted.map((p) => [p.id, p]));
  for (const trip of temporal.trips) {
    const pattern = convertedMap.get(trip.patternId);
    if (!pattern || trip.stopTimes?.length !== pattern.stops.length ||
        trip.stopTimes.some((call, index) =>
          call.stopId !== pattern.stops[index].stopId ||
          call.sequence !== pattern.stops[index].sequence)) {
      errors.push('Trip is inconsistent with its documented variant');
      break;
    }
  }
  if (converted.length !== temporal.patterns.length || converted.length < 2) {
    errors.push('Not every temporal variant was normalized');
  }
  if (errors.length) return { errors, dataset: null, temporal: null };
  return {
    errors: [],
    dataset: {
      ...dataset, publishable: false,
      label: 'DATOS REALES EN REVISIÓN — SOLO ENSAYO INTERNO',
      patterns: converted,
    },
    temporal: { ...temporal, publishable: false },
  };
}
