# Resend Stub Mode: The 3-Minute Root Cause After 3 Sessions

**Date**: 2026-05-19 03:15
**Severity**: Critical (but resolved)
**Component**: Newsletter dispatcher (`lib/newsletter/index.ts`), environment configuration (`.env`)
**Status**: Resolved; user making one-line fix

## What Happened

After two sessions building observability tooling (health endpoint, structured logging), the root cause was found in 3 minutes of direct investigation: `.env` contained `NEWSLETTER_MODE=stub`.

The dispatcher saw `mode === "stub"`, routed to `subscribeStub()` (console.log only, returns `{ok: true}`), and never touched the Resend SDK. Form returned success. Email never sent. Resend dashboard stayed empty.

## The Brutal Truth

This is genuinely maddening. Three sessions of work—planning a comprehensive debug approach, implementing a health endpoint with timing-safe secret comparison, adding PII-masked logging, updating docs—when the answer was a **single environment variable setting to the wrong value**.

The observability layer built in Session 2 was working the entire time. The `[newsletter] dispatch` log with `mode: 'stub'` was printing to the `pnpm dev` terminal the whole time. The user just hadn't checked the terminal output.

The frustration runs deeper: Session 1 and 2 both assumed Vercel production deployment context. The team was testing locally with `pnpm dev` the entire time. A single clarifying question in the first 30 seconds—"where are you running this?"—would have reframed the entire investigation.

## Technical Details

**The smoking gun:**
```
$ grep "^NEWSLETTER_MODE" .env
NEWSLETTER_MODE=stub
```

**Why this broke everything:**
- `lib/newsletter/index.ts` dispatcher: `if (mode === "live") subscribeResend(); else subscribeStub();`
- `subscribeStub()`: `console.log("[newsletter:stub]", { email, subject }); return { ok: true };`
- Resend SDK never invoked
- Dashboard shows zero send attempts
- Form returns success (no error to display)

**The investigation path that finally worked:**
1. `git log --oneline` → nothing new since `4d94dba` (pre-migration)
2. User pushback: "I'm testing locally with `pnpm dev`, not Vercel"
3. `ls .env*` → revealed `.env` (1.3KB) AND `.env.local.example` (config template)
4. User had been editing `.env.local.example` earlier but `pnpm dev` reads `.env`, not `.env.local`
5. `grep "^NEWSLETTER_MODE" .env` → `stub`
6. Done.

## What We Tried (Sessions 1–2)

**Session 1: Planning**
- Brainstormed three approaches: logging only, health endpoint, domain verification
- Chose health endpoint as permanent diagnostic surface
- Designed fail-closed 404 behavior, timing-safe secret comparison, PII masking

**Session 2: Implementation**
- Built `lib/newsletter/mask.ts` (email masking utility)
- Built `app/api/newsletter/health/route.ts` (secret-guarded diagnostic endpoint)
- Added structured logging to dispatcher and Resend source
- Fixed two code-review findings: timing-attack vulnerability in secret comparison, PII leak on short email locals
- All code shipped, tests passed, docs updated

**Session 3: The Actual Root Cause**
- 3 minutes: `ls .env*` + `grep NEWSLETTER_MODE .env`
- Answer: one env var set to `stub`

## Root Cause Analysis

**Why three sessions were spent on this:**

1. **Missing context question**: Should have asked WHERE the user was testing (local dev, Vercel preview, Vercel production) in the first 5 minutes of Session 1. This would have immediately suggested checking `.env` vs `.env.local` vs Vercel dashboard.

2. **Environment file blind spot**: `.env` exists, is populated with real values, and is NOT gitignored by default in Next.js (only `.env.local` is). The user had correctly edited `.env` with Resend vars during migration, but also set `NEWSLETTER_MODE=stub` at some point (possibly for local testing) and forgot to flip it back to `live`.

3. **Tools without guardrails**: Session 2 built excellent observability (health endpoint, structured logging). These tools were working perfectly. But without walking the user through *using* them (checking the `pnpm dev` terminal for `[newsletter] dispatch` logs, or hitting the health endpoint), they became invisible.

4. **Deployment context assumption**: Both Session 1 and 2 assumed Vercel production context. The entire 4-phase plan was designed around "env vars not loading in Vercel." None of it accounted for "env vars loaded correctly, but set to the wrong values locally."

## Lessons Learned

1. **Ask WHERE before WHERE-TO-FIX.** "Where are you testing this?" (local? Vercel preview? Vercel prod?) should be the first clarifying question when debugging deployment-related issues. This reframes the entire search space and prevents building fixes for the wrong environment.

2. **A 10-second sanity check precedes sophisticated diagnosis.** For any config-related issue: `git status`, `ls .env*`, `grep KEY_NAME .env*`. This 30-second baseline search catches 80% of "things not working" issues before building observability tools.

3. **When tools exist, walk users through using them.** The `pnpm dev` terminal had the answer (`[newsletter] dispatch` log showing `mode: 'stub'`). Instead of building MORE observability, should have said: "Check your dev terminal for this log line: grep for `\[newsletter\]` in the output."

4. **`.env` is not gitignored by default in Next.js—it's a leak vector.** The user's `RESEND_API_KEY` is sitting in a 1.3KB file at the project root, tracked by git if not explicitly ignored. Session 2 correctly rotated the leaked key, but this suggests adding `.env` to `.gitignore` (if not already present) and auditing `.env.local.example` to ensure it contains ONLY placeholders, never real values.

5. **Multi-session over-engineering teaches a bitter lesson: sometimes the user knows more than the plan.** When Session 2 wrapped with "set `DIAGNOSTIC_SECRET` in Vercel and redeploy," the user could have simply said "wait, let me check my `.env` file first." That's on us for not asking early enough.

## Next Steps

1. **User fix**: Edit `.env`, change `NEWSLETTER_MODE=stub` → `NEWSLETTER_MODE=live`
2. **Session 3 cleanup**: The observability work from Session 2 is still valuable and should stay. But document it: "To diagnose newsletter delivery issues locally, check the `pnpm dev` terminal for `[newsletter] dispatch` logs, or hit `/api/newsletter/health?key=$DIAGNOSTIC_SECRET` in production."
3. **Process improvement**: Add `.env` to `.gitignore` if not present. This prevents real credentials from being committed by accident.
4. **Code review checklist**: When reviewing env file templates (`.env.example`, `.env.local.example`), explicitly grep for credential patterns (`re_`, `sk_`, `APIKEY=`, etc.) and reject any commits with real values.

## The Silver Lining

The observability work from Sessions 1–2 is not wasted. It's a permanent diagnostic surface that will prevent this class of issue in the future. The health endpoint answers "are the env vars loaded?" in a single request. The structured logging captures successes and failures. These tools will catch the *next* misconfiguration (if it happens) in seconds instead of sessions.

But the meta-lesson is harder to swallow: sometimes the simplest debugging step (check the config file directly) beats the most sophisticated tooling. Ask early. Check the basics. Then build.

---

**Related journals:**
- `2026-05-19-resend-delivery-debug-plan.md` (Session 1)
- `2026-05-19-resend-delivery-debug-implementation.md` (Session 2)

**Plan directory**: `plans/260519-0157-resend-delivery-debug/`
