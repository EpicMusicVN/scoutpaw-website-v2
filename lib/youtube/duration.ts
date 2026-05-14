/**
 * Convert YouTube's ISO 8601 duration (e.g. "PT1H23M45S") into "h:mm:ss" or
 * "m:ss" depending on whether hours are present. Returns "" for unparseable
 * input so callers can short-circuit cleanly.
 */
export function parseISODuration(iso: string): string {
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return "";
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
