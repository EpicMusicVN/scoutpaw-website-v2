---
phase: 1
title: Newsletter API scaffold
status: completed
priority: P2
effort: 20m
dependencies: []
---

# Phase 1: Newsletter API scaffold

## Overview

Create the missing `/api/newsletter` route handler. Form currently POSTs to a 404. Stub mode logs to console and returns 200; live mode (ConvertKit) deferred behind a 501. Form's existing `onSubmit` already handles `ok`/`error` states correctly — just needs the endpoint to exist.

## Requirements

**Functional**
- `POST /api/newsletter` accepts JSON `{ email, tag, hp }`.
- Validates email with a basic regex.
- Honeypot: if `hp` field has content, silently return 200 (don't reveal honeypot detection).
- Reads `process.env.NEWSLETTER_MODE` (default "stub").
- Stub mode: `console.log` the email + tag, return `{ ok: true }`.
- Live mode: return 501 (Not Implemented) — future ConvertKit cycle wires this.

**Non-functional**
- Use Next App Router conventions (`route.ts`, named `POST` export).
- Use `NextResponse` for responses.
- No new deps.

## Architecture

`app/api/newsletter/route.ts`:

```ts
import { NextResponse } from "next/server";

type Body = { email?: string; tag?: string; hp?: string };

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, tag, hp } = body;

  // Honeypot — bots filling the hidden field get a silent OK.
  if (hp && hp.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const mode = process.env.NEWSLETTER_MODE ?? "stub";

  if (mode === "stub") {
    // Stub MVP — just log. Real ConvertKit wiring lives in a future cycle.
    console.log(`[newsletter] stub: ${email} (tag: ${tag ?? "none"})`);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Live newsletter mode is not configured yet." },
    { status: 501 },
  );
}
```

## Related Code Files

- Create: `app/api/newsletter/route.ts`

## Implementation Steps

1. Create dir `app/api/newsletter/` if missing.
2. Write `route.ts` per the architecture above.
3. Run `pnpm typecheck`. Halt on errors.
4. Run `pnpm lint`. Halt on errors.
5. Smoke test via curl (after `pnpm dev`):
   ```
   curl -X POST http://localhost:3000/api/newsletter -H "Content-Type: application/json" -d '{"email":"test@example.com","tag":"home-newsletter"}'
   ```
   Expect `{"ok":true}`. Server console should log the email.

## Success Criteria

- [ ] `app/api/newsletter/route.ts` exists with `POST` export
- [ ] Honeypot path returns 200 silently
- [ ] Invalid email returns 400
- [ ] Stub mode logs + returns 200
- [ ] Live mode returns 501
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean

## Risk Assessment

- **Email regex too strict** — `[^\s@]+@[^\s@]+\.[^\s@]+` matches `user@example.com` style; rejects `user@localhost` (no TLD). Acceptable for production newsletter signups.
- **`tag` not validated** — accept anything; tag is free-form (e.g., `home-newsletter`, `shop-newsletter`, `coming-soon-X`). Risky? No — it's just a label for logging/future ConvertKit grouping.
- **JSON parse failure** — handled by try/catch → 400.
- **No rate limiting** — out of scope for stub MVP. Add when ConvertKit goes live (would be a separate cycle).
- **Next App Router route caching** — POST routes are not cached by default. No revalidation logic needed.
