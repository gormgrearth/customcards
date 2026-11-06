/** Rendu du token : disque d'illustration + anneau (fond transparent). */
import { state, tctx } from "../core/state.js";
import { getImg } from "../core/utils.js";
import { RINGS, ringIdFor } from "./rings.js";
import { accentLip } from "./ring-tools.js";

export const TOKEN_SIZE = 512;

/** Image utilisée par un token enregistré : image distincte si choisie, sinon illustration de la carte. */
export async function tokenImageOf(d) {
  if (d.tokenSource === "custom" && d.tokenArtData) {
    const im = await getImg(d.tokenArtData);
    if (im) return im;
  }
  return getImg(d.artData);
}

export function drawToken(c, d, img) {
  const L = TOKEN_SIZE,
    k = c.canvas.width / L,
    ring = RINGS[ringIdFor(d)],
    cx = L / 2,
    cy = L / 2,
    ro = L / 2 - 4,
    ri = ro - ring.thickness * L,
    ra = ri - 2,
    acc = d.color || "#00f0ff";
  const preview = c === tctx;
  c.save();
  c.setTransform(k, 0, 0, k, 0, 0);
  c.clearRect(0, 0, L, L);

  // disque d'illustration
  c.save();
  c.beginPath();
  c.arc(cx, cy, ra, 0, Math.PI * 2);
  c.clip();
  c.fillStyle = "#070b11";
  c.fillRect(0, 0, L, L);
  if (img) {
    const zm = Math.max(0.5, Math.min(4, (Number(d.tokenZoom) || 100) / 100)),
      fx = Math.max(0, Math.min(1, (d.tokenX ?? 50) / 100)),
      fy = Math.max(0, Math.min(1, (d.tokenY ?? 50) / 100)),
      aw = ra * 2,
      ah = ra * 2,
      s = Math.max(aw / img.width, ah / img.height) * zm,
      dw = img.width * s,
      dh = img.height * s;
    c.drawImage(img, cx - ra + (aw - dw) * fx, cy - ra + (ah - dh) * fy, dw, dh);
    if (preview) state.tokenGeom = { aw, ah, dw, dh, k: L / c.canvas.width };
  } else {
    if (preview) state.tokenGeom = null;
    c.strokeStyle = acc;
    c.globalAlpha = 0.5;
    c.lineWidth = 6;
    c.beginPath();
    c.arc(cx, cy - ra * 0.18, ra * 0.28, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(cx, cy + ra * 0.78, ra * 0.5, Math.PI * 1.1, Math.PI * 1.9);
    c.stroke();
    c.globalAlpha = 1;
  }
  const v = c.createRadialGradient(cx, cy, ra * 0.55, cx, cy, ra);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,.5)");
  c.fillStyle = v;
  c.fillRect(0, 0, L, L);
  c.restore();

  ring.draw(c, { L, cx, cy, ro, ri }, acc);
  // anneau au matériau neutre : fin liseré à la couleur de la carte (rappel du thème)
  if (!ring.accent) accentLip(c, { cx, cy, ro, ri }, acc);
  c.restore();
}

/** Version « verso » d'une illustration (pièce de monnaie) : noir et blanc, en négatif. */
export function negativeBW(img, max = 1024) {
  if (!img) return null;
  const s = Math.min(1, max / Math.max(img.width, img.height)),
    c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.width * s));
  c.height = Math.max(1, Math.round(img.height * s));
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0, c.width, c.height);
  const id = x.getImageData(0, 0, c.width, c.height),
    p = id.data;
  for (let i = 0; i < p.length; i += 4) {
    const g = 255 - (0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]);
    p[i] = p[i + 1] = p[i + 2] = g;
  }
  x.putImageData(id, 0, 0);
  return c;
}
