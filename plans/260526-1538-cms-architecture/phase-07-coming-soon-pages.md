---
phase: 7
title: "Coming Soon Pages"
status: pending
priority: P2
effort: "0.5d"
dependencies: [5]
---

# Phase 7: Coming Soon Pages

## Overview

Smallest remaining migration. Coming-soon pages back any nav item marked `enabled: false` in site-config — they share a layout, customise title + tagline + character mascot + newsletter signup tag. Depends on Phase 5 because each Coming Soon page references a character by slug.

## Requirements

- Functional:
  - Collection `coming-soon-pages` mirrors `ComingSoonPageSchema`
  - Each doc relates to a character (FK by slug)
  - Adapter methods `getComingSoonPages()` + `getComingSoonPageBySlug(slug)` swap to Payload
  - `generateStaticParams` for `/coming-soon/[slug]` reads from Payload
- Non-functional:
  - Output identical to JSON-source (snapshot test)
  - Newsletter signup `newsletterTag` flows through to Resend correctly

## Architecture

```
Payload Collection: coming-soon-pages
  ├── slug (route key)
  ├── navLabel
  ├── title
  ├── tagline
  ├── relationship: character → characters
  └── newsletterTag
         │
         ▼
adapter.getComingSoonPages() / getComingSoonPageBySlug(slug)
         │
         ▼
/coming-soon/[slug] (SSG)
```

## Related Code Files

- Create: `lib/payload/collections/coming-soon-pages.ts`
- Create: `scripts/seed-coming-soon.ts`
- Modify: `payload.config.ts` (register collection)
- Modify: `lib/content/sources/payload-source.ts` (implement 2 methods)
- Reference: `content/coming-soon.json`

## Implementation Steps

1. **Collection:**
   ```ts
   export const comingSoonPages: CollectionConfig = {
     slug: "coming-soon-pages",
     versions: { drafts: true },
     access: { /* same pattern */ },
     hooks: { afterChange: [({ doc }) => { revalidateTag("coming-soon"); revalidateTag(`coming-soon-${doc.slug}`); }] },
     fields: [
       { name: "slug", type: "text", required: true, unique: true, index: true },
       { name: "navLabel", type: "text", required: true },
       { name: "title", type: "text" },
       { name: "tagline", type: "textarea" },
       { name: "character", type: "relationship", relationTo: "characters", required: true },
       { name: "newsletterTag", type: "text", required: true },
     ],
   };
   ```
2. **Seed:** for each entry in `content/coming-soon.json`, resolve character by slug → relationship ID, create doc with `_status: "published"`.
3. **Adapter:**
   ```ts
   async getComingSoonPages() {
     const payload = await getPayloadClient();
     const res = await payload.find({ collection: "coming-soon-pages", limit: 50, depth: 1 });
     return res.docs.map(d => ComingSoonPageSchema.parse({
       ...d, characterSlug: d.character?.slug,
     }));
   }
   async getComingSoonPageBySlug(slug: string) {
     const payload = await getPayloadClient();
     const res = await payload.find({ collection: "coming-soon-pages", where: { slug: { equals: slug } }, depth: 1, limit: 1 });
     return res.docs[0] ? ComingSoonPageSchema.parse({ ...res.docs[0], characterSlug: res.docs[0].character?.slug }) : null;
   }
   ```
4. **QA:** flip env, hit each `/coming-soon/[slug]` route, verify navLabel, title, tagline, character mascot, newsletter form submission all work end-to-end.

## Success Criteria

- [ ] All coming-soon pages migrated with character FK resolved
- [ ] `generateStaticParams` returns same slug set as JSON
- [ ] Newsletter signup with `newsletterTag` reaches Resend (verify by signup test in stub mode)
- [ ] Editor can edit a coming-soon page's tagline → published → visible after revalidate
- [ ] `pnpm typecheck` + `pnpm lint` pass
- [ ] All `/coming-soon/[slug]` routes return 200 + identical content snapshot

## Risk Assessment

- **Character FK orphans** → if a character is deleted, coming-soon page breaks. Add `validate` on character field rejecting empty; document editor warning
- **Smallest-blast-radius phase** — low risk overall; appropriate as the final content collection
- **`newsletterTag` typos** → tag is sent to Resend audience; typo silently routes to wrong list. Consider a select-from-known-tags field if Resend exposes audiences via API; defer to follow-up
