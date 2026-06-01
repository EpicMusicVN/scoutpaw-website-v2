# Brainstorm — CMS Architecture for ScoutPaw

**Date:** 2026-05-26
**Branch:** main
**Status:** Approved direction, ready for `/ck:plan`

## Problem Statement

CNL Team needs to manage website content (Home, Characters, Watch, Top Picks, hero banners, promos, media, products, YouTube links, newsletter copy) without editing code. Requires:
- Login + role-based access (admin / editor)
- Polished editor UI for non-technical users
- Draft + publish workflow with preview
- Promo/deal management with scheduling
- Open-source, self-hosted, scalable, maintainable
- Integration with existing Next.js 15 + Vercel + Shopify + R2 stack

## Current State

- Next.js 15 App Router, React 19, TypeScript strict, Tailwind 3.4
- Content layer is already **adapter-shaped** (`lib/content/`): json source active, sanity skeleton placeholder
- All content modeled in Zod (`lib/content/schemas.ts`) — single source of truth
- Shopify Storefront API integrated (mock + live modes)
- Newsletter via Resend (stub + live modes)
- Media on Cloudflare R2 (asset-url resolver)
- No auth, no admin, no DB

## Constraints (user-confirmed)

1. **Re-evaluating CMS choice fully** — Sanity not locked in despite skeleton
2. **Discount enforcement stays in Shopify** — CMS handles display + scheduling only
3. **Self-host on Vercel / Railway** — no SaaS CMS
4. **1–3 non-technical editors** — UI polish > power features
5. **Incremental migration by domain** — one collection at a time
6. **Newsletter = on-site copy only** — no email campaign builder
7. **Drafts + publish + preview required**

## Evaluated Approaches

### Option A — Payload CMS 3.0 (Recommended)

**What:** TypeScript-first headless CMS that runs INSIDE Next.js as same-process admin route. Postgres or MongoDB. MIT license. Acquired by Figma 2024, fully OSS.

| Pros | Cons |
|---|---|
| Same Next.js deployment — no separate service | 3.0 still relatively new (2024 GA) |
| Best editor UI in OSS class for non-tech users | Smaller plugin ecosystem than Strapi |
| Built-in draft + versioning + publish | Postgres connection limits on Vercel Hobby (mitigated via pooled URL) |
| Code-defined collections in TS (mirror Zod) | |
| Local API = in-process reads, zero HTTP | |
| RBAC + field-level access built-in | |
| S3-compatible upload adapter (R2 fits) | |
| Active dev, Figma-funded | |

### Option B — Strapi

| Pros | Cons |
|---|---|
| Mature, large community | Requires SEPARATE service (Railway/Render) — breaks single-deployment goal |
| Lots of plugins | Many useful plugins are paid (Enterprise) |
| OK editor UI | Draft system less polished than Payload |
| Decent RBAC | JS-first, not TS-native — Zod mapping is rougher |

**Verdict:** Reasonable fallback only if Payload 3.0 stability becomes a real concern.

### Option C — Directus

| Pros | Cons |
|---|---|
| Powerful for data-heavy apps | DB-first schema (less code-driven) — worse fit for Zod-driven repo |
| Excellent SQL access | Editor UI is powerful but takes training |
| Postgres-native | BSL license — watch usage clauses |

**Verdict:** Wrong shape for this project (marketing site, not data platform).

### Option D — KeystoneJS

