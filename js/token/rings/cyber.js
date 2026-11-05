/** Anneaux — Cyberpunk & néon. */
import {
  PAL, TAU, DEG, accentLip, annulus, arc, bevel, clipRing, conic, disc, fillRing, glow, line,
  metalRing, mix, pt, rgba, ringLine, ringText, rnd, seam,
} from "../ring-tools.js";

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


/* ---------- nouveaux anneaux ---------- */
/** Chrome : acier sombre, chevrons de couleur (sens horaire). */
function chevron(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, PAL.iron));
  bevel(c, cx, cy, ro, ri);
  ringLine(c, cx, cy, rm, "rgba(0,0,0,.55)", t * 0.64);
  const n = 30,
    s = t * 0.26;
  glow(c, rgba(acc, 0.8), 6, () => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU,
        [x, y] = pt(cx, cy, rm, a);
      c.save();
      c.translate(x, y);
      c.rotate(a + Math.PI / 2);
      [-5, 4].forEach((dx, k) => {
        c.beginPath();
        c.moveTo(dx - s * 0.6, -s);
        c.lineTo(dx + s * 0.6, 0);
        c.lineTo(dx - s * 0.6, s);
        c.strokeStyle = rgba(acc, k ? 0.95 : 0.55);
        c.lineWidth = 3.2;
        c.lineCap = "butt";
        c.stroke();
      });
      c.restore();
    }
  });
  c.restore();
}

/** Rue : trait de bombe, brouillard de peinture, coulures. */
function spray(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  fillRing(c, g, "#17141a");
  clipRing(c, g);
  for (let i = 0; i < 280; i++) {
    const [x, y] = pt(cx, cy, ri + rnd(i, 2) * t, rnd(i, 1) * TAU);
    disc(c, x, y, 0.6 + rnd(i, 3));
    c.fillStyle = rnd(i, 4) > 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.25)";
    c.fill();
  }
  for (let i = 0; i < 360; i++) {
    const a = rnd(i, 5) * TAU,
      r = rm + (rnd(i, 6) + rnd(i, 7) - 1) * t * 0.7,
      [x, y] = pt(cx, cy, r, a);
    disc(c, x, y, 0.5 + rnd(i, 8) * 1.4);
    c.fillStyle = rgba(acc, 0.12 + rnd(i, 9) * 0.3);
    c.fill();
  }
  c.restore();
  ringLine(c, cx, cy, ro - 1.5, "rgba(0,0,0,.8)", 3);
  ringLine(c, cx, cy, ri + 1.5, "rgba(0,0,0,.8)", 3);
  for (let k = 0; k < 3; k++) {
    c.beginPath();
    for (let i = 0; i <= 240; i++) {
      const a = (i / 240) * TAU,
        [x, y] = pt(cx, cy, rm + Math.sin(a * 3 + k * 2) * 2.5 + Math.sin(a * 11 + k) * 1.2, a);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.closePath();
    c.strokeStyle = rgba(acc, k ? 0.55 : 0.95);
    c.lineWidth = t * (k ? 0.28 : 0.4);
    c.lineJoin = "round";
    c.stroke();
  }
  ringLine(c, cx, cy, rm - t * 0.08, "rgba(255,255,255,.3)", 1.2);
  for (let i = 0; i < 9; i++) {
    const deg = i < 5 ? 14 + i * 14 + rnd(i, 3) * 6 : 108 + (i - 5) * 16 + rnd(i, 3) * 6,
      [x, y] = pt(cx, cy, rm, deg * DEG),
      len = 12 + rnd(i, 4) * 20;
    line(c, x, y, x, y + len, rgba(acc, 0.95), 4, "round");
    disc(c, x, y + len, 4.2);
    c.fillStyle = rgba(acc, 0.95);
    c.fill();
  }
}

