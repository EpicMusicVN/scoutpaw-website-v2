---
phase: 1
title: Setup deps and env
status: completed
priority: P2
effort: 15m
dependencies: []
---

# Phase 1: Setup deps and env

## Overview

Install `resend` package and define new environment variables. No application code changes yet — this phase prepares the substrate for Phase 2.

## Requirements

- Functional: `resend` package available; env var names documented; `.env.local.example` accurate
- Non-functional: server-side env only (no `NEXT_PUBLIC_`); no secrets committed

## Architecture

```
package.json       → adds "resend": "^4.x"
.env.local.example → adds 3 vars, removes 2 vars
docs/deployment.md → env var table updated (Phase 3)
```

## Related Code Files

- Modify: `package.json` — add `resend` dependency
- Modify: `pnpm-lock.yaml` — auto-updated by pnpm
- Modify: `.env.local.example` — env var declarations

## Implementation Steps

1. **Install Resend SDK**
   ```bash
   pnpm add resend
   ```
   Use latest 4.x (current stable).

2. **Update `.env.local.example`** — remove ConvertKit vars, add Resend vars:
   ```env
   # Newsletter mode — "stub" (MVP, logs to console) or "live" (Resend)
   NEWSLETTER_MODE=stub

   # Resend API — get key at https://resend.com/api-keys
   RESEND_API_KEY=

   # Where team notifications land when a user subscribes
   TEAM_NOTIFICATION_EMAIL=

   # Sender address — use onboarding@resend.dev for zero-DNS testing,
   # or a verified domain address (e.g., notifications@scoutpaw.tv) in prod
   NEWSLETTER_FROM_EMAIL=onboarding@resend.dev
   ```

3. **Verify `resend` installs cleanly** — `pnpm install` produces no warnings/errors related to peer deps.

## Success Criteria

- [ ] `resend` listed in `package.json` dependencies
- [ ] `pnpm install` completes without errors
- [ ] `.env.local.example` lists `RESEND_API_KEY`, `TEAM_NOTIFICATION_EMAIL`, `NEWSLETTER_FROM_EMAIL`
- [ ] `.env.local.example` no longer references `CONVERTKIT_*`

## Risk Assessment

- **Risk:** `resend` peer-dep clash with Next.js 15 / React 19
  - **Mitigation:** Resend SDK is framework-agnostic, no React peer dep. Low risk.
- **Risk:** Committed `.env.local` with real key
  - **Mitigation:** Only edit `.env.local.example` (already gitignored: `.env.local`). Verify via `git status` before commit.
