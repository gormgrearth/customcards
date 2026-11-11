/** Dos de carte : sélection, bibliothèque, import. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { BACK_STYLES } from "../backs/index.js";
import { kv } from "../core/storage.js";
import { loadImage, setStatus } from "../core/utils.js";
import { syncSelection } from "../library/multi-edit.js";

const backStyleSelect = $("backStyle");

BACK_STYLES.forEach((x, i) => {
  const o = document.createElement("option");
  o.value = String(i);
  o.textContent = x.name;
  backStyleSelect.appendChild(o);
});

const resizeImageData = async (file) => {
  const url = URL.createObjectURL(file);
  try {
    const im = await loadImage(url);
    const scale = Math.min(1, 1400 / Math.max(im.width, im.height));
    const c = document.createElement("canvas");
    c.width = Math.round(im.width * scale);
    c.height = Math.round(im.height * scale);
    const cx = c.getContext("2d");
    cx.fillStyle = "#05080d";
    cx.fillRect(0, 0, c.width, c.height);
    cx.drawImage(im, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.9);
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const backName = (data) =>
  BACK_STYLES.find((x) => x.data === data)?.name ||
  state.customBacks.find((x) => x.data === data)?.name ||
  "Verso personnalisé";

const saveCustomBacks = () =>
  kv("readwrite", (s) => s.put(state.customBacks, "customBacks")).catch(() => {});

/** Renomme un verso importé de la bibliothèque (le nom est unique, sans tenir compte de la casse). */
async function renameBack(item, input) {
  const name = input.value.trim().slice(0, 50);
  if (!name || name === item.name) return renderBackLibrary();
  if (state.customBacks.some((b) => b !== item && b.name.toLowerCase() === name.toLowerCase())) {
    setStatus("Un verso porte déjà ce nom : choisissez-en un autre.");
    return renderBackLibrary();
  }
  item.name = name;
  await saveCustomBacks();
  if (state.backArtData === item.data) $("backStatus").textContent = "Verso sélectionné : " + name;
  renderBackLibrary();
  setStatus("Verso renommé : " + name);
}

/** Remplace le nom affiché par un champ de saisie (Entrée / clic ailleurs : valider, Échap : annuler). */
function startRename(item, nameRow) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "tile-name-input";
  input.maxLength = 50;
  input.value = item.name;
  input.setAttribute("aria-label", "Nouveau nom du verso « " + item.name + " »");
  let done = false;
  const finish = (ok) => {
    if (done) return;
    done = true;
    if (ok) renameBack(item, input);
    else renderBackLibrary();
  };
  input.addEventListener("click", (e) => e.stopPropagation());
  input.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Enter") finish(true);
    else if (e.key === "Escape") finish(false);
  });
  input.addEventListener("blur", () => finish(true));
  nameRow.replaceChildren(input);
  input.focus();
  input.select();
}

export function setBackArt(data, label) {
  state.backArtData = data || null;
  $("backStatus").textContent = state.backArtData
    ? "Verso sélectionné : " + (label || backName(state.backArtData))
    : "Aucun verso sélectionné.";
  renderBackLibrary();
  if (!state.syncPaused) syncSelection();
}

export function renderBackLibrary() {
  const root = $("backLibrary");
  if (!root) return;
  root.innerHTML = "";
  const items =
    state.backLibraryMode === "styles" ? BACK_STYLES : state.customBacks;
  if (!items.length) {
    root.innerHTML =
      '<div class="back-empty">Aucune illustration importée. Utilisez le champ d’importation dans l’éditeur.</div>';
    return;
  }
  items.forEach((item) => {
    const tile = document.createElement("div");
    tile.className =
      "back-tile" + (state.backArtData === item.data ? " selected" : "");
    const im = document.createElement("img");
    im.src = item.data;
    im.alt = item.name;
    const name = document.createElement("div");
    name.className = "tile-name";
    const label = document.createElement("span");
    label.textContent = item.name;
    name.appendChild(label);
    if (state.backLibraryMode === "custom") {
      // seuls les versos importés se renomment (les styles proposés ont un nom fixe)
      const rn = document.createElement("button");
      rn.type = "button";
      rn.className = "tile-rename";
      rn.textContent = "✎";
      rn.title = "Renommer ce verso";
      rn.setAttribute("aria-label", "Renommer le verso " + item.name);
      rn.onclick = (e) => {
        e.stopPropagation();
        startRename(item, name);
      };
      name.appendChild(rn);
      label.title = "Double-clic pour renommer";
      label.addEventListener("dblclick", () => startRename(item, name));
    }
    const use = document.createElement("button");
    use.textContent = "Utiliser ce verso";
    use.onclick = () => {
      setBackArt(item.data, item.name);
      if (state.backLibraryMode === "styles")
        backStyleSelect.value = String(
          BACK_STYLES.findIndex((x) => x.data === item.data),
        );
    };
    tile.append(im, name, use);
    root.appendChild(tile);
  });
}

$("backArtFile").addEventListener("change", async (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  try {
    const data = await resizeImageData(f);
    const name = f.name.replace(/\.[^.]+$/, "").slice(0, 50) || "Verso importé";
    const old = state.customBacks.find((x) => x.name === name);
    if (old) old.data = data;
    else state.customBacks.unshift({ name, data });
    if (state.customBacks.length > 50) state.customBacks.pop();
    state.backLibraryMode = "custom";
    await kv("readwrite", (s) => s.put(state.customBacks, "customBacks")).catch(
      () => {},
    );
    setBackArt(data, name);
    renderBackLibrary();
    $("backStatus").textContent =
      "Illustration ajoutée à la bibliothèque des versos : " + name;
  } catch (_) {
    $("backStatus").textContent = "Impossible de lire cette image.";
  }
  e.target.value = "";
});

$("applyBackStyle").onclick = () => {
  const item = BACK_STYLES[Number(backStyleSelect.value)] || BACK_STYLES[0];
  state.backLibraryMode = "styles";
  setBackArt(item.data, item.name);
};

$("clearBack").onclick = () => setBackArt(null);

$("showBackStyles").onclick = () => {
  state.backLibraryMode = "styles";
  renderBackLibrary();
};

$("showCustomBacks").onclick = () => {
  state.backLibraryMode = "custom";
  renderBackLibrary();
};
