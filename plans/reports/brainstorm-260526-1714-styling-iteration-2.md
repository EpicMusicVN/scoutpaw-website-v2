# Brainstorm — Styling Iteration 2: Body Blue + Stacked Characters + VIP Spacing v2

**Date:** 2026-05-26 (afternoon iteration, after Plans A/B/C shipped)
**Scope:** Three sub-projects decomposed from one iteration request. Builds on (and partly retires) Plans A/B/C.

## Problem Statement

User wants a second iteration after A/B/C shipped:

1. **Body text color** — replace dark-brown `--ink` body text with a darker blue (~`#1a3a5c`) for "primary colors = blue / yellow / white" coherence.
2. **Surface→text contract** — yellow bg → blue text; blue bg → yellow text; default body → darker blue; navbar uses same blue as body.
3. **/characters page** — each section = 100vh stacked-page sticky scroll; new section slides over previous like layered paper.
4. **VIP newsletter** — dogs' feet still overlap footer; need more breathing room.

## Hard Trade-Off Acknowledged

This iteration **retires most of Plans B (cards) and C (dividers) on /characters**. The full-bleed sticky 100vh scenes replace the rounded card model and remove the cloud dividers (Plan C component itself stays for top-picks/shop/watch). User confirmed acceptance of this churn.

## Decisions Locked

| Concern | User Choice |
|---|---|
| Newsletter button + navbar color | Newsletter button stays dark; navbar uses new darker-blue body color |
| Body text "darker blue" value | **`#1a3a5c`** (deep navy, AA-safe everywhere) |
| Stacked scroll on /characters | Yes — replace Plan B card model + remove Plan C dividers from /characters |
| Mobile stacked-scroll treatment | Disable on mobile — plain stacked sections |

## Approaches Evaluated

### Body color (Plan D)
| Option | Pros | Cons |
|---|---|---|
| `#1a3a5c` deep navy ✅ | AA-safe everywhere (~9:1 white, ~6:1 cyan/warm, ~7.5:1 yellow); reads as "blue" | Custom token; not in current palette |
| Existing `--bg-navy` `#397fc5` | Reuse token | Fails body AA on cyan/warm — would force bg changes |
| Even darker `#0f2540` | Max legibility | Too close to brown ink — loses "blue" feel |

### Characters page scroll (Plan E)
| Option | Pros | Cons |
|---|---|---|
| Replace card model + remove dividers ✅ | Clean stacked-scene model; coherent with "each character = own page" intent | Throws away ~60% of Plan B/C shipped today |
| Keep cards + add stacked effect (hybrid) | Less churn | Rounded cards mid-transition look weird; choreography hard |
| Defer the idea | Safest | User explicitly wants this now |

### Mobile stacked-scroll (Plan E)
| Option | Pros | Cons |
|---|---|---|
| Disable on mobile ✅ | iOS Safari sticky + transforms jank-prone; clean fallback | Less cinematic on mobile |
| Full effect on mobile | Max immersion | Battery, jank, scroll judder |
| Sticky only, no transforms | Compromise | Half-effect, two code paths |

### Newsletter button + navbar color
| Option | Pros | Cons |
|---|---|---|
| Keep newsletter dark, navbar uses body blue ✅ | Targeted change; preserves existing button visual | Newsletter button stays brown — slight color inconsistency |
| Change both to navy | Cohesive | Bigger surface, retest button states |
| Both use body darker-blue | One token rules everything | Newsletter button visually less anchored |

## Final Recommended Solution

### Sub-Plan D — Typography v2: Darker-Blue Body + Surface Contract

**Files affected:** `app/globals.css`, `tailwind.config.ts`, ~36 component files (~130 line edits).

**New token (`globals.css`):**
```css
--ink-blue: #1a3a5c;
--ink-blue-rgb: 26 58 92;
```
Wired in Tailwind as `ink-blue` via `withOpacity("--ink-blue-rgb")`.

**Surface→text contract:**

