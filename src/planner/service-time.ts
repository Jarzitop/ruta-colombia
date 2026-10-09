/**
 * Convert a manually entered local GTFS clock threshold to GTFS HH:MM:SS.
 * No device timezone, calendar date or live departure is inferred.
 * Empty input means no departure-time restriction.
 */
export function toGtfsDepartureTime(input: string): string | null {
  const value = input.trim();
  if (!value) return '';
  const match = /^(\d{1,3}):([0-5]\d)$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  if (!Number.isSafeInteger(hours) || hours > 999) return null;
  return String(hours).padStart(2, '0') + ':' + match[2] + ':00';
}
