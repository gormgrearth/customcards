/** Anneaux — Fantastique. */
import {
  PAL, TAU, DEG, accentLip, annulus, arc, bevel, clipRing, conic, disc, fillRing, glow, line,
  metalRing, mix, pt, rgba, ringLine, ringText, rnd, seam,
} from "../ring-tools.js";

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


/* ---------- nouveaux anneaux ---------- */
/** Arcane : cercle magique — filets lumineux, symboles alchimiques. */
function arcaneCircle(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    n = 16,
    s = t * 0.2;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#1a0f38"], [0.5, "#0e0720"], [1, "#1a0f38"]]));
  glow(c, rgba(acc, 0.8), 6, () => {
    [ro - 4, ri + 4].forEach((r) => ringLine(c, cx, cy, r, rgba(acc, 0.95), 1.8));
    c.setLineDash([14, 6]);
    [ro - 11, ri + 11].forEach((r) => ringLine(c, cx, cy, r, rgba(acc, 0.45), 1.2));
    c.setLineDash([]);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU,
        [x, y] = pt(cx, cy, rm, a);
      c.save();
      c.translate(x, y);
      c.rotate(a + Math.PI / 2);
      c.strokeStyle = rgba(acc, 0.95);
      c.lineWidth = 1.7;
      c.beginPath();
      if (i % 4 === 0) {
        c.arc(0, 0, s, 0, TAU);
        c.moveTo(s * 0.25, 0);
        c.arc(0, 0, s * 0.25, 0, TAU);
      } else if (i % 4 === 1) {
        c.moveTo(0, -s);
        c.lineTo(s * 0.9, s * 0.7);
        c.lineTo(-s * 0.9, s * 0.7);
        c.closePath();
      } else if (i % 4 === 2) {
        c.moveTo(0, -s);
        c.lineTo(s * 0.7, 0);
        c.lineTo(0, s);
        c.lineTo(-s * 0.7, 0);
        c.closePath();
      } else {
        c.moveTo(-s, 0);
        c.lineTo(s, 0);
        c.moveTo(0, -s);
        c.lineTo(0, s);
        c.moveTo(-s * 0.6, -s * 0.6);
        c.lineTo(s * 0.6, s * 0.6);
      }
      c.stroke();
      c.restore();
      const [x2, y2] = pt(cx, cy, rm, a + Math.PI / n);
      disc(c, x2, y2, 1.6);
      c.fillStyle = rgba(acc, 0.9);
      c.fill();
    }
  });
  c.restore();
}

/** Draconique : écailles pointues qui se chevauchent, arêtes incandescentes. */
function dragonScale(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    n = 36,
    s = t * 0.58;
  c.save();
  fillRing(c, g, "#1a0604");
  clipRing(c, g);
  [[0.8, 0], [0.4, 0.5]].forEach(([f, off]) => {
    for (let i = 0; i < n; i++) {
      const a = ((i + off) / n) * TAU,
        [x, y] = pt(cx, cy, ri + t * f - s * 0.25, a);
      c.save();
      c.translate(x, y);
      c.rotate(a - Math.PI / 2);
      c.beginPath();
      c.moveTo(-s * 0.8, -s * 0.3);
      c.bezierCurveTo(-s * 0.9, s * 0.5, -s * 0.35, s * 0.95, 0, s * 1.15);
      c.bezierCurveTo(s * 0.35, s * 0.95, s * 0.9, s * 0.5, s * 0.8, -s * 0.3);
      c.closePath();
      const gr = c.createLinearGradient(0, -s * 0.3, 0, s * 1.1);
      gr.addColorStop(0, "#2a0a06");
      gr.addColorStop(1, mix(acc, "#1a0604", 0.55));
      c.fillStyle = gr;
      c.fill();
      c.strokeStyle = rgba(acc, 0.9);
      c.lineWidth = 1.8;
      c.stroke();
      line(c, 0, -s * 0.1, 0, s * 0.8, rgba(acc, 0.35), 1);
      c.restore();
    }
  });
  c.restore();
  glow(c, rgba(acc, 0.8), 7, () => {
    ringLine(c, cx, cy, ro - 1.5, rgba(acc, 0.9), 2);
    ringLine(c, cx, cy, ri + 1.5, rgba(acc, 0.9), 2);
  });
}

