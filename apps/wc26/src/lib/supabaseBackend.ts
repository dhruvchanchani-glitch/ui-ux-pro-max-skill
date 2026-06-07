/*
 * Real Supabase implementation of the Backend interface.
 *
 * Scope of this first pass:
 *   - Anonymous auth: a fresh device gets a uuid via signInAnonymously,
 *     then we upsert a profile row matching the local useUser store.
 *   - Wallet / bets / coin economy: server-authoritative via RPCs from
 *     migration 001 (place_bet_atomic, award_daily_xp, spend_xp, etc).
 *   - Leaderboard: read from the get_leaderboard RPC.
 *   - Matches: static (MATCHES from data/matches.ts) — fixtures don't
 *     need persistence in v1.
 *
 * Out of scope for this pass (delegated to mockBackend):
 *   - Auction & Draft Battle. Both need Realtime channels + Edge
 *     Functions to be genuinely multi-user; we keep them in-memory so
 *     single-player still works while that infra is built.
 *
 * Activation: when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set
 * in env, `lib/backend.ts` switches to this implementation.
 */

import { createClient, type Session } from "@supabase/supabase-js";
import {
  type Backend,
  type Wallet,
  type Bet,
  type LeaderboardRow,
  type AuctionState,
  type AuctionParticipant,
} from "./backend";
import { mockBackend } from "./mockBackend";
import { MATCHES, findMatch } from "@/data/matches";
import { generateAuctionPool } from "@/data/players";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/* ----- session bootstrap ----- */

let _sessionPromise: Promise<Session> | null = null;

async function getSession(): Promise<Session> {
  if (_sessionPromise) return _sessionPromise;
  _sessionPromise = (async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    const { data: created, error } = await supabase.auth.signInAnonymously();
    if (error || !created.session) {
      throw new Error(`Supabase anonymous sign-in failed: ${error?.message ?? "no session"}`);
    }
    return created.session;
  })();
  return _sessionPromise;
}

/** Read the locally stored Zustand snapshot so we can seed bootstrap_profile. */
function localUserSnapshot(): { username: string; supportedTeam: string; timezone: string } {
  try {
    const raw = localStorage.getItem("wc26:user:v1");
    if (!raw) return { username: "", supportedTeam: "POR", timezone: "Europe/London" };
    const parsed = JSON.parse(raw);
    const state = parsed.state ?? parsed;
    return {
      username: state.username ?? "",
      supportedTeam: state.supportedTeam ?? "POR",
      timezone: state.timezone ?? "Europe/London",
    };
  } catch {
    return { username: "", supportedTeam: "POR", timezone: "Europe/London" };
  }
}

let _profileEnsured = false;

/**
 * Make sure the current user has a profile row. The bootstrap_profile
 * RPC is idempotent so safe to call repeatedly, but we cache the
 * "succeeded once" flag so we don't hammer it.
 */
async function ensureProfile(): Promise<string> {
  const session = await getSession();
  if (_profileEnsured) return session.user.id;
  const snap = localUserSnapshot();
  const username = snap.username || `anon_${session.user.id.slice(0, 6)}`;
  const { error } = await supabase.rpc("bootstrap_profile", {
    p_username: username,
    p_supported_team: snap.supportedTeam,
    p_timezone: snap.timezone,
  });
  if (error) {
    // Username collisions return an error — fall back to a unique fallback.
    if (error.code === "23505" || /duplicate/i.test(error.message)) {
      await supabase.rpc("bootstrap_profile", {
        p_username: `${username}_${session.user.id.slice(0, 4)}`,
        p_supported_team: snap.supportedTeam,
        p_timezone: snap.timezone,
      });
    } else {
      throw new Error(`bootstrap_profile failed: ${error.message}`);
    }
  }
  _profileEnsured = true;
  return session.user.id;
}

/**
 * Public init — call this once at app start (e.g. from main.tsx) to
 * trigger anon auth before the first feature render. Returns the uid.
 */
