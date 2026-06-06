/*
 * In-memory mock backend with localStorage persistence. This is the
 * dev/default implementation of the Backend interface — every method
 * mirrors what the real Supabase impl will do, but runs entirely in
 * the browser so the app boots without any credentials.
 *
 * Persistence: a single keyed slice per user so reloads survive. We
 * never persist auction rooms because they're ephemeral by nature.
 */

import {
  type Backend,
  type Bet,
  type Accumulator,
  type LedgerEntry,
  type Wallet,
  type LeaderboardRow,
  type AuctionState,
  type AuctionParticipant,
} from "./backend";
import {
  findMatch,
  liveMatches,
  MATCHES,
  type Match,
  type MatchStatus,
} from "@/data/matches";
import {
  findPlayer,
  generateAuctionPool,
  type Player,
} from "@/data/players";
import { type MarketKind } from "@/data/markets";
import { calculateCoinPayout } from "./currency";
import { settingFor, decideBid } from "./ai";

const LS_KEY = "wc26:mock-state:v1";

type State = {
  wallet: Wallet;
  bets: Bet[];
  accumulators: Accumulator[];
  lastDailyAward: string | null;
  leaderboardEntered: boolean;
  rooms: Record<string, AuctionState>;
};

const initial: State = {
  wallet: {
    xp: 1250,
    coins: 450,
    streak: 0,
    xpLedger: [],
    coinLedger: [],
  },
  bets: [],
  accumulators: [],
  lastDailyAward: null,
  leaderboardEntered: false,
  rooms: {},
};

function load(): State {
  if (typeof localStorage === "undefined") return clone(initial);
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return clone(initial);
    const parsed = JSON.parse(raw) as State;
    // Always strip rooms — they're ephemeral.
    return { ...parsed, rooms: {} };
  } catch {
    return clone(initial);
  }
}

