---
phase: 4
title: "Globals Migration"
status: pending
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 4: Globals Migration

## Overview

Move three site-wide singletons into Payload Globals:
1. **`site-config`** — brand, palette, nav items, social, footer, legal (mirrors `SiteConfigSchema`)
2. **`newsletter-content`** — on-site signup block copy (headline, subhead, CTA, success copy)
3. **`home-content`** — homepage hero copy + featured selection (whatever text + image is hardcoded in `app/page.tsx` today)

Globals (not collections) because each is a singleton with editor-overridable copy. Low risk — read-only on public side, no FKs.

## Requirements

- Functional:
  - Three globals editable in admin with draft/publish
  - `getSiteConfig()` returns CMS data after env flip
  - New adapter methods: `getNewsletterContent()`, `getHomeContent()`
  - Site palette CSS variables continue to apply from CMS values
  - Nav items toggle (`enabled: true/false`) controllable from CMS
- Non-functional:
  - Validators enforce hex format on color fields
  - Lighthouse + CLS unchanged (palette swap is read-once at SSG)

## Architecture

```
Payload Globals:
  - site-config (1 doc)
  - newsletter-content (1 doc)
  - home-content (1 doc)
        │
        ▼
adapter methods:
  - getSiteConfig() → SiteConfigSchema
  - getNewsletterContent() → NewsletterContentSchema (new)
  - getHomeContent() → HomeContentSchema (new)
        │
        ▼
app/layout.tsx → palette + nav (already reads site-config)
components/home/newsletter-cta.tsx → reads newsletter-content
app/page.tsx → reads home-content
```

## Related Code Files

- Create: `lib/payload/globals/site-config.ts`
- Create: `lib/payload/globals/newsletter-content.ts`
- Create: `lib/payload/globals/home-content.ts`
- Create: `scripts/seed-globals.ts`
- Modify: `payload.config.ts` (register globals)
- Modify: `lib/content/schemas.ts` (add `NewsletterContentSchema`, `HomeContentSchema`)
- Modify: `lib/content/adapter.ts` (add `getNewsletterContent`, `getHomeContent`)
- Modify: `lib/content/sources/json-source.ts` (read from JSON for fallback)
- Modify: `lib/content/sources/payload-source.ts` (implement three methods)
- Modify: `lib/content/index.ts` (re-export types)
- Modify: `components/home/newsletter-cta.tsx` (consume `getNewsletterContent()`)
- Modify: `app/page.tsx` (consume `getHomeContent()` if hardcoded copy is found)
- Reference: `content/site-config.json`, `app/page.tsx` (extract hardcoded strings)

## Implementation Steps

1. **Add schemas to `lib/content/schemas.ts`:**
   ```ts
   export const NewsletterContentSchema = z.object({
     headline: z.string().min(1),
     subhead: z.string(),
     ctaLabel: z.string().default("Join the pack"),
     successHeadline: z.string().default("Welcome!"),
     successBody: z.string().default(""),
     placeholder: z.string().default("your@email.com"),
   });
   export type NewsletterContent = z.infer<typeof NewsletterContentSchema>;

   export const HomeContentSchema = z.object({
     hero: z.object({
       eyebrow: z.string().optional(),
       headline: z.string().min(1),
       subhead: z.string().optional(),
       primaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
       secondaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
       image: z.string().optional(),
     }),
     featuredVideoId: z.string().optional(),
     featuredCharacterSlug: z.string().optional(),
   });
   export type HomeContent = z.infer<typeof HomeContentSchema>;
   ```
2. **`lib/payload/globals/site-config.ts`** — mirror `SiteConfigSchema`, including nested palette, navItems (array), social (array), footer, legal. Use `text` fields with regex validators on hex codes. `versions: { drafts: true }`.
3. **`lib/payload/globals/newsletter-content.ts`** — small flat schema.
4. **`lib/payload/globals/home-content.ts`** — group for hero (eyebrow/headline/subhead/CTAs/image) + featured slots. `versions: { drafts: true }`.
5. **`payload.config.ts`** — register all three.
6. **`scripts/seed-globals.ts`** — read `content/site-config.json`, populate `site-config` global; seed newsletter-content + home-content with current hardcoded values harvested from existing components.
7. **`payload-source.ts` implementations** — single-doc lookups via `findGlobal({ slug })`. Image fields go through depth-1 fetch + `.url` extraction. Parse with respective Zod schema before return.
8. **`json-source.ts`** — for `getNewsletterContent` + `getHomeContent`: hardcode the current strings into a new `content/newsletter-content.json` + `content/home-content.json` to maintain JSON-mode parity. Alternative: throw `notImplemented` since JSON mode is being retired; document choice in commit msg.
9. **Wire consumers:**
   - `components/home/newsletter-cta.tsx` already has hardcoded copy — replace with `const cms = await content.getNewsletterContent(); ...`
   - `app/page.tsx` — extract hardcoded hero strings; replace with `getHomeContent()`
10. **QA:** flip palette accent color in admin → see it propagate; disable a nav item → it disappears; edit homepage hero → republish → see new copy live.

## Success Criteria

- [ ] Three globals editable with draft/publish
- [ ] Hex validators enforce 6-digit `#RRGGBB`
- [ ] `getSiteConfig()` output matches existing JSON shape exactly (no consumer breaks)
- [ ] `getNewsletterContent()` + `getHomeContent()` return expected shapes
- [ ] Nav toggle visible: disabling Watch in admin hides it from public nav
- [ ] Palette change in admin reflected on public site after revalidate
- [ ] Newsletter signup block reads from CMS copy
- [ ] Homepage hero copy reads from CMS
- [ ] `pnpm typecheck` + `pnpm lint` pass
- [ ] Lighthouse scores unchanged

## Risk Assessment

- **`SiteConfigSchema` already has a `.passthrough()` on `legal`** → preserve in Payload as a flexible group; document the escape hatch
- **`palette.*` hex validator collisions with Payload UI color picker** → use plain text + regex; UI polish can come later
- **CSS variables read once at SSG** → palette swap requires page revalidate, not just publish hook fire; ensure `revalidateTag("site-config")` triggers root layout revalidate (`revalidatePath("/", "layout")` may be needed)
- **`SiteConfig.legal.passthrough()` data loss** → seed script must preserve unknown keys
- **`navItems` ordering** — Payload array fields preserve order; verify
