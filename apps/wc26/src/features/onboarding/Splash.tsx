export function Splash() {
  return (
    <div className="min-h-full grid place-items-center bg-[#0A0A0B] text-white">
      <div
        className="font-display text-[280px] leading-none"
        style={{ animation: "splash-in 600ms cubic-bezier(0.32,0.72,0,1)" }}
      >
        26
      </div>
      <style>{`
        @keyframes splash-in {
          from { transform: translateX(60%) scale(1.2); opacity: 0 }
          to { transform: translateX(0) scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}
