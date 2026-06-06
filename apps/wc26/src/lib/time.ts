/*
 * Local time + timezone helpers. The PRD requires:
 *   - all match kickoffs displayed in the user's local timezone (FR-ONB-3)
 *   - 24h on EU/UK locales, 12h on US locale (§11 voice)
 *   - "Sat 13 Jun" date format on cards
 *   - mono-timer countdowns to kickoff when ≥15 min away (§10.9)
 */

import { format, formatDistanceStrict, isAfter, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "Europe/London";
  }
}

export function detectLocale(): string {
  try {
    return navigator.language || "en-GB";
  } catch {
    return "en-GB";
  }
}

function uses12h(locale: string): boolean {
  return /^en-US|^en-CA|^es-MX|^es-US/i.test(locale);
}

export function fmtKickoffTime(iso: string, tz: string, locale: string): string {
  const pattern = uses12h(locale) ? "h:mm a" : "HH:mm";
  return formatInTimeZone(parseISO(iso), tz, pattern);
}

export function fmtKickoffDate(iso: string, tz: string): string {
  return formatInTimeZone(parseISO(iso), tz, "EEE d MMM");
}

export function fmtKickoffFull(iso: string, tz: string, locale: string): string {
  const d = fmtKickoffDate(iso, tz);
  const t = fmtKickoffTime(iso, tz, locale);
  return `${d} · ${t} local`;
}

export function fmtCountdownToKickoff(iso: string): string {
  const now = new Date();
  const target = parseISO(iso);
  if (!isAfter(target, now)) return "Kickoff";
  return formatDistanceStrict(target, now, { addSuffix: false });
}

export function isKickoffSoon(iso: string, minMinutes = 15): boolean {
  const diff = parseISO(iso).getTime() - Date.now();
  return diff > 0 && diff <= minMinutes * 60_000;
}

export function fmtClock(secondsRemaining: number): string {
  const s = Math.max(0, secondsRemaining);
  return s.toFixed(1);
}

export { format };