/** Corpo : lunette de montre — cadran noir, graduations, repère et jauge de couleur. */
function bezel(c, g, acc) {
  const { cx, cy, ro, ri } = g;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#c9ced6"], [0.2, "#f4f6f9"], [0.4, "#9aa1ac"], [0.6, "#e8ecf1"], [0.8, "#a9b0bb"], [1, "#c9ced6"]]));
  ringLine(c, cx, cy, ro - 1.5, "rgba(0,0,0,.45)", 3);
  annulus(c, cx, cy, ro - 5, ri + 3);
  c.fillStyle = "#0a0d12";
  c.fill();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * TAU,
      major = i % 5 === 0,
      r1 = ro - 8,
      r2 = r1 - (major ? 11 : 5),
      [x0, y0] = pt(cx, cy, r1, a),
      [x1, y1] = pt(cx, cy, r2, a);
    line(c, x0, y0, x1, y1, "#e9edf2", major ? 2.4 : 1.2);
  }
  glow(c, rgba(acc, 0.8), 6, () => arc(c, cx, cy, ri + 9, -90 * DEG, 20 * DEG, rgba(acc, 0.98), 3.4, "round"));
  c.beginPath();
  c.moveTo(cx - 8, cy - ro + 3);
  c.lineTo(cx + 8, cy - ro + 3);
  c.lineTo(cx, cy - ro + 17);
  c.closePath();
  c.fillStyle = acc;
  c.fill();
  seam(c, cx, cy, ri);
  c.restore();
}

/** Terminal : écran cathodique — lignes de balayage, repères phosphorescents, curseur. */
function crt(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  fillRing(c, g, "#06100a");
  clipRing(c, g);
  for (let y = cy - ro; y < cy + ro; y += 4)
    line(c, cx - ro, y, cx + ro, y, rgba(acc, 0.17), 1.6);
  c.restore();
  glow(c, rgba(acc, 0.9), 10, () => {
    ringLine(c, cx, cy, ro - 4, rgba(acc, 0.75), 1.6);
    ringLine(c, cx, cy, ri + 4, rgba(acc, 0.55), 1.2);
    for (let k = 0; k < 4; k++)
      arc(c, cx, cy, rm, k * 90 * DEG - 9 * DEG, k * 90 * DEG + 9 * DEG, rgba(acc, 0.95), t * 0.36);
  });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU,
      [x0, y0] = pt(cx, cy, ro - 9, a),
      [x1, y1] = pt(cx, cy, ro - 14, a);
    line(c, x0, y0, x1, y1, rgba(acc, 0.5), 1.2);
  }
  const [x, y] = pt(cx, cy, rm, 225 * DEG);
  c.save();
  c.translate(x, y);
  c.rotate(225 * DEG + Math.PI / 2);
  glow(c, acc, 8, () => {
    c.fillStyle = acc;
    c.fillRect(-7, -t * 0.28, 14, t * 0.56);
  });
  c.restore();
}

/** Noir : art déco — filets crème, éventails aux points cardinaux, losanges. */
function deco(c, g, acc) {
  const { cx, cy, ro, ri } = g;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#15130e"], [0.5, "#090806"], [1, "#15130e"]]));
  ringLine(c, cx, cy, ro - 5, acc, 1.8);
  ringLine(c, cx, cy, ro - 9.5, rgba(acc, 0.55), 1);
  ringLine(c, cx, cy, ri + 5, acc, 1.8);
  ringLine(c, cx, cy, ri + 9.5, rgba(acc, 0.55), 1);
  for (let k = 0; k < 4; k++)
    for (let j = -4; j <= 4; j++) {
      const a = k * 90 * DEG + j * 3.4 * DEG,
        [x0, y0] = pt(cx, cy, ri + 13, a),
        [x1, y1] = pt(cx, cy, ro - 13 - Math.abs(j) * 2.6, a);
      line(c, x0, y0, x1, y1, rgba(acc, 0.9), 1.4);
    }
  for (let k = 0; k < 4; k++) {
    const [x, y] = pt(cx, cy, (ro + ri) / 2, (45 + k * 90) * DEG);
    c.save();
    c.translate(x, y);
    c.rotate(Math.PI / 4);
    c.fillStyle = acc;
    c.fillRect(-6, -6, 12, 12);
    c.fillStyle = "#0b0a07";
    c.fillRect(-2.5, -2.5, 5, 5);
    c.restore();
  }
  c.restore();
}

