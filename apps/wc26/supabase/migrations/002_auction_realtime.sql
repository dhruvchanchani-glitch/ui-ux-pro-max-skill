-- Adds the columns + RPCs needed for the realtime multiplayer auction
-- (PRD §3.3 + FR-AUC-3..11). Safe to apply on top of 001_init.sql.

set search_path = public;

-- ---------- auction_state additions ----------
-- Participants are stored as JSONB so a single update can replay both
-- "X bid €5M" and "X bought Y for €30M" without separate tables. The
-- mock backend already shapes participants this way, which keeps the
-- supabaseBackend impl free of cross-table joins on hot paths.
alter table auction_state
  add column if not exists participants jsonb not null default '[]'::jsonb,
  add column if not exists log jsonb not null default '[]'::jsonb,
  add column if not exists match_id text,
  add column if not exists mode text not null default 'single';

create index if not exists auction_state_match_idx on auction_state (match_id);

-- Allow each participant to read their own room. We treat a room as
-- "yours" if your auth.uid appears in participants[].id.
drop policy if exists "auction_state_read" on auction_state;
create policy "auction_state_read" on auction_state for select using (
  participants @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))
  or auth.uid() is null  -- service role
);

-- ---------- start_auction_room ----------
-- Creates a fresh room with the calling user as the first participant.
-- AI participants are seeded by the client and passed in; the server
-- doesn't need to know they're synthetic. The pool seed is the room id
-- so generateAuctionPool() reproduces the same pool on every client.
create or replace function start_auction_room(
  p_match_id text,
  p_mode text,
  p_participants jsonb
) returns auction_state language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  rid uuid := gen_random_uuid();
  inserted auction_state;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  insert into auction_state (
    room_id, match_id, mode, status,
    current_player_index, current_bid_amount, current_bidder_id,
    timer_end, pool_seed, participants, log
  ) values (
    rid, p_match_id, p_mode, 'bidding',
    0, 0, null,
    now() + interval '15 seconds', rid::text, p_participants, '[]'::jsonb
  )
  returning * into inserted;
  return inserted;
end;
$$;

-- ---------- place_bid_v2 ----------
-- Tightened version: checks budget from participants JSONB, only commits
-- if .lt(current_bid_amount, new_amount), same .lt invariant as the
-- mock and PRD §FR-AUC-7.
create or replace function place_bid_v2(
  p_room_id uuid,
  p_amount int
) returns auction_state language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  state auction_state;
  bidder jsonb;
  bidder_budget int;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select * into state from auction_state where room_id = p_room_id for update;
  if state is null then raise exception 'no_room'; end if;
  if state.status <> 'bidding' then return state; end if;
  if state.current_bid_amount >= p_amount then return state; end if;

  -- Find the bidder. They might be `you` (uid) or one of the AI ids.
  select e into bidder
    from jsonb_array_elements(state.participants) e
   where e->>'id' = uid::text
   limit 1;
  if bidder is null then
    -- Bidder is an AI — caller must pass `p_bidder_id` via the legacy
    -- RPC. v2 disallows that to keep the auth surface clean.
    raise exception 'caller_not_in_room';
  end if;
  bidder_budget := (bidder->>'budgetM')::int;
  if p_amount > bidder_budget then raise exception 'over_budget'; end if;

  update auction_state
     set current_bid_amount = p_amount,
         current_bidder_id = uid,
         timer_end = now() + interval '15 seconds',
         log = jsonb_build_array(
           jsonb_build_object(
             'at', extract(epoch from now()) * 1000,
             'kind', 'bid',
             'playerId', '',
             'text', format('%s bids €%sM', bidder->>'name', p_amount)
           )
         ) || coalesce(state.log, '[]'::jsonb),
         updated_at = now()
   where room_id = p_room_id
  returning * into state;
  return state;
end;
$$;

-- ---------- advance_auction ----------
-- Closes the current round: marks SOLD / UNSOLD, settles the buyer's
-- squad + budget, and bumps the player index. If the pool is exhausted
-- the room transitions to 'finished'.
create or replace function advance_auction(
  p_room_id uuid,
  p_pool_size int
) returns auction_state language plpgsql security definer set search_path = public as $$
declare
  state auction_state;
  participants jsonb;
  bidder_id text;
  amount int;
  log_entry jsonb;
  next_status text;
  next_index int;
begin
  select * into state from auction_state where room_id = p_room_id for update;
  if state is null then raise exception 'no_room'; end if;

  bidder_id := coalesce(state.current_bidder_id::text, '');
  amount := state.current_bid_amount;
  participants := state.participants;

  if bidder_id <> '' and amount > 0 then
    -- Mark this round SOLD; debit the buyer's budget and append the
    -- player id to their squad. Player id is unknown server-side
    -- (client passes index → name); we just track the index in the log.
    participants := (
      select jsonb_agg(
        case when (e->>'id') = bidder_id
          then jsonb_set(
                 jsonb_set(e, '{budgetM}', to_jsonb(((e->>'budgetM')::int) - amount)),
                 '{squad}', (e->'squad') || to_jsonb(state.current_player_index)
               )
          else e
        end
      )
      from jsonb_array_elements(participants) e
    );
    log_entry := jsonb_build_object(
      'at', extract(epoch from now()) * 1000,
      'kind', 'sold',
      'playerId', '',
      'text', format('SOLD index %s for €%sM', state.current_player_index, amount)
    );
  else
    log_entry := jsonb_build_object(
      'at', extract(epoch from now()) * 1000,
      'kind', 'unsold',
      'playerId', '',
      'text', format('UNSOLD index %s', state.current_player_index)
    );
  end if;

  next_index := state.current_player_index + 1;
  next_status := case when next_index >= p_pool_size then 'finished' else 'bidding' end;

  update auction_state
     set current_player_index = next_index,
         current_bid_amount = 0,
         current_bidder_id = null,
         timer_end = now() + interval '15 seconds',
         status = next_status,
         participants = participants,
         log = jsonb_build_array(log_entry) || coalesce(state.log, '[]'::jsonb),
         updated_at = now()
   where room_id = p_room_id
  returning * into state;
  return state;
end;
$$;

grant execute on function start_auction_room, place_bid_v2, advance_auction to authenticated, anon;