| Surface | Body | Heading |
|---|---|---|
| Light (white / cyan / cream / warm-tan) | `text-ink-blue` | `text-navy` h2, `heading-gradient-tri` h1 (Plan A) |
| Yellow (brand primary, feature banner) | `text-ink-blue` | `text-ink-blue` or `heading-gradient-cool` |
| Blue/navy (footer, dark sections) | `text-brand-primary` or `text-white/85` | `text-brand-primary` or `heading-gradient-warm` |

**Sweep policy:**
- Body text: `text-ink`, `text-warm-text` → `text-ink-blue`
- Muted variants: `text-warm-muted` → `text-ink-blue/70`
- Opacity variants: `text-ink/85` → `text-ink-blue/85` etc.
- Navbar (`nav-links.tsx`, `mobile-nav.tsx`): `text-ink` → `text-ink-blue`
- **Don't touch:** `bg-ink` (newsletter button stays), `border-ink` (form input borders), `ring-ink` (focus rings) — those keep the dark anchor

**Yellow-surface rule application:**
Currently very few full-yellow surfaces exist. `feature-banner.tsx` uses warm-tan gradient (not pure yellow). Apply rule where literal yellow bg exists; document for future use.

### Sub-Plan E — Characters Page v3: Stacked 100vh Sticky Scroll

**Files affected:** `components/characters/character-section.tsx` (rebuild from card → scene), `app/characters/page.tsx` (remove dividers, add scene container).

**Architecture:**

```
<main>
  <FullBleedHero />
  <div className="relative">  {/* scene stack container */}
    {characters.map((c, i) => (
      <CharacterScene index={i} ... />
    ))}
  </div>
  <NewsletterCTA />
</main>
```

**`CharacterScene` (rebuilt component):**
- Outer `<section>` wrapper: `relative h-screen` (100vh, contributes to total scroll height)
- Inner `<div>` with `sticky top-0 h-screen overflow-hidden` and dynamic `z-index: {index}` so later scenes layer over earlier
- Inside the sticky div:
  - Full-bleed `surfaceTint` background (per-character)
  - `CharacterAtmosphere` + `CharacterMotif` (clipped by `overflow-hidden`)
  - Grid layout: art column + content column (zig-zag via `flip`)
  - Plan A heading style on character name
- Mobile breakpoint: drop `sticky`, `transform`, and tall height — use plain `min-h-screen` block sections
- framer-motion `useScroll({ target, offset: ["start end", "end start"] })`:
  - Active scene: stays at scale 1, opacity 1
  - As next scene enters, current scene: `scale → 0.96`, `opacity → 0.85`
  - Optional: subtle box-shadow boost on incoming scene for "paper landing" cue
- `prefers-reduced-motion` guard: skip transforms, keep sticky

**Removed from /characters:**
- All 5 `CloudDivider` instances (Plan C work undone on /characters; component remains for other pages)
- `space-y-*` wrapper (Plan B)
- Rounded card geometry, `shadow-cozy-xl`, art top-overflow (Plan B)

**Preserved:**
- `CharacterAtmosphere`, `CharacterMotif` (inside scene)
- `CharacterMerchCard` 2-col grid
- Breed kicker, name h2 (Plan A `text-navy`), tagline, bio, CTAs
- Zig-zag flip
- `priority` on first character

**Page structure:**
- 5 characters × 100vh sticky = ~500vh scrollable
- Newsletter follows after scene stack (regular flow)
- `prefers-reduced-motion` users see plain stacked 100vh sections, no transforms

### Sub-Plan F — VIP→Footer Spacing v2 (trivial)

**File:** `components/home/newsletter-cta.tsx`.

**Two-part fix:**
1. Move decorative dogs UP — `-bottom-2` / `-bottom-1` → `bottom-8` / `bottom-10` (push ~32–40px above section bottom)
2. Bump section padding for clearance: `pb-28 md:pb-36` → `pb-32 md:pb-48` (extra 16–48px breathing room before footer)

Combined effect: dog feet sit inside the card area; ~80–120px clear space between section bottom and footer top.

