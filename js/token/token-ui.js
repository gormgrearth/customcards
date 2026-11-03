/** Token : réglages (colonne de gauche), aperçu (à côté de la carte) et import d'une image distincte. */
import { $ } from "../core/dom.js";
import { tcanvas, tctx, state } from "../core/state.js";
import { getImg, loadImage, setStatus } from "../core/utils.js";
import { AUTO_RING, DEFAULT_RING, RINGS, RING_CATS, ringIdFor } from "./rings.js";
import { THEMES } from "../themes/meta.js";
import { drawToken } from "./render.js";
import { drawCurrent } from "../card/form.js";

{
  const sel = $("tokenRing"),
    auto = document.createElement("option");
  auto.value = AUTO_RING;
  auto.textContent = "Automatique (selon le thème de la carte)";
  sel.appendChild(auto);
  RING_CATS.forEach((cat) => {
    const g = Object.assign(document.createElement("optgroup"), { label: cat });
    Object.entries(RINGS)
      .filter(([, r]) => r.cat === cat)
      .forEach(([key, r]) => {
        const o = document.createElement("option");
        o.value = key;
        o.textContent = r.label;
        g.appendChild(o);
      });
    sel.appendChild(g);
  });
}

export function syncTokenLabels() {
  ["tokenZoom", "tokenX", "tokenY"].forEach(
    (id) => ($(id + "Value").textContent = $(id).value + " %"),
  );
}

export function setTokenAdjust(z, x, y) {
  $("tokenZoom").value = z ?? 100;
  $("tokenX").value = x ?? 50;
  $("tokenY").value = y ?? 50;
  syncTokenLabels();
}

/** Champs « token » d'une carte (lus depuis le formulaire). */
export function readToken() {
  return {
    tokenSource: $("tokenSrcCustom").checked ? "custom" : "card",
    tokenArtData: state.tokenArtData,
    tokenZoom: Number($("tokenZoom").value),
    tokenX: Number($("tokenX").value),
    tokenY: Number($("tokenY").value),
    tokenRing: $("tokenRing").value,
  };
}

export function writeToken(d) {
  const custom = d.tokenSource === "custom";
  $("tokenSrcCustom").checked = custom;
  $("tokenSrcCard").checked = !custom;
  $("tokenRing").value =
    d.tokenRing === AUTO_RING || RINGS[d.tokenRing] ? d.tokenRing : DEFAULT_RING;
  setTokenAdjust(d.tokenZoom, d.tokenX, d.tokenY);
}

/** Image affichée dans le token de l'aperçu. */
export const tokenImage = (d) =>
  d.tokenSource === "custom" && state.tokenArt ? state.tokenArt : state.art;

export function drawTokenPreview(d) {
  const custom = d.tokenSource === "custom";
  $("tokenFileRow").hidden = !custom;
  $("tokenFileHint").textContent = custom
    ? state.tokenArt
      ? "Image distincte active. Choisissez un autre fichier pour la remplacer."
      : "Aucune image distincte choisie : l’illustration de la carte est utilisée en attendant."
    : "";
  const auto = $("tokenRing").value === AUTO_RING;
  $("tokenRingHint").textContent = auto
    ? "Anneau suggéré par le thème « " +
      (THEMES[d.theme]?.label || d.theme) +
      " » : " +
      RINGS[ringIdFor(d)].label +
      "."
    : "Anneau choisi indépendamment du thème de la carte.";
  drawToken(tctx, d, tokenImage(d));
  tcanvas.classList.toggle("token-draggable", !!state.tokenGeom);
}

document.querySelectorAll('input[name="tokenSource"]').forEach((r) =>
  r.addEventListener("change", () => {
    drawCurrent();
    if ($("tokenSrcCustom").checked && !state.tokenArt) $("tokenFile").click();
  }),
);

["tokenZoom", "tokenX", "tokenY"].forEach((id) =>
  $(id).addEventListener("input", () => {
    syncTokenLabels();
    drawCurrent();
  }),
);

$("tokenReset").onclick = () => {
  setTokenAdjust(100, 50, 50);
  drawCurrent();
};

$("tokenRing").addEventListener("change", () => drawCurrent());

$("tokenFile").addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  loadImage(url)
    .then((im) => {
      const s = Math.min(1, 1024 / Math.max(im.width, im.height)),
        c = document.createElement("canvas");
      c.width = Math.round(im.width * s);
      c.height = Math.round(im.height * s);
      const x = c.getContext("2d");
      x.fillStyle = "#000";
      x.fillRect(0, 0, c.width, c.height);
      x.drawImage(im, 0, 0, c.width, c.height);
      state.tokenArtData = c.toDataURL("image/jpeg", 0.9);
      return getImg(state.tokenArtData);
    })
    .then((im) => {
      state.tokenArt = im;
      $("tokenSrcCustom").checked = true;
      setTokenAdjust(100, 50, 50);
      drawCurrent();
      setStatus("Image du token chargée.");
    })
    .catch(() => setStatus("Impossible de lire cette image."))
    .finally(() => {
      URL.revokeObjectURL(url);
      e.target.value = "";
    });
});