/** Féerique : pétales pastel et éclats de lumière. */
function petals(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    n = 18;
  c.save();
  fillRing(c, g, "#1d0f2e");
  [[1, 0, 0.5, 0.2, acc], [2, 0.5, 0.36, 0.15, mix(acc, "#ffffff", 0.55)]].forEach(([, off, rx, ry, col]) => {
    for (let i = 0; i < n; i++) {
      const a = ((i + off) / n) * TAU,
        [x, y] = pt(cx, cy, rm, a),
        gr = c.createRadialGradient(x, y, 0, x, y, t * rx);
      gr.addColorStop(0, "#ffffff");
      gr.addColorStop(1, col);
      c.beginPath();
      c.ellipse(x, y, t * rx, t * ry * 1.6, a, 0, TAU);
      c.fillStyle = gr;
      c.fill();
      c.strokeStyle = "rgba(255,255,255,.55)";
      c.lineWidth = 1;
      c.stroke();
    }
  });
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(cx, cy, rm, (i / n) * TAU);
    disc(c, x, y, 2.2);
    c.fillStyle = "#ffe9a8";
    c.fill();
  }
  glow(c, "#ffffff", 6, () => {
    for (let i = 0; i < 8; i++) {
      const [x, y] = pt(cx, cy, ri + 6 + rnd(i, 2) * (t - 12), rnd(i, 1) * TAU),
        s = 3.5 + rnd(i, 3) * 3;
      line(c, x - s, y, x + s, y, "rgba(255,255,255,.95)", 1.3);
      line(c, x, y - s, x, y + s, "rgba(255,255,255,.95)", 1.3);
    }
  });
  c.restore();
}

/** Nécromancie : flammes d'âmes spectrales. */
function soulFlames(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    n = 26,
    w = ((TAU * ri) / n) * 0.42;
  c.save();
  fillRing(c, g, "#07141a");
  for (let pass = 0; pass < 2; pass++)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU,
        [x, y] = pt(cx, cy, ri + 3, a),
        h = (t - 4) * (0.55 + rnd(i, 1) * 0.45) * (pass ? 0.6 : 1),
        sway = (rnd(i, 2) - 0.5) * w * 1.2,
        ww = pass ? w * 0.55 : w;
      c.save();
      c.translate(x, y);
      c.rotate(a - Math.PI / 2);
      c.beginPath();
      c.moveTo(-ww, 0);
      c.bezierCurveTo(-ww, h * 0.4, -ww * 0.3, h * 0.62, sway, h);
      c.bezierCurveTo(ww * 0.3, h * 0.62, ww, h * 0.4, ww, 0);
      c.closePath();
      const gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, pass ? "rgba(255,255,255,.85)" : rgba(acc, 0.9));
      gr.addColorStop(1, pass ? mix(acc, "#ffffff", 0.5) + "00" : rgba(acc, 0.05));
      c.shadowColor = acc;
      c.shadowBlur = pass ? 0 : 8;
      c.fillStyle = gr;
      c.fill();
      c.restore();
    }
  ringLine(c, cx, cy, ri + 1.5, "rgba(0,0,0,.8)", 3);
  c.restore();
}

