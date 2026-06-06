import { ReactNode, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function Modal({ open, onClose, children, title }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-scrim"
        onClick={onClose}
        style={{ animation: "fade-in 280ms ease-out" }}
      />
      <div
        className="absolute inset-x-5 top-1/2 -translate-y-1/2 bg-surface rounded-lg p-6 shadow-elev-4"
        style={{ animation: "modal-in 280ms cubic-bezier(0.32,0.72,0,1)" }}
      >
        {title && <h3 className="text-title mb-3">{title}</h3>}
        {children}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modal-in {
          from { transform: translate(0, -50%) scale(0.96); opacity: 0 }
          to { transform: translate(0, -50%) scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  );
}
