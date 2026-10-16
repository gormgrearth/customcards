/** Illustration : cadrage et import. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { getImg, loadImage, setStatus } from "../core/utils.js";
import { drawCurrent } from "./form.js";

export function setArtAdjust(z, x, y) {
  $("artZoom").value = z ?? 100;
  $("artX").value = x ?? 50;
  $("artY").value = y ?? 50;
  syncArtLabels();
}

export function syncArtLabels() {
  ["artZoom", "artX", "artY"].forEach(
    (id) => ($(id + "Value").textContent = $(id).value + " %"),
  );
}

$("npcArt").addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  loadImage(url)
    .then((im) => {
      const s = Math.min(1, 1400 / Math.max(im.width, im.height)),
        c = document.createElement("canvas");
      c.width = Math.round(im.width * s);
      c.height = Math.round(im.height * s);
      const x = c.getContext("2d");
      x.fillStyle = "#000";
      x.fillRect(0, 0, c.width, c.height);
      x.drawImage(im, 0, 0, c.width, c.height);
      state.artData = c.toDataURL("image/jpeg", 0.9);
      return getImg(state.artData);
    })
    .then((im) => {
      state.art = im;
      setArtAdjust(100, 50, 50);
      drawCurrent();
      setStatus("Illustration chargée.");
    })
    .catch(() => setStatus("Impossible de lire cette image."))
    .finally(() => URL.revokeObjectURL(url));
});
