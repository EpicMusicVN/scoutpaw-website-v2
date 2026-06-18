# SEO/AEO On-Page Remediation Batch 2

**Date**: 2026-06-18 05:48
**Severity**: High
**Component**: Homepage (FullBleedHero, schema, headers, accessibility)
**Status**: Completed (code fixes + ops checklist); awaiting feat/seo-aeo-remediation deploy

## What Happened

A fresh 2026-06-18 homepage SEO/AEO scan surfaced ~17 findings. The prior remediation (260617-0458) had achieved single *semantic* H1 but missed a lurking bug: the responsive layout rendered the H1 + description *twice* in raw HTML — once mobile-visible (md:hidden) and once desktop-visible (hidden md:flex). CSS-aware browsers hid one copy per breakpoint; CSS-blind crawlers counted both. This single root cause explained "duplicate H1", "duplicate heading texts", and "2 duplicate text blocks (Max, Rocky…)" — they were never three separate bugs.

Batch 2 fixed that dual-render, stripped X-Powered-By, wired build-time freshness signals (dateModified), added descriptive alt attributes to 6 homepage images, diversified internal anchor text, and added 2 external research citations on the homepage.

## The Brutal Truth

The prior remediation's "single H1" claim was semantically true but structurally incomplete. The DOM still emitted two copies to any crawler reading raw HTML. This is embarrassing because it's a *layout* problem, not a schema problem — someone should have done a quick `curl | grep "<h1>"` before closing the ticket. The real frustration: these fixes don't go live until the entire `feat/seo-aeo-remediation` branch deploys; they're dormant until then. If deploy slips, the scan score stays broken in prod for another sprint.

## Technical Details

**FullBleedHero root cause:**
```
<div className="relative md:absolute md:inset-0">
  {/* Mobile: visible, inline positioning */}
  <CardBody ... /> {/* <h1> inside */}
</div>
<div className="hidden md:flex md:absolute md:inset-0">
  {/* Desktop: visible, absolute overlay */}
  <CardBody ... /> {/* <h1> inside — DUPLICATE in raw HTML */}
</div>
```
Fix: render CardBody once, toggle layout via responsive utility classes (`relative` on mobile → `md:absolute md:inset-0` on desktop). No JS, one DOM copy.

**Other fixes verified:**
- `next.config.ts`: `poweredByHeader: false` — X-Powered-By header gone.
- `lib/seo/build-date.ts`: build-time constant exported; websiteSchema uses it for `dateModified` + `datePublished`.
- `components/home/menu-cards.tsx`, `video-card.tsx`: 6 images now have descriptive `alt` attributes.
- `components/home/calming-science-note.tsx`: new component with 2 external citations (AKC, Physiology & Behavior study). Integrated after VideoGrid in `app/(frontend)/page.tsx`.
- 2 decorative character poses kept `alt=""` intentionally; parent `aria-hidden` per WCAG.
- Overlong whole-card anchors now have concise `aria-label`s.

**Validation passed:**
- `pnpm typecheck`: clean.
- `pnpm lint`: clean.
- Live dev server: `curl | grep "<h1>"` confirms single occurrence in raw HTML.
- Metadata check: `X-Powered-By` absent, `dateModified` present in view-source.

**Code-reviewer outcome**: DONE, no blocking issues. One optional Medium noted: wire `NEXT_PUBLIC_BUILD_DATE` in CI for deterministic freshness (added to ops-offsite-checklist, not blocking).

## What We Tried

1. **Hero dedup**: considered CSS portal / shared node across breakpoints — rejected as overkill. Chose single render + responsive positioning (KISS).
2. **Freshness**: chose build-time constant over attempting real-time CMS `updatedAt` (out of scope, requires CMS wiring).
3. **Citations**: chose 2 peer-reviewed sources over marketing-only claims; verified URLs at build.
4. **Scope boundary**: captured 3 off-site / ops findings in ops-offsite-checklist (canonical apex↔www mismatch, backlinks, server clock) — documented, not coded.

## Root Cause Analysis

**Responsive dual-render bug:**
Prior remediation focused on semantic HTML structure (ensuring one H1 element was the "active" one via context/logic). It never audited *how many times the entire CardBody renders* in the actual DOM. The responsive layout pattern (mobile via `md:hidden`, desktop via `hidden md:flex`) is common, but **both conditionals evaluate to true when rendering for SEO crawlers** — they don't understand CSS media queries, they see raw HTML. The fix assumes the implementation team understood the dual-render was there; they didn't — it lived quietly in the responsive utility pattern.

**Why scan missed it first time:**
The first scan (260617) didn't catch this because the homepage was live *before* the prior remediation shipped. Batch 2 scan ran *after* code was written but *before* feat/seo-aeo-remediation deployed, surfacing the interim state. It's not a regression; it's a finding the code fix already addressed that deploy was holding hostage.

## Lessons Learned

1. **Crawlers don't understand CSS media queries**: Responsive patterns like `md:hidden`/`hidden md:flex` render *all* variants to crawlers. Audit raw HTML, not rendered DOM.
2. **"Single semantic H1" ≠ "single H1 in raw HTML"**: Check both. Use `curl` + grep, not browser dev tools.
3. **Defer code-only finds until deploy window**: Fixes that can't go live immediately are demoralizing. Bundle batch findings with their deploy date.
4. **Build-time freshness is good enough**: `dateModified` from deploy time satisfies AEO freshness checks without real-time CMS wiring. Satisfies without over-engineering.

## Next Steps

1. **Code changes**: Ready for review. Not committed pending user diff review.
2. **Deploy**: All fixes are dormant until `feat/seo-aeo-remediation` merges and deploys to prod.
3. **Ops checklist**: 4 items for Ops/Marketing (ops-offsite-checklist.md):
   - Canonical apex↔www 308 redirect + NEXT_PUBLIC_SITE_URL env (D1 blocker).
   - Digital PR / backlink program (P2).
   - Verify server clock (likely non-issue on Vercel).
   - Optional: wire NEXT_PUBLIC_BUILD_DATE in CI.
4. **Post-deploy validation**: Re-run SEO/AEO scan after deploy; confirm score improves and single H1 is live.
