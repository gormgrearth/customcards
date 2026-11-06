/** Dessin du verso d'une carte (utilisé par l'export et par la visionneuse). */
import { H, W } from "../core/config.js";

/** Dessine le verso sur le contexte `x` (taille W × H). `im` = illustration du verso (ou null : verso vierge). */
export function drawBackFace(x, im) {
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#06121e");
  g.addColorStop(1, "#02050b");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  const pad = 28,
    iw = W - pad * 2,
    ih = H - pad * 2;
  if (im) {
    const scale = Math.max(iw / im.width, ih / im.height),
      sw = iw / scale,
      sh = ih / scale;
    x.save();
    x.beginPath();
    x.roundRect(pad, pad, iw, ih, 24);
    x.clip();
    x.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, pad, pad, iw, ih);
    x.fillStyle = "rgba(2,7,14,.18)";
    x.fillRect(pad, pad, iw, ih);
    x.restore();
  }
  x.strokeStyle = "#00f0ff";
  x.lineWidth = 4;
  x.strokeRect(14, 14, W - 28, H - 28);
  x.strokeStyle = "#ff2d95";
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(42, 120);
  x.lineTo(42, 42);
  x.lineTo(170, 42);
  x.moveTo(W - 42, H - 120);
  x.lineTo(W - 42, H - 42);
  x.lineTo(W - 170, H - 42);
  x.stroke();
}