/** Hologramme : anneau translucide, interférences, émetteurs. */
function hologram(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, rgba(acc, 0.28)], [0.3, rgba(acc, 0.55)], [0.5, rgba(acc, 0.22)], [0.8, rgba(acc, 0.5)], [1, rgba(acc, 0.28)]]));
  clipRing(c, g);
  for (let y = cy - ro; y < cy + ro; y += 3) line(c, cx - ro, y, cx + ro, y, "rgba(255,255,255,.12)", 1);
  c.fillStyle = "rgba(255,255,255,.16)";
  c.fillRect(cx - ro, cy - ro * 0.42, ro * 2, 13);
  c.fillRect(cx - ro, cy + ro * 0.52, ro * 2, 7);
  c.restore();
  glow(c, acc, 10, () => {
    ringLine(c, cx, cy, ro - 1.5, rgba(acc, 0.95), 2);
    ringLine(c, cx, cy, ri + 1.5, rgba(acc, 0.95), 2);
  });
  c.save();
  c.setLineDash([2, 7]);
  ringLine(c, cx, cy, (ro + ri) / 2, rgba(acc, 0.6), 1.2);
  c.restore();
  for (const deg of [60, 90, 120]) {
    const [x, y] = pt(cx, cy, ro - 4, deg * DEG);
    c.beginPath();
    c.moveTo(x, y - 3);
    c.lineTo(x - 6, y + 5);
    c.lineTo(x + 6, y + 5);
    c.closePath();
    c.fillStyle = rgba(acc, 0.95);
    c.fill();
  }
}

/** Tactique : réticule de visée — graduations, croisillons, repère nord. */
function reticle(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    rm = (ro + ri) / 2;
  c.save();
  fillRing(c, g, "#141710");
  clipRing(c, g);
  for (let i = 0; i < 220; i++) {
    const [x, y] = pt(cx, cy, ri + rnd(i, 2) * (ro - ri), rnd(i, 1) * TAU);
    disc(c, x, y, 0.6 + rnd(i, 3));
    c.fillStyle = rnd(i, 4) > 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.3)";
    c.fill();
  }
  c.restore();
  bevel(c, cx, cy, ro, ri);
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * TAU,
      major = i % 6 === 0,
      [x0, y0] = pt(cx, cy, ro - 9, a),
      [x1, y1] = pt(cx, cy, ro - (major ? 20 : 14), a);
    line(c, x0, y0, x1, y1, rgba(acc, major ? 1 : 0.75), major ? 2.6 : 1.5);
  }
  c.save();
  c.setLineDash([6, 8]);
  ringLine(c, cx, cy, rm - 4, rgba(acc, 0.35), 1.2);
  c.restore();
  glow(c, rgba(acc, 0.8), 6, () => {
    for (let k = 0; k < 4; k++) {
      const a = k * 90 * DEG,
        [x0, y0] = pt(cx, cy, ri + 3, a),
        [x1, y1] = pt(cx, cy, ro - 22, a);
      line(c, x0, y0, x1, y1, rgba(acc, 0.95), 7);
    }
  });
  c.beginPath();
  c.moveTo(cx, cy - ro + 4);
  c.lineTo(cx - 7, cy - ro + 18);
  c.lineTo(cx + 7, cy - ro + 18);
  c.closePath();
  c.fillStyle = acc;
  c.fill();
  c.restore();
}

/** Synthwave : soleil rétro en dégradé, fentes horizontales, filets néon. */
function synthwave(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    gr = c.createLinearGradient(0, cy - ro, 0, cy + ro);
  gr.addColorStop(0, "#ffe36b");
  gr.addColorStop(0.35, "#ff9e5c");
  gr.addColorStop(0.62, acc);
  gr.addColorStop(1, "#5b21b6");
  c.save();
  fillRing(c, g, gr);
  clipRing(c, g);
  for (let k = 0; k < 10; k++) {
    c.fillStyle = "#0b0316";
    c.fillRect(cx - ro, cy - ro * 0.18 + k * ro * 0.13, ro * 2, 2 + k * 1.7);
  }
  c.restore();
  glow(c, acc, 9, () => ringLine(c, cx, cy, ro - 1.5, rgba(acc, 1), 2.4));
  glow(c, "#35f2ff", 9, () => ringLine(c, cx, cy, ri + 1.5, "#35f2ff", 2.4));
}

