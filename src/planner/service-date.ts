/**
 * Parse a service date without applying the phone's timezone.
 * It must denote a real Gregorian date; the GTFS engine checks feed coverage.
 */
export function toGtfsServiceDate(input: string): string | null {
  const value = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [yearText, monthText, dayText] = value.split('-');
  if (!yearText || !monthText || !dayText) return null;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day) return null;
  return yearText + monthText + dayText;
}
