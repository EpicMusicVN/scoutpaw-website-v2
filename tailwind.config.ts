import type { Config } from "tailwindcss";

/**
 * `withOpacity` wraps a CSS-variable token in `rgb(var(--…-rgb) / <alpha-value>)`
 * so utilities like `text-ink/85` and `bg-paper/95` actually compile.
 * Tailwind 3.4's opacity modifier requires the underlying value to be a raw
 * `R G B` triplet (not hex). The `-rgb` siblings in `globals.css` provide that
 * while the bare hex tokens stay available for inline `style={{}}` usage.
 */
const withOpacity = (cssVar: string) => `rgb(var(${cssVar}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: withOpacity("--brand-primary-rgb"),
          gold: withOpacity("--accent-gold-dark-rgb"),
          secondary: withOpacity("--brand-secondary-rgb"),
          warm: withOpacity("--accent-warm-rgb"),
          cool: withOpacity("--accent-cool-rgb"),
          coral: withOpacity("--accent-coral-rgb"),
          mint: withOpacity("--accent-mint-rgb"),
          teal: withOpacity("--accent-teal-rgb"),
        },
        ink: withOpacity("--ink-rgb"),
        "ink-blue": withOpacity("--ink-blue-rgb"),
        // Pivot #8 — sticker-honey title outline + kicker color (saturated cobalt).
        cobalt: withOpacity("--cobalt-rgb"),
        cream: withOpacity("--bg-cream-rgb"),
        surface: withOpacity("--surface-rgb"),
        // `paper` (not `base`) — `base` would generate a `text-base` color
        // utility that collides with Tailwind's default `text-base` font-size
        // utility, silently coloring all body text cream on desktop.
        paper: withOpacity("--bg-base-rgb"),
        "soft-sky": withOpacity("--bg-soft-sky-rgb"),
        "warm-tan": withOpacity("--bg-warm-tan-rgb"),
        sky: withOpacity("--bg-sky-rgb"),
        "sky-deep": withOpacity("--bg-sky-deep-rgb"),
        peach: withOpacity("--bg-peach-rgb"),
        sage: withOpacity("--bg-sage-rgb"),
        blush: withOpacity("--bg-blush-rgb"),
        navy: withOpacity("--bg-navy-rgb"),
        grass: withOpacity("--bg-grass-rgb"),
        // Contrast-verified text on warm/tinted bgs (WCAG AA on cream/honey/peach).
        "warm-text": withOpacity("--text-on-warm-rgb"),
        "warm-muted": withOpacity("--text-on-warm-muted-rgb"),
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        // Opt-in container for hero/banner sections — adds breathing room beyond
        // the 7xl content cap. Use via `max-w-hero` on full-bleed feature blocks.
        hero: "var(--container-max-hero)",
      },
      transitionTimingFunction: {
        gentle: "cubic-bezier(0.22, 1, 0.36, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      boxShadow: {
        sticker: "0 6px 0 rgb(0 0 0 / 0.08), 0 12px 24px rgb(0 0 0 / 0.06)",
        "sticker-hover": "0 4px 0 rgb(0 0 0 / 0.10), 0 16px 32px rgb(0 0 0 / 0.10)",
        // Warm-gold tinted shadows for cozy premium card system.
        cozy: "0 8px 24px rgb(184 134 46 / 0.10), 0 2px 8px rgb(43 29 16 / 0.04)",
        "cozy-md": "0 16px 40px rgb(184 134 46 / 0.15), 0 4px 12px rgb(43 29 16 / 0.06)",
        "cozy-lg": "0 28px 64px rgb(184 134 46 / 0.22), 0 8px 24px rgb(43 29 16 / 0.08)",
        "cozy-xl": "0 36px 88px rgb(184 134 46 / 0.30), 0 12px 32px rgb(43 29 16 / 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
