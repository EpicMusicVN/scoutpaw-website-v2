/**
 * Tiny class-name joiner. Skips falsy values. KISS — no need for clsx.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
