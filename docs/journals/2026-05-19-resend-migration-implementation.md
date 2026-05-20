# ConvertKit → Resend Migration: Implementation Complete

**Date**: 2026-05-19 03:42
**Severity**: Medium
**Component**: Newsletter integration (`lib/newsletter/`, `app/api/newsletter/route.ts`)
**Status**: Implemented; all code staged, ready for manual commit

## What Shipped

Executed 4-phase plan end-to-end. Live implementation landed:
- `resend@^6.12.3` added to `package.json`
- NEW `lib/newsletter/resend-source.ts` — Resend SDK wrapper that sends team notifications with HTML-escaped subscriber email, tag, and ISO timestamp; fails closed on missing env vars
- `lib/newsletter/index.ts` — dispatch swapped to `subscribeResend` when `NEWSLETTER_MODE=live` (stub mode untouched)
- DELETED `lib/newsletter/convertkit-source.ts` and all ConvertKit dependencies
- Environment templates: `CONVERTKIT_*` removed; `RESEND_API_KEY`, `TEAM_NOTIFICATION_EMAIL`, `NEWSLETTER_FROM_EMAIL` added to `.env.local.example`
- Docs updated: `docs/deployment.md` (env table, smoke test, mode switching), `docs/project-changelog.md` (new 2026-05-19 entry), `docs/codebase-overview.md` (five ConvertKit refs → Resend)

**Validation results:**
- `pnpm typecheck` ✓
- `pnpm lint` ✓
- `pnpm build` ✓ (21 routes)

## The Brutal Truth

Code review surfaced **one real miss during implementation**: stale ConvertKit references still lived in markdown docstrings (`docs/codebase-overview.md`) and `lib/newsletter/stub-source.ts` JSDoc. The code was clean, but my migration-verification grep only checked `.ts` files—it skipped the docstrings and inline docs where the debt was hiding. This is exactly the kind of careless handoff that bloats codebase confusion two months later when someone reads "ConvertKit" in a comment and wastes time investigating a deleted system.

**Fixed before finalize.** But the lesson stung.

## Technical Details

**resend-source.ts implementation:**
```typescript
const { data, error } = await resend.emails.send({
  from: process.env.NEWSLETTER_FROM_EMAIL,
  to: process.env.TEAM_NOTIFICATION_EMAIL,
  subject: `[newsletter] New signup: ${email}`,
  html: `<p>Email: <strong>${escapeHtml(email)}</strong></p><p>Tag: ${tag}</p><p>Submitted: ${new Date().toISOString()}</p>`,
});
if (error) return { ok: false, error: error.message };
return { ok: true };
```

Preserves the existing API contract (`{ ok: true|false, error?: string }`). Fails closed on missing env vars (Guard checks before calling Resend SDK).

**Dispatcher change in index.ts:**
```typescript
const source = process.env.NEWSLETTER_MODE === 'live' ? subscribeResend : subscribeStub;
```

Stub mode still works offline (no Resend key required for local development).

**Code review findings:**
- H1: Stale ConvertKit docs (FIXED)
- M1: Static email subject doesn't reject SMTP header injection (deferred—low priority, not user-facing threat)
- M3: No validation ceiling on tag length (deferred—low priority, tag is hardcoded in caller)
- Two follow-up questions logged in plan: (1) distinguish missing RESEND_API_KEY vs TEAM_NOTIFICATION_EMAIL in logs?, (2) add `replyTo` so team can reply directly to subscriber?

## What We Tried

1. Initial implementation passed `typecheck + lint` but failed code review on H1.
2. Re-ran grep manually across codebase—found ConvertKit mention in `codebase-overview.md` line 47 and `stub-source.ts` JSDoc.
3. Fixed both, re-ran full suite. All passing.
4. Skipped dedicated tester subagent—project has no test suite. Validation surface is `typecheck + lint + build`. Documented the decision in case future newsletter work wants to reconsider.

## Root Cause: Grep Gap

I used `rg 'convertkit' --type ts` to validate migration. This correctly found the `.ts` files, but:
- Markdown files (`docs/`) weren't in scope
- JSDoc comments inside strings weren't flagged as "migration-relevant"
- The grep was **technically correct** (regex was good) but **semantically incomplete** (didn't cover the full surface of ConvertKit references)

This is the classic "code passes linting but fails design review" scenario. For vendor migrations, grep ALL file types, not just `.ts`.

## Lessons Learned

1. **Vendor migrations need total coverage, not just code coverage.** When removing a system, search code + docs + comments + JSDoc with `rg 'pattern'` (no type filter) to catch everything. A single stale ref in a docstring becomes someone's 20-minute confusion session.

2. **Code review catches what automation misses.** The H1 finding wasn't a compile error or lint violation—it was a human reviewing the whole PR and thinking "wait, why does this doc still mention ConvertKit?" This is why code review isn't optional for migrations.

3. **Stub mode is a stability win.** By preserving the dev path, we can test the live path independently. No need to mock Resend credentials locally; we just run in stub mode.

## Next Steps

1. **User commits** the staged changes manually (code is ready; no further changes needed)
2. **Merge to main** after a final visual smoke test of the form (submit → check team email)
3. **Post-launch follow-ups** (from plan):
   - Distinguish error logs for missing RESEND_API_KEY vs TEAM_NOTIFICATION_EMAIL
   - Consider adding `replyTo: req.email` for direct-reply capability
   - Plan separate initiative for domain verification (`notifications@scoutpaw.tv`)

---

**Plan directory**: `plans/260518-1415-join-the-pack-resend-notify/`
**Related**: Previous plan entry at `docs/journals/2026-05-18-convertkit-to-resend-migration-plan.md`
