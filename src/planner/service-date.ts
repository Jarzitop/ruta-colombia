/** Input-only conversion; the GTFS engine independently validates actual dates. */
export function toGtfsServiceDate(input: string): string | null {
  const value = input.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? match[1] + match[2] + match[3] : null;
}
