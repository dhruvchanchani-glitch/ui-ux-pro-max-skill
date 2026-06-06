import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Bot, ChevronRight } from "lucide-react";
import { Pill } from "@/components/primitives/Pill";
import { Card } from "@/components/primitives/Card";
import { LiveScoreStrip } from "@/components/LiveScoreStrip";

export function AuctionModePicker() {
  const { matchId } = useParams();
  const nav = useNavigate();
  const [mode, setMode] = useState<"multi" | "single">("single");
  const [difficulty, setDifficulty] = useState<"easy" | "balanced" | "hard">("balanced");

  return (
    <div className="min-h-full bg-canvas pb-28">
      <LiveScoreStrip />
      <div className="px-5 pt-safe pt-4">
        <button
          onClick={() => nav(-1)}
          aria-label="Back"
          className="press w-10 h-10 grid place-items-center rounded-pill bg-canvas border border-hairline"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-display-md font-display mt-6">How do you want to play?</h1>
        <p className="text-body text-ink-2 mt-2">
          Same 15-second timer. Same €1B budget. You decide who you bid against.
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => setMode("multi")}
            aria-pressed={mode === "multi"}
            className={`w-full text-left press ${mode === "multi" ? "ring-2 ring-[var(--nation-primary)]" : ""}`}
          >
            <Card>
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 grid place-items-center rounded-md bg-xp-soft text-xp">
                  <Users size={22} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-title">Live multiplayer</h3>
                    <span className="text-micro bg-canvas border border-hairline rounded-pill px-2 py-0.5 text-ink-3">
                      ~12s queue
                    </span>
                  </div>
                  <p className="text-caption text-ink-2 mt-1">
                    Random matchmaking. 60-second budget battle.
                  </p>
                </div>
                <ChevronRight size={18} className="text-ink-3 mt-1" />
              </div>
            </Card>
          </button>

          <button
            onClick={() => setMode("single")}
            aria-pressed={mode === "single"}
            className={`w-full text-left press ${mode === "single" ? "ring-2 ring-[var(--nation-primary)]" : ""}`}
          >
            <Card>
              <div className="flex items-start gap-4">
                <span className="w-12 h-12 grid place-items-center rounded-md bg-coin-soft text-[#7B5400]">
                  <Bot size={22} />
                </span>
                <div className="flex-1">
                  <h3 className="text-title">Vs. AI</h3>
                  <p className="text-caption text-ink-2 mt-1">
                    Pick difficulty. Practice your bids.
                  </p>
                  <div className="mt-3 flex items-center gap-1 rounded-pill bg-canvas p-1 border border-hairline">
                    {(["easy", "balanced", "hard"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDifficulty(d);
                        }}
                        className={`press flex-1 h-9 rounded-pill text-caption capitalize font-semibold transition-colors ${
                          difficulty === d
                            ? "bg-[var(--nation-primary)] text-[var(--nation-on-primary)]"
                            : "text-ink-2"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </button>
        </div>

        <div className="mt-8">
          <Pill
            fullWidth
            size="lg"
            onClick={() => nav(`/match/${matchId}/auction/lobby/${mode}?d=${difficulty}`)}
          >
            Find a game
          </Pill>
        </div>
      </div>
    </div>
  );
}
