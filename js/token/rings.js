/**
 * Bibliothèque d'anneaux de token.
 *
 * - `RINGS` : catalogue { id: { cat, label, thickness, draw(c, g, acc) } }, groupé par catégorie
 *   (mêmes catégories que les thèmes de carte). Pour ajouter un anneau : une entrée ici.
 *   `g` = { L, cx, cy, ro, ri } (taille logique, centre, rayons extérieur / intérieur),
 *   `acc` = couleur d'accent de la carte.
 * - Valeur « auto » (par défaut) : l'anneau suit le thème de la carte (BY_THEME / BY_CAT).
 *   Choisir un anneau précis le rend indépendant du thème de la carte.
 */
import { THEMES } from "../themes/meta.js";

export const AUTO_RING = "auto";
export const DEFAULT_RING = AUTO_RING;
const FALLBACK_RING = "cyber-metal";

const TAU = Math.PI * 2,
  DEG = Math.PI / 180;

/* ------------------------------ outils de dessin ------------------------------ */
const disc = (c, cx, cy, r) => {
  c.beginPath();
  c.arc(cx, cy, r, 0, TAU);
};
const ringLine = (c, cx, cy, r, color, w) => {
  disc(c, cx, cy, r);
  c.strokeStyle = color;
  c.lineWidth = w;
  c.stroke();
};
const annulus = (c, cx, cy, ro, ri) => {
  c.beginPath();
  c.arc(cx, cy, ro, 0, TAU);
  c.arc(cx, cy, ri, 0, TAU, true);
};
const arc = (c, cx, cy, r, a0, a1, color, w, cap = "butt") => {
  c.beginPath();
  c.arc(cx, cy, r, a0, a1);
  c.strokeStyle = color;
  c.lineWidth = w;
  c.lineCap = cap;
  c.stroke();
};
const line = (c, x0, y0, x1, y1, color, w, cap = "butt") => {
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x1, y1);
  c.strokeStyle = color;
  c.lineWidth = w;
  c.lineCap = cap;
  c.stroke();
};
const pt = (cx, cy, r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
/** Pseudo-aléatoire déterministe (le dessin est identique à chaque rendu). */
const rnd = (i, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const toRgb = (hex) => {
  let h = String(hex || "#00f0ff").replace("#", "");
  if (h.length === 3) h = [...h].map((x) => x + x).join("");
  const n = parseInt(h, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgba = (hex, a) => {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};
const mix = (hex, other, t) => {
  const a = toRgb(hex),
    b = toRgb(other);
  return (
    "#" +
    a
      .map((v, i) =>
        Math.round(v + (b[i] - v) * t)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
};
/** Dégradé conique (reflets métalliques) ; repli linéaire si non supporté. */
function conic(c, cx, cy, ro, stops, start = -Math.PI / 2 - 0.6) {
  const g = c.createConicGradient
    ? c.createConicGradient(start, cx, cy)
    : c.createLinearGradient(cx - ro, cy - ro, cx + ro, cy + ro);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}
const bevel = (c, cx, cy, ro, ri) => {
  ringLine(c, cx, cy, ro - 1.5, "rgba(0,0,0,.8)", 3);
  ringLine(c, cx, cy, ro - 5, "rgba(255,255,255,.24)", 1.5);
  ringLine(c, cx, cy, ri + 2, "rgba(0,0,0,.85)", 4);
  ringLine(c, cx, cy, ri + 6, "rgba(255,255,255,.1)", 1);
};
/** Fin liseré sombre : masque l'interstice entre l'anneau et l'illustration. */
const seam = (c, cx, cy, ri) => ringLine(c, cx, cy, ri - 0.5, "#0b0f16", 3);

/* ------------------------------ palettes métal ------------------------------ */
const PAL = {
  steel: [[0, "#3c434e"], [0.1, "#a3adbc"], [0.2, "#3a414c"], [0.34, "#171b22"], [0.48, "#6f798a"], [0.58, "#242a33"], [0.74, "#8d97a7"], [0.86, "#2c323c"], [1, "#3c434e"]],
  gold: [[0, "#6b4f12"], [0.1, "#f3d77a"], [0.2, "#9a7420"], [0.34, "#4a3508"], [0.48, "#d9b24a"], [0.58, "#6e5114"], [0.74, "#f0d070"], [0.86, "#7a5a18"], [1, "#6b4f12"]],
  iron: [[0, "#2b2d31"], [0.12, "#6a6e76"], [0.25, "#26282c"], [0.4, "#141517"], [0.55, "#50545b"], [0.7, "#1d1f22"], [0.85, "#5d6169"], [1, "#2b2d31"]],
  titanium: [[0, "#6a7078"], [0.25, "#8a9098"], [0.5, "#5a6068"], [0.75, "#8e949c"], [1, "#6a7078"]],
  chrome: [[0, "#f5f7fa"], [0.08, "#7d8794"], [0.2, "#ffffff"], [0.35, "#4b5360"], [0.5, "#e9edf2"], [0.62, "#6e7886"], [0.78, "#ffffff"], [0.9, "#8a94a2"], [1, "#f5f7fa"]],
  rust: [[0, "#4a2511"], [0.1, "#a8571f"], [0.22, "#3a1d0e"], [0.38, "#6b3516"], [0.5, "#2a160b"], [0.65, "#8d4a1c"], [0.8, "#3d1f0f"], [1, "#4a2511"]],
  stone: [[0, "#3a3b3f"], [0.2, "#55575c"], [0.4, "#2e2f33"], [0.6, "#4a4c51"], [0.8, "#2a2b2e"], [1, "#3a3b3f"]],
};

/* ------------------------------ famille « métal » ------------------------------ */
/**
 * Anneau métallique paramétrable.
 * o = { pal, grain, stains, ticks:{n,major}, groove:{at,base,line,alpha,color,segs},
 *       studs:{n,style:"screw|rivet|pearl|led",r,at,off}, gems }
 */
function metalRing(o) {
  return (c, g, acc) => {
    const { cx, cy, ro, ri } = g;
    c.save();
    annulus(c, cx, cy, ro, ri);
    c.fillStyle = conic(c, cx, cy, ro, o.pal);
    c.fill();
    if (o.grain !== false)
      for (let r = ri + 3, i = 0; r < ro - 2; r += 2, i++)
        ringLine(c, cx, cy, r, i % 2 ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.07)", 1);
    if (o.stains) {
      c.save();
      annulus(c, cx, cy, ro, ri);
      c.clip();
      for (let i = 0; i < 46; i++) {
        const [x, y] = pt(cx, cy, ri + 4 + rnd(i, 2) * (ro - ri - 8), rnd(i, 1) * TAU),
          s = 3 + rnd(i, 3) * 8,
          gr = c.createRadialGradient(x, y, 0, x, y, s);
        gr.addColorStop(0, o.stains);
        gr.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = gr;
        c.fillRect(x - s, y - s, s * 2, s * 2);
      }
      for (let i = 0; i < 9; i++) {
        const r = ri + 5 + rnd(i, 8) * (ro - ri - 10),
          a = rnd(i, 9) * TAU;
        arc(c, cx, cy, r, a, a + 0.15 + rnd(i, 4) * 0.4, "rgba(255,220,180,.16)", 1);
      }
      c.restore();
    }
    bevel(c, cx, cy, ro, ri);
    if (o.ticks) {
      for (let i = 0; i < o.ticks.n; i++) {
        const a = (i / o.ticks.n) * TAU,
          major = i % o.ticks.major === 0,
          r1 = ro - 9,
          r2 = r1 - (major ? 7 : 3.5),
          [x0, y0] = pt(cx, cy, r1, a),
          [x1, y1] = pt(cx, cy, r2, a);
        line(c, x0, y0, x1, y1, "rgba(0,0,0,.55)", major ? 2 : 1.2);
      }
    }
    if (o.groove) {
      const gv = o.groove,
        rc = ro - (gv.at ?? 21);
      ringLine(c, cx, cy, rc, "rgba(0,0,0,.55)", gv.base ?? 6);
      ringLine(c, cx, cy, rc, gv.color || rgba(acc, gv.alpha ?? 0.3), gv.line ?? 1.3);
      if (gv.segs) {
        c.save();
        c.shadowColor = rgba(acc, 0.7);
        c.shadowBlur = 7;
        gv.segs.forEach(([a0, a1]) =>
          arc(c, cx, cy, rc, a0 * DEG, a1 * DEG, rgba(acc, 0.92), 3, "round"),
        );
        c.restore();
      }
    }
    if (o.studs) {
      const s = o.studs,
        rs = ro - (s.at ?? 30);
      for (let i = 0; i < s.n; i++) {
        const a = (s.off ?? 45) * DEG + (i / s.n) * TAU,
          [x, y] = pt(cx, cy, rs, a);
        if (s.style === "led") {
          c.save();
          c.shadowColor = acc;
          c.shadowBlur = 6;
          disc(c, x, y, s.r ?? 2.4);
          c.fillStyle = rgba(acc, 0.95);
          c.fill();
          c.restore();
          continue;
        }
        const rad = s.r ?? (s.style === "rivet" ? 5 : s.style === "pearl" ? 3.2 : 3),
          gr = c.createRadialGradient(x - rad * 0.35, y - rad * 0.35, 0, x, y, rad * 1.15);
        gr.addColorStop(0, s.style === "pearl" ? "#fff7d0" : "#c3ccd9");
        gr.addColorStop(1, s.style === "pearl" ? "#9a7420" : "#3a424e");
        disc(c, x, y, rad);
        c.fillStyle = gr;
        c.fill();
        c.strokeStyle = "rgba(0,0,0,.6)";
        c.lineWidth = 1;
        c.stroke();
        if (s.style === "screw") {
          line(c, x - Math.sin(a) * 2.4, y + Math.cos(a) * 2.4, x + Math.sin(a) * 2.4, y - Math.cos(a) * 2.4, "rgba(0,0,0,.7)", 1);
        }
      }
    }
    if (o.gems) {
      const rc = ro - (o.groove?.at ?? 21);
      for (let i = 0; i < o.gems; i++) {
        const a = (i / o.gems) * TAU - Math.PI / 2,
          [x, y] = pt(cx, cy, rc, a);
        c.save();
        c.translate(x, y);
        c.rotate(a + Math.PI / 2);
        c.beginPath();
        c.moveTo(0, -9);
        c.lineTo(6, 0);
        c.lineTo(0, 9);
        c.lineTo(-6, 0);
        c.closePath();
        c.fillStyle = acc;
        c.fill();
        c.strokeStyle = "#f6e08a";
        c.lineWidth = 1.6;
        c.stroke();
        line(c, -2, -3, 0, -6, "rgba(255,255,255,.8)", 1.4, "round");
        c.restore();
      }
    }
    c.restore();
  };
}

/* ------------------------------ anneaux spécifiques ------------------------------ */
function neonTube(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rt = ri + t * 0.42;
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = "#0c1018";
  c.fill();
  ringLine(c, cx, cy, ro - 1.5, "rgba(255,255,255,.12)", 2);
  ringLine(c, cx, cy, ri + 1.5, "rgba(0,0,0,.9)", 3);
  c.save();
  c.shadowColor = acc;
  c.shadowBlur = 14;
  ringLine(c, cx, cy, rt, rgba(acc, 0.95), t * 0.36);
  c.shadowBlur = 0;
  ringLine(c, cx, cy, rt, mix(acc, "#ffffff", 0.7), t * 0.13);
  c.restore();
  for (let i = 0; i < 4; i++) {
    const a = (i * 90 + 20) * DEG;
    arc(c, cx, cy, rt, a - 0.03, a + 0.03, "#0c1018", t * 0.55);
    const [x, y] = pt(cx, cy, rt, a + 45 * DEG);
    c.save();
    c.translate(x, y);
    c.rotate(a + 45 * DEG + Math.PI / 2);
    c.fillStyle = "#3a4250";
    c.fillRect(-5, -t * 0.3, 10, t * 0.6);
    c.strokeStyle = "rgba(0,0,0,.8)";
    c.lineWidth = 1;
    c.strokeRect(-5, -t * 0.3, 10, t * 0.6);
    c.restore();
  }
  c.restore();
}

function circuit(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    rows = [ri + 9, (ro + ri) / 2, ro - 9];
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = "#0b1117";
  c.fill();
  bevel(c, cx, cy, ro, ri);
  const pad = (r, a) => {
    const [x, y] = pt(cx, cy, r, a);
    disc(c, x, y, 3);
    c.fillStyle = rgba(acc, 0.95);
    c.fill();
    c.strokeStyle = "#0b1117";
    c.lineWidth = 1;
    c.stroke();
  };
  rows.forEach((r, k) => {
    let a = rnd(k, 5) * TAU;
    for (let j = 0; j < 7; j++) {
      const a1 = a + 0.16 + rnd(k * 10 + j, 6) * 0.5;
      arc(c, cx, cy, r, a, a1, rgba(acc, 0.6), 1.8);
      pad(r, a);
      pad(r, a1);
      if (k < 2 && rnd(k * 10 + j, 7) > 0.45) {
        const [x0, y0] = pt(cx, cy, r, a1),
          [x1, y1] = pt(cx, cy, rows[k + 1], a1);
        line(c, x0, y0, x1, y1, rgba(acc, 0.5), 1.4);
      }
      a = a1 + 0.1 + rnd(k * 10 + j, 8) * 0.22;
    }
  });
  c.restore();
}

function glitchRing(c, g, acc) {
  const { cx, cy, ro, ri } = g;
  c.save();
  [
    [-6, "#ff2bd6"],
    [6, "#19f0ff"],
  ].forEach(([dx, col]) => {
    c.save();
    c.translate(dx, 0);
    annulus(c, cx, cy, ro - 6, ri + 3);
    c.fillStyle = rgba(col, 0.8);
    c.fill();
    c.restore();
  });
  annulus(c, cx, cy, ro - 6, ri + 3);
  c.fillStyle = conic(c, cx, cy, ro, [[0, "#2a2038"], [0.4, "#171222"], [0.7, "#352848"], [1, "#2a2038"]]);
  c.fill();
  ringLine(c, cx, cy, ro - 8, rgba(acc, 0.8), 2);
  ringLine(c, cx, cy, ri + 6, rgba(acc, 0.5), 1.5);
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.clip();
  for (let i = 0; i < 7; i++) {
    const y = cy - ro + rnd(i, 1) * ro * 2,
      h = 3 + rnd(i, 2) * 9,
      dx = (rnd(i, 3) > 0.5 ? 1 : -1) * (8 + rnd(i, 4) * 16);
    c.fillStyle = i % 2 ? rgba(acc, 0.8) : "rgba(255,255,255,.55)";
    c.fillRect(cx - ro + dx, y, ro * 2, h * 0.5);
    if (i % 3 === 0) {
      c.globalCompositeOperation = "destination-out";
      c.fillRect(cx - ro, y + h * 0.5, ro * 2, 2);
      c.globalCompositeOperation = "source-over";
    }
  }
  c.restore();
  c.restore();
}

function rope(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    n = 44;
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = "#1d1409";
  c.fill();
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.clip();
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU,
      a1 = a0 + (TAU / n) * 1.9,
      [x0, y0] = pt(cx, cy, ri + t * 0.2, a0),
      [x1, y1] = pt(cx, cy, ro - t * 0.2, a1);
    line(c, x0, y0, x1, y1, "#2a1a0a", t * 0.52, "round");
    line(c, x0, y0, x1, y1, i % 2 ? "#b98448" : "#d9a867", t * 0.4, "round");
    line(c, x0, y0, x1, y1, "rgba(255,255,255,.18)", t * 0.1, "round");
  }
  c.restore();
  ringLine(c, cx, cy, ro - 1.5, "rgba(0,0,0,.85)", 3);
  ringLine(c, cx, cy, ri + 2, "rgba(0,0,0,.85)", 4);
  ringLine(c, cx, cy, ri + 5, rgba(acc, 0.55), 1.4);
  c.restore();
}

function heraldic(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    n = 24;
  c.save();
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU,
      a1 = ((i + 1) / n) * TAU;
    c.beginPath();
    c.arc(cx, cy, ro, a0, a1);
    c.arc(cx, cy, ri, a1, a0, true);
    c.closePath();
    c.fillStyle = i % 2 ? mix(acc, "#000000", 0.62) : acc;
    c.fill();
  }
  ringLine(c, cx, cy, ro - 2, "#d9b24a", 3);
  ringLine(c, cx, cy, ro - 4.8, "rgba(0,0,0,.55)", 1);
  ringLine(c, cx, cy, ri + 2, "#d9b24a", 3);
  ringLine(c, cx, cy, ri + 4.8, "rgba(0,0,0,.55)", 1);
  c.restore();
}

const GLYPHS = [
  [[0, -1, 0, 1], [0, -0.9, 0.8, -0.4], [0, -0.3, 0.8, 0.2]],
  [[0, -1, 0, 1], [0, -1, 0.7, 0], [0.7, 0, 0, 0.1]],
  [[-0.6, -1, -0.6, 1], [0.6, -1, 0.6, 1], [-0.6, -0.5, 0.6, 0.5]],
  [[-0.7, -1, 0, 0], [0, 0, 0.7, -1], [0, 0, 0, 1]],
  [[0, -1, 0, 1], [-0.7, -0.5, 0, 0], [0.7, -0.5, 0, 0]],
  [[-0.6, -1, 0.6, 0], [0.6, 0, -0.6, 1], [-0.6, -1, -0.6, 1]],
];
function runeStone(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = conic(c, cx, cy, ro, PAL.stone);
  c.fill();
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.clip();
  for (let i = 0; i < 160; i++) {
    const [x, y] = pt(cx, cy, ri + rnd(i, 2) * t, rnd(i, 1) * TAU);
    disc(c, x, y, 0.7 + rnd(i, 3) * 1.5);
    c.fillStyle = rnd(i, 4) > 0.5 ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.2)";
    c.fill();
  }
  c.restore();
  bevel(c, cx, cy, ro, ri);
  const n = 14,
    s = t * 0.24;
  c.save();
  c.shadowColor = acc;
  c.shadowBlur = 8;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU,
      [x, y] = pt(cx, cy, rm, a);
    c.save();
    c.translate(x, y);
    c.rotate(a + Math.PI / 2);
    GLYPHS[i % GLYPHS.length].forEach(([x0, y0, x1, y1]) =>
      line(c, x0 * s, y0 * s, x1 * s, y1 * s, rgba(acc, 0.95), 2, "round"),
    );
    c.restore();
  }
  c.restore();
  c.restore();
}

function vine(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = "#1a1f14";
  c.fill();
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.clip();
  for (let r = ri + 3, i = 0; r < ro - 2; r += 3, i++)
    ringLine(c, cx, cy, r, i % 2 ? "rgba(120,90,50,.10)" : "rgba(0,0,0,.18)", 1.5);
  c.restore();
  bevel(c, cx, cy, ro, ri);
  c.beginPath();
  for (let i = 0; i <= 360; i++) {
    const a = (i / 360) * TAU,
      [x, y] = pt(cx, cy, rm + Math.sin(a * 12) * t * 0.22, a);
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.strokeStyle = "#3f7a3a";
  c.lineWidth = 3.4;
  c.lineCap = "round";
  c.stroke();
  const n = 30;
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * TAU,
      side = i % 2 ? 1 : -1,
      [x, y] = pt(cx, cy, rm + Math.sin(a * 12) * t * 0.22, a);
    c.save();
    c.translate(x, y);
    c.rotate(a + Math.PI / 2 + side * 0.8);
    c.beginPath();
    c.ellipse(0, -6, 3.4, 7.5, 0, 0, TAU);
    c.fillStyle = i % 3 ? "#4fa04a" : "#2f6e33";
    c.fill();
    line(c, 0, 0, 0, -12, "rgba(0,0,0,.3)", 1);
    c.restore();
  }
  for (let i = 0; i < 6; i++) {
    const a = ((i + 0.25) / 6) * TAU,
      [x, y] = pt(cx, cy, rm - t * 0.18, a);
    c.save();
    c.shadowColor = acc;
    c.shadowBlur = 5;
    disc(c, x, y, 3.4);
    c.fillStyle = acc;
    c.fill();
    c.restore();
  }
  c.restore();
}

function crystal(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    n = 20;
  c.save();
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU,
      a1 = ((i + 1) / n) * TAU,
      k = rnd(i, 1),
      gr = c.createLinearGradient(...pt(cx, cy, ro, a0), ...pt(cx, cy, ri, a1));
    gr.addColorStop(0, mix(acc, "#ffffff", 0.25 + k * 0.5));
    gr.addColorStop(1, mix(acc, "#06121c", 0.35 + (1 - k) * 0.45));
    c.beginPath();
    c.arc(cx, cy, ro, a0, a1);
    c.arc(cx, cy, ri, a1, a0, true);
    c.closePath();
    c.fillStyle = gr;
    c.fill();
    const [x0, y0] = pt(cx, cy, ro, a0),
      [x1, y1] = pt(cx, cy, ri, a0);
    line(c, x0, y0, x1, y1, "rgba(255,255,255,.4)", 1);
  }
  ringLine(c, cx, cy, ro - 1.5, "rgba(255,255,255,.55)", 2);
  ringLine(c, cx, cy, ri + 1.5, "rgba(0,0,0,.6)", 3);
  c.restore();
}

function storyRing(c, g, acc) {
  const { cx, cy, ro, ri } = g;
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = conic(c, cx, cy, ro, [
    [0, acc],
    [0.4, mix(acc, "#ffffff", 0.6)],
    [0.7, mix(acc, "#000000", 0.3)],
    [1, acc],
  ]);
  c.fill();
  ringLine(c, cx, cy, ro - 1, "rgba(255,255,255,.35)", 1.5);
  seam(c, cx, cy, ri);
  c.restore();
}

function hazard(c, g) {
  const { cx, cy, ro, ri } = g;
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = "#ffd400";
  c.fill();
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.clip();
  c.translate(cx, cy);
  c.rotate(Math.PI / 4);
  c.fillStyle = "#15171b";
  for (let x = -ro * 1.5; x < ro * 1.5; x += 30) c.fillRect(x, -ro * 1.5, 15, ro * 3);
  c.restore();
  ringLine(c, cx, cy, ro - 1.5, "#15171b", 3);
  ringLine(c, cx, cy, ri + 1.5, "#15171b", 3);
  c.restore();
}

function cleanWhite(c, g) {
  const { cx, cy, ro, ri } = g;
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = conic(c, cx, cy, ro, [[0, "#ffffff"], [0.5, "#cfd6e0"], [1, "#ffffff"]]);
  c.fill();
  ringLine(c, cx, cy, ro - 1, "rgba(0,0,0,.25)", 2);
  seam(c, cx, cy, ri);
  c.restore();
}

function hud(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    rm = (ro + ri) / 2;
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = "rgba(8,14,22,.94)";
  c.fill();
  ringLine(c, cx, cy, ro - 1, rgba(acc, 0.4), 1.5);
  c.save();
  c.shadowColor = rgba(acc, 0.8);
  c.shadowBlur = 6;
  [[10, 70], [100, 160], [190, 250], [280, 340]].forEach(([a0, a1]) =>
    arc(c, cx, cy, ro - 7, a0 * DEG, a1 * DEG, rgba(acc, 0.95), 3.4),
  );
  [[30, 50], [120, 140], [210, 230], [300, 320]].forEach(([a0, a1]) =>
    arc(c, cx, cy, ri + 8, a0 * DEG, a1 * DEG, rgba(acc, 0.75), 5),
  );
  c.restore();
  ringLine(c, cx, cy, rm, rgba(acc, 0.3), 1);
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * TAU,
      [x0, y0] = pt(cx, cy, ro - 14, a),
      [x1, y1] = pt(cx, cy, ro - 17, a);
    line(c, x0, y0, x1, y1, "rgba(255,255,255,.22)", 1);
  }
  const [x, y] = pt(cx, cy, ro - 3, -Math.PI / 2);
  c.beginPath();
  c.moveTo(x, y + 10);
  c.lineTo(x - 7, y);
  c.lineTo(x + 7, y);
  c.closePath();
  c.fillStyle = acc;
  c.fill();
  seam(c, cx, cy, ri);
  c.restore();
}

