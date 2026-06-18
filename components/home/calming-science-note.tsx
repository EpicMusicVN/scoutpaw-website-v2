/**
 * Compact "why calming content works" note with two outbound citation links.
 *
 * Serves the AEO "external citation links" signal (≥2 outbound links to credible
 * sources) and adds genuine E-E-A-T: the brand's calming premise is backed by
 * veterinary-industry guidance + peer-reviewed research, not just vibes. Links
 * open in a new tab with `rel="noopener noreferrer"` per the site convention.
 */
const SOURCES = [
  {
    label: "American Kennel Club",
    href: "https://www.akc.org/expert-advice/training/why-music-is-therapeutic-for-dogs/",
  },
  {
    label: "Physiology & Behavior (Bowman et al., 2015)",
    href: "https://pubmed.ncbi.nlm.nih.gov/25708275/",
  },
] as const;

export function CalmingScienceNote() {
  return (
    <section className="mx-auto max-w-hero px-4 pb-4 md:px-8">
      <div className="mx-auto max-w-2xl rounded-3xl border border-ink/10 bg-surface/70 px-6 py-5 text-center shadow-cozy">
        <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-cobalt md:text-sm">
          Why calming works
        </p>
        <p className="mt-2 text-sm text-ink-blue/85 md:text-base">
          It&apos;s not just a vibe — research finds the right sounds genuinely help dogs
          settle. Classical music has been shown to lower stress and barking in kennelled
          dogs.
        </p>
        <p className="mt-3 text-xs text-ink-blue/70 md:text-sm">
          Sources:{" "}
          {SOURCES.map((source, i) => (
            <span key={source.href}>
              {i > 0 && <span aria-hidden="true"> · </span>}
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cobalt underline decoration-cobalt/40 underline-offset-2 hover:text-brand-gold"
              >
                {source.label}
              </a>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
