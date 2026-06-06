/*
 * The seven prediction markets per PRD §FR-BET-2 + the two Supporter Pro
 * markets per FR-BET-4. Each market carries the odds band the resolver
 * draws from; the actual odds for a specific match are sampled from
 * within the band when the market opens.
 */

export type MarketKind =
  | "match_winner"
  | "top_scorer"
  | "mvp"
  | "total_goals"
  | "first_scorer"
  | "clean_sheet"
  | "red_card"
  | "shots_on_target" // Supporter Pro
  | "worldie_call"; // Supporter Pro

export type MarketDef = {
  kind: MarketKind;
  title: string;
  shortLabel: string;
  description: string;
  oddsBand: [number, number];
  supporterOnly?: boolean;
  /** How to display selection labels in the bet slip. */
  binary?: boolean;
};

export const MARKETS: MarketDef[] = [
  {
    kind: "match_winner",
    title: "Match Winner",
    shortLabel: "Winner",
    description: "Pick the team that wins, or a draw, at full time.",
    oddsBand: [1.5, 3.5],
  },
  {
    kind: "top_scorer",
    title: "Top Goalscorer",
    shortLabel: "Top Scorer",
    description: "The player who scores the most goals in the match.",
    oddsBand: [2.0, 6.0],
  },
  {
    kind: "mvp",
    title: "Man of the Match",
    shortLabel: "MOTM",
    description: "Who lifts the official Man of the Match award.",
    oddsBand: [3.0, 8.0],
  },
  {
    kind: "total_goals",
    title: "Total Goals O/U 2.5",
    shortLabel: "O/U 2.5",
    description: "Predict total goals over or under 2.5.",
    oddsBand: [1.8, 2.2],
    binary: true,
  },
  {
    kind: "first_scorer",
    title: "First Goalscorer",
    shortLabel: "First Scorer",
    description: "Exact player to score first.",
    oddsBand: [4.0, 15.0],
  },
  {
    kind: "clean_sheet",
    title: "Clean Sheet",
    shortLabel: "Clean Sheet",
    description: "Does a specific team concede zero goals?",
    oddsBand: [1.6, 2.8],
    binary: true,
  },
  {
    kind: "red_card",
    title: "Red Card in Match",
    shortLabel: "Red Card",
    description: "Will any red card be shown?",
    oddsBand: [2.0, 4.0],
    binary: true,
  },
  {
    kind: "shots_on_target",
    title: "Shots on Target O/U 8.5",
    shortLabel: "Shots O/U",
    description: "Total shots on target across both sides.",
    oddsBand: [1.7, 2.4],
    binary: true,
    supporterOnly: true,
  },
  {
    kind: "worldie_call",
    title: "Will a commentator say 'worldie'?",
    shortLabel: "Worldie",
    description: "A social market — pure vibes.",
    oddsBand: [2.5, 4.5],
    binary: true,
    supporterOnly: true,
  },
];

export function marketByKind(kind: MarketKind): MarketDef | undefined {
  return MARKETS.find((m) => m.kind === kind);
}

/** Deterministic odds sampler — same matchId always yields same odds
 *  so reloading mid-session doesn't change the prices the user saw. */
export function sampleOdds(matchId: string, kind: MarketKind, optionIndex: number): number {
  const m = marketByKind(kind);
  if (!m) return 2.0;
  // Simple seeded sample within the band.
  let h = 5381;
  const seed = `${matchId}:${kind}:${optionIndex}`;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h) ^ seed.charCodeAt(i);
  const norm = ((h >>> 0) % 1000) / 1000;
  const [lo, hi] = m.oddsBand;
  return Math.round((lo + norm * (hi - lo)) * 100) / 100;
}
