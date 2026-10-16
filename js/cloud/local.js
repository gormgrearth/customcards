/** État local : chargement, sauvegarde, préférences. */
import { $ } from "../core/dom.js";
import { THEMES } from "../themes/meta.js";
import { state } from "../core/state.js";
import { renderBackLibrary } from "../card/backs-ui.js";
import { kv, persist } from "../core/storage.js";
import { genId } from "../core/utils.js";
import { drawCurrent, fresh, norm, read, write } from "../card/form.js";
import { persistColors, renderCustom } from "../card/colors.js";
import { renderLibrary } from "../library/library.js";

export async function readState(name) {
  const g = async (k) => {
    try {
      return await kv("readonly", (s) => s.get(k), name);
    } catch (_) {
      return undefined;
    }
  };
  return {
    lib: await g("library"),
    colors: await g("customColors"),
    backs: await g("customBacks"),
    conf: await g("confidentialMode"),
    prefs: await g("prefs"),
  };
}

export function applyState(s) {
  const lib = s.lib || {};
  state.cards = (lib.cards || []).map(norm);
  state.nextId = lib.nextId || state.cards.length + 1;
  state.folders = Array.isArray(lib.folders)
    ? lib.folders
    : [...new Set(state.cards.map((c) => c.folder).filter(Boolean))];
  state.customColors = Array.isArray(s.colors) ? s.colors : [];
  state.customBacks = Array.isArray(s.backs) ? s.backs : [];
  state.confidentialMode = !!s.conf;
  state.prefs = s.prefs || null;
}

export async function loadLocal() {
  state.prefsLoaded = false;
  applyState(await readState(state.ns));
}

export async function persistAll() {
  await persist();
  persistColors();
  await kv("readwrite", (s) => s.put(state.customBacks, "customBacks")).catch(
    () => {},
  );
  await kv("readwrite", (s) =>
    s.put(state.confidentialMode, "confidentialMode"),
  ).catch(() => {});
  await kv("readwrite", (s) => s.put(state.prefs, "prefs")).catch(() => {});
}

export function afterStateLoad() {
  state.activeFolder = "";
  fresh();
  $("confidentialMode").checked = state.confidentialMode;
  renderCustom();
  renderLibrary();
  renderBackLibrary();
  if (state.prefs && THEMES[state.prefs.theme])
    write({
      theme: state.prefs.theme,
      title: state.prefs.title,
      fontT: state.prefs.fontT,
      fontB: state.prefs.fontB,
      color: state.prefs.color,
      opacity: state.prefs.opacity ?? 88,
      status: "Actif",
      idOn: true,
      idStr: genId(),
    });
  drawCurrent();
  state.prefsLoaded = true;
}

export function schedulePrefs() {
  if (!state.prefsLoaded) return;
  clearTimeout(state.prefsTimer);
  state.prefsTimer = setTimeout(() => {
    const d = read(),
      p = {
        theme: d.theme,
        title: d.title,
        fontT: d.fontT,
        fontB: d.fontB,
        color: d.color,
        opacity: d.opacity,
      };
    if (JSON.stringify(p) === JSON.stringify(state.prefs)) return;
    state.prefs = p;
    kv("readwrite", (s) => s.put(state.prefs, "prefs")).catch(() => {});
  }, 900);
}
