import { Home, Trophy, MapPin, Wallet } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { WalletSheet } from "@/features/wallet/WalletSheet";

const tabs = [
  { key: "home", label: "Home", icon: Home, to: "/" },
  { key: "tournament", label: "Tournament", icon: Trophy, to: "/leaderboard" },
  { key: "stadium", label: "Stadium", icon: MapPin, to: "/" },
  { key: "wallet", label: "Wallet", icon: Wallet, to: "#wallet" },
];

export function BottomTabBar() {
  const loc = useLocation();
  const nav = useNavigate();
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-hairline pb-safe"
      >
        <div className="flex h-16 items-stretch">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive =
              t.key === "wallet"
                ? walletOpen
                : t.key === "home"
                  ? loc.pathname === "/"
                  : loc.pathname.startsWith(t.to);
            return (
              <button
                key={t.key}
                aria-label={t.label}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  if (t.key === "wallet") setWalletOpen(true);
                  else nav(t.to);
                }}
                className="flex-1 flex flex-col items-center justify-center gap-1 press"
              >
                <Icon
                  size={22}
                  strokeWidth={1.75}
                  className={isActive ? "text-[var(--nation-primary)]" : "text-ink-3"}
                />
                <span
                  className={`text-micro uppercase ${
                    isActive ? "text-ink" : "text-ink-3"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      <WalletSheet open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );
}
