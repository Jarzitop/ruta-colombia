import {
  resolveGtfsServiceDay,
  type GtfsCalendarRow,
  type GtfsCalendarDateRow,
} from './calendar.ts';

export interface ScheduledStop {
  stopId: string;
  sequence: number;
  boardingAllowed: boolean;
  alightingAllowed: boolean;
}

export interface ScheduledPattern {
  id: string;
  routeId: string;
  directionId: string;
  stops: ScheduledStop[];
}

export interface ScheduledStopTime {
  stopId: string;
  sequence: number;
  arrivalTime: string;
  departureTime: string;
  arrivalSeconds: number;
  departureSeconds: number;
  timepoint: number;
}

export interface ScheduledTrip {
  tripId: string;
  serviceId: string;
  patternId: string;
  stopTimes: ScheduledStopTime[];
  sourceRefIds: string[];
}

export interface ScheduledCatalog {
  auditSchemaVersion: string;
  catalogDatasetVersion: string;
  timezone: string;
  scope: string;
  feedInfo: {
    feed_start_date: string;
    feed_end_date: string;
  };
  calendar: GtfsCalendarRow[];
  calendarDates: GtfsCalendarDateRow[];
  patterns: ScheduledPattern[];
  trips: ScheduledTrip[];
}

export interface ScheduledQuery {
  /** GTFS service date in the feed's timezone; never the phone's timezone. */
  serviceDate: string; // YYYYMMDD
  originStopId: string;
  destinationStopId: string;
  /** Optional GTFS scheduled departure threshold at boarding stop. No "now" inference. */
  departureAtOrAfter?: string; // HH:MM:SS, can exceed 24:00:00
}

export interface ScheduledCandidate {
  tripId: string;
  serviceId: string;
  patternId: string;
  routeId: string;
  directionId: string;
  stopIds: string[];
  boardingStopId: string;
  alightingStopId: string;
  /** GTFS values: scheduled, never live predictions. */
  scheduledBoardDeparture: string;
  scheduledAlightArrival: string;
  boardingDepartureSeconds: number;
  /** GTFS timepoint=0 means the displayed time is approximate/interpolated. */
  boardingTimeApproximate: boolean;
  alightingTimeApproximate: boolean;
  sourceRefIds: string[];
}

export type ScheduledResult =
  | {
      status: 'ok';
      candidates: ScheduledCandidate[];
      timezone: string;
      timing: 'scheduled-not-realtime';
      scope: 'provided-catalog';
    }
  | {
      status:
        | 'invalid-query'
        | 'invalid-data'
        | 'same-stop'
        | 'not-covered'
        | 'date-outside-feed'
        | 'calendar-unknown'
        | 'no-scheduled-trip-in-sample';
      candidates: [];
      scope: 'provided-catalog';
    };

const TIME_PATTERN = /^(\d{1,3}):([0-5]\d):([0-5]\d)$/;
function gtfsSeconds(raw: string): number | null {
  const match = TIME_PATTERN.exec(raw);
  if (!match) return null;
  const seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  return Number.isSafeInteger(seconds) ? seconds : null;
}

