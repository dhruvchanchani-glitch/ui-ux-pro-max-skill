import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IdentityHero } from "./IdentityHero";
import { LiveScoreStrip } from "@/components/LiveScoreStrip";
import { BottomTabBar } from "@/components/BottomTabBar";
import { CurrencyPill } from "@/components/CurrencyPill";
import { MatchCard } from "@/components/MatchCard";
import { Pill } from "@/components/primitives/Pill";
import { Card } from "@/components/primitives/Card";
import { matchesForNation } from "@/data/matches";
import { useUser } from "@/stores/user";
import { useWallet } from "@/stores/wallet";
import { findNation } from "@/data/nations";
import { Sparkles, Gavel, BarChart3 } from "lucide-react";

type Tab = "auction" | "betting" | "leaderboard";

export function HomeScreen() {
  const nav = useNavigate();
  const supportedTeam = useUser((s) => s.supportedTeam);
  const nation = findNation(supportedTeam);
  const refresh = useWallet((s) => s.refresh);
  const xp = useWallet((s) => s.xp);
  const coins = useWallet((s) => s.coins);
  const matches = matchesForNation(supportedTeam);
  const [tab, setTab] = useState<Tab>("betting");

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="min-h-full bg-canvas pb-28">
      <LiveScoreStrip />
      <IdentityHero />

      <main className="relative -mt-6 bg-canvas rounded-t-lg pt-8 pb-8 z-10">
        {/* Wallet strip */}
        <div className="px-5">
          <div className="flex gap-3">
            <CurrencyPill kind="xp" value={xp} onClick={() => nav("#wallet")} label="Top up" />
            <CurrencyPill kind="coin" value={coins} onClick={() => nav("#wallet")} label="Shop" />
          </div>
        </div>

        {/* Upcoming matches */}
        <section className="mt-8" aria-label="Your team's matches">
          <div className="px-5 flex items-end justify-between mb-3">
            <h2 className="text-headline font-bold">Your team's road to the final</h2>
            <button className="press text-caption uppercase font-bold text-[var(--nation-primary)]">
              View all
            </button>
          </div>
          <div className="hide-scrollbar overflow-x-auto snap-x px-5">
            <div className="flex gap-3 pb-2">
              {matches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="mt-8" aria-label="Quick navigation">
          <div className="px-5">
            <div
              role="tablist"
              aria-label="Section"
              className="relative grid grid-cols-3 border-b border-hairline"
            >
              {(["auction", "betting", "leaderboard"] as Tab[]).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`press h-12 text-micro uppercase font-bold ${
                    tab === t ? "text-ink" : "text-ink-3"
                  }`}
                >
                  {t}
                </button>
              ))}
              <span
                className="absolute -bottom-px h-[3px] bg-[var(--nation-primary)] tab-indicator"
                style={{
                  width: "calc(33.333% - 16px)",
                  left:
                    tab === "auction"
                      ? "8px"
                      : tab === "betting"
                        ? "calc(33.333% + 8px)"
                        : "calc(66.666% + 8px)",
                }}
              />
            </div>
          </div>

          <div className="px-5 pt-5">
            {tab === "betting" && (
              <Card>
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-pill grid place-items-center bg-xp/10 text-xp">
                    <Sparkles size={20} />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-title">Predict the markets</h3>
                    <p className="text-caption text-ink-2 mt-1">
                      7 markets per match · Stake XP, earn Coins on correct predictions.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Pill
                    fullWidth
                    onClick={() => matches[0] && nav(`/match/${matches[0].id}/betting`)}
                  >
                    Open today's match
                  </Pill>
                </div>
              </Card>
            )}
            {tab === "auction" && (
              <Card>
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-pill grid place-items-center bg-coin/15 text-[#7B5400]">
                    <Gavel size={20} />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-title">Build a squad live</h3>
                    <p className="text-caption text-ink-2 mt-1">
                      Bid on real players with €1B. Multiplayer or solo vs AI.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Pill
                    fullWidth
                    onClick={() => matches[0] && nav(`/match/${matches[0].id}/auction`)}
                  >
                    Enter an auction
                  </Pill>
                </div>
              </Card>
            )}
            {tab === "leaderboard" && (
              <Card>
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-pill grid place-items-center bg-ink/5">
                    <BarChart3 size={20} />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-title">Climb the leaderboard</h3>
                    <p className="text-caption text-ink-2 mt-1">
                      Skill earns status. Spend 100 coins to enter the ranked weekly board.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Pill fullWidth onClick={() => nav("/leaderboard")}>
                    See the table
                  </Pill>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Latest section */}
        <section className="mt-10" aria-label={`Latest from ${nation?.name}`}>
          <div className="px-5 mb-3">
            <h2 className="text-headline font-bold">
              Latest from {nation?.name}
            </h2>
          </div>
          <div className="px-5">
            <Card padding="none" className="overflow-hidden">
              <div
                className="h-32"
                style={{
                  background: `linear-gradient(135deg, ${nation?.theme.primary} 0%, ${nation?.theme.ink} 100%)`,
                }}
                aria-hidden
              />
              <div className="p-5">
                <span className="text-micro uppercase text-ink-3">Training news</span>
                <h3 className="text-title mt-1">
                  Squad arrives at New Jersey base
                </h3>
                <p className="text-caption text-ink-2 mt-2">
                  First session at the MetLife training ground starts at 9am local.
                </p>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <BottomTabBar />
    </div>
  );
}