export async function initSupabase(): Promise<string> {
  return ensureProfile();
}

/** Manual profile sync (username / team change). */
export async function syncProfile(input: {
  username: string;
  supportedTeam: string;
  timezone: string;
}): Promise<void> {
  await getSession();
  const { error } = await supabase.rpc("bootstrap_profile", {
    p_username: input.username,
    p_supported_team: input.supportedTeam,
    p_timezone: input.timezone,
  });
  if (error) throw new Error(`syncProfile failed: ${error.message}`);
}

/* ----- helpers ----- */

async function fetchWallet(uid: string): Promise<Wallet> {
  const [xpRes, coinRes, profileRes] = await Promise.all([
    supabase
      .from("xp_ledger")
      .select("delta")
      .eq("user_id", uid),
    supabase
      .from("coin_ledger")
      .select("delta")
      .eq("user_id", uid),
    supabase.from("profiles").select("streak").eq("id", uid).single(),
  ]);
  const xp = (xpRes.data ?? []).reduce((a, r) => a + (r as { delta: number }).delta, 0);
  const coins = (coinRes.data ?? []).reduce((a, r) => a + (r as { delta: number }).delta, 0);
  const streak = profileRes.data?.streak ?? 0;
  return { xp, coins, streak, xpLedger: [], coinLedger: [] };
}

/* ----- backend impl ----- */

