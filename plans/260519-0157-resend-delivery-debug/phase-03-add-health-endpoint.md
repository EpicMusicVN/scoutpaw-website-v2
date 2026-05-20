---
phase: 3
title: Add health endpoint
status: completed
priority: P1
effort: 20m
dependencies:
  - 2
---

# Phase 3: Add health endpoint

## Overview

Secret-guarded `GET /api/newsletter/health?key=$DIAGNOSTIC_SECRET` route that returns the runtime config snapshot. Designed to answer "which env var is the production runtime missing?" without exposing any value.

## Requirements

- Functional:
  - `GET` with valid `key` → 200 + JSON snapshot
  - Missing/wrong `key` → 401, no diagnostic detail in body
  - `DIAGNOSTIC_SECRET` env var unset → 404 (endpoint disabled)
- Non-functional:
  - Constant-time key comparison (no timing oracle)
  - Never returns real env values — booleans + safe-to-expose values only
  - Node runtime (matches existing `/api/newsletter`)

## Architecture

```
GET /api/newsletter/health?key=<secret>
  ↓
[route.ts handler]
  → DIAGNOSTIC_SECRET unset?    → 404 { error: "Not found" }
  → key mismatch?                → 401 { error: "Unauthorized" }
  → all good:                    → 200 {
       mode, hasResendKey, hasTeamEmail, hasFromEmail,
       fromEmail, teamEmailMasked, nodeEnv, diagnosticTimestamp
     }
```

## Related Code Files

- Create: `app/api/newsletter/health/route.ts`
- Read for context: `app/api/newsletter/route.ts`

## Implementation Steps

1. **Create `app/api/newsletter/health/route.ts`:**

   - `runtime = "nodejs"`
   - Read `DIAGNOSTIC_SECRET` from env → if unset, return 404
   - Read `?key=` from URL → constant-time compare against secret (`node:crypto` `timingSafeEqual`); mismatch → 401
   - On success: return JSON with `mode`, `hasResendKey`, `hasTeamEmail`, `hasFromEmail`, `fromEmail` (safe), `teamEmailMasked` (via `maskEmail`), `nodeEnv`, `diagnosticTimestamp`
   - Length-mismatch short-circuit acceptable before `timingSafeEqual` (random secrets — length is not a useful oracle)

2. **Verify route resolution** — `pnpm typecheck`, then `pnpm dev` and hit the endpoint.

## Success Criteria

- [ ] `app/api/newsletter/health/route.ts` exists
- [ ] Missing `DIAGNOSTIC_SECRET` env → 404
- [ ] Wrong/missing `key` query param → 401
- [ ] Correct key → 200 + JSON snapshot
- [ ] Response body never contains the actual `RESEND_API_KEY` value
- [ ] Response body never contains the unmasked `TEAM_NOTIFICATION_EMAIL`
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

## Risk Assessment

- **Risk:** `DIAGNOSTIC_SECRET` short / predictable → bruteforced
  - **Mitigation:** Docs instruct `openssl rand -hex 16` (128-bit entropy); constant-time compare
- **Risk:** Endpoint cached by Vercel CDN
  - **Mitigation:** App-router GET is dynamic by default; verify no caching in Phase 4
- **Risk:** Endpoint becomes permanent attack surface
  - **Mitigation:** Unset `DIAGNOSTIC_SECRET` to disable (returns 404); documented
- **Risk:** Response too revealing for an attacker who breaches the secret
  - **Mitigation:** Attacker with the secret already controls the deployment indirectly; info value < secret value

## Security Considerations

- Constant-time secret comparison via `node:crypto.timingSafeEqual`
- Fail-closed default (unset secret = disabled = 404)
- 404 for "disabled" intentionally indistinguishable from "not found"
- Endpoint does NOT log the supplied key
