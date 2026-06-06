/*
 * Currency formatting + reward maths per PRD §FR-BET-5..7.
 */

export function fmtXP(n: number): string {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(n);
}

export function fmtCoins(n: number): string {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(n);
}

/** PRD §FR-BET-6: +10% per streak step, capped at +50% (5 in a row). */
export function streakMultiplier(streak: number): number {
  return 1 + Math.min(5, streak) * 0.1;
}

/** PRD §FR-BET-7: accumulator multiplies all legs together. */
export function accumulatorMultiplier(legCount: number): number {
  if (legCount < 3) return 1;
  return 1 + (legCount - 2) * 0.25; // mild bonus on top of stacked odds
}

/**
 * Coins = (XP staked × odds) × streak × accumulator
 * Rounded to whole coins.
 */
export function calculateCoinPayout(
  xpStaked: number,
  odds: number,
  streak: number,
  legCount = 1
): number {
  const base = xpStaked * odds;
  const total = base * streakMultiplier(streak) * accumulatorMultiplier(legCount);
  return Math.round(total);
}

/** Format €M values for the auction. */
export function fmtMillion(n: number): string {
  return `€${n}M`;
}

/** Format a budget like "€1.00B" / "€780M". */
export function fmtBudget(m: number): string {
  if (m >= 1000) return `€${(m / 1000).toFixed(2)}B`;
  return `€${m}M`;
}
