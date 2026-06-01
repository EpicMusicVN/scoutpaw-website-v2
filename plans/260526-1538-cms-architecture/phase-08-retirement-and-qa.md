---
phase: 8
title: "Retirement and QA"
status: pending
priority: P1
effort: "0.5-1d"
dependencies: [2, 3, 4, 5, 6, 7]
---

# Phase 8: Retirement and QA

## Overview

Lock the migration. Delete `content/*.json`. Remove the json-source adapter. Make `CONTENT_SOURCE=payload` the default. Update docs. Run full-site Lighthouse + smoke pass. Final QA gate before declaring the CMS the source of truth.

## Requirements

- Functional:
  - All content adapter methods read from Payload exclusively
  - JSON-source adapter removed
  - All `content/*.json` files removed
  - `CONTENT_SOURCE` env var either removed or defaults to `payload` with no `json` fallback
  - Documentation (`docs/codebase-overview.md`, `docs/development-roadmap.md`, `docs/project-changelog.md`) reflects new state
- Non-functional:
  - Full Lighthouse pass across `/`, `/characters`, `/characters/[slug]` (×5), `/top-picks`, `/watch`, `/coming-soon/[slug]` (each)
  - All Core Web Vitals stable vs. pre-migration baseline
  - Editor smoke pass: log in, edit each collection + global, draft, preview, publish, observe public update

## Architecture

```
Before                              After
─────────────                       ──────────────
lib/content/index.ts                lib/content/index.ts
  ├── json-source (default)           └── payload-source (only)
  └── payload-source

content/*.json                      content/ (deleted)
lib/content/sources/json-source     lib/content/sources/json-source (deleted)

CONTENT_SOURCE=json (default)       CONTENT_SOURCE removed (or defaults to payload)
```

## Related Code Files

- Delete: `content/site-config.json`
- Delete: `content/characters.json`
- Delete: `content/videos.json`
- Delete: `content/channels.json`
- Delete: `content/playlists.json`
- Delete: `content/top-picks.json`
- Delete: `content/coming-soon.json`
- Delete: `content/newsletter-content.json` (if created in Phase 4)
- Delete: `content/home-content.json` (if created in Phase 4)
- Delete: `lib/content/sources/json-source.ts`
- Modify: `lib/content/index.ts` (remove json source, drop the source-map indirection if only one source remains)
- Modify: `.env.local.example` (remove `CONTENT_SOURCE` or comment it as deprecated)
- Modify: `docs/codebase-overview.md` (update Stack + Content Adapter sections)
- Modify: `docs/development-roadmap.md` (mark CMS phase complete)
- Modify: `docs/project-changelog.md` (add CMS migration entry)
- Modify: `README.md` (if any content-source mention exists)

## Implementation Steps

1. **Pre-flight check:** ensure all phases 2–7 deployed to prod with `CONTENT_SOURCE=payload` for at least 48h without error spikes.
2. **Editor smoke pass:** with a CNL team member, walk through every collection + global. Edit one field each. Draft → preview → publish. Verify on public site. Note any UX friction.
3. **Snapshot diff:** capture HTML output of every public route with `CONTENT_SOURCE=json` (running on a one-off branch) vs. `CONTENT_SOURCE=payload`. Expect byte-identical modulo whitespace + dynamic timestamps. Any drift = bug, fix before deletion.
4. **Delete json sources:**
   - `git rm content/*.json`
   - `git rm lib/content/sources/json-source.ts`
5. **Simplify `lib/content/index.ts`:**
   ```ts
   import type { ContentSource } from "./adapter";
   import { payloadContentSource } from "./sources/payload-source";
   export const content: ContentSource = payloadContentSource;
   // (drop the env-driven map; one source is the truth now)
   ```
6. **Strip `CONTENT_SOURCE` env var** — remove from `.env.local.example`, Vercel env, any references in code. Document removal in changelog.
7. **Lighthouse pass:** run on prod (or preview deploy if matched config) for `/`, `/characters`, sample `/characters/[slug]`, `/top-picks`, `/watch`, sample `/coming-soon/[slug]`. Compare to baseline captured pre-Phase-1. Performance/SEO/Accessibility/Best-Practices must stay within ±2 points.
8. **Editor docs:** create `docs/cms-editor-guide.md` (or similar) — short page for CNL team covering:
   - Login URL
   - How to create/edit a Top Pick, Promotion, Character
   - Draft vs. publish workflow
   - How to schedule a promotion
   - Image upload best practices (max size, alt text)
   - How to copy a Shopify discount code into a Promotion
9. **Update `docs/codebase-overview.md`:**
   - Stack row: Content = "Payload CMS 3.0 (Postgres + R2)"
   - Mode flags table: drop `CONTENT_SOURCE` row
   - Content Adapter section: replace migration prose with "current state" prose
10. **Update `docs/development-roadmap.md`** — mark CMS phase complete with date.
11. **Update `docs/project-changelog.md`** — entry for CMS migration with version bump.
12. **Final security review (lightweight):**
    - Confirm `/admin` not indexable (`robots.txt` disallow + meta noindex on Payload routes)
    - Confirm rate limiting active on login
    - Confirm `PAYLOAD_SECRET` rotated post-launch (one-time cycle)
    - Confirm R2 bucket CORS scoped to production domain
13. **Tag the release:** `git tag v0.2.0-cms` or per project versioning.

## Success Criteria

- [ ] All `content/*.json` removed from repo
- [ ] `lib/content/sources/json-source.ts` removed
- [ ] `lib/content/index.ts` simplified to single source
- [ ] `CONTENT_SOURCE` env var removed
- [ ] All public routes return 200 with snapshot-equivalent content
- [ ] Lighthouse scores within ±2 points of pre-migration baseline across sampled routes
- [ ] CNL editor smoke pass completed; no blocking UX issues
- [ ] `docs/cms-editor-guide.md` written
- [ ] `docs/codebase-overview.md` updated
- [ ] `docs/development-roadmap.md` + `docs/project-changelog.md` updated
- [ ] Robots/noindex on `/admin` confirmed
- [ ] `pnpm typecheck` + `pnpm lint` pass with no warnings
- [ ] Release tagged

## Risk Assessment

- **Rollback after JSON deletion** → if Payload data corrupts post-deletion, no quick rollback. Mitigation: take a final Postgres snapshot + R2 bucket inventory before this phase. Keep `content/*.json` in git history (deletion commit) so it's recoverable.
- **Lighthouse regression** → if scores drop, investigate before celebrating. Likely culprits: Payload depth-2 queries returning more data, image URLs not cached. Mitigate via `unstable_cache` wrappers.
- **Editor finds breaking UX issue last-minute** → fix in-place, don't roll back. Pre-launch editor smoke (step 2) should catch.
- **`PAYLOAD_SECRET` rotation breaks active sessions** → expected; document the brief logout in the editor guide.
- **Forgotten JSON consumer** → grep for `content/.*\.json` references before deletion; fix any stragglers.

## Post-Migration Open Questions

These remain after Phase 8 ships — track as separate plans/issues:

1. **2FA for admin** — add TOTP plugin if compliance requires
2. **Audit log retention** — set a max-age on Payload's `versions` table
3. **Shopify code sync** — auto-validate `promotions.shopifyCodeSlug` against Shopify Admin API
4. **Editor onboarding** — record a short walkthrough video for CNL team
5. **Backup strategy** — automated Postgres + R2 backups (Vercel/Neon usually built-in; document)
6. **Multi-language** — defer until requested
