import { Search } from "lucide-react";
import { useState } from "react";
import { findNation } from "@/data/nations";
import { useUser } from "@/stores/user";
import { ProfileSheet } from "@/features/profile/ProfileSheet";

/**
 * The Home identity hero per PRD §12.4 + §4.3:
 *   - two-band split of nation primary/secondary
 *   - giant outlined "26"
 *   - hero player silhouette inside the counter (CSS abstraction, since
 *     external photography isn't available in this build)
 *   - nation name in display-lg Anton at the bottom
 *   - account avatar with 2px nation-primary ring (top right)
 */
export function IdentityHero() {
  const supportedTeam = useUser((s) => s.supportedTeam);
  const username = useUser((s) => s.username);
  const nation = findNation(supportedTeam);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!nation) return null;

  const initial = (username || "?").charAt(0).toUpperCase();

  return (
    <section
      className="relative h-[500px] overflow-hidden"
      aria-label={`${nation.name} home hero`}
    >
      {/* Two-band background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(110deg, ${nation.theme.primary} 50%, ${nation.theme.secondary} 50%)`,
        }}
      />
      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>")`,
        }}
      />
      {/* 1.5px black hairline between bands */}
      <div
        className="absolute inset-y-0 left-1/2 w-px"
        style={{ background: "rgba(0,0,0,0.45)" }}
      />

      {/* Giant outlined "26" */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <span
          className="font-display select-none text-[240px] leading-none outline-26"
          style={{
            color: "transparent",
            WebkitTextStroke: `4px ${nation.theme.onPrimary}`,
            transform: "translateY(-6px)",
            opacity: 0.55,
          }}
          aria-hidden
        >
          26
        </span>
      </div>

      {/* Player silhouette (CSS abstraction). Inside the "26" counter. */}
      <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none">
        <svg
          width="220"
          height="280"
          viewBox="0 0 220 280"
          aria-hidden
          style={{ animation: "hero-zoom 8000ms ease-in-out infinite alternate" }}
        >
          <defs>
            <radialGradient id="head-grad" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stopColor={nation.theme.accent} stopOpacity="0.95" />
              <stop offset="100%" stopColor={nation.theme.ink} />
            </radialGradient>
          </defs>
          {/* Shoulders */}
          <path
            d="M30 280 Q30 200 110 180 Q190 200 190 280 Z"
            fill={nation.theme.ink}
            opacity="0.85"
          />
          {/* Neck */}
          <rect
            x="95"
            y="150"
            width="30"
            height="40"
            rx="10"
            fill="url(#head-grad)"
            opacity="0.9"
          />
          {/* Head */}
          <circle
            cx="110"
            cy="100"
            r="58"
            fill="url(#head-grad)"
            opacity="0.95"
          />
          {/* Number on chest */}
          <text
            x="110"
            y="250"
            textAnchor="middle"
            fontFamily="Anton, sans-serif"
            fontSize="48"
            fill={nation.theme.onPrimary}
            opacity="0.9"
          >
            {nation.heroPlayer.split(" ").pop()?.slice(0, 3).toUpperCase()}
          </text>
        </svg>
      </div>

      {/* Top bar: search + avatar */}
      <div className="absolute top-0 inset-x-0 pt-safe">
        <div className="flex items-center justify-between px-5 pt-4">
          <button
            aria-label="Search"
            className="press w-10 h-10 grid place-items-center rounded-pill bg-black/35 text-white backdrop-blur-sm"
          >
            <Search size={18} />
          </button>
          <button
            aria-label="Open profile"
            onClick={() => setProfileOpen(true)}
            className="press w-10 h-10 rounded-pill bg-white grid place-items-center font-bold"
            style={{
              boxShadow: `0 0 0 2px ${nation.theme.primary}`,
              color: nation.theme.ink,
            }}
          >
            {initial}
          </button>
        </div>
      </div>

      {/* Nation name */}
      <div className="absolute left-0 right-0 bottom-6 px-5">
        <h1
          className="font-display text-[72px] leading-none tracking-tighter"
          style={{ color: nation.theme.onPrimary }}
        >
          {nation.name}
        </h1>
        <p
          className="text-caption mt-2 uppercase font-bold tracking-widest"
          style={{ color: nation.theme.onPrimary, opacity: 0.8 }}
        >
          {nation.heroPlayer} · Captain
        </p>
      </div>

      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />

      <style>{`
        @keyframes hero-zoom {
          from { transform: scale(1) translateY(0) }
          to { transform: scale(1.04) translateY(-6px) }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-label="${nation.name} home hero"] svg[style*="hero-zoom"] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
