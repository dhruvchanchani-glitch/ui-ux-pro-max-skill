import { Sheet } from "@/components/primitives/Sheet";
import { useUser } from "@/stores/user";
import { findNation, NATIONS } from "@/data/nations";
import { applyNationTheme } from "@/lib/theme";
import { useState } from "react";
import { Modal } from "@/components/primitives/Modal";
import { Pill } from "@/components/primitives/Pill";
import { haptic } from "@/lib/haptics";

type Props = { open: boolean; onClose: () => void };

export function ProfileSheet({ open, onClose }: Props) {
  const username = useUser((s) => s.username);
  const supportedTeam = useUser((s) => s.supportedTeam);
  const timezone = useUser((s) => s.timezone);
  const liveUpdates = useUser((s) => s.liveUpdates);
  const reducedMotion = useUser((s) => s.reducedMotion);
  const hapticsEnabled = useUser((s) => s.hapticsEnabled);
  const highContrast = useUser((s) => s.highContrast);
  const togglePref = useUser((s) => s.togglePref);
  const setSupportedTeam = useUser((s) => s.setSupportedTeam);
  const resetForDev = useUser((s) => s.resetForDev);
  const nation = findNation(supportedTeam);
  const [teamModal, setTeamModal] = useState(false);
  const [signOutModal, setSignOutModal] = useState(false);

  return (
    <>
      <Sheet open={open} onClose={onClose} height="full">
        {/* Identity header */}
        <div
          className="-mx-5 -mt-2 px-5 pt-6 pb-8"
          style={{
            background: `linear-gradient(160deg, ${nation?.theme.primary}, ${nation?.theme.ink})`,
            color: nation?.theme.onPrimary,
          }}
        >
          <div className="grid place-items-center">
            <div
              className="w-24 h-24 rounded-pill bg-white grid place-items-center font-display text-display-md"
              style={{
                boxShadow: `0 0 0 3px ${nation?.theme.primary}`,
                color: nation?.theme.ink,
              }}
            >
              {(username || "?")[0].toUpperCase()}
            </div>
            <p className="font-display text-display-md mt-3 uppercase">{username}</p>
            <p className="text-caption mt-1 opacity-90">Supports {nation?.name}</p>
          </div>
        </div>

        <ul className="mt-2 divide-y divide-hairline">
          <Row label="Edit username" hint={username} onClick={() => {}} />
          <Row
            label="Change supported team"
            hint={`${nation?.name} · home screen repaints instantly.`}
            onClick={() => setTeamModal(true)}
          />
          <Row label="Change timezone" hint={timezone} onClick={() => {}} />
          <Row label="Notifications" hint="Match reminders, bet results" onClick={() => {}} />
          <Toggle label="Live updates" value={liveUpdates} onToggle={() => togglePref("liveUpdates")} />
          <Toggle label="Reduce motion" value={reducedMotion} onToggle={() => togglePref("reducedMotion")} />
          <Toggle label="Haptics" value={hapticsEnabled} onToggle={() => togglePref("hapticsEnabled")} />
          <Toggle label="High contrast" value={highContrast} onToggle={() => togglePref("highContrast")} />
          <Row label="Subscription & purchases" hint="Manage your Supporter Pass" onClick={() => {}} />
        </ul>

        <div className="mt-6 border-t border-hairline pt-4">
          <button
            onClick={() => setSignOutModal(true)}
            className="press w-full text-left py-3 text-loss font-bold"
          >
            Sign out
          </button>
        </div>

        <p className="text-caption text-ink-3 text-center mt-6">
          v0.1.0 · <a href="/legal/privacy.md" className="underline">Privacy</a> ·{" "}
          <a href="/legal/terms.md" className="underline">Terms</a> ·{" "}
          <a href="mailto:support@wc26.app" className="underline">Support</a>
        </p>
      </Sheet>

      {/* Change team modal */}
      <Modal open={teamModal} onClose={() => setTeamModal(false)} title="Change supported team">
        <p className="text-caption text-ink-3 mb-3">
          Your home screen will repaint instantly.
        </p>
        <div className="grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
          {NATIONS.map((n) => (
            <button
              key={n.code}
              onClick={() => {
                setSupportedTeam(n.code);
                const nat = findNation(n.code);
                if (nat) applyNationTheme(nat);
                haptic("medium");
                setTeamModal(false);
              }}
              className="press aspect-[5/6] rounded-sm overflow-hidden relative"
            >
              <div className="absolute inset-0" style={{ background: n.theme.primary }} />
              <div className="absolute inset-y-0 right-0 w-1/3" style={{ background: n.theme.secondary }} />
              <span
                className="absolute inset-x-0 bottom-1 text-center font-display text-[16px] leading-none"
                style={{ color: n.theme.onPrimary }}
              >
                {n.shortCode}
              </span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Sign out modal */}
      <Modal open={signOutModal} onClose={() => setSignOutModal(false)} title="Sign out?">
        <p className="text-body text-ink-2">
          You'll need to set up again next time. Your Coins and XP are saved on
          this device.
        </p>
        <div className="mt-4 flex gap-2">
          <Pill variant="ghost" fullWidth onClick={() => setSignOutModal(false)}>
            Cancel
          </Pill>
          <Pill
            variant="danger"
            fullWidth
            onClick={() => {
              resetForDev();
              setSignOutModal(false);
              onClose();
            }}
          >
            Sign out
          </Pill>
        </div>
      </Modal>
    </>
  );
}

function Row({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button onClick={onClick} className="press w-full text-left py-3 flex items-center justify-between">
        <div>
          <p className="text-body-lg font-semibold">{label}</p>
          {hint && <p className="text-caption text-ink-3 mt-0.5">{hint}</p>}
        </div>
      </button>
    </li>
  );
}

function Toggle({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <li>
      <button
        onClick={onToggle}
        className="press w-full text-left py-3 flex items-center justify-between"
        aria-pressed={value}
      >
        <p className="text-body-lg font-semibold">{label}</p>
        <span
          className={`relative w-12 h-7 rounded-pill border transition-colors ${
            value ? "bg-[var(--nation-primary)] border-[var(--nation-primary)]" : "bg-canvas border-hairline"
          }`}
        >
          <span
            className="absolute top-0.5 left-0.5 w-6 h-6 rounded-pill bg-white shadow-elev-1 transition-transform"
            style={{ transform: value ? "translateX(20px)" : "translateX(0)" }}
          />
        </span>
      </button>
    </li>
  );
}
