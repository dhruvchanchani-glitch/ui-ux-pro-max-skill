/*
 * Auction AI bidder. Mirrors the rules in PRD §FR-AUC-16..18:
 *   - evaluate squad needs (`posNeed`)
 *   - only bid above `ratingThreshold`
 *   - cap each bid at `maxBidM` = budget − `reserveM`
 *   - jitter the response 1.5–4s for realism
 *   - same atomic `.lt` semantics as humans (handled by mockBackend)
 *
 * Three personalities (Aggressive / Balanced / Conservative) so multiple
 * AI opponents feel distinct. Difficulty modulates both threshold and
 * delay so Easy bots feel slower and more passive.
 */

import type { AuctionParticipant, AuctionState } from "./backend";
import type { Player } from "@/data/players";

export type Difficulty = "easy" | "balanced" | "hard";
export type Personality = "aggressive" | "balanced" | "conservative";

type AISetting = {
  ratingThreshold: number;
  reserveM: number;
  minDelayMs: number;
  maxDelayMs: number;
  bumpM: number;
};

export function settingFor(
  difficulty: Difficulty,
  personality: Personality
): AISetting {
  const base: Record<Difficulty, AISetting> = {
    easy: {
      ratingThreshold: 82,
      reserveM: 250,
      minDelayMs: 2200,
      maxDelayMs: 4000,
      bumpM: 5,
    },
    balanced: {
      ratingThreshold: 84,
      reserveM: 150,
      minDelayMs: 1700,
      maxDelayMs: 3200,
      bumpM: 10,
    },
    hard: {
      ratingThreshold: 86,
      reserveM: 80,
      minDelayMs: 1200,
      maxDelayMs: 2400,
      bumpM: 15,
    },
  };
  const s = { ...base[difficulty] };
  if (personality === "aggressive") {
    s.ratingThreshold -= 2;
    s.reserveM = Math.max(40, s.reserveM - 50);
    s.bumpM += 5;
    s.minDelayMs -= 300;
  }
  if (personality === "conservative") {
    s.ratingThreshold += 2;
    s.reserveM += 80;
    s.bumpM = Math.max(5, s.bumpM - 5);
    s.minDelayMs += 400;
  }
  return s;
}

/** Cheap need check — does the AI's squad still want this position? */
export function posNeed(squad: Player[], position: string): boolean {
  const slots: Record<string, number> = {
    GK: 1, CB: 2, LB: 1, RB: 1, CDM: 1, CM: 2, CAM: 1, LW: 1, RW: 1, ST: 1,
  };
  const have = squad.filter((p) => p.position === position).length;
  return have < (slots[position] ?? 1);
}

export function decideBid(
  state: AuctionState,
  ai: AuctionParticipant,
  setting: AISetting,
  resolvePlayer: (id: string) => Player | undefined
): { amountM: number } | null {
  const current = state.pool[state.currentPlayerIndex];
  if (!current) return null;
  if (current.rating < setting.ratingThreshold) return null;
  const squad = ai.squad
    .map(resolvePlayer)
    .filter((p): p is Player => !!p);
  if (!posNeed(squad, current.position) && current.rating < 90) return null;

  const max = ai.budgetM - setting.reserveM;
  const proposed = Math.min(max, state.currentBidAmount + setting.bumpM);
  if (proposed <= state.currentBidAmount) return null;
  return { amountM: proposed };
}

export function aiDelayMs(setting: AISetting): number {
  return (
    setting.minDelayMs +
    Math.random() * (setting.maxDelayMs - setting.minDelayMs)
  );
}
