/** Sélection multiple de cartes dans la bibliothèque + téléchargement groupé. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { setStatus } from "../core/utils.js";
import { cardVisible } from "./folders.js";
import { exportSelection } from "./batch-export.js";

const FMT = () => ({
  card: $("fmtCard").checked,
  cfd: $("fmtCfd").checked,
  tkn: $("fmtTkn").checked,
  zip: $("fmtZip").checked,
  folders: $("fmtFolders").checked,
});

const selectedCards = () =>
  state.cards.filter((c) => state.selectedIds.has(String(c.id)));

/** Bascule une carte ; avec Maj, sélectionne/désélectionne la plage depuis la dernière carte cochée. */
export function toggleSelected(id, range, visibleIds) {
  const key = String(id);
  if (range && state.lastSelectedId != null && visibleIds.includes(state.lastSelectedId)) {
    const a = visibleIds.indexOf(state.lastSelectedId),
      b = visibleIds.indexOf(key),
      on = !state.selectedIds.has(key);
    visibleIds
      .slice(Math.min(a, b), Math.max(a, b) + 1)
      .forEach((x) => (on ? state.selectedIds.add(x) : state.selectedIds.delete(x)));
  } else if (state.selectedIds.has(key)) state.selectedIds.delete(key);
  else state.selectedIds.add(key);
  state.lastSelectedId = key;
}

/** Met à jour tuiles et barre de sélection sans redessiner la bibliothèque. */
export function refreshSelection() {
  const alive = new Set(state.cards.map((c) => String(c.id)));
  [...state.selectedIds].forEach((id) => alive.has(id) || state.selectedIds.delete(id));
  document.querySelectorAll("#library .npc-tile[data-id]").forEach((t) => {
    const on = state.selectedIds.has(t.dataset.id);
    t.classList.toggle("selected", on);
    const chk = t.querySelector(".tile-check");
    if (chk) chk.checked = on;
  });
  const n = state.selectedIds.size,
    f = FMT(),
    formats = +f.card + +f.cfd + +f.tkn;
  $("selectCount").textContent =
    n + (n > 1 ? " cartes sélectionnées" : " carte sélectionnée");
  $("selectInfo").textContent = n && formats ? "→ " + n * formats + " fichier(s)" : "";
  $("fmtFoldersWrap").hidden = !f.zip;
}

function setMode(on) {
  state.selectMode = on;
  $("library").classList.toggle("select-mode", on);
  $("selectBar").hidden = !on;
  $("selectToggle").setAttribute("aria-pressed", String(on));
  $("selectToggle").textContent = on ? "✕ Terminer la sélection" : "☑ Sélectionner";
  refreshSelection();
}

$("selectToggle").onclick = () => setMode(!state.selectMode);

$("selectAll").onclick = () => {
  state.cards.filter(cardVisible).forEach((c) => state.selectedIds.add(String(c.id)));
  refreshSelection();
};

$("selectNone").onclick = () => {
  state.selectedIds.clear();
  state.lastSelectedId = null;
  refreshSelection();
};

["fmtCard", "fmtCfd", "fmtTkn", "fmtZip", "fmtFolders"].forEach((id) =>
  $(id).addEventListener("change", refreshSelection),
);

$("selectExport").onclick = async () => {
  const cards = selectedCards(),
    fmt = FMT();
  if (!cards.length) return setStatus("Sélectionnez au moins une carte.");
  if (!fmt.card && !fmt.cfd && !fmt.tkn)
    return setStatus("Cochez au moins un format : carte, carte confidentielle ou token.");
  const btn = $("selectExport");
  btn.disabled = true;
  try {
    const n = await exportSelection(cards, fmt, (done, total) =>
      setStatus("Préparation… " + done + " / " + total),
    );
    setStatus(
      n +
        " fichier(s) " +
        (fmt.zip ? "regroupés dans un ZIP." : "téléchargés : autorisez les téléchargements multiples si besoin."),
    );
  } catch (e) {
    console.error(e);
    setStatus("L’export groupé a échoué.");
  } finally {
    btn.disabled = false;
  }
};
