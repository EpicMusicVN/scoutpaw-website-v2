/**
 * Reusable personality pull-quote. The accent color tints the left border and
 * the oversized decorative quote mark only — body text stays `warm-text` on a
 * light surface, so contrast holds regardless of how light the accent is (AA).
 *
 * Used by the Characters detail view and the per-character detail page, so the
 * quote styling stays consistent across the site.
 */
export function CharacterQuote({
  quote,
  accentColor,
}: {
  quote: string;
  accentColor: string;
}) {
  return (
    <blockquote
      className="relative overflow-hidden rounded-3xl border-l-4 bg-surface/80 p-6 shadow-cozy md:p-8"
      style={{ borderColor: accentColor }}
    >
      {/* Oversized decorative quote mark — purely decorative, hidden from AT. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 right-2 font-display text-[7rem] leading-none opacity-20"
        style={{ color: accentColor }}
      >
        &rdquo;
      </span>
      <p className="relative font-display text-base italic leading-relaxed text-ink-blue md:text-lg">
        &ldquo;{quote}&rdquo;
      </p>
    </blockquote>
  );
}
