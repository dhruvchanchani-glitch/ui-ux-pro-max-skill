import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { Match } from "@/data/matches";
import { findNation } from "@/data/nations";
import { FlagChip } from "./FlagChip";
import { Chip } from "./primitives/Chip";
import { Card } from "./primitives/Card";
import { fmtKickoffDate, fmtKickoffTime } from "@/lib/time";
import { useUser } from "@/stores/user";

type Props = {
  match: Match;
  compact?: boolean;
};

export function MatchCard({ match, compact = false }: Props) {
  const nav = useNavigate();
  const tz = useUser((s) => s.timezone);
  const locale = useUser((s) => s.locale);
  const home = findNation(match.home);
  const away = findNation(match.away);

  return (
    <Card
      onClick={() => nav(`/match/${match.id}`)}
      className={`press cursor-pointer ${
        compact ? "min-w-[260px]" : "min-w-[300px]"
      } snap-start`}
      role="button"
      aria-label={`Match ${home?.name} versus ${away?.name}, ${fmtKickoffDate(
        match.kickoff,
        tz
      )} at ${fmtKickoffTime(match.kickoff, tz, locale)} local`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-micro text-ink-3">{match.stage}</span>
          <span className="font-mono text-body-lg font-semibold">
            {fmtKickoffDate(match.kickoff, tz)}
          </span>
        </div>
        <MapPin size={16} className="text-ink-3" aria-hidden />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col items-center gap-2 w-1/3">
          <FlagChip code={match.home} size={36} />
          <span className="text-micro">{match.home}</span>
        </div>
        <div className="flex flex-col items-center">
          {match.status === "live" || match.status === "finished" ? (
            <span className="font-mono text-mono-score tabular-nums font-bold">
              {match.homeScore}-{match.awayScore}
            </span>
          ) : (
            <span className="font-mono text-body-lg font-semibold tabular-nums">
              {fmtKickoffTime(match.kickoff, tz, locale)}
            </span>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 w-1/3">
          <FlagChip code={match.away} size={36} />
          <span className="text-micro">{match.away}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-caption text-ink-3">
          {match.venue} · {match.city}
        </span>
        {match.status === "live" ? (
          <Chip tone="live">
            <span className="live-dot w-1.5 h-1.5 rounded-pill" /> Live {match.minute}'
          </Chip>
        ) : match.status === "finished" ? (
          <Chip>FT</Chip>
        ) : (
          <Chip>Upcoming</Chip>
        )}
      </div>
    </Card>
  );
}
