# WC26 — World Cup 2026 Companion App

A React mobile-first PWA companion app for the 2026 World Cup. Themed to
the team you support, with live scores, skill-based predictions, a
real-time multiplayer auction, and a Draft Battle squad simulation.

## What's here

This is the **frontend-complete** build. Every screen from the PRD §10
spec is implemented and runs end-to-end against an in-memory mock
backend persisted to `localStorage`. The data layer sits behind an
`IBackend` interface in `src/lib/backend.ts` so swapping in real
Supabase later (Phase J) doesn't touch any feature code.

| Phase | Status | Notes |
|-------|--------|-------|
| A. Foundation | ✅ | Tokens, fonts, motion, 47 nation themes, AA lint |
| B. Primitives & data | ✅ | UI kit, mock matches/players/markets, stores |
| C. Onboarding | ✅ | Splash → nation → location → username |
| D. Home + Match Detail | ✅ | Identity hero, live strip, match cards, 2×2 actions |
| E. Betting Hub + Bet Slip + Wallet | ✅ | 7 markets + 2 Pro, accumulator, IAP UI |
| F. Auction (single-player) | ✅ | Atomic bid, AI bidder, SOLD stamp |
| G. Draft Battle | ✅ | Squad Builder, chemistry, simulation |
| H. Leaderboard + Profile | ✅ | Tabs, podium, repaint warning |
| I. Polish | ✅ | Reduced motion, haptics, contrast lint |
| J. Real Supabase | 🟡 | Migration SQL drafted; activate by setting `VITE_SUPABASE_URL` |
| K. Launch readiness | 🟡 | Legal stubs + app-store template included |

## Getting started

Prerequisites: Node 20+, npm 10+.

```bash
npm install
npm run dev
```

Open http://localhost:5173 on a phone-sized window. The first time, you
run the 3-step onboarding (nation, location, username); thereafter the
home screen lands on the nation you support.

## Scripts

```bash
npm run dev            # vite dev server, host 0.0.0.0
npm run build          # tsc + vite production build
npm run typecheck      # tsc --noEmit
npm run contrast-lint  # AA 4.5:1 check on all 47 nation themes
```

## Architecture map

```
src/
├── styles/         design tokens (CSS vars) + globals + motion
├── data/           nations (47), matches, players, markets — pure data
├── lib/
│   ├── backend.ts      IBackend interface (the one place to swap)
│   ├── mockBackend.ts  in-memory + localStorage implementation
│   ├── theme.ts        applies nation tokens to :root
│   ├── currency.ts     XP / Coin maths + formatters
│   ├── time.ts         timezone helpers
│   ├── haptics.ts      Web Vibration API shim
│   └── ai.ts           auction AI bidder (difficulty + personality)
├── hooks/          (reserved for cross-feature hooks)
├── stores/         zustand (user, wallet, betSlip, auction)
├── components/     shared primitives + composites
└── features/       one folder per screen group
```

## Adding a Supabase backend (Phase J)

1. Create a Supabase project, copy the **URL** and **anon key**.
2. Copy `.env.example` → `.env.local` and fill in:
   ```bash
   VITE_SUPABASE_URL="https://xxxxx.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
   ```
3. Apply the migrations in `supabase/migrations/` via `supabase db push`
   or the SQL editor.
4. Implement `src/lib/supabaseBackend.ts` against the same `Backend`
   interface and update the selector in `src/lib/backend.ts`. The
   migration files in `supabase/migrations/` map 1:1 to the methods on
   the interface so the work is mostly mechanical.

## Design system

- **Layer rule** — identity (flat, 0 radius, big type, nation colour) vs.
  utility (16px radius, soft hairline border, bone canvas).
- **Functional colour** — XP is always violet `#7C3AED`, Coins are
  always gold `#F5B301`. Never themed.
- **Type** — Anton for display, Inter for body, JetBrains Mono for
  scores/timers/balances (`font-variant-numeric: tabular-nums`).
- **47 nation themes** — five tokens per nation, generated from
  flag/kit colours, all verified AA 4.5:1 by `npm run contrast-lint`.

## Accessibility

- `prefers-reduced-motion` is respected throughout (`globals.css`).
- All interactive elements ≥ 44×44pt.
- `aria-live="polite"` on the live score strip, `role="status"` on the
  bet-won toast.
- Haptics can be globally disabled in Profile → Haptics.
- High-contrast theme via `html.hc` (Profile → High contrast).

## Honest limitations

- **Multiplayer auction** is a simulated 1v3 lobby — true real-time
  multiplayer needs Supabase Realtime + Edge Functions (Phase J).
- **Live football data** is mocked. Production needs a feed (Sportradar,
  Stats Perform).
- **IAP** is UI-only; real receipts need App Store / Play accounts and
  server-side validation.
- **Identity verification** for coin redemption is out of scope here —
  KYC vendor integration is a separate workstream.
