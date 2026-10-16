/** Événements du formulaire. */
import { $ } from "../core/dom.js";
import { KEYS } from "../core/config.js";
import { state } from "../core/state.js";
import { kv } from "../core/storage.js";
import { genId, setStatus } from "../core/utils.js";
import { applyTheme, drawCurrent, fresh, read, save } from "../card/form.js";
import { setArtAdjust, syncArtLabels } from "../card/art.js";
import { renderLibrary } from "../library/library.js";
import { exportBackCard, exportCard } from "../library/export.js";

$("npcTheme").addEventListener("change", applyTheme);

Object.values(KEYS).forEach(
  (id) => id !== "npcTheme" && $(id).addEventListener("input", drawCurrent),
);

$("fontT").addEventListener("change", drawCurrent);

$("fontB").addEventListener("change", drawCurrent);

$("idOn").addEventListener("change", drawCurrent);

["artZoom", "artX", "artY"].forEach((id) =>
  $(id).addEventListener("input", () => {
    syncArtLabels();
    drawCurrent();
  }),
);

$("artReset").onclick = () => {
  setArtAdjust(100, 50, 50);
  drawCurrent();
};

$("npcOpacity").addEventListener("input", () => {
  $("opacityValue").textContent = $("npcOpacity").value + " %";
  drawCurrent();
});

$("idGen").onclick = () => {
  $("npcId").value = genId();
  $("idOn").checked = true;
  drawCurrent();
};

$("saveBtn").onclick = save;

$("clearBtn").onclick = () => {
  fresh();
  setStatus("Nouvelle carte prête : configuration visuelle conservée.");
};

$("confidentialMode").addEventListener("change", async (e) => {
  state.confidentialMode = e.target.checked;
  await kv("readwrite", (s) =>
    s.put(state.confidentialMode, "confidentialMode"),
  ).catch(() => {});
  drawCurrent();
  renderLibrary();
  setStatus(
    state.confidentialMode
      ? "Mode confidentiel activé : seules l’illustration et le titre sont affichés."
      : "Mode confidentiel désactivé : les données descriptives sont visibles.",
  );
});

$("exportCurrent").onclick = () => exportCard(read());

$("exportBackCurrent").onclick = () => exportBackCard(read());