function orbit(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = conic(c, cx, cy, ro, [[0, "#1b2233"], [0.3, "#3a4560"], [0.55, "#151b29"], [0.8, "#33405a"], [1, "#1b2233"]]);
  c.fill();
  ringLine(c, cx, cy, rm - t * 0.2, rgba(acc, 0.35), 1);
  ringLine(c, cx, cy, rm + t * 0.2, rgba(acc, 0.2), 1);
  arc(c, cx, cy, ro - 3, 200 * DEG, 250 * DEG, "rgba(255,255,255,.35)", 2, "round");
  [[-60, 6], [40, 4], [170, 5]].forEach(([deg, r]) => {
    const [x, y] = pt(cx, cy, rm, deg * DEG);
    c.save();
    c.shadowColor = acc;
    c.shadowBlur = 8;
    disc(c, x, y, r);
    c.fillStyle = mix(acc, "#ffffff", 0.4);
    c.fill();
    c.restore();
  });
  ringLine(c, cx, cy, ro - 1.5, "rgba(0,0,0,.7)", 3);
  seam(c, cx, cy, ri);
  c.restore();
}

function stripes70(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    cols = ["#6b2d12", "#d5671f", "#f3dfa6", acc];
  c.save();
  cols.forEach((col, i) => {
    annulus(c, cx, cy, ro - (t / 4) * i, ro - (t / 4) * (i + 1));
    c.fillStyle = col;
    c.fill();
  });
  for (let i = 1; i < 4; i++) ringLine(c, cx, cy, ro - (t / 4) * i, "rgba(0,0,0,.3)", 1);
  ringLine(c, cx, cy, ro - 1.5, "rgba(0,0,0,.7)", 3);
  ringLine(c, cx, cy, ri + 1.5, "rgba(0,0,0,.7)", 3);
  c.restore();
}

