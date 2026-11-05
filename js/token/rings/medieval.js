/** Anneaux — Médiéval. */
import {
  PAL, TAU, DEG, accentLip, annulus, arc, bevel, clipRing, conic, disc, fillRing, glow, line,
  metalRing, mix, pt, rgba, ringLine, ringText, rnd, seam,
} from "../ring-tools.js";

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


/* ---------- nouveaux anneaux ---------- */
/** Parchemin : papier vieilli au bord déchiré, filets d'encre, sceaux de couleur. */
function parchment(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  c.beginPath();
  for (let i = 0; i <= 220; i++) {
    const [x, y] = pt(cx, cy, ro - 2.5 + (rnd(i, 1) - 0.5) * 5, (i / 220) * TAU);
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.closePath();
  c.moveTo(cx + ri, cy);
  c.arc(cx, cy, ri, 0, TAU, true);
  c.fillStyle = conic(c, cx, cy, ro, [[0, "#e8d3a0"], [0.25, "#d6bb82"], [0.5, "#ead8aa"], [0.75, "#cfb176"], [1, "#e8d3a0"]]);
  c.fill();
  clipRing(c, g);
  for (let i = 0; i < 22; i++) {
    const [x, y] = pt(cx, cy, ri + rnd(i, 2) * t, rnd(i, 1) * TAU),
      s = 6 + rnd(i, 3) * 14,
      gr = c.createRadialGradient(x, y, 0, x, y, s);
    gr.addColorStop(0, "rgba(120,80,30,.26)");
    gr.addColorStop(1, "rgba(120,80,30,0)");
    c.fillStyle = gr;
    c.fillRect(x - s, y - s, s * 2, s * 2);
  }
  c.restore();
  [ro - 10, ri + 10].forEach((r) => ringLine(c, cx, cy, r, "#3a2512", 1.6));
  [ro - 14, ri + 14].forEach((r) => ringLine(c, cx, cy, r, "rgba(58,37,18,.6)", 0.9));
  for (let i = 0; i < 52; i++) {
    const a = (i / 52) * TAU,
      [x0, y0] = pt(cx, cy, rm - 3.5, a),
      [x1, y1] = pt(cx, cy, rm + 3.5, a);
    line(c, x0, y0, x1, y1, "rgba(58,37,18,.75)", 1.2);
  }
  for (let k = 0; k < 4; k++) {
    const [x, y] = pt(cx, cy, rm, k * 90 * DEG),
      gr = c.createRadialGradient(x - 2, y - 2, 0, x, y, 7);
    gr.addColorStop(0, mix(acc, "#ffffff", 0.6));
    gr.addColorStop(1, mix(acc, "#3a1f06", 0.45));
    disc(c, x, y, 6);
    c.fillStyle = gr;
    c.fill();
    c.strokeStyle = "#3a2512";
    c.lineWidth = 1.2;
    c.stroke();
  }
  ringLine(c, cx, cy, ri + 1.5, "rgba(60,30,10,.5)", 3);
  c.restore();
}

/** Enluminure : lapis-lazuli, losanges et points vermillon rehaussés d'or. */
function illuminated(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    rm = (ro + ri) / 2,
    n = 34;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#16205a"], [0.5, "#0f1744"], [1, "#16205a"]]));
  [ro - 4, ri + 4].forEach((r) => ringLine(c, cx, cy, r, acc, 2.4));
  [ro - 8, ri + 8].forEach((r) => ringLine(c, cx, cy, r, rgba(acc, 0.5), 1));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU,
      [x, y] = pt(cx, cy, rm, a);
    c.save();
    c.translate(x, y);
    c.rotate(a + Math.PI / 2);
    c.beginPath();
    c.moveTo(0, -11);
    c.lineTo(9, 0);
    c.lineTo(0, 11);
    c.lineTo(-9, 0);
    c.closePath();
    c.strokeStyle = acc;
    c.lineWidth = 1.8;
    c.stroke();
    disc(c, 0, 0, 2.6);
    c.fillStyle = acc;
    c.fill();
    c.restore();
    const [x2, y2] = pt(cx, cy, rm, a + Math.PI / n);
    disc(c, x2, y2, 2.8);
    c.fillStyle = "#c8341f";
    c.fill();
    c.strokeStyle = acc;
    c.lineWidth = 1;
    c.stroke();
  }
  c.restore();
}

/** Forteresse : créneaux de pierre (merlons) autour d'un chemin de ronde. */
function battlement(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rb = ri + t * 0.46,
    n = 20,
    stone = conic(c, cx, cy, ro, [[0, mix(acc, "#000000", 0.55)], [0.25, mix(acc, "#000000", 0.35)], [0.5, mix(acc, "#000000", 0.62)], [0.75, mix(acc, "#000000", 0.4)], [1, mix(acc, "#000000", 0.55)]]);
  c.save();
  fillRing(c, g, "#08090a");
  annulus(c, cx, cy, rb, ri);
  c.fillStyle = stone;
  c.fill();
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * TAU,
      [x0, y0] = pt(cx, cy, ri, a),
      [x1, y1] = pt(cx, cy, rb, a);
    line(c, x0, y0, x1, y1, "rgba(0,0,0,.45)", 1.2);
  }
  ringLine(c, cx, cy, rb, "rgba(0,0,0,.65)", 2);
  for (let i = 0; i < n; i++) {
    const a0 = ((i + 0.18) / n) * TAU,
      a1 = ((i + 0.82) / n) * TAU;
    c.beginPath();
    c.arc(cx, cy, ro - 2, a0, a1);
    c.arc(cx, cy, rb - 1, a1, a0, true);
    c.closePath();
    c.fillStyle = stone;
    c.fill();
    c.strokeStyle = "rgba(0,0,0,.75)";
    c.lineWidth = 1.6;
    c.stroke();
    arc(c, cx, cy, ro - 4.5, a0 + 0.02, a1 - 0.02, "rgba(255,255,255,.28)", 2);
  }
  ringLine(c, cx, cy, ri + 2, "rgba(0,0,0,.85)", 4);
  c.restore();
}

