import { findNation } from "@/data/nations";

type Props = {
  code: string;
  size?: number;
  rounded?: number;
  className?: string;
};

/**
 * 24×16 themed SVG flag chip per PRD §8. Not literally accurate to every
 * flag (writing 47 real flag SVGs would be a project of its own); instead
 * we render a two-band composition from the nation's primary + secondary
 * tokens, with the accent as a cross or stripe. Recognizable enough to
 * carry the nation identity in tight UI without becoming a maintenance
 * burden, and never an emoji.
 */
export function FlagChip({ code, size = 24, rounded = 4, className = "" }: Props) {
  const nation = findNation(code);
  if (!nation) {
    return (
      <span
        aria-label={`${code} flag`}
        className={`inline-block bg-canvas ${className}`}
        style={{ width: size, height: (size * 2) / 3, borderRadius: rounded }}
      />
    );
  }
  const h = (size * 2) / 3;
  const { primary, secondary, accent } = nation.theme;
  return (
    <svg
      role="img"
      aria-label={`${nation.name} flag`}
      width={size}
      height={h}
      viewBox="0 0 24 16"
      className={`inline-block ${className}`}
      style={{ borderRadius: rounded, overflow: "hidden" }}
    >
      <rect width="24" height="16" fill={primary} />
      <rect width="24" height="8" y="8" fill={secondary} />
      <rect width="6" height="16" fill={accent} />
    </svg>
  );
}