| Pros | Cons |
|---|---|
| TS-friendly, code-defined | No built-in draft/publish (you'd build it) |
| Decent for engineering teams | Editor UI utilitarian — non-tech users notice |
| | Community smaller than Payload's |

**Verdict:** Misses the draft workflow requirement out of the box.

### Option E — Sanity (original choice)

| Pros | Cons |
|---|---|
| Best-in-class editor UX (Studio) | SaaS — violates self-hosted requirement |
| Strong real-time collab | Vendor lock-in, document pricing |
| GROQ query language | |

**Verdict:** Eliminated by self-host constraint.

### Option F — Decap CMS / TinaCMS (git-based)

| Pros | Cons |
|---|---|
| No DB, no auth backend to manage | No real drafts-with-preview (commits = deploy) |
| Free | Promo scheduling needs DB cron — bad fit |
| Content stays in repo | Editor UI minimal |
| | Git push latency = "save" feels slow |

**Verdict:** Cheapest but breaks the draft + scheduling requirements.

## Recommended Solution — Payload CMS 3.0

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Vercel — single deployment                                  │
│                                                               │
│  ┌─────────────────────────┐    ┌───────────────────────┐   │
│  │ Next.js Public App      │    │ Payload Admin /admin  │   │
│  │ (existing surfaces)     │    │ - Editor UI           │   │
│  │ + content adapter       │◄───┤ - Email/pw auth + JWT │   │
│  └────────────┬────────────┘    │ - RBAC (admin/editor) │   │
│               │                 │ - Drafts + Versions   │   │
│               │                 └───────────┬───────────┘   │
│               └──── Payload Local API ◄─────┘               │
│                          │ (in-process, no HTTP)            │
└──────────────────────────┼──────────────────────────────────┘
                           ▼
    ┌──────────────────────┐      ┌──────────────────────┐
    │ Vercel Postgres      │      │ Cloudflare R2        │
    │ content + users +    │      │ media uploads        │
    │ drafts + versions    │      │ (S3-compat adapter)  │
    └──────────────────────┘      └──────────────────────┘

  Shopify ──── source of truth for discount codes + checkout
     ▲
     │  CMS Promotion collection stores ONLY: code slug,
     │  banner copy, image, schedule window, active flag.
     └─ Code enforcement stays in Shopify.
```

### Data Layer Mapping

Existing Zod → Payload collections/globals:

| Zod schema | Payload artifact | Notes |
|---|---|---|
| `CharacterSchema` | Collection `characters` | Slug, poses[], products[], accentColor |
| `VideoSchema` | Collection `videos` | FK to channels + playlists |
| `ChannelSchema` | Collection `channels` | FK to character |
| `PlaylistSchema` | Collection `playlists` | videoIds[] |
| `TopPickSchema` + `DealBlockSchema` | Collection `top-picks` + Global `top-picks-deal` | Deal = singleton |
| `ComingSoonPageSchema` | Collection `coming-soon-pages` | |
| `SiteConfigSchema` | Global `site-config` | Brand, palette, nav |
| *(new)* `PromotionSchema` | Collection `promotions` | Banner + Shopify code slug + window |
| *(new)* `User` | Collection `users` | Payload built-in |
| *(new)* `NewsletterContent` | Global `newsletter-content` | Signup block copy |
| *(new)* `HomeContent` | Global `home-content` | Hero copy + featured selection |

Zod schemas remain validation contracts in the adapter output path.

### Content Adapter Swap

- New: `lib/content/sources/payload-source.ts` implementing `ContentSource`
- Uses Payload Local API (in-process, single Postgres query, zero HTTP)
- Activated by `CONTENT_SOURCE=payload`
- Existing `sanity-source.ts` skeleton: delete after cutover

### Auth + RBAC

- Payload email/password auth, HTTP-only JWT cookie
- Roles: **admin** (full CRUD + user management) / **editor** (content CRUD only)
- Field-level access on sensitive flags (e.g., `siteConfig.legal`)
- Lockout policy + optional 2FA plugin (post-MVP)

### Drafts + Preview

- `versions: { drafts: true }` on user-facing collections
- Next.js Draft Mode cookie set via "Preview" button → adapter pulls `?draft=true`
- Publish triggers `revalidateTag()` for affected paths
- Public reads = SSG/ISR unchanged

### Promotion Handling (Shopify-CMS Bridge)

CMS owns: image, headline, subhead, CTA copy, schedule window, code slug to display.
Shopify owns: actual code, percentage, validation, checkout enforcement.

Flow: marketing creates code in Shopify admin → copies slug into CMS Promotion → schedules → publishes. Site auto-reveals/hides by `startsAt`/`endsAt`.

**Avoids 3-6 weeks of redundant work.**

### Migration Plan (Incremental, by Domain)

1. **Foundation** — Install Payload, wire Postgres + R2 adapter, create User collection, seed first admin, deploy `/admin` route
2. **Top Picks** — Highest editorial value, smallest schema. Migrate + flip env
3. **Promotions** — New collection, no JSON migration. Wire banner component
4. **Site Config + Newsletter copy + Home content** — Globals migration. Low risk
5. **Characters + Channels + Playlists + Videos** — FK relationships, image migration
6. **Coming Soon pages** — Final cleanup
7. **Retire** — Delete `content/*.json`, delete `sanity-source.ts`, lock `CONTENT_SOURCE=payload`

Each phase = own PR, own QA gate, env-flag rollback.

## Implementation Considerations

### Files Touched (Net)

**New:**
- `payload.config.ts` (root)
- `lib/payload/` — collections, globals, access, hooks
- `lib/content/sources/payload-source.ts`
- `app/(payload)/admin/[[...segments]]/page.tsx` (admin route)
- `app/(payload)/api/[...slug]/route.ts` (Payload API)
- `scripts/seed-from-json.ts` (one-time per collection)

**Modified:**
- `lib/content/index.ts` — register payload source
- `.env.local.example` — add `DATABASE_URI`, `PAYLOAD_SECRET`, R2 creds
- `next.config.ts` — Payload Next.js plugin

**Deleted (after cutover):**
- `content/*.json`
- `lib/content/sources/sanity-source.ts`

### Hosting Cost (rough)

- Vercel Pro (if needed for connection limits): $20/mo
- Vercel Postgres Hobby: free up to 256 MB → Pro: ~$20/mo for content scale
- Cloudflare R2: already in stack, near-free at this volume
- **Estimated total CMS infra cost: $0–40/mo**

## Risks + Mitigations

| Risk | Mitigation |
|---|---|
| Payload 3.0 maturity | MIT-licensed, fork-safe; pin minor versions; budget time for upgrade testing |
| Vercel cold starts on admin | Acceptable — editors are 1–3 people; if painful later, split admin to Railway |
| Postgres connection limits (Hobby) | Use pooled connection string; ISR caches public reads |
| Editors break required fields | Payload validators + Zod parse on adapter output (double-check) |
| Migration breaks live site | Per-collection env flips = instant rollback per domain |
| R2 upload misconfig | Phase media migration AFTER schema migration; existing assets keep working |

## Security Considerations

- Admin route protected by Payload auth middleware
- CSRF tokens on mutations
- HTTP-only JWT, secure cookie
- Rate limiting on `/admin/login` (Payload built-in or Vercel Edge config)
- Audit log: Payload versions table tracks who edited what
- Secrets: `PAYLOAD_SECRET`, `DATABASE_URI`, R2 keys → Vercel env vars only
- No public mutation API — Local API only on read path

## Out of Scope

- Email campaign management → use Resend + Loops/Beehiiv if needed
- Discount code enforcement → Shopify
- A/B testing → bolt on Vercel Edge Config or PostHog later
- Multi-language → defer until requested
- Native mobile app content delivery → REST API auto-generated by Payload if needed later

## Success Metrics

- CNL editor logs in, edits Top Picks deal, previews, publishes → live in <60s
- Marketing creates Shopify code → enters in CMS → schedules → banner appears on schedule window
- Zero code changes needed for content updates post-cutover
- Public site Lighthouse scores unchanged (SSG/ISR preserved)
- Adapter swap covered by integration tests on each collection

## Next Steps

1. Approve this brainstorm
2. Generate phased implementation plan via `/ck:plan`
3. Phase 1: Foundation (Payload install + Postgres + R2 + first user)
4. Phase 2: Top Picks migration as proof-of-concept
5. Phases 3-7: per migration plan above

## Unresolved Questions

- Vercel Postgres vs. Neon vs. Supabase Postgres — pick at install time (Vercel Postgres is most frictionless for single-deploy story; Neon has better free tier)
- 2FA plugin — needed for MVP or post-launch?
- Audit log retention period — default Payload settings OK, or compliance-driven?
- Whether to keep `sanity-source.ts` skeleton as a fallback during migration or delete immediately
