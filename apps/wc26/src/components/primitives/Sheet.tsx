import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** "full" goes ~92vh, "auto" follows content, "tall" goes ~75vh. */
  height?: "auto" | "tall" | "full";
};

export function Sheet({ open, onClose, title, children, height = "auto" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sheetMaxH = {
    auto: "max-h-[80vh]",
    tall: "h-[75vh]",
    full: "h-[92vh]",
  }[height];

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-scrim"
        onClick={onClose}
        style={{
          animation: "fade-in 280ms cubic-bezier(0.32,0.72,0,1)",
        }}
      />
      <div
        className={`absolute left-0 right-0 bottom-0 bg-surface rounded-t-lg ${sheetMaxH} flex flex-col`}
        style={{
          animation: "sheet-up 360ms cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="w-12 h-1 bg-hairline rounded-full mx-auto" aria-hidden />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pb-2">
            <h2 className="text-title">{title}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 grid place-items-center rounded-pill press hover:bg-canvas"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 pb-safe">{children}</div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sheet-up {
          from { transform: translateY(100%) }
          to { transform: translateY(0) }
        }
      `}</style>
    </div>
  );
}
