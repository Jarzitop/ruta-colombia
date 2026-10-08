import type { ScheduledCatalog, ScheduledPattern, ScheduledTrip } from '../../gtfs/scheduled';

// Datos inventados: ni los recorridos ni los horarios describen Bogotá.
const reference = ['src-dev-synthetic'];
const stops = ['dev-stop-a', 'dev-stop-b', 'dev-stop-c'];
const long: ScheduledPattern = {
  id: 'dev-pattern-1-outbound', routeId: 'dev-route-1', directionId: 'dev-outbound',
  stops: stops.map((stopId, i) => ({ stopId, sequence: i + 1,
    boardingAllowed: true, alightingAllowed: true })),
};
const short: ScheduledPattern = {
  ...long, id: 'dev-pattern-short-outbound', stops: long.stops.slice(0, 2),
};
const seconds = (value: string): number => {
  const parts = value.split(':').map(Number);
  return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
};
function trip(id: string, serviceId: string, pattern: ScheduledPattern, times: string[]): ScheduledTrip {
  if (pattern.stops.length !== times.length) throw new Error('Synthetic data mismatch');
  return {
    tripId: id, serviceId, patternId: pattern.id, sourceRefIds: reference,
    stopTimes: times.map((value, index) => {
      const stop = pattern.stops[index];
      if (!stop) throw new Error('Synthetic stop mismatch');
      return {
        stopId: stop.stopId, sequence: stop.sequence,
        arrivalTime: value, departureTime: value,
        arrivalSeconds: seconds(value), departureSeconds: seconds(value),
        timepoint: 0,
      };
    }),
  };
}
const weekday = {
  service_id: 'dev-weekdays', monday: '1', tuesday: '1', wednesday: '1',
  thursday: '1', friday: '1', saturday: '0', sunday: '0',
  start_date: '20261001', end_date: '20261031',
};
export const syntheticSchedule: ScheduledCatalog = {
  auditSchemaVersion: '1.0.0',
  catalogDatasetVersion: 'dev-synthetic-001',
  timezone: 'America/Bogota',
  scope: 'synthetic-test-only; no Colombian bus services represented',
  feedInfo: { feed_start_date: '20261001', feed_end_date: '20261031' },
  calendar: [
    weekday,
    { ...weekday, service_id: 'dev-holiday',
      monday: '0', tuesday: '0', wednesday: '0', thursday: '0',
      friday: '0', saturday: '0', sunday: '1' },
  ],
  calendarDates: [
    { service_id: 'dev-weekdays', date: '20261012', exception_type: '2' },
    { service_id: 'dev-holiday', date: '20261012', exception_type: '1' },
  ],
  patterns: [long, short],
  trips: [
    trip('dev-weekday-long', 'dev-weekdays', long,
      ['10:00:00', '10:05:00', '10:10:00']),
    trip('dev-holiday-long', 'dev-holiday', long,
      ['10:00:00', '10:05:00', '10:10:00']),
    trip('dev-holiday-short', 'dev-holiday', short, ['10:03:00', '10:08:00']),
  ],
};
