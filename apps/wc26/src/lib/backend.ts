/*
 * The backend interface. mockBackend.ts implements it in-memory for dev;
 * supabaseBackend.ts implements it against real tables / RPCs in Phase J.
 *
 * The selectBackend() helper picks at module load — if a Supabase URL is
 * present in the env, that wins; otherwise the mock is used. The rest of
 * the app only ever imports `backend` from this file.
 */

import type { Match } from "@/data/matches";
import type { Player } from "@/data/players";
import type { MarketKind } from "@/data/markets";

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
  /** ms timestamp (Date.now-based) when the timer ends. */
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
  squad: string[]; // player ids
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
  /**
   * Simulates resolution of a finished match — settles every bet for
   * that matchId. Returns the bets that just transitioned.
   */
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
  }): Promise<{
    squadRating: number;
    chemistry: number;
  }>;
  simulateBattle(roomId: string): Promise<{
    yourScore: number;
    opponentScore: number;
    result: "win" | "loss" | "draw";
    xpAwarded: number;
    coinsAwarded: number;
  }>;
};

// Lazy selector: actual impl is wired by mockBackend at module load and
// the real Supabase impl will swap this binding in Phase J.
import { mockBackend } from "./mockBackend";

const hasSupabase =
  typeof import.meta !== "undefined" &&
  !!(import.meta as ImportMeta & { env?: Record<string, string> }).env
    ?.VITE_SUPABASE_URL;

export const backend: Backend = hasSupabase
  ? // Lazy require so the bundle doesn't import supabaseBackend in dev.
    // Phase J fills this in. Until then, fall back to mock.
    mockBackend
  : mockBackend;

export const isUsingMock = !hasSupabase;
