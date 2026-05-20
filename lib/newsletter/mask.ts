/**
 * Mask an email for log output: keep up to 3 chars of local part + domain,
 * but never reveal the whole local for short locals.
 * "longnn1998@gmail.com" → "lon***@gmail.com"
 * "alice@x.io"           → "ali***@x.io"
 * "abc@x.io"             → "a***@x.io"   (cap visible at local.length-1)
 * "ab@x.io"              → "***@x.io"
 * Falls back to "***" for malformed input.
 */
export function maskEmail(email: string | undefined | null): string {
  if (!email || typeof email !== "string") return "***";
  const at = email.indexOf("@");
  if (at < 1) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const cap = Math.max(0, local.length - 1);
  const visible = local.slice(0, Math.min(3, cap));
  return `${visible}***${domain}`;
}