function pixel(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    s = 8,
    rm = (ro + ri) / 2;
  c.save();
  for (let gx = Math.floor((cx - ro) / s) * s; gx < cx + ro; gx += s)
    for (let gy = Math.floor((cy - ro) / s) * s; gy < cy + ro; gy += s) {
      const d = Math.hypot(gx + s / 2 - cx, gy + s / 2 - cy);
      if (d > ro || d < ri) continue;
      const light = gx + gy < cx + cy;
      let col = d > ro - s ? "#10131c" : d < ri + s ? "#0b0d15" : d > rm - s / 2 && d < rm + s / 2 ? acc : "#222737";
      if (col === acc && light) col = mix(acc, "#ffffff", 0.35);
      else if (col === "#222737" && light) col = "#313a52";
      c.fillStyle = col;
      c.fillRect(gx, gy, s, s);
    }
  c.restore();
}

function chain(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    n = 30;
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = "rgba(10,11,13,.9)";
  c.fill();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU,
      [x, y] = pt(cx, cy, rm, a),
      face = i % 2 === 0;
    c.beginPath();
    c.ellipse(x, y, ((TAU * rm) / n) * 0.78, face ? t * 0.34 : t * 0.12, a + Math.PI / 2, 0, TAU);
    c.strokeStyle = "#15171a";
    c.lineWidth = 6;
    c.stroke();
    c.strokeStyle = face ? "#9097a1" : "#6c727c";
    c.lineWidth = 3;
    c.stroke();
    c.strokeStyle = "rgba(255,255,255,.28)";
    c.lineWidth = 1;
    c.stroke();
  }
  ringLine(c, cx, cy, ri + 1.5, rgba(acc, 0.4), 1.4);
  seam(c, cx, cy, ri);
  c.restore();
}

