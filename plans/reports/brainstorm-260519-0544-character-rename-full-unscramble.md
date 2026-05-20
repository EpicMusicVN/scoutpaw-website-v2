# Brainstorm — Character Rename: Full Unscramble (Husky → Rocky)

**Date:** 2026-05-19 05:44 (Asia/Saigon)
**Branch:** main
**Scope:** Rename Husky character from "Buddy" → "Rocky" AND unscramble the broken name/slug/breed/bio mapping across all 5 characters AND fix the parallel scramble in `lib/shopify/mock-products.ts`.

---

## Problem Statement

User asked for what looked like a 1-line rename ("Husky from Buddy to Rocky"). Audit found:

1. **characters.json data is scrambled** — 3 of 5 entries have name/slug/bio that don't align with each other
2. **Two characters currently named "Buddy"** — Husky (slug=buddy) AND Corgi (slug=oscar)
3. **slug "rocky" already taken** by the Poodle
4. **mock-products.ts has a parallel scramble** — every product title says the right breed but the wrong name (e.g., `"Buddy the Golden Plush"` with `husky-bg.png` image asset, when Buddy was Husky and Golden was Max)

Doing just the literal rename = compounding tech debt. User chose full unscramble.

---

## Decisions Locked (User-Confirmed)

| Breed | New Name | New Slug |
|---|---|---|
| Husky | **Rocky** | `rocky` |
| Golden Retriever | Max | `max` (unchanged) |
| Collie | **Oscar** | `oscar` |
| Corgi | **Buddy** | `buddy` |
| Poodle | **Bella** | `bella` |

Pattern: **slug rotation**. Each row keeps its breed/bio/image/accentColor; only the slug + name change, and the bio's name self-reference gets swapped.

Mock-products: fix as part of this work. Approach: keep breed-in-title (matches image), swap name to new correctly-mapped name.

---

## Surface Area

### Content Data (`content/`)

| File | What changes |
|---|---|
| `characters.json` | All 5 entries: realign `slug` + `name`; rewrite `bio` self-references (e.g., `"Buddy, our..."` → `"Rocky, our..."`); remove duplicate `name: "Buddy"` at line 50 |
| `channels.json` | `"characterSlug": "buddy"` → `"rocky"` (this channel was Husky-tagged) |
| `videos.json` | 4× tag entries `"buddy"` → `"rocky"` + 1 video title `"Buddy and the Backyard Birds"` → `"Rocky and the Backyard Birds"` |

### UI Copy

| File | What |
|---|---|
| `app/page.tsx` | `"Max, Buddy, and their friends..."` → `"Max, Rocky, and their friends..."` (refers to Husky) |
| `components/home/menu-cards.tsx` | `"Learn more about Buddy, Max, ..."` → `"Learn more about Rocky, Max, ..."` |
| `components/shop/shop-empty-state.tsx` | `"Buddy waiting"` + `"Buddy is sniffing..."` → `"Rocky waiting"` / `"Rocky is sniffing..."` |
| `components/home/featured-pup-spotlight.tsx` | JSDoc `"Meet Buddy"` + `"behind Buddy"` → Rocky (comments only) |
| `components/home/hero-character-cluster.tsx` | JSDoc `"Buddy front-and-center"` → Rocky (comment only) |

### Mock Products (`lib/shopify/mock-products.ts`)

5 products mis-named. Fix table:

| Product ID | Current Title | New Title | New Handle |
|---|---|---|---|
| mock-2 | Buddy the Golden Plush | **Max the Golden Plush** | `max-plush-toy` |
| mock-3 | Max the Husky Tee | **Rocky the Husky Tee** | `rocky-husky-tee` (rename from `max-the-husky-tee`) |
| mock-5 | Bella the Collie Plush | **Oscar the Collie Plush** | `oscar-collie-plush` |
| mock-6 | Oscar Corgi Kid's Tee | **Buddy Corgi Kid's Tee** | `buddy-corgi-tee-kid` |
| mock-7 | Rocky Poodle Mug | **Bella Poodle Mug** | `bella-poodle-mug` |

