import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlagChip } from "./FlagChip";
import { useUser } from "@/stores/user";
import { getLiveMatchesSync } from "@/lib/mockBackend";
import { findNation } from "@/data/nations";

/**
 * Persistent live-score strip per PRD §FR-LIVE-1..5. 44pt tall, dark,
 * aria-live polite. Hidden when "Live updates" is muted in Settings or
 * when there are no live matches the user cares about.
 */
export function LiveScoreStrip() {
  const liveUpdates = useUser((s) => s.liveUpdates);
  const supportedTeam = useUser((s) => s.supportedTeam);
  const nav = useNavigate();

  const all = getLiveMatchesSync();
  const relevant = all; // mock: show every live match
  const [tick, setTick] = useState(0);
  useEffect(() => {
    // Tiny ticker so the minute clock looks alive.
    const i = setInterval(() => setTick((v) => v + 1), 30_000);
    return () => clearInterval(i);
  }, []);
  void tick;
  void supportedTeam;

  if (!liveUpdates || relevant.length === 0) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Live scores"
      className="bg-[#0A0A0B] text-white h-11 flex items-center overflow-x-auto hide-scrollbar"
    >
      <div className="flex gap-3 px-4">
        {relevant.map((m) => {
          const home = findNation(m.home);
          const away = findNation(m.away);
          return (
            <button
              key={m.id}
              onClick={() => nav(`/match/${m.id}`)}
              className="press flex items-center gap-2 whitespace-nowrap"
              aria-label={`Live, ${home?.name} ${m.homeScore}, ${away?.name} ${m.awayScore}, ${m.minute} minutes`}
            >
              <FlagChip code={m.home} size={18} />
              <span className="text-[12px] font-bold tracking-wide">
                {m.home}
              </span>
              <span className="font-mono text-mono-score tabular-nums px-1">
                {m.homeScore}-{m.awayScore}
              </span>
              <span className="text-[12px] font-bold tracking-wide">
                {m.away}
              </span>
              <FlagChip code={m.away} size={18} />
              <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase">
                <span className="live-dot w-1.5 h-1.5 rounded-pill" />
                Live {m.minute}'
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
