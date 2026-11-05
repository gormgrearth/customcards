/** Anneaux — Horreur. */
import {
  PAL, TAU, DEG, accentLip, annulus, arc, bevel, clipRing, conic, disc, fillRing, glow, line,
  metalRing, mix, pt, rgba, ringLine, ringText, rnd, seam,
} from "../ring-tools.js";

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


/* ---------- nouveaux anneaux ---------- */
/** Cthulhu : tentacule couvert de ventouses. */
function tentacle(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    path = () => {
      c.beginPath();
      for (let i = 0; i <= 360; i++) {
        const a = (i / 360) * TAU,
          [x, y] = pt(cx, cy, rm + Math.sin(a * 5) * t * 0.17, a);
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.closePath();
      c.lineJoin = "round";
    };
  c.save();
  fillRing(c, g, "#07181a");
  [[t * 0.52, mix(acc, "#000000", 0.78)], [t * 0.42, mix(acc, "#000000", 0.55)], [t * 0.12, "rgba(255,255,255,.16)"]].forEach(([w, col]) => {
    path();
    c.strokeStyle = col;
    c.lineWidth = w;
    c.stroke();
  });
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * TAU,
      [x, y] = pt(cx, cy, rm + Math.sin(a * 5) * t * 0.17 + t * 0.09, a);
    disc(c, x, y, 3.2);
    c.fillStyle = mix(acc, "#ffffff", 0.55);
    c.fill();
    c.strokeStyle = "rgba(0,0,0,.6)";
    c.lineWidth = 1;
    c.stroke();
    disc(c, x, y, 1.1);
    c.fillStyle = "#0b2a2a";
    c.fill();
  }
  [ro - 1.5, ri + 1.5].forEach((r) => ringLine(c, cx, cy, r, "rgba(0,0,0,.8)", 3));
  c.restore();
}

/** Années 1900 : roue dentée en laiton, trous et rivets. */
function gear(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    n = 36,
    p = TAU / n,
    tooth = t * 0.22;
  c.save();
  c.beginPath();
  for (let i = 0; i < n; i++) {
    const a = i * p,
      pts = [[ro - tooth, a - 0.42 * p], [ro, a - 0.27 * p], [ro, a + 0.27 * p], [ro - tooth, a + 0.42 * p]];
    pts.forEach(([r, aa], k) => {
      const [x, y] = pt(cx, cy, r, aa);
      i === 0 && k === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
    });
  }
  c.closePath();
  c.moveTo(cx + ri, cy);
  c.arc(cx, cy, ri, 0, TAU, true);
  c.fillStyle = conic(c, cx, cy, ro, [[0, mix(acc, "#000000", 0.55)], [0.12, mix(acc, "#ffffff", 0.4)], [0.3, mix(acc, "#000000", 0.45)], [0.5, acc], [0.7, mix(acc, "#000000", 0.6)], [0.88, mix(acc, "#ffffff", 0.3)], [1, mix(acc, "#000000", 0.55)]]);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,.75)";
  c.lineWidth = 1.6;
  c.stroke();
  for (let i = 0; i < 12; i++) {
    const [x, y] = pt(cx, cy, rm - tooth * 0.4, ((i + 0.5) / 12) * TAU);
    disc(c, x, y, t * 0.14);
    c.fillStyle = "#1a1208";
    c.fill();
    arc(c, x, y, t * 0.14, 0.4, 2.6, "rgba(255,255,255,.35)", 1.2);
  }
  for (let i = 0; i < 36; i++) {
    const [x, y] = pt(cx, cy, ri + 5, (i / 36) * TAU);
    disc(c, x, y, 1.6);
    c.fillStyle = "rgba(0,0,0,.55)";
    c.fill();
  }
  ringLine(c, cx, cy, ri + 2, "rgba(0,0,0,.8)", 4);
  c.restore();
}

/** Slasher : verre noir, griffures, éclaboussures et coulures de sang. */
function blood(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#1a0407"], [0.4, "#070102"], [0.7, "#220609"], [1, "#1a0407"]]));
  clipRing(c, g);
  for (let i = 0; i < 7; i++) {
    const x = cx + (rnd(i, 1) * 2 - 1) * ro,
      y = cy + (rnd(i, 2) * 2 - 1) * ro;
    line(c, x, y, x + 40 + rnd(i, 3) * 60, y + 40 + rnd(i, 3) * 60, "rgba(255,255,255,.12)", 1.2);
  }
  for (let i = 0; i < 7; i++) arc(c, cx, cy, ro - 6 - rnd(i, 4) * 6, rnd(i, 5) * TAU, rnd(i, 5) * TAU + 0.3 + rnd(i, 6) * 0.7, rgba(acc, 0.9), 5 + rnd(i, 7) * 5, "round");
  for (let i = 0; i < 90; i++) {
    const [x, y] = pt(cx, cy, ri + rnd(i, 8) * t, rnd(i, 9) * TAU);
    disc(c, x, y, 0.7 + rnd(i, 10) * 2.2);
    c.fillStyle = rgba(acc, 0.55 + rnd(i, 11) * 0.4);
    c.fill();
  }
  c.restore();
  glow(c, rgba(acc, 0.7), 6, () => ringLine(c, cx, cy, ri + 1.5, rgba(acc, 0.9), 2));
  for (let i = 0; i < 9; i++) {
    const deg = -150 + i * 14 + rnd(i, 3) * 6,
      [x, y] = pt(cx, cy, rm + (rnd(i, 2) - 0.5) * t * 0.4, deg * DEG),
      len = 14 + rnd(i, 4) * 26;
    line(c, x, y, x, y + len, rgba(acc, 0.97), 4.4, "round");
    disc(c, x, y + len, 4.6);
    c.fillStyle = rgba(acc, 0.97);
    c.fill();
  }
}

