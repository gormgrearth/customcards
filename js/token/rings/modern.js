/** Anneaux — Contemporain. */
import {
  PAL, TAU, DEG, accentLip, annulus, arc, bevel, clipRing, conic, disc, fillRing, glow, line,
  metalRing, mix, pt, rgba, ringLine, ringText, rnd, seam,
} from "../ring-tools.js";

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


/* ---------- nouveaux anneaux ---------- */
/** Urbain : bitume, lignes de rive et pointillés de couleur. */
function road(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    rm = (ro + ri) / 2;
  c.save();
  fillRing(c, g, "#1c1d21");
  clipRing(c, g);
  for (let i = 0; i < 240; i++) {
    const [x, y] = pt(cx, cy, ri + rnd(i, 2) * (ro - ri), rnd(i, 1) * TAU);
    disc(c, x, y, 0.6 + rnd(i, 3) * 1.1);
    c.fillStyle = rnd(i, 4) > 0.5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.35)";
    c.fill();
  }
  c.restore();
  [ro - 6, ri + 6].forEach((r) => ringLine(c, cx, cy, r, "rgba(255,255,255,.75)", 2.4));
  c.save();
  c.setLineDash([22, 16]);
  glow(c, rgba(acc, 0.6), 5, () => ringLine(c, cx, cy, rm, acc, 5));
  c.restore();
  ringLine(c, cx, cy, ro - 1.5, "rgba(0,0,0,.8)", 3);
  ringLine(c, cx, cy, ri + 1.5, "rgba(0,0,0,.8)", 3);
  c.restore();
}

/** Magazine : trame d'impression (demi-teinte), repères et gamme CMJN. */
function halftone(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  fillRing(c, g, "#14110c");
  for (let k = 0; k < 5; k++) {
    const r = ri + (t * (k + 0.5)) / 5,
      n = Math.round((TAU * r) / 9);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU,
        [x, y] = pt(cx, cy, r, a),
        w = 0.25 + 0.75 * ((1 + Math.cos(a - 225 * DEG)) / 2);
      disc(c, x, y, 0.8 + w * 3.6);
      c.fillStyle = acc;
      c.fill();
    }
  }
  [0, Math.PI].forEach((a) => {
    const [x, y] = pt(cx, cy, rm, a);
    disc(c, x, y, 7);
    c.strokeStyle = "#fff";
    c.lineWidth = 1.4;
    c.stroke();
    line(c, x - 11, y, x + 11, y, "#fff", 1.4);
    line(c, x, y - 11, x, y + 11, "#fff", 1.4);
  });
  ["#00aeef", "#ec008c", "#fff200", "#111111"].forEach((col, i) => {
    const [x, y] = pt(cx, cy, rm, (74 + i * 10.7) * DEG);
    c.fillStyle = col;
    c.fillRect(x - 7, y - 7, 14, 14);
    c.strokeStyle = "#fff";
    c.lineWidth = 1;
    c.strokeRect(x - 7, y - 7, 14, 14);
  });
  c.restore();
}

/** Instantané : pellicule 35 mm — perforations, filets de marquage. */
function filmStrip(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    rm = (ro + ri) / 2,
    n = 44;
  c.save();
  fillRing(c, g, "#0b0b0d");
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    [ri + 8, ro - 8].forEach((r) => {
      const [x, y] = pt(cx, cy, r, a);
      c.save();
      c.translate(x, y);
      c.rotate(a + Math.PI / 2);
      c.beginPath();
      c.roundRect(-5.5, -3.6, 11, 7.2, 2);
      c.fillStyle = mix(acc, "#ffffff", 0.82);
      c.fill();
      c.restore();
    });
  }
  [ro - 16, ri + 16].forEach((r) => ringLine(c, cx, cy, r, rgba(acc, 0.85), 1.4));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU,
      [x0, y0] = pt(cx, cy, ri + 19, a),
      [x1, y1] = pt(cx, cy, ro - 19, a);
    line(c, x0, y0, x1, y1, "rgba(255,255,255,.16)", 1);
    const [tx, ty] = pt(cx, cy, rm, a + 0.09);
    c.save();
    c.translate(tx, ty);
    c.rotate(a + 0.09 + Math.PI / 2);
    c.beginPath();
    c.moveTo(0, -4);
    c.lineTo(4, 3);
    c.lineTo(-4, 3);
    c.closePath();
    c.fillStyle = rgba(acc, 0.9);
    c.fill();
    c.restore();
  }
  c.restore();
}

/** Dossier police : ruban de balisage jaune. */
function policeTape(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    phrase = "POLICE LINE  •  DO NOT CROSS  •  ";
  c.save();
  fillRing(c, g, "#ffd60a");
  [ro - 3, ri + 3].forEach((r) => ringLine(c, cx, cy, r, "#111", 5));
  [ro - 8, ri + 8].forEach((r) => ringLine(c, cx, cy, r, acc, 2));
  const f0 = t * 0.4;
  c.font = `900 ${f0}px "Arial Black", Impact, sans-serif`;
  const w = c.measureText(phrase).width,
    k = Math.max(1, Math.round((TAU * rm) / w)),
    f = (f0 * TAU * rm) / (k * w);
  c.font = `900 ${f}px "Arial Black", Impact, sans-serif`;
  let a = -Math.PI / 2;
  for (let i = 0; i < k; i++) a = ringText(c, phrase, cx, cy, rm, a, "#111");
  c.restore();
}

