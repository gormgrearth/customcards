/** Sauvegarde / restauration JSON. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { renderBackLibrary } from "../card/backs-ui.js";
import { kv, persist } from "../core/storage.js";
import { setStatus } from "../core/utils.js";
import { norm } from "../card/form.js";
import { addCustom, persistColors, renderCustom } from "../card/colors.js";
import { renderLibrary } from "./library.js";

$("backup").onclick = () => {
  const a = document.createElement("a");
  a.download = "bibliotheque_pnj.json";
  a.href = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify({
          cards: state.cards,
          nextId: state.nextId,
          customColors: state.customColors,
          folders: state.folders,
          customBacks: state.customBacks,
          confidentialMode: state.confidentialMode,
        }),
      ],
      { type: "application/json" },
    ),
  );
  a.click();
  URL.revokeObjectURL(a.href);
};

$("restore").onclick = () => $("restoreFile").click();

$("restoreFile").onchange = async (e) => {
  try {
    const j = JSON.parse(await e.target.files[0].text());
    if (!Array.isArray(j.cards)) throw 0;
    state.cards = j.cards.map(norm);
    state.nextId = j.nextId || state.cards.length + 1;
    (j.customColors || []).forEach(addCustom);
    state.customBacks = Array.isArray(j.customBacks) ? j.customBacks : [];
    state.folders = Array.isArray(j.folders)
      ? j.folders
      : [...new Set(j.cards.map((c) => c.folder).filter(Boolean))];
    state.confidentialMode = !!j.confidentialMode;
    $("confidentialMode").checked = state.confidentialMode;
    await kv("readwrite", (s) =>
      s.put(state.confidentialMode, "confidentialMode"),
    ).catch(() => {});
    state.cards.forEach((x) => addCustom(x.color));
    await persist();
    persistColors();
    renderCustom();
    renderLibrary();
    renderBackLibrary();
    kv("readwrite", (s) => s.put(state.customBacks, "customBacks")).catch(
      () => {},
    );
    setStatus("Bibliothèque restaurée.");
  } catch (_) {
    setStatus("Fichier de sauvegarde invalide.");
  }
  e.target.value = "";
};
