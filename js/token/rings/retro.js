/** Anneaux — Rétro. */
import {
  PAL, TAU, DEG, accentLip, annulus, arc, bevel, clipRing, conic, disc, fillRing, glow, line,
  metalRing, mix, pt, rgba, ringLine, ringText, rnd, seam,
} from "../ring-tools.js";

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


/* ---------- nouveaux anneaux ---------- */
/** VHS : bruit analogique, bandes de tracking, mentions PLAY / REC. */
function vhsTape(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2;
  c.save();
  fillRing(c, g, "#12141c");
  clipRing(c, g);
  for (let i = 0; i < 340; i++) {
    const x = cx + (rnd(i, 1) * 2 - 1) * ro,
      y = cy + (rnd(i, 2) * 2 - 1) * ro;
    line(c, x, y, x + 6 + rnd(i, 3) * 30, y, `rgba(255,255,255,${0.04 + rnd(i, 4) * 0.22})`, 1.4);
  }
  [[cy - ro * 0.5, 10], [cy + ro * 0.62, 6]].forEach(([y, h]) => {
    c.fillStyle = "rgba(255,255,255,.16)";
    c.fillRect(cx - ro, y, ro * 2, h);
    c.fillStyle = "rgba(255,0,60,.4)";
    c.fillRect(cx - ro - 6, y - 3, ro * 2, 3);
    c.fillStyle = "rgba(0,230,255,.4)";
    c.fillRect(cx - ro + 6, y + h, ro * 2, 3);
  });
  c.restore();
  glow(c, rgba(acc, 0.8), 6, () => {
    ringLine(c, cx, cy, ro - 2, rgba(acc, 0.95), 2);
    ringLine(c, cx, cy, ri + 2, rgba(acc, 0.6), 1.4);
  });
  c.font = `700 ${Math.round(t * 0.42)}px "Share Tech Mono", monospace`;
  c.textBaseline = "middle";
  c.textAlign = "left";
  c.fillStyle = "#fff";
  c.beginPath();
  c.moveTo(cx - 38, cy - rm - 7);
  c.lineTo(cx - 38, cy - rm + 7);
  c.lineTo(cx - 27, cy - rm);
  c.closePath();
  c.fill();
  c.fillText("PLAY", cx - 20, cy - rm + 1);
  disc(c, cx - 30, cy + rm, 5.5);
  c.fillStyle = acc;
  c.fill();
  c.fillStyle = "#fff";
  c.fillText("REC", cx - 18, cy + rm + 1);
  c.restore();
}

/** Memphis : confettis, zigzags et formes géométriques. */
function memphis(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    pal = [acc, "#3ee6e0", "#ffe14d", "#ffffff", "#ff7ab8"],
    n = 26;
  c.save();
  fillRing(c, g, "#14072a");
  clipRing(c, g);
  for (let i = 0; i < n; i++) {
    const a = ((i + (rnd(i, 1) - 0.5) * 0.4) / n) * TAU,
      [x, y] = pt(cx, cy, rm + (rnd(i, 2) - 0.5) * t * 0.25, a),
      col = pal[i % pal.length],
      s = t * 0.2;
    c.save();
    c.translate(x, y);
    c.rotate(rnd(i, 3) * TAU);
    c.strokeStyle = col;
    c.fillStyle = col;
    c.lineWidth = 2.6;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.beginPath();
    switch (i % 5) {
      case 0:
        c.arc(0, 0, s * 0.8, 0, TAU);
        c.stroke();
        break;
      case 1:
        c.moveTo(0, -s);
        c.lineTo(s, s * 0.8);
        c.lineTo(-s, s * 0.8);
        c.closePath();
        c.fill();
        break;
      case 2:
        for (let k = -s * 1.4; k <= s * 1.4; k += 1.5) c.lineTo(k, Math.sin(k * 0.9) * 3.2);
        c.stroke();
        break;
      case 3:
        [-s, 0, s].forEach((d) => {
          c.moveTo(d + 2.4, 0);
          c.arc(d, 0, 2.4, 0, TAU);
        });
        c.fill();
        break;
      default:
        [[-s * 1.2, s * 0.6], [-s * 0.4, -s * 0.6], [s * 0.4, s * 0.6], [s * 1.2, -s * 0.6]].forEach(([px, py], k) => (k ? c.lineTo(px, py) : c.moveTo(px, py)));
        c.stroke();
    }
    c.restore();
  }
  c.restore();
  ringLine(c, cx, cy, ro - 1.5, "#ffe14d", 2.4);
  ringLine(c, cx, cy, ri + 1.5, acc, 2.4);
}

