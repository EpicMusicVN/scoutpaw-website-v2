---
phase: 3
title: "Promotions Collection"
status: pending
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 3: Promotions Collection

## Overview

New collection — no JSON migration. Editors create dated promotional banners + deal slots that reference a Shopify discount code by slug. Public site renders the banner when `startsAt ≤ now ≤ endsAt` AND `active === true`. **Shopify owns the actual code + checkout enforcement.** CMS owns presentation + scheduling.

May run in parallel to Phase 2 once Phase 1 ships.

## Requirements

- Functional:
  - Collection `promotions` with: title, badge, headline, subhead, image, ctaLabel, ctaHref, shopifyCodeSlug (free-text, just the code string), startsAt (datetime), endsAt (datetime), active (boolean), placement (homepage|top-picks|sitewide)
  - Editor creates a promo, schedules window, publishes — banner appears at scheduled time
  - Adapter method `getActivePromotions(placement?)` returns currently-live promotions for a given placement
  - Public component `<PromoBanner placement="..." />` reads adapter, renders or returns null
- Non-functional:
  - Banner visibility computed at request time (no need to wait for revalidation between `startsAt` and active)
  - Page-level ISR uses short revalidate (e.g. 60s) so scheduled flip-on/off is timely
  - Editor sees clear inline validation if `endsAt ≤ startsAt`

## Architecture

```
Payload Collection: promotions
  - placement enum
  - active flag (kill switch)
  - schedule window (startsAt/endsAt)
  - shopifyCodeSlug (display + copy-to-clipboard, NOT enforced)
              │
              ▼
adapter.getActivePromotions(placement)
  - findMany where placement = ? AND active = true
    AND startsAt <= now AND endsAt >= now
    AND _status = "published"
              │
              ▼
<PromoBanner placement="homepage" />
  - Server component, runs per request (or every 60s with ISR)
  - Renders first active promo for the placement, or null
              │
              ▼
User clicks CTA → links to Shopify storefront OR copies code
Shopify enforces the code at checkout.
```

## Related Code Files

- Create: `lib/payload/collections/promotions.ts`
- Create: `components/promo/promo-banner.tsx`
- Modify: `payload.config.ts` (register collection)
- Modify: `lib/content/schemas.ts` (add `PromotionSchema` + `PROMO_PLACEMENTS`)
- Modify: `lib/content/adapter.ts` (add `getActivePromotions(placement?: PromoPlacement)` method)
- Modify: `lib/content/sources/json-source.ts` (return `[]` — no JSON-side data; future-proof noop)
- Modify: `lib/content/sources/payload-source.ts` (implement `getActivePromotions`)
- Modify: `lib/content/index.ts` (re-export new types)
- Modify: `app/page.tsx` and `app/top-picks/page.tsx` (drop in `<PromoBanner />`)

## Implementation Steps

1. **Add `PromotionSchema` to `lib/content/schemas.ts`:**
   ```ts
   export const PROMO_PLACEMENTS = ["homepage", "top-picks", "sitewide"] as const;
   export const PromoPlacementSchema = z.enum(PROMO_PLACEMENTS);
   export type PromoPlacement = z.infer<typeof PromoPlacementSchema>;

   export const PromotionSchema = z.object({
     id: z.string().min(1),
     title: z.string().min(1),
     badge: z.string().optional(),
     headline: z.string().min(1),
     subhead: z.string().optional(),
     image: z.string().optional(),
     ctaLabel: z.string().default("Shop Deal"),
     ctaHref: z.string().min(1),
     shopifyCodeSlug: z.string().optional(),
     startsAt: z.string(), // ISO
     endsAt: z.string(),   // ISO
     active: z.boolean().default(true),
     placement: PromoPlacementSchema,
   });
   export type Promotion = z.infer<typeof PromotionSchema>;
   ```
