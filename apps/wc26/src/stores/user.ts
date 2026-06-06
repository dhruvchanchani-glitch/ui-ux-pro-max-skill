import { create } from "zustand";
import { persist } from "zustand/middleware";
import { detectTimezone, detectLocale } from "@/lib/time";
import { isUsingMock } from "@/lib/backend";

async function syncProfileIfRealBackend(s: {
  username: string;
  supportedTeam: string;
  timezone: string;
}) {
  if (isUsingMock) return;
  try {
    const { syncProfile } = await import("@/lib/supabaseBackend");
    await syncProfile(s);
  } catch (err) {
    // Local UI keeps working from Zustand state. Log so devs notice.
    console.warn("syncProfile failed:", err);
  }
}

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

      setUsername: (n) => {
        set({ username: n });
        const s = useUser.getState();
        void syncProfileIfRealBackend({
          username: n,
          supportedTeam: s.supportedTeam,
          timezone: s.timezone,
        });
      },
      setSupportedTeam: (code) => {
        const upper = code.toUpperCase();
        set({ supportedTeam: upper });
        const s = useUser.getState();
        void syncProfileIfRealBackend({
          username: s.username,
          supportedTeam: upper,
          timezone: s.timezone,
        });
      },
      setTimezone: (tz) => {
        set({ timezone: tz });
        const s = useUser.getState();
        void syncProfileIfRealBackend({
          username: s.username,
          supportedTeam: s.supportedTeam,
          timezone: tz,
        });
      },
      completeOnboarding: () => {
        set({ hasOnboarded: true });
        const s = useUser.getState();
        void syncProfileIfRealBackend({
          username: s.username,
          supportedTeam: s.supportedTeam,
          timezone: s.timezone,
        });
      },
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
