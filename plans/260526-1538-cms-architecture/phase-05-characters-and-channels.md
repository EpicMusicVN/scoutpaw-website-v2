---
phase: 5
title: "Characters and Channels"
status: pending
priority: P1
effort: "1.5-2d"
dependencies: [1]
---

# Phase 5: Characters and Channels

## Overview

Migrate the two FK-linked content types that drive the most visible surfaces: characters (5 docs, `/characters`, `/characters/[slug]`, home showcase) and channels (FK to character, drives `/watch` channel-of-the-day). Higher risk than prior phases because: relational data, many images per doc (poses array + character products), and 5 character-specific SSG routes that must stay green.

## Requirements

- Functional:
  - Collection `characters` mirrors `CharacterSchema` including `poses[]`, `products[]`, `merchCtaHref`, `accentColor`, `order`, atmosphere/theme fields
  - Collection `channels` mirrors `ChannelSchema` with FK to `characters` via `relationship` field
  - All 5 characters migrated with all pose images + product images uploaded to R2
  - All current channels migrated, FKs preserved
  - Adapter methods: `getCharacters()`, `getCharacterBySlug()`, `getChannels()` swap to Payload Local API
- Non-functional:
  - `/characters` and each `/characters/[slug]` SSG output identical pre/post-flip (snapshot test)
  - Image migration preserves bare-key naming so `lib/utils/asset-url.ts` continues to work
  - `generateStaticParams` for `/characters/[slug]` reads from Payload, returns same 5 slugs

## Architecture

```
Payload Collections:
  - characters
      └── relationship: products[] (inline blocks) — kept inline, not separate collection
      └── upload: image, poses[]
  - channels
      └── relationship: character → characters (slug-based)
      └── relationship: latestVideo → videos (deferred until Phase 6)

Image flow:
  public/assets/characters/*.png ─┐
  public/assets/shop/*.jpg        ├──→ seed script uploads to R2
                                  └──→ Payload media collection
                                         │
                                         ▼
                              characters.image, characters.poses[],
                              characters.products[].image
                                         │
                                         ▼
                             adapter returns bare key (e.g. "characters/golden-1.png")
                             so existing asset-url resolver still works
```

**Key decision:** `products[]` stays inline on the character doc as a Payload `array` field (not a separate collection). Reason: tight 1:N ownership, no cross-character reuse, simpler editor UX.

## Related Code Files

- Create: `lib/payload/collections/characters.ts`
- Create: `lib/payload/collections/channels.ts`
- Create: `scripts/seed-characters.ts`
- Create: `scripts/seed-channels.ts`
- Create: `scripts/migrate-images-to-r2.ts` (shared utility — also used by Phase 6)
- Modify: `payload.config.ts` (register collections)
- Modify: `lib/content/sources/payload-source.ts` (implement `getCharacters`, `getCharacterBySlug`, `getChannels`)
- Reference: `content/characters.json`, `content/channels.json`, `lib/content/character-themes.ts`

## Implementation Steps

1. **`lib/payload/collections/characters.ts`** — mirror `CharacterSchema`:
   ```ts
   import type { CollectionConfig } from "payload";
   import { isEditorOrAdmin } from "../access/roles";
   import { revalidateTag } from "next/cache";

   export const characters: CollectionConfig = {
     slug: "characters",
     versions: { drafts: true },
     access: { read: () => true, create: isEditorOrAdmin, update: isEditorOrAdmin, delete: isEditorOrAdmin },
     hooks: { afterChange: [({ doc }) => { revalidateTag("characters"); revalidateTag(`character-${doc.slug}`); }] },
     fields: [
       { name: "slug", type: "text", required: true, unique: true, index: true },
       { name: "name", type: "text", required: true },
       { name: "breed", type: "text", required: true },
       { name: "tagline", type: "text" },
       { name: "bio", type: "textarea" },
       { name: "quote", type: "text", required: true },
       { name: "image", type: "upload", relationTo: "media", required: true },
       { name: "poses", type: "array", required: true, minRows: 1, fields: [
         { name: "asset", type: "upload", relationTo: "media", required: true },
       ]},
       { name: "products", type: "array", fields: [
         { name: "title", type: "text", required: true },
         { name: "image", type: "upload", relationTo: "media", required: true },
         { name: "badge", type: "text" },
         { name: "ctaHref", type: "text", required: true },
       ]},
       { name: "merchCtaHref", type: "text" },
       { name: "accentColor", type: "text", required: true, validate: (v) => /^#[0-9a-fA-F]{6}$/.test(v ?? "") || "must be 6-digit hex" },
       { name: "order", type: "number", required: true, defaultValue: 0 },
     ],
   };
   ```
