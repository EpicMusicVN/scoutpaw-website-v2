import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { maskEmail } from "@/lib/newsletter/mask";

export const runtime = "nodejs";

/**
 * Diagnostic endpoint — exposes runtime env-var presence + safe config
 * snapshot. NEVER returns secret values. Secret-key guarded.
 *
 * - DIAGNOSTIC_SECRET unset → 404 (endpoint disabled; fail-closed default)
 * - missing/wrong key      → 401
 * - authorized             → 200 + JSON snapshot
 */
export async function GET(req: Request): Promise<Response> {
  const secret = process.env.DIAGNOSTIC_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const provided = url.searchParams.get("key") ?? "";

  if (!constantTimeMatch(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamEmail = process.env.TEAM_NOTIFICATION_EMAIL;
  const fromEmail = process.env.NEWSLETTER_FROM_EMAIL ?? "onboarding@resend.dev";

  return NextResponse.json({
    mode: process.env.NEWSLETTER_MODE ?? "stub",
    hasResendKey: !!process.env.RESEND_API_KEY,
    hasTeamEmail: !!teamEmail,
    hasFromEmail: !!process.env.NEWSLETTER_FROM_EMAIL,
    fromEmail,
    teamEmailMasked: teamEmail ? maskEmail(teamEmail) : null,
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    diagnosticTimestamp: new Date().toISOString(),
  });
}

/**
 * Constant-time string comparison. Length-mismatch short-circuit is safe for
 * randomly-generated secrets — length itself is not a useful timing oracle.
 * Compares byte-length (not char-length) so non-ASCII input can't throw inside
 * `timingSafeEqual`.
 */
function constantTimeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
