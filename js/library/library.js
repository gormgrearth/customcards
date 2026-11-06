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
import { copyVisualProps, pasteVisualProps } from "./props-clipboard.js";
import { exportCard, exportToken } from "./export.js";
import { refreshSelection, toggleSelected } from "./selection.js";
import { cancelDwell, openViewer, scheduleViewer } from "./card-viewer.js";

export async function renderLibrary() {
  renderFolders();
  const root = $("library");
  root.innerHTML = "";
  const visible = state.cards.filter(cardVisible),
    visibleIds = visible.map((c) => String(c.id));
  if (!visible.length) {
    refreshSelection();
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
    tile.dataset.id = String(d.id);
    // sélection multiple : Ctrl / ⌘ + clic (Maj + clic : plage)
    const toggle = (e) => {
      toggleSelected(d.id, e.shiftKey && !e.ctrlKey && !e.metaKey, visibleIds);
      refreshSelection();
    };
    tile.addEventListener("click", (e) => {
      if (!(e.ctrlKey || e.metaKey || e.shiftKey) || e.target.closest(".tile-actions")) return;
      e.preventDefault();
      toggle(e);
    });
    tile.addEventListener("contextmenu", (e) => {
      if (!e.ctrlKey) return; // Ctrl + clic = clic droit sur Mac
      e.preventDefault();
      toggle(e);
    });
    tile.setAttribute("aria-selected", String(state.selectedIds.has(String(d.id))));
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
      b("◉", "Exporter le token en PNG", () => exportToken(d)),
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
    mini.setAttribute(
      "aria-label",
      "Carte " + d.name + " : laissez le curseur dessus (ou Entrée) pour l'agrandir ; Ctrl + clic pour la sélectionner",
    );
    // la visionneuse 3D s'ouvre quand le curseur reste sur la carte (ou au clic / Entrée)
    mini.addEventListener("mouseenter", (e) => {
      if (!e.buttons && window.matchMedia("(hover: hover)").matches) scheduleViewer(d, mini);
    });
    mini.addEventListener("mouseleave", cancelDwell);
    mini.addEventListener("mousedown", cancelDwell);
    tile.addEventListener("dragstart", cancelDwell);
    mini.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return; // sélection : géré par la tuile
      e.stopPropagation();
      openViewer(d, mini);
    });
    mini.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openViewer(d, mini);
      }
    });
    getImg(d.artData).then((im) => draw(mini.getContext("2d"), d, im));
  }
  refreshSelection();
}
