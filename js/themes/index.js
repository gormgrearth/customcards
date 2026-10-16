/** Assemblage des dessins de thèmes par catégorie. */
import { medieval } from "./medieval.js";
import { fantastique } from "./fantastique.js";
import { contemporain } from "./contemporain.js";
import { futuriste } from "./futuriste.js";
import { retro } from "./retro.js";
import { horreur } from "./horreur.js";

export const EXTRA = Object.assign(
  {},
  medieval,
  fantastique,
  contemporain,
  futuriste,
  retro,
  horreur,
);
