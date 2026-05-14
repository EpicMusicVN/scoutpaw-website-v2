type Pillar = {
  title: string;
  body: string;
  Icon: () => React.ReactElement;
  bg: string;
};

const PAW_ICON = (
  <svg viewBox="0 0 64 64" className="h-10 w-10 md:h-12 md:w-12" aria-hidden="true">
    <ellipse cx="32" cy="42" rx="14" ry="10" fill="currentColor" />
    <ellipse cx="14" cy="26" rx="6" ry="8" fill="currentColor" />
    <ellipse cx="50" cy="26" rx="6" ry="8" fill="currentColor" />
    <ellipse cx="22" cy="14" rx="5" ry="7" fill="currentColor" />
    <ellipse cx="42" cy="14" rx="5" ry="7" fill="currentColor" />
  </svg>
);

const HOME_ICON = (
  <svg viewBox="0 0 64 64" className="h-10 w-10 md:h-12 md:w-12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 30 L32 12 L54 30 L54 52 L40 52 L40 38 L24 38 L24 52 L10 52 Z" />
  </svg>
);

const BAG_ICON = (
  <svg viewBox="0 0 64 64" className="h-10 w-10 md:h-12 md:w-12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 22 L50 22 L46 56 L18 56 Z" />
    <path d="M22 22 V18 a10 10 0 0 1 20 0 V22" />
  </svg>
);

const PILLARS: Pillar[] = [
  {
    title: 'The "Invisible Hug" Effect',
    body: "Tactile comfort for your pup when you're away. Weighted plushies and scent-retentive fabrics provide security and grounding until you return.",
    Icon: () => PAW_ICON,
    bg: "#fffbe6",
  },
  {
    title: "Sensory Sanctuary",
    body: 'Calm departures for pups. Sensory products + music create a "Zen Zone" replacing anxiety with calm as you leave.',
    Icon: () => HOME_ICON,
    bg: "var(--bg-warm-tan)",
  },
  {
    title: "The Return to Happy",
    body: "Goodbye guilt, hello happy pup! Shop our toys for entertained, safe, and content dogs while you're away.",
    Icon: () => BAG_ICON,
    bg: "var(--bg-peach)",
  },
];

/**
 * Three-pillar trust section for the Shop page. Each pillar sits on its own
 * accent-colored sticker card with an oversized illustrated icon, a bold
 * heading, and two lines of body copy. Lift on hover.
 */
export function AboutShop() {
  return (
    <section className="mx-auto max-w-hero px-4 py-24 md:px-8 md:py-32">
      <header className="text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm">
          The ScoutPaw Story
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-6xl lg:text-7xl">
          More About ScoutPaw Shop.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-ink/85 md:text-lg">
          A small, considered range — built for real homes and the dogs who fill them.
        </p>
      </header>

      <ul className="mt-14 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
        {PILLARS.map((pillar) => (
          <li key={pillar.title} className="h-full">
            <article
              className="flex h-full flex-col rounded-[2rem] p-7 shadow-cozy transition-all duration-300 ease-gentle hover:-translate-y-2 hover:shadow-cozy-lg md:p-9"
              style={{ backgroundColor: pillar.bg }}
            >
              <div className="text-ink/85">
                <pillar.Icon />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold leading-tight text-ink md:text-3xl">
                {pillar.title}
              </h3>
              <span
                aria-hidden="true"
                className="mt-3 block h-1 w-12 rounded-full bg-ink/40"
              />
              <p className="mt-5 text-base leading-relaxed text-ink/90 md:text-lg">
                {pillar.body}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
