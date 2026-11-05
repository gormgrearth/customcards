/**
 * Bibliothèque d'anneaux de token : un anneau par thème de carte (62), plus quelques anneaux « libres ».
 *
 * - Les anneaux sont dessinés dans js/token/rings/<catégorie>.js (mêmes catégories que les thèmes de carte).
 *   Chaque entrée : { label, thickness (fraction de la largeur du token), accent?, draw(c, g, acc) }.
 *   `accent: true` = la couleur d'accent de la carte est déjà bien visible dans l'anneau ; sinon un fin liseré
 *   à cette couleur est ajouté automatiquement (cf. render.js).
 * - Valeur « auto » (par défaut) : l'anneau suit le thème de la carte (BY_THEME). Choisir un anneau précis
 *   le rend indépendant du thème de la carte.
 * - Pour ajouter un anneau : une entrée dans le fichier de sa catégorie (+ BY_THEME ci-dessous pour le proposer à un thème).
 */
import { THEMES } from "../themes/meta.js";
import { CYBER } from "./rings/cyber.js";
import { MEDIEVAL } from "./rings/medieval.js";
import { FANTASY } from "./rings/fantasy.js";
import { MODERN } from "./rings/modern.js";
import { FUTURE } from "./rings/future.js";
import { RETRO } from "./rings/retro.js";
import { HORROR } from "./rings/horror.js";

export const AUTO_RING = "auto";
export const DEFAULT_RING = AUTO_RING;
const FALLBACK_RING = "cyber-metal";

const GROUPS = [
  ["Cyberpunk & néon", CYBER],
  ["Médiéval", MEDIEVAL],
  ["Fantastique", FANTASY],
  ["Contemporain", MODERN],
  ["Futuriste", FUTURE],
  ["Rétro", RETRO],
  ["Horreur", HORROR],
];

export const RINGS = Object.fromEntries(
  GROUPS.flatMap(([cat, set]) =>
    Object.entries(set).map(([id, r]) => [id, { cat, ...r }]),
  ),
);

/** Catégories dans l'ordre d'affichage (identiques aux thèmes de carte). */
export const RING_CATS = GROUPS.map(([cat]) => cat);

/** Anneau proposé pour chaque thème de carte (un anneau distinct par thème). */
const BY_THEME = {
  // Cyberpunk & néon
  standard: "cyber-metal", chrome: "chevron", rue: "spray", corpo: "bezel", glitch: "glitch-ring", terminal: "crt", noir: "deco", holo: "hologram", neon: "neon-tube", tactic: "reticle", synth: "synthwave", hacker: "code-ring", yakuza: "seigaiha", pluie: "rain",
  // Médiéval
  parchemin: "parchment", heraldic: "heraldic", enluminure: "illuminated", forteresse: "battlement", taverne: "barrel", chevalier: "iron-rivet", scriptorium: "greek-key", royaume: "gold-ornate",
  // Fantastique
  arcane: "arcane-circle", sylvestre: "vine", draconique: "dragon-scale", feerique: "petals", cristal: "crystal", necromancie: "soul-flames", elementaire: "magma", celeste: "celestial",
  // Contemporain
  urbain: "road", magazine: "halftone", instantane: "film-strip", police: "police-tape", social: "story-ring", medical: "ecg", startup: "spinner", stade: "track",
  // Futuriste
  orbital: "orbit", mecha: "armor-plates", biotech: "dna", quantique: "quantum-waves", sentinelle: "hud", cryo: "frost", colonie: "hazard", nexus: "nodes",
  // Rétro
  arcade: "pixel", seventies: "stripes-70s", western: "rope", diner: "chrome-50s", vhs: "vhs-tape", memphis: "memphis", pulp: "sunburst", atomic: "atomic-orbits",
  // Horreur
  cthulhu: "tentacle", annees1900: "gear", slasher: "blood", fantome: "chain", gothique: "thorns", zombie: "barbed-wire", sorcellerie: "rune-stone", asile: "padded",
};

/** Repli pour un thème sans anneau dédié (thème personnalisé…) : un anneau par catégorie. */
const BY_CAT = {
  "Cyberpunk & néon": "cyber-metal", "Médiéval": "gold-ornate", Fantastique: "rune-stone", Contemporain: "story-ring", Futuriste: "hud", "Rétro": "chrome-50s", Horreur: "rusted",
};

/** Anneau suggéré pour un thème de carte. */
export const ringForTheme = (theme) =>
  BY_THEME[theme] || BY_CAT[THEMES[theme]?.cat] || FALLBACK_RING;

/** Identifiant de l'anneau effectivement utilisé (« auto » => selon le thème de la carte). */
export const ringIdFor = (d) =>
  RINGS[d.tokenRing] ? d.tokenRing : ringForTheme(d.theme);

/** Thèmes (clés) qui proposent cet anneau en mode automatique. */
export const themesOfRing = (id) =>
  Object.entries(BY_THEME)
    .filter(([, r]) => r === id)
    .map(([theme]) => theme);
