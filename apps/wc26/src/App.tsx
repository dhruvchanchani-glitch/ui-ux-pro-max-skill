import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { applyNationTheme } from "@/lib/theme";
import { findNation } from "@/data/nations";
import { useUser } from "@/stores/user";
import { ToastRack } from "@/components/ToastRack";
import { setHapticsEnabled } from "@/lib/haptics";

// Feature screens
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";
import { HomeScreen } from "@/features/home/HomeScreen";
import { MatchDetail } from "@/features/match/MatchDetail";
import { AuctionModePicker } from "@/features/auction/AuctionModePicker";
import { AuctionLobby } from "@/features/auction/AuctionLobby";
import { AuctionRoom } from "@/features/auction/AuctionRoom";
import { ChooseFormation } from "@/features/draft/ChooseFormation";
import { SquadBuilder } from "@/features/draft/SquadBuilder";
import { DraftBattleReveal } from "@/features/draft/DraftBattleReveal";
import { BettingHub } from "@/features/betting/BettingHub";
import { Leaderboard } from "@/features/leaderboard/Leaderboard";

export default function App() {
  const supportedTeam = useUser((s) => s.supportedTeam);
  const reducedMotion = useUser((s) => s.reducedMotion);
  const hapticsEnabled = useUser((s) => s.hapticsEnabled);
  const highContrast = useUser((s) => s.highContrast);

  // Keep the theme in sync with the supported team. The default theme
  // is Portugal; once onboarding completes this swaps to the user's choice.
  useEffect(() => {
    const nation = findNation(supportedTeam) ?? findNation("POR");
    if (nation) applyNationTheme(nation);
  }, [supportedTeam]);

  // Toggle global a11y classes / haptics on/off in response to prefs.
  useEffect(() => {
    document.documentElement.classList.toggle("hc", highContrast);
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
  }, [reducedMotion, highContrast]);

  useEffect(() => {
    setHapticsEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  const hasOnboarded = useUser((s) => s.hasOnboarded);

  return (
    <>
    <Routes>
      <Route
        path="/onboarding/*"
        element={
          hasOnboarded ? <Navigate to="/" replace /> : <OnboardingFlow />
        }
      />
      <Route
        path="/"
        element={
          hasOnboarded ? <HomeScreen /> : <Navigate to="/onboarding" replace />
        }
      />
      <Route path="/match/:matchId" element={<MatchDetail />} />
      <Route path="/match/:matchId/auction" element={<AuctionModePicker />} />
      <Route
        path="/match/:matchId/auction/lobby/:mode"
        element={<AuctionLobby />}
      />
      <Route
        path="/match/:matchId/auction/room/:mode"
        element={<AuctionRoom />}
      />
      <Route
        path="/match/:matchId/draft/formation"
        element={<ChooseFormation />}
      />
      <Route path="/match/:matchId/draft/squad" element={<SquadBuilder />} />
      <Route
        path="/match/:matchId/draft/reveal"
        element={<DraftBattleReveal />}
      />
      <Route path="/match/:matchId/betting" element={<BettingHub />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <ToastRack />
    </>
  );
}
