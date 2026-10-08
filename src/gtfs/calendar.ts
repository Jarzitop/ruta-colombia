/**
 * GTFS Schedule calendar semantics (calendar.txt + calendar_dates.txt).
 *
 * Pure, dependency-free utility: it does not claim a bus is available "now".
 * An active service only means that its recorded service-day rules permit
 * the service on the supplied date, not that a particular trip calls at a stop.
 *
 * All inputs below are raw GTFS strings (as provided by CSV parsing).
 */
export interface GtfsCalendarRow {
  service_id: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  start_date: string; // YYYYMMDD
  end_date: string; // YYYYMMDD
}

export interface GtfsCalendarDateRow {
  service_id: string;
  date: string; // YYYYMMDD
  exception_type: string; // 1 = add service; 2 = remove service
}

export type ServiceActivity = 'active' | 'inactive' | 'unknown';

const WEEKDAYS = [
  'sunday', 'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday',
] as const;

function parseServiceDate(raw: string): Date | null {
  if (!/^\d{8}$/.test(raw)) return null;
  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6));
  const day = Number(raw.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date : null;
}

export function resolveGtfsServiceDay(
  serviceId: string,
  yyyymmdd: string,
  calendar: readonly GtfsCalendarRow[],
  exceptions: readonly GtfsCalendarDateRow[],
): ServiceActivity {
  const date = parseServiceDate(yyyymmdd);
  if (!serviceId || !date) return 'unknown';

  const overrides = exceptions.filter((entry) =>
    entry.service_id === serviceId && entry.date === yyyymmdd,
  );
  // GTFS calendar_dates must identify a service/date at most once.
  if (overrides.length > 1) return 'unknown';
  if (overrides.length === 1) {
    if (overrides[0]?.exception_type === '1') return 'active';
    if (overrides[0]?.exception_type === '2') return 'inactive';
    return 'unknown';
  }

  const rows = calendar.filter((entry) => entry.service_id === serviceId);
  if (rows.length !== 1) return 'unknown';
  const row = rows[0];
  if (!row || !parseServiceDate(row.start_date) || !parseServiceDate(row.end_date) ||
      row.start_date > row.end_date) return 'unknown';
  if (yyyymmdd < row.start_date || yyyymmdd > row.end_date) return 'inactive';

  const weekday = WEEKDAYS[date.getUTCDay()];
  if (!weekday) return 'unknown';
  const flag = row[weekday];
  if (flag === '1') return 'active';
  if (flag === '0') return 'inactive';
  return 'unknown';
}
