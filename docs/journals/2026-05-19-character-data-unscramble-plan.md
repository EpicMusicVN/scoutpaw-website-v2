# Character Data Unscramble: Full Audit & Slug Rotation Plan

**Date**: 2026-05-19 05:44
**Severity**: High (data inconsistency blocking feature requests)
**Component**: Character data (`content/characters.json`, `lib/shopify/mock-products.ts`, UI/copy references)
**Status**: Planned; ready for implementation

## What Happened

User requested: "Rename Buddy the Husky to Rocky." Should have been a one-line slug change. Audit of `content/characters.json` revealed a catastrophic data scramble: 3 of 5 characters had mismatched slug/name/bio combinations. Two characters were named "Buddy". The slug `"rocky"` was already assigned to a Poodle. A literal `"buddy"→"rocky"` rename was impossible without collision resolution.

## The Brutal Truth

This is absolutely infuriating because it's the **fourth consecutive session** where a "simple" user request revealed a buried structural inconsistency:

1. "Switch to Resend" → full migration plan
2. "Why isn't Resend sending?" → observability + debug endpoint
3. "Resend still broken" → environment-variable root cause (NEWSLETTER_MODE stub)
4. "Anti-spam hardening" → 3-phase audit + implementation
5. (This session) "Rename one character" → full 5-character data incoherence

The pattern is brutally clear: **deferred cleanup compounds into bigger debt on the next change.** Session 260518 chose to defer `mock-products.ts` realignment (all 5 products had wrong breed-labels in titles despite correct images). We're now paying for that deferral with an extra phase in THIS session. The real lesson isn't "we should have fixed it then"—it's "every time we defer a cross-file inconsistency, the next person who touches that data pays double."

This hurts more because the data structure itself is sound (good separation of concerns: breed/bio/image in one entry, product titles in another). The scramble isn't a design flaw—it's entropy. Someone renamed a few entries and forgot to update all 5 references. Normal human error. But now it's expensive to untangle because the inconsistencies are **interdependent**: you can't fix the Husky name without moving the Corgi's slug, which breaks video references, which requires UI updates.

## Technical Details

**Current state of `content/characters.json`:**

| slug | name field | breed | bio opening | status |
|---|---|---|---|---|
| buddy | **Buddy** | Husky | "Buddy" (✓ matches) | Correct by accident |
| max | Max | Golden Retriever | "Max" (✓ matches) | Correct |
| bella | **Oscar** | Collie | "Bella" (✗ mismatch) | Name field wrong |
| oscar | **Buddy** | Corgi | "Oscar" (✗ mismatch) | Duplicate name, bio wrong |
| rocky | **Bella** | Poodle | "Rocky" (✗ mismatch) | Name field wrong, slug occupied |

**Why this breaks the user's request:**
- User: "Rename Buddy to Rocky" (expecting Husky to become `slug: "rocky"`)
- Reality: `slug: "rocky"` is already in row 5 (Poodle)
- Collision: can't assign `"rocky"` to the Husky without moving the Poodle

**The slug-rotation insight:**

After audit, the pattern emerged: each character has the **right breed/bio/image/accentColor** but the **wrong name/slug**. The bio prose describes the correct breed (e.g., "Bella" row has Collie breed + Collie-focused bio text). This suggests a **rotation or copy-paste error where only slug+name columns got scrambled**.

The cleanest fix: rotate slug+name back to match their breed:

| Breed | Intended Name | Intended Slug |
|---|---|---|
| Husky | Rocky | rocky |
| Golden Retriever | Max | max (no change) |
| Collie | Oscar | oscar |
| Corgi | Buddy | buddy |
| Poodle | Bella | bella |

**Parallel scramble in `lib/shopify/mock-products.ts`:**

All 5 individual-character products have mismatched breed-labels in titles (e.g., "Oscar the Golden Retriever" when the product should show a Corgi image). This was flagged in session 260518 and **intentionally deferred**. Fixing characters.json now without fixing mock-products.ts will make the situation worse: new character names on old product titles.

**Scope cascade:**

| File | Impact | Changes needed |
|---|---|---|
| `content/characters.json` | Core data | 5 entries: slug + name swap for 4 rows |
| `lib/shopify/mock-products.ts` | Product display | 5 products: title + handle + description + imageAlt |
| `channels.json` | Video playlists | `"buddy"` → `"rocky"` in 5 channel refs |
| `content/videos.json` | Video titles | `"buddy"` → `"rocky"` in 1 video title |
| UI copy & JSDoc | Component documentation | 5 component files: update character refs in comments/descriptions |

## What We Tried

1. **Minimal fix (rejected):** Rename only `buddy` → `rocky` in characters.json, leave mock-products.ts broken. 
   - Reason rejected: compounds the debt; next person to audit finds TWO inconsistencies in products (old names + old breeds).

