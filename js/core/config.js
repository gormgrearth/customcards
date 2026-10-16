/** Constantes : dimensions de la carte, polices, couleurs, clés de stockage. */
export const W = 750;

export const H = 1050;

export const FONT_GROUPS = [
  [
    "Cyberpunk & techno",
    [
      "Orbitron",
      "Chakra Petch",
      "Rajdhani",
      "Share Tech Mono",
      "Exo 2",
      "Audiowide",
      "Michroma",
      "Russo One",
      "Space Grotesk",
      "Zen Dots",
      "Black Ops One",
    ],
  ],
  [
    "Modernes & sans-serif",
    [
      "Inter",
      "Montserrat",
      "Poppins",
      "Barlow",
      "Oswald",
      "Bebas Neue",
      "Roboto Condensed",
      "Playfair Display",
    ],
  ],
  [
    "Médiéval & fantasy",
    [
      "Cinzel",
      "Cinzel Decorative",
      "MedievalSharp",
      "Germania One",
      "Pirata One",
      "Uncial Antiqua",
      "Almendra",
      "Metamorphous",
      "Eagle Lake",
      "IM Fell English SC",
    ],
  ],
  [
    "Rétro & manuscrit",
    [
      "Special Elite",
      "Courier Prime",
      "VT323",
      "Press Start 2P",
      "Bungee",
      "Righteous",
      "Abril Fatface",
      "Permanent Marker",
      "Caveat",
      "Rye",
      "Sancreek",
      "Fredericka the Great",
      "Shrikhand",
      "Lobster",
      "Bangers",
    ],
  ],
  [
    "Horreur & gothique",
    [
      "Creepster",
      "Butcherman",
      "Eater",
      "Metal Mania",
      "Jolly Lodger",
      "Nosifer",
      "Grenze Gotisch",
      "Cutive Mono",
      "Cormorant Garamond",
    ],
  ],
];

export const FONTS = FONT_GROUPS.flatMap((g) => g[1]);

const NOBOLD = new Set([
  "Bebas Neue",
  "Share Tech Mono",
  "Special Elite",
  "Audiowide",
  "Michroma",
  "Russo One",
  "MedievalSharp",
  "Pirata One",
  "Uncial Antiqua",
  "Metamorphous",
  "Eagle Lake",
  "IM Fell English SC",
  "VT323",
  "Press Start 2P",
  "Bungee",
  "Righteous",
  "Abril Fatface",
  "Permanent Marker",
  "Zen Dots",
  "Black Ops One",
  "Germania One",
  "Rye",
  "Sancreek",
  "Fredericka the Great",
  "Shrikhand",
  "Lobster",
  "Bangers",
  "Creepster",
  "Butcherman",
  "Eater",
  "Metal Mania",
  "Jolly Lodger",
  "Nosifer",
  "Cutive Mono",
]);

export const fw = (f, w) => (NOBOLD.has(f) ? 400 : w);

export const ff = (f) => `"${f}",system-ui,sans-serif`;

export const COLORS = [
  "#FF3D00",
  "#FF2D95",
  "#FFE600",
  "#39FF14",
  "#00F0FF",
  "#B84DFF",
  "#FFFFFF",
  "#4DA3FF",
];

export const LEGACY = { anarchy: "rue", cyberpunk: "chrome" };

export const OLD_TITLES = ["SHADOWRUN ANARCHY", "CYBERPUNK RED", "FICHE PNJ"];

export const KEYS = {
  theme: "npcTheme",
  title: "npcTitle",
  name: "npcName",
  role: "npcRole",
  tag: "npcTag",
  desc: "npcDesc",
  status: "npcStatus",
  fontT: "fontT",
  fontB: "fontB",
  idStr: "npcId",
};
