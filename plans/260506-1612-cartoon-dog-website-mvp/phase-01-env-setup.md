---
phase: 1
title: Env Setup
status: completed
priority: P1
effort: 2h
dependencies: []
---

# Phase 1: Env Setup

## Overview
Init Next.js 15 + TS + Tailwind, install all runtime + dev deps, scaffold folder structure, link Vercel project, configure tooling (ESLint/Prettier/bundle-analyzer). Foundation for all other phases.

## Requirements
- Functional: `pnpm dev` runs Next.js 15 App Router on localhost
- Non-functional: TS strict mode, ESLint passes, bundle analyzer wired

## Architecture
Stock Next.js 15 + App Router + TS template. Tailwind v4 (or v3 stable). pnpm package manager. Folder skeleton matches brainstorm structure. `.env.local` placeholder vars (no real secrets yet).

## Related Code Files
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `.prettierrc`, `.env.local.example`, `.gitignore`, `app/layout.tsx`, `app/page.tsx` (placeholder), `app/globals.css`
- Scaffold dirs: `app/`, `components/{ui,nav,characters,home,shop}/`, `content/`, `lib/{content,shopify,analytics}/`, `public/assets/`

## Implementation Steps
1. `pnpm create next-app@latest scoutpaw-v2 --ts --tailwind --app --eslint --src-dir=false --import-alias "@/*"` (or init in CWD)
2. Install runtime deps: `pnpm add @shopify/storefront-api-client framer-motion lottie-react lite-youtube-embed zod`
3. Install dev deps: `pnpm add -D @next/bundle-analyzer prettier prettier-plugin-tailwindcss`
4. Configure `next.config.ts` w/ bundle analyzer (`ANALYZE=true`), image domains (Shopify CDN, YouTube i.ytimg.com)
5. TS: `strict: true`, `noUncheckedIndexedAccess: true`
6. Add `.prettierrc` w/ tailwind plugin, `.eslintrc.json` extending `next/core-web-vitals`
7. Create folder skeleton (empty index files where needed)
8. Drop banner/logo/character PNGs into `public/assets/` (placeholder names: `banner.png`, `logo.svg`, `characters/{slug}.png`)
9. `.env.local.example`: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, `CONVERTKIT_API_KEY`, `CONVERTKIT_FORM_ID`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
10. `pnpm dev` smoke test, commit initial scaffold
11. `vercel link` (Vercel CLI) — connect to project

## Success Criteria
- [ ] `pnpm dev` boots without errors
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint` passes
- [ ] Bundle analyzer runs via `ANALYZE=true pnpm build`
- [ ] `.env.local.example` documents all required vars
- [ ] Vercel project linked
- [ ] Asset PNGs present in `public/assets/`

## Risk Assessment
- Tailwind v4 still beta paths — pin v3 if v4 issues arise
- Windows path differences (project on D:\) — verify imports work cross-platform
- Mitigation: use forward slashes in imports, test build on Vercel early
