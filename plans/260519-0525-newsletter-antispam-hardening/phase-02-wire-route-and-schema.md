---
phase: 2
title: Wire route and schema
status: completed
priority: P2
effort: 15m
dependencies:
  - 1
---

# Phase 2: Wire route and schema

## Overview

Wire the new checks into `app/api/newsletter/route.ts` in the correct order (after rate-limit, before subscribe), and add `.max(64)` to the `tag` field schema.

## Requirements

- Functional:
  - Tag values > 64 chars → Zod error returned to client
  - Dedup hit → silent `{ok: true}` (no Resend call, no error to user)
  - Cap hit → `{ok: false, error: "Subscription temporarily unavailable. Please try later."}` (HTTP 429 or 503)
  - Successful `subscribe()` → `recordGlobalSend()` called
- Non-functional:
  - Honeypot path unchanged (early-exit before rate-limit) — preserved
  - Validation order: Zod → honeypot → rate-limit → dedup → cap → subscribe → record-on-success
  - No new logging required (existing dispatch log covers it)

## Architecture

```
POST /api/newsletter
  ↓ parse JSON
  ↓ Zod validate (tag now .max(64))
  ↓ honeypot check → ok if filled (existing, unchanged)
  ↓ rateLimitAllowed(ip) → 429 if exceeded (existing)
  ↓ emailDedupAllowed(email) → SILENT ok if duplicate (new)
  ↓ globalDailyAllowed() → 503 if cap hit (new)
  ↓ subscribe(req)
  ↓ if subscribe returned ok → recordGlobalSend() (new)
  ↓ return result
```

## Related Code Files

- Modify: `lib/newsletter/schemas.ts`
- Modify: `app/api/newsletter/route.ts`

## Implementation Steps

1. **`lib/newsletter/schemas.ts`** — change:
   ```typescript
   tag: z.string().max(64, "Tag too long.").optional(),
   ```

2. **`app/api/newsletter/route.ts`** — after existing rate-limit block, add:
   ```typescript
   if (!emailDedupAllowed(parsed.data.email)) {
     // Silently succeed — same UX as honeypot, no info leak about recognition.
     return NextResponse.json({ ok: true });
   }
   if (!globalDailyAllowed()) {
     return NextResponse.json(
       { ok: false, error: "Subscription temporarily unavailable. Please try later." },
       { status: 503 },
     );
   }
   ```

3. After existing `subscribe(...)` call, on success:
   ```typescript
   const result = await subscribe(parsed.data);
   if (!result.ok) {
     return NextResponse.json(result, { status: 502 });
   }
   recordGlobalSend();
   return NextResponse.json(result);
   ```

4. Update imports to include `emailDedupAllowed`, `globalDailyAllowed`, `recordGlobalSend` from `@/lib/newsletter/rate-limit`.

5. `pnpm typecheck`

## Success Criteria

- [ ] Zod rejects `tag` > 64 chars
- [ ] Duplicate email submission within 60 min → no Resend call, response `{ok: true}`, HTTP 200
- [ ] 81st send today → response `{ok: false, error: "..."}`, HTTP 503
- [ ] Successful subscribe → `recordGlobalSend()` invoked (verifiable via dispatch log + Resend dashboard count)
- [ ] Honeypot still returns `{ok: true}` WITHOUT triggering dedup or counter
- [ ] `pnpm typecheck` passes

## Risk Assessment

- **Risk:** `recordGlobalSend()` called for stub-mode subscribes (no real Resend call)
  - **Mitigation:** Acceptable — stub mode is dev-only, low volume; if a stub session accidentally hits 80 sends, just restart. Keeping behavior consistent simplifies code.
- **Risk:** Dedup hits silently can mask legitimate UX issues (user thinks form succeeded but team got no email twice)
  - **Mitigation:** Behavior is correct — first submit DID succeed. Second was intentionally suppressed. UX-equivalent to honeypot.
- **Risk:** Order-of-operations bug — recording before subscribe completes would over-count failed sends
  - **Mitigation:** Explicit: record ONLY on `result.ok === true`.
