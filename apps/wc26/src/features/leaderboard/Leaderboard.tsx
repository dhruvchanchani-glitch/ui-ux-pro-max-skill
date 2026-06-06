import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { backend, type LeaderboardRow } from "@/lib/backend";
import { Card } from "@/components/primitives/Card";
import { Chip } from "@/components/primitives/Chip";
import { Pill } from "@/components/primitives/Pill";
import { FlagChip } from "@/components/FlagChip";
import { BottomTabBar } from "@/components/BottomTabBar";
import { LiveScoreStrip } from "@/components/LiveScoreStrip";
import { useWallet } from "@/stores/wallet";
import { fmtCoins } from "@/lib/currency";

type Scope = "weekly" | "tournament" | "friends";

export function Leaderboard() {
  const nav = useNavigate();
  const [scope, setScope] = useState<Scope>("weekly");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const coins = useWallet((s) => s.coins);
  const refresh = useWallet((s) => s.refresh);

  useEffect(() => {
    backend.getLeaderboard(scope).then(setRows);
  }, [scope]);

  async function enterRanked() {
    await backend.enterRankedWeekly();
    await refresh();
    backend.getLeaderboard(scope).then(setRows);
  }

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const you = rows.find((r) => r.isYou);

  return (
    <div className="min-h-full bg-canvas pb-32">
      <LiveScoreStrip />
      <header className="px-5 pt-safe pt-4 flex items-center gap-3">
        <button
          onClick={() => nav("/")}
          aria-label="Back"
          className="press w-10 h-10 grid place-items-center rounded-pill bg-surface border border-hairline"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-headline font-bold">Leaderboard</h1>
      </header>

      {/* Tabs */}
      <div className="px-5 mt-5">
        <div role="tablist" className="grid grid-cols-3 border-b border-hairline">
          {(["weekly", "tournament", "friends"] as Scope[]).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={scope === s}
              onClick={() => setScope(s)}
              className={`press h-11 text-micro uppercase font-bold ${
                scope === s ? "text-ink" : "text-ink-3"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Ranked-entry banner */}
      {scope === "weekly" && coins >= 100 && (
        <div className="mx-5 mt-4">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-body-lg font-semibold">
                  You're in read-only.
                </p>
                <p className="text-caption text-ink-3 mt-1">
                  Spend 100 Coins to join the ranked weekly board.
                </p>
              </div>
              <Pill variant="coin" onClick={enterRanked}>
                Enter
              </Pill>
            </div>
          </Card>
        </div>
      )}

      {/* Podium */}
      <div className="px-5 mt-4">
        <Card padding="md" className="bg-coin-soft border-coin/30">
          <div className="grid grid-cols-3 items-end gap-2 text-center">
            {top3.map((row, idx) => (
              <div key={row.userId}>
                <div className="grid place-items-center">
                  <div
                    className="w-12 h-12 rounded-pill grid place-items-center font-display text-[20px] text-white"
                    style={{
                      background:
                        idx === 0 ? "#F5B301" : idx === 1 ? "#A1A1AA" : "#B07740",
                    }}
                  >
                    {idx + 1}
                  </div>
                </div>
                <p className="text-caption font-semibold mt-2 truncate">
                  {row.username}
                </p>
                <p className="font-mono text-body tabular-nums font-bold text-[#7B5400]">
                  {fmtCoins(row.coins)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Rows */}
      <ul className="px-5 mt-4 space-y-2">
        {rest.map((row) => (
          <li key={row.userId}>
            <Card padding="sm" className="flex items-center gap-3">
              <span className="w-6 text-right font-mono tabular-nums text-ink-3 font-bold">
                {row.rank}
              </span>
              <span
                className="w-10 h-10 rounded-pill grid place-items-center text-white font-bold uppercase"
                style={{ background: `var(--nation-primary)` }}
              >
                {row.username[0]}
              </span>
              <div className="flex-1">
                <p className="text-body-lg font-semibold flex items-center gap-2">
                  {row.username}
                  {row.supporter && <Chip tone="supporter" size="xs">Supporter</Chip>}
                </p>
                <FlagChip code={row.nation} size={20} />
              </div>
              <span className="font-mono text-body-lg tabular-nums font-bold text-[#7B5400]">
                {fmtCoins(row.coins)}
              </span>
            </Card>
          </li>
        ))}
      </ul>

      {/* Sticky YOU row */}
      {you && (
        <div className="fixed bottom-20 inset-x-0 px-5 z-10">
          <Card padding="sm" className="bg-xp-soft border-xp/30">
            <div className="flex items-center gap-3">
              <span className="w-6 text-right font-mono tabular-nums text-xp font-bold">
                {you.rank}
              </span>
              <span
                className="w-10 h-10 rounded-pill grid place-items-center bg-xp text-white font-bold"
              >
                {you.username[0]}
              </span>
              <div className="flex-1">
                <p className="text-body-lg font-semibold flex items-center gap-2">
                  YOU <Chip tone="xp" size="xs">Rank #{you.rank}</Chip>
                </p>
                <p className="text-caption text-ink-3">{you.username}</p>
              </div>
              <Trophy size={20} className="text-xp" />
            </div>
          </Card>
        </div>
      )}

      <BottomTabBar />
    </div>
  );
}
