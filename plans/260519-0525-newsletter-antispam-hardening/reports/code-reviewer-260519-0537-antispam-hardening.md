# Code Review: Newsletter Anti-Spam Hardening

**Verdict:** SHIP WITH NOTES

**Scope:** `lib/newsletter/rate-limit.ts`, `lib/newsletter/schemas.ts`, `app/api/newsletter/route.ts`. Build/lint/typecheck clean.

---

## Pipeline order — CORRECT

`route.ts:18-67` flow: Zod -> honeypot (early `ok:true`, no counter touched) -> `rateLimitAllowed(ip)` -> `emailDedupAllowed` (silent `ok:true`) -> `globalDailyAllowed` (503) -> `subscribe()` -> `recordGlobalSend()` only on `result.ok`. Dedup precedes cap, so a refreshing user does not burn quota. Honeypot bots also do not burn quota. Failed `subscribe()` (502 branch) does not increment the daily counter — correct.

## Race / TOCTOU — acceptable for scope

`rate-limit.ts` uses module-scoped `Map` + `let globalCount`. Node's single-threaded event loop makes the check-then-increment sequences within each helper effectively atomic — no `await` between read and write. The only TOCTOU window is between `globalDailyAllowed()` (line 55) and `recordGlobalSend()` (line 66), bridged by an `await subscribe(...)`. Under concurrent load, N requests can pass the gate before any increments, so the cap can be exceeded by ~(concurrency − 1). At 80/day target and `<100/mo` traffic, this is acceptable. **Note for future:** if traffic grows or Resend bills exact, pre-increment + decrement-on-failure pattern, or move to Upstash atomic INCR (already flagged in module header).

## Day rollover — UTC-safe

`new Date().toISOString().slice(0, 10)` always returns UTC `YYYY-MM-DD`. Resend's free-tier quota is also a calendar-day window; if Resend uses a different TZ the cap could drift by one window, but 80<100 leaves a 20-send buffer that absorbs that. Fine.

## Email normalization — INTENTIONAL LIMITATION

`email.trim().toLowerCase()` does NOT strip plus-aliases. `bob+1@x.com` and `bob+2@x.com` are treated as distinct — matches stated intent ("subaddressing intentional"). Note: also does not normalize gmail dots (`b.o.b@gmail.com` vs `bob@gmail.com`). Acceptable for current threat model (UX dedupe, not abuse-prevention).

## Memory — bounded

`emailSeen` capped by `globalCount` (≤80/day) + 60-min TTL → max ~80 live entries. `ipBuckets` has no explicit cap but with `IP_MAX=3/60s` and lazy expiry on access, unbounded growth only occurs if attacker rotates IPs faster than entries expire AND traffic dies before they hit. At launch scale, fine. **Long-term hygiene tip (non-blocking):** add a size-check sweep when `ipBuckets.size > 10_000`.

## Other observations

- `getClientIp` (`route.ts:14`) trusts `x-forwarded-for` without verifying the proxy chain. On Vercel/Next this is the standard pattern; if deployment ever lands behind a non-trusted proxy, header spoofing bypasses per-IP rate-limit. Document the deployment assumption.
- `tag` schema: `z.string().max(64).optional()` — no minimum/charset restriction. If tag is later interpolated into logs/Resend metadata, ensure HTML-escape (existing baseline). Currently `subscribe()` does not consume `tag`, so it is silently dropped — confirm intent (dead field or future use).
- Daily-cap 503 message is generic ("temporarily unavailable") — good, no info leak.

---

**Status:** DONE
**Summary:** All four hot-spots (order, races, UTC, normalization) verified correct or acceptable per documented scope. Ship-ready; two future-proofing notes (concurrency over-count window, XFF trust assumption) worth recording in the plan.
**Concerns:** None blocking. Concurrency over-count is a known limitation with documented upgrade path.
