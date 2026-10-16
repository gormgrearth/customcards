/** Primitives de dessin partagées par les thèmes. */
import { fw } from "../core/config.js";
import { fitFont, mid, setLS } from "../core/utils.js";

export const rng = (seed) => () =>
  (seed = (seed * 16807) % 2147483647) / 2147483647;

export const noGlow = (c) => {
  c.shadowBlur = 0;
  c.shadowColor = "transparent";
};

export const star4 = (c, x, y, r) => {
  c.beginPath();
  c.moveTo(x, y - r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.quadraticCurveTo(x, y, x, y + r);
  c.quadraticCurveTo(x, y, x - r, y);
  c.quadraticCurveTo(x, y, x, y - r);
  c.closePath();
  c.fill();
};

export const leaf = (c, x, y, len, wid, ang) => {
  c.save();
  c.translate(x, y);
  c.rotate(ang);
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(len * 0.5, -wid, len, 0);
  c.quadraticCurveTo(len * 0.5, wid, 0, 0);
  c.fill();
  c.restore();
};

export const diamond = (c, x, y, r) => {
  c.beginPath();
  c.moveTo(x, y - r);
  c.lineTo(x + r, y);
  c.lineTo(x, y + r);
  c.lineTo(x - r, y);
  c.closePath();
  c.fill();
};

export const corners = (W, H, m) => [
  [m, m, 1, 1],
  [W - m, m, -1, 1],
  [m, H - m, 1, -1],
  [W - m, H - m, -1, -1],
];

export const tint = (c, X, col, a) => {
  c.save();
  c.globalAlpha = a;
  c.fillStyle = col;
  c.fillRect(X.ax, X.ay, X.aw, X.ah);
  c.restore();
};

export const gray = (c, X, a) => {
  c.save();
  c.globalCompositeOperation = "saturation";
  c.globalAlpha = a;
  c.fillStyle = "#000";
  c.fillRect(X.ax, X.ay, X.aw, X.ah);
  c.restore();
};

export const vignette = (c, X, a, r0 = 230) => {
  const v = c.createRadialGradient(
    X.W / 2,
    X.ay + X.ah * 0.4,
    r0,
    X.W / 2,
    X.ay + X.ah * 0.4,
    640,
  );
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, `rgba(0,0,0,${a})`);
  c.fillStyle = v;
  c.fillRect(X.ax, X.ay, X.aw, X.ah);
};

export const SHP = {
  round: (c, x, y, w, h, r) => c.roundRect(x, y, w, h, r),
  cham: (c, x, y, w, h, r) => {
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.lineTo(x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.lineTo(x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.lineTo(x, y + h - r);
    c.lineTo(x, y + r);
    c.closePath();
  },
  arch: (c, x, y, w, h, r) => {
    if (r < 40) {
      c.rect(x, y, w, h);
      return;
    }
    const t = r * 4;
    c.moveTo(x, y + h);
    c.lineTo(x, y + t);
    c.quadraticCurveTo(x, y + t * 0.28, x + w / 2, y);
    c.quadraticCurveTo(x + w, y + t * 0.28, x + w, y + t);
    c.lineTo(x + w, y + h);
    c.closePath();
  },
};

export const star5 = (c, x, y, r) => {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5,
      q = i % 2 ? r * 0.45 : r;
    c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q);
  }
  c.closePath();
  c.fill();
};

export const flower = (c, x, y, r, petal, center) => {
  c.fillStyle = petal;
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    c.beginPath();
    c.ellipse(
      x + Math.cos(a) * r * 0.6,
      y + Math.sin(a) * r * 0.6,
      r * 0.5,
      r * 0.32,
      a,
      0,
      7,
    );
    c.fill();
  }
  c.fillStyle = center;
  c.beginPath();
  c.arc(x, y, r * 0.28, 0, 7);
  c.fill();
};

export const hexPath = (c, x, y, r) => {
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i,
      px = x + Math.cos(a) * r,
      py = y + Math.sin(a) * r;
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.closePath();
};

export const drips = (c, x0, x1, y, seed, minL, maxL, col) => {
  const r = rng(seed);
  c.fillStyle = col;
  for (let x = x0; x < x1; x += 16 + r() * 26) {
    const l = minL + r() * (maxL - minL),
      w = 6 + r() * 7;
    c.beginPath();
    c.roundRect(x, y - 4, w, l, w / 2);
    c.fill();
    c.beginPath();
    c.arc(x + w / 2, y + l, w * 0.85, 0, 7);
    c.fill();
  }
};

export const dot = (c, x, y, r) => {
  c.beginPath();
  c.arc(x, y, r, 0, 7);
  c.fill();
};

export const quarter = (c, x, y, sx, sy, r) => {
  const a = Math.atan2(sy, sx);
  c.beginPath();
  c.arc(x, y, r, a - Math.PI / 4, a + Math.PI / 4);
  c.stroke();
};

const pill = (c, x, y, w, h) => {
  c.beginPath();
  c.roundRect(x, y, w, h, h / 2);
};

