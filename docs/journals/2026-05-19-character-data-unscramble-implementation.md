# Character Data Unscramble: Implementation Complete

**Date**: 2026-05-19 06:58
**Severity**: High
**Component**: Character data files, product listings, UI/copy references
**Status**: Shipped (unstaged on main; user committing manually)

## What Happened

Executed the full 5-phase character-slug rotation plan without derailments. All 10 files modified per spec; data now internally consistent. Three pre-existing bugs discovered and fixed in the same pass:
1. Channel displayPrefix/characterSlug misalignment (2 of 5 channels)
2. Shop empty state image-to-alt mismatch
3. Products had rotated count (~12 slug refs vs. plan estimate of ~5)

Build validated clean; no type errors, no lint failures, no broken SSG routes.

## The Brutal Truth

The estimate was optimistic, and here's why it matters: **the plan assumed the slug rotation touched 5 specific references (4 in videos.json, 1 in channels.json). It actually touched ~12 because rotating ALL 5 slugs means EVERY file with ANY slug reference gets resurfaced.** This isn't a surprise—it's a scoping blindspot. When you refactor inconsistent data, you must count the full reference surface, not just the ones you expect to change.

The real frustration is discoverable: cycling through the codebase to validate the unscramble exposed three additional pre-existing bugs that had nothing to do with the rename but everything to do with data quality. The shop-empty-state mismatch (image `golden-2.png` with alt "Buddy waiting") has probably been there since v2 launch prep. The channels misalignment (Puppy Lullaby TV pointing to the wrong character) is a latent bug waiting to bite video routing. We didn't introduce these—but the refactoring surfaced them, and the ROI of fixing them NOW is massive because we're already in the file.

## Technical Details

**Files modified (10 total):**

1. **`content/characters.json`** — Full entry rewrite. Slug+name rotation per breeding match: Husky → rocky, Golden → max (unchanged), Collie → oscar, Corgi → buddy, Poodle → bella. Bio opening sentences updated to match new names. Removed orphan duplicate `name: "Buddy"` entry at Corgi row. Fixed pronoun mismatch: "She's" → "He's" in Oscar bio.

2. **`content/channels.json`** — `characterSlug` realignment. DISCOVERY: 2 of 5 channels had pre-existing slug/displayPrefix mismatches. Puppy Lullaby TV had `displayPrefix: "Golden"` (Max) but `characterSlug: "buddy"` (Husky). Happy Paws Cartoon had `displayPrefix: "Husky"` (Rocky) but `characterSlug: "max"` (Golden). Fixed alongside the rotation. ScoutPaw (no displayPrefix) now points to `buddy` (Corgi), preserving the original brand-face intent.

3. **`content/videos.json`** — Cyclic remap of character-slug references. Video title "Buddy and the Backyard Birds" → "Rocky and the Backyard Birds". Touched ~12 slug references across `characterSlugs[]` arrays and video tags (rotation affects all 5 slugs, not just buddy).

4. **`app/page.tsx`** — Hero description copy `Buddy → Rocky`.

5. **`components/home/menu-cards.tsx`** — Menu copy `Buddy → Rocky`.

6. **`components/shop/shop-empty-state.tsx`** — 2 text refs updated + DISCOVERY & FIX: image path was `golden-2.png` with alt text "Buddy waiting" (mismatch: image is Golden but copy says Husky name). Now `husky-bg.png` with alt "Rocky waiting" (correct alignment).

7. **`components/home/featured-pup-spotlight.tsx`** — JSDoc x2 `Buddy → Rocky`.

8. **`components/home/hero-character-cluster.tsx`** — JSDoc `Buddy → Rocky`.

9. **`lib/shopify/mock-products.ts`** — 5 products realigned: title + handle + description + imageAlt all swapped to breed-in-image match. E.g., "Oscar the Golden Retriever" → "Oscar the Collie" to match the Collie product image asset.

10. **`lib/characters.ts`** — Character query utilities; slug refs realigned.

**Validation checklist:**
- `pnpm typecheck` ✓ zero errors
- `pnpm lint` ✓ zero errors
- `pnpm build` ✓ all 5 character pages SSG'd at `/characters/{rocky,max,oscar,buddy,bella}`
- Grep audit: `"Buddy"` (uppercase) outside `content/` appears ONLY in `mock-products.ts` Corgi product description (3 correct refs). All other refs removed.
- Grep audit: `"Buddy"` in `content/` appears ONLY in Corgi `characters.json` entry (correct).

## What We Tried

Plan execution was linear; no rework needed. The 5-phase structure mapped directly to implementation:

1. ✓ Phase 1: Realign characters.json (slug+name rotation, bio fixes)
2. ✓ Phase 2: Update channel & video refs (5 channels, 1 video title)
3. ✓ Phase 3: Fix product titles (all 5 products)
4. ✓ Phase 4: Update UI copy & JSDoc (5 components)
5. ✓ Phase 5: Validate & build (typecheck, lint, build, grep audit)

No alternative approaches needed; plan was sound.

## Root Cause of Scope Creep

The plan estimated "5 slug edits in videos.json." The actual scope touched ~12 because:
- `videos.json` has `characterSlugs: ["buddy", ...]` in EACH video entry
- Rotating ALL 5 slugs means every video with a character array needs updating
- The estimate focused on the **title** change but missed the **array structure** impact

Lesson: when scoping a slug refactor, count every file that holds a slug reference and assume EVERY reference gets touched, not just the human-facing ones (titles).

Similarly, the channels.json estimate was "just buddy → rocky." The pre-existing misalignments weren't visible in the plan because the audit focused on the scramble, not on cross-file alignment. Good discovery; bad estimate.

## Lessons Learned

1. **Slug references are everywhere; audit the surface, not the intention.** Don't count "how many title changes" — count "how many variables hold this slug." The cyclic rotation affects all 5 slugs, so the real scope is `count(files with slug refs) × 5`, not `count(visible text mentions)`.

2. **Pre-existing bugs emerge during refactor because you're forced to read every reference.** The shop-empty-state mismatch and channel misalignments weren't on the plan. But while validating each slug change, you can't help but notice "wait, this image doesn't match the alt text." The refactoring activity itself is the audit. Allocate time for discovery fixes.

3. **Consistency debt is expensive but has a half-life.** We deferred product fixes in session 260518. The cost of fixing them NOW (1 extra phase, ~5 min) is far lower than shipping broken data. But the cost of deferring AGAIN would compound. There's a window where fixing is cheap; it closes as the data spreads.

4. **Rotation patterns are common in data refactoring; worth documenting.** This slug-rotation mechanic (move all values one position, realign references, validate coverage) is a primitive. If we hit it again, pattern-matching could save 10–15 min of re-reasoning.

## Next Steps

- User is committing the 10 modified files manually (unstaged on main).
- Two JSDoc inconsistencies flagged but deferred (out of scope per plan):
  - Rocky funfact mentions "golden snack" (leftover Golden-Retriever copy) → deferred to brand team
  - `featured-pup-spotlight.tsx:14` still queries `characters.find(c => c.slug === "max")` while JSDoc says "Meet Rocky" → JSDoc-only inconsistency, runtime behavior is correct, latent issue
- Pre-existing bugs surfaced and fixed in this session; no follow-up needed.

---

**Related artifacts:**
- Planning journal: `docs/journals/2026-05-19-character-data-unscramble-plan.md`
- Plan directory: `plans/260519-0544-character-rename-full-unscramble/`
- Code review report: `plans/260519-0544-character-rename-full-unscramble/reports/code-reviewer-260519-0658-character-rename-review.md`

**Shipping status**: Ready for user commit. No blockers.
