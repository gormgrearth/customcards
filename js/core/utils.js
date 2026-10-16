/** Utilitaires : images, texte, formes de base. */
import { $ } from "./dom.js";
import { ff } from "./config.js";
import { imgCache } from "./state.js";
import { EXTRA } from "../themes/index.js";

export const setStatus = (s) => ($("status").textContent = s);

export const slug = (s) =>
  (s || "npc")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "npc";

export const genId = () => {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const g = () =>
    Array.from({ length: 4 }, () => a[(Math.random() * a.length) | 0]).join("");
  return g() + "-" + g() + "-" + g();
};

export const loadImage = (src) =>
  new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

export const getImg = async (src) => {
  if (!src) return null;
  if (!imgCache.has(src))
    imgCache.set(
      src,
      loadImage(src).catch(() => null),
    );
  return imgCache.get(src);
};

export function wrap(c, t, mw) {
  const out = [];
  for (const p of (t || "").split("\n")) {
    let l = "";
    for (const w of p.split(/\s+/).filter(Boolean)) {
      const n = l ? l + " " + w : w;
      if (c.measureText(n).width > mw && l) {
        out.push(l);
        l = w;
      } else l = n;
    }
    out.push(l);
  }
  return out;
}

export function fitFont(c, text, family, weight, size, min, mw) {
  if (family === "Press Start 2P" || family === "Nosifer") {
    size = Math.round(size * 0.7);
    min = Math.min(min, 9);
  }
  while (size > min) {
    c.font = `${weight} ${size}px ${ff(family)}`;
    if (c.measureText(text).width <= mw) break;
    size -= 2;
  }
  c.font = `${weight} ${size}px ${ff(family)}`;
  return size;
}

export const setLS = (c, px) => {
  if ("letterSpacing" in c) c.letterSpacing = px + "px";
};

export const mid = (c, cy) =>
  cy + (c.measureText("H").actualBoundingBoxAscent || 0) / 2;

export function shape(c, T, x, y, w, h, r) {
  c.beginPath();
  if (T === "standard") c.roundRect(x, y, w, h, r);
  else if (T === "chrome") {
    c.moveTo(x + r, y);
    c.lineTo(x + w, y);
    c.lineTo(x + w, y + h - r);
    c.lineTo(x + w - r, y + h);
    c.lineTo(x, y + h);
    c.lineTo(x, y + r);
    c.closePath();
  } else if (T === "rue") {
    c.moveTo(x, y + r * 0.6);
    c.lineTo(x + w, y);
    c.lineTo(x + w, y + h - r * 0.4);
    c.lineTo(x + w - r * 1.5, y + h);
    c.lineTo(x, y + h);
    c.closePath();
  } else if (T === "holo" || T === "neon") c.roundRect(x, y, w, h, r);
  else if (T === "tactic") {
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.lineTo(x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.lineTo(x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.lineTo(x, y + h - r);
    c.lineTo(x, y + r);
    c.closePath();
  } else if (T === "synth") {
    c.moveTo(x, y);
    c.lineTo(x + w - r, y);
    c.lineTo(x + w, y + r);
    c.lineTo(x + w, y + h);
    c.lineTo(x + r, y + h);
    c.lineTo(x, y + h - r);
    c.closePath();
  } else if (EXTRA[T] && EXTRA[T].shape) EXTRA[T].shape(c, x, y, w, h, r);
  else c.rect(x, y, w, h);
}
