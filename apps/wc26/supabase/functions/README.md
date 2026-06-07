# Edge Functions — WC26

Server-side handlers the app needs once it leaves single-player mode.
All four are written as Deno + supabase-js stubs ready to deploy.

| Function | Trigger | Why it exists |
|---|---|---|
| [`matchmake-players`](./matchmake-players/) | cron / db webhook | Server-side multiplayer auction matchmaking (PRD FR-AUC-13). |
| [`resolve-match`](./resolve-match/) | external webhook | Settles every pending bet for a match in one transaction (FR-BET-12). |
| [`iap-verify`](./iap-verify/) | client | Validates App Store / Play receipts before crediting XP (FR-MON-7). |
| [`refresh-leaderboard`](./refresh-leaderboard/) | cron | Materialised-view refresh for the leaderboard (FR-LB-4). |

## Deploy them all

```bash
supabase functions deploy matchmake-players --no-verify-jwt
supabase functions deploy resolve-match --no-verify-jwt
supabase functions deploy iap-verify
supabase functions deploy refresh-leaderboard --no-verify-jwt
```

## Required secrets

| Secret | Used by | Get it from |
|---|---|---|
| `MATCH_WEBHOOK_SECRET` | resolve-match | The live data provider's webhook config. |
| `APPLE_SHARED_SECRET` | iap-verify | App Store Connect → App-specific shared secret. |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | iap-verify | A service account from Google Cloud with `androidpublisher` scope. |

Set them once with:

```bash
supabase secrets set MATCH_WEBHOOK_SECRET="..."
supabase secrets set APPLE_SHARED_SECRET="..."
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
provided automatically by the Supabase runtime — you don't set those.

## Shared helpers

The `_shared/` folder holds three tiny modules used across functions:

- `cors.ts` — CORS preflight + JSON helpers.
- `supabase.ts` — `userClient(req)` (RLS-respecting) and `serviceClient()`
  (admin) plus a `callerId(req)` helper that resolves `auth.uid()`.
- `rate-limit.ts` — in-memory rate limiter keyed by user id or IP.

## Hardening notes (read before launch)

1. **Tighten CORS.** `Access-Control-Allow-Origin: *` is fine for dev;
   prod should restrict to the App Store / Play domains.
2. **Persist rate-limit state in Redis or Upstash** — in-memory limits
   reset on every cold start.
3. **Add audit logging.** Every successful `credit_xp` from
   `iap-verify` should write to a separate `iap_receipts` table so
   replay attacks fail on the unique-receipt constraint.
4. **Sign every outbound webhook** if you ever post to third parties so
   they can verify it came from you.
