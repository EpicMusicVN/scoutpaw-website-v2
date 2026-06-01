---
phase: 2
title: "Top Picks Migration"
status: pending
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 2: Top Picks Migration

## Overview

First content collection migrated to Payload. Proves the **adapter swap pattern** end-to-end: collection schema → seed-from-JSON → adapter method → env flip → public site reads from Payload. Top Picks chosen because: smallest schema, highest editorial value (deal block changes frequently), self-contained (no FKs).

## Requirements

- Functional:
  - Payload collection `top-picks` mirrors `TopPickSchema`
  - Payload global `top-picks-deal` mirrors `DealBlockSchema`
  - Editor can edit deal + pick fields, save draft, preview, publish
  - `payload-source.ts` implements `getTopPicks()` against the Local API
  - Flipping `CONTENT_SOURCE=payload` (per-method override allowed) routes `/top-picks` to CMS without code change
- Non-functional:
  - Output of `getTopPicks()` validates against existing Zod `TopPicksContentSchema` (defense-in-depth)
  - Page stays SSG; `revalidateTag('top-picks')` fires on publish
  - Lighthouse scores unchanged

## Architecture

Two artifacts: a collection (picks rows) + a global (single deal block). Adapter assembles them into the `TopPicksContent` shape consumers expect. `revalidateTag` hook on both artifacts triggers `/top-picks` rebuild.

```
content/top-picks.json (deprecated post-cutover)
        │
        ▼   one-time seed
Payload Collection: top-picks   Payload Global: top-picks-deal
        │                              │
        └──────────────┬───────────────┘
                       ▼
         lib/content/sources/payload-source.ts
                getTopPicks() → { deal, picks }
                       │
                       ▼ Zod parse (TopPicksContentSchema)
                       │
                       ▼
                /top-picks page (SSG + revalidateTag)
```

## Related Code Files

- Create: `lib/payload/collections/top-picks.ts`
- Create: `lib/payload/globals/top-picks-deal.ts`
- Create: `scripts/seed-top-picks.ts`
- Modify: `payload.config.ts` (register collection + global + revalidate hooks)
- Modify: `lib/content/sources/payload-source.ts` (implement `getTopPicks()`)
- Modify: `lib/content/index.ts` (optional: support per-method source override via env)
- Reference (read-only): `content/top-picks.json`, `lib/content/schemas.ts`

## Implementation Steps

1. **`lib/payload/collections/top-picks.ts`** — mirror `TopPickSchema`:
   ```ts
   import type { CollectionConfig } from "payload";
   import { isEditorOrAdmin } from "../access/roles";
   import { revalidateTag } from "next/cache";

   export const topPicks: CollectionConfig = {
     slug: "top-picks",
     versions: { drafts: true },
     access: {
       read: () => true,
       create: isEditorOrAdmin,
       update: isEditorOrAdmin,
       delete: isEditorOrAdmin,
     },
     hooks: {
       afterChange: [({ doc }) => { if (doc._status === "published") revalidateTag("top-picks"); }],
       afterDelete: [() => revalidateTag("top-picks")],
     },
     fields: [
       { name: "title", type: "text", required: true },
       {
         name: "category", type: "select", required: true,
         options: ["apparel","pet-supplies","pet-toys","home-living","others"],
       },
       { name: "image", type: "upload", relationTo: "media", required: true },
       { name: "badge", type: "text" },
       { name: "rating", type: "number", min: 0, max: 5 },
       { name: "popularity", type: "text" },
       { name: "ctaLabel", type: "text", defaultValue: "Shop Now" },
       { name: "ctaHref", type: "text", required: true },
       { name: "order", type: "number", required: true, defaultValue: 0 },
     ],
   };
   ```
2. **`lib/payload/globals/top-picks-deal.ts`** — mirror `DealBlockSchema`:
   ```ts
   import type { GlobalConfig } from "payload";
   import { isEditorOrAdmin } from "../access/roles";
   import { revalidateTag } from "next/cache";

   export const topPicksDeal: GlobalConfig = {
     slug: "top-picks-deal",
     versions: { drafts: true },
     access: { read: () => true, update: isEditorOrAdmin },
     hooks: { afterChange: [() => revalidateTag("top-picks")] },
     fields: [
       { name: "badge", type: "text", required: true },
       { name: "title", type: "text", required: true },
       { name: "description", type: "textarea" },
       { name: "image", type: "upload", relationTo: "media", required: true },
     ],
   };
   ```
