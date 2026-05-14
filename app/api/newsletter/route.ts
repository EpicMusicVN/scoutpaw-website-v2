import { NextResponse } from "next/server";
import { rateLimitAllowed } from "@/lib/newsletter/rate-limit";
import { NewsletterRequestSchema, subscribe } from "@/lib/newsletter";

export const runtime = "nodejs";

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = NewsletterRequestSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: first?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  // Honeypot — silently succeed without subscribing.
  if (parsed.data.hp && parsed.data.hp.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const ip = getClientIp(req);
  if (!rateLimitAllowed(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please slow down." },
      { status: 429 },
    );
  }

  const result = await subscribe(parsed.data);
  if (!result.ok) {
    return NextResponse.json(result, { status: 502 });
  }
  return NextResponse.json(result);
}
