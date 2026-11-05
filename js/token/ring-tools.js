/**
 * Outils de dessin partagés par les anneaux de token (js/token/rings/*.js).
 * Les anneaux dessinent dans un repère logique : (cx, cy) = centre, ro / ri = rayons extérieur / intérieur.
 */
export const TAU = Math.PI * 2,
  DEG = Math.PI / 180;

/* ------------------------------ outils de dessin ------------------------------ */
export const disc = (c, cx, cy, r) => {
  c.beginPath();
  c.arc(cx, cy, r, 0, TAU);
};
export const ringLine = (c, cx, cy, r, color, w) => {
  disc(c, cx, cy, r);
  c.strokeStyle = color;
  c.lineWidth = w;
  c.stroke();
};
export const annulus = (c, cx, cy, ro, ri) => {
  c.beginPath();
  c.arc(cx, cy, ro, 0, TAU);
  c.arc(cx, cy, ri, 0, TAU, true);
};
export const arc = (c, cx, cy, r, a0, a1, color, w, cap = "butt") => {
  c.beginPath();
  c.arc(cx, cy, r, a0, a1);
  c.strokeStyle = color;
  c.lineWidth = w;
  c.lineCap = cap;
  c.stroke();
};
export const line = (c, x0, y0, x1, y1, color, w, cap = "butt") => {
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x1, y1);
  c.strokeStyle = color;
  c.lineWidth = w;
  c.lineCap = cap;
  c.stroke();
};
export const pt = (cx, cy, r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
/** Pseudo-aléatoire déterministe (le dessin est identique à chaque rendu). */
export const rnd = (i, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const toRgb = (hex) => {
  let h = String(hex || "#00f0ff").replace("#", "");
  if (h.length === 3) h = [...h].map((x) => x + x).join("");
  const n = parseInt(h, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const rgba = (hex, a) => {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};
export const mix = (hex, other, t) => {
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
export function conic(c, cx, cy, ro, stops, start = -Math.PI / 2 - 0.6) {
  const g = c.createConicGradient
    ? c.createConicGradient(start, cx, cy)
    : c.createLinearGradient(cx - ro, cy - ro, cx + ro, cy + ro);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}
export const bevel = (c, cx, cy, ro, ri) => {
  ringLine(c, cx, cy, ro - 1.5, "rgba(0,0,0,.8)", 3);
  ringLine(c, cx, cy, ro - 5, "rgba(255,255,255,.24)", 1.5);
  ringLine(c, cx, cy, ri + 2, "rgba(0,0,0,.85)", 4);
  ringLine(c, cx, cy, ri + 6, "rgba(255,255,255,.1)", 1);
};
/** Fin liseré sombre : masque l'interstice entre l'anneau et l'illustration. */
export const seam = (c, cx, cy, ri) => ringLine(c, cx, cy, ri - 0.5, "#0b0f16", 3);

/* ------------------------------ palettes métal ------------------------------ */
export const PAL = {
  steel: [[0, "#3c434e"], [0.1, "#a3adbc"], [0.2, "#3a414c"], [0.34, "#171b22"], [0.48, "#6f798a"], [0.58, "#242a33"], [0.74, "#8d97a7"], [0.86, "#2c323c"], [1, "#3c434e"]],
  gold: [[0, "#6b4f12"], [0.1, "#f3d77a"], [0.2, "#9a7420"], [0.34, "#4a3508"], [0.48, "#d9b24a"], [0.58, "#6e5114"], [0.74, "#f0d070"], [0.86, "#7a5a18"], [1, "#6b4f12"]],
  iron: [[0, "#2b2d31"], [0.12, "#6a6e76"], [0.25, "#26282c"], [0.4, "#141517"], [0.55, "#50545b"], [0.7, "#1d1f22"], [0.85, "#5d6169"], [1, "#2b2d31"]],
  titanium: [[0, "#6a7078"], [0.25, "#8a9098"], [0.5, "#5a6068"], [0.75, "#8e949c"], [1, "#6a7078"]],
  chrome: [[0, "#f5f7fa"], [0.08, "#7d8794"], [0.2, "#ffffff"], [0.35, "#4b5360"], [0.5, "#e9edf2"], [0.62, "#6e7886"], [0.78, "#ffffff"], [0.9, "#8a94a2"], [1, "#f5f7fa"]],
  rust: [[0, "#4a2511"], [0.1, "#a8571f"], [0.22, "#3a1d0e"], [0.38, "#6b3516"], [0.5, "#2a160b"], [0.65, "#8d4a1c"], [0.8, "#3d1f0f"], [1, "#4a2511"]],
  stone: [[0, "#3a3b3f"], [0.2, "#55575c"], [0.4, "#2e2f33"], [0.6, "#4a4c51"], [0.8, "#2a2b2e"], [1, "#3a3b3f"]],
};


/**
 * Anneau métallique paramétrable.
 * o = { pal, grain, stains, ticks:{n,major}, groove:{at,base,line,alpha,color,segs},
 *       studs:{n,style:"screw|rivet|pearl|led",r,at,off}, gems }
 */
export function metalRing(o) {
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

/* ------------------------------ outils supplémentaires ------------------------------ */
/** Applique un tracé avec une lueur de la couleur donnée. */
export const glow = (c, color, blur, fn) => {
  c.save();
  c.shadowColor = color;
  c.shadowBlur = blur;
  fn();
  c.restore();
};

/** Ouvre une zone de dessin limitée à l'anneau (penser à c.restore()). */
export const clipRing = (c, g) => {
  c.save();
  annulus(c, g.cx, g.cy, g.ro, g.ri);
  c.clip();
};

/** Remplit l'anneau avec un style (couleur, dégradé…). */
export const fillRing = (c, g, style) => {
  annulus(c, g.cx, g.cy, g.ro, g.ri);
  c.fillStyle = style;
  c.fill();
};

/** Texte courbé le long d'un cercle (sens horaire, lisible de l'extérieur). `c.font` doit être défini. Retourne l'angle final. */
export function ringText(c, str, cx, cy, r, a0, color) {
  c.fillStyle = color;
  c.textAlign = "center";
  c.textBaseline = "middle";
  let a = a0;
  for (const ch of str) {
    const ad = c.measureText(ch).width / r,
      am = a + ad / 2,
      [x, y] = pt(cx, cy, r, am);
    c.save();
    c.translate(x, y);
    c.rotate(am + Math.PI / 2);
    c.fillText(ch, 0, 0);
    c.restore();
    a += ad;
  }
  return a;
}

/** Fin liseré lumineux à la couleur d'accent, posé sur le bord intérieur : rappel de la couleur de la carte
 *  pour les anneaux dont le matériau est « neutre » (ceux qui n'ont pas `accent: true`). */
export function accentLip(c, g, acc) {
  glow(c, rgba(acc, 0.8), 6, () =>
    ringLine(c, g.cx, g.cy, g.ri - 1.5, rgba(acc, 0.95), 2.6),
  );
}
