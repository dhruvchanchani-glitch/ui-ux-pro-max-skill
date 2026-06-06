import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Step1Nation } from "./Step1Nation";
import { Step2Location } from "./Step2Location";
import { Step3Username } from "./Step3Username";
import { Splash } from "./Splash";

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const nav = useNavigate();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 700);
    return () => clearTimeout(t);
  }, []);

  if (!splashDone) return <Splash />;

  return (
    <div className="min-h-full flex flex-col bg-canvas">
      {/* Progress dots */}
      <div className="flex items-center gap-2 px-5 pt-safe pt-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 rounded-pill transition-all ${
              i === step
                ? "w-8 bg-[var(--nation-primary)]"
                : i < step
                  ? "w-3 bg-[var(--nation-primary)]/40"
                  : "w-3 bg-hairline"
            }`}
            aria-current={i === step ? "step" : undefined}
          />
        ))}
        <span className="ml-auto text-caption text-ink-3">{step + 1} / 3</span>
      </div>

      <Routes>
        <Route
          path=""
          element={
            <Step1Nation
              onContinue={() => {
                setStep(1);
                nav("location");
              }}
            />
          }
        />
        <Route
          path="location"
          element={
            <Step2Location
              onBack={() => {
                setStep(0);
                nav("");
              }}
              onContinue={() => {
                setStep(2);
                nav("username");
              }}
            />
          }
        />
        <Route
          path="username"
          element={
            <Step3Username
              onBack={() => {
                setStep(1);
                nav("location");
              }}
            />
          }
        />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </div>
  );
}