/** Zombie : fil barbelé torsadé, pointes toxiques. */
function barbedWire(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    A = t * 0.18,
    k = 14;
  c.save();
  fillRing(c, g, "#0d1204");
  [-1, 1].forEach((sg, idx) => {
    c.beginPath();
    for (let i = 0; i <= 900; i++) {
      const a = (i / 900) * TAU,
        [x, y] = pt(cx, cy, rm + sg * A * Math.sin(k * a), a);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.closePath();
    c.strokeStyle = "#5d636b";
    c.lineWidth = 3.4;
    c.stroke();
    c.strokeStyle = idx ? "#c9cfd6" : "#9aa0a8";
    c.lineWidth = 1.5;
    c.stroke();
  });
  glow(c, rgba(acc, 0.9), 5, () => {
    for (let j = 0; j < k; j++) {
      const a = ((j * 2 + 1) / (2 * k)) * TAU,
        [x, y] = pt(cx, cy, rm, a),
        rot = a + (rnd(j, 1) - 0.5) * 0.8,
        s = t * 0.36;
      for (const d of [0.7, -0.7]) {
        const dx = Math.cos(rot + d) * s,
          dy = Math.sin(rot + d) * s;
        line(c, x - dx, y - dy, x + dx, y + dy, "#d3d8de", 2, "round");
        disc(c, x + dx, y + dy, 1.8);
        c.fillStyle = acc;
        c.fill();
        disc(c, x - dx, y - dy, 1.8);
        c.fill();
      }
    }
  });
  [ro - 1.5, ri + 1.5].forEach((r) => ringLine(c, cx, cy, r, rgba(acc, 0.35), 1.2));
  c.restore();
}

/** Asile : capitonnage blanc, boutons et coutures. */
function padded(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    rm = (ro + ri) / 2,
    n = 24;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, mix(acc, "#ffffff", 0.18)], [0.3, mix(acc, "#000000", 0.18)], [0.55, mix(acc, "#ffffff", 0.1)], [0.8, mix(acc, "#000000", 0.25)], [1, mix(acc, "#ffffff", 0.18)]]));
  c.save();
  c.setLineDash([4, 3]);
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU,
      a1 = ((i + 1) / n) * TAU;
    line(c, ...pt(cx, cy, ri + 3, a0), ...pt(cx, cy, ro - 3, a1), "rgba(60,50,35,.5)", 1.6);
    line(c, ...pt(cx, cy, ro - 3, a0), ...pt(cx, cy, ri + 3, a1), "rgba(60,50,35,.5)", 1.6);
  }
  c.restore();
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * TAU,
      [x, y] = pt(cx, cy, rm, a),
      gr = c.createRadialGradient(x - 1.5, y - 1.5, 0, x, y, 6);
    gr.addColorStop(0, mix(acc, "#ffffff", 0.45));
    gr.addColorStop(1, mix(acc, "#000000", 0.55));
    for (let k = 0; k < 4; k++) {
      const aa = a + (k * Math.PI) / 2 + Math.PI / 4;
      line(c, x + Math.cos(aa) * 5, y + Math.sin(aa) * 5, x + Math.cos(aa) * 10, y + Math.sin(aa) * 10, "rgba(60,50,35,.35)", 1);
    }
    disc(c, x, y, 5);
    c.fillStyle = gr;
    c.fill();
    c.strokeStyle = "rgba(0,0,0,.35)";
    c.lineWidth = 1;
    c.stroke();
  }
  ringLine(c, cx, cy, ro - 1.5, "rgba(0,0,0,.4)", 3);
  ringLine(c, cx, cy, ri + 1.5, "rgba(0,0,0,.45)", 3);
  c.restore();
}

/** Anneaux de la catégorie (accent: true = la couleur d'accent est déjà bien visible). */
export const HORROR = {
  tentacle: { label: "Tentacule", thickness: 0.085, accent: true, draw: tentacle },
  gear: { label: "Engrenage de laiton", thickness: 0.085, accent: true, draw: gear },
  blood: { label: "Sang et griffures", thickness: 0.08, accent: true, draw: blood },
  chain: { label: "Chaîne", thickness: 0.085, draw: chain },
  thorns: { label: "Ronces et épines", thickness: 0.09, draw: thorns },
  "barbed-wire": { label: "Fil barbelé", thickness: 0.085, accent: true, draw: barbedWire },
  padded: { label: "Cellule capitonnée", thickness: 0.08, accent: true, draw: padded },
  rusted: { label: "Fer rouillé", thickness: 0.08, draw: metalRing({ pal: PAL.rust, stains: "rgba(140,60,18,.5)", groove: { base: 3, alpha: 0, line: 0.1, at: 25 }, studs: { n: 8, style: "rivet", at: 25 } }) },
};
