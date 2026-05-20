# Newsletter Anti-Spam Hardening: Audit-First Design

**Date**: 2026-05-19 05:25
**Severity**: Medium (preventive work)
**Component**: Newsletter pipeline (`lib/newsletter/`, `app/api/newsletter/`)
**Status**: Planned; ready for implementation

## What Happened

Conducted a full-stack audit of the "Join the Pack" newsletter subscription form (`POST /api/newsletter`) to identify anti-spam gaps before launch. Found a solid baseline with two real gaps: duplicate-email annoyance and Resend quota vulnerability. Planned a 3-phase hardening at ~40 LOC.

## The Brutal Truth

The existing protection is **already sufficient** for the documented threat model. Honeypot + per-IP rate-limit + Zod validation handles random scanners and accidental double-submits. The global cap and dedup we're planning to add are mostly speculative—protecting against either a targeted quota-drain attack or a viral spike that probably won't happen.

This is frustrating because it's honest work that doesn't solve an urgent fire; it prevents a hypothetical one. But the ROI is undeniably solid: ~40 lines of code for two real quality-of-life wins (no duplicate team emails, Resend account safe from account suspension). The user made the call to build it anyway, and that's the right call.

What's valuable here is the decision-making *process*: we audited, we identified what IS working, we acknowledged when the threat model didn't justify a solution (e.g., Cloudflare Turnstile is overkill), and we only recommended changes that had solid ROI. That's engineering maturity.

## Technical Details

**Audit snapshot:**
| Protection | Status | Risk |
|---|---|---|
| Honeypot | ✅ present | honeypot off-screen in `components/home/newsletter-cta.tsx` |
| Per-IP rate (5/min) | ✅ present | in-memory, per-instance; adequate for launch |
| Zod email validation | ✅ present | catches basic format errors |
| HTML escape in email body | ✅ present | no XSS in team's received email |
| Dedup (same email, repeated) | ❌ missing | double-click UX bug, but not a security issue |
| Global daily cap | ❌ missing | Resend 100/day free tier could be drained by attacker or viral spike |
| Unbounded tag field | ⚠️ present | could theoretically amplify email body size, but no real attack vector |
| Distributed rate-limit | ⚠️ in-memory | documented MVP limitation; multi-instance assumption will fail at scale |

**Gap impact:**
- User submits same email twice in 60s: team receives 2 emails (mild annoyance, no UX feedback)
- Attacker submits 101 unique emails in one day: Resend auto-suspends account for quota abuse (account lockdown)

**Threat model boundaries (honest assessment):**
- In-scope: random bot scanners (handled by honeypot), accidental double-submit (gap), targeted quota-drain (gap)
- Out-of-scope: credential stuffing (no auth on this form), DDoS (Vercel handles), headless-browser farm bypassing honeypot (low realistic risk for a kids' cartoon brand)

## What We Tried

**Approaches evaluated:**
1. **Minimal hardening (CHOSEN)**: Email dedup + global daily counter + tag max length + tighter per-IP rate. ~40 LOC, single module. Silent dedup (no visible "already subscribed" message—returns `{ok: true}` without sending email).
2. **+ Cloudflare Turnstile**: Invisible CAPTCHA, blocks 95%+ bots. Rejected: overkill, adds external dep + latency + CF outage risk.
3. **Do nothing**: Existing protection IS sufficient. Rejected: dedup + global cap are real UX/safety value for minimal code.

**Decision reversals:**
- Initial thought: show error "you already subscribed" on dedup. Reversed: silent dedup chosen because no info leak, UX-equivalent to honeypot returning `{ok: true}` anyway.
- Initial thought: break global cap by tag (60 home, 20 coming-soon). Reversed: single bucket simpler, YAGNI applies, adjustable later if needed.

## Root Cause Analysis

Why were these gaps present in the first place?

1. **Migration mindset**: The pipeline was ported from ConvertKit in Session 2 (2026-05-18). The focus was on "get Resend working," not "add new protections." Natural to inherit the gaps from the previous system (which had different threat model: ConvertKit handled spam on their side).

2. **"It works for now" inertia**: The form shipped with honeypot + basic rate-limit. That IS working for the limited MVP traffic. Adding dedup/quota-guard felt like gold-plating until the audit made the concrete cost clear: one more module extension, no external deps, zero latency penalty.

3. **No pre-launch security checklist existed**: This audit happened ad-hoc because the user asked for it. A standup "before we launch the form, did we audit anti-spam?" would have caught this earlier.

## Lessons Learned

1. **Audit before you scale.** The gaps were minor at 10 signups/day. They become real pain at 500+/day (dedup becomes noisy, cap becomes active). Doing this NOW, pre-launch, costs ~40 LOC. Doing it POST-launch after the first quota incident is an emergency fix.

2. **Threat model clarity saves you from over-engineering.** We rejected Turnstile because we honestly assessed the attacker: not a sophisticated bot farm, probably a script kiddie or accidental spike. Honeypot + honeypot-equivalent behavior wins. This clarity also meant we didn't waste time on disposable-email blocklists (false-positive risk hurts real users; not the actual threat).

3. **Honest cost-benefit analysis is rare and valuable.** It would have been easy to say "here's the hardening, just build it." Instead, the brainstorm report acknowledged: "existing setup IS sufficient, the additions mostly protect against speculative abuse." User made an informed choice. That's trust.

4. **Silent dedup + generic error messages prevent info leaks.** The form will never say "you already subscribed" (reveals timing of signups) or "our quota is full today" (reveals internal capacity). This is tiny security debt but worth capturing.

5. **In-memory storage is fine at MVP scale—but the caveat must be documented.** All three counters (per-IP, per-email, per-day) live in a `Map`. At <100 sends/month, memory is free. The code will have a comment block: "Upgrade path: Upstash KV when traffic warrants."

## Next Steps

1. **User approves approach (DONE)** ✓
2. **Create implementation plan** — `/ck:plan` to generate phase files
3. **Implement the three changes:**
   - Extend `lib/newsletter/rate-limit.ts`: add `emailDedupAllowed()`, `globalDailyAllowed()`, `recordGlobalSend()`, tighten `MAX` to 3
   - Tweak `lib/newsletter/schemas.ts`: add `.max(64)` to tag
   - Extend `app/api/newsletter/route.ts`: call dedup → cap checks in correct order
4. **Validate locally:** confirm dedup silently okays duplicate, cap returns clean error on 81st send, Zod rejects 65-char tag
5. **Ship:** `pnpm typecheck`, `pnpm lint`, commit, PR

## Unresolved Questions

- Should dedup TTL be 24h instead of 60m? (60m chosen to allow re-subscription after user changes mind; can adjust later)
- Should global cap be per-tag? (Single bucket chosen; YAGNI)
- Should we emit an alert when cap is hit? (Vercel log line sufficient at this scale)
- Should we add rate-limit bypass for internal/admin IPs? (Not needed pre-launch; consider if form sees spam from known-good sources)

---

**Related artifacts:**
- Brainstorm report: `plans/reports/brainstorm-260519-0525-newsletter-antispam-hardening.md`
- Plan directory: `plans/260519-0525-newsletter-antispam-hardening/`

**Plan status**: Ready to hand off to implementation phase.
