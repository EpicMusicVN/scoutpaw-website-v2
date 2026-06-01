import { useId } from "react";

/**
 * Decorative cloud-cluster divider for between-section placement. Four
 * variants give visual rhythm when multiple dividers stack on the same page
 * (e.g. between character cards on /characters). All variants share a soft
 * white → cyan vertical gradient on the cloud puffs for gentle volume.
 *
 * `surface` prop controls the color context:
 *   - "light" (default) → white/cyan clouds designed for light bg
 *   - "dark"            → white/30 opacity clouds that recede on dark navy bg,
 *                         acting as a subtle breathing gap rather than a slash
 *
 * Block-level, `aria-hidden`, no animation.
 */
type Variant = "trio" | "duo-big" | "scatter" | "stack";

export function CloudDivider({
  variant = "trio",
  opacity = 0.7,
  surface = "light",
  className,
}: {
  variant?: Variant;
  opacity?: number;
  /** "light" → white/cyan clouds (default). "dark" → muted white/30 clouds that recede on navy. */
  surface?: "light" | "dark";
  className?: string;
}) {
  // Stable per-instance ID so multiple dividers on one page don't share a
  // <linearGradient> def (which would cause SVG fill collisions in some
  // browsers). `useId()` is SSR-safe in React 18.
  const gradientId = useId();
  const fill = `url(#${gradientId})`;

  // On dark surfaces use low-opacity white so clouds are a subtle decorative
  // gap rather than a bright slash between dark sections.
  const effectiveOpacity = surface === "dark" ? opacity * 0.3 : opacity;

  // Gradient stops: light → rich white/cyan volume; dark → translucent white
  // that blends with the navy bg without jarring contrast.
  const stopTop = surface === "dark" ? "rgba(255,255,255,0.6)" : "#ffffff";
  const stopBottom = surface === "dark" ? "rgba(255,255,255,0.3)" : "#e8f4f7";

  return (
    <div
      aria-hidden
      className={`relative mx-auto flex max-w-md items-center justify-center gap-3 py-6 md:gap-4 md:py-8 ${className ?? ""}`}
    >
      {/* Shared gradient defs — zero-size svg sibling, just hosts the def. */}
      <svg width="0" height="0" className="pointer-events-none absolute">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={stopTop} />
            <stop offset="100%" stopColor={stopBottom} />
          </linearGradient>
        </defs>
      </svg>

      {variant === "trio" && <TrioComposition fill={fill} opacity={effectiveOpacity} />}
      {variant === "duo-big" && <DuoBigComposition fill={fill} opacity={effectiveOpacity} />}
      {variant === "scatter" && <ScatterComposition fill={fill} opacity={effectiveOpacity} />}
      {variant === "stack" && <StackComposition fill={fill} opacity={effectiveOpacity} />}
    </div>
  );
}

function TrioComposition({ fill, opacity }: { fill: string; opacity: number }) {
  return (
    <>
      <MiniCloud className="h-7 w-14 md:h-8 md:w-16" opacity={opacity * 0.6} fill={fill} />
      <MiniCloud className="h-10 w-20 md:h-12 md:w-24" opacity={opacity} fill={fill} />
      <MiniCloud className="h-7 w-14 md:h-8 md:w-16" opacity={opacity * 0.6} fill={fill} />
    </>
  );
}

function DuoBigComposition({ fill, opacity }: { fill: string; opacity: number }) {
  return (
    <>
      <MiniCloud className="h-12 w-24 md:h-14 md:w-28" opacity={opacity * 0.85} fill={fill} />
      <MiniCloud
        className="h-6 w-12 -translate-y-2 md:h-7 md:w-14"
        opacity={opacity * 0.5}
        fill={fill}
      />
      <MiniCloud className="h-12 w-24 md:h-14 md:w-28" opacity={opacity * 0.85} fill={fill} />
    </>
  );
}

function ScatterComposition({ fill, opacity }: { fill: string; opacity: number }) {
  return (
    <div className="flex items-end gap-2 md:gap-3">
      <MiniCloud
        className="h-6 w-12 translate-y-2 md:h-7 md:w-14"
        opacity={opacity * 0.55}
        fill={fill}
      />
      <MiniCloud
        className="h-9 w-16 -translate-y-1 md:h-10 md:w-20"
        opacity={opacity * 0.8}
        fill={fill}
      />
      <MiniCloud className="h-11 w-20 md:h-12 md:w-24" opacity={opacity} fill={fill} />
      <MiniCloud
        className="h-7 w-14 -translate-y-3 md:h-8 md:w-16"
        opacity={opacity * 0.65}
        fill={fill}
      />
      <MiniCloud
        className="h-5 w-10 translate-y-1 md:h-6 md:w-12"
        opacity={opacity * 0.45}
        fill={fill}
      />
    </div>
  );
}

function StackComposition({ fill, opacity }: { fill: string; opacity: number }) {
  return (
    <div className="relative flex items-center gap-2 md:gap-3">
      <MiniCloud
        className="h-8 w-16 -translate-y-3 md:h-9 md:w-20"
        opacity={opacity * 0.7}
        fill={fill}
      />
      <MiniCloud className="h-10 w-20 md:h-12 md:w-24" opacity={opacity} fill={fill} />
      <MiniCloud
        className="h-7 w-14 translate-y-3 md:h-8 md:w-16"
        opacity={opacity * 0.65}
        fill={fill}
      />
      <MiniCloud
        className="h-9 w-16 -translate-y-2 md:h-10 md:w-20"
        opacity={opacity * 0.75}
        fill={fill}
      />
    </div>
  );
}

function MiniCloud({
  className,
  opacity,
  fill,
}: {
  className: string;
  opacity: number;
  fill: string;
}) {
  return (
    <svg viewBox="0 0 80 50" aria-hidden className={className} style={{ opacity }}>
      <ellipse cx="20" cy="30" rx="16" ry="11" fill={fill} />
      <ellipse cx="45" cy="22" rx="22" ry="16" fill={fill} />
      <ellipse cx="65" cy="30" rx="14" ry="10" fill={fill} />
    </svg>
  );
}
