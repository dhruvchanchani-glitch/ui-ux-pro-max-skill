/*
 * Web Vibration API shim mapped to the six haptic intents in PRD §7
 * (Light/Medium/Heavy + Success/Warning/Error). On platforms without
 * `navigator.vibrate` this becomes a no-op so callers don't need to
 * branch.
 *
 * Pattern values picked so they feel like the iOS UIImpactFeedback
 * equivalents: a short single pulse for Light/Medium/Heavy, two short
 * pulses for Success, a short-then-longer for Warning, and three short
 * pulses for Error.
 */

export type HapticKind =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warning"
  | "error";

let enabled = true;

export function setHapticsEnabled(v: boolean) {
  enabled = v;
}

export function haptic(kind: HapticKind) {
  if (!enabled) return;
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  const map: Record<HapticKind, number[] | number> = {
    light: 10,
    medium: 20,
    heavy: 35,
    success: [16, 60, 16],
    warning: [30, 40, 80],
    error: [50, 60, 50, 60, 50],
  };
  try {
    navigator.vibrate(map[kind]);
  } catch {
    /* ignore */
  }
}