/** Netrunner : anneau de caractères qui défilent. */
function codeRing(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    chars = "01<>/{}$#=+*&%",
    n = 58;
  c.save();
  fillRing(c, g, "#04100a");
  c.font = `700 ${Math.round(t * 0.52)}px "Share Tech Mono", monospace`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU,
      [x, y] = pt(cx, cy, rm, a);
    c.save();
    c.translate(x, y);
    c.rotate(a + Math.PI / 2);
    c.fillStyle = i % 9 === 0 ? mix(acc, "#ffffff", 0.75) : rgba(acc, 0.22 + rnd(i, 2) * 0.78);
    c.fillText(chars[(rnd(i, 3) * chars.length) | 0], 0, 0);
    c.restore();
  }
  ringLine(c, cx, cy, ro - 1.5, rgba(acc, 0.6), 1.4);
  ringLine(c, cx, cy, ri + 1.5, rgba(acc, 0.6), 1.4);
  c.restore();
}

/** Yakuza : laque sombre, vagues (seigaiha) et filets dorés. */
function seigaiha(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    n = 30,
    R = t * 0.62;
  c.save();
  fillRing(c, g, "#1a0905");
  clipRing(c, g);
  [[0.28, 0], [0.72, 0.5]].forEach(([f, off]) => {
    for (let i = 0; i < n; i++) {
      const [x, y] = pt(cx, cy, ri + t * f, ((i + off) / n) * TAU);
      for (let k = 0; k < 3; k++) {
        disc(c, x, y, R * (1 - k * 0.3));
        if (!k) {
          c.fillStyle = "#1a0905";
          c.fill();
        }
        c.strokeStyle = rgba(acc, 1 - k * 0.25);
        c.lineWidth = 1.6;
        c.stroke();
      }
    }
  });
  c.restore();
  ringLine(c, cx, cy, ro - 1.5, "#d9b24a", 2.6);
  ringLine(c, cx, cy, ri + 1.5, "#d9b24a", 2.6);
}

/** Pluie de néon : averse, reflets de couleur. */
function rain(c, g, acc) {
  const { cx, cy, ro, ri } = g;
  c.save();
  fillRing(c, g, "#0d0716");
  clipRing(c, g);
  for (let i = 0; i < 300; i++) {
    const x = cx + (rnd(i, 1) * 2 - 1) * ro,
      y = cy + (rnd(i, 2) * 2 - 1) * ro,
      len = 10 + rnd(i, 3) * 26;
    line(c, x, y, x - len * 0.25, y + len, rgba(acc, 0.3 + rnd(i, 4) * 0.65), 1.4 + rnd(i, 5) * 1.6);
  }
  c.restore();
  glow(c, acc, 8, () => ringLine(c, cx, cy, ro - 2, rgba(acc, 0.95), 2));
  glow(c, "#35f2ff", 8, () => ringLine(c, cx, cy, ri + 2, rgba(acc, 0.7), 2));
}

/** Anneaux de la catégorie (accent: true = la couleur d'accent est déjà bien visible). */
export const CYBER = {
  "cyber-metal": { label: "Acier brossé (sobre)", thickness: 0.075, accent: true, draw: metalRing({ pal: PAL.steel, ticks: { n: 72, major: 6 }, groove: { segs: [[-78, -38], [102, 142]] }, studs: { n: 4, style: "screw" } }) },
  chevron: { label: "Chevrons chromés", thickness: 0.08, accent: true, draw: chevron },
  spray: { label: "Bombe de peinture", thickness: 0.085, accent: true, draw: spray },
  bezel: { label: "Lunette corporate", thickness: 0.085, accent: true, draw: bezel },
  "glitch-ring": { label: "Signal instable", thickness: 0.075, accent: true, draw: glitchRing },
  crt: { label: "Écran cathodique", thickness: 0.075, accent: true, draw: crt },
  deco: { label: "Art déco noir", thickness: 0.08, accent: true, draw: deco },
  hologram: { label: "Hologramme", thickness: 0.075, accent: true, draw: hologram },
  "neon-tube": { label: "Tube néon", thickness: 0.07, accent: true, draw: neonTube },
  reticle: { label: "Réticule tactique", thickness: 0.08, accent: true, draw: reticle },
  synthwave: { label: "Synthwave", thickness: 0.075, accent: true, draw: synthwave },
  "code-ring": { label: "Flux de code", thickness: 0.075, accent: true, draw: codeRing },
  seigaiha: { label: "Laque & vagues", thickness: 0.08, accent: true, draw: seigaiha },
  rain: { label: "Pluie de néon", thickness: 0.075, accent: true, draw: rain },
  circuit: { label: "Circuit imprimé", thickness: 0.08, accent: true, draw: circuit },
};
