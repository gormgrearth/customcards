/**
 * Édition groupée : quand des cartes sont sélectionnées dans la bibliothèque (Ctrl + clic),
 * les modifications faites dans l'éditeur (titre, thème, couleur, anneau du token, cadre de
 * l'illustration, verso) sont appliquées à toutes les cartes sélectionnées.
 *
 * Principe : on compare l'état de l'éditeur à celui de la dernière modification ; seuls les champs
 * qui viennent de changer sont propagés. Le chargement d'une carte / d'un préréglage ne propage rien
 * (cf. `state.syncPaused` et `rebase()` dans form.js).
 */
import { OLD_TITLES } from "../core/config.js";
import { state } from "../core/state.js";
import { persist } from "../core/storage.js";
import { setStatus } from "../core/utils.js";
import { THEMES } from "../themes/meta.js";
import { read } from "../card/form.js";
import { renderLibrary } from "./library.js";

const COVERED = ["title", "theme", "color", "fontT", "fontB", "tokenRing", "artZoom", "artX", "artY", "backArtData"];
const pick = (d) => Object.fromEntries(COVERED.map((k) => [k, d[k] ?? null]));

let snap = null,
  timer = null,
  count = 0;

/** Prend l'état actuel de l'éditeur comme référence (après un chargement). */
export function rebase(d = read()) {
  snap = pick(d);
}

export function syncSelection(d = read()) {
  if (state.syncPaused) return;
  const cur = pick(d),
    prev = snap;
  snap = cur;
  if (!prev || !state.selectedIds.size) return;
  const themeChanged = cur.theme !== prev.theme;
  // les polices ne se propagent qu'avec le thème (elles en dépendent)
  const changed = COVERED.filter(
    (k) => cur[k] !== prev[k] && (themeChanged || (k !== "fontT" && k !== "fontB")),
  );
  if (!changed.length) return;
  const targets = state.cards.filter((c) => state.selectedIds.has(String(c.id)));
  if (!targets.length) return;
  const known = [...Object.values(THEMES).map((x) => x.title), ...OLD_TITLES];
  targets.forEach((card) =>
    changed.forEach((k) => {
      if (k === "title" && themeChanged) {
        // titre issu du thème : on ne remplace que les titres vides ou « par défaut »
        const t = (card.title || "").trim().toUpperCase();
        if (!t || known.includes(t)) card.title = cur.title;
      } else card[k] = cur[k];
    }),
  );
  count = targets.length;
  clearTimeout(timer);
  timer = setTimeout(() => {
    persist();
    renderLibrary();
    setStatus("Modifications appliquées à " + count + " carte(s) sélectionnée(s).");
  }, 300);
}
