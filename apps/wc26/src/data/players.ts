/*
 * Mock player pool used by the auction. The catalogue mixes hand-tuned
 * stars (so the auction always feels "real" with names users recognise)
 * and procedurally-named depth so the pool can sustain multiple sessions.
 *
 * costM is derived from rating per the PRD: €10M floor, €150M ceiling,
 * curved so 95+ players sit near the top end.
 */

export type Position = "GK" | "CB" | "LB" | "RB" | "CDM" | "CM" | "CAM" | "LW" | "RW" | "ST";

export type Player = {
  id: string;
  name: string;
  /** Nation code matching data/nations.ts */
  nation: string;
  club: string;
  /** Two-letter league code; chemistry maths uses this. */
  league: string;
  position: Position;
  rating: number;
  costM: number;
  /** Sub-ratings shown on the auction card. */
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
};

const POSITIONS: Position[] = [
  "GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST",
];

function costFromRating(r: number): number {
  // Cubic curve so 99 → ~150M and 75 → ~10M.
  const t = Math.max(0, Math.min(1, (r - 70) / 30));
  return Math.round((10 + Math.pow(t, 2.6) * 140) / 5) * 5;
}

function statBlock(rating: number, pos: Position) {
  const r = rating;
  const dip = (offset: number) => Math.max(40, Math.min(99, r + offset));
  switch (pos) {
    case "GK":
      return { pac: dip(-30), sho: dip(-35), pas: dip(-10), dri: dip(-15), def: dip(0), phy: dip(-5) };
    case "CB":
      return { pac: dip(-10), sho: dip(-30), pas: dip(-12), dri: dip(-15), def: dip(2), phy: dip(2) };
    case "LB":
    case "RB":
      return { pac: dip(3), sho: dip(-25), pas: dip(-5), dri: dip(-3), def: dip(-2), phy: dip(-3) };
    case "CDM":
      return { pac: dip(-8), sho: dip(-15), pas: dip(-2), dri: dip(-5), def: dip(0), phy: dip(0) };
    case "CM":
      return { pac: dip(-5), sho: dip(-10), pas: dip(2), dri: dip(0), def: dip(-8), phy: dip(-5) };
    case "CAM":
      return { pac: dip(-3), sho: dip(-2), pas: dip(2), dri: dip(3), def: dip(-25), phy: dip(-10) };
    case "LW":
    case "RW":
      return { pac: dip(5), sho: dip(-2), pas: dip(-5), dri: dip(5), def: dip(-30), phy: dip(-10) };
    case "ST":
      return { pac: dip(0), sho: dip(5), pas: dip(-10), dri: dip(0), def: dip(-30), phy: dip(-2) };
  }
}

