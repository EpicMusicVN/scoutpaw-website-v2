---
phase: 4
title: Docs and validation
status: completed
priority: P1
effort: 20m
dependencies:
  - 3
---

# Phase 4: Docs and validation

## Overview

Update deployment docs with the diagnostic-endpoint workflow + the "redeploy after env changes" reminder. Run typecheck + lint + build. Manual smoke test locally; document the production smoke-test path for the user.

## Requirements

- Functional: deployment doc explains health endpoint usage; changelog entry exists
- Non-functional: code compiles and lints clean; manual diagnostic flow documented and locally verified

## Related Code Files

- Modify: `docs/deployment.md`
- Modify: `docs/project-changelog.md`

## Implementation Steps

1. **Update `docs/deployment.md` env var table** — add `DIAGNOSTIC_SECRET` row (Production scope, optional, generated via `openssl rand -hex 16`).

2. **Add new "Newsletter Diagnostics" section** in `docs/deployment.md` documenting:
   - `curl "https://<vercel-url>/api/newsletter/health?key=$DIAGNOSTIC_SECRET"` usage
   - Example response shape
   - Interpretation table (mode=stub → fix NEWSLETTER_MODE; hasResendKey=false → fix RESEND_API_KEY; etc.)
   - **Important reminder:** Vercel env-var changes don't apply to existing deployments — must redeploy
   - How to disable: unset `DIAGNOSTIC_SECRET`, redeploy

3. **Append `docs/project-changelog.md`** with 2026-05-19 entry covering: mask helper, logging, health endpoint, env-example sanitization, and a "Security Notes" subsection re: the key-rotation event.

4. **Static checks:**
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm build
   ```
   All three must pass.

5. **Local smoke test:**
   - Add `DIAGNOSTIC_SECRET=test-secret-1234` to local `.env.local`
   - `pnpm dev`
   - `curl http://localhost:3000/api/newsletter/health` → expect 401
   - `curl "http://localhost:3000/api/newsletter/health?key=wrong"` → expect 401
   - `curl "http://localhost:3000/api/newsletter/health?key=test-secret-1234"` → expect 200 + valid JSON snapshot
   - Remove `DIAGNOSTIC_SECRET` from `.env.local`, restart dev → expect 404 on all calls
   - Submit the newsletter form → expect new `[newsletter] dispatch` log line in dev server output

6. **Production smoke test (user-driven, after deploy):**
   - User sets `DIAGNOSTIC_SECRET` in Vercel Production env vars
   - User redeploys
   - User hits the endpoint with their key
   - **Expected outcome:** at least one boolean reveals the missing env var (most likely `mode: "stub"` or `hasResendKey: false`)
   - User fixes the Vercel env var → redeploys → re-tests
   - Subscribe form submission → email arrives within 30s

## Success Criteria

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] `docs/deployment.md` has "Newsletter Diagnostics" section + updated env table
- [ ] `docs/project-changelog.md` has 2026-05-19 entry at top
- [ ] Local smoke test: all 4 curl cases pass + dispatch log line observed
- [ ] (User-driven, post-deploy) Health endpoint identifies root cause → user fixes → email arrives

## Risk Assessment

- **Risk:** Production smoke test reveals cause is NOT in our code (e.g., Resend account suspended, Gmail-side block)
  - **Mitigation:** Health endpoint at least narrows scope. If all booleans true and logs show `sent ok`, pivot to Resend dashboard / Gmail headers.
- **Risk:** User forgets to set `DIAGNOSTIC_SECRET` in Vercel → endpoint disabled when they need it
  - **Mitigation:** Deployment doc explicitly calls this out; endpoint is opt-in by design.

## Next Steps (Post-Validation)

- User commits + deploys
- User hits health endpoint → identifies root cause → fixes Vercel env → redeploys → re-tests
- Follow-up plan candidates (defer until needed):
  - Resend domain verification (`notifications@scoutpaw.tv`)
  - Static email subject (eliminates SMTP-header-injection class)
  - `z.string().max(64)` cap on `tag` input
