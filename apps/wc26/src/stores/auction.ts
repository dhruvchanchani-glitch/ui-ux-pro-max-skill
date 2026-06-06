import { create } from "zustand";
import { backend, type AuctionState } from "@/lib/backend";

type AuctionStore = {
  room: AuctionState | undefined;
  lastSoldAt: number;
  setRoom: (r: AuctionState | undefined) => void;
  refresh: (roomId: string) => Promise<void>;
};

export const useAuctionStore = create<AuctionStore>((set) => ({
  room: undefined,
  lastSoldAt: 0,
  setRoom: (r) =>
    set((prev) => {
      const justSold = prev.room?.status !== "sold" && r?.status === "sold";
      return {
        room: r,
        lastSoldAt: justSold ? Date.now() : prev.lastSoldAt,
      };
    }),
  async refresh(roomId) {
    const r = await backend.getAuctionState(roomId);
    set({ room: r });
  },
}));
