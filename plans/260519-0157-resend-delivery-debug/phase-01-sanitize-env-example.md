---
phase: 1
title: Sanitize env example
status: completed
priority: P1
effort: 10m
dependencies: []
---

# Phase 1: Sanitize env example

## Overview

Strip the leaked Resend API key from `.env.local.example` (already rotated by user), add a prominent template header so future users don't repeat the same confusion, and add the `DIAGNOSTIC_SECRET` placeholder needed by Phase 3.

## Requirements

- Functional: file contains no real secrets; placeholder structure preserved
- Non-functional: clear that this is a TEMPLATE, not the runtime file

## Architecture

`.env.local.example` is a committed template. Its purpose: list required env vars + sane defaults, so a contributor can `cp .env.local.example .env.local` and fill in their values. The runtime file is `.env.local` (gitignored). For Vercel: env vars live in dashboard, not in any file.

## Related Code Files

- Modify: `.env.local.example`

## Implementation Steps

1. **Read current state** of `.env.local.example`
2. **Strip the leaked key value** — set `RESEND_API_KEY=` (empty)
3. **Restore `TEAM_NOTIFICATION_EMAIL=` to empty** — user filled in `longnn1998@gmail.com`, but this is a template
4. **Remove stray comment** `# channelslab@emvn.co` (unrelated note user left)
5. **Add prominent header at top of file:**
   ```env
   # =============================================================================
   # TEMPLATE — DO NOT EDIT FOR RUNTIME
   # -----------------------------------------------------------------------------
   # This file lists the env vars the app expects. To use locally:
   #   cp .env.local.example .env.local
   # Then fill in your values in `.env.local` (gitignored).
   # For Vercel: set values in the dashboard, not in any file.
   # =============================================================================
   ```
6. **Add `DIAGNOSTIC_SECRET` placeholder** at the end of the newsletter block:
   ```env
   # Random secret for /api/newsletter/health diagnostic endpoint.
   # Leave empty to disable the endpoint (returns 404).
   # Generate: openssl rand -hex 16
   DIAGNOSTIC_SECRET=
   ```
7. **Verify no real secrets remain** — `git diff .env.local.example` should show only placeholder values, comments, and the new header.

## Success Criteria

- [ ] `.env.local.example` contains the new TEMPLATE header
- [ ] `RESEND_API_KEY` value is empty
- [ ] `TEAM_NOTIFICATION_EMAIL` value is empty
- [ ] `DIAGNOSTIC_SECRET=` placeholder exists with usage comment
- [ ] No real API keys, emails, or other secrets anywhere in the file
- [ ] `git diff` reviewed — no production data leaks

## Risk Assessment

- **Risk:** Leaked key still in git history (if file was previously committed with the key)
  - **Mitigation:** User must confirm `git log -- .env.local.example` and decide whether to history-scrub (out of code scope; flag in changelog). Key rotation already mitigates blast radius.
- **Risk:** User confused about template vs runtime again
  - **Mitigation:** Prominent TEMPLATE header explicitly tells reader to copy, not edit.

## Security Considerations

- Confirm key rotation is complete before committing
- Sanitization is **not** retroactive — already-pushed commits still have the old key in history
