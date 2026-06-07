/*
 * refresh-leaderboard — scheduled refresh of leaderboard caches.
 *
 * PRD §FR-LB-4: every hour during the tournament, every 10 minutes on
 * match days. Today `get_leaderboard` computes the rankings live in a
 * single SQL pass, which scales to ~10k users. Above that we materialise
 * into a table and let this function REFRESH it.
 *
 * This stub creates the materialised table on first run and refreshes
 * it on subsequent invocations. The migration's `get_leaderboard` RPC
 * can be swapped to read from this table at scale.
 */

import { handlePreflight, json, serverError } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  try {
    const db = serviceClient();

    // Create the cache table on first run. The PG `IF NOT EXISTS` makes
    // this idempotent.
    await db.rpc("exec_sql", {
      sql: `
        create table if not exists leaderboard_cache (
          scope text not null,
          rank int not null,
          user_id uuid not null,
          username text not null,
          nation text not null,
          coins bigint not null,
          supporter boolean not null,
          refreshed_at timestamptz not null default now(),
          primary key (scope, rank)
        );
      `,
    });

    // Refresh both scopes.
    for (const scope of ["weekly", "tournament"] as const) {
      const cutoff =
        scope === "weekly"
          ? new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
          : "1970-01-01T00:00:00Z";

      await db.rpc("exec_sql", {
        sql: `
          with totals as (
            select
              p.id as user_id,
              p.username,
              p.supported_team as nation,
              p.supporter_pass as supporter,
              coalesce(sum(l.delta), 0) as coins
            from profiles p
            left join coin_ledger l
              on l.user_id = p.id and l.created_at > '${cutoff}'
            group by p.id
          ),
          ranked as (
            select
              row_number() over (order by coins desc) as rank,
              user_id, username, nation, supporter, coins
            from totals
            limit 500
          )
          insert into leaderboard_cache (scope, rank, user_id, username, nation, coins, supporter, refreshed_at)
          select '${scope}', rank, user_id, username, nation, coins, supporter, now() from ranked
          on conflict (scope, rank) do update
             set user_id = excluded.user_id,
                 username = excluded.username,
                 nation = excluded.nation,
                 coins = excluded.coins,
                 supporter = excluded.supporter,
                 refreshed_at = now();
        `,
      });
    }
    return json({ ok: true, refreshed_at: new Date().toISOString() });
  } catch (err) {
    console.error("refresh-leaderboard failed:", err);
    return serverError((err as Error).message);
  }
});
