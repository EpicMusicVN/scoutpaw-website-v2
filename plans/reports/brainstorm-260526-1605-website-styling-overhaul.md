# Brainstorm — Website Styling Overhaul: Typography Color System, Cinematic Character Cards, Varied Cloud Dividers

**Date:** 2026-05-26
**Scope:** Three sub-projects decomposed from one styling request.

## Problem Statement

User wants global visual upgrade with four concerns of varying size:

1. **(trivial)** More breathing room between "Become a VIP" newsletter card and footer.
2. **(large)** Restrict primary-text color palette to **blue / yellow / white**, support gradient text for premium/cinematic feel, ensure WCAG AA readability with optional text glow/shadow.
3. **(large)** Redesign each character section on `/characters` as a **large standalone immersive card** — cinematic, premium, visually dominant.
4. **(medium)** Re-add dividers between character sections with **varied cloud-inspired shapes** (no animation per user choice — variety alone reads as playful).

Constraint set: align with ScoutPaw brand, responsive across all breakpoints, smooth transitions, strong readability, cinematic + cozy + playful + premium feel.

## Current Brand Palette (audit reference)

From `app/globals.css:13-44` and `tailwind.config.ts`:
- Page bg: soft cyan `--bg-base #c6e7e9` (cyan body, NOT white)
- Surfaces: white `#ffffff` (cards)
- Footer + dark anchor: navy `--bg-navy #397fc5`
- Brand primary: yellow `--brand-primary #ffd70c`
- Body text: dark brown `--ink #2b1d10`
- `text-on-warm` tokens for cream/honey contrast (used by character section tints)
- Font system: `--font-display` (used 133× across 44 files), `--font-body`

## Brutal Reality Check Performed

User initially said "primary text colors only blue/yellow/white." Cross-checked against current backgrounds — yellow on cyan/white = ~1.3–1.5:1 contrast, fails WCAG AA. Asked user, scope clarified: **headings + accent text only**. Body copy stays dark ink on light surfaces, white on navy. This is the only realistic interpretation that meets the readability constraint.

## Decisions Locked

| Concern | User Choice |
|---|---|
| Typography scope | Headings + accent text only (body stays dark ink/warm) |
| Scope decomposition | Three sub-plans, one brainstorm now |
| Character card style | Full-bleed cinematic per character (interpreted as Model Y — large standalone card on cyan canvas) |
| Divider style | Varied static cloud SVGs, no animation |
| Plan sequencing | A → B → C (typography first, cards next, dividers last) |

## Approaches Evaluated

### Typography (Plan A)
| Option | Pros | Cons |
|---|---|---|
| Headings + accent only ✅ | Realistic, preserves readability, smaller blast radius | Doesn't literally match "only 3 colors" |
| All text incl. body | Literal match | Requires darkening every bg → site rebrand; massive scope |
| Headings + redesign bgs together | Mid path | Still huge; mixes two concerns; risky |

### Character card (Plan B)
| Option | Pros | Cons |
|---|---|---|
| Full-bleed cinematic (Model Y) ✅ | Premium feel, immersive | Long page (5× ~80vh); mobile UX needs care |
| Inset rounded card on tinted strip | Bento, easy, matches v7 detail | Not "visually dominant" enough per request |
| Wide horizontal with parallax | Dynamic | Parallax fights ScrollReveal; mid-effort |

### Dividers (Plan C)
| Option | Pros | Cons |
|---|---|---|
| Varied static SVGs ✅ | KISS, perf, accessible, shape variety = playful | No motion delight |
| Static + drift on scroll | Polished without per-frame cost | Mid-cost |
| Drifting + sparkles | High polish | High cost, animation fatigue risk |

## Final Recommended Solution

### Sub-Plan A — Heading Typography System + VIP→Footer Spacing

**Goal:** Define a 3-color heading contract (blue + yellow + white) with gradient utilities and readability protections. Bump newsletter→footer breathing room.

**Color contract (headings only):**

| Surface | Heading default | Gradient option |
|---|---|---|
| Light (cyan/white/cream tint) | `text-navy` solid | `bg-gradient-to-r from-navy via-brand-secondary to-navy` (cool blue sweep) |
| Dark (navy footer, dark wash) | `text-white` | `bg-gradient-to-r from-brand-primary to-white` (golden glow) |
| Hero/premium moments | (single gradient sweep) | `bg-gradient-to-r from-navy via-brand-primary to-white` (tri-color, used sparingly on h1 only) |

**New utility classes (globals.css):**
- `.text-shadow-soft` — 3 layered text-shadows for legibility on busy bg (applied to wrapper for gradient text)
- `.heading-gradient-cool` — preset for cool sweep
- `.heading-gradient-warm` — preset for warm glow
- `.heading-gradient-tri` — preset for tri-color hero

**Application surface (selective, not all 133 font-display sites):**
- Hero h1 across home, characters, watch, shop, top-picks → tri-color sweep
- Section h2 on light bg → navy solid
- Section h2 on tinted bg → navy solid (still passes AA on warm tints)
- Footer h3 (already `#fffbe6`) → align to yellow token (`text-brand-primary` or similar)
- Body text untouched (this is critical — protects readability)

**VIP→footer spacing:**
- `components/home/newsletter-cta.tsx:67` → `pb-16 md:pb-20` becomes `pb-28 md:pb-36` (~80–96px more)

### Sub-Plan B — Cinematic Character Cards (Model Y)

**Goal:** Replace per-character tinted full-width sections with large standalone cards on the cyan canvas.