2. **`lib/payload/collections/promotions.ts`** — collection with validators that enforce `endsAt > startsAt`:
   ```ts
   import type { CollectionConfig } from "payload";
   import { isEditorOrAdmin } from "../access/roles";
   import { revalidateTag } from "next/cache";

   export const promotions: CollectionConfig = {
     slug: "promotions",
     versions: { drafts: true },
     access: { read: () => true, create: isEditorOrAdmin, update: isEditorOrAdmin, delete: isEditorOrAdmin },
     hooks: { afterChange: [() => { revalidateTag("promotions"); }] },
     fields: [
       { name: "title", type: "text", required: true, admin: { description: "Internal only — not shown publicly" } },
       { name: "placement", type: "select", required: true, options: ["homepage","top-picks","sitewide"] },
       { name: "active", type: "checkbox", defaultValue: true, admin: { description: "Master kill switch; uncheck to disable instantly" } },
       { name: "badge", type: "text" },
       { name: "headline", type: "text", required: true },
       { name: "subhead", type: "textarea" },
       { name: "image", type: "upload", relationTo: "media" },
       { name: "ctaLabel", type: "text", defaultValue: "Shop Deal" },
       { name: "ctaHref", type: "text", required: true },
       { name: "shopifyCodeSlug", type: "text", admin: { description: "Discount code as configured in Shopify. Used for display + copy-to-clipboard only." } },
       { name: "startsAt", type: "date", required: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
       { name: "endsAt", type: "date", required: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
     ],
     validate: ({ data }) => {
       if (data?.startsAt && data?.endsAt && new Date(data.endsAt) <= new Date(data.startsAt))
         return "endsAt must be after startsAt";
       return true;
     },
   };
   ```
3. **Extend `lib/content/adapter.ts`:**
   ```ts
   getActivePromotions(placement?: PromoPlacement): Promise<Promotion[]>;
   ```
4. **`json-source.ts`:** `async getActivePromotions() { return []; }` — promotions only exist in Payload mode. Documented in the file.
5. **`payload-source.ts`:**
   ```ts
   async getActivePromotions(placement?: PromoPlacement) {
     const payload = await getPayloadClient();
     const now = new Date().toISOString();
     const res = await payload.find({
       collection: "promotions",
       where: {
         and: [
           { active: { equals: true } },
           { _status: { equals: "published" } },
           { startsAt: { less_than_equal: now } },
           { endsAt: { greater_than_equal: now } },
           ...(placement ? [{ placement: { equals: placement } }] : []),
         ],
       },
       depth: 1,
       sort: "-startsAt",
       limit: 5,
     });
     return res.docs.map(d => PromotionSchema.parse({ ...d, image: d.image?.url }));
   }
   ```
6. **`components/promo/promo-banner.tsx`** (server component):
   ```tsx
   import { content } from "@/lib/content";
   import type { PromoPlacement } from "@/lib/content";
   export async function PromoBanner({ placement }: { placement: PromoPlacement }) {
     const [promo] = await content.getActivePromotions(placement);
     if (!promo) return null;
     return (
       <section className="..." aria-label="Promotion">
         {/* badge / headline / image / CTA */}
       </section>
     );
   }
   ```
7. **Drop in** on `app/page.tsx` (`<PromoBanner placement="homepage" />` above the hero or in a dedicated slot) and `app/top-picks/page.tsx` (`<PromoBanner placement="top-picks" />`).
8. **ISR window:** on those pages set `export const revalidate = 60;` so the start/end flip is timely without manual revalidation.
9. **QA:** create a promo `startsAt = now + 2 min`, `endsAt = now + 5 min`, publish — verify banner appears within ~1 min, disappears within ~1 min of `endsAt`.

## Success Criteria

- [ ] `promotions` collection visible to editors with all fields + validators
- [ ] `endsAt ≤ startsAt` validation fires inline
- [ ] `getActivePromotions("homepage")` returns only live, published, in-window promos
- [ ] `<PromoBanner />` renders correctly on home + top-picks; returns null when no active promo
- [ ] Scheduling flip (startsAt/endsAt) works without manual publish/revalidate
- [ ] `active=false` kill switch hides banner within 60s
- [ ] `shopifyCodeSlug` displayed (copy-to-clipboard nice-to-have, ship without if tight)
- [ ] `pnpm typecheck` + `pnpm lint` pass

## Risk Assessment

- **Timezone confusion in date picker** → Payload stores UTC; document editor-facing tz in field help text; verify the picker shows local time correctly
- **Multiple overlapping promos for same placement** → adapter returns first (sorted `-startsAt`); document this; consider `priority` field if conflicts surface
- **Editor forgets to set `active`** → defaults to `true`; safe default
- **Drift between CMS `shopifyCodeSlug` and actual Shopify code** → out of scope to validate; doc'd as editor responsibility (Phase 8 could add an optional Shopify sync check)
- **Banner appears on stale ISR cache after `endsAt`** → 60s revalidate ceiling means worst case 1 min stale; acceptable
