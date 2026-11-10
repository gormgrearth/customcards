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

/** Flou de boîte séparable (sur une carte de hauteurs). */
function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(src.length),
    out = new Float32Array(src.length),
    d = 2 * r + 1,
    cl = (v, m) => Math.max(0, Math.min(m, v));
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = 0;
    for (let i = -r; i <= r; i++) acc += src[row + cl(i, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc / d;
      acc += src[row + cl(x + r + 1, w - 1)] - src[row + cl(x - r, w - 1)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let i = -r; i <= r; i++) acc += tmp[cl(i, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / d;
      acc += tmp[cl(y + r + 1, h - 1) * w + x] - tmp[cl(y - r, h - 1) * w + x];
    }
  }
  return out;
}

/**
 * Verso « relief métal » d'une illustration (face arrière de la pièce) :
 * la luminance devient un relief (clair = en saillie), éclairé en biais et rendu comme de l'acier brossé.
 */
export function metalRelief(img, max = 1024) {
  if (!img) return null;
  const s = Math.min(1, max / Math.max(img.width, img.height)),
    w = Math.max(3, Math.round(img.width * s)),
    h = Math.max(3, Math.round(img.height * s)),
    c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(img, 0, 0, w, h);
  const id = x.getImageData(0, 0, w, h),
    p = id.data,
    n = w * h;
  let H = new Float32Array(n);
  for (let i = 0; i < n; i++) H[i] = (0.299 * p[i * 4] + 0.587 * p[i * 4 + 1] + 0.114 * p[i * 4 + 2]) / 255;
  H = boxBlur(boxBlur(H, w, h, 2), w, h, 2); // relief adouci
  let lo = 1,
    hi = 0;
  for (let i = 0; i < n; i++) {
    if (H[i] < lo) lo = H[i];
    if (H[i] > hi) hi = H[i];
  }
  const span = hi - lo || 1,
    K = 10, // intensité du relief
    L = [-0.55, -0.65, 0.52], // lumière venant du haut à gauche
    ln = Math.hypot(...L),
    lx = L[0] / ln,
    ly = L[1] / ln,
    lz = L[2] / ln,
    hv = Math.hypot(lx, ly, lz + 1),
    hx = lx / hv,
    hy = ly / hv,
    hz = (lz + 1) / hv;
  for (let yy = 0; yy < h; yy++)
    for (let xx = 0; xx < w; xx++) {
      const i = yy * w + xx,
        xl = yy * w + Math.max(0, xx - 1),
        xr = yy * w + Math.min(w - 1, xx + 1),
        yu = Math.max(0, yy - 1) * w + xx,
        yd = Math.min(h - 1, yy + 1) * w + xx,
        nx = (-(H[xr] - H[xl]) * K) / span,
        ny = (-(H[yd] - H[yu]) * K) / span,
        nl = Math.hypot(nx, ny, 1),
        diff = Math.max(0, (nx * lx + ny * ly + lz) / nl),
        spec = Math.pow(Math.max(0, (nx * hx + ny * hy + hz) / nl), 36),
        height = (H[i] - lo) / span,
        shade = (0.04 + 0.78 * diff) * (0.8 + 0.34 * height),
        grain = (((i * 2654435761) >>> 0) % 9) - 4 + (((yy * 40503) >>> 0) % 7) - 3, // fin grain d'acier brossé
        r = 26 + (236 - 26) * shade + spec * 110 + grain,
        g = 31 + (241 - 31) * shade + spec * 110 + grain,
        b = 40 + (250 - 40) * shade + spec * 115 + grain;
      p[i * 4] = r < 0 ? 0 : r > 255 ? 255 : r;
      p[i * 4 + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
      p[i * 4 + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
      p[i * 4 + 3] = 255;
    }
  x.putImageData(id, 0, 0);
  return c;
}
