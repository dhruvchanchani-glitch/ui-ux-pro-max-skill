import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Info, Lock } from "lucide-react";
import { findMatch, type Match } from "@/data/matches";
import { findNation } from "@/data/nations";
import { MARKETS, sampleOdds, type MarketDef } from "@/data/markets";
import { PLAYERS, type Player } from "@/data/players";
import { useBetSlip, type Selection } from "@/stores/betSlip";
import { useUser } from "@/stores/user";
import { Card } from "@/components/primitives/Card";
import { Chip } from "@/components/primitives/Chip";
import { LiveScoreStrip } from "@/components/LiveScoreStrip";
import { BetSlipDrawer } from "./BetSlipDrawer";

export function BettingHub() {
  const { matchId } = useParams();
  const nav = useNavigate();
  const match = findMatch(matchId);
  const supporterPass = useUser((s) => s.supporterPass);
  const { selections, toggle } = useBetSlip();

  if (!match) {
    return (
      <div className="min-h-full grid place-items-center bg-canvas">
        <button onClick={() => nav("/")} className="press text-xp">Back home</button>
      </div>
    );
  }

  const home = findNation(match.home);
  const away = findNation(match.away);

  const topScorers = useMemo(
    () =>
      PLAYERS.filter((p) => p.nation === match.home || p.nation === match.away)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4),
    [match.home, match.away]
  );

  return (
    <div className="min-h-full bg-canvas pb-40">
      <LiveScoreStrip />

      {/* Header */}
      <div className="px-5 pt-safe pt-4">
        <button
          onClick={() => nav(-1)}
          aria-label="Back"
          className="press w-10 h-10 grid place-items-center rounded-pill bg-surface border border-hairline"
        >
          <ArrowLeft size={20} />
        </button>
        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-micro text-ink-3">{match.stage}</p>
              <p className="text-title mt-1">
                {home?.shortCode} × {away?.shortCode}
              </p>
            </div>
            {match.status === "live" ? (
              <Chip tone="live">
                <span className="live-dot w-1.5 h-1.5 rounded-pill" /> Live {match.minute}'
              </Chip>
            ) : (
              <Chip>{match.status === "finished" ? "FT" : "Upcoming"}</Chip>
            )}
          </div>
        </Card>
      </div>

      <h2 className="text-headline font-bold px-5 mt-8">Betting markets</h2>
      <div className="px-5 mt-3 space-y-3">
        {MARKETS.filter((m) => !m.supporterOnly || supporterPass).map((m) => (
          <MarketCard
            key={m.kind}
            market={m}
            match={match}
            topScorers={topScorers}
            selections={selections}
            onPick={toggle}
          />
        ))}
        {!supporterPass &&
          MARKETS.filter((m) => m.supporterOnly).map((m) => (
            <LockedMarketCard key={m.kind} market={m} />
          ))}
      </div>

      <BetSlipDrawer matchId={match.id} />
    </div>
  );
}

