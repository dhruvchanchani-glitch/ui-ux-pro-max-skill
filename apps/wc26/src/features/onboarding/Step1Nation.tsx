import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { NATIONS } from "@/data/nations";
import { Pill } from "@/components/primitives/Pill";
import { useUser } from "@/stores/user";
import { applyNationTheme } from "@/lib/theme";
import { findNation } from "@/data/nations";
import { haptic } from "@/lib/haptics";

type Props = { onContinue: () => void };

export function Step1Nation({ onContinue }: Props) {
  const [query, setQuery] = useState("");
  const supportedTeam = useUser((s) => s.supportedTeam);
  const setSupportedTeam = useUser((s) => s.setSupportedTeam);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NATIONS;
    return NATIONS.filter((n) => n.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex-1 flex flex-col px-5 pb-safe">
      <header className="pt-6">
        <h1 className="text-display-md font-display text-ink">Pick your nation.</h1>
        <p className="text-body text-ink-2 mt-2">
          We'll dress the app in your colours.
        </p>
      </header>

      <div className="sticky top-2 mt-6 mb-4 z-10 bg-canvas">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
          />
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 47 nations"
            aria-label="Search nations"
            className="w-full h-12 pl-11 pr-4 bg-surface border border-hairline rounded-md text-body-lg outline-none focus:border-[var(--nation-primary)]"
          />
        </div>
      </div>

      <div
        className="grid grid-cols-3 gap-3 pb-32 overflow-y-auto"
        role="radiogroup"
        aria-label="Choose your supported nation"
      >
        {filtered.map((n) => {
          const selected = supportedTeam === n.code;
          return (
            <button
              key={n.code}
              role="radio"
              aria-checked={selected}
              aria-label={n.name}
              onClick={() => {
                setSupportedTeam(n.code);
                const nation = findNation(n.code);
                if (nation) applyNationTheme(nation);
                haptic("medium");
              }}
              className="press relative aspect-[5/6] rounded-none overflow-hidden"
              style={{
                boxShadow: selected
                  ? `0 0 0 3px var(--nation-primary), 0 4px 8px rgba(10,10,11,0.10)`
                  : "0 1px 2px rgba(10,10,11,0.06)",
              }}
            >
              <div
                className="absolute inset-0"
                style={{ background: n.theme.primary }}
              />
              <div
                className="absolute inset-y-0 right-0 w-2/5"
                style={{ background: n.theme.secondary }}
              />
              <div
                className="absolute inset-x-0 bottom-0 h-1.5"
                style={{ background: n.theme.accent }}
              />
              <span
                className="absolute inset-x-0 bottom-3 text-center font-display text-[20px] leading-none uppercase tracking-tight"
                style={{ color: n.theme.onPrimary }}
              >
                {n.shortCode}
              </span>
              <span
                className="absolute inset-x-1 bottom-7 text-center text-[10px] font-semibold uppercase tracking-wide opacity-80"
                style={{ color: n.theme.onPrimary }}
              >
                {n.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 pb-safe bg-gradient-to-t from-canvas via-canvas to-transparent pt-6">
        <div className="px-5">
          <Pill
            fullWidth
            size="lg"
            disabled={!supportedTeam}
            onClick={() => {
              haptic("success");
              onContinue();
            }}
          >
            Continue
          </Pill>
        </div>
      </div>
    </div>
  );
}
