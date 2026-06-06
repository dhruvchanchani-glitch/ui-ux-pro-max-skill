import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { backend } from "@/lib/backend";
import { findNation } from "@/data/nations";
import { useUser } from "@/stores/user";
import { Pill } from "@/components/primitives/Pill";
import { Card } from "@/components/primitives/Card";
import { haptic } from "@/lib/haptics";
import { useWallet } from "@/stores/wallet";

export function DraftBattleReveal() {
  const { matchId } = useParams();
  const [params] = useSearchParams();
  const roomId = params.get("room");
  const nav = useNavigate();
  const supportedTeam = useUser((s) => s.supportedTeam);
  const refreshWallet = useWallet((s) => s.refresh);
  const [result, setResult] = useState<{
    yourScore: number;
    opponentScore: number;
    result: "win" | "loss" | "draw";
    xpAwarded: number;
    coinsAwarded: number;
  } | null>(null);
  const [phase, setPhase] = useState<"vs" | "scoring" | "settle">("vs");

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    const run = async () => {
      const r = await backend.simulateBattle(roomId);
      if (cancelled) return;
      haptic("heavy");
      setResult(r);
      setTimeout(() => setPhase("scoring"), 800);
      setTimeout(() => {
        setPhase("settle");
        haptic(r.result === "win" ? "success" : r.result === "draw" ? "warning" : "error");
        refreshWallet();
      }, 2200);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [roomId, refreshWallet]);

  const you = findNation(supportedTeam);
  const opponent = findNation("ARG");

  if (!result) {
    return (
      <div className="min-h-full grid place-items-center bg-canvas">
        Simulating…
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-canvas pb-28">
      {/* VS hero */}
      <section
        className={`relative h-[280px] flex ${
          phase === "settle" && result.result === "loss" ? "grayscale" : ""
        }`}
      >
        <div className="flex-1 flex flex-col items-center justify-center text-white" style={{ background: you?.theme.primary }}>
          <p className="text-micro opacity-80">YOU</p>
          <p className="font-display text-display-lg leading-none mt-1">{you?.shortCode}</p>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 grid place-items-center text-white" style={{ background: "#0A0A0B" }}>
          <span className="font-display text-display-md leading-none">VS</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-white" style={{ background: opponent?.theme.primary }}>
          <p className="text-micro opacity-80">OPPONENT</p>
          <p className="font-display text-display-lg leading-none mt-1">{opponent?.shortCode}</p>
        </div>
      </section>

      {/* Ticker banner */}
      <div className="bg-[#0A0A0B] text-white py-2 overflow-hidden">
        <p className="whitespace-nowrap font-bold uppercase tracking-widest text-caption text-center">
          {result.result === "win"
            ? "YOU WIN — NEW PERSONAL BEST — DOMINATION"
            : result.result === "draw"
              ? "DRAW — KEEP IT TIGHT — CLOSE CALL"
              : "TOUGH BREAK — BETTER LUCK NEXT MATCH"}
        </p>
      </div>

      <main className="px-5 mt-6 space-y-4">
        <Card>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <p className="text-micro text-ink-3">SQUAD RATING</p>
              <p className="font-display text-display-md leading-none mt-1">
                {phase === "vs" ? "—" : result.yourScore}
              </p>
            </div>
            <div className="text-right">
              <p className="text-micro text-ink-3">OPP RATING</p>
              <p className="font-display text-display-md leading-none mt-1">
                {phase === "vs" ? "—" : result.opponentScore}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-body-lg font-semibold">XP awarded</p>
            <p className="font-mono text-mono-score tabular-nums font-bold text-xp">
              +{result.xpAwarded}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-body-lg font-semibold">Coins awarded</p>
            <p className="font-mono text-mono-score tabular-nums font-bold text-[#7B5400]">
              +{result.coinsAwarded}
            </p>
          </div>
        </Card>

        <Pill
          fullWidth
          size="lg"
          onClick={() => nav(`/match/${matchId}`, { replace: true })}
        >
          Claim XP and Coins
        </Pill>
      </main>
    </div>
  );
}
