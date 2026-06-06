import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        hairline: "var(--hairline)",
        scrim: "var(--scrim)",
        xp: "var(--xp)",
        "xp-soft": "var(--xp-soft)",
        coin: "var(--coin)",
        "coin-soft": "var(--coin-soft)",
        win: "var(--win)",
        loss: "var(--loss)",
        live: "var(--live)",
        paused: "var(--paused)",
        "nation-primary": "var(--nation-primary)",
        "nation-secondary": "var(--nation-secondary)",
        "nation-accent": "var(--nation-accent)",
        "nation-on-primary": "var(--nation-on-primary)",
        "nation-ink": "var(--nation-ink)",
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["96px", { lineHeight: "88px", fontWeight: "400" }],
        "display-lg": ["64px", { lineHeight: "60px", fontWeight: "400" }],
        "display-md": ["40px", { lineHeight: "40px", fontWeight: "400" }],
        headline: ["28px", { lineHeight: "32px", fontWeight: "700" }],
        title: ["20px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["17px", { lineHeight: "24px", fontWeight: "500" }],
        body: ["15px", { lineHeight: "22px", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "18px", fontWeight: "500" }],
        micro: [
          "11px",
          {
            lineHeight: "14px",
            fontWeight: "600",
            letterSpacing: "0.06em",
          },
        ],
        "mono-score": ["22px", { lineHeight: "22px", fontWeight: "700" }],
        "mono-timer": ["56px", { lineHeight: "56px", fontWeight: "700" }],
        "mono-balance": ["17px", { lineHeight: "22px", fontWeight: "600" }],
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },
      borderRadius: {
        none: "0px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        pill: "999px",
      },
      boxShadow: {
        "elev-1":
          "0 1px 2px rgba(10,10,11,0.04), 0 1px 1px rgba(10,10,11,0.06)",
        "elev-2":
          "0 4px 8px rgba(10,10,11,0.04), 0 2px 4px rgba(10,10,11,0.06)",
        "elev-3":
          "0 12px 24px rgba(10,10,11,0.08), 0 4px 8px rgba(10,10,11,0.04)",
        "elev-4":
          "0 24px 48px rgba(10,10,11,0.12), 0 8px 16px rgba(10,10,11,0.06)",
        "xp-glow": "0 0 0 1px var(--xp), 0 8px 24px rgba(124,58,237,0.30)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        "sold-stamp": {
          "0%": { transform: "scale(1.4) rotate(-7deg)", opacity: "0" },
          "20%": { transform: "scale(1.0) rotate(-7deg)", opacity: "1" },
          "100%": { transform: "scale(1.0) rotate(-7deg)", opacity: "1" },
        },
        "press-flash": {
          "0%": { opacity: "0" },
          "30%": { opacity: "0.30" },
          "100%": { opacity: "0" },
        },
        "tick-roll": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 1400ms linear infinite",
        "live-pulse": "live-pulse 1500ms ease-in-out infinite",
        "sold-stamp": "sold-stamp 600ms cubic-bezier(0.32,0.72,0,1)",
        "press-flash": "press-flash 400ms ease-out",
        "tick-roll": "tick-roll 220ms ease-out",
        "spin-slow": "spin-slow 1.6s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
