---
title: Resend Delivery Debug + Observability
description: >-
  Diagnose why Resend notifications aren't arriving. Sanitize leaked-key env
  example, add structured logging, ship secret-guarded health endpoint.
status: completed
priority: P1
branch: main
tags:
  - debug
  - observability
  - newsletter
  - resend
  - security
blockedBy: []
blocks: []
created: '2026-05-18T19:09:47.223Z'
createdBy: 'ck:plan'
source: skill
---

# Resend Delivery Debug + Observability

## Overview

Follow-up to the Resend migration ([plan 260518-1415](../260518-1415-join-the-pack-resend-notify/plan.md)). Symptoms reported by user:

- Form submits successfully ("You're on the list" UI state)
- Gmail inbox + spam both empty
- **Resend dashboard Logs tab shows zero send attempts**

→ Resend SDK is never being invoked in the production runtime. Highest-probability root cause: `NEWSLETTER_MODE`/`RESEND_API_KEY`/`TEAM_NOTIFICATION_EMAIL` not present (or wrong-scoped) in Vercel's active deployment.

Adjacent issue: a real production API key was committed to `.env.local.example`. User rotated the key; sanitization of the file is still required.

**Approach:** add observability so the root cause becomes self-evident — structured logs on every dispatch + secret-guarded health endpoint that exposes env-var presence (booleans only, never values).

**Brainstorm context:** [brainstorm-260519-0157-resend-delivery-debug.md](../260518-1415-join-the-pack-resend-notify/reports/brainstorm-260519-0157-resend-delivery-debug.md)

## Key Decisions

- **Health endpoint** at `GET /api/newsletter/health?key=$DIAGNOSTIC_SECRET` — fail-closed (404 when `DIAGNOSTIC_SECRET` unset; 401 on wrong key)
- **PII masking** in all logs: `longnn1998@gmail.com` → `lon***@gmail.com`
- **No values exposed** — health endpoint returns booleans + masked PII + safe values (`mode`, `fromEmail`, `nodeEnv`)
- **Keep stub mode** untouched — only `live` path gets new logging
- **`.env.local.example` sanitization** includes a prominent "TEMPLATE — copy to `.env.local`" header (user confirmed prior confusion about this file)

## Dependencies

External: User must (a) confirm the leaked key is rotated, (b) ensure correct env vars are set in Vercel **Production** scope, (c) **redeploy** Vercel after the env changes. Health endpoint will surface mismatches.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Sanitize env example](./phase-01-sanitize-env-example.md) | Completed |
| 2 | [Add logging and mask helper](./phase-02-add-logging-and-mask-helper.md) | Completed |
| 3 | [Add health endpoint](./phase-03-add-health-endpoint.md) | Completed |
| 4 | [Docs and validation](./phase-04-docs-and-validation.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->
