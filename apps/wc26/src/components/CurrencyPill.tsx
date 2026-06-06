import { ReactNode } from "react";
import { Coins, Zap } from "lucide-react";
import { fmtCoins, fmtXP } from "@/lib/currency";

type Props = {
  kind: "xp" | "coin";
  value: number;
  onClick?: () => void;
  label?: string;
  trailing?: ReactNode;
  compact?: boolean;
};

export function CurrencyPill({ kind, value, onClick, label, trailing, compact }: Props) {
  const isXP = kind === "xp";
  const ariaLabel = `${isXP ? "Experience points" : "Coins"} balance: ${
    isXP ? fmtXP(value) : fmtCoins(value)
  }`;
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`press flex items-center gap-2 rounded-pill border ${
        isXP
          ? "bg-xp-soft border-xp/20 text-xp"
          : "bg-coin-soft border-coin/30 text-[#7B5400]"
      } ${compact ? "h-9 px-3" : "h-12 px-4"} w-full justify-center`}
    >
      <span
        className={`grid place-items-center ${
          compact ? "w-5 h-5" : "w-7 h-7 rounded-pill"
        } ${isXP ? "bg-xp/10" : "bg-coin/15"}`}
      >
        {isXP ? <Zap size={16} fill="currentColor" /> : <Coins size={16} />}
      </span>
      <span className="font-mono font-semibold tabular-nums">
        {isXP ? fmtXP(value) : fmtCoins(value)} {isXP ? "XP" : "COINS"}
      </span>
      {label && (
        <span className="text-caption font-semibold opacity-80">· {label}</span>
      )}
      {trailing}
    </button>
  );
}