export const para = (k) => (c, x, y, w, h) => {
  c.beginPath();
  c.moveTo(x + k, y);
  c.lineTo(x + w, y);
  c.lineTo(x + w - k, y + h);
  c.lineTo(x, y + h);
  c.closePath();
};

export const lens = (k) => (c, x, y, w, h) => {
  c.beginPath();
  c.moveTo(x, y + h / 2);
  c.lineTo(x + k, y);
  c.lineTo(x + w - k, y);
  c.lineTo(x + w, y + h / 2);
  c.lineTo(x + w - k, y + h);
  c.lineTo(x + k, y + h);
  c.closePath();
};

// Étiquette de titre générique
export function label(c, X, title, o) {
  setLS(c, o.ls ?? 3);
  fitFont(
    c,
    title,
    X.fT,
    fw(X.fT, 700),
    o.sz ?? 28,
    o.min ?? 14,
    o.maxw ?? 520,
  );
  const tw = c.measureText(title).width,
    w = Math.min(o.cap ?? 654, tw + (o.pad ?? 70)),
    h = o.h ?? 48,
    x = o.center ? (X.W - w) / 2 : (o.x ?? 48),
    y = o.y ?? 48;
  c.save();
  if (o.path) o.path(c, x, y, w, h);
  else {
    c.beginPath();
    c.roundRect(x, y, w, h, o.r ?? 0);
  }
  if (o.fill) {
    c.fillStyle = o.fill;
    c.fill();
  }
  if (o.stroke) {
    c.strokeStyle = o.stroke;
    c.lineWidth = o.lw ?? 2;
    if (o.glow) {
      c.shadowColor = o.stroke;
      c.shadowBlur = o.glow;
    }
    c.stroke();
    noGlow(c);
  }
  if (o.deco) o.deco(c, x, y, w, h);
  const ty = mid(c, y + h / 2);
  if (o.outline) {
    c.lineJoin = "round";
    c.strokeStyle = o.outline;
    c.lineWidth = 7;
    if (o.center) c.textAlign = "center";
    c.strokeText(title, o.center ? x + w / 2 : x + (o.tx ?? 36), ty);
  }
  c.fillStyle = o.col;
  if (o.tglow) {
    c.shadowColor = o.tglow;
    c.shadowBlur = 14;
  }
  if (o.center) {
    c.textAlign = "center";
    c.fillText(title, x + w / 2 + (o.ls ?? 3) / 2, ty);
  } else c.fillText(title, x + (o.tx ?? 36), ty);
  c.restore();
}

export const sparkles = (c, X, seed, n, y0, y1, col) => {
  const r = rng(seed);
  c.save();
  c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    c.globalAlpha = 0.35 + r() * 0.55;
    star4(
      c,
      X.ax + 20 + r() * (X.aw - 40),
      X.ay + y0 + r() * (y1 - y0),
      3 + r() * 6,
    );
  }
  c.restore();
};

export const glowDots = (c, X, seed, n, y0, y1, col, rmin, rmax) => {
  const r = rng(seed);
  c.save();
  c.shadowColor = col;
  c.shadowBlur = 12;
  c.fillStyle = col;
  for (let i = 0; i < n; i++) {
    c.globalAlpha = 0.4 + r() * 0.55;
    dot(
      c,
      X.ax + 16 + r() * (X.aw - 32),
      X.ay + y0 + r() * (y1 - y0),
      rmin + r() * (rmax - rmin),
    );
  }
  c.restore();
};

export const grain = (c, X, seed, n, a) => {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    c.fillStyle =
      r() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 1.3})`;
    c.fillRect(
      X.ax + r() * X.aw,
      X.ay + r() * X.ah,
      1 + r() * 1.6,
      1 + r() * 1.6,
    );
  }
};

export const web = (c, x, y, sx, sy, len, col) => {
  c.save();
  c.strokeStyle = col;
  c.lineWidth = 1.3;
  const N = 5,
    pts = (k) => [
      x + Math.cos(((k / (N - 1)) * Math.PI) / 2) * sx,
      y + Math.sin(((k / (N - 1)) * Math.PI) / 2) * sy,
    ];
  for (let k = 0; k < N; k++) {
    const [dx, dy] = pts(k);
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + (dx - x) * len, y + (dy - y) * len);
    c.stroke();
  }
  [0.28, 0.54, 0.8].forEach((f) => {
    c.beginPath();
    for (let k = 0; k < N; k++) {
      const a = ((k / (N - 1)) * Math.PI) / 2,
        R = f * len,
        px = x + Math.cos(a) * sx * R,
        py = y + Math.sin(a) * sy * R;
      if (!k) c.moveTo(px, py);
      else {
        const am = (((k - 0.5) / (N - 1)) * Math.PI) / 2,
          cr = R * 0.8;
        c.quadraticCurveTo(
          x + Math.cos(am) * sx * cr,
          y + Math.sin(am) * sy * cr,
          px,
          py,
        );
      }
    }
    c.stroke();
  });
  c.restore();
};
