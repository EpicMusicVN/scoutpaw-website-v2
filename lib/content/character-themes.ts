/**
 * Per-character visual theme for the detail pages. Presentational only
 * (gradients + decorative motif) — kept in TS, not `characters.json` (which
 * holds copy). One detail-page template renders every character; the theme is
 * what makes each page feel distinct. Directions mirror each pup's YouTube
 * channel identity (Max → Puppy Lullaby TV, Rocky → Happy Paws Cartoon, etc.).
 */

export type CharacterMotif =
  | "notes"
  | "bursts"
  | "sparkles"
  | "geo"
  | "mountains";

/**
 * Signature atmospheric layer rendered by `<CharacterAtmosphere />` — one
 * distinctive full-bleed mood per pup, layered behind the motif scatter so each
 * detail page reads visibly unique:
 *   nightlight → warm radial glow · motion → diagonal speed streaks ·
 *   ribbons → drifting ballet ribbons · blueprint → faint learning grid ·
 *   ridge → layered mountain silhouettes.
 */
export type CharacterAtmosphere =
  | "nightlight"
  | "motion"
  | "ribbons"
  | "blueprint"
  | "ridge";

export interface CharacterTheme {
  /** Full-bleed hero backdrop gradient (kept light — `ink` text reads on it). */
  heroGradient: string;
  /** Soft tint behind the story block. */
  surfaceTint: string;
  /** Decorative mid-tone color — motif fills + themed accents. Never a text bg. */
  decor: string;
  /** Decorative motif set rendered by `<CharacterMotif />`. */
  motif: CharacterMotif;
  /** Signature atmospheric layer rendered by `<CharacterAtmosphere />`. */
  atmosphere: CharacterAtmosphere;
  /**
   * Heading color token for h1/h2 on this theme's light gradient surface.
   * "yellow" → `text-brand-primary` (requires ≥3:1 on the theme bg — rare for
   * pastel themes). "ink-blue" → `text-ink-blue` (safe ~6:1 on any light bg).
   * All current pastel themes use "ink-blue". A future dark/saturated theme
   * may override to "yellow".
   */
  titleColor: "yellow" | "ink-blue";
}

/** Fallback for an unknown slug — keeps `getCharacterTheme` total + typed. */
const DEFAULT_THEME: CharacterTheme = {
  heroGradient: "linear-gradient(165deg, #FFE3A8 0%, #FBC65A 48%, #FFF6E0 100%)",
  surfaceTint: "#FFF8E8",
  decor: "#E0A23A",
  motif: "notes",
  atmosphere: "nightlight",
  titleColor: "ink-blue",
};

const CHARACTER_THEMES: Record<string, CharacterTheme> = {
  // Max — warm golden, cozy bedtime, soft glowing, musical.
  // Lightest bg stop: #FFF6E0 (near-white). Yellow #ffd70c ≈ 1.1:1 — FAIL. Use ink-blue.
  max: {
    heroGradient: "linear-gradient(165deg, #FFE3A8 0%, #FBC65A 48%, #FFF6E0 100%)",
    surfaceTint: "#FFF8E8",
    decor: "#E0A23A",
    motif: "notes",
    atmosphere: "nightlight",
    titleColor: "ink-blue",
  },
  // Buddy — energetic playful orange, dynamic cartoon movement.
  // Lightest bg stop: #FFF1E0 (near-white). Yellow #ffd70c ≈ 1.1:1 — FAIL. Use ink-blue.
  buddy: {
    heroGradient: "linear-gradient(165deg, #FFD2A0 0%, #F6A24E 48%, #FFF1E0 100%)",
    surfaceTint: "#FFF1E2",
    decor: "#E07B3C",
    motif: "bursts",
    atmosphere: "motion",
    titleColor: "ink-blue",
  },
  // Bella — elegant pastel lavender/blush, dreamy ballet-inspired.
  // Lightest bg stop: #FBF1F7 (near-white). Yellow #ffd70c ≈ 1.1:1 — FAIL. Use ink-blue.
  bella: {
    heroGradient: "linear-gradient(165deg, #E6D9F4 0%, #F3CFE0 50%, #FBF1F7 100%)",
    surfaceTint: "#F8F0F8",
    decor: "#9F86C8",
    motif: "sparkles",
    atmosphere: "ribbons",
    titleColor: "ink-blue",
  },
  // Oscar — smart, educational/adventure, sage + teal accents.
  // Lightest bg stop: #FBF6E8 (near-white). Yellow #ffd70c ≈ 1.1:1 — FAIL. Use ink-blue.
  oscar: {
    heroGradient: "linear-gradient(165deg, #CFE6DA 0%, #E8D8B8 52%, #FBF6E8 100%)",
    surfaceTint: "#F2F4E8",
    decor: "#3E8C7E",
    motif: "geo",
    atmosphere: "blueprint",
    titleColor: "ink-blue",
  },
  // Rocky — bold adventurous husky blue, mountain/wilderness energy.
  // Lightest bg stop: #EAF6FB (near-white). Yellow #ffd70c ≈ 1.1:1 — FAIL. Use ink-blue.
  rocky: {
    heroGradient: "linear-gradient(165deg, #BFE3F3 0%, #6FB9DE 48%, #EAF6FB 100%)",
    surfaceTint: "#EDF6FA",
    decor: "#3E8FC4",
    motif: "mountains",
    atmosphere: "ridge",
    titleColor: "ink-blue",
  },
};

export function getCharacterTheme(slug: string): CharacterTheme {
  return CHARACTER_THEMES[slug] ?? DEFAULT_THEME;
}
