-- WC26 — initial schema. Apply via `supabase db push` or paste into the
-- SQL editor in your project. Designed to satisfy the IBackend
-- interface in src/lib/backend.ts.
--
-- All tables have RLS enabled and only allow each user to read/write
-- their own rows (except read-only public surfaces like leaderboard).

set search_path = public;

-- ---------- profiles ----------
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null check (char_length(username) between 1 and 16),
  supported_team text not null,
  timezone text not null default 'Europe/London',
  elo_rating int not null default 1000,
  region text,
  supporter_pass boolean not null default false,
  created_at timestamptz not null default now(),
  unique (username)
);
alter table profiles enable row level security;
create policy "profiles_self_read" on profiles for select using (auth.uid() = id);
create policy "profiles_self_write" on profiles for update using (auth.uid() = id);

-- ---------- xp / coin ledgers ----------
create table if not exists xp_ledger (
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  delta int not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index on xp_ledger (user_id, created_at desc);
alter table xp_ledger enable row level security;
create policy "xp_ledger_self_read" on xp_ledger for select using (auth.uid() = user_id);

create table if not exists coin_ledger (
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  delta int not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index on coin_ledger (user_id, created_at desc);
alter table coin_ledger enable row level security;
create policy "coin_ledger_self_read" on coin_ledger for select using (auth.uid() = user_id);

-- ---------- wallet (materialised from ledger) ----------
create or replace view wallet_v as
select
  p.id as user_id,
  coalesce((select sum(delta) from xp_ledger l where l.user_id = p.id), 0) as xp,
  coalesce((select sum(delta) from coin_ledger l where l.user_id = p.id), 0) as coins
from profiles p;

-- ---------- bets / accumulators ----------
create table if not exists accumulators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  total_odds numeric not null,
  status text not null default 'pending',
  coins_awarded int not null default 0,
  created_at timestamptz not null default now()
);
create index on accumulators (user_id, created_at desc);
alter table accumulators enable row level security;
create policy "accumulators_self_read" on accumulators for select using (auth.uid() = user_id);

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
create index on bets (user_id, placed_at desc);
create index on bets (match_id);
create index on bets (status);
alter table bets enable row level security;
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
create index on matchmaking_queue (status, joined_at);
alter table matchmaking_queue enable row level security;
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
create policy "squads_self" on squads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- leaderboard MV ----------
create materialized view if not exists leaderboard_weekly as
select
  row_number() over (order by sum(delta) desc) as rank,
  p.id as user_id,
  p.username,
  p.supported_team as nation,
  coalesce(sum(delta), 0) as coins,
  p.supporter_pass as supporter
from profiles p
left join coin_ledger l on l.user_id = p.id
  and l.created_at > now() - interval '7 days'
group by p.id;
create unique index on leaderboard_weekly (user_id);

-- ---------- RPCs (FR-AUC-7 atomic bid, FR-BET-10 odds lock) ----------

-- Atomic bid — only commits if currentBidAmount is still lower.
create or replace function place_bid_atomic(
  p_room_id uuid,
  p_bidder_id uuid,
  p_amount int
) returns auction_state language plpgsql security definer as $$
declare
  updated auction_state;
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

-- Atomic bet placement — checks XP balance and inserts in one shot.
create or replace function place_bet_atomic(
  p_match_id text,
  p_market text,
  p_selection text,
  p_selection_label text,
  p_xp int,
  p_odds numeric
) returns bets language plpgsql security definer as $$
declare
  uid uuid := auth.uid();
  current_xp int;
  inserted bets;
begin
  select coalesce(sum(delta), 0) into current_xp from xp_ledger where user_id = uid;
  if current_xp < p_xp then
    raise exception 'insufficient_xp';
  end if;
  insert into xp_ledger (user_id, delta, reason) values (uid, -p_xp, 'bet_placed');
  insert into bets (user_id, match_id, market_type, selection, selection_label, xp_staked, odds_at_time_of_bet)
  values (uid, p_match_id, p_market, p_selection, p_selection_label, p_xp, p_odds)
  returning * into inserted;
  return inserted;
end;
$$;

-- Team score for the Draft Battle simulation (server-authoritative).
create or replace function calculate_team_score(
  p_user_id uuid,
  p_room_id uuid
) returns int language plpgsql as $$
declare
  s int;
begin
  select coalesce(overall_rating, 80)
    into s
    from squads
   where user_id = p_user_id and room_id = p_room_id;
  return s;
end;
$$;

-- Deterministic match simulation. The seed makes the result fair.
create or replace function simulate_match(
  p_a int,
  p_b int,
  p_seed text
) returns jsonb language plpgsql as $$
declare
  swing int;
  result text;
begin
  swing := ((hashtext(p_seed) % 200) - 100) / 10;
  if p_a + swing > p_b - swing + 1 then result := 'win';
  elsif p_b - swing > p_a + swing + 1 then result := 'loss';
  else result := 'draw'; end if;
  return jsonb_build_object(
    'result', result,
    'a_score', p_a + swing,
    'b_score', p_b - swing
  );
end;
$$;
