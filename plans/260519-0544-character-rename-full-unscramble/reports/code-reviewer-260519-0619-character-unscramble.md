# Code Review — Character Data Unscramble

**Date:** 2026-05-19
**Reviewer:** code-reviewer
**Scope:** content/{characters,channels,videos}.json + 5 component files + lib/shopify/mock-products.ts
**Verdict:** SHIP WITH NOTES

## Data Integrity (PASS)

Programmatic validation (node script over JSON):
- 5 unique slugs `[rocky, max, oscar, buddy, bella]` — no duplicates
- 5 unique names — no duplicates
- 5 unique order values 1–5 — no duplicates
- Bio self-references match `name` in all 5 entries (Rocky→Rocky, Max→Max ×2, Oscar→Oscar, Buddy→Buddy, Bella→Bella)
- All 5 `image` fields point to the correct breed asset (husky-bg, golden-2, collie-bg, corgi-bg, poodle-bg) — verified against `public/assets/characters/` listing
- Pronouns repaired: Collie bio rewritten "She's" → "He's" matching Oscar (good catch)

## Reference Consistency (PASS)

- channels.json: all 5 `characterSlug` values resolve to valid characters. Husky channel (`displayPrefix: "Husky"`) → `rocky` ✓, Poodle → `bella` ✓, Collie → `oscar` ✓, Golden → `max` ✓, ScoutPaw → `buddy` (intentional brand-face preservation, noted in scope) ✓
- videos.json: 100% of `characterSlugs[]` references valid. Husky video title + tag updated to `rocky` consistently
- mock-products.ts: breed-in-title matches breed-in-image for all 5 character products

## UI/JSDoc Stragglers (PASS)

Grep across `{app,components,lib,content,docs,public}/**` shows zero `Buddy` references outside of:
1. `content/characters.json` — Corgi character (correct)
2. `lib/shopify/mock-products.ts` — Corgi product (correct)
3. `docs/project-changelog.md` + `docs/journals/...` — historical narrative (correct)

No SEO/metadata leak: `app/characters/[slug]/page.tsx` is fully data-driven via `getCharacterBySlug`.

## Issues Worth Flagging (Non-Blocking)

**L1. Husky personality mismatch (pre-existing, inherited)** — `content/characters.json:10` Rocky's first funFact mentions "shared a **golden snack** yet." The slug-rotation only updated `slug` + name self-refs; it didn't touch funFacts. A Husky character pointing to "golden snack" reads as residue from when this body belonged to Max (Golden Retriever). Rocky's bio body ("Welcome Wag-on," "snuggle master," "filling our home with love," "ScoutPaw Captain") also reads more Golden than the `tagline: "Always up for an adventure"` advertised. **Out of scope for this rename**, but the broader unscramble premise was "do it once, properly" — copy realignment would close the loop.

**L2. Hardcoded slug in component (pre-flagged in scope)** — `components/home/featured-pup-spotlight.tsx:14` uses `characters.find((c) => c.slug === "max")`. JSDoc was updated to say "Meet Rocky" but the lookup still finds Max. The runtime + the H2 ("Say hi to Max") agree with each other — JSDoc is the misleading line. Either revert the JSDoc to "Meet Max" or accept the JSDoc-only drift. Minor.

**L3. Diff includes unrelated churn (scope creep risk)** — `git diff --stat` shows 22 files changed including newsletter rate-limit rewrite, deployment docs, package.json/pnpm-lock. These are outside the stated 8-file scope. Confirm those are intentional / from earlier sessions and not accidentally swept into the unscramble commit.

## Positive Observations

- Pronoun fix (`Bella`→`Oscar` "She's"→"He's") is a thoughtful adjacent correction
- Shop empty-state image swap (`golden-2.png` → `husky-bg.png`) genuinely fixes a pre-existing alt/image mismatch — not just a Buddy→Rocky text patch
- Order field preserved across rotation; SSG paths remain stable `/characters/{rocky,max,oscar,buddy,bella}`
- Pre-existing image asset/character slug alignment verified end-to-end

## Recommended Actions

1. (Optional) Rewrite Rocky's first funFact to remove "golden snack" — drop in a Husky-flavoured fact
2. (Optional) Revert `featured-pup-spotlight.tsx` JSDoc back to "Meet Max" OR change the lookup to `slug === "rocky"`
3. (Verify) Confirm the non-character-related changes in the diff are intentional

## Metrics

- Type/lint/build: clean (per task validation)
- Data referential integrity: 100% (programmatically verified)
- Image-asset alignment: 5/5

## Unresolved Questions

- Is the broader bio/funFact content realignment in-scope for this plan, or strictly a slug-rotation?
- Are the 14+ non-unscramble files in the diff (newsletter, docs, package) intended for this same commit?

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Slug-rotation is mechanically correct and referentially consistent across all three content JSONs + 5 components + product mocks. Three low-severity informational findings (1 pre-existing content residue, 1 JSDoc drift, 1 scope-creep verification).
**Concerns/Blockers:** None blocking. L1 (golden-snack residue) is the only one with user-visible content impact.
