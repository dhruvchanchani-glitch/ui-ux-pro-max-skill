import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

type Variant = "primary" | "ghost" | "xp" | "coin" | "danger" | "supporter";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--nation-primary)] text-[var(--nation-on-primary)] hover:opacity-95 disabled:opacity-50",
  ghost:
    "bg-surface text-ink border border-hairline hover:bg-canvas disabled:opacity-50",
  xp: "bg-xp-soft text-xp border border-xp/20 hover:bg-xp/15",
  coin: "bg-coin-soft text-[#7B5400] border border-coin/30 hover:bg-coin/15",
  danger: "bg-loss text-white",
  supporter:
    "bg-gradient-to-r from-[#F5B301] to-[#E6920C] text-[#3A2200] font-semibold",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 h-9 text-caption",
  md: "px-4 h-11 text-body-lg font-semibold",
  lg: "px-5 h-14 text-body-lg font-bold",
};

export const Pill = forwardRef<HTMLButtonElement, Props>(function Pill(
  {
    variant = "primary",
    size = "md",
    leadingIcon,
    trailingIcon,
    fullWidth,
    className = "",
    children,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      className={`press inline-flex items-center justify-center gap-2 rounded-pill outline-none ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  );
});