/** Taverne : douelles de tonneau, cerclages de fer et clous de laiton. */
function barrel(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    n = 40,
    tones = ["#6b4423", "#7a4f2a", "#5d3b1d", "#835a31"];
  c.save();
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU,
      a1 = ((i + 1) / n) * TAU;
    c.beginPath();
    c.arc(cx, cy, ro, a0, a1);
    c.arc(cx, cy, ri, a1, a0, true);
    c.closePath();
    c.fillStyle = tones[(rnd(i, 1) * 4) | 0];
    c.fill();
    const [x0, y0] = pt(cx, cy, ri, a0),
      [x1, y1] = pt(cx, cy, ro, a0);
    line(c, x0, y0, x1, y1, "rgba(0,0,0,.65)", 1.6);
    const am = (a0 + a1) / 2 + (rnd(i, 2) - 0.5) * 0.05,
      [gx0, gy0] = pt(cx, cy, ri + 12, am),
      [gx1, gy1] = pt(cx, cy, ro - 12, am);
    line(c, gx0, gy0, gx1, gy1, "rgba(0,0,0,.22)", 1);
  }
  [ [ri + 2, ri + 11], [ro - 11, ro - 2] ].forEach(([r0, r1], k) => {
    annulus(c, cx, cy, r1, r0);
    c.fillStyle = conic(c, cx, cy, ro, PAL.iron);
    c.fill();
    ringLine(c, cx, cy, r1 - 1, "rgba(255,255,255,.18)", 1);
    ringLine(c, cx, cy, r0 + 0.5, "rgba(0,0,0,.7)", 1.4);
    for (let i = 0; i < 24; i++) {
      const [x, y] = pt(cx, cy, (r0 + r1) / 2, ((i + k * 0.5) / 24) * TAU);
      disc(c, x, y, 2.3);
      c.fillStyle = acc;
      c.fill();
      c.strokeStyle = "rgba(0,0,0,.7)";
      c.lineWidth = 0.9;
      c.stroke();
    }
  });
  c.restore();
}

/** Scriptorium : méandre grec doré sur fond brun. */
function greekKey(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    n = 26,
    u = (TAU * rm) / n,
    h = t * 0.6;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#2a1c0e"], [0.5, "#150d06"], [1, "#2a1c0e"]]));
  [ro - 4, ri + 4].forEach((r) => ringLine(c, cx, cy, r, acc, 1.8));
  ringLine(c, cx, cy, rm + h / 2, acc, 2);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU,
      [x, y] = pt(cx, cy, rm, a);
    c.save();
    c.translate(x, y);
    c.rotate(a + Math.PI / 2);
    c.beginPath();
    [[-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5], [0.5, 0.2], [-0.12, 0.2], [-0.12, -0.12], [0.2, -0.12]].forEach(([px, py], k) =>
      k ? c.lineTo(px * u, py * h) : c.moveTo(px * u, py * h),
    );
    c.strokeStyle = acc;
    c.lineWidth = 2.4;
    c.lineJoin = "miter";
    c.lineCap = "square";
    c.stroke();
    c.restore();
  }
  c.restore();
}

/** Anneaux de la catégorie (accent: true = la couleur d'accent est déjà bien visible). */
export const MEDIEVAL = {
  parchment: { label: "Parchemin", thickness: 0.085, accent: true, draw: parchment },
  heraldic: { label: "Blason échiqueté", thickness: 0.075, accent: true, draw: heraldic },
  illuminated: { label: "Enluminure", thickness: 0.08, accent: true, draw: illuminated },
  battlement: { label: "Créneaux de pierre", thickness: 0.085, draw: battlement },
  barrel: { label: "Tonneau cerclé", thickness: 0.085, accent: true, draw: barrel },
  "iron-rivet": { label: "Fer riveté", thickness: 0.08, draw: metalRing({ pal: PAL.iron, groove: { base: 3, alpha: 0, line: 0.1, at: 25 }, studs: { n: 12, style: "rivet", at: 25 } }) },
  "greek-key": { label: "Méandre grec", thickness: 0.08, accent: true, draw: greekKey },
  "gold-ornate": { label: "Or ouvragé", thickness: 0.08, accent: true, draw: metalRing({ pal: PAL.gold, groove: { color: "#f6e08a", base: 7, line: 1.4 }, studs: { n: 32, style: "pearl", at: 31, off: 0 }, gems: 4 }) },
  rope: { label: "Corde torsadée", thickness: 0.085, draw: rope },
};