3. **`payload.config.ts`** — also register a minimal `media` collection if not yet defined (Payload's S3 storage plugin needs it):
   ```ts
   import { topPicks } from "./lib/payload/collections/top-picks";
   import { topPicksDeal } from "./lib/payload/globals/top-picks-deal";
   collections: [users, media, topPicks],
   globals: [topPicksDeal],
   ```
4. **`scripts/seed-top-picks.ts`** — idempotent:
   - Read `content/top-picks.json`
   - Upload each `picks[].image` + `deal.image` to R2 via Local API `payload.create({ collection: "media", file: ... })` (parse bare key → filesystem path under `public/assets/`)
   - For each pick: `payload.create({ collection: "top-picks", data: { ..., image: <media-id>, _status: "published" } })` — skip if same title already exists
   - Set the global: `payload.updateGlobal({ slug: "top-picks-deal", data: { ..., image: <media-id> } })`
5. **`payload-source.ts` implement `getTopPicks()`:**
   ```ts
   async getTopPicks(): Promise<TopPicksContent> {
     const payload = await getPayloadClient();
     const [picksRes, deal] = await Promise.all([
       payload.find({ collection: "top-picks", limit: 100, sort: "order", depth: 1 }),
       payload.findGlobal({ slug: "top-picks-deal", depth: 1 }),
     ]);
     const data = {
       deal: { ...deal, image: deal.image?.url ?? "" },
       picks: picksRes.docs.map(p => ({ ...p, image: p.image?.url ?? "" })),
     };
     return TopPicksContentSchema.parse(data); // defense-in-depth
   }
   ```
6. **`lib/content/index.ts`** — optional per-method source override to allow incremental flip:
   ```ts
   // Per-method override pattern: CONTENT_SOURCE_TOP_PICKS=payload while CONTENT_SOURCE=json
   ```
   (Defer the override mechanism if not needed yet — for this phase, set `CONTENT_SOURCE=payload` after seeding in a dev env, validate, then flip in prod.)
7. **Wire `revalidateTag` consumption** — confirm `/top-picks` page uses `unstable_cache` or `fetch` with the tag. If not, add `unstable_cache(() => content.getTopPicks(), ["top-picks"], { tags: ["top-picks"] })` in the page loader.
8. **Local QA:** seed → log in → edit deal title → publish → confirm `/top-picks` rebuilds within seconds.
9. **Prod flip:** deploy with `CONTENT_SOURCE=payload` (or per-method override). Watch error rates for 1h.

## Success Criteria

- [ ] Collection + global render in admin with draft/publish UI
- [ ] Seed script imports all current picks + deal from JSON (idempotent)
- [ ] All images successfully uploaded to R2 via Payload media
- [ ] `getTopPicks()` returns data identical to JSON-source output (snapshot test)
- [ ] Editor edit → publish → public `/top-picks` reflects within 60s
- [ ] Editor can save draft, preview, then publish
- [ ] Rollback works: set `CONTENT_SOURCE=json`, page returns to JSON source
- [ ] `pnpm typecheck` + `pnpm lint` pass
- [ ] Lighthouse score on `/top-picks` unchanged

## Risk Assessment

- **Image migration fails partway** → seed script logs per-asset; re-run is idempotent (checks by filename + size)
- **Draft preview reveals draft content publicly** → Draft Mode cookie gated to admin session; verify cookie is HTTP-only + secure
- **Zod schema drift** → adapter parses output via `TopPicksContentSchema`; mismatch fails fast at request time, not silently
- **`revalidateTag` not firing on global update** → check Payload v3 global afterChange hook signature; fallback to time-based ISR (60s) as belt-and-braces
- **R2 public URL CORS** → confirm bucket CORS allows production domain; preview deploys use same R2 in MVP
