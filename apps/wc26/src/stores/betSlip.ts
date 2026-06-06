import { create } from "zustand";
import type { MarketKind } from "@/data/markets";

export type Selection = {
  id: string;
  matchId: string;
  market: MarketKind;
  marketTitle: string;
  selection: string;
  selectionLabel: string;
  odds: number;
};

type BetSlipStore = {
  selections: Selection[];
  stake: number;
  expanded: boolean;
  /** auto-on at 3+ selections per PRD §FR-BET-7 */
  isAccumulator: boolean;
  toggle: (sel: Selection) => void;
  remove: (id: string) => void;
  setStake: (n: number) => void;
  setExpanded: (v: boolean) => void;
  setAccumulator: (v: boolean) => void;
  clear: () => void;
};

export const useBetSlip = create<BetSlipStore>((set, get) => ({
  selections: [],
  stake: 100,
  expanded: false,
  isAccumulator: false,

  toggle(sel) {
    const existing = get().selections.find(
      (s) => s.matchId === sel.matchId && s.market === sel.market
    );
    let next: Selection[];
    if (existing && existing.selection === sel.selection) {
      next = get().selections.filter((s) => s.id !== existing.id);
    } else if (existing) {
      next = get().selections.map((s) =>
        s.id === existing.id ? { ...sel, id: existing.id } : s
      );
    } else {
      next = [...get().selections, sel];
    }
    set({
      selections: next,
      isAccumulator: next.length >= 3 ? true : get().isAccumulator,
    });
  },

  remove(id) {
    set({ selections: get().selections.filter((s) => s.id !== id) });
  },

  setStake(n) {
    set({ stake: Math.max(0, Math.round(n)) });
  },

  setExpanded(v) {
    set({ expanded: v });
  },

  setAccumulator(v) {
    set({ isAccumulator: v });
  },

  clear() {
    set({ selections: [], stake: 100, expanded: false, isAccumulator: false });
  },
}));
