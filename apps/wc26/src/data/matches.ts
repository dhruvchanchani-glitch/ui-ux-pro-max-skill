/*
 * Mock WC26 fixtures. ISO-8601 UTC timestamps so the renderer can
 * convert into the user's local timezone via lib/time.
 */

export type MatchStatus = "upcoming" | "live" | "finished";

export type Match = {
  id: string;
  /** UTC kickoff (ISO-8601). */
  kickoff: string;
  home: string; // nation code
  away: string;
  homeScore?: number;
  awayScore?: number;
  /** Minute clock for live matches. */
  minute?: number;
  status: MatchStatus;
  stage: "Group A" | "Group B" | "Group C" | "Group D" | "Group E" | "Group F" | "Group G" | "Group H" | "R16" | "QF" | "SF" | "F";
  venue: string;
  city: string;
};

const now = Date.now();
const days = (n: number) => new Date(now + n * 86_400_000).toISOString();
const hoursAgo = (n: number) => new Date(now - n * 3_600_000).toISOString();

export const MATCHES: Match[] = [
  {
    id: "m_por_cod",
    kickoff: days(2),
    home: "POR",
    away: "COD",
    status: "upcoming",
    stage: "Group H",
    venue: "MetLife Stadium",
    city: "New Jersey",
  },
  {
    id: "m_bra_por",
    kickoff: hoursAgo(0.2),
    home: "BRA",
    away: "POR",
    homeScore: 2,
    awayScore: 1,
    minute: 74,
    status: "live",
    stage: "QF",
    venue: "Lusail Iconic",
    city: "Lusail",
  },
  {
    id: "m_arg_mex",
    kickoff: days(1),
    home: "ARG",
    away: "MEX",
    status: "upcoming",
    stage: "Group A",
    venue: "SoFi Stadium",
    city: "Los Angeles",
  },
  {
    id: "m_eng_fra",
    kickoff: days(3),
    home: "ENG",
    away: "FRA",
    status: "upcoming",
    stage: "R16",
    venue: "BMO Field",
    city: "Toronto",
  },
  {
    id: "m_ger_jpn",
    kickoff: days(4),
    home: "GER",
    away: "JPN",
    status: "upcoming",
    stage: "Group C",
    venue: "Estadio Azteca",
    city: "Mexico City",
  },
  {
    id: "m_esp_usa",
    kickoff: days(5),
    home: "ESP",
    away: "USA",
    status: "upcoming",
    stage: "R16",
    venue: "Lumen Field",
    city: "Seattle",
  },
  {
    id: "m_ned_kor",
    kickoff: days(2.5),
    home: "NED",
    away: "KOR",
    status: "upcoming",
    stage: "Group F",
    venue: "Levi's Stadium",
    city: "San Francisco",
  },
  {
    id: "m_mar_sen",
    kickoff: days(3.5),
    home: "MAR",
    away: "SEN",
    status: "upcoming",
    stage: "Group D",
    venue: "Hard Rock Stadium",
    city: "Miami",
  },
  {
    id: "m_cro_bel",
    kickoff: days(1.5),
    home: "CRO",
    away: "BEL",
    status: "upcoming",
    stage: "Group E",
    venue: "Mercedes-Benz Stadium",
    city: "Atlanta",
  },
  {
    id: "m_sui_aus",
    kickoff: days(6),
    home: "SUI",
    away: "AUS",
    status: "upcoming",
    stage: "Group G",
    venue: "Lincoln Financial",
    city: "Philadelphia",
  },
  {
    id: "m_uru_col",
    kickoff: days(7),
    home: "URU",
    away: "COL",
    status: "upcoming",
    stage: "QF",
    venue: "AT&T Stadium",
    city: "Dallas",
  },
  {
    id: "m_egy_alg",
    kickoff: days(8),
    home: "EGY",
    away: "ALG",
    status: "upcoming",
    stage: "Group B",
    venue: "Gillette Stadium",
    city: "Boston",
  },
  {
    id: "m_ksa_irn",
    kickoff: hoursAgo(48),
    home: "KSA",
    away: "IRN",
    homeScore: 1,
    awayScore: 1,
    status: "finished",
    stage: "Group H",
    venue: "MetLife Stadium",
    city: "New Jersey",
  },
];

export function findMatch(id: string | undefined): Match | undefined {
  if (!id) return undefined;
  return MATCHES.find((m) => m.id === id);
}

/** Matches relevant to the supported team — drives the home carousel. */
export function matchesForNation(nationCode: string): Match[] {
  const list = MATCHES.filter(
    (m) => m.home === nationCode || m.away === nationCode
  );
  if (list.length > 0) return list;
  // Fallback: show the soonest upcoming so the UI is never empty.
  return MATCHES.slice(0, 4);
}

export function liveMatches(): Match[] {
  return MATCHES.filter((m) => m.status === "live");
}
