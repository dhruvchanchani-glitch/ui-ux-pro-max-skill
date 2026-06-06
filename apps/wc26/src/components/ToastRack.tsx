import { Coins, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/stores/wallet";
import { fmtCoins } from "@/lib/currency";

/**
 * Passive bet-won toast per PRD §10.14: gold left-border, coin icon,
 * "+340 coins · Top scorer (Mbappé)" with tap-to-open behaviour.
 * Auto-dismisses 5s later, queued via the wallet store.
 */
export function ToastRack() {
  const toasts = useWallet((s) => s.toasts);
  const dismissToast = useWallet((s) => s.dismissToast);
  const nav = useNavigate();

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-safe inset-x-0 z-50 px-3 pt-3 pointer-events-none"
    >
      <div className="space-y-2 max-w-md mx-auto">
        {toasts.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              nav(`/match/${t.matchId}/betting`);
              dismissToast(t.id);
            }}
            className="press w-full text-left bg-surface border border-hairline rounded-md shadow-elev-3 flex items-center gap-3 pl-3 pr-2 py-2.5 pointer-events-auto"
            style={{ borderLeft: "4px solid var(--coin)" }}
          >
            <span className="w-9 h-9 rounded-pill grid place-items-center bg-coin-soft text-[#7B5400]">
              <Coins size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-body-lg font-semibold tabular-nums font-mono">
                +{fmtCoins(t.coins)} coins
              </span>
              <span className="block text-caption text-ink-3">{t.label}</span>
            </span>
            <span
              role="button"
              aria-label="Dismiss"
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(t.id);
              }}
              className="press w-8 h-8 grid place-items-center text-ink-3"
            >
              <X size={16} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
