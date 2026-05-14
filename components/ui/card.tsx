import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
  accentColor,
}: {
  className?: string;
  children: React.ReactNode;
  /** CSS color string. Renders as a soft top border accent. */
  accentColor?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-surface p-6 shadow-md transition-shadow duration-300 ease-gentle hover:shadow-xl",
        className,
      )}
      style={accentColor ? { boxShadow: `0 4px 0 ${accentColor}, 0 8px 24px rgb(0 0 0 / 0.06)` } : undefined}
    >
      {children}
    </div>
  );
}
