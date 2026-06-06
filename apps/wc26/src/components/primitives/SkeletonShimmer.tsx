type Props = { className?: string; rounded?: "sm" | "md" | "lg" | "pill" };

export function SkeletonShimmer({ className = "", rounded = "md" }: Props) {
  const r =
    rounded === "pill"
      ? "rounded-pill"
      : rounded === "lg"
        ? "rounded-lg"
        : rounded === "sm"
          ? "rounded-sm"
          : "rounded-md";
  return <div className={`skeleton ${r} ${className}`} aria-hidden />;
}
