---
phase: 2
title: Content Layer
status: completed
priority: P1
effort: 4h
dependencies:
  - 1
---

# Phase 2: Content Layer

## Overview
Build Content Adapter pattern — the keystone CMS-readiness move. Zod schemas define content shape (single source of truth). `ContentSource` interface abstracts JSON now / Sanity later. Components import from `lib/content` only, never JSON directly.

## Requirements
- Functional: `getCharacters()`, `getCharacterBySlug()`, `getVideos()`, `getComingSoonPages()`, `getSiteConfig()` available via adapter
- Non-functional: Zod runtime validates JSON at load (fail-fast on bad content); fully typed; swap to Sanity = one new file

## Architecture
```
lib/content/
  schemas.ts          # Zod schemas — single source of truth
  adapter.ts          # ContentSource interface
  sources/
    json.ts           # JSONContentSource
    # sanity.ts       # (future)
  index.ts            # exports configured adapter via env
content/
  characters.json
  videos.json
  coming-soon.json
  site-config.json
```

Migration plan: future `SanityContentSource` implements same interface, env flag (`CONTENT_SOURCE=sanity`) selects it. Zod schemas convert mechanically to Sanity schemas.

## Related Code Files
- Create: `lib/content/schemas.ts`, `lib/content/adapter.ts`, `lib/content/sources/json.ts`, `lib/content/index.ts`
- Create: `content/characters.json`, `content/videos.json`, `content/coming-soon.json`, `content/site-config.json`

## Implementation Steps
1. Define Zod schemas:
   - `CharacterSchema`: slug, name, tagline, bio, funFacts[], colorPrimary, colorAccent, image (path), order
   - `VideoSchema`: youtubeId, title, thumbnail (optional, derived if absent)
   - `ComingSoonPageSchema`: slug, navLabel, title, tagline, characterSlug (which character art), enabled
   - `SiteConfigSchema`: brand, navItems[], social[], legal{}
2. Define `ContentSource` interface in `adapter.ts` w/ all getters
3. Implement `JSONContentSource` — reads JSON files via `fs/promises`, parses via Zod, throws on invalid
4. `index.ts`: export singleton adapter, select source via `process.env.CONTENT_SOURCE` (default `json`)
5. Stub JSON content w/ 5 placeholder characters, 3 video IDs, 4 coming-soon pages (Watch/Games/Activities/About), site-config
6. Cache strategy: read once per build, cache in module scope (Next.js builds are stateless per route — fine)
7. Add `pnpm tsc --noEmit` check

## Success Criteria
- [ ] All 4 JSON files parse via Zod successfully
- [ ] `import { content } from "@/lib/content"` returns typed adapter
- [ ] `await content.getCharacters()` returns 5 characters
- [ ] Invalid JSON throws clear Zod error w/ field path
- [ ] No component imports JSON directly (verify via grep)
- [ ] Mock `SanityContentSource` skeleton (empty methods) compiles against same interface

## Risk Assessment
- JSON drift over time — strict Zod schemas + CI typecheck mitigates
- Adapter abstraction over-engineered for MVP — accepted trade-off; user explicitly requires CMS-ready arch
- Future Sanity schema mismatch — write contract test that mock SanityContentSource satisfies interface
