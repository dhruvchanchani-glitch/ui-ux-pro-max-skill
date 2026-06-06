import { useState } from "react";
import { Coins, Zap } from "lucide-react";
import { Sheet } from "@/components/primitives/Sheet";
import { Pill } from "@/components/primitives/Pill";
import { Card } from "@/components/primitives/Card";
import { Chip } from "@/components/primitives/Chip";
import { useUser } from "@/stores/user";
import { useWallet } from "@/stores/wallet";
import { findNation } from "@/data/nations";
import { fmtCoins, fmtXP } from "@/lib/currency";
import { haptic } from "@/lib/haptics";
import { backend } from "@/lib/backend";

type Props = { open: boolean; onClose: () => void };

const XP_PACKS = [
  { id: "starter", name: "Starter", xp: 1500, price: "£0.99" },
  { id: "popular", name: "Popular", xp: 5000, price: "£2.99", badge: "Most popular" as const },
  { id: "serious", name: "Serious", xp: 12000, price: "£5.99" },
  { id: "season", name: "Season", xp: 30000, price: "£12.99", badge: "Best value" as const },
];

const REDEMPTION_TIERS = [
  { coins: 2_000, label: "Digital reward", sub: "Partner discount code or streaming free trial" },
  { coins: 5_000, label: "Prize-draw entry", sub: "Monthly physical merch prize draw" },
  { coins: 15_000, label: "Guaranteed bundle", sub: "Official tournament product, shipped" },
  { coins: 50_000, label: "Grand prize", sub: "VIP ticket or hospitality, once per tournament" },
];

