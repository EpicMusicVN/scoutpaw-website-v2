---
phase: 1
title: "Foundation"
status: pending
priority: P1
effort: "1-2d"
dependencies: []
---

# Phase 1: Foundation

## Overview

Install Payload CMS 3.0 in the existing Next.js app. Wire Postgres + Cloudflare R2 adapter. Create the `users` collection (email/pw auth, admin/editor roles). Seed the first admin user. Deploy the `/admin` route. No content collections migrated yet — public site still reads JSON.

This phase is the **single gate** for everything else. After it ships: editor can log in, but content lives nowhere yet. Phases 2–7 each move one domain into Payload.

## Requirements

- Functional:
  - Payload admin reachable at `/admin` (login screen renders, accepts seeded credentials)
  - Postgres reachable; Payload migrations run cleanly
  - R2 upload adapter configured (test upload via admin returns a working public URL)
  - One admin user + one editor user seeded
  - `lib/content/sources/payload-source.ts` exists as a stub (returns `notImplemented` like the current sanity-source)
  - Public site keeps reading JSON (`CONTENT_SOURCE=json` unchanged)
- Non-functional:
  - Public Lighthouse scores unchanged
  - Admin login route rate-limited (Payload's built-in or middleware)
  - Secrets via Vercel env vars only (no `.env` committed)
  - HTTPS-only cookies, HTTP-only JWT

## Architecture

Payload 3.0 mounts inside the Next.js app router as `app/(payload)/admin/[[...segments]]/page.tsx` + `app/(payload)/api/[...slug]/route.ts`. A single `payload.config.ts` at the repo root defines collections, globals, db adapter, storage adapter, and access rules. The Local API (`getPayload({ config })`) is imported by `payload-source.ts` and runs in-process.

```
repo-root/
├── payload.config.ts              ← schema + adapters
├── lib/payload/
│   ├── collections/
│   │   └── users.ts                ← admin/editor roles
│   ├── access/
│   │   └── roles.ts                ← isAdmin, isEditorOrAdmin
│   └── client.ts                   ← getPayloadClient() singleton
├── app/(payload)/
│   ├── admin/[[...segments]]/page.tsx
│   ├── admin/[[...segments]]/layout.tsx
│   └── api/[...slug]/route.ts
├── lib/content/sources/
│   └── payload-source.ts           ← stub (all notImplemented)
└── scripts/
    └── seed-admin.ts               ← one-time admin seeding
```

## Related Code Files

- Create: `payload.config.ts`
- Create: `lib/payload/client.ts`
- Create: `lib/payload/collections/users.ts`
- Create: `lib/payload/access/roles.ts`
- Create: `app/(payload)/admin/[[...segments]]/page.tsx`
- Create: `app/(payload)/admin/[[...segments]]/layout.tsx`
- Create: `app/(payload)/api/[...slug]/route.ts`
- Create: `lib/content/sources/payload-source.ts` (stub)
- Create: `scripts/seed-admin.ts`
- Modify: `lib/content/index.ts` (register `payload` source)
- Modify: `next.config.ts` (add `withPayload`)
- Modify: `.env.local.example` (add `DATABASE_URI`, `PAYLOAD_SECRET`, R2 creds)
- Modify: `package.json` (Payload deps + seed script)
- Delete: `lib/content/sources/sanity-source.ts` (dead; new payload-source replaces it)

## Implementation Steps

1. **Pick Postgres host.** Default: Vercel Postgres (frictionless), fallback Neon. Provision DB, capture pooled + unpooled connection strings.
2. **Install deps:**
   ```sh
   pnpm add payload @payloadcms/next @payloadcms/db-postgres @payloadcms/storage-s3 @payloadcms/richtext-lexical
   pnpm add -D tsx
   ```
3. **Add `payload.config.ts`** at repo root. Skeleton:
   ```ts
   import { buildConfig } from "payload";
   import { postgresAdapter } from "@payloadcms/db-postgres";
   import { s3Storage } from "@payloadcms/storage-s3";
   import { lexicalEditor } from "@payloadcms/richtext-lexical";
   import path from "path";
   import { users } from "./lib/payload/collections/users";

   export default buildConfig({
     admin: { user: "users" },
     collections: [users],
     editor: lexicalEditor(),
     db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI! } }),
     secret: process.env.PAYLOAD_SECRET!,
     typescript: { outputFile: path.resolve(__dirname, "payload-types.ts") },
     plugins: [
       s3Storage({
         collections: { media: true },
         bucket: process.env.R2_BUCKET!,
         config: {
           credentials: {
             accessKeyId: process.env.R2_ACCESS_KEY_ID!,
             secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
           },
           endpoint: process.env.R2_ENDPOINT!,
           region: "auto",
         },
       }),
     ],
   });
   ```
4. **`lib/payload/collections/users.ts`:**
   ```ts
   import type { CollectionConfig } from "payload";
   export const users: CollectionConfig = {
     slug: "users",
     auth: { tokenExpiration: 60 * 60 * 24 * 7, useAPIKey: false },
     access: {
       read: ({ req }) => Boolean(req.user),
       create: ({ req }) => req.user?.role === "admin",
       update: ({ req, id }) =>
         req.user?.role === "admin" || req.user?.id === id,
       delete: ({ req }) => req.user?.role === "admin",
     },
     fields: [
       { name: "name", type: "text", required: true },
       {
         name: "role",
         type: "select",
         required: true,
         defaultValue: "editor",
         options: [
           { label: "Admin", value: "admin" },
           { label: "Editor", value: "editor" },
         ],
         access: { update: ({ req }) => req.user?.role === "admin" },
       },
     ],
   };
   ```
5. **`lib/payload/access/roles.ts`:**
   ```ts
   import type { Access } from "payload";
   export const isAdmin: Access = ({ req }) => req.user?.role === "admin";
   export const isEditorOrAdmin: Access = ({ req }) =>
     Boolean(req.user && ["admin", "editor"].includes(req.user.role));
   ```
6. **`lib/payload/client.ts`** — singleton Local API client (cached across hot reloads):
   ```ts
   import { getPayload } from "payload";
   import config from "../../payload.config";
   let cached: Awaited<ReturnType<typeof getPayload>> | null = null;
   export async function getPayloadClient() {
     if (cached) return cached;
     cached = await getPayload({ config });
     return cached;
   }
   ```
7. **Admin route mount** — copy the standard Payload Next.js scaffolding into `app/(payload)/admin/[[...segments]]/page.tsx` + `layout.tsx` and `app/(payload)/api/[...slug]/route.ts` per `@payloadcms/next` docs.
8. **`next.config.ts`** — wrap with `withPayload`:
   ```ts
   import { withPayload } from "@payloadcms/next/withPayload";
   export default withPayload(existingConfig);
   ```
9. **`lib/content/sources/payload-source.ts`** — stub all methods with `notImplemented`, matching `sanity-source.ts` shape exactly (return type signature must satisfy `ContentSource`).
10. **`lib/content/index.ts`** — register the new source, delete the sanity entry:
    ```ts
    const sources: Record<string, ContentSource> = {
      json: jsonContentSource,
      payload: payloadContentSource,
    };
    ```
11. **Delete `lib/content/sources/sanity-source.ts`** — no consumer remains.
12. **`scripts/seed-admin.ts`** — idempotent admin seed; reads `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD` from env; creates if absent.
13. **`.env.local.example`** — add:
    ```
    DATABASE_URI=postgres://...
    PAYLOAD_SECRET=          # openssl rand -hex 32
    R2_BUCKET=
    R2_ACCESS_KEY_ID=
    R2_SECRET_ACCESS_KEY=
    R2_ENDPOINT=             # https://<account>.r2.cloudflarestorage.com
    SEED_ADMIN_EMAIL=
    SEED_ADMIN_PASSWORD=
    ```
14. **`package.json` scripts:**
    ```json
    "payload": "payload",
    "payload:migrate": "payload migrate",
    "seed:admin": "tsx scripts/seed-admin.ts"
    ```
15. **Run locally:** `pnpm payload:migrate` → `pnpm seed:admin` → `pnpm dev` → visit `/admin`, log in.
16. **Deploy to Vercel:** set all env vars in dashboard. Verify `/admin` reachable in prod. Public site unchanged.

## Success Criteria

- [ ] `/admin` route renders Payload login screen in prod
- [ ] Seeded admin user can log in; create/update editor user works
- [ ] Editor cannot promote self to admin (RBAC verified)
- [ ] Test file upload via admin → file lives in R2, public URL serves correctly
- [ ] `pnpm typecheck` + `pnpm lint` pass
- [ ] Public Lighthouse scores unchanged (sampled before/after)
- [ ] `CONTENT_SOURCE=json` still default; public site unchanged
- [ ] `payload-source.ts` exists, all methods stub `notImplemented`
- [ ] `sanity-source.ts` deleted
- [ ] `.env.local.example` updated with new vars + comments

## Risk Assessment

- **Vercel Hobby Postgres connection limits** → use pooled connection string for Local API reads; admin is low-volume, fine.
- **`withPayload` plugin conflict with `@next/bundle-analyzer`** → test analyzer in build mode; document if conflict.
- **Cold start latency on `/admin`** → acceptable for 1–3 editors; not a public-facing path.
- **R2 endpoint URL format mismatch with S3 SDK** → test upload during install; some R2 deployments need `?path-style=true`.
- **Payload migrations on Vercel** → run via CI step or one-off shell against the prod DB; document in repo.

## Security Considerations

- `PAYLOAD_SECRET` ≥ 32 bytes random
- Cookies: `SameSite=Lax`, `HttpOnly`, `Secure`
- Admin RBAC default: deny; explicit allow for admin
- Editor cannot change own role (field-level access)
- Rate-limit `/admin/login` at edge (Vercel firewall rules or Payload's built-in lockout)
- No public mutation API exposed (Local API only on read path)
