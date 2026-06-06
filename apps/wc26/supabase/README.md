# Supabase — WC26 backend

This directory holds the SQL migrations the app needs to run against
real Supabase instead of the in-memory mock.

## Activate the real backend (5 minutes)

### 1. Enable anonymous sign-in

In your Supabase dashboard:

- **Authentication → Providers → Anonymous** — toggle **enabled**.

The app signs every device in anonymously on first launch, then upserts
a profile keyed to that uid. No login UI required.

### 2. Apply the schema

Either the CLI:

```bash
supabase login
supabase link --project-ref qnnqlpeoeijrttuzwbst
supabase db push
```

…or just paste the contents of `migrations/001_init.sql` into
**SQL Editor → New query → Run** in the dashboard. It's idempotent
(every `create policy` is wrapped in `drop policy if exists`), so safe
to re-run.

### 3. Point the app at your project

`apps/wc26/.env.local` (gitignored) needs both:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

The app picks the real backend automatically when those are set; if
they're missing it falls back to the localStorage mock.

### 4. Test

```bash
cd apps/wc26
npm run dev
```

Open http://localhost:5173, complete onboarding, place a bet. You
should see rows appear in the `profiles`, `xp_ledger`, and `bets`
tables in the Supabase dashboard.

## What this first pass covers

| Feature | Supabase | Mock |
|---------|----------|------|
| Anonymous auth + profile sync | ✅ | – |
| Wallet (XP + Coins) | ✅ | – |
| Daily XP award | ✅ | – |
| Place / read bets | ✅ | – |
| Accumulators | ✅ (per-leg) | – |
| Leaderboard | ✅ | – |
| Coin Shop spends | ✅ | – |
| Single-player auction | – | ✅ |
| Squad Builder + Draft Battle | – | ✅ |
| Match fixture data | static `data/matches.ts` | static `data/matches.ts` |

## Edge functions still to add

| Name | Purpose |
|------|---------|
| `matchmake-players` | Atomic room creation from the matchmaking queue (FR-AUC-13). Lets real multiplayer auction lobbies form. |
| `resolve-match` | Webhook from the live data provider. Settles every pending bet for the match in one transaction (FR-BET-12). Currently the client triggers a mock resolution. |
| `iap-verify` | Server-side App Store / Play receipt validation before crediting XP (FR-MON-7). Today the UI calls `credit_xp` directly. |
| `refresh-leaderboard` | Scheduled refresh of a materialised view (FR-LB-4). Currently computed live in `get_leaderboard`. |

## Rate limiting

Apply a per-user rate limit to every public function (NFR-SEC-3). A
Cloudflare Worker in front of the function or the `pg_throttle`
extension both work. Without this, anyone can burn the project budget
overnight.

## Edge functions (to add)

| Name | Purpose |
|------|---------|
| `matchmake-players` | Atomic room creation from the matchmaking queue (FR-AUC-13). |
| `resolve-match` | Webhook from the live data provider. Settles every pending bet for the match in one transaction (FR-BET-12). |
| `iap-verify` | Server-side App Store / Play receipt validation before crediting XP (FR-MON-7). |
| `refresh-leaderboard` | Scheduled refresh of the `leaderboard_weekly` materialised view (FR-LB-4). |

## Rate limiting

Apply a per-user rate limit to every public function (NFR-SEC-3). A
Cloudflare Worker in front of the function or a `pg_throttle` extension
both work. Without this, anyone can mint requests that burn the project
budget overnight.
