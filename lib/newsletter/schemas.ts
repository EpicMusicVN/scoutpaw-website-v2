import { z } from "zod";

export const NewsletterRequestSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  tag: z.string().max(64, "Tag too long.").optional(),
  /** Honeypot — humans leave it empty; bots fill it. */
  hp: z.string().optional(),
});
export type NewsletterRequest = z.infer<typeof NewsletterRequestSchema>;

export type NewsletterResult =
  | { ok: true }
  | { ok: false; error: string };
