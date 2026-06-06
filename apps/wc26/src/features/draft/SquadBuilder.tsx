import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { backend } from "@/lib/backend";
import { useAuctionStore } from "@/stores/auction";
import { findPlayer, type Player, type Position } from "@/data/players";
import { Pill } from "@/components/primitives/Pill";
import { Sheet } from "@/components/primitives/Sheet";
import { fmtBudget, fmtMillion } from "@/lib/currency";
import { haptic } from "@/lib/haptics";

const FORMATION_SLOTS: Record<string, Position[]> = {
  "4-4-2": ["GK", "LB", "CB", "CB", "RB", "CM", "CM", "LW", "RW", "ST", "ST"],
  "4-3-3": ["GK", "LB", "CB", "CB", "RB", "CDM", "CM", "CM", "LW", "ST", "RW"],
  "3-5-2": ["GK", "CB", "CB", "CB", "LB", "CM", "CDM", "CM", "RB", "ST", "ST"],
  "4-2-3-1": ["GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "CAM", "LW", "RW", "ST"],
  "5-3-2": ["GK", "LB", "CB", "CB", "CB", "RB", "CM", "CDM", "CM", "ST", "ST"],
  "3-4-3": ["GK", "CB", "CB", "CB", "LW", "CDM", "CM", "RW", "LW", "ST", "RW"],
};

export function SquadBuilder() {
  const { matchId } = useParams();
  const [params] = useSearchParams();
  const roomId = params.get("room");
  const formation = params.get("f") ?? "4-3-3";
  const nav = useNavigate();
  const room = useAuctionStore((s) => s.room);
  const refresh = useAuctionStore((s) => s.refresh);

  useEffect(() => {
    if (roomId && !room) refresh(roomId);
  }, [room, roomId, refresh]);

  const me = room?.participants.find((p) => p.isYou);
  const myPlayers = (me?.squad ?? []).map(findPlayer).filter((p): p is Player => !!p);

  const slots = FORMATION_SLOTS[formation] ?? FORMATION_SLOTS["4-3-3"];
  const [assignments, setAssignments] = useState<(string | null)[]>(
    Array(11).fill(null)
  );
  const [pickerOpen, setPickerOpen] = useState<number | null>(null);

  const assignedIds = new Set(assignments.filter(Boolean) as string[]);

  const startersRating = useMemo(() => {
    const list = assignments
      .map((id) => (id ? findPlayer(id) : undefined))
      .filter((p): p is Player => !!p);
    if (list.length === 0) return 0;
    return Math.round(list.reduce((a, p) => a + p.rating, 0) / list.length);
  }, [assignments]);

  const chemistry = useMemo(() => {
    const list = assignments
      .map((id) => (id ? findPlayer(id) : undefined))
      .filter((p): p is Player => !!p);
    if (list.length === 0) return 0;
    const nations = new Set(list.map((p) => p.nation));
    const clubs = new Set(list.map((p) => p.club));
    const leagues = new Set(list.map((p) => p.league));
    return Math.min(
      100,
      (11 - nations.size) * 4 + (11 - clubs.size) * 3 + (11 - leagues.size) * 2
    );
  }, [assignments]);

  const totalCost = useMemo(() => {
    return assignments
      .map((id) => (id ? findPlayer(id) : undefined))
      .filter((p): p is Player => !!p)
      .reduce((a, p) => a + p.costM, 0);
  }, [assignments]);

  const remainingBudget = 1000 - totalCost;
  const allFilled = assignments.every(Boolean);

  function pick(playerId: string) {
    if (pickerOpen === null) return;
    setAssignments((prev) => {
      const next = [...prev];
      next[pickerOpen] = playerId;
      return next;
    });
    haptic("medium");
    setPickerOpen(null);
  }

  async function lockIn() {
    if (!roomId) return;
    const starters = assignments.filter(Boolean) as string[];
    const bench = myPlayers
      .map((p) => p.id)
      .filter((id) => !assignedIds.has(id))
      .slice(0, 5);
    await backend.submitSquad({
      roomId,
      starters,
      bench,
      formation,
    });
    haptic("success");
    nav(`/match/${matchId}/draft/reveal?room=${roomId}`, { replace: true });
  }

  return (
    <div className="min-h-full bg-canvas pb-32">
      <div
        className="px-5 pt-safe pt-4 pb-6 text-[var(--nation-on-primary)]"
        style={{ background: `var(--nation-primary)` }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => nav(-1)}
            aria-label="Back"
            className="press w-10 h-10 grid place-items-center rounded-pill bg-black/20"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display text-display-md leading-none uppercase">
            Build your XI
          </h1>
          <button
            onClick={() => setAssignments(Array(11).fill(null))}
            aria-label="Reset"
            className="press w-10 h-10 grid place-items-center rounded-pill bg-black/20"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div>
            <p className="text-micro opacity-70">RATING</p>
            <p className="font-mono text-mono-score font-bold tabular-nums">
              {startersRating}
            </p>
          </div>
          <div>
            <p className="text-micro opacity-70">CHEMISTRY</p>
            <p className="font-mono text-mono-score font-bold tabular-nums">
              {chemistry}
            </p>
          </div>
          <div>
            <p className="text-micro opacity-70">BUDGET LEFT</p>
            <p className="font-mono text-mono-score font-bold tabular-nums">
              {fmtBudget(remainingBudget)}
            </p>
          </div>
        </div>
      </div>

      {/* Pitch */}
      <div className="px-5 mt-6">
        <div
          className="relative aspect-[4/5] rounded-md overflow-hidden"
          style={{
            background:
              "repeating-linear-gradient(0deg, #0F4D2A 0 20px, #11532E 20px 40px)",
          }}
        >
          {/* Pitch lines */}
          <div className="absolute inset-3 border border-white/30 rounded-sm" />
          <div className="absolute left-1/2 top-3 bottom-3 w-px bg-white/30" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-pill border border-white/30" />

          {/* Slot positions: simple top-down grid based on formation. */}
          {slots.map((pos, i) => {
            const row = pos === "GK" ? 0 : pos === "CB" || pos === "LB" || pos === "RB" ? 1 : pos.startsWith("C") ? 2 : 3;
            const inRow = slots.filter((_, j) => {
              const p = slots[j];
              return (
                (row === 0 && p === "GK") ||
                (row === 1 && (p === "CB" || p === "LB" || p === "RB")) ||
                (row === 2 && (p === "CDM" || p === "CM" || p === "CAM")) ||
                (row === 3 && (p === "LW" || p === "RW" || p === "ST"))
              );
            }).length;
            const idxInRow = slots
              .slice(0, i + 1)
              .filter((p) => {
                if (row === 0) return p === "GK";
                if (row === 1) return p === "CB" || p === "LB" || p === "RB";
                if (row === 2) return p === "CDM" || p === "CM" || p === "CAM";
                return p === "LW" || p === "RW" || p === "ST";
              }).length - 1;

            const x = ((idxInRow + 1) / (inRow + 1)) * 100;
            const y = [12, 32, 58, 82][row];
            const filled = assignments[i];
            const player = filled ? findPlayer(filled) : null;
            return (
              <button
                key={i}
                onClick={() => setPickerOpen(i)}
                aria-label={`${pos} slot, ${player ? player.name : "empty"}`}
                className="press absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {player ? (
                  <div className="w-14 text-center">
                    <div
                      className="w-14 h-16 rounded-sm border-2 border-white/40 grid place-items-center"
                      style={{ background: `var(--nation-secondary)` }}
                    >
                      <div className="font-display text-[14px] leading-none text-ink">
                        {player.rating}
                      </div>
                    </div>
                    <p className="text-[10px] text-white mt-1 truncate">
                      {player.name.split(" ").pop()}
                    </p>
                    <p className="text-[9px] text-white/70 uppercase">{pos}</p>
                  </div>
                ) : (
                  <div className="w-14 h-16 grid place-items-center rounded-sm border-2 border-dashed border-white/60 text-white">
                    <span className="text-xl">+</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lock CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-canvas pt-3 px-5 pb-safe">
        <Pill fullWidth size="lg" disabled={!allFilled} onClick={lockIn}>
          Lock squad and play
        </Pill>
      </div>

      {/* Picker sheet */}
      <Sheet
        open={pickerOpen !== null}
        onClose={() => setPickerOpen(null)}
        title={
          pickerOpen !== null
            ? `Pick a ${slots[pickerOpen]}`
            : undefined
        }
        height="tall"
      >
        <ul className="divide-y divide-hairline">
          {myPlayers
            .filter((p) => pickerOpen === null || p.position === slots[pickerOpen])
            .filter((p) => !assignedIds.has(p.id))
            .sort((a, b) => b.rating - a.rating)
            .map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => pick(p.id)}
                  className="press w-full flex items-center gap-3 py-3 text-left"
                >
                  <span
                    className="w-12 h-12 rounded-sm grid place-items-center font-display text-[20px] text-white"
                    style={{ background: `var(--nation-primary)` }}
                  >
                    {p.rating}
                  </span>
                  <div className="flex-1">
                    <p className="text-body-lg font-semibold">{p.name}</p>
                    <p className="text-caption text-ink-3">
                      {p.club} · {p.nation} · {p.position}
                    </p>
                  </div>
                  <span className="font-mono text-body-lg text-ink-2 tabular-nums">
                    {fmtMillion(p.costM)}
                  </span>
                </button>
              </li>
            ))}
          {myPlayers.filter((p) => pickerOpen === null || p.position === slots[pickerOpen!]).length === 0 && (
            <li className="py-6 text-center text-ink-3 text-body">
              No auctioned players for this slot. Try a different formation.
            </li>
          )}
        </ul>
      </Sheet>
    </div>
  );
}
