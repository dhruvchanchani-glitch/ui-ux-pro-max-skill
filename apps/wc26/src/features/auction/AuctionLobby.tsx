import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { findNation } from "@/data/nations";
import { useUser } from "@/stores/user";
import { backend } from "@/lib/backend";
import { haptic } from "@/lib/haptics";
import { useAuctionStore } from "@/stores/auction";

export function AuctionLobby() {
  const { matchId, mode } = useParams();
  const [params] = useSearchParams();
  const difficulty = (params.get("d") as "easy" | "balanced" | "hard") ?? "balanced";
  const nav = useNavigate();
  const supportedTeam = useUser((s) => s.supportedTeam);
  const username = useUser((s) => s.username);
  const nation = findNation(supportedTeam);
  const setRoom = useAuctionStore((s) => s.setRoom);

  const [slots, setSlots] = useState<("you" | "found" | "empty")[]>(
    mode === "single" ? ["you", "found", "empty", "empty"] : ["you", "empty", "empty", "empty"]
  );
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Multiplayer: simulate other players joining.
    if (mode === "multi") {
      let idx = 1;
      const t = setInterval(() => {
        if (idx >= slots.length) {
          clearInterval(t);
          return;
        }
        setSlots((prev) => {
          const next = [...prev];
          for (let i = 0; i < next.length; i++) {
            if (next[i] === "empty") {
              next[i] = "found";
              break;
            }
          }
          return next;
        });
        haptic("light");
        idx += 1;
      }, 1800);
      return () => clearInterval(t);
    } else {
      // Single player: fill instantly.
      const t = setTimeout(() => setSlots(["you", "found", "found", "found"]), 600);
      return () => clearTimeout(t);
    }
  }, [mode]);

  // Once full, run the 3-2-1 countdown and create the room.
  useEffect(() => {
    if (slots.every((s) => s !== "empty")) {
      let n = 3;
      setCountdown(n);
      const t = setInterval(() => {
        n -= 1;
        if (n >= 1) {
          setCountdown(n);
          haptic("medium");
        } else {
          clearInterval(t);
          (async () => {
            const teamCount = mode === "single" ? 2 : 4;
            const room = await backend.startAuction({
              matchId: matchId!,
              mode: mode as "single" | "multi",
              difficulty,
              teamCount,
              userName: username,
              userNation: supportedTeam,
            });
            setRoom(room);
            nav(`/match/${matchId}/auction/room/${mode}?room=${room.roomId}`, {
              replace: true,
            });
          })();
        }
      }, 800);
      return () => clearInterval(t);
    }
  }, [slots, mode, difficulty, matchId, nav, setRoom, supportedTeam, username]);

  return (
    <div
      className="min-h-full flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${nation?.theme.primary} 0%, ${nation?.theme.ink} 100%)`,
        color: nation?.theme.onPrimary,
      }}
    >
      <div className="px-5 pt-safe pt-6 flex-1 flex flex-col">
        <h1 className="font-display text-display-lg leading-[0.9] uppercase">
          Finding<br />opponents
          <span className="inline-flex gap-1 align-middle ml-2">
            <Dot />
            <Dot delay="200ms" />
            <Dot delay="400ms" />
          </span>
        </h1>
        <p className="text-body-lg opacity-80 mt-3 font-semibold uppercase tracking-wide">
          {mode === "single" ? "1V3 vs AI" : "1V3 LOBBY"} · {difficulty.toUpperCase()}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-10">
          {slots.map((s, i) => (
            <div
              key={i}
              className="aspect-square rounded-md border-2 grid place-items-center text-center font-bold uppercase"
              style={{
                borderColor: "rgba(255,255,255,0.25)",
                background:
                  s === "you" || s === "found"
                    ? "rgba(0,0,0,0.25)"
                    : "transparent",
              }}
            >
              {s === "you" && <Slot label="YOU" sub={username} />}
              {s === "found" && (
                <Slot
                  label={["NEOSTRIKER", "GOLDENBOOT", "TACTICIANX", "MIDMAESTRO"][i]}
                  sub="Ready"
                />
              )}
              {s === "empty" && (
                <div className="opacity-60 text-caption">Searching…</div>
              )}
            </div>
          ))}
        </div>

        {countdown !== null && (
          <div className="mt-12 grid place-items-center">
            <span className="font-display text-[160px] leading-none">
              {countdown}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay?: string }) {
  return (
    <span
      aria-hidden
      className="inline-block w-3 h-3 rounded-pill bg-current"
      style={{
        animation: "blink 1400ms ease-in-out infinite",
        animationDelay: delay,
      }}
    />
  );
}

function Slot({ label, sub }: { label: string; sub: string }) {
  return (
    <div>
      <div className="text-body-lg">{label}</div>
      <div className="text-caption font-mono opacity-80 mt-1 normal-case">{sub}</div>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0.25 }
          50% { opacity: 1 }
        }
      `}</style>
    </div>
  );
}