function thorns(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  annulus(c, cx, cy, ro, ri);
  c.fillStyle = "#170d10";
  c.fill();
  bevel(c, cx, cy, ro, ri);
  for (let k = 0; k < 2; k++) {
    c.beginPath();
    for (let i = 0; i <= 360; i++) {
      const a = (i / 360) * TAU,
        [x, y] = pt(cx, cy, rm + Math.sin(a * 9 + k * 2) * t * 0.2, a);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.strokeStyle = k ? "#4a2a2a" : "#2b1719";
    c.lineWidth = k ? 4 : 7;
    c.lineCap = "round";
    c.stroke();
  }
  const n = 34;
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * TAU,
      dir = i % 2 ? 1 : -1,
      [x, y] = pt(cx, cy, rm + Math.sin(a * 9) * t * 0.2, a),
      [tx, ty] = pt(cx, cy, rm + dir * (t / 2 - 3) + Math.sin(a * 9) * t * 0.2, a + dir * 0.05);
    c.beginPath();
    c.moveTo(x - Math.sin(a) * 2.6, y + Math.cos(a) * 2.6);
    c.lineTo(tx, ty);
    c.lineTo(x + Math.sin(a) * 2.6, y - Math.cos(a) * 2.6);
    c.closePath();
    c.fillStyle = "#cdbf9c";
    c.fill();
    if (i % 6 === 0) {
      disc(c, tx, ty, 2.2);
      c.fillStyle = acc;
      c.fill();
    }
  }
  c.restore();
}

