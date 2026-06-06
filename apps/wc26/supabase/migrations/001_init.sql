-- WC26 — initial schema. Apply via `supabase db push` or paste into the
-- SQL editor in your project. Designed to satisfy the IBackend interface
-- in src/lib/backend.ts.
--
-- RLS is enabled on every table. Anonymous users (Supabase anon sign-in)
-- only ever see / mutate their own rows; the leaderboard view is the
-- only public read.

set search_path = public;

-- ---------- profiles ----------
create table if not exists profiles (
  id uuid primary key,
  username text not null check (char_length(username) between 1 and 16),
  supported_team text not null default 'POR',
  timezone text not null default 'Europe/London',
  elo_rating int not null default 1000,
  region text,
  supporter_pass boolean not null default false,
  streak int not null default 0,
  last_daily_xp_at date,
  leaderboard_entered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (username)
);
alter table profiles enable row level security;
drop policy if exists "profiles_self_read" on profiles;
drop policy if exists "profiles_self_write" on profiles;
drop policy if exists "profiles_self_insert" on profiles;
create policy "profiles_self_read" on profiles for select using (auth.uid() = id);
create policy "profiles_self_write" on profiles for update using (auth.uid() = id);
create policy "profiles_self_insert" on profiles for insert with check (auth.uid() = id);
-- Leaderboard read of usernames + nation needs cross-user select. We
-- expose it via a SECURITY DEFINER function (see `get_leaderboard`).

-- ---------- xp / coin ledgers ----------
create table if not exists xp_ledger (
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  delta int not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index if not exists xp_ledger_user_idx on xp_ledger (user_id, created_at desc);
alter table xp_ledger enable row level security;
drop policy if exists "xp_ledger_self_read" on xp_ledger;
create policy "xp_ledger_self_read" on xp_ledger for select using (auth.uid() = user_id);

create table if not exists coin_ledger (
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  delta int not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index if not exists coin_ledger_user_idx on coin_ledger (user_id, created_at desc);
alter table coin_ledger enable row level security;
drop policy if exists "coin_ledger_self_read" on coin_ledger;
create policy "coin_ledger_self_read" on coin_ledger for select using (auth.uid() = user_id);

-- ---------- bets / accumulators ----------
create table if not exists accumulators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  total_odds numeric not null,
  status text not null default 'pending',
  coins_awarded int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists accumulators_user_idx on accumulators (user_id, created_at desc);
alter table accumulators enable row level security;
drop policy if exists "accumulators_self" on accumulators;
create policy "accumulators_self" on accumulators
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  match_id text not null,
  market_type text not null,
  selection text not null,
  selection_label text not null,
  xp_staked int not null check (xp_staked > 0),
  odds_at_time_of_bet numeric not null check (odds_at_time_of_bet > 1),
  status text not null default 'pending',
  coins_awarded int,
  accumulator_id uuid references accumulators(id) on delete set null,
  placed_at timestamptz not null default now()
);
create index if not exists bets_user_idx on bets (user_id, placed_at desc);
create index if not exists bets_match_idx on bets (match_id);
create index if not exists bets_status_idx on bets (status);
alter table bets enable row level security;
drop policy if exists "bets_self_read" on bets;
drop policy if exists "bets_self_insert" on bets;
create policy "bets_self_read" on bets for select using (auth.uid() = user_id);
create policy "bets_self_insert" on bets for insert with check (auth.uid() = user_id);

-- ---------- match results (post-resolution truths from webhook) ----------
create table if not exists match_results (
  match_id text primary key,
  resolved_at timestamptz not null default now(),
  home_score int not null,
  away_score int not null,
  top_scorer_player_id text,
  motm_player_id text,
  first_scorer_player_id text,
  red_card boolean not null default false,
  squad1_formation jsonb,
  squad2_formation jsonb,
  squad1_chemistry_score int,
  squad2_chemistry_score int,
  squad1_overall_rating int,
  squad2_overall_rating int,
  winner_player_id uuid
);
alter table match_results enable row level security;
drop policy if exists "match_results_read" on match_results;
create policy "match_results_read" on match_results for select using (true);

-- ---------- auction ----------
create table if not exists matchmaking_queue (
  id bigserial primary key,
  player_id uuid not null references profiles(id) on delete cascade,
  desired_count int not null,
  region text,
  elo_rating int not null default 1000,
  status text not null default 'waiting',
  room_id uuid,
  joined_at timestamptz not null default now()
);
create index if not exists matchmaking_status_idx on matchmaking_queue (status, joined_at);
alter table matchmaking_queue enable row level security;
drop policy if exists "matchmaking_self" on matchmaking_queue;
create policy "matchmaking_self" on matchmaking_queue
  for all using (auth.uid() = player_id) with check (auth.uid() = player_id);

create table if not exists auction_state (
  room_id uuid primary key,
  status text not null default 'bidding',
  current_player_index int not null default 0,
  current_bid_amount int not null default 0,
  current_bidder_id uuid,
  timer_end timestamptz not null,
  pool_seed text not null,
  updated_at timestamptz not null default now()
);
alter table auction_state enable row level security;
drop policy if exists "auction_state_read" on auction_state;
create policy "auction_state_read" on auction_state for select using (true);

create table if not exists squads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  room_id uuid not null references auction_state(room_id) on delete cascade,
  starter_ids text[] not null,
  bench_ids text[] not null,
  formation text not null,
  chemistry_score int,
  overall_rating int,
  created_at timestamptz not null default now(),
  unique (user_id, room_id)
);
alter table squads enable row level security;
drop policy if exists "squads_self" on squads;
create policy "squads_self" on squads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- RPCs ----------

