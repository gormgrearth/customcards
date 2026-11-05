/** Anneaux — Futuriste. */
import {
  PAL, TAU, DEG, accentLip, annulus, arc, bevel, clipRing, conic, disc, fillRing, glow, line,
  metalRing, mix, pt, rgba, ringLine, ringText, rnd, seam,
} from "../ring-tools.js";

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


/* ---------- nouveaux anneaux ---------- */
/** Mécha : plaques d'armure segmentées, chevrons de couleur, boulons. */
function armorPlates(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    rm = (ro + ri) / 2,
    n = 10;
  c.save();
  fillRing(c, g, "#0a0b0d");
  for (let i = 0; i < n; i++) {
    const a0 = ((i + 0.05) / n) * TAU,
      a1 = ((i + 0.95) / n) * TAU,
      am = (a0 + a1) / 2;
    c.beginPath();
    c.arc(cx, cy, ro - 2, a0, a1);
    c.arc(cx, cy, ri + 2, a1, a0, true);
    c.closePath();
    c.fillStyle = i % 2 ? "#2b2f37" : "#3a3f48";
    c.fill();
    c.strokeStyle = "rgba(0,0,0,.85)";
    c.lineWidth = 2;
    c.stroke();
    arc(c, cx, cy, ro - 4.5, a0 + 0.02, a1 - 0.02, "rgba(255,255,255,.22)", 1.8);
    glow(c, rgba(acc, 0.6), 4, () =>
      [0, 8].forEach((d) => {
        c.beginPath();
        const A = pt(cx, cy, ri + 7 + d, am - 0.075),
          B = pt(cx, cy, rm + 4 + d * 0.5, am),
          C = pt(cx, cy, ri + 7 + d, am + 0.075);
        c.moveTo(...A);
        c.lineTo(...B);
        c.lineTo(...C);
        c.strokeStyle = rgba(acc, d ? 0.55 : 0.97);
        c.lineWidth = 4;
        c.lineJoin = "miter";
        c.stroke();
      }),
    );
    [a0 + 0.045, a1 - 0.045].forEach((a) => {
      const [x, y] = pt(cx, cy, ro - 9, a);
      disc(c, x, y, 2.4);
      c.fillStyle = "#8d96a3";
      c.fill();
    });
  }
  c.restore();
}

/** Biotech : double hélice d'ADN. */
function dna(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    A = t * 0.3,
    k = 10;
  c.save();
  fillRing(c, g, "#05150f");
  for (let i = 0; i < 150; i++) {
    const a = (i / 150) * TAU,
      s = Math.sin(k * a),
      [x0, y0] = pt(cx, cy, rm + A * s, a),
      [x1, y1] = pt(cx, cy, rm - A * s, a);
    line(c, x0, y0, x1, y1, rgba(acc, 0.42), 1.5);
  }
  [[-1, mix(acc, "#ffffff", 0.55)], [1, acc]].forEach(([sg, col]) =>
    glow(c, rgba(acc, 0.7), 6, () => {
      c.beginPath();
      for (let i = 0; i <= 720; i++) {
        const a = (i / 720) * TAU,
          [x, y] = pt(cx, cy, rm + sg * A * Math.sin(k * a), a);
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.closePath();
      c.strokeStyle = col;
      c.lineWidth = 3.2;
      c.stroke();
    }),
  );
  [ro - 1.5, ri + 1.5].forEach((r) => ringLine(c, cx, cy, r, rgba(acc, 0.45), 1.2));
  c.restore();
}

/** Quantique : ondes superposées et particules. */
function quantumWaves(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#170a33"], [0.5, "#0a0420"], [1, "#170a33"]]));
  [[7, 0, 0.22, rgba(acc, 0.97), 2.6], [11, 1.3, 0.17, "rgba(138,180,255,.85)", 1.9], [17, 2.6, 0.12, "rgba(255,255,255,.7)", 1.4]].forEach(([k, ph, am, col, w]) =>
    glow(c, col, 5, () => {
      c.beginPath();
      for (let i = 0; i <= 900; i++) {
        const a = (i / 900) * TAU,
          [x, y] = pt(cx, cy, rm + t * am * Math.sin(k * a + ph), a);
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.closePath();
      c.strokeStyle = col;
      c.lineWidth = w;
      c.stroke();
    }),
  );
  glow(c, "#fff", 7, () => {
    for (let i = 0; i < 12; i++) {
      const a = ((i + 0.5) / 12) * TAU,
        [x, y] = pt(cx, cy, rm + t * 0.22 * Math.sin(7 * a), a);
      disc(c, x, y, 2.8);
      c.fillStyle = "#ffffff";
      c.fill();
    }
  });
  [ro - 1.5, ri + 1.5].forEach((r) => ringLine(c, cx, cy, r, rgba(acc, 0.5), 1.2));
  c.restore();
}

/** Cryogénie : glace givrée, flocons et cristaux de givre. */
function frost(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, mix(acc, "#ffffff", 0.35)], [0.25, mix(acc, "#3b7aa3", 0.45)], [0.5, mix(acc, "#ffffff", 0.2)], [0.75, mix(acc, "#3b7aa3", 0.55)], [1, mix(acc, "#ffffff", 0.35)]]));
  clipRing(c, g);
  for (let i = 0; i < 200; i++) {
    const [x, y] = pt(cx, cy, ri + rnd(i, 2) * t, rnd(i, 1) * TAU);
    disc(c, x, y, 0.5 + rnd(i, 3) * 1.4);
    c.fillStyle = "rgba(255,255,255,.55)";
    c.fill();
  }
  c.restore();
  ringLine(c, cx, cy, ro - 1.5, "rgba(255,255,255,.7)", 2);
  for (let k = 0; k < 8; k++) {
    const [x, y] = pt(cx, cy, rm, ((k + 0.5) / 8) * TAU),
      s = t * 0.36;
    c.save();
    c.translate(x, y);
    c.rotate(rnd(k, 1) * 1);
    for (let j = 0; j < 6; j++) {
      c.rotate(Math.PI / 3);
      line(c, 0, 0, 0, -s, "rgba(255,255,255,.95)", 1.8, "round");
      line(c, 0, -s * 0.55, s * 0.28, -s * 0.8, "rgba(255,255,255,.95)", 1.4, "round");
      line(c, 0, -s * 0.55, -s * 0.28, -s * 0.8, "rgba(255,255,255,.95)", 1.4, "round");
    }
    c.restore();
  }
  for (let i = 0; i < 64; i++) {
    const a = ((i + rnd(i, 4)) / 64) * TAU,
      [x0, y0] = pt(cx, cy, ri + 1, a),
      [x1, y1] = pt(cx, cy, ri - 5 - rnd(i, 5) * 9, a + (rnd(i, 6) - 0.5) * 0.05);
    line(c, x0, y0, x1, y1, "rgba(255,255,255,.85)", 1.6, "round");
  }
  c.restore();
}