2. **Full unscramble (CHOSEN):** Fix all 5 character names + slugs + all 5 product titles + all cross-file refs + UI copy.
   - Reason chosen: 5-phase approach, ~55 min execution, eliminates cascade risk for next feature.
   - ROI: this is the LAST session that has to touch character data for a while.

3. **Slug collision resolution (CHOSEN approach C):** Rotate all 5 slugs back to their breed-matched state.
   - Alternative A rejected: rename Poodle to "terra" (color-based), still scrambled.
   - Alternative B rejected: keep names scrambled, reorder rows (breaks order field).
   - Approach C: rotate slug+name in place, order field stays 1-5 (visual captain order: Rocky/Husky first).

## Root Cause Analysis

How did character data get into this state in the first place?

1. **No single-source-of-truth for character identity.** Characters are defined in three places: `characters.json` (slug+name+breed), `mock-products.ts` (product title refs), and prose in bio/UI. Changing one meant updating three. Someone updated two and forgot the third.

2. **No validation schema bridging data-to-display.** If we had a `validateCharacterCrossReferences()` function that checked "slug matches name-field AND name appears in bio AND product has matching breed-label," this would have been caught at edit time.

3. **The 260518 deferral choice.** Explicitly choosing to defer mock-products.ts meant the person building characters v2 assumed "we'll fix products later." Later is now, and it's more expensive.

## Lessons Learned

1. **Deferred inconsistencies compound into worse problems.** The immediate cost of fixing products now (1 extra phase) is lower than the cost of shipping inconsistent products (support confusion, data quality loss, harder future refactoring). But if we'd fixed it in 260518 when it was top-of-mind, the two phases could have been one.

2. **Slug rotation is a refactoring primitive.** This pattern (move all values one position, realign refs) is common enough to document. If we hit this again, we can pattern-match faster. Consider a `scripts/rotate-character-slugs.js` utility that does the core data movement + validation in one pass.

3. **URL semantics shift silently when slugs change.** Old URL `/characters/buddy` will now load the Corgi page instead of the Husky. Pre-launch (zero inbound traffic), this is safe. Post-launch, you'd need redirects. Documenting that assumption matters.

4. **"Deferred for later" is dangerous in tight data models.** If this were a loosely-coupled system (character metadata pulled from an admin panel, products from a separate system), the desync would be visible. Here, they're tightly coupled by slug/name. Next time we design cross-file data refs, we should assume "fix immediately or document the async reconciliation process."

5. **Honest scoping prevents scope creep AND scope shrinkage.** The 260518 session could have chosen "fix everything now" but chose deferral. This session could choose "just fix characters.json and ship broken products," but chose full unscramble. Both choices were deliberate. The right call now is to own the full scope because the refactoring cost is still low; later it won't be.

## Next Steps

1. **Phase 1: Realign `content/characters.json`** (5 entries, ~2 min)
   - Rotate slug+name for rows 2-5 per above table
   - Update bio opening sentences to match new names
   - Verify accentColor + breed + image stay intact

2. **Phase 2: Update channel & video refs** (5 channel entries + 1 video title, ~3 min)
   - `channels.json`: swap `"buddy"` refs to `"rocky"` (5 places)
   - `content/videos.json`: update video title containing character name

3. **Phase 3: Fix `lib/shopify/mock-products.ts`** (5 products, ~5 min)
   - Update title: breed label must match product image asset
   - Update handle (slug derivative)
   - Update description + imageAlt for consistency

4. **Phase 4: Update UI copy & JSDoc** (5 component files, ~5 min)
   - `components/home/pack-member-cards.tsx`
   - `components/characters/character-card.tsx`
   - `components/characters/character-grid.tsx`
   - `app/characters/[slug]/page.tsx`
   - `lib/characters.ts` JSDoc comments

5. **Phase 5: Validate & ship** (~10 min)
   - `pnpm typecheck` (catch broken refs)
   - `pnpm lint` (code style)
   - `pnpm build` (next.js compile)
   - Grep audit: verify no remaining `"buddy"` refs to Husky
   - Dev smoke test: load each `/characters/[slug]` page, verify name+breed match

## Unresolved Questions

- **Husky funfact reference**: Current bio for Husky mentions a "golden snack" joke (leftover Golden-Retriever content). Should this be fixed? Deferred for brand-copy review (not a refactor scope).
- **Order field**: Currently 1-5 (Rocky/Husky first as captain, Max second, etc.). Slug rotation preserves this. Any reason to reorder? No—keep as-is.
- **Redirects**: Pre-launch, old `/characters/buddy` (Husky) URLs don't exist yet. No redirect needed. Document assumption if this changes.

---

**Related artifacts:**
- Brainstorm report: `plans/reports/brainstorm-260519-0544-character-rename-full-unscramble.md`
- Plan directory: `plans/260519-0544-character-rename-full-unscramble/`

**Plan status**: Ready to hand off to implementation phase.