-- Initialise a profile for the currently authed user. Idempotent.
create or replace function bootstrap_profile(
  p_username text,
  p_supported_team text default 'POR',
  p_timezone text default 'Europe/London'
) returns profiles language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  p profiles;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  insert into profiles (id, username, supported_team, timezone)
  values (
    uid,
    coalesce(p_username, 'anon_' || substring(uid::text, 1, 6)),
    coalesce(p_supported_team, 'POR'),
    coalesce(p_timezone, 'Europe/London')
  )
  on conflict (id) do update
     set username = excluded.username,
         supported_team = excluded.supported_team,
         timezone = excluded.timezone
  returning * into p;
  return p;
end;
$$;

-- Award 500 daily XP, once per UTC day, server-authoritative.
create or replace function award_daily_xp() returns int
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  today date := (now() at time zone 'utc')::date;
  last_at date;
  added int := 0;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select last_daily_xp_at into last_at from profiles where id = uid for update;
  if last_at is null or last_at < today then
    update profiles set last_daily_xp_at = today where id = uid;
    insert into xp_ledger (user_id, delta, reason) values (uid, 500, 'daily_login');
    added := 500;
  end if;
  return added;
end;
$$;

-- Credit XP from an IAP purchase. Real impl validates the receipt
-- before invoking this; v1 leaves that to a future Edge Function.
create or replace function credit_xp(p_amount int, p_reason text) returns int
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_amount <= 0 then raise exception 'bad_amount'; end if;
  insert into xp_ledger (user_id, delta, reason) values (uid, p_amount, p_reason);
  return p_amount;
end;
$$;

-- Spend XP atomically. Returns the new balance, or raises insufficient_xp.
create or replace function spend_xp(p_amount int, p_reason text) returns int
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  current_xp int;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_amount <= 0 then raise exception 'bad_amount'; end if;
  select coalesce(sum(delta), 0) into current_xp from xp_ledger where user_id = uid;
  if current_xp < p_amount then raise exception 'insufficient_xp'; end if;
  insert into xp_ledger (user_id, delta, reason) values (uid, -p_amount, p_reason);
  return current_xp - p_amount;
end;
$$;

create or replace function credit_coins(p_amount int, p_reason text) returns int
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_amount <= 0 then raise exception 'bad_amount'; end if;
  insert into coin_ledger (user_id, delta, reason) values (uid, p_amount, p_reason);
  return p_amount;
end;
$$;

create or replace function spend_coins(p_amount int, p_reason text) returns int
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  current_coins int;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_amount <= 0 then raise exception 'bad_amount'; end if;
  select coalesce(sum(delta), 0) into current_coins from coin_ledger where user_id = uid;
  if current_coins < p_amount then raise exception 'insufficient_coins'; end if;
  insert into coin_ledger (user_id, delta, reason) values (uid, -p_amount, p_reason);
  return current_coins - p_amount;
end;
$$;

