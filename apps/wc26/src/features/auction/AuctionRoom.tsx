import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, SkipForward } from "lucide-react";
import { backend, isUsingMock } from "@/lib/backend";
import { subscribeToAuction } from "@/lib/auctionRealtime";
import { useAuctionStore } from "@/stores/auction";
import { generateAuctionPool } from "@/data/players";
import { findNation } from "@/data/nations";
import { fmtBudget, fmtMillion } from "@/lib/currency";
import { Pill } from "@/components/primitives/Pill";
import { haptic } from "@/lib/haptics";

export function AuctionRoom() {
  const { matchId, mode } = useParams();
  const [params] = useSearchParams();
  const roomId = params.get("room");
  const nav = useNavigate();
  const room = useAuctionStore((s) => s.room);
  const setRoom = useAuctionStore((s) => s.setRoom);

  const [secondsLeft, setSecondsLeft] = useState(15);
  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(false);
  const advancingRef = useRef(false);

  // Pull initial room state on mount.
  useEffect(() => {
    if (!roomId) return;
    backend.getAuctionState(roomId).then((r) => {
      if (r) setRoom(r);
    });
  }, [roomId, setRoom]);

  // Realtime sync — on real Supabase, subscribe to the auction-state
  // and skip-votes channels so other participants' updates land here
  // instantly. No-op when on the mock backend.
  useEffect(() => {
    if (!roomId || isUsingMock) return;
    let cancelled = false;
    let unsub: (() => void) | null = null;
    subscribeToAuction(
      roomId,
      (state) => {
        if (cancelled) return;
        // The DB doesn't carry the player pool — re-derive from the
        // shared seed so every client sees the same player ordering.
        const pool = generateAuctionPool(roomId, state.participants.length);
        setRoom({ ...state, pool });
      },
      () => {
        // Skip vote received — UI could surface the count; placeholder.
      }
    ).then((u) => {
      if (cancelled) u();
      else unsub = u;
    });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [roomId, setRoom]);

  // Tick the visible timer + drive auction progression.
  useEffect(() => {
    if (!room) return;
    if (room.status === "finished") {
      nav(`/match/${matchId}/draft/formation?room=${room.roomId}`, { replace: true });
      return;
    }
    const { timerEnd, status, roomId: id } = room;

    const tick = () => {
      const remaining = Math.max(0, (timerEnd - Date.now()) / 1000);
      setSecondsLeft(remaining);
      if (remaining <= 0 && status === "bidding" && !advancingRef.current) {
        advancingRef.current = true;
        backend.advanceAuction(id).then((next) => {
          if (next.log[0]?.kind === "sold") haptic("heavy");
          setRoom(next);
          setTimeout(() => {
            advancingRef.current = false;
          }, 800);
        });
      }
    };
    const i = setInterval(tick, 100);
    return () => clearInterval(i);
  }, [room, matchId, nav, setRoom]);

  // AI ticker. Bots bid when their delay elapses.
  useEffect(() => {
    if (!room || room.status !== "bidding") return;
    const roomId = room.roomId;
    const prevBidderId = room.currentBidderId;
    const t = setInterval(async () => {
      const next = await backend.tickAI(roomId);
      if (next.currentBidderId && next.currentBidderId !== prevBidderId) {
        if (next.currentBidderId !== "you") {
          setFlash(true);
          setTimeout(() => setFlash(false), 400);
        }
      }
      setRoom(next);
    }, 1500 + Math.random() * 1500);
    return () => clearInterval(t);
  }, [room, setRoom]);

  if (!room) {
    return <div className="min-h-full grid place-items-center bg-canvas">Loading auction…</div>;
  }

  const r = room; // local non-undefined alias for closures
  const current = r.pool[r.currentPlayerIndex];
  const me = r.participants.find((p) => p.isYou);
  const myBudget = me?.budgetM ?? 1000;
  const leader = r.participants.find((p) => p.id === r.currentBidderId);
  const playerNation = findNation(current?.nation);

  async function placeBid(amount: number) {
    if (!current || !me) return;
    try {
      const next = await backend.placeBid(r.roomId, "you", r.currentBidAmount + amount);
      if (next.currentBidderId === "you") {
        haptic("medium");
        setFlash(true);
        setTimeout(() => setFlash(false), 400);
      } else {
        haptic("error");
        setShake(true);
        setTimeout(() => setShake(false), 220);
      }
      setRoom(next);
    } catch {
      haptic("error");
    }
  }

  const showSold = room.status === "sold";

  return (
    <div className="min-h-full bg-canvas pb-32" aria-label="Auction room">
      {/* HUD strip */}
      <div className="bg-[#0A0A0B] text-white pt-safe">
        <div className="px-4 pt-3 pb-4 flex items-start justify-between">
          <button
            onClick={() => nav(-1)}
            aria-label="Back"
            className="press w-10 h-10 grid place-items-center rounded-pill bg-white/10"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-micro opacity-70">
              {mode === "single" ? "1V1 VS AI" : "MATCHUP"}
            </p>
            <p className="text-body-lg font-mono mt-0.5 font-semibold tabular-nums">
              {room.currentPlayerIndex + 1} / {room.pool.length}
            </p>
          </div>
          <button
            onClick={async () => {
              const next = await backend.voteSkip(room.roomId, "you");
              setRoom(next);
              haptic("light");
            }}
            aria-label="Vote skip"
            className="press w-10 h-10 grid place-items-center rounded-pill bg-white/10"
          >
            <SkipForward size={18} />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between">
            <span className="text-micro opacity-70">YOUR BUDGET</span>
            <span className="text-body-lg font-mono font-bold tabular-nums">
              {fmtBudget(myBudget)}
            </span>
          </div>
          <div className="mt-1 h-1 rounded-pill overflow-hidden bg-white/15">
            <div
              className="h-full bg-[var(--nation-primary)] transition-all"
              style={{ width: `${(myBudget / 1000) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Player card */}
      <main className="relative px-5 pt-6">
        {current && (
          <div
            className={`relative bg-surface rounded-lg border border-hairline overflow-hidden ${
              shake ? "animate-[shake_220ms_ease-out]" : ""
            }`}
            style={{
              boxShadow: "0 12px 24px rgba(10,10,11,0.10)",
            }}
          >
            <div
              className="h-2"
              style={{ background: playerNation?.theme.primary }}
            />
            <div className="p-5">
              <div className="flex items-start justify-between">
                <span className="text-micro bg-canvas border border-hairline px-2 h-6 inline-flex items-center rounded-pill">
                  {current.position}
                </span>
                <span className="font-display text-[40px] leading-none">
                  OVR {current.rating}
                </span>
              </div>

              <div className="mt-4 grid place-items-center">
                <svg width="120" height="140" viewBox="0 0 120 140" aria-hidden>
                  <circle cx="60" cy="50" r="34" fill={playerNation?.theme.ink} opacity="0.85" />
                  <path
                    d="M10 140 Q10 90 60 80 Q110 90 110 140 Z"
                    fill={playerNation?.theme.primary}
                    opacity="0.9"
                  />
                  <text
                    x="60"
                    y="58"
                    textAnchor="middle"
                    fontFamily="Anton, sans-serif"
                    fontSize="22"
                    fill={playerNation?.theme.onPrimary}
                  >
                    {current.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                  </text>
                </svg>
              </div>

              <h2 className="font-display text-display-md text-center mt-4 leading-none">
                {current.name}
              </h2>
              <p className="text-caption text-center text-ink-2 mt-1">
                {current.club} · {current.nation}
              </p>

              <div className="grid grid-cols-4 gap-2 mt-5">
                {(
                  [
                    ["PAC", current.pac],
                    ["SHO", current.sho],
                    ["PAS", current.pas],
                    ["DRI", current.dri],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="text-center bg-canvas rounded-md p-2">
                    <p className="text-micro text-ink-3">{k}</p>
                    <p className="font-mono font-bold tabular-nums text-mono-score">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: flash ? `var(--nation-primary)` : "transparent",
                opacity: flash ? 0.18 : 0,
                transition: "opacity 320ms ease-out",
              }}
            />

            {showSold && (
              <div
                className="absolute inset-0 grid place-items-center pointer-events-none"
                style={{ animation: "sold-stamp 600ms cubic-bezier(0.32,0.72,0,1)" }}
              >
                <span
                  className="font-display text-[88px] text-win"
                  style={{
                    transform: "rotate(-7deg)",
                    WebkitTextStroke: "4px #0a0a0b",
                  }}
                >
                  SOLD
                </span>
              </div>
            )}
          </div>
        )}

        {/* Timer */}
        <div className="mt-6 grid place-items-center">
          <span
            className={`font-mono font-bold tabular-nums leading-none transition-colors ${
              secondsLeft <= 3 ? "text-live animate-[live-pulse_1s_ease-in-out_infinite]" : "text-ink"
            }`}
            style={{ fontSize: "72px" }}
            aria-live="polite"
            aria-label={`${secondsLeft.toFixed(0)} seconds remaining`}
          >
            {secondsLeft.toFixed(1)}
          </span>
        </div>
      </main>

      {/* Bid HUD */}
      <footer className="fixed bottom-0 inset-x-0 bg-surface border-t border-hairline pb-safe pt-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-micro text-ink-3">CURRENT BID</p>
            <p className="font-mono text-mono-score font-bold tabular-nums">
              {room.currentBidAmount > 0 ? fmtMillion(room.currentBidAmount) : "—"}
            </p>
          </div>
          {leader && (
            <div className="text-right">
              <p className="text-micro text-ink-3">LEADER</p>
              <p className="text-body-lg font-semibold">{leader.name}</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[5, 10, 25].map((bump) => (
            <Pill
              key={bump}
              size="lg"
              onClick={() => placeBid(bump)}
              disabled={room.status !== "bidding"}
            >
              +€{bump}M
            </Pill>
          ))}
        </div>
        <button
          onClick={async () => {
            const next = await backend.voteSkip(room.roomId, "you");
            setRoom(next);
            haptic("light");
          }}
          className="press mt-3 mx-auto block text-caption underline text-ink-2"
        >
          Skip
        </button>
      </footer>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) }
          25% { transform: translateX(-4px) }
          75% { transform: translateX(4px) }
        }
      `}</style>
    </div>
  );
}
