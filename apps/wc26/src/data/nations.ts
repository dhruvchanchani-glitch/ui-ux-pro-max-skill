/*
 * All 47 nations supported at onboarding.
 *
 * Each nation generates exactly five tokens per PRD §Appendix C:
 *   - primary       — strongest flag/kit colour
 *   - secondary     — cleanest neutral / contrast
 *   - accent        — rarest flag colour, used sparingly
 *   - onPrimary     — text colour that meets 4.5:1 on primary
 *   - ink           — primary darkened ~25% lightness, used for AA
 *                     headlines on the bone canvas
 *
 * The six worked examples from the PRD (Brazil, Argentina, England,
 * Portugal, France, Japan) are reproduced verbatim. The other 41 use
 * the deterministic rule above; we verify all 47 with
 * lib/contrastLint.ts so anything that drifts below AA gets caught.
 */

export type NationTheme = {
  primary: string;
  secondary: string;
  accent: string;
  onPrimary: string;
  ink: string;
};

export type Nation = {
  code: string;
  name: string;
  /** Short label for tight UI surfaces, e.g. live score strip. */
  shortCode: string;
  /** Star player rendered into the home identity hero. */
  heroPlayer: string;
  theme: NationTheme;
};

export const NATIONS: Nation[] = [
  {
    code: "ARG",
    name: "Argentina",
    shortCode: "ARG",
    heroPlayer: "Lionel Messi",
    theme: {
      primary: "#75AADB",
      secondary: "#FFFFFF",
      accent: "#F6B40E",
      onPrimary: "#0A2540",
      ink: "#1E3A8A",
    },
  },
  {
    code: "AUS",
    name: "Australia",
    shortCode: "AUS",
    heroPlayer: "Mathew Ryan",
    theme: {
      primary: "#00247D",
      secondary: "#FFFFFF",
      accent: "#E4002B",
      onPrimary: "#FFFFFF",
      ink: "#0A153F",
    },
  },
  {
    code: "AUT",
    name: "Austria",
    shortCode: "AUT",
    heroPlayer: "David Alaba",
    theme: {
      primary: "#C8102E",
      secondary: "#FFFFFF",
      accent: "#0A0A0B",
      onPrimary: "#FFFFFF",
      ink: "#600816",
    },
  },
  {
    code: "ALG",
    name: "Algeria",
    shortCode: "ALG",
    heroPlayer: "Riyad Mahrez",
    theme: {
      primary: "#006233",
      secondary: "#FFFFFF",
      accent: "#D21034",
      onPrimary: "#FFFFFF",
      ink: "#012B15",
    },
  },
  {
    code: "BEL",
    name: "Belgium",
    shortCode: "BEL",
    heroPlayer: "Kevin De Bruyne",
    theme: {
      primary: "#0A0A0B",
      secondary: "#FAE042",
      accent: "#EF3340",
      onPrimary: "#FAE042",
      ink: "#0A0A0B",
    },
  },
  {
    code: "BIH",
    name: "Bosnia & Herzegovina",
    shortCode: "BIH",
    heroPlayer: "Edin Džeko",
    theme: {
      primary: "#002F6C",
      secondary: "#FECB00",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#001533",
    },
  },
  {
    code: "BRA",
    name: "Brazil",
    shortCode: "BRA",
    heroPlayer: "Vinícius Jr",
    theme: {
      // PRD §C lists #009C3B; that fails AA against white. Deepened to
      // the kit green of the CBF away strip so onPrimary stays white.
      primary: "#007A2E",
      secondary: "#FFDF00",
      accent: "#002776",
      onPrimary: "#FFFFFF",
      ink: "#003D17",
    },
  },
  {
    code: "CAN",
    name: "Canada",
    shortCode: "CAN",
    heroPlayer: "Alphonso Davies",
    theme: {
      primary: "#D52B1E",
      secondary: "#FFFFFF",
      accent: "#0A0A0B",
      onPrimary: "#FFFFFF",
      ink: "#5F0E08",
    },
  },
  {
    code: "CPV",
    name: "Cape Verde",
    shortCode: "CPV",
    heroPlayer: "Ryan Mendes",
    theme: {
      primary: "#003893",
      secondary: "#FFFFFF",
      accent: "#CF2027",
      onPrimary: "#FFFFFF",
      ink: "#001A4A",
    },
  },
  {
    code: "COL",
    name: "Colombia",
    shortCode: "COL",
    heroPlayer: "Luis Díaz",
    theme: {
      primary: "#FCD116",
      secondary: "#003893",
      accent: "#CE1126",
      onPrimary: "#0A0A0B",
      ink: "#705900",
    },
  },
  {
    code: "COD",
    name: "Congo DR",
    shortCode: "COD",
    heroPlayer: "Cédric Bakambu",
    theme: {
      primary: "#0062C7",
      secondary: "#F7D618",
      accent: "#CE1021",
      onPrimary: "#FFFFFF",
      ink: "#003B7A",
    },
  },
  {
    code: "CRO",
    name: "Croatia",
    shortCode: "CRO",
    heroPlayer: "Luka Modrić",
    theme: {
      // Authentic Croatia flag red (Pantone 186 C), not generic #FF0000.
      primary: "#C8102E",
      secondary: "#FFFFFF",
      accent: "#171796",
      onPrimary: "#FFFFFF",
      ink: "#5C0815",
    },
  },
  {
    code: "CUW",
    name: "Curaçao",
    shortCode: "CUW",
    heroPlayer: "Leandro Bacuna",
    theme: {
      primary: "#002B7F",
      secondary: "#F9E814",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#00133D",
    },
  },
  {
    code: "CZE",
    name: "Czechia",
    shortCode: "CZE",
    heroPlayer: "Patrik Schick",
    theme: {
      primary: "#D7141A",
      secondary: "#FFFFFF",
      accent: "#11457E",
      onPrimary: "#FFFFFF",
      ink: "#660A0D",
    },
  },
  {
    code: "ECU",
    name: "Ecuador",
    shortCode: "ECU",
    heroPlayer: "Moisés Caicedo",
    theme: {
      primary: "#FFDD00",
      secondary: "#034EA2",
      accent: "#ED1C24",
      onPrimary: "#0A0A0B",
      ink: "#705F00",
    },
  },
  {
    code: "EGY",
    name: "Egypt",
    shortCode: "EGY",
    heroPlayer: "Mohamed Salah",
    theme: {
      primary: "#CE1126",
      secondary: "#FFFFFF",
      accent: "#0A0A0B",
      onPrimary: "#FFFFFF",
      ink: "#62080F",
    },
  },
  {
    code: "ENG",
    name: "England",
    shortCode: "ENG",
    heroPlayer: "Jude Bellingham",
    theme: {
      primary: "#FFFFFF",
      secondary: "#CE1124",
      accent: "#00247D",
      onPrimary: "#0A0A0B",
      ink: "#7F1D1D",
    },
  },
  {
    code: "FRA",
    name: "France",
    shortCode: "FRA",
    heroPlayer: "Kylian Mbappé",
    theme: {
      primary: "#0055A4",
      secondary: "#FFFFFF",
      accent: "#EF4135",
      onPrimary: "#FFFFFF",
      ink: "#001F4D",
    },
  },
  {
    code: "GER",
    name: "Germany",
    shortCode: "GER",
    heroPlayer: "Jamal Musiala",
    theme: {
      primary: "#0A0A0B",
      secondary: "#DD0000",
      accent: "#FFCE00",
      onPrimary: "#FFCE00",
      ink: "#0A0A0B",
    },
  },
  {
    code: "GHA",
    name: "Ghana",
    shortCode: "GHA",
    heroPlayer: "Mohammed Kudus",
    theme: {
      primary: "#CE1126",
      secondary: "#FCD116",
      accent: "#006B3F",
      onPrimary: "#FFFFFF",
      ink: "#5F0810",
    },
  },
  {
    code: "HAI",
    name: "Haiti",
    shortCode: "HAI",
    heroPlayer: "Duckens Nazon",
    theme: {
      primary: "#00209F",
      secondary: "#D21034",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#000D4A",
    },
  },
  {
    code: "IRN",
    name: "Iran",
    shortCode: "IRN",
    heroPlayer: "Sardar Azmoun",
    theme: {
      primary: "#1A7A30",
      secondary: "#FFFFFF",
      accent: "#DA0000",
      onPrimary: "#FFFFFF",
      ink: "#0E4A1D",
    },
  },
  {
    code: "IRQ",
    name: "Iraq",
    shortCode: "IRQ",
    heroPlayer: "Aymen Hussein",
    theme: {
      primary: "#CE1126",
      secondary: "#FFFFFF",
      accent: "#0A0A0B",
      onPrimary: "#FFFFFF",
      ink: "#62080F",
    },
  },
  {
    code: "JPN",
    name: "Japan",
    shortCode: "JPN",
    heroPlayer: "Takefusa Kubo",
    theme: {
      primary: "#0B1E5B",
      secondary: "#FFFFFF",
      accent: "#BC002D",
      onPrimary: "#FFFFFF",
      ink: "#050E2E",
    },
  },
  {
    code: "JOR",
    name: "Jordan",
    shortCode: "JOR",
    heroPlayer: "Musa Al-Tamari",
    theme: {
      primary: "#0A0A0B",
      secondary: "#FFFFFF",
      accent: "#007A3D",
      onPrimary: "#FFFFFF",
      ink: "#0A0A0B",
    },
  },
  {
    code: "KOR",
    name: "South Korea",
    shortCode: "KOR",
    heroPlayer: "Heung-min Son",
    theme: {
      primary: "#FFFFFF",
      secondary: "#CD2E3A",
      accent: "#0047A0",
      onPrimary: "#0A0A0B",
      ink: "#641620",
    },
  },
  {
    code: "MEX",
    name: "Mexico",
    shortCode: "MEX",
    heroPlayer: "Santiago Giménez",
    theme: {
      primary: "#006847",
      secondary: "#FFFFFF",
      accent: "#CE1126",
      onPrimary: "#FFFFFF",
      ink: "#002D1F",
    },
  },
  {
    code: "MAR",
    name: "Morocco",
    shortCode: "MAR",
    heroPlayer: "Achraf Hakimi",
    theme: {
      primary: "#C1272D",
      secondary: "#006233",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#5E1316",
    },
  },
  {
    code: "NED",
    name: "Netherlands",
    shortCode: "NED",
    heroPlayer: "Cody Gakpo",
    theme: {
      primary: "#FF6C0E",
      secondary: "#FFFFFF",
      accent: "#21468B",
      onPrimary: "#0A0A0B",
      ink: "#7A3206",
    },
  },
  {
    code: "NZL",
    name: "New Zealand",
    shortCode: "NZL",
    heroPlayer: "Chris Wood",
    theme: {
      primary: "#00247D",
      secondary: "#FFFFFF",
      accent: "#CC142B",
      onPrimary: "#FFFFFF",
      ink: "#00113D",
    },
  },
  {
    code: "NOR",
    name: "Norway",
    shortCode: "NOR",
    heroPlayer: "Erling Haaland",
    theme: {
      primary: "#BA0C2F",
      secondary: "#00205B",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#5A0617",
    },
  },
  {
    code: "PAN",
    name: "Panama",
    shortCode: "PAN",
    heroPlayer: "Aníbal Godoy",
    theme: {
      primary: "#DA121A",
      secondary: "#005AA7",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#69080E",
    },
  },
  {
    code: "PAR",
    name: "Paraguay",
    shortCode: "PAR",
    heroPlayer: "Miguel Almirón",
    theme: {
      primary: "#D52B1E",
      secondary: "#FFFFFF",
      accent: "#0038A8",
      onPrimary: "#FFFFFF",
      ink: "#5F0E08",
    },
  },
  {
    code: "POR",
    name: "Portugal",
    shortCode: "POR",
    heroPlayer: "Cristiano Ronaldo",
    theme: {
      primary: "#046A38",
      secondary: "#DA291C",
      accent: "#FFD100",
      onPrimary: "#FFFFFF",
      ink: "#052E1A",
    },
  },
  {
    code: "QAT",
    name: "Qatar",
    shortCode: "QAT",
    heroPlayer: "Akram Afif",
    theme: {
      primary: "#8A1538",
      secondary: "#FFFFFF",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#420A1B",
    },
  },
  {
    code: "KSA",
    name: "Saudi Arabia",
    shortCode: "KSA",
    heroPlayer: "Salem Al-Dawsari",
    theme: {
      primary: "#006C35",
      secondary: "#FFFFFF",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#00301A",
    },
  },
  {
    code: "SCO",
    name: "Scotland",
    shortCode: "SCO",
    heroPlayer: "Scott McTominay",
    theme: {
      primary: "#005EB8",
      secondary: "#FFFFFF",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#002952",
    },
  },
  {
    code: "SEN",
    name: "Senegal",
    shortCode: "SEN",
    heroPlayer: "Sadio Mané",
    theme: {
      primary: "#00853F",
      secondary: "#FDEF42",
      accent: "#E31B23",
      onPrimary: "#FFFFFF",
      ink: "#003A1B",
    },
  },
  {
    code: "RSA",
    name: "South Africa",
    shortCode: "RSA",
    heroPlayer: "Percy Tau",
    theme: {
      primary: "#007749",
      secondary: "#FFB81C",
      accent: "#0A0A0B",
      onPrimary: "#FFFFFF",
      ink: "#00351F",
    },
  },
  {
    code: "ESP",
    name: "Spain",
    shortCode: "ESP",
    heroPlayer: "Lamine Yamal",
    theme: {
      primary: "#AA151B",
      secondary: "#F1BF00",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#530B0D",
    },
  },
  {
    code: "SWE",
    name: "Sweden",
    shortCode: "SWE",
    heroPlayer: "Alexander Isak",
    theme: {
      primary: "#006AA7",
      secondary: "#FECC02",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#002F4A",
    },
  },
  {
    code: "SUI",
    name: "Switzerland",
    shortCode: "SUI",
    heroPlayer: "Granit Xhaka",
    theme: {
      primary: "#D52B1E",
      secondary: "#FFFFFF",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#5F0E08",
    },
  },
  {
    code: "TUN",
    name: "Tunisia",
    shortCode: "TUN",
    heroPlayer: "Hannibal Mejbri",
    theme: {
      primary: "#E70013",
      secondary: "#FFFFFF",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#6E0009",
    },
  },
  {
    code: "TUR",
    name: "Türkiye",
    shortCode: "TUR",
    heroPlayer: "Arda Güler",
    theme: {
      primary: "#E30A17",
      secondary: "#FFFFFF",
      accent: "#FFFFFF",
      onPrimary: "#FFFFFF",
      ink: "#6E0509",
    },
  },
  {
    code: "URU",
    name: "Uruguay",
    shortCode: "URU",
    heroPlayer: "Federico Valverde",
    theme: {
      primary: "#0038A8",
      secondary: "#FFFFFF",
      accent: "#FCD116",
      onPrimary: "#FFFFFF",
      ink: "#001A52",
    },
  },
  {
    code: "USA",
    name: "USA",
    shortCode: "USA",
    heroPlayer: "Christian Pulisic",
    theme: {
      primary: "#B22234",
      secondary: "#FFFFFF",
      accent: "#3C3B6E",
      onPrimary: "#FFFFFF",
      ink: "#55101A",
    },
  },
  {
    code: "UZB",
    name: "Uzbekistan",
    shortCode: "UZB",
    heroPlayer: "Eldor Shomurodov",
    theme: {
      primary: "#147A28",
      secondary: "#FFFFFF",
      accent: "#0099B5",
      onPrimary: "#FFFFFF",
      ink: "#0D571B",
    },
  },
];

export const NATIONS_BY_CODE = Object.fromEntries(
  NATIONS.map((n) => [n.code, n])
) as Record<string, Nation>;

export function findNation(code: string | undefined): Nation | undefined {
  if (!code) return undefined;
  return NATIONS_BY_CODE[code.toUpperCase()];
}
