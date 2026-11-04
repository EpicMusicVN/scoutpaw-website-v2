import Image from "next/image";
import type { CSSProperties } from "react";
import { assetUrl } from "@/lib/utils/asset-url";

/**
 * The pack's noses — one per pup, each a distinct colour and shape. They are
 * the site's small decorative mark (in place of paw prints, bullets and
 * sparkles). Use a pup's own nose where the decoration belongs to that pup;
 * elsewhere cycle through `PACK_NOSE_ORDER` or show the whole row.
 */
export const PACK_NOSE_ORDER = ["max", "rocky", "oscar", "buddy", "bella"] as const;

/** The pup whose nose fills slot `i` when cycling through the pack. */
export function packNoseAt(i: number): string {
  return PACK_NOSE_ORDER[i % PACK_NOSE_ORDER.length] as string;
}

/** Public path of a pup's nose (also used by CSS list bullets). */
export function noseSrc(slug: string): string {
  return assetUrl(`brand/noses/${slug}-nose.webp`);
}

/** One decorative nose. Size and placement come from `className`/`style`. */
export function PupNose({
  slug,
  className,
  style,
}: {
  slug: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Image
      src={noseSrc(slug)}
      alt=""
      aria-hidden="true"
      width={96}
      height={96}
      // Already exported at display size; skip the optimizer round-trip.
      unoptimized
      draggable={false}
      className={`pointer-events-none select-none ${className ?? ""}`}
      style={style}
    />
  );
}

/** All five noses in a row — a small "the whole pack" sign-off. */
export function PupNoseRow({
  className,
  noseClassName = "h-5 w-5",
}: {
  className?: string;
  noseClassName?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center gap-1 align-middle ${className ?? ""}`}
    >
      {PACK_NOSE_ORDER.map((slug) => (
        <PupNose key={slug} slug={slug} className={noseClassName} />
      ))}
    </span>
  );
}
