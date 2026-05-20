---
title: Newsletter Anti-Spam Hardening
description: >-
  Close real anti-spam gaps in the newsletter pipeline: email dedup + global
  daily cap + tag max length + tighter per-IP rate.
status: completed
priority: P2
branch: main
tags:
  - newsletter
  - security
  - anti-spam
  - rate-limit
blockedBy: []
blocks: []
created: '2026-05-18T22:30:56.734Z'
createdBy: 'ck:plan'
source: skill
---

# Newsletter Anti-Spam Hardening

## Overview

Minimal hardening pass on the "Join the Pack" newsletter pipeline. Existing protections (honeypot, per-IP rate-limit, Zod, HTML-escape) are solid; this plan closes the two real gaps surfaced in audit:

1. **Email dedup** — same email submitted within 60 min silently returns `{ok: true}` without sending a second team email. Fixes the double-click-spams-team-inbox annoyance.
2. **Global daily cap** — counter capped at 80 sends/UTC-day. Protects Resend free-tier (100/day) and the user's Resend account from auto-suspension under abuse or viral burst.

Plus two minor tightenings: per-IP rate `5/min → 3/min`, and `tag` field `.max(64)`.

**Brainstorm:** [brainstorm-260519-0525-newsletter-antispam-hardening.md](../reports/brainstorm-260519-0525-newsletter-antispam-hardening.md)

## Key Decisions

- **Single module:** all three counters live in `lib/newsletter/rate-limit.ts` (DRY, single in-memory caveat)
- **In-memory state** — same multi-instance limitation as existing rate-limit; acceptable at <100/mo
- **Silent dedup** — no error to user, no info leak about whether email is recognized
- **Generic error on cap** — `"Subscription temporarily unavailable. Please try later."` — no leak about cap state
- **Honeypot path unchanged** — still exits with `ok: true` BEFORE consuming rate-limit/dedup/cap budget
- **No external deps** — no CAPTCHA, no Upstash, no Redis (deferred until traffic warrants)

## Dependencies

None. Follow-up to the Resend migration + observability work which is fully complete (though unstaged).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Extend rate-limit module](./phase-01-extend-rate-limit-module.md) | Completed |
| 2 | [Wire route and schema](./phase-02-wire-route-and-schema.md) | Completed |
| 3 | [Validation](./phase-03-validation.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->