2. **`lib/payload/collections/channels.ts`** — FK to characters via relationship:
   ```ts
   export const channels: CollectionConfig = {
     slug: "channels",
     versions: { drafts: true },
     access: { /* same pattern */ },
     hooks: { afterChange: [() => revalidateTag("channels")] },
     fields: [
       { name: "slug", type: "text", required: true, unique: true, index: true },
       { name: "name", type: "text", required: true },
       { name: "tagline", type: "text" },
       { name: "subscriberCount", type: "number", required: true, defaultValue: 0 },
       { name: "videoCount", type: "number", required: true, defaultValue: 0 },
       { name: "url", type: "text", required: true },
       { name: "bannerColor", type: "text" },
       { name: "character", type: "relationship", relationTo: "characters", required: true },
       { name: "avatarColor", type: "text" },
       { name: "youtubeChannelId", type: "text" },
       { name: "avatarUrl", type: "text" },
       // latestVideo FK deferred to Phase 6
     ],
   };
   ```
3. **`scripts/migrate-images-to-r2.ts`** — shared helper:
   - Walk `public/assets/<prefix>/` for each input file
   - Read file → call `payload.create({ collection: "media", file, data: { alt } })`
   - Skip if `filename` already exists in media collection
   - Return map: `<bare-key> → <media-id>`
4. **`scripts/seed-characters.ts`** — for each character in JSON:
   - Resolve all images (main + poses + products) via the migration helper
   - `payload.create({ collection: "characters", data: { ...character, image: <id>, poses: [{ asset: <id> }, ...], products: [...], _status: "published" } })` (skip if slug exists)
5. **`scripts/seed-channels.ts`** — for each channel:
   - Look up `character` by slug → use ID for relationship
   - Create channel
6. **`payload-source.ts` implementations:**
   ```ts
   async getCharacters() {
     const payload = await getPayloadClient();
     const res = await payload.find({ collection: "characters", limit: 100, sort: "order", depth: 2 });
     return res.docs.map(d => CharacterSchema.parse({
       ...d,
       image: extractBareKey(d.image),
       poses: d.poses.map((p: any) => extractBareKey(p.asset)),
       products: (d.products ?? []).map((p: any) => ({ ...p, image: extractBareKey(p.image) })),
     }));
   }
   async getCharacterBySlug(slug: string) {
     const payload = await getPayloadClient();
     const res = await payload.find({ collection: "characters", where: { slug: { equals: slug } }, depth: 2, limit: 1 });
     return res.docs[0] ? CharacterSchema.parse(/* same mapper */) : null;
   }
   async getChannels() {
     // Similar; depth: 1 enough for character relationship
   }
   ```
7. **`extractBareKey(media)`** helper — given a Payload media doc with `filename` + `prefix`, reconstruct `prefix/filename` to match the existing `asset-url` resolver pattern. If using R2-only urls, return `media.url` and refactor consumers — pick one approach and document.
8. **Image-key strategy decision:** TWO options:
   - (A) Continue using bare keys (`characters/golden-1.png`); preserve filenames on upload; existing `asset-url.ts` keeps working.
   - (B) Return full R2 URLs from adapter; refactor consumers to use the URL directly.
   - **Recommendation: (A)** for this phase — minimal blast radius. Document switch to (B) as a future cleanup.
9. **Snapshot test:** before flip, capture HTML output of `/characters` + each `/characters/[slug]`. After flip with `CONTENT_SOURCE=payload`, re-capture, diff. Must be byte-identical (modulo whitespace + timestamps).
10. **Flip + monitor:** deploy with `CONTENT_SOURCE=payload`, watch 5xx rates on the 6 character routes for 1h.

## Success Criteria

- [ ] All 5 characters present in Payload, fully published
- [ ] All channels present, FK to character correctly resolved
- [ ] All character images (main + poses + products) live in R2
- [ ] `getCharacters()` snapshot matches JSON-source byte-identical
- [ ] `getCharacterBySlug("rocky")` etc. all return correct doc
- [ ] `generateStaticParams` for `/characters/[slug]` produces same 5 slugs
- [ ] Editor can edit a character (e.g. swap pose), preview, publish → `/characters/[slug]` updates
- [ ] Editor can reorder characters via `order` field; `/characters` carousel order updates
- [ ] `pnpm typecheck` + `pnpm lint` pass
- [ ] Lighthouse scores on `/characters` and one `/characters/[slug]` unchanged

## Risk Assessment

- **Image bare-key mismatch with R2 storage adapter** → S3 storage plugin may rename or prefix; configure `prefix` per collection + verify URLs match expectation. If mismatch, choose option (B) from step 8.
- **`poses[]` order changes on save** → use array field with `id` per row; Payload preserves order. Verify in QA.
- **`accentColor` validator too strict** → existing palette only uses 6-digit hex; aligns; safe.
- **`products[]` migration drops a field** → snapshot diff catches; seed script must include all CharacterProductSchema fields.
- **`/characters/[slug]` 404 on cutover** → SSG generation only runs at build; if Payload empty at build, no pages generated. Mitigation: ensure seed runs in CI before build, OR set `dynamic = "force-dynamic"` temporarily on cutover deploy.
- **Image cache busting** → R2 URLs stable per upload; if same filename re-uploaded, Payload assigns new ID by default → URL changes. Acceptable.