-- Atomic bet placement. Locks the odds at insert time (FR-BET-10), debits
-- XP in the same transaction as the bet write so the ledger never drifts.
create or replace function place_bet_atomic(
  p_match_id text,
  p_market text,
  p_selection text,
  p_selection_label text,
  p_xp int,
  p_odds numeric
) returns bets language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  current_xp int;
  inserted bets;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  if p_xp <= 0 then raise exception 'bad_stake'; end if;
  select coalesce(sum(delta), 0) into current_xp from xp_ledger where user_id = uid;
  if current_xp < p_xp then raise exception 'insufficient_xp'; end if;
  insert into xp_ledger (user_id, delta, reason) values (uid, -p_xp, 'bet_placed');
  insert into bets (user_id, match_id, market_type, selection, selection_label, xp_staked, odds_at_time_of_bet)
  values (uid, p_match_id, p_market, p_selection, p_selection_label, p_xp, p_odds)
  returning * into inserted;
  return inserted;
end;
$$;

-- Atomic bid (FR-AUC-7). Only commits if currentBidAmount is still lower.
-- Returns the post-update state regardless so the client can re-sync.
create or replace function place_bid_atomic(
  p_room_id uuid,
  p_bidder_id uuid,
  p_amount int
) returns auction_state language plpgsql security definer set search_path = public as $$
declare updated auction_state;
begin
  update auction_state
     set current_bid_amount = p_amount,
         current_bidder_id = p_bidder_id,
         timer_end = now() + interval '15 seconds',
         updated_at = now()
   where room_id = p_room_id
     and status = 'bidding'
     and current_bid_amount < p_amount
  returning * into updated;
  if updated is null then
    select * into updated from auction_state where room_id = p_room_id;
  end if;
  return updated;
end;
$$;

-- Server-authoritative team score for the Draft Battle.
create or replace function calculate_team_score(p_room_id uuid) returns int
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  s int;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select coalesce(overall_rating, 80) into s
    from squads where user_id = uid and room_id = p_room_id;
  return s;
end;
$$;

-- Deterministic simulation. Same a/b/seed always returns the same result.
create or replace function simulate_match(p_a int, p_b int, p_seed text)
returns jsonb language plpgsql immutable as $$
declare
  swing int;
  result text;
begin
  swing := ((hashtext(p_seed) % 200) - 100) / 10;
  if (p_a + swing) > (p_b - swing) + 1 then result := 'win';
  elsif (p_b - swing) > (p_a + swing) + 1 then result := 'loss';
  else result := 'draw'; end if;
  return jsonb_build_object(
    'result', result,
    'a_score', p_a + swing,
    'b_score', p_b - swing
  );
end;
$$;

-- Read the global leaderboard. SECURITY DEFINER so usernames + nations
-- are visible across users (the table's RLS only allows self-read).
create or replace function get_leaderboard(p_scope text default 'weekly')
returns table (
  rank bigint,
  user_id uuid,
  username text,
  nation text,
  coins bigint,
  supporter boolean
) language plpgsql security definer set search_path = public as $$
declare
  cutoff timestamptz;
begin
  if p_scope = 'weekly' then cutoff := now() - interval '7 days';
  else cutoff := timestamptz '1970-01-01'; end if;
  return query
    select
      row_number() over (order by coalesce(sum(l.delta), 0) desc) as rank,
      p.id,
      p.username,
      p.supported_team,
      coalesce(sum(l.delta), 0)::bigint,
      p.supporter_pass
    from profiles p
    left join coin_ledger l
           on l.user_id = p.id and l.created_at > cutoff
    group by p.id
    order by coalesce(sum(l.delta), 0) desc
    limit 100;
end;
$$;

-- Enter the ranked weekly board — costs 100 coins.
create or replace function enter_ranked_weekly() returns void
language plpgsql security definer set search_path = public as $$
begin
  perform spend_coins(100, 'leaderboard_entry');
  update profiles set leaderboard_entered_at = now() where id = auth.uid();
end;
$$;

grant execute on function bootstrap_profile, award_daily_xp, credit_xp,
                         spend_xp, credit_coins, spend_coins,
                         place_bet_atomic, place_bid_atomic,
                         calculate_team_score, simulate_match,
                         get_leaderboard, enter_ranked_weekly to authenticated, anon;