export function WalletSheet({ open, onClose }: Props) {
  const xp = useWallet((s) => s.xp);
  const coins = useWallet((s) => s.coins);
  const supportedTeam = useUser((s) => s.supportedTeam);
  const supporterPass = useUser((s) => s.supporterPass);
  const togglePref = useUser((s) => s.togglePref);
  const refresh = useWallet((s) => s.refresh);
  const nation = findNation(supportedTeam);
  const [tab, setTab] = useState<"xp" | "coins">("xp");
  void xp;

  async function purchasePack(packXp: number) {
    // Mock IAP — real impl validates the App Store / Play receipt
    // server-side before crediting (PRD FR-MON-7 / NFR-SEC-6).
    await new Promise((r) => setTimeout(r, 800));
    await backend.creditXP(packXp, "iap_purchase");
    await refresh();
    haptic("success");
  }

  return (
    <Sheet open={open} onClose={onClose} height="full">
      {/* Balance card */}
      <Card
        layer="raised"
        padding="md"
        className="text-white"
        style={{
          background: `linear-gradient(135deg, ${nation?.theme.primary} 0%, ${nation?.theme.ink} 100%)`,
        }}
      >
        <p className="text-micro uppercase opacity-80">Your balance</p>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-caption opacity-80 flex items-center gap-1">
              <Zap size={14} fill="currentColor" />
              XP
            </p>
            <p className="font-mono text-display-md tabular-nums leading-none mt-1">
              {fmtXP(xp)}
            </p>
          </div>
          <div className="border-l border-white/30 pl-4">
            <p className="text-caption opacity-80 flex items-center gap-1">
              <Coins size={14} />
              Coins
            </p>
            <p className="font-mono text-display-md tabular-nums leading-none mt-1">
              {fmtCoins(coins)}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="mt-5 grid grid-cols-2 border-b border-hairline">
        <button
          onClick={() => setTab("xp")}
          className={`press h-11 text-micro uppercase font-bold ${
            tab === "xp" ? "text-xp border-b-2 border-xp" : "text-ink-3"
          }`}
        >
          XP Top-up
        </button>
        <button
          onClick={() => setTab("coins")}
          className={`press h-11 text-micro uppercase font-bold ${
            tab === "coins" ? "text-[#7B5400] border-b-2 border-coin" : "text-ink-3"
          }`}
        >
          Coin Shop
        </button>
      </div>

      {/* XP tab */}
      {tab === "xp" && (
        <div className="mt-4 space-y-3 pb-8">
          <div className="grid grid-cols-2 gap-3">
            {XP_PACKS.map((pack) => (
              <Card key={pack.id} padding="md" className="relative">
                {pack.badge && (
                  <Chip
                    tone={pack.badge === "Most popular" ? "coin" : "xp"}
                    size="xs"
                    className="absolute -top-2 left-1/2 -translate-x-1/2"
                  >
                    {pack.badge}
                  </Chip>
                )}
                <span className="w-9 h-9 rounded-md grid place-items-center bg-xp-soft text-xp">
                  <Zap size={18} fill="currentColor" />
                </span>
                <p className="font-mono text-mono-score tabular-nums font-bold mt-3">
                  {fmtXP(pack.xp)}
                </p>
                <p className="text-caption text-ink-3 uppercase">{pack.name}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono font-bold">{pack.price}</span>
                  <Pill
                    variant="xp"
                    size="sm"
                    onClick={() => purchasePack(pack.xp)}
                  >
                    Buy
                  </Pill>
                </div>
              </Card>
            ))}
          </div>

          {/* Supporter Pass */}
          <Card
            padding="md"
            className="border-coin/30"
            style={{
              background:
                "linear-gradient(135deg, #FFF7DB 0%, #F5B301 100%)",
            }}
          >
            <h3 className="font-display text-display-md leading-none text-[#3A2200]">
              Supporter Pass
            </h3>
            <ul className="text-caption text-[#3A2200] mt-3 space-y-1">
              <li>· Double daily XP (1,000 per day)</li>
              <li>· 2 exclusive Pro markets per match</li>
              <li>· Supporter badge on leaderboard</li>
              <li>· One free streak shield / week</li>
            </ul>
            <div className="mt-4 flex items-center gap-2">
              <Pill
                variant="supporter"
                onClick={() => {
                  togglePref("supporterPass");
                  haptic("success");
                }}
                fullWidth
              >
                {supporterPass ? "Active" : "Subscribe £3.99/mo"}
              </Pill>
            </div>
          </Card>
        </div>
      )}

      {/* Coins tab */}
      {tab === "coins" && (
        <div className="mt-4 space-y-4 pb-8">
          <Card>
            <p className="text-micro text-ink-3 uppercase">Redeem progress</p>
            {REDEMPTION_TIERS.map((tier) => {
              const pct = Math.min(100, (coins / tier.coins) * 100);
              return (
                <div key={tier.coins} className="mt-3">
                  <div className="flex items-center justify-between text-caption">
                    <span className="font-semibold">{tier.label}</span>
                    <span className="font-mono tabular-nums">
                      {fmtCoins(coins)} / {fmtCoins(tier.coins)}
                    </span>
                  </div>
                  <p className="text-caption text-ink-3 mt-0.5">{tier.sub}</p>
                  <div className="mt-1.5 h-2 rounded-pill bg-canvas overflow-hidden">
                    <div className="h-full bg-coin" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </Card>

          <Card>
            <h3 className="text-title">Cosmetics</h3>
            <PerkRow label="Home-screen alt theme" sub="Gold edition" cost={300} />
            <PerkRow label="Animated flag-frame avatar" sub="Per nation" cost={150} />
            <PerkRow label="Username flair" sub="Colour or icon prefix" cost={250} />
          </Card>

          <Card>
            <h3 className="text-title">Betting boosts</h3>
            <PerkRow label="Odds preview" sub="30 min before market opens" cost={50} />
            <PerkRow label="Prediction swap" sub="Up to 15 min pre-kickoff" cost={120} />
            <PerkRow label="Streak shield" sub="One save" cost={180} />
            <PerkRow label="XP multiplier boost" sub="2× coins for 24h" cost={300} />
          </Card>

          <Card>
            <h3 className="text-title">Auction perks</h3>
            <PerkRow label="Scout report" sub="See full upcoming pool" cost={400} />
            <PerkRow label="Nomination priority" sub="Extra nominate" cost={250} />
            <PerkRow label="Draft Battle re-pick" sub="One XI↔bench swap" cost={200} />
            <PerkRow label="Private room" sub="Custom-named auction room" cost={350} />
          </Card>
        </div>
      )}
    </Sheet>
  );
}

function PerkRow({ label, sub, cost }: { label: string; sub: string; cost: number }) {
  const coins = useWallet((s) => s.coins);
  const spendCoins = useWallet((s) => s.spendCoins);
  const refresh = useWallet((s) => s.refresh);
  return (
    <div className="flex items-center justify-between py-3 border-t border-hairline first:border-t-0">
      <div>
        <p className="text-body-lg font-semibold">{label}</p>
        <p className="text-caption text-ink-3">{sub}</p>
      </div>
      <Pill
        variant="coin"
        size="sm"
        disabled={coins < cost}
        onClick={async () => {
          if (await spendCoins(cost, `perk:${label}`)) {
            haptic("success");
            await refresh();
          } else {
            haptic("error");
          }
        }}
      >
        {fmtCoins(cost)} coins
      </Pill>
    </div>
  );
}
