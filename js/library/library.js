/** Affichage de la bibliothèque de cartes. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { persist } from "../core/storage.js";
import { getImg, setStatus } from "../core/utils.js";
import { draw } from "../card/render.js";
import { fresh, loadCard } from "../card/form.js";
import {
  cardVisible,
  isUnder,
  moveDraggedCard,
  renderFolders,
} from "./folders.js";
import { openZoom } from "./zoom.js";
import { copyVisualProps, pasteVisualProps } from "./props-clipboard.js";
import { exportCard } from "./export.js";

export async function renderLibrary() {
  renderFolders();
  const root = $("library");
  root.innerHTML = "";
  const visible = state.cards.filter(cardVisible);
  if (!visible.length) {
    const anyHidden = state.cards.some((c) =>
      isUnder(c.folder || "", state.activeFolder),
    );
    root.innerHTML =
      '<div class="empty">' +
      (anyHidden
        ? "Aucune carte à afficher : les cartes des sous-dossiers sont masquées."
        : state.activeFolder
          ? "Aucune carte dans ce dossier ni dans ses sous-dossiers."
          : "Aucune carte enregistrée.") +
      "</div>";
    return;
  }
  for (const d of visible) {
    const tile = document.createElement("div");
    tile.className =
      "npc-tile" +
      (state.copiedVisualProps && state.copiedVisualPropsSourceId === d.id
        ? " props-copied"
        : "");
    tile.draggable = true;
    tile.tabIndex = 0;
    tile.title =
      "Cliquer sur l’image pour agrandir • Cliquer en dehors pour fermer • Glisser-déposer vers un dossier ou sur une autre carte";
    tile.addEventListener("dragstart", (e) => {
      state.draggedCardId = d.id;
      tile.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    tile.addEventListener("dragover", (e) => {
      if (state.draggedCardId == null || state.draggedCardId === d.id) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      tile.classList.add("drop-target");
    });
    tile.addEventListener("dragleave", (e) => {
      if (!tile.contains(e.relatedTarget)) tile.classList.remove("drop-target");
    });
    tile.addEventListener("drop", (e) => {
      if (state.draggedCardId == null || state.draggedCardId === d.id) return;
      e.preventDefault();
      e.stopPropagation();
      tile.classList.remove("drop-target");
      const src = state.cards.find((x) => x.id === state.draggedCardId);
      const dest = d.folder || "";
      if (!src) return;
      if ((src.folder || "") === dest) {
        state.draggedCardId = null;
        setStatus("Ces deux cartes sont déjà dans le même dossier.");
        return;
      }
      const name = src.name;
      moveDraggedCard(dest);
      setStatus(
        "« " +
          name +
          " » déplacée vers " +
          (dest
            ? "« " + dest.replace(/\//g, " › ") + " »"
            : "la racine (sans dossier)") +
          ".",
      );
    });
    tile.addEventListener("dragend", () => {
      state.draggedCardId = null;
      tile.classList.remove("dragging");
      document
        .querySelectorAll(".drop-target")
        .forEach((x) => x.classList.remove("drop-target"));
    });
    const mini = document.createElement("canvas");
    mini.width = 300;
    mini.height = 420;
    const nm = document.createElement("div");
    nm.className = "tile-name";
    nm.textContent = d.name;
    if (d.folder) {
      const f = document.createElement("div");
      f.className = "tile-folder";
      const parts = d.folder.split("/").filter(Boolean);
      f.textContent = "📁 …/" + parts.slice(-1)[0];
      f.title = d.folder;
      tile.appendChild(f);
    }
    const act = document.createElement("div");
    act.className = "tile-actions";
    const b = (t, title, f, cls) => {
      const x = document.createElement("button");
      x.textContent = t;
      x.title = title;
      x.setAttribute("aria-label", title);
      x.onclick = f;
      if (cls) x.className = cls;
      return x;
    };
    const copyBtn = b(
      "⧉",
      state.copiedVisualProps && state.copiedVisualPropsSourceId === d.id
        ? "Annuler la copie des propriétés"
        : "Copier les propriétés visuelles",
      () => copyVisualProps(d),
    );
    if (state.copiedVisualProps && state.copiedVisualPropsSourceId === d.id)
      copyBtn.classList.add("copy-active");
    const pasteBtn = b(
      "↧",
      "Coller les propriétés copiées sur cette carte",
      () => {
        if (!state.copiedVisualProps) return;
        pasteVisualProps(d);
        persist();
        renderLibrary();
        if (state.editingId === d.id) loadCard(d.id);
        setStatus("Propriétés appliquées à « " + d.name + " ».");
      },
    );
    pasteBtn.disabled = !state.copiedVisualProps;
    act.append(
      b("⚙", "Options / modifier la carte", () => loadCard(d.id)),
      copyBtn,
      b("⇩", "Exporter en JPG", () => exportCard(d)),
      pasteBtn,
      b(
        "×",
        "Supprimer la carte",
        () => {
          if (confirm("Supprimer « " + d.name + " » ?")) {
            state.cards = state.cards.filter((c) => c.id !== d.id);
            if (state.editingId === d.id) fresh();
            persist();
            renderLibrary();
          }
        },
        "danger",
      ),
    );
    tile.append(mini, nm, act);
    root.appendChild(tile);
    mini.tabIndex = 0;
    mini.setAttribute("aria-label", "Cliquer pour agrandir la carte " + d.name);
    mini.addEventListener("click", (e) => {
      e.stopPropagation();
      openZoom(tile, mini);
    });
    mini.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openZoom(tile, mini);
      }
    });
    getImg(d.artData).then((im) => draw(mini.getContext("2d"), d, im));
  }
}
