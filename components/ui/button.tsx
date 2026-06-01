import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "dark" | "dark-surface";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "cta-shimmer bg-brand-primary text-ink-blue hover:brightness-95 shadow-cozy hover:shadow-cozy-md",
  secondary:
    "bg-brand-secondary text-white hover:brightness-105 shadow-cozy hover:shadow-cozy-md",
  ghost: "bg-transparent text-ink-blue hover:bg-paper",
  outline: "border-[1.5px] border-ink/15 bg-surface text-ink-blue hover:border-ink/30",
  dark: "cta-shimmer bg-navy text-white hover:bg-navy/90 shadow-cozy hover:shadow-cozy-md",
  "dark-surface": "border border-white/40 bg-transparent text-white hover:bg-white/10 hover:border-white/60",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3.5 py-2 text-sm min-h-[36px]",
  md: "px-5 py-2.5 text-base min-h-[44px]",
  lg: "px-6 py-3 text-base min-h-[48px]",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition-all duration-200 ease-out touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
} & (
  | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href">)
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(baseClass, variantClass[variant], sizeClass[size], className);

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }
  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
