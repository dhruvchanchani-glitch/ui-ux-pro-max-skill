import { useMemo, useState } from "react";
import { ChevronUp, X } from "lucide-react";
import { useBetSlip } from "@/stores/betSlip";
import { useWallet } from "@/stores/wallet";
import { calculateCoinPayout, fmtCoins, fmtXP, streakMultiplier, accumulatorMultiplier } from "@/lib/currency";
import { Pill } from "@/components/primitives/Pill";
import { backend } from "@/lib/backend";
import { haptic } from "@/lib/haptics";

type Props = { matchId: string };

const QUICK_STAKES = [25, 50, 100, "Max"] as const;

export function BetSlipDrawer({ matchId }: Props) {
  const {
    selections,
    stake,
    expanded,
    isAccumulator,
    setExpanded,
    setStake,
    setAccumulator,
    remove,
    clear,
  } = useBetSlip();
  const xp = useWallet((s) => s.xp);
  const streak = useWallet((s) => s.streak);
  const refresh = useWallet((s) => s.refresh);
  const enqueueToast = useWallet((s) => s.enqueueToast);
  const [placing, setPlacing] = useState(false);

  const totalOdds = useMemo(() => {
    if (isAccumulator && selections.length >= 2) {
      return selections.reduce((acc, s) => acc * s.odds, 1);
    }
    return selections[0]?.odds ?? 0;
  }, [selections, isAccumulator]);

  const payoutPreview = useMemo(() => {
    if (selections.length === 0) return 0;
    return calculateCoinPayout(stake, totalOdds, streak, isAccumulator ? selections.length : 1);
  }, [stake, totalOdds, streak, isAccumulator, selections.length]);

  const canPlace = selections.length > 0 && stake > 0 && xp >= stake;

  async function place() {
    if (!canPlace) return;
    setPlacing(true);
    try {
      if (isAccumulator && selections.length >= 2) {
        await backend.placeAccumulator({
          legs: selections.map((s) => ({
            matchId: s.matchId,
            market: s.market,
            selection: s.selection,
            selectionLabel: s.selectionLabel,
            odds: s.odds,
          })),
          xpStaked: stake,
        });
      } else {
        const first = selections[0];
        await backend.placeBet({
          matchId: first.matchId,
          market: first.market,
          selection: first.selection,
          selectionLabel: first.selectionLabel,
          xpStaked: stake,
          odds: first.odds,
        });
      }
      haptic("medium");
      clear();
      await refresh();
      // Optimistic resolution preview — in production this would arrive
      // via a webhook + realtime channel. For demo we surface a toast.
      enqueueToast({
        coins: payoutPreview,
        label: "Bet placed — tracking live",
        matchId,
      });
    } finally {
      setPlacing(false);
    }
  }

  if (selections.length === 0 && !expanded) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="press w-full bg-xp text-white py-3 px-5 flex items-center justify-between"
          aria-label={`Open bet slip with ${selections.length} selections`}
        >
          <span className="flex items-center gap-3">
            <span className="font-semibold">{selections.length} selection{selections.length === 1 ? "" : "s"}</span>
            <span className="opacity-90 font-mono tabular-nums">
              stake {fmtXP(stake)} XP · win {fmtCoins(payoutPreview)} coins
            </span>
          </span>
          <ChevronUp size={20} />
        </button>
      ) : (
        <div className="bg-surface rounded-t-lg border-t border-hairline pb-safe">
          <div className="px-5 pt-3 flex items-center justify-between">
            <h3 className="text-title">Bet slip</h3>
            <button
              onClick={() => setExpanded(false)}
              aria-label="Collapse bet slip"
              className="press w-9 h-9 grid place-items-center rounded-pill"
            >
              <X size={18} />
            </button>
          </div>

          {/* Selections */}
          <div className="px-5 mt-2 max-h-[40vh] overflow-y-auto">
            {selections.map((s) => (
              <div
                key={s.id}
                className="py-2 flex items-center justify-between border-b border-hairline"
              >
                <div>
                  <p className="text-micro text-ink-3">{s.marketTitle}</p>
                  <p className="text-body-lg font-semibold">{s.selectionLabel}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold tabular-nums">{s.odds.toFixed(2)}</span>
                  <button
                    onClick={() => remove(s.id)}
                    aria-label="Remove selection"
                    className="press w-8 h-8 grid place-items-center rounded-pill text-ink-3"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Accumulator toggle */}
          {selections.length >= 3 && (
            <div className="px-5 py-3 flex items-center justify-between">
              <label htmlFor="acc" className="text-body-lg font-semibold">
                Accumulator (all legs must win)
              </label>
              <input
                id="acc"
                type="checkbox"
                checked={isAccumulator}
                onChange={(e) => setAccumulator(e.target.checked)}
                className="w-6 h-6 accent-[var(--nation-primary)]"
              />
            </div>
          )}

          {/* Stake input */}
          <div className="px-5 py-3 border-t border-hairline">
            <p className="text-micro text-ink-3 uppercase">Stake (XP)</p>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                className="w-full font-mono text-[32px] tabular-nums font-bold outline-none bg-transparent"
                min={0}
                max={xp}
                aria-label="XP stake amount"
              />
            </div>
            <div className="mt-2 flex gap-2">
              {QUICK_STAKES.map((q) => (
                <button
                  key={String(q)}
                  onClick={() => setStake(q === "Max" ? xp : q)}
                  className="press flex-1 h-10 rounded-pill bg-canvas border border-hairline text-caption font-semibold"
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-caption text-ink-3 mt-3 font-mono tabular-nums">
              Odds × Streak ×{streakMultiplier(streak).toFixed(2)} × Acc ×
              {accumulatorMultiplier(isAccumulator ? selections.length : 1).toFixed(2)}
            </p>
            <p className="font-mono text-mono-score tabular-nums mt-1 font-bold text-[#7B5400]">
              You win {fmtCoins(payoutPreview)} coins
            </p>
          </div>

          <div className="px-5 pt-3 pb-4">
            <Pill
              fullWidth
              size="lg"
              variant="xp"
              disabled={!canPlace || placing}
              onClick={place}
            >
              {canPlace
                ? `Place bet · ${fmtXP(stake)} XP`
                : xp < stake
                  ? "Top up XP"
                  : "Pick a selection"}
            </Pill>
          </div>
        </div>
      )}
    </div>
  );
}