/* ------------------------------ catalogue ------------------------------ */
const CY = "Cyberpunk & néon",
  ME = "Médiéval",
  FA = "Fantastique",
  CO = "Contemporain",
  FU = "Futuriste",
  RE = "Rétro",
  HO = "Horreur";

export const RINGS = {
  "cyber-metal": { cat: CY, label: "Acier brossé (sobre)", thickness: 0.075, draw: metalRing({ pal: PAL.steel, ticks: { n: 72, major: 6 }, groove: { segs: [[-78, -38], [102, 142]] }, studs: { n: 4, style: "screw" } }) },
  "neon-tube": { cat: CY, label: "Tube néon", thickness: 0.07, draw: neonTube },
  circuit: { cat: CY, label: "Circuit imprimé", thickness: 0.08, draw: circuit },
  "glitch-ring": { cat: CY, label: "Signal instable", thickness: 0.075, draw: glitchRing },
  "gold-ornate": { cat: ME, label: "Or ouvragé", thickness: 0.08, draw: metalRing({ pal: PAL.gold, groove: { color: "#f6e08a", base: 7, line: 1.4 }, studs: { n: 32, style: "pearl", at: 31, off: 0 }, gems: 4 }) },
  "iron-rivet": { cat: ME, label: "Fer riveté", thickness: 0.08, draw: metalRing({ pal: PAL.iron, groove: { base: 3, alpha: 0, line: 0.1, at: 25 }, studs: { n: 12, style: "rivet", at: 25 } }) },
  rope: { cat: ME, label: "Corde torsadée", thickness: 0.085, draw: rope },
  heraldic: { cat: ME, label: "Blason échiqueté", thickness: 0.075, draw: heraldic },
  "rune-stone": { cat: FA, label: "Pierre runique", thickness: 0.085, draw: runeStone },
  vine: { cat: FA, label: "Lierre", thickness: 0.085, draw: vine },
  crystal: { cat: FA, label: "Cristal facetté", thickness: 0.075, draw: crystal },
  "story-ring": { cat: CO, label: "Dégradé réseau", thickness: 0.05, draw: storyRing },
  hazard: { cat: CO, label: "Bande de danger", thickness: 0.07, draw: hazard },
  "clean-white": { cat: CO, label: "Liseré blanc épuré", thickness: 0.035, draw: cleanWhite },
  hud: { cat: FU, label: "HUD segmenté", thickness: 0.07, draw: hud },
  orbit: { cat: FU, label: "Orbite", thickness: 0.06, draw: orbit },
  titanium: { cat: FU, label: "Titane à LED", thickness: 0.075, draw: metalRing({ pal: PAL.titanium, groove: { base: 5, alpha: 0.2, line: 1.2 }, studs: { n: 36, style: "led", at: 30, off: 0 } }) },
  "chrome-50s": { cat: RE, label: "Chrome 50s", thickness: 0.08, draw: metalRing({ pal: PAL.chrome, grain: false, groove: { at: 22, base: 10, line: 5.5, alpha: 0.95 } }) },
  "stripes-70s": { cat: RE, label: "Rayures 70s", thickness: 0.085, draw: stripes70 },
  pixel: { cat: RE, label: "Pixel 8-bit", thickness: 0.08, draw: pixel },
  rusted: { cat: HO, label: "Fer rouillé", thickness: 0.08, draw: metalRing({ pal: PAL.rust, stains: "rgba(140,60,18,.5)", groove: { base: 3, alpha: 0, line: 0.1, at: 25 }, studs: { n: 8, style: "rivet", at: 25 } }) },
  chain: { cat: HO, label: "Chaîne", thickness: 0.085, draw: chain },
  thorns: { cat: HO, label: "Ronces et épines", thickness: 0.09, draw: thorns },
};

