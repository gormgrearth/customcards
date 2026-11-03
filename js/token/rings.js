/**
 * Anneaux de token.
 * Pour ajouter un style : ajouter une entrée dans RINGS
 * ({ label, thickness (fraction de la largeur du token), draw(c, g, acc) }).
 * `g` = { L, cx, cy, ro, ri } : taille logique, centre, rayons extérieur/intérieur.
 */
export const DEFAULT_RING = "cyber-metal";

const TAU = Math.PI * 2;

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

const rgba = (hex, a) => {
  let h = String(hex || "#00f0ff").replace("#", "");
  if (h.length === 3) h = [...h].map((x) => x + x).join("");
  const n = parseInt(h, 16) || 0;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** Dégradé « métal brossé » : bandes claires/sombres autour de l'anneau. */
function metal(c, cx, cy, ro) {
  const stops = c.createConicGradient
    ? [
        [0, "#3c434e"],
        [0.1, "#a3adbc"],
        [0.2, "#3a414c"],
        [0.34, "#171b22"],
        [0.48, "#6f798a"],
        [0.58, "#242a33"],
        [0.74, "#8d97a7"],
        [0.86, "#2c323c"],
        [1, "#3c434e"],
      ]
    : [
        [0, "#8e98a8"],
        [0.35, "#252b34"],
        [0.6, "#6a7485"],
        [1, "#1b2027"],
      ];
  const g = c.createConicGradient
    ? c.createConicGradient(-Math.PI / 2 - 0.6, cx, cy)
    : c.createLinearGradient(cx - ro, cy - ro, cx + ro, cy + ro);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}

/** Cyberpunk métal, sobre : acier brossé, graduations, rainure avec deux segments actifs. */
function cyberMetal(c, g, acc) {
  const { cx, cy, ro, ri } = g;
  c.save();
  // 1. corps en métal brossé
  c.beginPath();
  c.arc(cx, cy, ro, 0, TAU);
  c.arc(cx, cy, ri, 0, TAU, true);
  c.fillStyle = metal(c, cx, cy, ro);
  c.fill();
  // 2. grain (stries concentriques très discrètes)
  for (let r = ri + 3, i = 0; r < ro - 2; r += 2, i++)
    ringLine(
      c,
      cx,
      cy,
      r,
      i % 2 ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.07)",
      1,
    );
  // 3. chanfreins extérieur et intérieur
  ringLine(c, cx, cy, ro - 1.5, "rgba(0,0,0,.8)", 3);
  ringLine(c, cx, cy, ro - 5, "rgba(255,255,255,.24)", 1.5);
  ringLine(c, cx, cy, ri + 2, "rgba(0,0,0,.85)", 4);
  ringLine(c, cx, cy, ri + 6, "rgba(255,255,255,.1)", 1);
  // 4. graduations
  c.strokeStyle = "rgba(0,0,0,.55)";
  c.lineCap = "butt";
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * TAU,
      major = i % 6 === 0,
      r1 = ro - 9,
      r2 = r1 - (major ? 7 : 3.5);
    c.lineWidth = major ? 2 : 1.2;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    c.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    c.stroke();
  }
  // 5. rainure + liseré de la couleur d'accent, deux segments plus lumineux
  const rc = ro - 21;
  ringLine(c, cx, cy, rc, "rgba(0,0,0,.55)", 6);
  ringLine(c, cx, cy, rc, rgba(acc, 0.3), 1.3);
  c.save();
  c.shadowColor = rgba(acc, 0.7);
  c.shadowBlur = 7;
  c.lineCap = "round";
  [
    [-78, -38],
    [102, 142],
  ].forEach(([a0, a1]) => {
    c.beginPath();
    c.arc(cx, cy, rc, (a0 * Math.PI) / 180, (a1 * Math.PI) / 180);
    c.strokeStyle = rgba(acc, 0.92);
    c.lineWidth = 3;
    c.stroke();
  });
  c.restore();
  // 6. quatre vis
  for (let i = 0; i < 4; i++) {
    const a = ((45 + 90 * i) * Math.PI) / 180,
      x = cx + Math.cos(a) * (ro - 30),
      y = cy + Math.sin(a) * (ro - 30),
      gr = c.createRadialGradient(x - 1, y - 1, 0, x, y, 3.4);
    gr.addColorStop(0, "#c3ccd9");
    gr.addColorStop(1, "#3a424e");
    disc(c, x, y, 3);
    c.fillStyle = gr;
    c.fill();
    c.strokeStyle = "rgba(0,0,0,.7)";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x - Math.sin(a) * 2.4, y + Math.cos(a) * 2.4);
    c.lineTo(x + Math.sin(a) * 2.4, y - Math.cos(a) * 2.4);
    c.stroke();
  }
  c.restore();
}

export const RINGS = {
  "cyber-metal": {
    label: "Cyber métal (sobre)",
    thickness: 0.075,
    draw: cyberMetal,
  },
};
