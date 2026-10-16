/** Thèmes : Cyberpunk & néon (nouveaux). */
import {
  corners,
  dot,
  glowDots,
  label,
  rng,
  SHP,
  tint,
  vignette,
} from "./helpers.js";

export const cyberpunk = {
  // ===== CYBERPUNK & NÉON =====
  hacker: {
    shape: (c, x, y, w, h, r) => c.roundRect(x, y, w, h, Math.min(r, 6)),
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 2;
      c.globalAlpha = 0.5;
      c.strokeRect(14, 14, W - 28, H - 28);
      c.globalAlpha = 1;
      c.lineWidth = 5;
      corners(W, H, 14).forEach(([x, y, a, b]) => {
        c.beginPath();
        c.moveTo(x + a * 50, y);
        c.lineTo(x, y);
        c.lineTo(x, y + b * 50);
        c.stroke();
      });
      c.fillStyle = acc;
      c.globalAlpha = 0.6;
      for (let i = 0; i < 18; i++) {
        c.fillRect(20, 90 + i * 50, 8, 2);
        c.fillRect(W - 28, 90 + i * 50, 8, 2);
      }
      c.globalAlpha = 1;
    },
    art(c, X) {
      tint(c, X, "#00ff66", 0.1);
      c.save();
      c.fillStyle = "rgba(0,0,0,.22)";
      for (let y = X.ay; y < X.ay + X.ah; y += 4)
        c.fillRect(X.ax, y, X.aw, 1.5);
      const r = rng(77);
      c.fillStyle = X.acc;
      c.font = '14px "Share Tech Mono",monospace';
      for (let i = 0; i < 40; i++) {
        c.globalAlpha = 0.15 + r() * 0.35;
        c.fillText(
          r() > 0.5 ? "1" : "0",
          X.ax + 10 + r() * (X.aw - 20),
          X.ay + 20 + r() * (X.ah - 40),
        );
      }
      c.restore();
      vignette(c, X, 0.5);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 26,
        fill: "rgba(0,20,8,.9)",
        stroke: X.acc,
        lw: 2,
        r: 2,
        col: X.acc,
        pad: 76,
        tx: 40,
        h: 46,
        y: 50,
        glow: 10,
        deco: (c, x, y, w, h) => {
          c.fillStyle = X.acc;
          c.fillRect(x + 14, y + h / 2 - 3, 7, 7);
          c.fillRect(x + w - 21, y + h / 2 - 3, 7, 7);
        },
      }),
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 3);
      c.globalAlpha = 0.3;
      for (let i = 0; i < 7; i++)
        c.fillRect(px + pw - 34 - i * 14, py + 10, 8, 3);
      c.globalAlpha = 1;
    },
  },
  yakuza: {
    shape: SHP.cham,
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 10;
      c.strokeRect(20, 20, W - 40, H - 40);
      c.strokeStyle = "#fff";
      c.globalAlpha = 0.45;
      c.lineWidth = 2;
      c.strokeRect(30, 30, W - 60, H - 60);
      c.globalAlpha = 1;
      c.fillStyle = acc;
      corners(W, H, 14).forEach(([x, y, a, b]) => {
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + a * 46, y);
        c.lineTo(x, y + b * 46);
        c.closePath();
        c.fill();
      });
    },
    art(c, X) {
      tint(c, X, "#ff2200", 0.12);
      c.save();
      c.fillStyle = X.acc;
      c.globalAlpha = 0.12;
      dot(c, X.W / 2, X.ay + 300, 190);
      c.restore();
      vignette(c, X, 0.55);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 28,
        fill: "#1a0502",
        stroke: X.acc,
        lw: 3,
        col: X.acc,
        pad: 84,
        tx: 44,
        h: 50,
        y: 48,
        path: (c, x, y, w, h) => {
          c.beginPath();
          SHP.cham(c, x, y, w, h, 12);
        },
        deco: (c, x, y, w, h) => {
          c.fillStyle = X.acc;
          c.fillRect(x + 14, y + 10, 5, h - 20);
          c.fillRect(x + w - 19, y + 10, 5, h - 20);
        },
      }),
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 8);
      c.globalAlpha = 0.35;
      for (let x = px + 20; x < px + pw; x += 36) {
        c.beginPath();
        c.moveTo(x, py + 8);
        c.lineTo(x + 14, py + 8);
        c.lineTo(x + 4, py + 22);
        c.lineTo(x - 10, py + 22);
        c.closePath();
        c.fill();
      }
      c.globalAlpha = 1;
    },
  },
  pluie: {
    frame(c, X) {
      const { W, H, acc, alt } = X;
      c.save();
      c.shadowColor = acc;
      c.shadowBlur = 16;
      c.lineWidth = 5;
      c.beginPath();
      c.roundRect(16, 16, W - 32, H - 32, 34);
      c.stroke();
      c.strokeStyle = alt;
      c.shadowColor = alt;
      c.lineWidth = 2;
      c.beginPath();
      c.roundRect(28, 28, W - 56, H - 56, 24);
      c.stroke();
      c.restore();
    },
    art(c, X) {
      tint(c, X, "#5a1fa8", 0.2);
      const r = rng(41);
      c.save();
      c.strokeStyle = "rgba(190,220,255,.5)";
      c.lineWidth = 1.2;
      for (let i = 0; i < 110; i++) {
        const x = X.ax + r() * X.aw,
          y = X.ay + r() * X.ah,
          l = 14 + r() * 30;
        c.globalAlpha = 0.15 + r() * 0.4;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x - l * 0.25, y + l);
        c.stroke();
      }
      c.restore();
      glowDots(c, X, 8, 9, X.ah * 0.55, X.ah - 40, X.alt, 2, 4);
      vignette(c, X, 0.5);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 24,
        fill: "rgba(14,4,28,.88)",
        stroke: X.acc,
        lw: 3,
        r: 24,
        col: "#fff",
        tglow: X.acc,
        glow: 14,
        pad: 76,
        tx: 38,
        h: 46,
        y: 50,
      }),
    panel(c, X) {
      const { px, py, pw, acc, alt } = X;
      const g = c.createLinearGradient(px, 0, px + pw, 0);
      g.addColorStop(0, acc);
      g.addColorStop(1, alt);
      c.fillStyle = g;
      c.fillRect(px, py, pw, 4);
      c.globalAlpha = 0.12;
      c.fillRect(px, py, pw, 60);
      c.globalAlpha = 1;
    },
  },
};