Plus `description` and `imageAlt` strings on each — same name swap.

---

## Final Solution Design

### Phase Breakdown

1. **Phase 1 — `content/characters.json` realignment**
   - Rewrite all 5 entries: align slug + name; update bio name-references; remove the orphan duplicate-name at line 50
   - Order field stays 1-5 (preserves visual order: Husky/Rocky first as captain)

2. **Phase 2 — `content/channels.json` + `videos.json` slug fixups**
   - `characterSlug`: `"buddy"` → `"rocky"` in channels.json
   - All 4 `"buddy"` slug tags in videos.json → `"rocky"`
   - Video title `"Buddy and the Backyard Birds"` → `"Rocky..."`

3. **Phase 3 — UI copy + JSDoc updates**
   - All component files mentioning "Buddy" in UI text or JSDoc → "Rocky"

4. **Phase 4 — `lib/shopify/mock-products.ts` realignment**
   - 5 products: title + handle + description + imageAlt name swaps per table above

5. **Phase 5 — Validation**
   - `pnpm typecheck` + `pnpm lint` + `pnpm build`
   - Verify `/characters/rocky`, `/characters/max`, `/characters/oscar`, `/characters/buddy`, `/characters/bella` all SSG-build correctly
   - Verify legacy `/characters/buddy` (was Husky) NOW maps to Corgi (intended Buddy)
   - Visual spot-check via `pnpm dev`: hero, character cards, menu cards, shop empty state

### Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Inbound links to `/characters/buddy` (was Husky) now load Corgi page silently | Pre-launch — no real inbound traffic. Document as expected behavior. |
| Bio self-references missed | Explicit table in Phase 1: every bio's "Name, ..." opening gets verified |
| videos.json tag mismatches → wrong character page video sections | Phase 2 handles all 4 tag occurrences in lockstep |
| mock-products handle changes break any hardcoded handle references elsewhere | Grep for old handles before final commit; should be zero hits since mock data is fixture-only |
| User UI copy missed (e.g., `metadata.ts` SEO description) | Phase 3 grep-pass over `app/` and `components/` for "Buddy" before declaring done |

### Out of Scope (Deferred)

- Husky funfact `"...best friend who hasn't shared a golden snack yet"` references "golden snack" — leftover from previous shuffle. Doesn't fit Husky personality. **Not changing** unless user asks — bio prose decisions belong to brand/copy team, not refactor.
- Switching to a slug→name lookup helper (DRY for character refs) — YAGNI; ~6 reference sites total.
- Real Shopify store products — `mock-products.ts` is fixture only; live data will replace it post-launch.

---

## Success Metrics

- ✅ All 5 characters in `characters.json` have aligned slug/name/breed/bio
- ✅ Zero `"Buddy"` occurrences in non-Corgi contexts across source code (excluding plans/docs/git-history)
- ✅ Zero `"buddy"` slug references EXCEPT the new Corgi character
- ✅ `pnpm typecheck` + `pnpm lint` + `pnpm build` pass
- ✅ All 5 character pages SSG-build (`/characters/{rocky,max,oscar,buddy,bella}`)
- ✅ mock-products titles match their image assets
- ✅ Visual smoke test: hero shows Husky as Rocky; shop empty state says "Rocky"; menu copy lists "Rocky, Max, ..."

---

## Unresolved Questions

- Should the Husky funfact about "golden snack" be rewritten? (Deferred per brand-copy ownership)
- Should `metadata.ts` / SEO descriptions be searched for "Buddy"? (Will grep in Phase 3 — if hits found, include in scope)
- Old `/characters/buddy` URL now silently loads Corgi page — is a 301 redirect to Husky needed? Pre-launch, no real inbound traffic — skip.
