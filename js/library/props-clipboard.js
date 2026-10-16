/** Copier/coller des propriétés visuelles. */
import { $ } from "../core/dom.js";
import { THEMES } from "../themes/meta.js";
import { state } from "../core/state.js";
import { persist } from "../core/storage.js";
import { setStatus } from "../core/utils.js";
import { loadCard } from "../card/form.js";
import { cardVisible } from "./folders.js";
import { renderLibrary } from "./library.js";

function visualPropsOf(card) {
  const p = {
    title: card.title || "",
    theme: card.theme || "standard",
    fontT: card.fontT || "Oswald",
    fontB: card.fontB || "Inter",
    opacity: Number(card.opacity ?? 88),
    color: card.color || THEMES.standard.color,
  };
  if ($("copyBackProp").checked) p.backArtData = card.backArtData || null;
  return p;
}

function updatePropsClipboardUI() {
  const active = !!state.copiedVisualProps;
  $("propsToolbar").classList.toggle("has-copy", active);
  $("pasteCurrentProps").disabled = !active;
  $("pasteFolderProps").disabled = !active;
  $("propsClipboardStatus").textContent = active
    ? "Copiées : titre, style, polices, opacité, couleur" +
      (Object.prototype.hasOwnProperty.call(
        state.copiedVisualProps,
        "backArtData",
      )
        ? " et verso."
        : " (verso exclu).")
    : "Aucune propriété copiée. Cliquez sur ⧉ pour copier ; recliquez sur la même carte pour annuler.";
  $("propsClipboardStatus").title = active
    ? "Les propriétés copiées sont mises en évidence sur la carte source."
    : "";
}

export function copyVisualProps(card) {
  if (state.copiedVisualProps && state.copiedVisualPropsSourceId === card.id) {
    state.copiedVisualProps = null;
    state.copiedVisualPropsSourceId = null;
    updatePropsClipboardUI();
    renderLibrary();
    setStatus(
      "Copie des propriétés annulée ; les options de collage sont désactivées.",
    );
    return;
  }
  state.copiedVisualProps = visualPropsOf(card);
  state.copiedVisualPropsSourceId = card.id;
  updatePropsClipboardUI();
  renderLibrary();
  setStatus(
    "Propriétés copiées depuis « " +
      (card.name || "Carte") +
      " ». La carte source est mise en évidence.",
  );
}

export function pasteVisualProps(card) {
  if (!state.copiedVisualProps) {
    setStatus("Copiez d’abord les propriétés d’une carte avec le bouton ⧉.");
    return false;
  }
  const keep = { id: card.id, folder: card.folder || "" };
  Object.assign(card, state.copiedVisualProps, keep);
  if (
    !Object.prototype.hasOwnProperty.call(
      state.copiedVisualProps,
      "backArtData",
    )
  )
    card.backArtData = card.backArtData || null;
  return true;
}

$("pasteCurrentProps").onclick = () => {
  if (!state.copiedVisualProps)
    return setStatus("Copiez d’abord les propriétés d’une carte.");
  if (state.editingId == null)
    return setStatus(
      "Ouvrez une carte existante avec ⚙ avant de coller les propriétés.",
    );
  const target = state.cards.find((c) => c.id === state.editingId);
  if (!target) return;
  pasteVisualProps(target);
  persist();
  loadCard(target.id);
  renderLibrary();
  setStatus("Propriétés visuelles appliquées à « " + target.name + " ».");
};

$("pasteFolderProps").onclick = () => {
  if (!state.copiedVisualProps)
    return setStatus("Copiez d’abord les propriétés d’une carte.");
  if (!state.activeFolder)
    return setStatus("Ouvrez d’abord un dossier dans la bibliothèque.");
  const targets = state.cards.filter(cardVisible);
  if (!targets.length)
    return setStatus("Aucune carte affichée dans ce dossier.");
  if (
    !confirm(
      "Appliquer les propriétés copiées à " +
        targets.length +
        " carte(s) dans « " +
        state.activeFolder.replace(/\//g, " › ") +
        " » (cartes actuellement affichées uniquement) ?",
    )
  )
    return;
  targets.forEach(pasteVisualProps);
  persist();
  renderLibrary();
  if (state.editingId != null && targets.some((c) => c.id === state.editingId))
    loadCard(state.editingId);
  setStatus("Propriétés appliquées à " + targets.length + " carte(s).");
};

updatePropsClipboardUI();