function MarketCard({
  market,
  match,
  topScorers,
  selections,
  onPick,
}: {
  market: MarketDef;
  match: Match | undefined;
  topScorers: Player[];
  selections: Selection[];
  onPick: (sel: Selection) => void;
}) {
  if (!match) return null;
  const home = findNation(match.home);
  const away = findNation(match.away);
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-title">{market.title}</h3>
        </div>
        <button
          aria-label={`About ${market.title}`}
          className="press text-ink-3"
          title={market.description}
        >
          <Info size={16} />
        </button>
      </div>
      <p className="text-caption text-ink-3 mt-1">
        Closes 15 min before kickoff · {market.description}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {market.kind === "match_winner" && (
          <>
            <OptionPill
              label={home?.shortCode ?? "HOME"}
              odds={sampleOdds(match.id, market.kind, 0)}
              selected={selections.some(
                (s) => s.matchId === match.id && s.market === "match_winner" && s.selection === match.home
              )}
              onClick={() =>
                onPick({
                  id: `${match.id}-mw-${match.home}`,
                  matchId: match.id,
                  market: "match_winner",
                  marketTitle: "Match Winner",
                  selection: match.home,
                  selectionLabel: `${home?.name} to win`,
                  odds: sampleOdds(match.id, market.kind, 0),
                })
              }
            />
            <OptionPill
              label="Draw"
              odds={sampleOdds(match.id, market.kind, 1)}
              selected={selections.some(
                (s) => s.matchId === match.id && s.market === "match_winner" && s.selection === "draw"
              )}
              onClick={() =>
                onPick({
                  id: `${match.id}-mw-draw`,
                  matchId: match.id,
                  market: "match_winner",
                  marketTitle: "Match Winner",
                  selection: "draw",
                  selectionLabel: "Draw",
                  odds: sampleOdds(match.id, market.kind, 1),
                })
              }
            />
            <OptionPill
              label={away?.shortCode ?? "AWAY"}
              odds={sampleOdds(match.id, market.kind, 2)}
              selected={selections.some(
                (s) => s.matchId === match.id && s.market === "match_winner" && s.selection === match.away
              )}
              onClick={() =>
                onPick({
                  id: `${match.id}-mw-${match.away}`,
                  matchId: match.id,
                  market: "match_winner",
                  marketTitle: "Match Winner",
                  selection: match.away,
                  selectionLabel: `${away?.name} to win`,
                  odds: sampleOdds(match.id, market.kind, 2),
                })
              }
            />
          </>
        )}

        {(market.kind === "top_scorer" ||
          market.kind === "first_scorer" ||
          market.kind === "mvp") && (
          <div className="col-span-3 space-y-2">
            {topScorers.map((p, idx) => (
              <button
                key={p.id}
                onClick={() =>
                  onPick({
                    id: `${match.id}-${market.kind}-${p.id}`,
                    matchId: match.id,
                    market: market.kind,
                    marketTitle: market.title,
                    selection: p.id,
                    selectionLabel: `${p.name} (${market.title})`,
                    odds: sampleOdds(match.id, market.kind, idx),
                  })
                }
                className={`press w-full flex items-center justify-between p-3 rounded-md border ${
                  selections.some(
                    (s) =>
                      s.matchId === match.id &&
                      s.market === market.kind &&
                      s.selection === p.id
                  )
                    ? "border-2 border-[var(--nation-primary)]"
                    : "border-hairline"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-pill grid place-items-center text-[10px] font-bold text-white"
                    style={{ background: `var(--nation-primary)` }}
                  >
                    {p.nation}
                  </span>
                  <span className="text-body-lg font-semibold">{p.name}</span>
                </span>
                <span className="font-mono font-bold tabular-nums">
                  {sampleOdds(match.id, market.kind, idx).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}

        {(market.kind === "total_goals" ||
          market.kind === "clean_sheet" ||
          market.kind === "red_card" ||
          market.kind === "shots_on_target" ||
          market.kind === "worldie_call") && (
          <>
            <OptionPill
              label={market.kind === "total_goals" ? "Over" : "Yes"}
              odds={sampleOdds(match.id, market.kind, 0)}
              selected={selections.some(
                (s) =>
                  s.matchId === match.id &&
                  s.market === market.kind &&
                  s.selection === "yes"
              )}
              onClick={() =>
                onPick({
                  id: `${match.id}-${market.kind}-y`,
                  matchId: match.id,
                  market: market.kind,
                  marketTitle: market.title,
                  selection: "yes",
                  selectionLabel: market.kind === "total_goals" ? "Over 2.5" : `${market.shortLabel}: Yes`,
                  odds: sampleOdds(match.id, market.kind, 0),
                })
              }
            />
            <OptionPill
              label={market.kind === "total_goals" ? "Under" : "No"}
              odds={sampleOdds(match.id, market.kind, 1)}
              selected={selections.some(
                (s) =>
                  s.matchId === match.id &&
                  s.market === market.kind &&
                  s.selection === "no"
              )}
              onClick={() =>
                onPick({
                  id: `${match.id}-${market.kind}-n`,
                  matchId: match.id,
                  market: market.kind,
                  marketTitle: market.title,
                  selection: "no",
                  selectionLabel: market.kind === "total_goals" ? "Under 2.5" : `${market.shortLabel}: No`,
                  odds: sampleOdds(match.id, market.kind, 1),
                })
              }
            />
            <div />
          </>
        )}
      </div>
    </Card>
  );
}

function OptionPill({
  label,
  odds,
  selected,
  onClick,
}: {
  label: string;
  odds: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`press p-2 rounded-md flex flex-col items-center bg-surface border ${
        selected ? "border-2 border-[var(--nation-primary)]" : "border-hairline"
      }`}
    >
      <span className="text-micro text-ink-3 uppercase">{label}</span>
      <span className="font-mono text-body-lg tabular-nums font-bold">
        {odds.toFixed(2)}
      </span>
    </button>
  );
}

function LockedMarketCard({ market }: { market: MarketDef }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-sm bg-canvas/70 grid place-items-center z-10">
        <div className="text-center">
          <Lock size={20} className="mx-auto text-xp" />
          <p className="text-body font-semibold mt-2">
            Supporter Pass unlocks this Pro market.
          </p>
        </div>
      </div>
      <Chip tone="supporter" className="absolute top-3 right-3 z-20">
        Supporter
      </Chip>
      <h3 className="text-title">{market.title}</h3>
      <p className="text-caption text-ink-3 mt-1">{market.description}</p>
      <div className="mt-3 h-16 rounded-md bg-canvas" />
    </Card>
  );
}
