import { getPayload } from "payload";
import config from "@payload-config";

/**
 * Singleton Payload Local API client. Cached across hot reloads so we don't
 * re-initialize Payload on every request. Used by `payload-source.ts` for
 * in-process content reads (no HTTP).
 */
let cached: Awaited<ReturnType<typeof getPayload>> | null = null;

export async function getPayloadClient() {
  if (cached) return cached;
  cached = await getPayload({ config });
  return cached;
}
