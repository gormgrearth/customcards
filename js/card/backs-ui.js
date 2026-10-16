/** Dos de carte : sélection, bibliothèque, import. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { BACK_STYLES } from "../backs/index.js";
import { kv } from "../core/storage.js";
import { loadImage } from "../core/utils.js";

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

export function setBackArt(data, label) {
  state.backArtData = data || null;
  $("backStatus").textContent = state.backArtData
    ? "Verso sélectionné : " + (label || backName(state.backArtData))
    : "Aucun verso sélectionné.";
  renderBackLibrary();
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
    name.textContent = item.name;
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
