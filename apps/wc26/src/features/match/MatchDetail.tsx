import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Gavel, Radio, BarChart3 } from "lucide-react";
import { findMatch } from "@/data/matches";
import { findNation } from "@/data/nations";
import { Card } from "@/components/primitives/Card";
import { Chip } from "@/components/primitives/Chip";
import { LiveScoreStrip } from "@/components/LiveScoreStrip";
import { BottomTabBar } from "@/components/BottomTabBar";
import { useUser } from "@/stores/user";
import { fmtKickoffDate, fmtKickoffTime } from "@/lib/time";

export function MatchDetail() {
  const { matchId } = useParams();
  const nav = useNavigate();
  const tz = useUser((s) => s.timezone);
  const locale = useUser((s) => s.locale);
  const match = findMatch(matchId);

  if (!match) {
    return (
      <div className="min-h-full grid place-items-center p-8 bg-canvas">
        <div className="text-center">
          <p className="text-headline">Match not found.</p>
          <button onClick={() => nav("/")} className="press mt-3 text-xp underline">
            Back to home
          </button>
        </div>
      </div>
    );
  }
  const home = findNation(match.home);
  const away = findNation(match.away);

  return (
    <div className="min-h-full bg-canvas pb-28">
      <LiveScoreStrip />

      {/* Hero */}
      <section className="relative h-[300px] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${home?.theme.primary} 0%, ${home?.theme.ink} 50%, ${away?.theme.ink} 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B]/85 via-[#0A0A0B]/35 to-transparent" />
        <button
          onClick={() => nav(-1)}
          aria-label="Back"
          className="absolute top-safe left-5 mt-4 w-10 h-10 grid place-items-center rounded-pill bg-black/35 text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="absolute inset-x-5 bottom-6 text-white">
          <h1 className="font-display text-display-md uppercase">
            {home?.name} × {away?.name}
          </h1>
          <p className="text-caption mt-1 opacity-80">
            {match.venue} · {match.city} · {match.stage}
          </p>
          <p className="text-caption mt-1 opacity-80">
            {fmtKickoffDate(match.kickoff, tz)} · {fmtKickoffTime(match.kickoff, tz, locale)} local
          </p>

          {match.status === "live" && (
            <div className="mt-3 flex items-center gap-3">
              <Chip tone="live">
                <span className="live-dot w-1.5 h-1.5 rounded-pill" /> Live {match.minute}'
              </Chip>
              <span className="font-mono text-mono-score tabular-nums font-bold">
                {match.homeScore} - {match.awayScore}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Action grid */}
      <section className="px-5 mt-6">
        <div className="grid grid-cols-2 gap-3">
          <ActionCard
            tone="xp"
            icon={<Sparkles size={20} />}
            title="Predict"
            sub="7 markets open"
            onClick={() => nav(`/match/${match.id}/betting`)}
          />
          <ActionCard
            tone="coin"
            icon={<Gavel size={20} />}
            title="Auction"
            sub="Multi or solo"
            onClick={() => nav(`/match/${match.id}/auction`)}
          />
          <ActionCard
            tone="live"
            icon={<Radio size={20} />}
            title="Watch Live"
            sub="Streaming partners"
            onClick={() => {}}
          />
          <ActionCard
            tone="ink"
            icon={<BarChart3 size={20} />}
            title="Stats & H2H"
            sub="Last 10 meetings"
            onClick={() => {}}
          />
        </div>
      </section>

      <BottomTabBar />
    </div>
  );
}

function ActionCard({
  icon,
  title,
  sub,
  onClick,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
  tone: "xp" | "coin" | "live" | "ink";
}) {
  const toneClass = {
    xp: "bg-xp-soft text-xp",
    coin: "bg-coin-soft text-[#7B5400]",
    live: "bg-live/10 text-live",
    ink: "bg-ink/5 text-ink",
  }[tone];
  return (
    <Card onClick={onClick} className="press cursor-pointer" padding="md">
      <span
        className={`w-10 h-10 grid place-items-center rounded-pill ${toneClass}`}
      >
        {icon}
      </span>
      <h3 className="text-title mt-3">{title}</h3>
      <p className="text-caption text-ink-3">{sub}</p>
    </Card>
  );
}
