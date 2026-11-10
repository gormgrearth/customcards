/**
 * Visionneuse 3D d'une carte de la bibliothèque.
 *  - s'ouvre quand le curseur reste DWELL_MS sur la carte (ou au clic) ;
 *  - la carte se tourne au glisser (bouton gauche) et montre son verso ;
 *  - le token apparaît à côté, sous forme de pièce épaisse : il ne suit pas la carte,
 *    mais se tourne lui aussi au glisser (verso : illustration en noir et blanc, inversée).
 */
import { H, W } from "../core/config.js";
import { getImg } from "../core/utils.js";
import { draw } from "../card/render.js";
import { drawBackFace } from "../card/back-render.js";
import { TOKEN_SIZE, drawToken, negativeBW, tokenImageOf } from "../token/render.js";
import { exportViewerHtml } from "./viewer-export.js";

export const DWELL_MS = 1500;
const GAP = 24,
  MARGIN = 8,
  LAYERS = 16;

let dwellTimer = null,
  current = null,
  seq = 0;

export const isViewerOpen = () => !!current;

/** Lance le compte à rebours : la visionneuse s'ouvre si le curseur reste sur la carte. */
export function scheduleViewer(d, anchor) {
  cancelDwell();
  dwellTimer = setTimeout(() => {
    dwellTimer = null;
    openViewer(d, anchor);
  }, DWELL_MS);
}

export function cancelDwell() {
  if (dwellTimer) clearTimeout(dwellTimer);
  dwellTimer = null;
}

export function closeViewer() {
  seq++;
  cancelDwell();
  if (!current) return;
  const v = current;
  current = null;
  v.cleanup();
  v.root.remove();
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const el = (tag, cls, parent) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.appendChild(e);
  return e;
};

/** Rotation au glisser (inertie, double-clic = remise à plat). `target` = élément 3D, `onTick` = mise à jour (reflet). */
export function spinner(target, onTick, onEnd) {
  let rx = 0,
    ry = 0,
    vx = 0,
    vy = 0,
    drag = null,
    raf = 0,
    lastT = 0;
  const apply = () => {
    target.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    // La face visible est choisie ici (et non par `backface-visibility`, que certains navigateurs
    // ignorent en 3D) : la normale du recto regarde l'observateur quand cos(rx)·cos(ry) > 0.
    target.classList.toggle("flipped", Math.cos((rx * Math.PI) / 180) * Math.cos((ry * Math.PI) / 180) < 0);
    onTick && onTick(rx, ry);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const inertia = () => {
    if (drag) return;
    ry += vy;
    rx = clamp(rx + vx, -40, 40);
    vy *= 0.94;
    vx *= 0.9;
    apply();
    raf = Math.abs(vy) > 0.04 || Math.abs(vx) > 0.04 ? requestAnimationFrame(inertia) : 0;
  };
  target.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    stop();
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    vx = vy = 0;
    target.setPointerCapture(e.pointerId);
    target.classList.add("grabbing");
    e.preventDefault();
  });
  target.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    ry += dx * 0.6;
    rx = clamp(rx - dy * 0.4, -40, 40);
    vy = dx * 0.6;
    vx = -dy * 0.4;
    lastT = performance.now();
    apply();
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    target.classList.remove("grabbing");
    if (performance.now() - lastT > 80) vx = vy = 0; // pointeur arrêté avant le relâchement
    raf = requestAnimationFrame(inertia);
    onEnd && onEnd();
  };
  target.addEventListener("pointerup", end);
  target.addEventListener("pointercancel", end);
  target.addEventListener("dblclick", () => {
    stop();
    const r0 = ry,
      x0 = rx,
      goal = Math.round(r0 / 360) * 360,
      t0 = performance.now(),
      step = (t) => {
        const k = Math.min(1, (t - t0) / 450),
          e = 1 - Math.pow(1 - k, 3);
        ry = r0 + (goal - r0) * e;
        rx = x0 * (1 - e);
        apply();
        raf = k < 1 ? requestAnimationFrame(step) : 0;
      };
    raf = requestAnimationFrame(step);
  });
  apply();
  return { stop, dragging: () => !!drag };
}

