import type { Nation } from "@/data/nations";

/**
 * Apply a nation's five tokens to the document root. This is the only
 * function in the app that mutates the global theme — call it on
 * onboarding completion and any time the user changes supported team.
 */
export function applyNationTheme(nation: Nation): void {
  const root = document.documentElement;
  root.style.setProperty("--nation-primary", nation.theme.primary);
  root.style.setProperty("--nation-secondary", nation.theme.secondary);
  root.style.setProperty("--nation-accent", nation.theme.accent);
  root.style.setProperty("--nation-on-primary", nation.theme.onPrimary);
  root.style.setProperty("--nation-ink", nation.theme.ink);
  // Stash on a data-attr so consumers can react / debug.
  root.dataset.nation = nation.code;
}

/**
 * 4.5:1 contrast check for AA body text. Returns the contrast ratio
 * between two hex colours; used by contrast-lint.ts.
 */
export function contrastRatio(a: string, b: string): number {
  const lA = relativeLuminance(a);
  const lB = relativeLuminance(b);
  const [bright, dark] = lA > lB ? [lA, lB] : [lB, lA];
  return (bright + 0.05) / (dark + 0.05);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  const num = parseInt(full, 16);
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}