const stars: Omit<Player, "costM" | "pac" | "sho" | "pas" | "dri" | "def" | "phy">[] = [
  // ====== 95+ tier ======
  { id: "p_mbappe", name: "Kylian Mbappé", nation: "FRA", club: "Real Madrid", league: "ES", position: "ST", rating: 96 },
  { id: "p_haaland", name: "Erling Haaland", nation: "NOR", club: "Man City", league: "EN", position: "ST", rating: 95 },
  { id: "p_bellingham", name: "Jude Bellingham", nation: "ENG", club: "Real Madrid", league: "ES", position: "CAM", rating: 95 },
  { id: "p_vinicius", name: "Vinícius Jr", nation: "BRA", club: "Real Madrid", league: "ES", position: "LW", rating: 95 },
  { id: "p_rodri", name: "Rodri", nation: "ESP", club: "Man City", league: "EN", position: "CDM", rating: 95 },
  // ====== 90-94 tier ======
  { id: "p_yamal", name: "Lamine Yamal", nation: "ESP", club: "Barcelona", league: "ES", position: "RW", rating: 93 },
  { id: "p_musiala", name: "Jamal Musiala", nation: "GER", club: "Bayern Munich", league: "DE", position: "CAM", rating: 93 },
  { id: "p_pedri", name: "Pedri", nation: "ESP", club: "Barcelona", league: "ES", position: "CM", rating: 92 },
  { id: "p_alvarez", name: "Julián Álvarez", nation: "ARG", club: "Atlético Madrid", league: "ES", position: "ST", rating: 92 },
  { id: "p_kane", name: "Harry Kane", nation: "ENG", club: "Bayern Munich", league: "DE", position: "ST", rating: 92 },
  { id: "p_saka", name: "Bukayo Saka", nation: "ENG", club: "Arsenal", league: "EN", position: "RW", rating: 92 },
  { id: "p_foden", name: "Phil Foden", nation: "ENG", club: "Man City", league: "EN", position: "CAM", rating: 91 },
  { id: "p_valverde", name: "Federico Valverde", nation: "URU", club: "Real Madrid", league: "ES", position: "CM", rating: 91 },
  { id: "p_rodrygo", name: "Rodrygo", nation: "BRA", club: "Real Madrid", league: "ES", position: "RW", rating: 90 },
  { id: "p_salah", name: "Mohamed Salah", nation: "EGY", club: "Liverpool", league: "EN", position: "RW", rating: 90 },
  { id: "p_son", name: "Heung-min Son", nation: "KOR", club: "Tottenham", league: "EN", position: "LW", rating: 90 },
  { id: "p_diaz", name: "Luis Díaz", nation: "COL", club: "Liverpool", league: "EN", position: "LW", rating: 90 },
  { id: "p_hakimi", name: "Achraf Hakimi", nation: "MAR", club: "PSG", league: "FR", position: "RB", rating: 90 },
  { id: "p_vandijk", name: "Virgil van Dijk", nation: "NED", club: "Liverpool", league: "EN", position: "CB", rating: 90 },
  { id: "p_dembele", name: "Ousmane Dembélé", nation: "FRA", club: "PSG", league: "FR", position: "RW", rating: 90 },
  // ====== 85-89 tier ======
  { id: "p_almada", name: "Thiago Almada", nation: "ARG", club: "Botafogo", league: "BR", position: "CAM", rating: 88 },
  { id: "p_camavinga", name: "Eduardo Camavinga", nation: "FRA", club: "Real Madrid", league: "ES", position: "CM", rating: 88 },
  { id: "p_neves", name: "Rúben Neves", nation: "POR", club: "Al-Hilal", league: "SA", position: "CDM", rating: 87 },
  { id: "p_bruno", name: "Bruno Fernandes", nation: "POR", club: "Man United", league: "EN", position: "CAM", rating: 88 },
  { id: "p_bernardo", name: "Bernardo Silva", nation: "POR", club: "Man City", league: "EN", position: "CAM", rating: 88 },
  { id: "p_leao", name: "Rafael Leão", nation: "POR", club: "AC Milan", league: "IT", position: "LW", rating: 88 },
  { id: "p_dias", name: "Rúben Dias", nation: "POR", club: "Man City", league: "EN", position: "CB", rating: 89 },
  { id: "p_kvara", name: "Khvicha Kvaratskhelia", nation: "GEO", club: "PSG", league: "FR", position: "LW", rating: 88 },
  { id: "p_oblak", name: "Jan Oblak", nation: "SLO", club: "Atlético Madrid", league: "ES", position: "GK", rating: 88 },
  { id: "p_courtois", name: "Thibaut Courtois", nation: "BEL", club: "Real Madrid", league: "ES", position: "GK", rating: 89 },
  { id: "p_dimaria", name: "Ángel Di María", nation: "ARG", club: "Benfica", league: "PT", position: "RW", rating: 86 },
  { id: "p_emiliano", name: "Emiliano Martínez", nation: "ARG", club: "Aston Villa", league: "EN", position: "GK", rating: 88 },
  { id: "p_messi", name: "Lionel Messi", nation: "ARG", club: "Inter Miami", league: "US", position: "RW", rating: 89 },
  { id: "p_neymar", name: "Neymar Jr", nation: "BRA", club: "Santos", league: "BR", position: "LW", rating: 86 },
  { id: "p_kimmich", name: "Joshua Kimmich", nation: "GER", club: "Bayern Munich", league: "DE", position: "CM", rating: 88 },
  { id: "p_wirtz", name: "Florian Wirtz", nation: "GER", club: "Liverpool", league: "EN", position: "CAM", rating: 89 },
  { id: "p_kudus", name: "Mohammed Kudus", nation: "GHA", club: "Tottenham", league: "EN", position: "RW", rating: 86 },
  { id: "p_pulisic", name: "Christian Pulisic", nation: "USA", club: "AC Milan", league: "IT", position: "LW", rating: 86 },
  { id: "p_modric", name: "Luka Modrić", nation: "CRO", club: "Milan", league: "IT", position: "CM", rating: 85 },
  { id: "p_alphonso", name: "Alphonso Davies", nation: "CAN", club: "Real Madrid", league: "ES", position: "LB", rating: 86 },
  { id: "p_caicedo", name: "Moisés Caicedo", nation: "ECU", club: "Chelsea", league: "EN", position: "CDM", rating: 85 },
  { id: "p_isak", name: "Alexander Isak", nation: "SWE", club: "Liverpool", league: "EN", position: "ST", rating: 87 },
  { id: "p_gakpo", name: "Cody Gakpo", nation: "NED", club: "Liverpool", league: "EN", position: "LW", rating: 86 },
  { id: "p_xhaka", name: "Granit Xhaka", nation: "SUI", club: "Leverkusen", league: "DE", position: "CM", rating: 85 },
  { id: "p_mctominay", name: "Scott McTominay", nation: "SCO", club: "Napoli", league: "IT", position: "CM", rating: 85 },
  { id: "p_endo", name: "Wataru Endo", nation: "JPN", club: "Liverpool", league: "EN", position: "CDM", rating: 84 },
  { id: "p_kubo", name: "Takefusa Kubo", nation: "JPN", club: "Real Sociedad", league: "ES", position: "RW", rating: 85 },
  { id: "p_mahrez", name: "Riyad Mahrez", nation: "ALG", club: "Al-Ahli", league: "SA", position: "RW", rating: 84 },
  { id: "p_giménez", name: "Santiago Giménez", nation: "MEX", club: "AC Milan", league: "IT", position: "ST", rating: 84 },
  // ====== 80-84 depth ======
  { id: "p_ronaldo", name: "Cristiano Ronaldo", nation: "POR", club: "Al-Nassr", league: "SA", position: "ST", rating: 87 },
  { id: "p_lewa", name: "Robert Lewandowski", nation: "POL", club: "Barcelona", league: "ES", position: "ST", rating: 87 },
  { id: "p_szczesny", name: "Wojciech Szczęsny", nation: "POL", club: "Barcelona", league: "ES", position: "GK", rating: 84 },
  { id: "p_szoboszlai", name: "Dominik Szoboszlai", nation: "HUN", club: "Liverpool", league: "EN", position: "CM", rating: 84 },
  { id: "p_grimaldo", name: "Álex Grimaldo", nation: "ESP", club: "Leverkusen", league: "DE", position: "LB", rating: 84 },
  { id: "p_carvajal", name: "Dani Carvajal", nation: "ESP", club: "Real Madrid", league: "ES", position: "RB", rating: 86 },
  { id: "p_lemar", name: "Thomas Lemar", nation: "FRA", club: "Atlético Madrid", league: "ES", position: "CAM", rating: 82 },
  { id: "p_olise", name: "Michael Olise", nation: "FRA", club: "Bayern Munich", league: "DE", position: "RW", rating: 86 },
  { id: "p_konate", name: "Ibrahima Konaté", nation: "FRA", club: "Liverpool", league: "EN", position: "CB", rating: 84 },
  { id: "p_saliba", name: "William Saliba", nation: "FRA", club: "Arsenal", league: "EN", position: "CB", rating: 87 },
  { id: "p_rice", name: "Declan Rice", nation: "ENG", club: "Arsenal", league: "EN", position: "CDM", rating: 88 },
  { id: "p_pickford", name: "Jordan Pickford", nation: "ENG", club: "Everton", league: "EN", position: "GK", rating: 84 },
  { id: "p_stones", name: "John Stones", nation: "ENG", club: "Man City", league: "EN", position: "CB", rating: 86 },
  { id: "p_walker", name: "Kyle Walker", nation: "ENG", club: "Burnley", league: "EN", position: "RB", rating: 83 },
  { id: "p_eze", name: "Eberechi Eze", nation: "ENG", club: "Arsenal", league: "EN", position: "CAM", rating: 84 },
  { id: "p_palmer", name: "Cole Palmer", nation: "ENG", club: "Chelsea", league: "EN", position: "CAM", rating: 87 },
  { id: "p_mainoo", name: "Kobbie Mainoo", nation: "ENG", club: "Man United", league: "EN", position: "CM", rating: 82 },
  { id: "p_mendes", name: "Nuno Mendes", nation: "POR", club: "PSG", league: "FR", position: "LB", rating: 85 },
  { id: "p_cancelo", name: "João Cancelo", nation: "POR", club: "Al-Hilal", league: "SA", position: "RB", rating: 84 },
  { id: "p_diogoj", name: "Diogo Jota", nation: "POR", club: "Liverpool", league: "EN", position: "LW", rating: 85 },
  { id: "p_paqueta", name: "Lucas Paquetá", nation: "BRA", club: "West Ham", league: "EN", position: "CAM", rating: 84 },
  { id: "p_endrick", name: "Endrick", nation: "BRA", club: "Real Madrid", league: "ES", position: "ST", rating: 82 },
  { id: "p_militão", name: "Éder Militão", nation: "BRA", club: "Real Madrid", league: "ES", position: "CB", rating: 84 },
  { id: "p_marquinhos", name: "Marquinhos", nation: "BRA", club: "PSG", league: "FR", position: "CB", rating: 86 },
  { id: "p_alisson", name: "Alisson", nation: "BRA", club: "Liverpool", league: "EN", position: "GK", rating: 88 },
  { id: "p_alphonso2", name: "Jonathan David", nation: "CAN", club: "Lille", league: "FR", position: "ST", rating: 84 },
  { id: "p_lozano", name: "Hirving Lozano", nation: "MEX", club: "PSV", league: "NL", position: "LW", rating: 81 },
  { id: "p_ochoa", name: "Guillermo Ochoa", nation: "MEX", club: "AVS", league: "PT", position: "GK", rating: 78 },
  { id: "p_jorginho", name: "Jorginho", nation: "ITA", club: "Arsenal", league: "EN", position: "CDM", rating: 82 },
  { id: "p_donnarumma", name: "Gianluigi Donnarumma", nation: "ITA", club: "PSG", league: "FR", position: "GK", rating: 88 },
  { id: "p_dembele2", name: "Moussa Diaby", nation: "FRA", club: "Al-Ittihad", league: "SA", position: "RW", rating: 82 },
  { id: "p_neves2", name: "João Neves", nation: "POR", club: "PSG", league: "FR", position: "CM", rating: 85 },
  { id: "p_diasf", name: "João Félix", nation: "POR", club: "Chelsea", league: "EN", position: "CAM", rating: 82 },
  { id: "p_pedrog", name: "Pedro Gonçalves", nation: "POR", club: "Sporting", league: "PT", position: "RW", rating: 82 },
  { id: "p_almiron", name: "Miguel Almirón", nation: "PAR", club: "Atlanta United", league: "US", position: "RW", rating: 79 },
  { id: "p_omari", name: "Sofyan Amrabat", nation: "MAR", club: "Fenerbahçe", league: "TR", position: "CDM", rating: 81 },
  { id: "p_bounou", name: "Yassine Bounou", nation: "MAR", club: "Al-Hilal", league: "SA", position: "GK", rating: 84 },
  { id: "p_zniti", name: "Achraf Bencharki", nation: "MAR", club: "Wydad", league: "MA", position: "ST", rating: 76 },
  { id: "p_mané", name: "Sadio Mané", nation: "SEN", club: "Al-Nassr", league: "SA", position: "LW", rating: 84 },
  { id: "p_koulibaly", name: "Kalidou Koulibaly", nation: "SEN", club: "Al-Hilal", league: "SA", position: "CB", rating: 83 },
  { id: "p_mendy", name: "Édouard Mendy", nation: "SEN", club: "Al-Ahli", league: "SA", position: "GK", rating: 82 },
  { id: "p_pavard", name: "Benjamin Pavard", nation: "FRA", club: "Inter", league: "IT", position: "CB", rating: 84 },
  { id: "p_griezmann", name: "Antoine Griezmann", nation: "FRA", club: "Atlético Madrid", league: "ES", position: "CAM", rating: 85 },
  { id: "p_thuram", name: "Marcus Thuram", nation: "FRA", club: "Inter", league: "IT", position: "ST", rating: 85 },
  { id: "p_zinch", name: "Oleksandr Zinchenko", nation: "UKR", club: "Arsenal", league: "EN", position: "LB", rating: 82 },
  { id: "p_dovbyk", name: "Artem Dovbyk", nation: "UKR", club: "Roma", league: "IT", position: "ST", rating: 82 },
  { id: "p_mudryk", name: "Mykhailo Mudryk", nation: "UKR", club: "Chelsea", league: "EN", position: "LW", rating: 80 },
];

