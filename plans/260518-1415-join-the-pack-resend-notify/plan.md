---
title: 'Join the Pack: Resend Team Notification'
description: >-
  Replace ConvertKit with Resend; send team notification email on every
  Join-the-Pack signup.
status: completed
priority: P2
branch: main
tags:
  - newsletter
  - email
  - resend
  - vercel
blockedBy: []
blocks: []
created: '2026-05-18T07:29:29.221Z'
createdBy: 'ck:plan'
source: skill
---

# Join the Pack: Resend Team Notification

## Overview

Replace the ConvertKit newsletter integration (`lib/newsletter/convertkit-source.ts`, currently stubbed) with **Resend** transactional email. On every "Join the Pack" submission, send a notification email to a single team inbox containing the subscriber's email, source tag, and ISO timestamp.

Drop-in replacement at the `lib/newsletter/` source layer — API contract, rate-limit, honeypot, Zod validation, and form UI all stay untouched.

**Brainstorm context:** [brainstorm-260518-1415-join-the-pack-resend-notify.md](../reports/brainstorm-260518-1415-join-the-pack-resend-notify.md)

## Key Decisions

- **Service:** Resend (3K free/mo, Vercel-first, official Node SDK)
- **Sender:** `onboarding@resend.dev` (zero DNS); upgrade to verified `scoutpaw.tv` domain post-launch
- **Recipient:** Single `TEAM_NOTIFICATION_EMAIL` env var
- **Subscriber email:** None — team notification only
- **Stub mode preserved:** `NEWSLETTER_MODE=stub` still logs to console for dev without API key

## Dependencies

External: Resend account + API key (user provisions before Phase 1 implementation runs; not blocking plan creation)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Setup deps and env](./phase-01-setup-deps-and-env.md) | Completed |
| 2 | [Implement Resend source](./phase-02-implement-resend-source.md) | Completed |
| 3 | [Cleanup and docs](./phase-03-cleanup-and-docs.md) | Completed |
| 4 | [Validation](./phase-04-validation.md) | Completed |

## Dependencies

<!-- Cross-plan dependencies -->

## Follow-up Considerations

- Should misconfig logging distinguish missing `RESEND_API_KEY` vs missing `TEAM_NOTIFICATION_EMAIL` separately for better ops visibility?
- Want `replyTo: req.email` in notification emails so team can reply directly to subscribers?
