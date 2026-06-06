# Supabase — WC26 backend

This directory holds the SQL migrations + Edge Function stubs that, once
deployed, let the app run against real Supabase instead of the in-memory
mock backend.

## Activate the real backend

1. Create a Supabase project at https://supabase.com.
2. Copy `.env.example` → `.env.local` in `apps/wc26/` and fill in your
   project's URL and anon key.
3. Run the migrations:
   ```bash
   supabase login
   supabase link --project-ref <ref>
   supabase db push
   ```
4. Implement `src/lib/supabaseBackend.ts` against the `Backend`
   interface. The RPCs and tables in `migrations/001_init.sql` map 1:1
   to the methods on the interface.
5. Update `src/lib/backend.ts` to pick the real impl when
   `import.meta.env.VITE_SUPABASE_URL` is set.

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