/** Catégories dans l'ordre d'affichage (identiques aux thèmes de carte). */
export const RING_CATS = [CY, ME, FA, CO, FU, RE, HO];

/* ------------------------------ lien avec les thèmes de carte ------------------------------ */
const BY_CAT = { [CY]: "cyber-metal", [ME]: "gold-ornate", [FA]: "rune-stone", [CO]: "story-ring", [FU]: "hud", [RE]: "chrome-50s", [HO]: "rusted" };

const BY_THEME = {
  // Cyberpunk & néon
  standard: "cyber-metal", chrome: "cyber-metal", rue: "neon-tube", corpo: "titanium", glitch: "glitch-ring", terminal: "circuit", noir: "iron-rivet", holo: "hud", neon: "neon-tube", tactic: "titanium", synth: "neon-tube", hacker: "circuit", yakuza: "neon-tube", pluie: "neon-tube",
  // Médiéval
  parchemin: "rope", heraldic: "heraldic", enluminure: "gold-ornate", forteresse: "iron-rivet", taverne: "rope", chevalier: "iron-rivet", scriptorium: "gold-ornate", royaume: "gold-ornate",
  // Fantastique
  arcane: "rune-stone", sylvestre: "vine", draconique: "rune-stone", feerique: "vine", cristal: "crystal", necromancie: "rune-stone", elementaire: "rune-stone", celeste: "gold-ornate",
  // Contemporain
  urbain: "story-ring", magazine: "clean-white", instantane: "clean-white", police: "hazard", social: "story-ring", medical: "clean-white", startup: "story-ring", stade: "titanium",
  // Futuriste
  orbital: "orbit", mecha: "titanium", biotech: "hud", quantique: "orbit", sentinelle: "hud", cryo: "crystal", colonie: "titanium", nexus: "orbit",
  // Rétro
  arcade: "pixel", seventies: "stripes-70s", western: "rope", diner: "chrome-50s", vhs: "glitch-ring", memphis: "stripes-70s", pulp: "chrome-50s", atomic: "chrome-50s",
  // Horreur
  cthulhu: "rusted", annees1900: "iron-rivet", slasher: "thorns", fantome: "chain", gothique: "thorns", zombie: "rusted", sorcellerie: "rune-stone", asile: "chain",
};

/** Anneau suggéré pour un thème de carte. */
export const ringForTheme = (theme) =>
  BY_THEME[theme] || BY_CAT[THEMES[theme]?.cat] || FALLBACK_RING;

/** Identifiant de l'anneau effectivement utilisé (« auto » => selon le thème de la carte). */
export const ringIdFor = (d) =>
  RINGS[d.tokenRing] ? d.tokenRing : ringForTheme(d.theme);
