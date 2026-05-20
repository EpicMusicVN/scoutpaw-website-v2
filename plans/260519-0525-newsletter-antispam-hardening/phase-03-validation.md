---
phase: 3
title: Validation
status: completed
priority: P2
effort: 15m
dependencies:
  - 2
---

# Phase 3: Validation

## Overview

Verify all four protections behave correctly via local smoke test. Static checks + manual scenario walk-through. No test framework exists in this project; build + manual is the test surface.

## Requirements

- Functional: each new protection produces the expected response in its trigger scenario
- Non-functional: existing happy path + honeypot path unaffected

## Implementation Steps

1. **Static checks:**
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm build
   ```
   All three must pass.

2. **Local smoke test (`pnpm dev`, stub mode):**

   **Scenario 1 — Tag max length**
   - `curl -X POST http://localhost:3000/api/newsletter -H 'content-type: application/json' -d '{"email":"a@b.com","tag":"'$(printf 'x%.0s' {1..70})'"}'`
   - Expect: HTTP 400, `{ok: false, error: "Tag too long."}`

   **Scenario 2 — IP rate limit (tightened)**
   - Submit 4 different emails from same IP within 60s
   - Expect: 1st-3rd succeed (200), 4th returns HTTP 429

   **Scenario 3 — Email dedup**
   - Submit `alice@x.com` → 200, `[newsletter] dispatch` log appears
   - Submit `alice@x.com` again immediately → 200, **NO** new dispatch log (silent skip)
   - Submit `ALICE@x.com` → 200, **NO** new dispatch log (case-normalized)
   - Submit `bob@x.com` → 200, dispatch log appears (different email)

   **Scenario 4 — Global daily cap**
   - Cannot reasonably test by hitting 80 unique submissions manually
   - Instead: temporarily reduce `GLOBAL_DAILY_CAP` to 3 in rate-limit.ts, restart dev
   - Submit 4 unique emails (use unique tags to bypass dedup if needed, or just wait between)
   - Expect: 4th returns HTTP 503 with `"Subscription temporarily unavailable..."`
   - Restore cap to 80, restart dev

   **Scenario 5 — Honeypot bypass**
   - `curl -X POST http://localhost:3000/api/newsletter -H 'content-type: application/json' -d '{"email":"hp@x.com","hp":"I am a bot"}'`
   - Expect: HTTP 200 `{ok: true}`, NO dispatch log (early exit before rate-limit/dedup/cap)
   - Confirm rate-limit budget NOT consumed by checking another submission from same IP still passes

3. **Verify no regression:**
   - Submit a fresh real email → see `[newsletter] dispatch` log → in stub mode, see `[newsletter:stub] would subscribe`
   - In live mode (with valid `.env.local` keys), confirm one team email arrives

## Success Criteria

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] Scenario 1: tag>64 → 400
- [ ] Scenario 2: 4th IP submission → 429
- [ ] Scenario 3: duplicate email (case-insensitive) → silent 200, no second dispatch
- [ ] Scenario 4: cap+1 submission → 503
- [ ] Scenario 5: honeypot → 200 + no budget consumed
- [ ] Regression: happy path still works in stub and live mode

## Risk Assessment

- **Risk:** Local in-memory state pollutes between scenarios (e.g., dedup cache from scenario 3 affects scenario 4)
  - **Mitigation:** Use unique emails per scenario; restart `pnpm dev` between major scenarios if needed (clears all in-memory state)
- **Risk:** Reducing global cap to 3 for testing forgotten and committed
  - **Mitigation:** Manual restore step in Scenario 4; visible in code-review diff if missed

## Next Steps (Post-Validation)

- Commit (user manages)
- No deploy required for plan completion (changes are pre-launch hardening)
- Follow-up candidates (defer):
  - Upgrade in-memory to Upstash KV if multi-instance precision needed
  - Add per-tag breakdown if global cap proves too coarse
  - Cloudflare Turnstile if evidence of sophisticated bot attacks emerges