/** Médical : anneau blanc, tracé d'électrocardiogramme. */
function ecg(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    keys = [[0, 0], [0.28, 0], [0.34, 0.12], [0.39, -0.22], [0.44, 1], [0.5, -0.55], [0.55, 0], [0.62, 0], [0.71, 0.32], [0.8, 0], [1, 0]],
    val = (p) => {
      for (let i = 1; i < keys.length; i++)
        if (p <= keys[i][0]) {
          const [p0, v0] = keys[i - 1],
            [p1, v1] = keys[i];
          return v0 + ((v1 - v0) * (p - p0)) / (p1 - p0);
        }
      return 0;
    };
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#f7fbfb"], [0.4, "#dfeaea"], [0.7, "#f2f8f8"], [1, "#f7fbfb"]]));
  ringLine(c, cx, cy, ro - 1.5, "rgba(0,0,0,.25)", 2);
  ringLine(c, cx, cy, rm, rgba(acc, 0.25), 1);
  glow(c, rgba(acc, 0.7), 5, () => {
    c.beginPath();
    for (let i = 0; i <= 900; i++) {
      const th = (i / 900) * TAU,
        p = (((th / TAU) * 3) % 1 + 1) % 1,
        [x, y] = pt(cx, cy, rm + val(p) * t * 0.36, th - Math.PI / 2);
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.strokeStyle = acc;
    c.lineWidth = 2.8;
    c.lineJoin = "round";
    c.stroke();
  });
  seam(c, cx, cy, ri);
  c.restore();
}

/** Start-up : indicateur de chargement (points croissants). */
function spinner(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    rm = (ro + ri) / 2,
    n = 12;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#15122c"], [0.5, "#0c0a1c"], [1, "#15122c"]]));
  ringLine(c, cx, cy, rm, rgba(acc, 0.2), 2.4);
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(cx, cy, rm, -Math.PI / 2 + (i / n) * TAU),
      k = i / (n - 1);
    glow(c, rgba(acc, 0.9), i > n - 4 ? 10 : 0, () => {
      disc(c, x, y, 3.2 + k * 7.2);
      c.fillStyle = i === n - 1 ? mix(acc, "#ffffff", 0.6) : rgba(acc, 0.25 + 0.75 * k);
      c.fill();
    });
  }
  ringLine(c, cx, cy, ro - 1.5, rgba(acc, 0.4), 1.2);
  seam(c, cx, cy, ri);
  c.restore();
}

/** Stade : piste d'athlétisme, couloirs et ligne de départ. */
function track(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    base = mix(acc, "#c2410c", 0.4);
  c.save();
  for (let k = 0; k < 3; k++) {
    annulus(c, cx, cy, ro - (t / 3) * k, ro - (t / 3) * (k + 1));
    c.fillStyle = mix(base, "#000000", k * 0.07);
    c.fill();
  }
  clipRing(c, g);
  for (let i = 0; i < 260; i++) {
    const [x, y] = pt(cx, cy, ri + rnd(i, 2) * t, rnd(i, 1) * TAU);
    disc(c, x, y, 0.6 + rnd(i, 3));
    c.fillStyle = rnd(i, 4) > 0.5 ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.2)";
    c.fill();
  }
  c.restore();
  for (let k = 0; k <= 3; k++) ringLine(c, cx, cy, ro - (t / 3) * k - (k === 0 ? 1.5 : k === 3 ? -1.5 : 0), "rgba(255,255,255,.9)", 2.2);
  const [x0, y0] = pt(cx, cy, ri, -Math.PI / 2),
    [x1, y1] = pt(cx, cy, ro, -Math.PI / 2);
  line(c, x0, y0, x1, y1, "#fff", 6);
  c.restore();
}

/** Anneaux de la catégorie (accent: true = la couleur d'accent est déjà bien visible). */
export const MODERN = {
  road: { label: "Bitume & ligne", thickness: 0.08, accent: true, draw: road },
  halftone: { label: "Trame d'impression", thickness: 0.085, accent: true, draw: halftone },
  "film-strip": { label: "Pellicule", thickness: 0.085, accent: true, draw: filmStrip },
  "police-tape": { label: "Ruban de police", thickness: 0.07, accent: true, draw: policeTape },
  "story-ring": { label: "Dégradé réseau", thickness: 0.05, accent: true, draw: storyRing },
  ecg: { label: "Électrocardiogramme", thickness: 0.085, accent: true, draw: ecg },
  spinner: { label: "Chargement", thickness: 0.07, accent: true, draw: spinner },
  track: { label: "Piste d'athlétisme", thickness: 0.08, accent: true, draw: track },
  hazard: { label: "Bande de danger", thickness: 0.07, draw: hazard },
  "clean-white": { label: "Liseré blanc épuré", thickness: 0.035, draw: cleanWhite },
};