function persist(state: State) {
  if (typeof localStorage === "undefined") return;
  try {
    const { rooms: _rooms, ...persistable } = state;
    void _rooms;
    localStorage.setItem(LS_KEY, JSON.stringify(persistable));
  } catch {
    /* quota / private mode */
  }
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

const state: State = load();

function ledger(reason: string, delta: number): LedgerEntry {
  return {
    id: `l_${Math.random().toString(36).slice(2, 9)}`,
    delta,
    reason,
    at: new Date().toISOString(),
  };
}

async function commit(): Promise<void> {
  persist(state);
}

// --- Bet maths ---
function evaluateBet(bet: Bet, match: Match): BetStatusResolved {
  if (match.status !== "finished" && match.status !== "live") {
    return { status: "pending", coinsAwarded: undefined };
  }
  // Coin-flip-ish deterministic resolution from bet id + match id so
  // results don't flicker on re-render but still spread the outcomes.
  let hash = 5381;
  const seed = `${match.id}:${bet.id}:${bet.market}:${bet.selection}`;
  for (let i = 0; i < seed.length; i++)
    hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
  const winRoll = ((hash >>> 0) % 1000) / 1000;
  // Probabilities calibrated so headline payouts feel real.
  const winThreshold: Record<MarketKind, number> = {
    match_winner: 0.5,
    top_scorer: 0.32,
    mvp: 0.25,
    total_goals: 0.5,
    first_scorer: 0.15,
    clean_sheet: 0.4,
    red_card: 0.4,
    shots_on_target: 0.5,
    worldie_call: 0.35,
  };
  const won = winRoll < winThreshold[bet.market];
  if (!won) return { status: "lost", coinsAwarded: 0 };
  const coins = calculateCoinPayout(
    bet.xpStaked,
    bet.odds,
    state.wallet.streak,
    bet.accumulatorId ? 3 : 1
  );
  return { status: "won", coinsAwarded: coins };
}

type BetStatusResolved = {
  status: Bet["status"];
  coinsAwarded: number | undefined;
};

// =====================================================================
// Backend implementation
// =====================================================================

export const mockBackend: Backend = {
  // ---------- Wallet ----------
  async getWallet() {
    return clone(state.wallet);
  },

  async awardDailyXP() {
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastDailyAward === today) {
      return { added: 0, newBalance: state.wallet.xp };
    }
    const added = 500;
    state.wallet.xp += added;
    state.wallet.xpLedger.unshift(ledger("daily_login", added));
    state.lastDailyAward = today;
    await commit();
    return { added, newBalance: state.wallet.xp };
  },

  async spendXP(amount, reason) {
    if (state.wallet.xp < amount) throw new Error("insufficient_xp");
    state.wallet.xp -= amount;
    state.wallet.xpLedger.unshift(ledger(reason, -amount));
    await commit();
    return clone(state.wallet);
  },

  async spendCoins(amount, reason) {
    if (state.wallet.coins < amount) throw new Error("insufficient_coins");
    state.wallet.coins -= amount;
    state.wallet.coinLedger.unshift(ledger(reason, -amount));
    await commit();
    return clone(state.wallet);
  },

  async creditCoins(amount, reason) {
    state.wallet.coins += amount;
    state.wallet.coinLedger.unshift(ledger(reason, amount));
    await commit();
    return clone(state.wallet);
  },

  async creditXP(amount, reason) {
    state.wallet.xp += amount;
    state.wallet.xpLedger.unshift(ledger(reason, amount));
    await commit();
    return clone(state.wallet);
  },

  // ---------- Bets ----------
  async placeBet(input) {
    if (state.wallet.xp < input.xpStaked) throw new Error("insufficient_xp");
    state.wallet.xp -= input.xpStaked;
    state.wallet.xpLedger.unshift(ledger("bet_placed", -input.xpStaked));
    const bet: Bet = {
      id: `b_${Math.random().toString(36).slice(2, 9)}`,
      matchId: input.matchId,
      market: input.market,
      selection: input.selection,
      selectionLabel: input.selectionLabel,
      xpStaked: input.xpStaked,
      odds: input.odds,
      status: "pending",
      placedAt: new Date().toISOString(),
    };
    state.bets.unshift(bet);
    await commit();
    return clone(bet);
  },

  async placeAccumulator(input) {
    if (state.wallet.xp < input.xpStaked) throw new Error("insufficient_xp");
    state.wallet.xp -= input.xpStaked;
    state.wallet.xpLedger.unshift(ledger("accumulator_placed", -input.xpStaked));
    const accId = `a_${Math.random().toString(36).slice(2, 9)}`;
    const totalOdds = input.legs.reduce((acc, l) => acc * l.odds, 1);
    const stakePerLeg = input.xpStaked / input.legs.length;
    const betIds = input.legs.map((l) => {
      const bet: Bet = {
        id: `b_${Math.random().toString(36).slice(2, 9)}`,
        matchId: l.matchId,
        market: l.market,
        selection: l.selection,
        selectionLabel: l.selectionLabel,
        xpStaked: stakePerLeg,
        odds: l.odds,
        status: "pending",
        placedAt: new Date().toISOString(),
        accumulatorId: accId,
      };
      state.bets.unshift(bet);
      return bet.id;
    });
    const acc: Accumulator = {
      id: accId,
      betIds,
      totalOdds,
      status: "pending",
      payoutCoins: 0,
    };
    state.accumulators.unshift(acc);
    await commit();
    return clone(acc);
  },

  async getBets() {
    return clone(state.bets);
  },

  async resolveMatch(matchId) {
    const match = findMatch(matchId);
    if (!match) return [];
    const changed: Bet[] = [];
    for (const bet of state.bets) {
      if (bet.matchId !== matchId || bet.status !== "pending") continue;
      const { status, coinsAwarded } = evaluateBet(bet, match);
      if (status === "pending") continue;
      bet.status = status;
      if (status === "won") {
        bet.coinsAwarded = coinsAwarded ?? 0;
        state.wallet.coins += coinsAwarded ?? 0;
        state.wallet.streak += 1;
        state.wallet.coinLedger.unshift(
          ledger("prediction_won", coinsAwarded ?? 0)
        );
      } else if (status === "lost") {
        state.wallet.streak = 0;
      }
      changed.push(bet);
    }
    await commit();
    return clone(changed);
  },

  // ---------- Matches ----------
  async getMatch(id) {
    return findMatch(id);
  },
  async getMatches() {
    return MATCHES;
  },

  // ---------- Leaderboard ----------
  async getLeaderboard(scope) {
    // Generate a stable mock leaderboard so re-renders don't shuffle ranks.
    const base: Omit<LeaderboardRow, "rank">[] = [
      { userId: "u_bet99", username: "BetMaster_99", nation: "BRA", coins: 850_000 },
      { userId: "u_lis", username: "LisbonLion", nation: "POR", coins: 720_000 },
      { userId: "u_sambo", username: "SambaStriker", nation: "BRA", coins: 690_000 },
      { userId: "u_threelions", username: "ThreeLions_88", nation: "ENG", coins: 612_000, supporter: true },
      { userId: "u_blues", username: "LesBleus_07", nation: "FRA", coins: 540_000 },
      { userId: "u_samurai", username: "SamuraiBlue_X", nation: "JPN", coins: 482_000 },
      { userId: "u_oranje", username: "OranjeKing", nation: "NED", coins: 451_000 },
      { userId: "u_albi", username: "AlbicelesteAce", nation: "ARG", coins: 422_000, supporter: true },
      { userId: "u_eagles", username: "TerangaEagle", nation: "SEN", coins: 388_000 },
      { userId: "u_ftbol", username: "RojaForever", nation: "ESP", coins: 366_000 },
    ];
    const rows = base.map((r, i) => ({ ...r, rank: i + 1 }));
    // Inject "YOU" near the bottom.
    rows.push({
      rank: 124,
      userId: "u_you",
      username: "@fan_one",
      nation: "POR",
      coins: state.wallet.coins,
      isYou: true,
    });
    if (scope === "friends") return rows.slice(0, 5).map((r, i) => ({ ...r, rank: i + 1 }));
    return rows;
  },

  async enterRankedWeekly() {
    if (!state.leaderboardEntered) {
      await this.spendCoins(100, "leaderboard_entry");
      state.leaderboardEntered = true;
      await commit();
    }
  },

  // ---------- Auction ----------
  async startAuction({ matchId, mode, difficulty = "balanced", teamCount, nationFilter, userName, userNation }) {
    void matchId;
    const roomId = `r_${Math.random().toString(36).slice(2, 8)}`;
    const teamN = mode === "single" ? Math.max(2, teamCount) : teamCount;
    const pool = generateAuctionPool(roomId, teamN, nationFilter);
    const participants: AuctionParticipant[] = [
      {
        id: "you",
        name: userName,
        nation: userNation,
        budgetM: 1000,
        squad: [],
        isAI: false,
        isYou: true,
      },
    ];
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
    const room: AuctionState = {
      roomId,
      status: "bidding",
      currentPlayerIndex: 0,
      currentBidAmount: 0,
      currentBidderId: null,
      timerEnd: Date.now() + 15_000,
      pool,
      participants,
      log: [],
    };
    state.rooms[roomId] = room;
    // Store difficulty on a side-channel keyed by roomId via the log.
    room.log.push({ at: Date.now(), kind: "skip", playerId: "", text: `difficulty=${difficulty}` });
    return clone(room);
  },

  async getAuctionState(roomId) {
    return state.rooms[roomId] ? clone(state.rooms[roomId]) : undefined;
  },

  async placeBid(roomId, bidderId, amountM) {
    const room = state.rooms[roomId];
    if (!room) throw new Error("no_room");
    if (room.status !== "bidding") throw new Error("not_bidding");
    // Atomic .lt semantics — silently fail if a higher bid arrived.
    if (amountM <= room.currentBidAmount) {
      return clone(room);
    }
    const bidder = room.participants.find((p) => p.id === bidderId);
    if (!bidder) throw new Error("no_bidder");
    if (amountM > bidder.budgetM) throw new Error("over_budget");
    room.currentBidAmount = amountM;
    room.currentBidderId = bidderId;
    room.timerEnd = Date.now() + 15_000;
    room.log.unshift({
      at: Date.now(),
      kind: "bid",
      playerId: room.pool[room.currentPlayerIndex]?.id ?? "",
      text: `${bidder.name} bids €${amountM}M`,
    });
    return clone(room);
  },

  async voteSkip(roomId, _bidderId) {
    void _bidderId;
    const room = state.rooms[roomId];
    if (!room) throw new Error("no_room");
    if (room.status === "bidding") room.timerEnd = Date.now() + 1500;
    return clone(room);
  },

  async advanceAuction(roomId) {
    const room = state.rooms[roomId];
    if (!room) throw new Error("no_room");
    const current = room.pool[room.currentPlayerIndex];
    if (current) {
      if (room.currentBidderId && room.currentBidAmount > 0) {
        const buyer = room.participants.find((p) => p.id === room.currentBidderId);
        if (buyer) {
          buyer.squad.push(current.id);
          buyer.budgetM -= room.currentBidAmount;
        }
        room.status = "sold";
        room.log.unshift({
          at: Date.now(),
          kind: "sold",
          playerId: current.id,
          text: `SOLD ${current.name} to ${buyer?.name} for €${room.currentBidAmount}M`,
        });
      } else {
        room.status = "unsold";
        room.log.unshift({
          at: Date.now(),
          kind: "unsold",
          playerId: current.id,
          text: `UNSOLD ${current.name}`,
        });
      }
    }
    // Advance.
    room.currentPlayerIndex += 1;
    room.currentBidAmount = 0;
    room.currentBidderId = null;
    if (room.currentPlayerIndex >= room.pool.length) {
      room.status = "finished";
    } else {
      // After a brief moment, return to bidding. Callers manage the
      // animation hold themselves.
      room.status = "bidding";
      room.timerEnd = Date.now() + 15_000;
    }
    return clone(room);
  },

  async tickAI(roomId) {
    const room = state.rooms[roomId];
    if (!room || room.status !== "bidding") return clone(room ?? ({} as AuctionState));
    const ai = room.participants.find(
      (p) => p.isAI && p.id !== room.currentBidderId
    );
    if (!ai) return clone(room);
    // Extract difficulty stored in the first log entry.
    const diffEntry = room.log.find((l) => l.text.startsWith("difficulty="));
    const difficulty = (diffEntry?.text.split("=")[1] as
      | "easy"
      | "balanced"
      | "hard") ?? "balanced";
    const setting = settingFor(difficulty, "balanced");
    const decision = decideBid(room, ai, setting, (id) => findPlayer(id));
    if (!decision) return clone(room);
    return this.placeBid(roomId, ai.id, decision.amountM);
  },

  // ---------- Draft ----------
  async submitSquad({ roomId, starters, bench, formation }) {
    const room = state.rooms[roomId];
    if (!room) throw new Error("no_room");
    const me = room.participants.find((p) => p.isYou);
    if (!me) throw new Error("no_user");
    me.squad = [...starters, ...bench];
    // Squad rating = average top 11 ratings + chemistry bonus.
    const startPlayers = starters.map(findPlayer).filter((p): p is Player => !!p);
    const baseAvg =
      startPlayers.reduce((a, p) => a + p.rating, 0) /
      Math.max(1, startPlayers.length);
    const nations = new Set(startPlayers.map((p) => p.nation));
    const clubs = new Set(startPlayers.map((p) => p.club));
    const leagues = new Set(startPlayers.map((p) => p.league));
    const chemistry =
      (11 - nations.size) * 4 + (11 - clubs.size) * 3 + (11 - leagues.size) * 2;
    const squadRating = Math.round(baseAvg + chemistry * 0.1);
    // Stash on the log so simulateBattle can read it.
    room.log.unshift({
      at: Date.now(),
      kind: "skip",
      playerId: "",
      text: `formation=${formation};rating=${squadRating};chem=${Math.min(100, chemistry)}`,
    });
    return { squadRating, chemistry: Math.min(100, chemistry) };
  },

  async simulateBattle(roomId) {
    const room = state.rooms[roomId];
    if (!room) throw new Error("no_room");
    const meta = room.log.find((l) => l.text.startsWith("formation="));
    const rating = Number(meta?.text.match(/rating=(\d+)/)?.[1] ?? 80);
    // Opponent is the strongest AI by squad size × budget remaining.
    const opp = room.participants
      .filter((p) => !p.isYou)
      .sort((a, b) => b.squad.length * (1000 - b.budgetM) - a.squad.length * (1000 - a.budgetM))[0];
    const oppPlayers = opp ? opp.squad.map(findPlayer).filter((p): p is Player => !!p) : [];
    const oppRating = oppPlayers.length
      ? Math.round(
          oppPlayers.reduce((a, p) => a + p.rating, 0) / oppPlayers.length
        )
      : 78;
    // Seeded RNG so the same room always settles identically.
    let h = 17;
    for (const c of roomId) h = (h * 33) ^ c.charCodeAt(0);
    const swing = (((h >>> 0) % 100) - 50) / 10;
    const yourScore = rating + swing;
    const opponentScore = oppRating - swing;
    let result: "win" | "loss" | "draw" = "draw";
    if (yourScore > opponentScore + 1) result = "win";
    else if (opponentScore > yourScore + 1) result = "loss";

    const xpAwarded = result === "win" ? 400 : result === "draw" ? 200 : 100;
    const coinsAwarded = result === "win" ? 300 : result === "draw" ? 100 : 25;
    state.wallet.xp += xpAwarded;
    state.wallet.coins += coinsAwarded;
    state.wallet.xpLedger.unshift(ledger("draft_battle_" + result, xpAwarded));
    state.wallet.coinLedger.unshift(ledger("draft_battle_" + result, coinsAwarded));
    await commit();
    return {
      yourScore: Math.round(yourScore),
      opponentScore: Math.round(opponentScore),
      result,
      xpAwarded,
      coinsAwarded,
    };
  },
};

// Surface live matches for the LiveScoreStrip without going through a
// network call — saves a Promise.all on first paint.
export function getLiveMatchesSync(): Match[] {
  return liveMatches();
}

// Helper for the home screen to display a status chip without parsing.
export function statusLabel(s: MatchStatus, minute?: number): string {
  if (s === "live") return `LIVE ${minute ?? ""}'`.trim();
  if (s === "finished") return "FT";
  return "UPCOMING";
}