/** Ouvre la visionneuse pour la carte `d`, centrée sur l'élément `anchor` (le curseur reste donc dessus). */
export async function openViewer(d, anchor) {
  cancelDwell();
  closeViewer();
  const my = ++seq;
  const [art, backImg, tokImg] = await Promise.all([
    getImg(d.artData),
    getImg(d.backArtData),
    tokenImageOf(d),
  ]);
  if (my !== seq) return; // fermée ou remplacée entre-temps

  // --- dimensions et position
  const vw = window.innerWidth,
    vh = window.innerHeight,
    cw = Math.max(200, Math.min(390, vw * 0.7, ((vh - 64) * W) / H)),
    ch = (cw * H) / W,
    r = anchor.getBoundingClientRect(),
    cx = r.left + r.width / 2,
    cy = r.top + r.height / 2,
    top = clamp(cy - ch / 2, MARGIN, vh - ch - MARGIN - 48),
    left0 = cx - cw / 2;
  let ts = clamp(cw * 0.55, 110, 220),
    overlay = false,
    left,
    coinL,
    coinT;
  if (Math.max(MARGIN, left0) + cw + GAP + ts <= vw - MARGIN) {
    left = Math.max(MARGIN, left0);
    coinL = left + cw + GAP;
  } else if (Math.min(left0, vw - MARGIN - cw) - GAP - ts >= MARGIN) {
    left = Math.min(left0, vw - MARGIN - cw);
    coinL = left - GAP - ts;
  } else {
    overlay = true;
    ts = Math.max(90, cw * 0.4); // écran étroit : la pièce chevauche le coin de la carte
    left = clamp(left0, MARGIN, vw - cw - MARGIN);
    coinL = left + cw - ts * 0.85;
  }
  coinT = overlay ? top + ch - ts * 0.85 : top + (ch - ts) / 2;
  const bx = Math.min(left, coinL),
    by = Math.min(top, coinT),
    bw = Math.max(left + cw, coinL + ts) - bx,
    bh = Math.max(top + ch, coinT + ts) - by + 48;

  // --- DOM
  const root = el("div", "viewer"),
    backdrop = el("div", "viewer-backdrop");
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "Aperçu 3D de « " + (d.name || "la carte") + " »");
  Object.assign(root.style, { left: bx + "px", top: by + "px", width: bw + "px", height: bh + "px" });
  document.body.append(backdrop, root);

  const faceOf = (cls, canvas, parent) => {
    const f = el("div", "v-face " + cls, parent);
    f.appendChild(canvas);
    el("div", "v-glare", f);
    return f;
  };
  const cvs = (w, h) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };

  // carte recto / verso
  const cardWrap = el("div", "v-wrap", root),
    card = el("div", "v-card", cardWrap);
  Object.assign(cardWrap.style, { left: left - bx + "px", top: top - by + "px", width: cw + "px", height: ch + "px" });
  const front = cvs(W, H),
    back = cvs(W, H);
  draw(front.getContext("2d"), d, art);
  drawBackFace(back.getContext("2d"), backImg);
  faceOf("front", front, card);
  faceOf("back", back, card);

  // pièce (token) : épaisseur = couches empilées
  const coinWrap = el("div", "v-wrap v-coin-wrap", root),
    coin = el("div", "v-coin", coinWrap),
    thick = Math.max(8, ts * 0.075);
  Object.assign(coinWrap.style, { left: coinL - bx + "px", top: coinT - by + "px", width: ts + "px", height: ts + "px" });
  el("div", "v-coin-shadow", coinWrap);
  for (let i = 0; i < LAYERS; i++) {
    const e = el("div", "coin-edge" + (i % 2 ? " alt" : ""), coin);
    e.style.transform = `translateZ(${-thick / 2 + (thick * i) / (LAYERS - 1)}px)`;
  }
  const tf = cvs(TOKEN_SIZE, TOKEN_SIZE),
    tb = cvs(TOKEN_SIZE, TOKEN_SIZE);
  drawToken(tf.getContext("2d"), d, tokImg);
  drawToken(tb.getContext("2d"), d, negativeBW(tokImg));
  const cf = faceOf("front", tf, coin),
    cb = faceOf("back", tb, coin);
  cf.style.transform = `translateZ(${thick / 2 + 0.5}px)`;
  cb.style.transform = `rotateY(180deg) translateZ(${thick / 2 + 0.5}px)`;

  const hint = el("div", "v-hint", root);
  hint.textContent = "Glissez pour tourner la carte ou la pièce · double-clic : remettre à plat · Échap : fermer";
  const exp = el("button", "v-export", root);
  exp.type = "button";
  exp.textContent = "⇩ Exporter en HTML 3D";
  exp.title = "Page HTML autonome : carte recto/verso et token en pièce, à tourner";
  exp.addEventListener("click", (e) => {
    e.stopPropagation();
    exportViewerHtml(d);
  });

  let leaveTimer = null,
    graceUntil = 0;
  const grace = () => (graceUntil = performance.now() + 1500); // relâché hors de la zone : on laisse le temps d'y revenir
  const glare = (node) => (rx, ry) =>
    node.style.setProperty("--gx", 50 + Math.sin((ry * Math.PI) / 180) * 55 - rx * 0.6 + "%");
  const sc = spinner(card, glare(card), grace),
    sk = spinner(coin, glare(coin), grace);

  // --- fermeture
  const onLeave = () => {
    if (sc.dragging() || sk.dragging()) return;
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(closeViewer, Math.max(350, graceUntil - performance.now()));
  };
  const onEnter = () => clearTimeout(leaveTimer);
  const onDown = (e) => {
    if (!root.contains(e.target)) closeViewer();
  };
  const onKey = (e) => {
    if (e.key === "Escape") closeViewer();
  };
  root.addEventListener("pointerleave", onLeave);
  root.addEventListener("pointerenter", onEnter);
  document.addEventListener("pointerdown", onDown, true);
  document.addEventListener("keydown", onKey);
  window.addEventListener("scroll", closeViewer, { passive: true, capture: true });
  current = {
    root,
    cleanup() {
      clearTimeout(leaveTimer);
      sc.stop();
      sk.stop();
      backdrop.remove();
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", closeViewer, { capture: true });
    },
  };
}
