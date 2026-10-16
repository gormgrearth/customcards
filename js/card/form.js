/** Formulaire : lecture/écriture, thème, sauvegarde d’une carte. */
import { $ } from "../core/dom.js";
import { KEYS, LEGACY, OLD_TITLES, ff } from "../core/config.js";
import { THEMES } from "../themes/meta.js";
import { canvas, pctx, state } from "../core/state.js";
import { backName, setBackArt } from "./backs-ui.js";
import { persist } from "../core/storage.js";
import { genId, getImg, setStatus } from "../core/utils.js";
import { draw } from "./render.js";
import { setArtAdjust } from "./art.js";
import { setColor, trackColor } from "./colors.js";
import { renderHitZones } from "./inline-editor.js";
import { renderLibrary } from "../library/library.js";
import { schedulePrefs } from "../cloud/local.js";

export function norm(d) {
  const t = THEMES[d.theme] ? d.theme : LEGACY[d.theme] || "standard";
  return { ...d, theme: t };
}

export function read() {
  const d = {
    color: state.color,
    backArtData: state.backArtData,
    idOn: $("idOn").checked,
    opacity: Number($("npcOpacity").value),
    artData: state.artData,
    artZoom: Number($("artZoom").value),
    artX: Number($("artX").value),
    artY: Number($("artY").value),
  };
  for (const k in KEYS) d[k] = $(KEYS[k]).value.trim();
  d.name = d.name || "Nouveau PNJ";
  return d;
}

export function write(d) {
  state.backArtData = d.backArtData || null;
  setBackArt(
    state.backArtData,
    state.backArtData ? backName(state.backArtData) : null,
  );
  for (const k in KEYS) $(KEYS[k]).value = d[k] ?? "";
  $("idOn").checked = !!d.idOn;
  $("npcOpacity").value = d.opacity ?? 88;
  $("opacityValue").textContent = $("npcOpacity").value + " %";
  setArtAdjust(d.artZoom, d.artX, d.artY);
  setColor(d.color);
}

const syncFontPreview = () =>
  ["fontT", "fontB"].forEach((id) => {
    const el = $(id);
    if (el && el.value) el.style.fontFamily = ff(el.value);
  });

export const drawCurrent = () => {
  syncFontPreview();
  draw(pctx, read(), state.art);
  renderHitZones();
  canvas.classList.toggle("art-draggable", !!(state.art && state.artGeom));
  schedulePrefs();
};

export function applyTheme() {
  const t = THEMES[$("npcTheme").value],
    known = [...Object.values(THEMES).map((x) => x.title), ...OLD_TITLES],
    cur = $("npcTitle").value.trim().toUpperCase();
  if (!cur || known.includes(cur)) $("npcTitle").value = t.title;
  $("fontT").value = t.fT;
  $("fontB").value = t.fB;
  setColor(t.color);
  drawCurrent();
}

export function fresh() {
  // Conserver la configuration visuelle actuelle pour la prochaine carte.
  const previous = read();
  state.editingId = null;
  state.art = null;
  state.artData = null;
  state.backArtData = null;
  $("backArtFile").value = "";
  $("npcArt").value = "";
  write({
    theme: previous.theme || "standard",
    title: previous.title || THEMES[previous.theme || "standard"].title,
    fontT: previous.fontT || THEMES[previous.theme || "standard"].fT,
    fontB: previous.fontB || THEMES[previous.theme || "standard"].fB,
    color: previous.color || THEMES[previous.theme || "standard"].color,
    opacity: previous.opacity ?? 88,
    status: "Actif",
    idOn: true,
    idStr: genId(),
  });
  $("saveBtn").textContent = "＋ Ajouter à la bibliothèque";
  drawCurrent();
}

export async function loadCard(id) {
  const d = state.cards.find((c) => c.id === id);
  if (!d) return;
  state.editingId = id;
  state.artData = d.artData || null;
  state.art = await getImg(state.artData);
  write(d);
  $("npcArt").value = "";
  $("saveBtn").textContent = "✓ Enregistrer les modifications";
  drawCurrent();
  setStatus("Modification : " + d.name);
}

export function save() {
  const d = read();
  trackColor(d.color);
  if (state.editingId) {
    const i = state.cards.findIndex((c) => c.id === state.editingId);
    if (i >= 0)
      state.cards[i] = {
        ...d,
        id: state.editingId,
        folder: state.cards[i].folder || "",
      };
    setStatus("Carte mise à jour.");
  } else {
    d.id = state.nextId++;
    d.folder = state.activeFolder || "";
    state.cards.unshift(d);
    state.editingId = d.id;
    $("saveBtn").textContent = "✓ Enregistrer les modifications";
    setStatus("Carte ajoutée.");
  }
  persist();
  renderLibrary();
}
