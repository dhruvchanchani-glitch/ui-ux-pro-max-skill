import { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "live" | "win" | "loss" | "xp" | "coin" | "paused" | "supporter";
  size?: "xs" | "sm";
  icon?: ReactNode;
};

const tones: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "bg-canvas text-ink-2 border border-hairline",
  live: "bg-live/10 text-live border border-live/30",
  win: "bg-win/10 text-win border border-win/30",
  loss: "bg-loss/10 text-loss border border-loss/30",
  xp: "bg-xp-soft text-xp border border-xp/20",
  coin: "bg-coin-soft text-[#7B5400] border border-coin/30",
  paused: "bg-paused/15 text-[#7A4D0E] border border-paused/30",
  supporter:
    "bg-gradient-to-r from-[#F5B301] to-[#E6920C] text-[#3A2200] border border-[#7B5400]/30 font-bold",
};

export function Chip({
  tone = "neutral",
  size = "sm",
  icon,
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill uppercase tracking-wide ${
        tones[tone]
      } ${size === "xs" ? "px-2 h-5 text-[10px] font-semibold" : "px-2.5 h-7 text-micro"} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}