## Implementation Considerations

- **Plan D blast radius**: grep `text-ink\b` returns 89 occurrences in 36 files; `text-warm-text` and `text-warm-muted` add ~40 more. Disciplined `replace_all` for `text-ink` patterns will catch most; manual pass for edge cases (`text-ink/85`, `text-ink/65`, etc.).
- **Plan E sticky + framer-motion**: critical that transforms apply to the INNER div, not the sticky wrapper itself (transformed parent breaks sticky behavior). Test in Chrome + Safari + Firefox.
- **Plan E mobile**: use Tailwind responsive classes `md:sticky md:h-screen` to gate the sticky behavior; mobile gets `min-h-screen` plain blocks.
- **Plan E vs Plan B/C**: Plan B's `character-section.tsx` becomes `CharacterScene` (rebuild). Plan C's dividers removed from `/characters/page.tsx` (`CloudDivider` component file stays, still used elsewhere).
- **Plan F**: tiny single-file edit. Could roll into Plan D as a Phase 4 if preferred — but kept separate for clean atomic commits.

## Risks

1. **Plan D missing-edit risk** — easy to miss `text-ink/N` opacity variants or context-specific uses. *Mitigation:* full-codebase grep audit after sweep; visual spot-check on every page.
2. **Plan D yellow-surface contract under-applied** — fewer yellow surfaces than expected (mostly gradients, not pure yellow). *Mitigation:* document the rule for future use; apply only where literal yellow bg exists today.
3. **Plan E z-index stacking with transformed parents** — `motion.div` with transform creates new stacking context, can interfere with sticky position. *Mitigation:* sticky on outer wrapper (untransformed), transforms only on inner motion div.
4. **Plan E iOS Safari quirks** — sticky has historic edge cases (especially with `100vh` height). *Mitigation:* test on iOS during verification; use `100dvh` if 100vh exhibits the iOS toolbar issue.
5. **Plan E perf on older devices** — 5 sticky scenes + scroll-driven transforms. *Mitigation:* `will-change: transform, opacity` sparingly, `prefers-reduced-motion` opt-out, lazy-load non-first images.
6. **Plan F** — trivial; only risk is the dogs end up too far from card bottom and look detached. *Mitigation:* live visual check.

## Success Metrics

- **Plan D:** all body text reads as deep navy across pages; AA contrast passes on every surface; no missed `text-ink/N` references; navbar visibly shifts to blue.
- **Plan E:** scrolling `/characters` shows scenes stacking like paper; smooth ~60fps in Chrome on a recent machine; mobile shows plain stacked 100vh sections; `prefers-reduced-motion` drops transforms.
- **Plan F:** newsletter card has clear ~80–120px space between dog feet and footer top.
- `pnpm typecheck` + `pnpm lint` clean across all three plans.

## Plan Sequencing

Recommended order:
1. **Plan D** first — typography foundation; Plan E will use the new body color
2. **Plan E** after D — stacked-scroll rebuild
3. **Plan F** any time — trivial; can be parallel with D

Dependencies expressed in `blockedBy`:
- Plan D blockedBy: `260526-1605-typography-system-and-vip-spacing` (Plan A — D extends A's heading contract with body color)
- Plan E blockedBy: `260526-1605-characters-cinematic-cards` (Plan B), `260526-1605-varied-cloud-dividers` (Plan C — E retires both on /characters)
- Plan F: no blockers

## Next Steps

- Scaffold three plans via `ck plan create` with proper `blockedBy` chain
- Each plan has 3 phases (D: tokens + sweep + verify; E: scene rebuild + page wire + verify; F: edit + verify)
- Ship Plan D first, then E, then F (or D+F parallel, then E)

## Unresolved Questions

- None at design time. Open items deferred:
  - Exact framer-motion timing curves for scene entry — tune live in Plan E Phase 2
  - Optional shadow boost on entering scene — leave to live visual tuning
  - Yellow-bg surface inventory — confirm sweep scope when starting Plan D Phase 2