/** Pulp : rayons de bande dessinée, contours noirs. */
function sunburst(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    n = 36;
  c.save();
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU,
      a1 = ((i + 1) / n) * TAU;
    c.beginPath();
    c.moveTo(...pt(cx, cy, ri, a0));
    c.lineTo(...pt(cx, cy, ro, a0 + 0.1));
    c.lineTo(...pt(cx, cy, ro, a1 + 0.1));
    c.lineTo(...pt(cx, cy, ri, a1));
    c.closePath();
    c.fillStyle = i % 2 ? "#f6e7b4" : acc;
    c.fill();
    c.strokeStyle = "#111";
    c.lineWidth = 2.4;
    c.lineJoin = "round";
    c.stroke();
  }
  ringLine(c, cx, cy, ro - 1.5, "#111", 4);
  ringLine(c, cx, cy, ri + 1.5, "#111", 4);
  c.restore();
}

/** Âge atomique : atomes et étoiles sputnik. */
function atomicOrbits(c, g, acc) {
  const { cx, cy, ro, ri } = g,
    t = ro - ri,
    rm = (ro + ri) / 2,
    n = 6,
    s = t * 0.44;
  c.save();
  fillRing(c, g, conic(c, cx, cy, ro, [[0, "#0f3a42"], [0.5, "#08222a"], [1, "#0f3a42"]]));
  for (let i = 0; i < n; i++) {
    const [x, y] = pt(cx, cy, rm, ((i + 0.5) / n) * TAU);
    c.save();
    c.translate(x, y);
    for (let k = 0; k < 3; k++) {
      c.save();
      c.rotate((k * Math.PI) / 3 + 0.3);
      c.beginPath();
      c.ellipse(0, 0, s, s * 0.36, 0, 0, TAU);
      c.strokeStyle = rgba(acc, 0.95);
      c.lineWidth = 1.7;
      c.stroke();
      disc(c, s * Math.cos(k * 2), s * 0.36 * Math.sin(k * 2), 2.6);
      c.fillStyle = "#ffffff";
      c.fill();
      c.restore();
    }
    disc(c, 0, 0, 3.6);
    c.fillStyle = mix(acc, "#ffffff", 0.5);
    c.fill();
    c.restore();
    const [sx, sy] = pt(cx, cy, rm, (i / n) * TAU);
    glow(c, acc, 5, () => {
      [0, Math.PI / 4].forEach((rot) => {
        c.save();
        c.translate(sx, sy);
        c.rotate(rot);
        line(c, -7, 0, 7, 0, "#fff4d6", 1.6, "round");
        line(c, 0, -7, 0, 7, "#fff4d6", 1.6, "round");
        c.restore();
      });
    });
  }
  [ro - 1.5, ri + 1.5].forEach((r) => ringLine(c, cx, cy, r, acc, 2));
  c.restore();
}

/** Anneaux de la catégorie (accent: true = la couleur d'accent est déjà bien visible). */
export const RETRO = {
  pixel: { label: "Pixel 8-bit", thickness: 0.08, accent: true, draw: pixel },
  "stripes-70s": { label: "Rayures 70s", thickness: 0.085, accent: true, draw: stripes70 },
  "chrome-50s": { label: "Chrome 50s", thickness: 0.08, accent: true, draw: metalRing({ pal: PAL.chrome, grain: false, groove: { at: 22, base: 10, line: 5.5, alpha: 0.95 } }) },
  "vhs-tape": { label: "Cassette VHS", thickness: 0.085, accent: true, draw: vhsTape },
  memphis: { label: "Confettis Memphis", thickness: 0.085, accent: true, draw: memphis },
  sunburst: { label: "Rayons pulp", thickness: 0.08, accent: true, draw: sunburst },
  "atomic-orbits": { label: "Atomes & sputniks", thickness: 0.085, accent: true, draw: atomicOrbits },
};
