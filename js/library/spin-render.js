/**
 * Rendu image par image d'une carte qui tourne sur elle-même (pour les exports Discord : GIF / vidéo).
 * La carte est découpée en fines tranches verticales, redimensionnées selon la perspective
 * (rotation autour de l'axe vertical, comme dans la visionneuse 3D).
 */
import { H, W } from "../core/config.js";
import { state } from "../core/state.js";
import { getImg } from "../core/utils.js";
import { drawBackFace } from "../card/back-render.js";
import { cardCanvas } from "./export.js";

const BG = { dark: ["#1b2230", "#070a10"], light: ["#f3f6fb", "#c3cedf"] };

/** Taille d'une image pour une largeur donnée (dimensions paires : exigence des encodeurs vidéo). */
export function spinSize(width) {
  const w = Math.max(2, Math.round(width / 2) * 2);
  return { w, h: Math.round((w * 1.38) / 2) * 2 };
}

/** Textures recto / verso aux coins arrondis. */
export async function spinTextures(d, confidential = state.confidentialMode) {
  const front = await cardCanvas(d, confidential),
    back = document.createElement("canvas");
  back.width = W;
  back.height = H;
  drawBackFace(back.getContext("2d"), await getImg(d.backArtData), { clean: true });
  const round = (src) => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const x = c.getContext("2d");
    x.beginPath();
    x.roundRect(0, 0, W, H, 16);
    x.clip();
    x.drawImage(src, 0, 0);
    return c;
  };
  return [round(front), round(back)];
}

/** Angle (degrés) de l'image k sur n, selon le mouvement : « spin » = tour complet, « sway » = balancier. */
export const spinAngle = (motion, k, n) =>
  motion === "sway" ? 38 * Math.sin((2 * Math.PI * k) / n) : (360 * k) / n;

/**
 * Dessine une image sur `ctx`.
 * o = { width, bg: "dark" | "light" | "transparent", shadow, glare }
 */
export function drawSpinFrame(ctx, tex, o, deg) {
  const { w: fw, h: fh } = spinSize(o.width),
    th = (deg * Math.PI) / 180,
    c = Math.cos(th),
    s = Math.sin(th);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, fw, fh);
  if (o.bg !== "transparent") {
    const [a, b] = BG[o.bg] || BG.dark,
      g = ctx.createRadialGradient(fw / 2, fh * 0.4, fw * 0.1, fw / 2, fh * 0.5, fh * 0.75);
    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, fw, fh);
  }
  const ch = fh * 0.78,
    cw = (ch * W) / H,
    cx = fw / 2,
    cy = fh * 0.47,
    D = cw * 3.4;

  if (o.shadow) {
    const rx = cw * 0.55 * (0.25 + 0.75 * Math.abs(c)),
      ry = fh * 0.022,
      g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, "rgba(0,0,0,.5)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.translate(cx, cy + ch / 2 + fh * 0.04);
    ctx.scale(1, ry / rx);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // la carte est composée sur une couche transparente (pour que le reflet ne touche pas le fond)
  const layer = (o._layer && o._layer.width === fw && o._layer.height === fh ? o._layer : (o._layer = Object.assign(document.createElement("canvas"), { width: fw, height: fh }))),
    lx = layer.getContext("2d");
  lx.clearRect(0, 0, fw, fh);
  lx.imageSmoothingEnabled = true;
  lx.imageSmoothingQuality = "high";
  const img = c >= 0 ? tex[0] : tex[1],
    N = Math.max(48, Math.round(cw / 1.5)),
    du = cw / N;
  let minX = Infinity,
    maxX = -Infinity,
    hMin = 0,
    hMax = 0;
  for (let i = 0; i < N; i++) {
    const u0 = -cw / 2 + i * du,
      u1 = u0 + du,
      k0 = D / (D - u0 * s),
      k1 = D / (D - u1 * s),
      x0 = cx + u0 * c * k0,
      x1 = cx + u1 * c * k1,
      hh = (ch * (k0 + k1)) / 2,
      sw = W / N;
    let sx = (i / N) * W;
    if (c < 0) sx = W - sx - sw; // vu de dos, le verso est lu à l'endroit
    const dx = Math.min(x0, x1);
    lx.drawImage(img, sx, 0, sw, H, dx, cy - hh / 2, Math.abs(x1 - x0) + 0.7, hh);
    if (dx < minX) {
      minX = dx;
      hMin = hh;
    }
    if (dx > maxX) {
      maxX = dx + Math.abs(x1 - x0);
      hMax = hh;
    }
  }
  // chant de la carte (visible quand elle est presque de profil)
  const e = Math.abs(s) * cw * 0.014;
  if (e > 0.4) {
    lx.fillStyle = "#b9c2cf";
    lx.fillRect(minX - e / 2, cy - hMin / 2, e, hMin);
    lx.fillRect(maxX - e / 2, cy - hMax / 2, e, hMax);
  }
  if (o.glare) {
    const gx = cx + s * cw * 0.5,
      g = lx.createLinearGradient(gx - cw * 0.45, cy - ch * 0.5, gx + cw * 0.45, cy + ch * 0.5);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,255,255,.2)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    lx.globalCompositeOperation = "source-atop";
    lx.fillStyle = g;
    lx.fillRect(0, 0, fw, fh);
    lx.globalCompositeOperation = "source-over";
  }
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
}
