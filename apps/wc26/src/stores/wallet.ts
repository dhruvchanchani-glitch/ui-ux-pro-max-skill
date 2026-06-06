import { create } from "zustand";
import { backend, type Wallet } from "@/lib/backend";

type WalletStore = {
  xp: number;
  coins: number;
  streak: number;
  ready: boolean;
  /** Toast queue for passive bet-won notifications. */
  toasts: Array<{
    id: string;
    coins: number;
    label: string;
    matchId: string;
  }>;
  refresh: () => Promise<void>;
  awardDaily: () => Promise<number>;
  spendCoins: (amount: number, reason: string) => Promise<boolean>;
  spendXP: (amount: number, reason: string) => Promise<boolean>;
  enqueueToast: (t: { coins: number; label: string; matchId: string }) => void;
  dismissToast: (id: string) => void;
};

function apply(set: (p: Partial<WalletStore>) => void, w: Wallet) {
  set({ xp: w.xp, coins: w.coins, streak: w.streak, ready: true });
}

export const useWallet = create<WalletStore>((set, get) => ({
  xp: 0,
  coins: 0,
  streak: 0,
  ready: false,
  toasts: [],

  async refresh() {
    const w = await backend.getWallet();
    apply(set, w);
  },

  async awardDaily() {
    const r = await backend.awardDailyXP();
    await get().refresh();
    return r.added;
  },

  async spendCoins(amount, reason) {
    try {
      const w = await backend.spendCoins(amount, reason);
      apply(set, w);
      return true;
    } catch {
      return false;
    }
  },

  async spendXP(amount, reason) {
    try {
      const w = await backend.spendXP(amount, reason);
      apply(set, w);
      return true;
    } catch {
      return false;
    }
  },

  enqueueToast(t) {
    const id = `t_${Math.random().toString(36).slice(2, 8)}`;
    set({ toasts: [...get().toasts, { id, ...t }] });
    setTimeout(() => get().dismissToast(id), 5000);
  },

  dismissToast(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));
