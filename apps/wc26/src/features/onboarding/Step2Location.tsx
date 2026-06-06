import { useState } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { Pill } from "@/components/primitives/Pill";
import { useUser } from "@/stores/user";
import { detectTimezone } from "@/lib/time";
import { haptic } from "@/lib/haptics";

type Props = { onBack: () => void; onContinue: () => void };

const COMMON_CITIES = [
  { name: "Lisbon, Portugal", tz: "Europe/Lisbon" },
  { name: "London, UK", tz: "Europe/London" },
  { name: "Paris, France", tz: "Europe/Paris" },
  { name: "Madrid, Spain", tz: "Europe/Madrid" },
  { name: "Berlin, Germany", tz: "Europe/Berlin" },
  { name: "New York, USA", tz: "America/New_York" },
  { name: "Los Angeles, USA", tz: "America/Los_Angeles" },
  { name: "Mexico City, Mexico", tz: "America/Mexico_City" },
  { name: "São Paulo, Brazil", tz: "America/Sao_Paulo" },
  { name: "Buenos Aires, Argentina", tz: "America/Argentina/Buenos_Aires" },
  { name: "Tokyo, Japan", tz: "Asia/Tokyo" },
  { name: "Seoul, South Korea", tz: "Asia/Seoul" },
  { name: "Dubai, UAE", tz: "Asia/Dubai" },
  { name: "Sydney, Australia", tz: "Australia/Sydney" },
];

export function Step2Location({ onBack, onContinue }: Props) {
  const [query, setQuery] = useState("");
  const setTimezone = useUser((s) => s.setTimezone);
  const timezone = useUser((s) => s.timezone);
  const [picked, setPicked] = useState<string | null>(null);

  const matches = query
    ? COMMON_CITIES.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : COMMON_CITIES;

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
        <h1 className="text-display-md font-display text-ink">
          Where in the world are you?
        </h1>
        <p className="text-body text-ink-2 mt-2">
          We'll convert every kickoff to your local time.
        </p>
      </header>

      <div className="mt-6">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city or country"
          aria-label="Search city or country"
          className="w-full h-12 px-4 bg-surface border border-hairline rounded-md text-body-lg outline-none focus:border-[var(--nation-primary)]"
        />
      </div>

      <button
        onClick={() => {
          const tz = detectTimezone();
          setTimezone(tz);
          setPicked(tz);
          haptic("medium");
        }}
        className="press mt-3 inline-flex items-center gap-2 text-xp underline decoration-2 underline-offset-4 font-semibold"
      >
        <MapPin size={16} />
        Use my current location
      </button>

      <div className="mt-4 flex-1 overflow-y-auto pb-32">
        <ul className="divide-y divide-hairline">
          {matches.map((c) => (
            <li key={c.tz}>
              <button
                onClick={() => {
                  setTimezone(c.tz);
                  setPicked(c.tz);
                  haptic("light");
                }}
                className={`press w-full text-left py-3 flex items-center justify-between ${
                  picked === c.tz ? "text-[var(--nation-primary)]" : "text-ink"
                }`}
              >
                <span className="text-body-lg">{c.name}</span>
                <span className="text-caption text-ink-3 font-mono">
                  {c.tz}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="fixed inset-x-0 bottom-0 pb-safe bg-gradient-to-t from-canvas via-canvas to-transparent pt-6">
        <div className="px-5 space-y-2">
          {picked && (
            <p className="text-caption text-ink-3">
              Local timezone: <span className="text-ink font-semibold">{timezone}</span>
            </p>
          )}
          <Pill
            fullWidth
            size="lg"
            disabled={!picked}
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