export const supabaseBackend: Backend = {
  // Spread first so we delegate every method to the mock by default,
  // then override the ones we've moved to Supabase. Auction + Draft
  // stay on the mock until Realtime + Edge Functions land.
  ...mockBackend,

  async getWallet() {
    const uid = await ensureProfile();
    return fetchWallet(uid);
  },

  async awardDailyXP() {
    const uid = await ensureProfile();
    const { data, error } = await supabase.rpc("award_daily_xp");
    if (error) throw new Error(`award_daily_xp failed: ${error.message}`);
    const w = await fetchWallet(uid);
    return { added: (data as number) ?? 0, newBalance: w.xp };
  },

  async spendXP(amount, reason) {
    const uid = await ensureProfile();
    const { error } = await supabase.rpc("spend_xp", { p_amount: amount, p_reason: reason });
    if (error) {
      if (/insufficient_xp/.test(error.message)) throw new Error("insufficient_xp");
      throw new Error(`spend_xp failed: ${error.message}`);
    }
    return fetchWallet(uid);
  },

  async spendCoins(amount, reason) {
    const uid = await ensureProfile();
    const { error } = await supabase.rpc("spend_coins", { p_amount: amount, p_reason: reason });
    if (error) {
      if (/insufficient_coins/.test(error.message)) throw new Error("insufficient_coins");
      throw new Error(`spend_coins failed: ${error.message}`);
    }
    return fetchWallet(uid);
  },

  async creditCoins(amount, reason) {
    const uid = await ensureProfile();
    const { error } = await supabase.rpc("credit_coins", { p_amount: amount, p_reason: reason });
    if (error) throw new Error(`credit_coins failed: ${error.message}`);
    return fetchWallet(uid);
  },

  async creditXP(amount, reason) {
    const uid = await ensureProfile();
    const { error } = await supabase.rpc("credit_xp", { p_amount: amount, p_reason: reason });
    if (error) throw new Error(`credit_xp failed: ${error.message}`);
    return fetchWallet(uid);
  },

  async placeBet(input) {
    await ensureProfile();
    const { data, error } = await supabase
      .rpc("place_bet_atomic", {
        p_match_id: input.matchId,
        p_market: input.market,
        p_selection: input.selection,
        p_selection_label: input.selectionLabel,
        p_xp: input.xpStaked,
        p_odds: input.odds,
      })
      .single();
    if (error) {
      if (/insufficient_xp/.test(error.message)) throw new Error("insufficient_xp");
      throw new Error(`place_bet_atomic failed: ${error.message}`);
    }
    return mapBetRow(data as DbBet);
  },

  async placeAccumulator(input) {
    // For v1 we expand client-side: spend the stake then insert each
    // leg via place_bet_atomic (with shared accumulator_id). A future
    // RPC can do this in one transaction for true atomicity.
    await ensureProfile();
    const accId = crypto.randomUUID();
    const stakePerLeg = Math.max(1, Math.floor(input.xpStaked / input.legs.length));
    const inserted: Bet[] = [];
    for (const leg of input.legs) {
      const { data, error } = await supabase
        .rpc("place_bet_atomic", {
          p_match_id: leg.matchId,
          p_market: leg.market,
          p_selection: leg.selection,
          p_selection_label: leg.selectionLabel,
          p_xp: stakePerLeg,
          p_odds: leg.odds,
        })
        .single();
      if (error) throw new Error(`place_bet_atomic (acc leg) failed: ${error.message}`);
      inserted.push(mapBetRow(data as DbBet));
    }
    const totalOdds = input.legs.reduce((a, l) => a * l.odds, 1);
    return {
      id: accId,
      betIds: inserted.map((b) => b.id),
      totalOdds,
      status: "pending",
      payoutCoins: 0,
    };
  },

  async getBets() {
    const uid = await ensureProfile();
    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", uid)
      .order("placed_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(`getBets failed: ${error.message}`);
    return (data as DbBet[] | null)?.map(mapBetRow) ?? [];
  },

  async resolveMatch(matchId) {
    // Real resolution lives in an Edge Function triggered by a webhook
    // from the live data provider (FR-BET-12). For dev we delegate to
    // the mock so the user can still see resolution UX end-to-end.
    return mockBackend.resolveMatch(matchId);
  },

  async getMatch(id) {
    return findMatch(id);
  },
  async getMatches() {
    return MATCHES;
  },

  async getLeaderboard(scope) {
    await ensureProfile();
    const { data, error } = await supabase.rpc("get_leaderboard", {
      p_scope: scope === "weekly" ? "weekly" : "tournament",
    });
    if (error) throw new Error(`get_leaderboard failed: ${error.message}`);
    const rows = (data as DbLeaderboardRow[] | null) ?? [];
    const session = await getSession();
    return rows.map<LeaderboardRow>((r) => ({
      rank: Number(r.rank),
      userId: r.user_id,
      username: r.username,
      nation: r.nation,
      coins: Number(r.coins),
      supporter: r.supporter ?? false,
      isYou: r.user_id === session.user.id,
    }));
  },

  async enterRankedWeekly() {
    await ensureProfile();
    const { error } = await supabase.rpc("enter_ranked_weekly");
    if (error) {
      if (/insufficient_coins/.test(error.message)) throw new Error("insufficient_coins");
      throw new Error(`enter_ranked_weekly failed: ${error.message}`);
    }
  },

  // ===== Auction =====
  // Server-side state, realtime sync. The pool is regenerated client-side
  // from the room id seed so we don't pay the round-trip cost of shipping
  // ~24 player objects with every state read.
  async startAuction(input) {
    await ensureProfile();
    const session = await getSession();
    const participants: AuctionParticipant[] = [
      {
        id: session.user.id,
        name: input.userName,
        nation: input.userNation,
        budgetM: 1000,
        squad: [],
        isAI: false,
        isYou: true,
      },
    ];
    const teamN = input.mode === "single" ? Math.max(2, input.teamCount) : input.teamCount;
    for (let i = 1; i < teamN; i++) {
      participants.push({
        id: `ai_${i}`,
        name: ["NeoStriker", "GoldenBoot", "MidfieldMaestro", "TacticianX"][i - 1] ?? `AI_${i}`,
        nation: ["ARG", "ENG", "FRA", "GER"][i - 1] ?? "BRA",
        budgetM: 1000,
        squad: [],
        isAI: true,
        isYou: false,
      });
    }
    const { data, error } = await supabase
      .rpc("start_auction_room", {
        p_match_id: input.matchId,
        p_mode: input.mode,
        p_participants: participants,
      })
      .single();
    if (error || !data) throw new Error(`start_auction_room failed: ${error?.message}`);
    return dbAuctionRowToState(data as DbAuctionRow);
  },

  async getAuctionState(roomId) {
    await ensureProfile();
    const { data, error } = await supabase
      .from("auction_state")
      .select("*")
      .eq("room_id", roomId)
      .maybeSingle();
    if (error) throw new Error(`getAuctionState failed: ${error.message}`);
    if (!data) return undefined;
    return dbAuctionRowToState(data as DbAuctionRow);
  },

  async placeBid(roomId, _bidderId, amountM) {
    await ensureProfile();
    const { data, error } = await supabase
      .rpc("place_bid_v2", { p_room_id: roomId, p_amount: amountM })
      .single();
    if (error || !data) throw new Error(`place_bid_v2 failed: ${error?.message}`);
    return dbAuctionRowToState(data as DbAuctionRow);
  },

  async voteSkip(roomId, bidderId) {
    // Skip votes are ephemeral broadcasts (FR-AUC-6), not persisted.
    const { broadcastSkipVote } = await import("./auctionRealtime");
    await broadcastSkipVote(roomId, bidderId);
    const state = await this.getAuctionState(roomId);
    if (!state) throw new Error("no_room");
    return state;
  },

  async advanceAuction(roomId) {
    const state = await this.getAuctionState(roomId);
    if (!state) throw new Error("no_room");
    const { data, error } = await supabase
      .rpc("advance_auction", {
        p_room_id: roomId,
        p_pool_size: state.pool.length || 24,
      })
      .single();
    if (error || !data) throw new Error(`advance_auction failed: ${error?.message}`);
    return dbAuctionRowToState(data as DbAuctionRow);
  },

  // AI bidding runs client-side regardless of backend — the AI tick
  // only happens in single-player mode.
  tickAI(roomId) {
    return mockBackend.tickAI(roomId);
  },
};

/* ----- row mappers ----- */

type DbBet = {
  id: string;
  match_id: string;
  market_type: string;
  selection: string;
  selection_label: string;
  xp_staked: number;
  odds_at_time_of_bet: number;
  status: string;
  coins_awarded: number | null;
  placed_at: string;
  accumulator_id: string | null;
};

type DbLeaderboardRow = {
  rank: number | string;
  user_id: string;
  username: string;
  nation: string;
  coins: number | string;
  supporter: boolean | null;
};

function mapBetRow(b: DbBet): Bet {
  return {
    id: b.id,
    matchId: b.match_id,
    market: b.market_type as Bet["market"],
    selection: b.selection,
    selectionLabel: b.selection_label,
    xpStaked: b.xp_staked,
    odds: Number(b.odds_at_time_of_bet),
    status: b.status as Bet["status"],
    coinsAwarded: b.coins_awarded ?? undefined,
    placedAt: b.placed_at,
    accumulatorId: b.accumulator_id ?? undefined,
  };
}

type DbAuctionRow = {
  room_id: string;
  status: string;
  current_player_index: number;
  current_bid_amount: number;
  current_bidder_id: string | null;
  timer_end: string;
  participants: AuctionParticipant[];
  log: AuctionState["log"];
};

function dbAuctionRowToState(row: DbAuctionRow): AuctionState {
  // Pool is regenerated from the room id seed — same hash → same pool
  // on every client without shipping ~24 player rows over the wire.
  const pool = generateAuctionPool(row.room_id, row.participants.length);
  return {
    roomId: row.room_id,
    status: row.status as AuctionState["status"],
    currentPlayerIndex: row.current_player_index,
    currentBidAmount: row.current_bid_amount,
    currentBidderId: row.current_bidder_id,
    timerEnd: new Date(row.timer_end).getTime(),
    pool,
    participants: row.participants ?? [],
    log: row.log ?? [],
  };
}
