import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectTimezone, detectLocale } from "@/lib/time";

export type UserState = {
  hasOnboarded: boolean;
  username: string;
  supportedTeam: string; // nation code
  timezone: string;
  locale: string;
  /** Toggles per PRD §10.10.2 */
  reducedMotion: boolean;
  hapticsEnabled: boolean;
  liveUpdates: boolean;
  highContrast: boolean;
  supporterPass: boolean;

  setUsername: (n: string) => void;
  setSupportedTeam: (code: string) => void;
  setTimezone: (tz: string) => void;
  completeOnboarding: () => void;
  togglePref: (
    key: "reducedMotion" | "hapticsEnabled" | "liveUpdates" | "highContrast" | "supporterPass"
  ) => void;
  resetForDev: () => void;
};

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      username: "",
      supportedTeam: "POR",
      timezone: detectTimezone(),
      locale: detectLocale(),
      reducedMotion: false,
      hapticsEnabled: true,
      liveUpdates: true,
      highContrast: false,
      supporterPass: false,

      setUsername: (n) => set({ username: n }),
      setSupportedTeam: (code) => set({ supportedTeam: code.toUpperCase() }),
      setTimezone: (tz) => set({ timezone: tz }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      togglePref: (key) =>
        set((s) => ({ ...s, [key]: !s[key] })),
      resetForDev: () =>
        set({
          hasOnboarded: false,
          username: "",
          supportedTeam: "POR",
        }),
    }),
    { name: "wc26:user:v1" }
  )
);
