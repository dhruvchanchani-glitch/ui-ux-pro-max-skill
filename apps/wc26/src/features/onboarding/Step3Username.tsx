import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Pill } from "@/components/primitives/Pill";
import { useUser } from "@/stores/user";
import { useNavigate } from "react-router-dom";
import { haptic } from "@/lib/haptics";
import { useWallet } from "@/stores/wallet";

type Props = { onBack: () => void };

const BANNED_WORDS = ["fuck", "shit", "bitch", "cunt", "nigg"];

function isValid(name: string): { ok: boolean; reason?: string } {
  if (!name) return { ok: false, reason: " " };
  if (name.length > 16) return { ok: false, reason: "Max 16 characters." };
  if (!/^[A-Za-z0-9_]+$/.test(name))
    return { ok: false, reason: "Letters, numbers, and underscores only." };
  const lower = name.toLowerCase();
  if (BANNED_WORDS.some((w) => lower.includes(w)))
    return {
      ok: false,
      reason: "No swearing — kids watch the World Cup too.",
    };
  return { ok: true };
}

export function Step3Username({ onBack }: Props) {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const completeOnboarding = useUser((s) => s.completeOnboarding);
  const setUsername = useUser((s) => s.setUsername);
  const nav = useNavigate();
  const awardDaily = useWallet((s) => s.awardDaily);
  const refresh = useWallet((s) => s.refresh);

  const validity = isValid(name);

  return (
    <div className="flex-1 flex flex-col px-5 pb-safe">
      <button
        onClick={onBack}
        className="press inline-flex items-center gap-2 -ml-1 mt-4 text-ink-2"
        aria-label="Back"
      >
        <ArrowLeft size={20} />
      </button>

      <header className="pt-4">
        <h1 className="text-display-md font-display text-ink">Pick a name.</h1>
        <p className="text-body text-ink-2 mt-2">
          Your fellow bidders will see this.
        </p>
      </header>

      <div className="mt-8">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          maxLength={20}
          placeholder="e.g. portugal_fan_88"
          aria-label="Username"
          aria-invalid={touched && !validity.ok}
          className={`w-full h-14 px-4 bg-surface border-2 rounded-md text-body-lg font-mono outline-none focus:border-[var(--nation-primary)] ${
            touched && !validity.ok
              ? "border-loss"
              : "border-hairline"
          }`}
        />
        <p
          className={`mt-2 text-caption ${
            touched && !validity.ok ? "text-loss" : "text-ink-3"
          }`}
        >
          {touched && validity.reason
            ? validity.reason
            : "Letters, numbers, and underscores. No swearing — kids watch the World Cup too."}
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 pb-safe bg-gradient-to-t from-canvas via-canvas to-transparent pt-6">
        <div className="px-5">
          <Pill
            fullWidth
            size="lg"
            disabled={!validity.ok}
            onClick={async () => {
              setUsername(name);
              completeOnboarding();
              await awardDaily();
              await refresh();
              haptic("success");
              nav("/", { replace: true });
            }}
          >
            Enter the tournament
          </Pill>
        </div>
      </div>
    </div>
  );
}