function expandWithStats(p: typeof stars[number]): Player {
  return {
    ...p,
    costM: costFromRating(p.rating),
    ...statBlock(p.rating, p.position),
  };
}

export const PLAYERS: Player[] = stars.map(expandWithStats);

export function playersForNation(code: string): Player[] {
  return PLAYERS.filter((p) => p.nation === code);
}

export function findPlayer(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

/** Counts per position, scaled by team count. PRD §FR-AUC-9. */
export function getPositionCounts(teamCount: number): Record<Position, number> {
  const base: Record<Position, number> = {
    GK: 2,
    CB: 4,
    LB: 2,
    RB: 2,
    CDM: 3,
    CM: 3,
    CAM: 3,
    LW: 3,
    RW: 3,
    ST: 3,
  };
  const mult = Math.max(1, teamCount / 2);
  return Object.fromEntries(
    POSITIONS.map((pos) => [pos, Math.round(base[pos] * mult)])
  ) as Record<Position, number>;
}

/** Cheap deterministic 32-bit hash for seed generation. */
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded PRNG so the auction pool is reproducible per room. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Build an auction pool deterministically from `roomId`. Players are
 * tier-shuffled per PRD §FR-AUC-10 so elites are interleaved instead of
 * appearing back-to-back.
 */
export function generateAuctionPool(
  roomId: string,
  teamCount: number,
  nationFilter?: string
): Player[] {
  const rand = mulberry32(hashSeed(roomId));
  let pool = nationFilter
    ? PLAYERS.filter((p) => p.nation === nationFilter)
    : PLAYERS;
  // Fallback to the full pool if the filter is too sparse.
  if (pool.length < 18) pool = PLAYERS;

  const tiers = {
    elite: pool.filter((p) => p.rating >= 95),
    great: pool.filter((p) => p.rating >= 90 && p.rating < 95),
    good: pool.filter((p) => p.rating >= 85 && p.rating < 90),
    rest: pool.filter((p) => p.rating < 85),
  };
  const shuffled = {
    elite: shuffle(tiers.elite, rand),
    great: shuffle(tiers.great, rand),
    good: shuffle(tiers.good, rand),
    rest: shuffle(tiers.rest, rand),
  };

  const counts = getPositionCounts(teamCount);
  const total =
    Object.values(counts).reduce((a, b) => a + b, 0);

  // Interleave tiers so 95+ players don't all show up first.
  const ordered: Player[] = [];
  let i = 0;
  while (ordered.length < total) {
    const bucket =
      i % 4 === 0
        ? shuffled.elite
        : i % 4 === 1
          ? shuffled.great
          : i % 4 === 2
            ? shuffled.good
            : shuffled.rest;
    const next = bucket.shift();
    if (next && !ordered.includes(next)) ordered.push(next);
    i++;
    // Avoid infinite loop on small pools.
    if (i > 1000) break;
  }
  return ordered;
}