function serviceDateIsValid(value: string): boolean {
  if (!/^\d{8}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

/** Fail-closed structural check; does not validate licensing or ground truth. */
export function validateScheduledCatalog(catalog: ScheduledCatalog): string[] {
  const errors: string[] = [];
  if (catalog?.auditSchemaVersion !== '1.0.0' ||
      !catalog.catalogDatasetVersion ||
      !catalog.timezone ||
      typeof catalog.scope !== 'string' || catalog.scope.trim().length === 0) {
    // The pilot's scope is retained as a descriptive string, not a complete-city claim.
    errors.push('metadata, version, timezone or scope invalid');
  }
  if (!catalog?.feedInfo ||
      !serviceDateIsValid(catalog.feedInfo.feed_start_date) ||
      !serviceDateIsValid(catalog.feedInfo.feed_end_date) ||
      catalog.feedInfo.feed_start_date > catalog.feedInfo.feed_end_date) {
    errors.push('invalid feed date boundaries');
  }
  if (!Array.isArray(catalog?.calendar) || !Array.isArray(catalog?.calendarDates) ||
      !Array.isArray(catalog?.patterns) || !Array.isArray(catalog?.trips)) {
    errors.push('required GTFS collections missing');
    return errors;
  }

  const patterns = new Map<string, ScheduledPattern>();
  for (const pattern of catalog.patterns) {
    if (!pattern?.id || !pattern.routeId || !pattern.directionId ||
        patterns.has(pattern.id) || !Array.isArray(pattern.stops) || pattern.stops.length < 2) {
      errors.push('pattern missing, duplicated or malformed');
      continue;
    }
    patterns.set(pattern.id, pattern);
    let prior = -Infinity;
    const used = new Set<string>();
    for (const stop of pattern.stops) {
      if (!stop?.stopId || used.has(stop.stopId) ||
          !Number.isInteger(stop.sequence) || stop.sequence <= prior ||
          typeof stop.boardingAllowed !== 'boolean' ||
          typeof stop.alightingAllowed !== 'boolean') {
        errors.push('invalid stop sequence or permissions in pattern');
        break;
      }
      prior = stop.sequence;
      used.add(stop.stopId);
    }
  }

  const exceptions = new Set<string>();
  for (const entry of catalog.calendarDates) {
    const key = entry?.service_id + '/' + entry?.date;
    if (exceptions.has(key) || !entry?.service_id ||
        !serviceDateIsValid(entry.date) ||
        !['1', '2'].includes(entry.exception_type)) {
      errors.push('duplicated or invalid calendar exception');
      break;
    }
    exceptions.add(key);
  }

  const tripIds = new Set<string>();
  for (const trip of catalog.trips) {
    if (!trip?.tripId || tripIds.has(trip.tripId) || !trip.serviceId ||
        !Array.isArray(trip.stopTimes) ||
        !Array.isArray(trip.sourceRefIds) || trip.sourceRefIds.length === 0) {
      errors.push('trip identifier, sources or stop times invalid');
      continue;
    }
    tripIds.add(trip.tripId);
    const pattern = patterns.get(trip.patternId);
    if (!pattern || trip.stopTimes.length !== pattern.stops.length) {
      errors.push('trip pattern missing or different stop count');
      continue;
    }
    let priorDeparture = -1;
    for (let i = 0; i < trip.stopTimes.length; i++) {
      const event = trip.stopTimes[i];
      const stop = pattern.stops[i];
      if (!event || !stop || event.stopId !== stop.stopId ||
          event.sequence !== stop.sequence ||
          ![0, 1].includes(event.timepoint) ||
          gtfsSeconds(event.arrivalTime) === null ||
          gtfsSeconds(event.departureTime) === null ||
          !Number.isSafeInteger(event.arrivalSeconds) ||
          !Number.isSafeInteger(event.departureSeconds) ||
          gtfsSeconds(event.arrivalTime) !== event.arrivalSeconds ||
          gtfsSeconds(event.departureTime) !== event.departureSeconds ||
          event.arrivalSeconds < priorDeparture ||
          event.departureSeconds < event.arrivalSeconds) {
        errors.push('trip stop event invalid or disagrees with pattern');
        break;
      }
      priorDeparture = event.departureSeconds;
    }
  }
  return errors;
}

/**
 * Find only trips explicitly represented by this feed and its calendar.
 * Does not assert real-world availability or a precise arrival time.
 */
export function findScheduledDirectTrips(
  catalog: ScheduledCatalog,
  query: ScheduledQuery,
): ScheduledResult {
  const empty = (status: Exclude<ScheduledResult['status'], 'ok'>): ScheduledResult =>
    ({ status, candidates: [], scope: 'provided-catalog' });

  if (!serviceDateIsValid(query.serviceDate) ||
      !query.originStopId || !query.destinationStopId ||
      (query.departureAtOrAfter !== undefined &&
       gtfsSeconds(query.departureAtOrAfter) === null)) return empty('invalid-query');
  if (validateScheduledCatalog(catalog).length) return empty('invalid-data');
  if (query.originStopId === query.destinationStopId) return empty('same-stop');
  if (query.serviceDate < catalog.feedInfo.feed_start_date ||
      query.serviceDate > catalog.feedInfo.feed_end_date) return empty('date-outside-feed');

  const stops = new Set(catalog.patterns.flatMap((pattern) =>
    pattern.stops.map((entry) => entry.stopId)));
  if (!stops.has(query.originStopId) || !stops.has(query.destinationStopId)) {
    return empty('not-covered');
  }

  const eligiblePatterns = new Map<string, { pattern: ScheduledPattern; board: number; alight: number }>();
  for (const pattern of catalog.patterns) {
    const board = pattern.stops.findIndex((stop) =>
      stop.stopId === query.originStopId && stop.boardingAllowed);
    const alight = pattern.stops.findIndex((stop) =>
      stop.stopId === query.destinationStopId && stop.alightingAllowed);
    if (board >= 0 && alight > board) eligiblePatterns.set(pattern.id, {pattern, board, alight});
  }
  if (!eligiblePatterns.size) return empty('no-scheduled-trip-in-sample');

  const after = query.departureAtOrAfter === undefined
    ? null : gtfsSeconds(query.departureAtOrAfter);
  const candidates: ScheduledCandidate[] = [];
  const serviceActivity = new Map<string, ReturnType<typeof resolveGtfsServiceDay>>();

  for (const trip of catalog.trips) {
    const choice = eligiblePatterns.get(trip.patternId);
    if (!choice) continue;
    let state = serviceActivity.get(trip.serviceId);
    if (!state) {
      state = resolveGtfsServiceDay(
        trip.serviceId, query.serviceDate, catalog.calendar, catalog.calendarDates);
      serviceActivity.set(trip.serviceId, state);
    }
    // Fail closed if any potentially relevant service has unknown calendar status.
    if (state === 'unknown') return empty('calendar-unknown');
    if (state !== 'active') continue;
    const boardTime = trip.stopTimes[choice.board];
    const alightTime = trip.stopTimes[choice.alight];
    if (!boardTime || !alightTime ||
        (after !== null && boardTime.departureSeconds < after)) continue;
    candidates.push({
      tripId: trip.tripId,
      serviceId: trip.serviceId,
      patternId: trip.patternId,
      routeId: choice.pattern.routeId,
      directionId: choice.pattern.directionId,
      stopIds: choice.pattern.stops.slice(choice.board, choice.alight + 1)
        .map((entry) => entry.stopId),
      boardingStopId: query.originStopId,
      alightingStopId: query.destinationStopId,
      scheduledBoardDeparture: boardTime.departureTime,
      scheduledAlightArrival: alightTime.arrivalTime,
      boardingDepartureSeconds: boardTime.departureSeconds,
      boardingTimeApproximate: boardTime.timepoint === 0,
      alightingTimeApproximate: alightTime.timepoint === 0,
      sourceRefIds: trip.sourceRefIds,
    });
  }

  candidates.sort((a, b) =>
    a.boardingDepartureSeconds - b.boardingDepartureSeconds ||
    a.tripId.localeCompare(b.tripId),
  );
  return candidates.length
    ? {
        status: 'ok',
        candidates,
        timezone: catalog.timezone,
        timing: 'scheduled-not-realtime',
        scope: 'provided-catalog',
      }
    : empty('no-scheduled-trip-in-sample');
}