**Card spec:**
- Container: `max-w-hero` (1400px), `mx-4 md:mx-8`, `my-12 md:my-20`
- Shape: `rounded-[2.5rem] md:rounded-[3rem]`, `shadow-cozy-xl`, `overflow-hidden` (so art clip works)
- Height: `min-h-[80vh]` desktop, `min-h-auto` mobile (let content size naturally)
- Background: per-character `surfaceTint` moves **inside** card (was full-width before)
- Composition:
  - Art column ~50%, content column ~50%, alternating zig-zag per index
  - Character pose may overflow top of card for cinematic depth (`absolute` + negative top offset, parent `overflow-visible` selectively at top edge)
  - Atmosphere/motif drift layers stay (inside card now, clipped)
- Content order: breed kicker, name (gradient h2 from Plan A), tagline, bio, merch row (2-col), CTAs
- Card padding: `p-8 md:p-12 lg:p-16`

**Gap between cards:** ~`my-12 md:my-20` of cyan body bg, where dividers from Plan C will sit.

**Mobile considerations:**
- Stack art + content vertically (existing pattern)
- Drop `min-h-[80vh]` to let cards size to content (don't force tall empty space)
- Reduce padding to `p-6 sm:p-8`

### Sub-Plan C — Varied Cloud Dividers

**Goal:** Re-introduce dividers between character cards with shape variety. No animation.

**Variant system:**
- Extend `components/ui/cloud-divider.tsx` with `variant` prop: `"trio" | "duo-big" | "scatter" | "stack"` (4 variants)
- Each variant = different cloud puff count, size distribution, vertical offset:
  - `trio` — current 3-cloud row (default)
  - `duo-big` — 2 large clouds, 1 small puff between them
  - `scatter` — 5 small puffs at varied y-positions
  - `stack` — 4 clouds vertically offset, layered
- Subtle gradient on cloud fill: `<linearGradient>` from `#ffffff` to `#f5fafc` for soft volume (instead of flat white). Use `useId()`-stable IDs to prevent collision.
- Stays `aria-hidden`, decorative.

**Wiring on characters page:**
- `app/characters/page.tsx` — after each character card, insert `<CloudDivider variant={VARIANTS[i % 4]} />`
- Last divider before newsletter optional (keep one for closure)

## Implementation Considerations

- **Plan A blast radius**: ~30 component files need heading-color updates. Mitigate by doing landmark/hero h1/h2 first, defer h3/kickers if time-boxed.
- **Plan B page length**: 5 × 80vh + hero + newsletter ≈ 5–6 viewports. Acceptable per cinematic intent, but flag to QA.
- **Plan C SVG gradient IDs**: must be unique per instance to avoid cross-component bleed. Use React `useId()`.
- **bg-clip-text + text-shadow**: don't compose — shadow renders behind the cropped fill. If shadow needed on gradient text, wrap in a `<span>` with shadow, or use SVG-based text. Plan A specs the wrapper approach.
- **Plan B mobile**: do NOT force `min-h-[80vh]` on mobile or page becomes infinite scroll. Hardcoded breakpoint guard.
- **Order matters**: Plan A first so B/C use the new heading style. C after B so divider gap aligns with card spacing.

## Risks

1. **Tri-color gradient legibility on hero h1** — over busy backgrounds (cyan + atmosphere), gradient text may look muddy. *Mitigation:* test live; fall back to two-color gradient if tri reads muddy; use `text-shadow-soft` wrapper for lift.
2. **Heading color regression on edge pages** — pages we don't touch in Plan A keep dark-ink headings. Accept inconsistency in Phase 1; sweep remaining pages in a follow-up plan.
3. **Card overflow art clipping** — `overflow-hidden` on card kills the "art overflows top" cinematic. Solution: card has `overflow-hidden` on body but the art-overflow happens in a separate sibling/wrapper. Plan B specs this.
4. **Cumulative perf** — 5 tall cards + per-card atmosphere layers + 4 SVG dividers + scroll-reveals = heavier characters page. *Mitigation:* `priority` only on first card; defer atmosphere drift via `prefers-reduced-motion`.
5. **Mobile h1 gradient** — tri-color sweep on narrow viewport can look like a stripe. *Mitigation:* simplify gradient on `sm` (CSS media query inside utility).

## Success Metrics

- Hero h1 on `/`, `/characters`, `/watch`, `/shop`, `/top-picks` uses navy→yellow→white sweep with text-shadow-soft, AA readable
- Section h2s use navy on light bg, white/yellow on navy bg
- Body text untouched and still AA on all surfaces
- Newsletter card has ~80–96px more breathing space before footer
- Characters page renders 5 large rounded cards with cinematic art composition, mobile stacks naturally
- 4 distinct divider shapes alternate between character cards
- `pnpm typecheck` + `pnpm lint` clean
- No new console warnings, no AA regressions caught by manual contrast spot-check

## Plan Sequencing

1. **Plan A** — `260526-1605-typography-system-and-vip-spacing` — foundation
2. **Plan B** — `260526-1605-characters-cinematic-cards` — depends on A
3. **Plan C** — `260526-1605-varied-cloud-dividers` — depends on B

## Next Steps

- Scaffold three plans via `ck plan create` with proper `blockedBy` chain
- Each plan has its own phase breakdown (3 phases each: design + implement + verify)
- Ship Plan A first, verify in live, then Plan B, then Plan C

## Unresolved Questions

- None at design time. Open items deferred:
  - Exact gradient angle/percentage stops (will tune live in Plan A Phase 2)
  - Whether to add `prefers-reduced-motion` guard on atmosphere drift in Plan B
  - Final divider variant order (will pick by visual rhythm in Plan C Phase 2)
