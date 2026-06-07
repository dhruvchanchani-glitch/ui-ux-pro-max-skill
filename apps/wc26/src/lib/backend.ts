/*
 * The backend interface + a lazy-loading dispatch proxy.
 *
 * Selection:
 *   - If VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are both set, the
 *     Supabase implementation is loaded on first method call.
 *   - Otherwise we use the in-memory mock (already loaded statically
 *     because it's tiny and used by both code paths).
 *
 * Code-splitting: supabaseBackend (~143 KB gzipped due to supabase-js)
 * is dynamically imported so mock-only builds don't pay for it.
 */

import type { Match } from "@/data/matches";
import type { Player } from "@/data/players";
import type { MarketKind } from "@/data/markets";
import { mockBackend } from "./mockBackend";

export type BetStatus = "pending" | "won" | "lost" | "void";

export type Bet = {
  id: string;
  matchId: string;
  market: MarketKind;
  /** Player id, team code, or "yes"/"no"/"over"/"under". */
  selection: string;
  /** Pretty label for the bet slip. */
  selectionLabel: string;
  xpStaked: number;
  odds: number;
  status: BetStatus;
  coinsAwarded?: number;
  placedAt: string;
  /** Accumulator id if part of one. */
  accumulatorId?: string;
};

export type Accumulator = {
  id: string;
  betIds: string[];
  totalOdds: number;
  status: BetStatus;
  payoutCoins: number;
};

export type LedgerEntry = {
  id: string;
  delta: number;
  /** snake_case reason codes per PRD §FR-BET / §FR-ECON. */
  reason: string;
  at: string;
};

export type Wallet = {
  xp: number;
  coins: number;
  streak: number;
  xpLedger: LedgerEntry[];
  coinLedger: LedgerEntry[];
};

export type LeaderboardRow = {
  rank: number;
  userId: string;
  username: string;
  nation: string;
  coins: number;
  supporter?: boolean;
  isYou?: boolean;
};

export type AuctionState = {
  roomId: string;
  status: "waiting" | "bidding" | "paused" | "sold" | "unsold" | "finished";
  currentPlayerIndex: number;
  currentBidAmount: number;
  currentBidderId: string | null;
  timerEnd: number;
  pool: Player[];
  participants: AuctionParticipant[];
  log: AuctionLog[];
};

export type AuctionParticipant = {
  id: string;
  name: string;
  nation: string;
  budgetM: number;
  squad: string[];
  isAI: boolean;
  isYou: boolean;
};

export type AuctionLog = {
  at: number;
  kind: "sold" | "unsold" | "skip" | "bid";
  playerId: string;
  text: string;
};

export type Backend = {
  // ===== Wallet =====
  getWallet(): Promise<Wallet>;
  awardDailyXP(): Promise<{ added: number; newBalance: number }>;
  spendXP(amount: number, reason: string): Promise<Wallet>;
  spendCoins(amount: number, reason: string): Promise<Wallet>;
  creditCoins(amount: number, reason: string): Promise<Wallet>;
  creditXP(amount: number, reason: string): Promise<Wallet>;

  // ===== Bets =====
  placeBet(input: {
    matchId: string;
    market: MarketKind;
    selection: string;
    selectionLabel: string;
    xpStaked: number;
    odds: number;
    accumulatorIds?: string[];
  }): Promise<Bet>;
  placeAccumulator(input: {
    legs: Array<{
      matchId: string;
      market: MarketKind;
      selection: string;
      selectionLabel: string;
      odds: number;
    }>;
    xpStaked: number;
  }): Promise<Accumulator>;
  getBets(): Promise<Bet[]>;
  resolveMatch(matchId: string): Promise<Bet[]>;

  // ===== Matches =====
  getMatch(id: string): Promise<Match | undefined>;
  getMatches(): Promise<Match[]>;

  // ===== Leaderboard =====
  getLeaderboard(scope: "weekly" | "tournament" | "friends"): Promise<LeaderboardRow[]>;
  enterRankedWeekly(): Promise<void>;

  // ===== Auction =====
  startAuction(input: {
    matchId: string;
    mode: "single" | "multi";
    difficulty?: "easy" | "balanced" | "hard";
    teamCount: number;
    nationFilter?: string;
    userName: string;
    userNation: string;
  }): Promise<AuctionState>;
  getAuctionState(roomId: string): Promise<AuctionState | undefined>;
  placeBid(roomId: string, bidderId: string, amountM: number): Promise<AuctionState>;
  voteSkip(roomId: string, bidderId: string): Promise<AuctionState>;
  advanceAuction(roomId: string): Promise<AuctionState>;
  tickAI(roomId: string): Promise<AuctionState>;

  // ===== Draft =====
  submitSquad(input: {
    roomId: string;
    starters: string[];
    bench: string[];
    formation: string;
  }): Promise<{ squadRating: number; chemistry: number }>;
  simulateBattle(roomId: string): Promise<{
    yourScore: number;
    opponentScore: number;
    result: "win" | "loss" | "draw";
    xpAwarded: number;
    coinsAwarded: number;
  }>;
};

const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
export const isUsingMock = !(env?.VITE_SUPABASE_URL && env?.VITE_SUPABASE_ANON_KEY);

let _impl: Backend | null = isUsingMock ? mockBackend : null;
let _implLoad: Promise<Backend> | null = null;

async function getImpl(): Promise<Backend> {
  if (_impl) return _impl;
  if (_implLoad) return _implLoad;
  _implLoad = (async () => {
    const m = await import("./supabaseBackend");
    _impl = m.supabaseBackend;
    return _impl;
  })();
  return _implLoad;
}

/**
 * Public proxy. Each property access returns an async function that
 * lazily resolves the backend impl on first call, then forwards. Because
 * every method on Backend is already async, this adds at most one tick
 * of latency before the first server-touching method.
 */
export const backend: Backend = new Proxy({} as Backend, {
  get(_target, prop) {
    return async (...args: unknown[]) => {
      const i = await getImpl();
      const key = prop as keyof Backend;
      const fn = i[key] as unknown as (...a: unknown[]) => Promise<unknown>;
      if (typeof fn !== "function") {
        throw new Error(`Backend.${String(prop)} is not implemented`);
      }
      return fn.apply(i, args);
    };
  },
});

/** Force the impl to load before the first method call. Useful from
 *  main.tsx so the auth round-trip starts during the splash screen. */
export async function preloadBackend(): Promise<void> {
  await getImpl();
}