/** Élémentaire : basalte et fissures de magma. */
function magma(c, g, acc) {
  const { cx, cy, ro, ri } = g;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#232124"], [0.3, "#161416"], [0.6, "#2c292d"], [1, "#232124"]]));
  clipRing(c, g);
  for (let i = 0; i < 180; i++) {
    const [x, y] = pt(cx, cy, ri + rnd(i, 2) * (ro - ri), rnd(i, 1) * TAU);
    disc(c, x, y, 0.6 + rnd(i, 3) * 1.4);
    c.fillStyle = rnd(i, 4) > 0.5 ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.35)";
    c.fill();
  }
  for (let k = 0; k < 18; k++) {
    const a = rnd(k, 5) * TAU;
    let [x, y] = pt(cx, cy, ri + 4 + rnd(k, 6) * (ro - ri - 8), a),
      dir = a + Math.PI / 2 + (rnd(k, 7) - 0.5) * 1.2;
    const pts = [[x, y]];
    for (let s = 0; s < 7; s++) {
      dir += (rnd(k * 10 + s, 8) - 0.5) * 1.1;
      const len = 10 + rnd(k * 10 + s, 9) * 16;
      x += Math.cos(dir) * len;
      y += Math.sin(dir) * len;
      pts.push([x, y]);
    }
    [[8, 0.35, acc], [2.6, 0.97, mix(acc, "#fff2c8", 0.65)]].forEach(([w, al, col]) => {
      c.beginPath();
      pts.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py)));
      c.strokeStyle = col.length === 7 ? rgba(col, al) : col;
      c.lineWidth = w;
      c.lineJoin = "round";
      c.lineCap = "round";
      c.stroke();
    });
  }
  c.restore();
  glow(c, acc, 9, () => {
    ringLine(c, cx, cy, ro - 1.5, rgba(acc, 0.9), 2);
    ringLine(c, cx, cy, ri + 1.5, rgba(acc, 0.9), 2);
  });
}

/** Céleste : voûte étoilée, constellation et croissant de lune. */
function celestial(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#0a0f3a"], [0.3, "#1a2266"], [0.6, "#0c1244"], [1, "#0a0f3a"]]));
  clipRing(c, g);
  for (let i = 0; i < 110; i++) {
    const [x, y] = pt(cx, cy, ri + rnd(i, 2) * t, rnd(i, 1) * TAU);
    disc(c, x, y, 0.5 + rnd(i, 3) * 1.4);
    c.fillStyle = rnd(i, 4) > 0.7 ? rgba(acc, 0.9) : "rgba(255,255,255,.75)";
    c.fill();
  }
  const pts = [];
  for (let i = 0; i < 8; i++) pts.push(pt(cx, cy, rm + (rnd(i, 6) - 0.5) * t * 0.6, 20 * DEG + i * 0.2));
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.strokeStyle = rgba(acc, 0.55);
  c.lineWidth = 1;
  c.stroke();
  glow(c, acc, 6, () =>
    pts.forEach(([x, y]) => {
      disc(c, x, y, 2.6);
      c.fillStyle = acc;
      c.fill();
    }),
  );
  c.restore();
  const [mx, my] = pt(cx, cy, rm, -Math.PI / 2);
  glow(c, acc, 8, () => {
    disc(c, mx, my, t * 0.34);
    c.fillStyle = acc;
    c.fill();
  });
  disc(c, mx + t * 0.14, my - t * 0.06, t * 0.3);
  c.fillStyle = "#0e1544";
  c.fill();
  [ro - 2, ri + 2].forEach((r) => ringLine(c, cx, cy, r, rgba(acc, 0.9), 1.8));
  c.restore();
}

/** Anneaux de la catégorie (accent: true = la couleur d'accent est déjà bien visible). */
export const FANTASY = {
  "arcane-circle": { label: "Cercle arcanique", thickness: 0.08, accent: true, draw: arcaneCircle },
  vine: { label: "Lierre", thickness: 0.085, draw: vine },
  "dragon-scale": { label: "Écailles de dragon", thickness: 0.085, accent: true, draw: dragonScale },
  petals: { label: "Pétales féeriques", thickness: 0.085, accent: true, draw: petals },
  crystal: { label: "Cristal facetté", thickness: 0.075, accent: true, draw: crystal },
  "soul-flames": { label: "Flammes d'âmes", thickness: 0.085, accent: true, draw: soulFlames },
  magma: { label: "Magma", thickness: 0.08, accent: true, draw: magma },
  celestial: { label: "Voûte céleste", thickness: 0.085, accent: true, draw: celestial },
  "rune-stone": { label: "Pierre runique", thickness: 0.085, accent: true, draw: runeStone },
};
