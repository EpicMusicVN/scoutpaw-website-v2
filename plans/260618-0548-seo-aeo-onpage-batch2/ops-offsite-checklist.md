# Ops / Off-Site Checklist — SEO/AEO Batch 2

Findings from the 2026-06-18 homepage scan that **cannot be fixed in code**. For
Ops/Marketing. The code fixes (Phases 1–4) only improve the live score **after** the
`feat/seo-aeo-remediation` branch deploys — bundle these with that deploy.

## 🔴 Canonical "points to a different page" (D1 — host mismatch)
The scan reported the canonical (`https://scoutpaw.tv/`) points to a different page than the
one served. Root cause = apex↔www mismatch: the site is served on one host while
canonical/sitemap/OG emit the other. **Not a code bug** — it's the host env.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://www.scoutpaw.tv` in Vercel (all environments).
- [ ] Add an apex→www **308** permanent redirect (`scoutpaw.tv` → `www.scoutpaw.tv`).
- [ ] Re-run the scan; confirm canonical == served URL == sitemap URL == OG url.
- Cross-ref: this is the long-standing **D1** task (see `260611-0509-.../ops-prep-checklist.md`
  and memory `canonical-host-www-vs-apex`).

## 🔴 Backlinks / off-site authority
Scan flagged: few links from other sites · 1 referring domain · 1 backlink · 1 IP. These are
**off-site** — no code fix exists.
- [ ] Start a digital-PR / backlink program (pet, parenting, veterinary media; directories;
      brand mentions). P2 in reassessment `reassessment-260617-0713`.
- [ ] Submit sitemap in Google Search Console + monitor indexing (D3).

## 🔴 Server clock "set incorrectly"
The scan measured a server-time skew. This is **host/infra**, not app code.
- [ ] Confirm prod host is Vercel — the `Date` response header is set correctly there
      automatically, so this is almost certainly a measurement artifact. Verify with
      `curl -I https://www.scoutpaw.tv` and compare `Date:` to real UTC.
- [ ] If a non-Vercel host is in play, sync the system clock (NTP).

## 🟡 Optional hardening — deterministic freshness date
`SITE_MODIFIED_DATE` falls back to `new Date()` at module load (build time for the statically
rendered homepage). To make it deterministic regardless of static/dynamic rendering:
- [ ] Set `NEXT_PUBLIC_BUILD_DATE` in Vercel to the build timestamp (e.g. a build-step env or
      `VERCEL_GIT_COMMIT` date). The code already prefers it when present. Low priority.

## Deploy dependency (read first)
- [ ] **None of the Batch-2 code gains are live until `feat/seo-aeo-remediation` deploys.**
      The single-`<h1>` fix, `X-Powered-By` removal, `dateModified`, image alt, anchor
      cleanup, and citation links are all dormant in production until then.

## Verified in code (Phases 1–4 — for reference, no ops action)
- Single `<h1>` on the homepage (was 2 — responsive dual-render fixed).
- `X-Powered-By` header removed (`poweredByHeader: false`).
- `dateModified` (build date) + `datePublished` in WebSite JSON-LD.
- 6 meaningful homepage images given descriptive `alt` (2 decorative poses intentionally
  keep `alt=""` — WCAG-correct, parent is `aria-hidden`).
- Overlong whole-card anchors collapsed via concise `aria-label`s.
- 2 outbound external citation links (AKC + Physiology & Behavior study) on the homepage.