/** Nexus : réseau de nœuds reliés. */
function nodes(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    n = 17,
    P = [];
  c.save();
  fillRing(c, g, "#0c0818");
  for (let i = 0; i < n; i++)
    P.push(pt(cx, cy, rm + (rnd(i, 1) - 0.5) * t * 0.55, ((i + (rnd(i, 2) - 0.5) * 0.5) / n) * TAU));
  for (let i = 0; i < n; i++) {
    const links = [1, ...(rnd(i, 3) > 0.35 ? [2] : [])];
    links.forEach((d) => line(c, ...P[i], ...P[(i + d) % n], rgba(acc, 0.5), 1.2));
  }
  glow(c, acc, 7, () =>
    P.forEach(([x, y], i) => {
      const hub = i % 6 === 0;
      disc(c, x, y, hub ? 6 : 3.2 + rnd(i, 5) * 2);
      c.fillStyle = hub ? mix(acc, "#ffffff", 0.45) : acc;
      c.fill();
      if (hub) {
        disc(c, x, y, 10);
        c.strokeStyle = rgba(acc, 0.8);
        c.lineWidth = 1.4;
        c.stroke();
      }
    }),
  );
  [ro - 1.5, ri + 1.5].forEach((r) => ringLine(c, cx, cy, r, rgba(acc, 0.35), 1.2));
  c.restore();
}

/** Anneaux de la catégorie (accent: true = la couleur d'accent est déjà bien visible). */
export const FUTURE = {
  orbit: { label: "Orbite", thickness: 0.06, accent: true, draw: orbit },
  "armor-plates": { label: "Plaques d'armure", thickness: 0.085, accent: true, draw: armorPlates },
  dna: { label: "Double hélice", thickness: 0.085, accent: true, draw: dna },
  "quantum-waves": { label: "Ondes quantiques", thickness: 0.085, accent: true, draw: quantumWaves },
  hud: { label: "HUD segmenté", thickness: 0.07, accent: true, draw: hud },
  frost: { label: "Glace givrée", thickness: 0.085, accent: true, draw: frost },
  nodes: { label: "Réseau de nœuds", thickness: 0.085, accent: true, draw: nodes },
  titanium: { label: "Titane à LED", thickness: 0.075, accent: true, draw: metalRing({ pal: PAL.titanium, groove: { base: 5, alpha: 0.2, line: 1.2 }, studs: { n: 36, style: "led", at: 30, off: 0 } }) },
};
