/** Événements des dossiers. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { persist } from "../core/storage.js";
import { setStatus } from "../core/utils.js";
import { hiddenSubs, isUnder } from "../library/folders.js";
import { renderLibrary } from "../library/library.js";

$("createFolder").onclick = () => {
  const leaf = $("newFolderName")
    .value.trim()
    .replace(/[\\/]/g, "-")
    .slice(0, 40);
  if (!leaf) return setStatus("Saisissez un nom de dossier.");
  const name = state.activeFolder ? state.activeFolder + "/" + leaf : leaf;
  if (state.folders.some((f) => f.toLowerCase() === name.toLowerCase()))
    return setStatus("Ce dossier existe déjà à cet emplacement.");
  state.folders.push(name);
  state.activeFolder = name;
  $("newFolderName").value = "";
  persist();
  renderLibrary();
  setStatus("Dossier créé : " + name.replace(/\//g, " › "));
};

$("newFolderName").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("createFolder").click();
});

$("folderFilter").addEventListener("change", (e) => {
  state.activeFolder = e.target.value;
  renderLibrary();
});

$("showNestedCards").addEventListener("change", (e) => {
  state.showNested = e.target.checked;
  renderLibrary();
});

const subsOfActive = () =>
  state.folders.filter((f) => isUnder(f, state.activeFolder));

$("subTreeAll").onclick = () => {
  subsOfActive().forEach((f) => hiddenSubs.delete(f));
  state.showNested = true;
  renderLibrary();
};

$("subTreeNone").onclick = () => {
  subsOfActive().forEach((f) => hiddenSubs.add(f));
  renderLibrary();
};
