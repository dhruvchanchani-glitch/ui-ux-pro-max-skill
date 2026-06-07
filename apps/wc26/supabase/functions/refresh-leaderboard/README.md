# refresh-leaderboard

Scheduled refresh of the leaderboard cache. PRD §FR-LB-4.

## Deploy

```bash
supabase functions deploy refresh-leaderboard --no-verify-jwt
```

## Schedule

In Supabase **Database → Webhooks → Scheduled functions**:

- During the tournament (non-match-day): every hour
- On match days: every 10 minutes

Or via the SQL editor:

```sql
select cron.schedule(
  'refresh-leaderboard-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url:='https://<project-ref>.functions.supabase.co/refresh-leaderboard',
    headers:='{"Content-Type":"application/json"}'::jsonb
  );
  $$
);
```

## Why a cache instead of live?

`get_leaderboard` currently computes live via `sum(delta) over coin_ledger`.
For a tournament-sized user base (low five figures) that's fast enough.
Above ~50k users, the live query starts approaching 200ms; refreshing
into `leaderboard_cache` brings reads back to ~5ms at the cost of being
up to 10 minutes stale on match days.

## Helper required

This stub uses `db.rpc("exec_sql", ...)` for brevity. Supabase doesn't
expose `exec_sql` by default — either add a tiny SECURITY DEFINER
function:

```sql
create or replace function exec_sql(sql text) returns void
language plpgsql security definer as $$
begin execute sql; end;
$$;
```

…or rewrite this function to use a proper SQL migration that creates
the cache table once, and then this function just runs an `INSERT … ON
CONFLICT … UPDATE` per scope via `supabase.from()`.
