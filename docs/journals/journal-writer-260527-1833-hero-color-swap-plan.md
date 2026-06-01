# Hero Color Swap Plan: Breaking the Three-Cycle Reversal Loop

**Date:** 2026-05-27 18:33  
**Severity:** Medium  
**Component:** Hero banners (FullBleedHero, CharacterDetailHero, and 3 others), title + kicker color tokens  
**Status:** Brainstorm + 4-phase plan complete; flagged legibility risk mitigated via new utility

## What Happened

User requested a third color pivot in <48h: change "SCOUTPAW TV" kicker to dark blue (`text-ink-blue`) + main titles back to royal golden yellow across all hero banners. Brainstorm surfaced a reversal pattern that nearly shipped a legibility cliff identical to the one Plan J reversal had just fixed.

**Recent history:**
- Plan J (260526-1913): Added `.heading-gradient-gold` utility (navy surfaces, gold-fading-to-white titles)
- Plan J reversal (260526-14xx): Backed out to light cyan surfaces + navy titles + gold kickers (direct edits, no separate plan)
- This session: Re-swap to gold titles + blue kickers, keep light surfaces

Reusing `.heading-gradient-gold` on the current light cyan bg (`#c6e7e9`) would hide the right half of every title (white stop fades invisible on light paper)—exactly what forced the reversal. Brainstorm caught this before design phase.

## The Brutal Truth

This is frustrating because "change color X to Y" sounds trivial, but it exposed a three-cycle ping-pong that nearly landed us back at the exact legibility problem we'd already solved. The reversal pattern masked a fundamental issue: the existing gold gradient was designed for one background, not all backgrounds. Without surfacing recent history early, we would have shipped, caught the problem during QA, and cycled a fourth time.

The real kick in the teeth is that none of these swaps required deep technical reasoning—they were design toggles. But repeated toggles without context = wasted motion. The brainstorm phase (which felt like it added 15 minutes of overhead) probably saved a full rework cycle.

## Technical Details

**Core design decision: New utility `.heading-gradient-gold-light`**

The existing `.heading-gradient-gold` (from Plan J):
```
Linear gradient: dark-gold → brand-yellow → white (at 100%)
Designed for: navy hero surfaces (white stop invisible on dark bg)
```

New `.heading-gradient-gold-light` (this session):
```
Linear gradient: dark-gold → brand-yellow → dark-gold (symmetric, no white stops)
Designed for: light cyan + light surfaces (all stops visible anywhere)
Mobile fallback: 3-stop (compute/SVG limits on small viewports)
```

**Token decisions:**
- Kicker (`text-ink-blue` #1a3a5c): Existing body-text color, AA-safe on light backgrounds
- Scope: All 5 hero components including CharacterDetailHero

**Files written:**
- `plans/reports/brainstorm-260527-1833-hero-kicker-blue-title-gold.md`
- `plans/260527-1833-hero-kicker-blue-title-gold/plan.md`
- `plans/260527-1833-hero-kicker-blue-title-gold/phase-01-gold-light-utility.md`
- `plans/260527-1833-hero-kicker-blue-title-gold/phase-02-hero-component-swaps.md`
- `plans/260527-1833-hero-kicker-blue-title-gold/phase-03-live-render-verification.md`
- `plans/260527-1833-hero-kicker-blue-title-gold/phase-04-changelog-update.md`

## What We Tried

Investigated whether to reuse existing `.heading-gradient-gold` → flagged legibility cliff. Designed new symmetric utility instead. No failed implementations; the decision came during brainstorm, before code.

## Root Cause Analysis

Repeated color swaps without explicit audit trail create decision blindness. Each swap felt independent ("just change the config"), but together they formed a reversible loop. The reversal pattern wasn't wrong—it was fixing a real legibility problem—but the fix wasn't documented. Next designer (or future self) lost context and re-introduced the problem.

**Why it happened:** Brainstorm phase was skipped on the reversal. Direct edits shipped fast. Next request came in without reference to why the reversal happened.

## Lessons Learned

1. **Simple "color X to Y" requests often mask deeper patterns.** Spend 5 minutes asking "have we done this before? Why?" Prevents wasted cycles.

2. **New utilities are cheaper than reusing poorly-scoped ones.** The existing `.heading-gradient-gold` was optimized for one context (navy surfaces). Rather than fight it, we added `.heading-gradient-gold-light`. Both stay available; no tech debt.

3. **Brainstorm phase earns its time.** This session brainstorm cost ~15 min and caught a legibility cliff that would have spawned a 4th pivot. Brainstorm isn't bureaucracy; it's debugging before you code.

4. **Additive decisions scale better than reuse shortcuts.** KISS and DRY are not always compatible. When they conflict, additive (new utility) beats retrofitting (reuse broken abstractions).

## Next Steps

1. **Implement Phase 1:** Add `.heading-gradient-gold-light` to Tailwind config / CSS utility layer
2. **Implement Phase 2:** Swap kicker + title tokens across all 5 hero components
3. **Implement Phase 3:** Live render verification (typecheck, lint, dev server render test)
4. **Implement Phase 4:** Update changelog + roadmap

No blockers. All phases have clear, documented rationale. Ready to handoff to implementation phase.

---

**Plan location:** `D:\works\emvn\scoutpaw-v2\plans\260527-1833-hero-kicker-blue-title-gold\`  
**Brainstorm report:** `plans/260527-1833-hero-kicker-blue-title-gold/reports/brainstorm-260527-1833-hero-kicker-blue-title-gold.md`  
**Key decision:** Add new `.heading-gradient-gold-light` utility (symmetric, light-surface-safe) instead of reusing existing one. Breaks the reversal cycle by addressing the actual legibility cliff.  
**Status:** Plan complete. No technical blockers. Ready for Phase 1 start.

---

**Status:** DONE  
**Summary:** Planned third hero color pivot in <48h; surfaced and mitigated reversal cycle via new gradient utility. Brainstorm caught legibility cliff that would have forced a 4th pivot.  
**Concerns/Blockers:** None. Plan hydrated with explicit rationale to prevent future reversals.
