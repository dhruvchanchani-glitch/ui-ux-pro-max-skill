import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Pill } from "@/components/primitives/Pill";

const FORMATIONS = ["4-4-2", "4-3-3", "3-5-2", "4-2-3-1", "5-3-2", "3-4-3"];

export function ChooseFormation() {
  const { matchId } = useParams();
  const [params] = useSearchParams();
  const roomId = params.get("room");
  const nav = useNavigate();
  const [picked, setPicked] = useState("4-3-3");

  return (
    <div className="min-h-full bg-canvas pb-28">
      <div
        className="px-5 pt-safe pt-4 pb-6"
        style={{
          background: `var(--nation-primary)`,
          color: `var(--nation-on-primary)`,
        }}
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
            Choose<br />Formation
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-5 mt-6">
        <p className="text-body text-ink-2">
          Select your strategy for the upcoming Battle.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-5">
          {FORMATIONS.map((f) => (
            <button
              key={f}
              onClick={() => setPicked(f)}
              aria-pressed={picked === f}
              className={`press p-3 rounded-md border ${
                picked === f
                  ? "border-[var(--nation-primary)] border-2 bg-surface"
                  : "border-hairline bg-surface"
              }`}
            >
              <div className="h-28 rounded-sm bg-[#0F4D2A] grid place-items-center relative overflow-hidden">
                {/* Tiny tactical mock */}
                <FormationDots f={f} />
              </div>
              <p className="font-display text-[26px] leading-none mt-3 text-ink">
                {f}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <Pill
            fullWidth
            size="lg"
            onClick={() => nav(`/match/${matchId}/draft/squad?room=${roomId}&f=${picked}`)}
          >
            Confirm formation
          </Pill>
        </div>
      </div>
    </div>
  );
}

function FormationDots({ f }: { f: string }) {
  const lines = f.split("-").map(Number); // [DEF, MID, ATT] or 4-2-3-1 style
  return (
    <svg viewBox="0 0 120 80" width="100%" height="100%">
      <rect width="120" height="80" fill="#0F4D2A" />
      <line x1="60" y1="0" x2="60" y2="80" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      {/* GK */}
      <circle cx="6" cy="40" r="2.5" fill="white" />
      {/* Lines */}
      {lines.map((n, li) => {
        const xs = lines.length === 4 ? 22 + li * 20 : 25 + li * 25;
        return Array.from({ length: n }).map((_, di) => {
          const y = ((di + 1) / (n + 1)) * 80;
          return (
            <circle key={`${li}-${di}`} cx={xs} cy={y} r="2.5" fill="white" />
          );
        });
      })}
    </svg>
  );
}
