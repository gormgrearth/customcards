/** Thèmes : Horreur. */
import { shape } from "../core/utils.js";
import {
  SHP,
  corners,
  diamond,
  dot,
  drips,
  glowDots,
  grain,
  gray,
  label,
  lens,
  quarter,
  rng,
  tint,
  vignette,
  web,
} from "./helpers.js";

export const horreur = {
  cthulhu: {
    frame(c, X) {
      const { W, H, acc } = X;
      c.save();
      c.globalAlpha = 0.7;
      c.lineWidth = 3;
      c.strokeRect(14, 14, W - 28, H - 28);
      c.restore();
      c.lineCap = "round";
      const tent = (x, y, sx, sy, horiz, len) => {
        let prev = null;
        for (let i = 0; i <= 60; i++) {
          const t = i / 60,
            u = 8 + 10 * Math.sin(t * 10),
            p = horiz
              ? [x + sx * t * len, y + sy * u]
              : [x + sx * u, y + sy * t * len];
          if (prev) {
            c.lineWidth = 13 * (1 - t) + 1.5;
            c.strokeStyle = acc;
            c.beginPath();
            c.moveTo(prev[0], prev[1]);
            c.lineTo(p[0], p[1]);
            c.stroke();
            if (i % 7 === 0 && t < 0.8) {
              c.fillStyle = "rgba(0,0,0,.35)";
              dot(c, p[0], p[1], 2.4 * (1 - t) + 0.8);
            }
          }
          prev = p;
        }
      };
      corners(W, H, 14).forEach(([x, y, sx, sy]) => {
        tent(x, y, sx, sy, true, 210);
        tent(x, y, sx, sy, false, 210);
      });
      c.lineCap = "butt";
    },
    art(c, X) {
      gray(c, X, 0.5);
      tint(c, X, X.acc, 0.22);
      const g = c.createLinearGradient(0, X.ay + 350, 0, X.ay + X.ah);
      g.addColorStop(0, "rgba(111,209,176,0)");
      g.addColorStop(1, "rgba(111,209,176,.3)");
      c.fillStyle = g;
      c.fillRect(X.ax, X.ay + 350, X.aw, X.ah - 350);
      const r = rng(37);
      c.save();
      c.strokeStyle = X.acc;
      c.lineWidth = 1.5;
      for (let i = 0; i < 14; i++) {
        c.globalAlpha = 0.15 + r() * 0.2;
        c.beginPath();
        c.arc(
          X.ax + 20 + r() * (X.aw - 40),
          X.ay + 120 + r() * 470,
          4 + r() * 12,
          0,
          7,
        );
        c.stroke();
      }
      c.restore();
      vignette(c, X, 0.72);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 26,
        ls: 4,
        fill: "rgba(2,14,14,.86)",
        stroke: X.acc,
        lw: 2,
        r: 3,
        col: X.acc,
        pad: 82,
        tx: 41,
        deco: (c, x, y, w, h) => {
          c.strokeStyle = X.acc;
          c.globalAlpha = 0.4;
          c.lineWidth = 1;
          c.strokeRect(x + 5, y + 5, w - 10, h - 10);
          c.globalAlpha = 1;
        },
      }),
    nameFx(c, X, name, tx, ny) {
      c.save();
      c.shadowColor = X.acc;
      c.shadowBlur = 14;
      c.fillStyle = "#fff";
      c.fillText(name, tx, ny);
      c.restore();
    },
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.strokeStyle = acc;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(px, py + 4);
      for (let x = px; x <= px + pw; x += 6)
        c.lineTo(x, py + 5 + 3 * Math.sin(x / 9));
      c.stroke();
      c.fillStyle = acc;
      c.globalAlpha = 0.6;
      c.fillRect(px, py + ph - 3, pw, 3);
      c.globalAlpha = 1;
    },
  },
  annees1900: {
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 6;
      c.strokeRect(14, 14, W - 28, H - 28);
      c.save();
      c.lineWidth = 2;
      c.globalAlpha = 0.6;
      c.strokeRect(27, 27, W - 54, H - 54);
      c.restore();
      corners(W, H, 14).forEach(([x, y, sx, sy]) => {
        c.lineWidth = 3;
        quarter(c, x, y, sx, sy, 34);
        quarter(c, x, y, sx, sy, 22);
        c.fillStyle = acc;
        dot(c, x, y, 7);
      });
      c.fillStyle = acc;
      [
        [W / 2, 14],
        [W / 2, H - 14],
        [14, H / 2],
        [W - 14, H / 2],
      ].forEach(([x, y]) => diamond(c, x, y, 10));
    },
    art(c, X) {
      gray(c, X, 0.9);
      tint(c, X, X.acc, 0.33);
      const r = rng(41);
      for (let i = 0; i < 7; i++) {
        const x = X.ax + r() * X.aw,
          y = X.ay + r() * X.ah,
          R = 30 + r() * 60,
          g = c.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, "rgba(120,70,20,.22)");
        g.addColorStop(1, "rgba(120,70,20,0)");
        c.fillStyle = g;
        c.fillRect(x - R, y - R, R * 2, R * 2);
      }
      c.strokeStyle = "rgba(255,255,255,.13)";
      c.lineWidth = 1;
      for (let i = 0; i < 22; i++) {
        const x = X.ax + r() * X.aw,
          y = X.ay + r() * X.ah;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + (r() - 0.5) * 6, y + 40 + r() * 220);
        c.stroke();
      }
      grain(c, X, 43, 320, 0.2);
      vignette(c, X, 0.75);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 24,
        ls: 2,
        fill: X.acc,
        stroke: "#2b1a0a",
        lw: 2,
        r: 22,
        col: "#2b1a0a",
        pad: 76,
        tx: 38,
        deco: (c, x, y, w, h) => {
          c.strokeStyle = "rgba(43,26,10,.6)";
          c.lineWidth = 1.5;
          c.beginPath();
          c.roundRect(x + 5, y + 5, w - 10, h - 10, 17);
          c.stroke();
        },
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 3);
      c.fillRect(px, py + 7, pw, 1.5);
      c.fillRect(px, py + ph - 3, pw, 3);
      c.fillRect(px, py + ph - 9, pw, 1.5);
      [
        [px + 12, py + 18],
        [px + pw - 12, py + 18],
      ].forEach(([x, y]) => dot(c, x, y, 3));
    },
  },
  slasher: {
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 6;
      c.strokeRect(14, 14, W - 28, H - 28);
      drips(c, 30, W - 30, 18, 21, 20, 95, acc);
      const r = rng(47);
      c.fillStyle = acc;
      for (let i = 0; i < 30; i++) {
        const top = r() > 0.35,
          x = r() < 0.5 ? r() * 120 : W - r() * 120,
          y = top ? 14 + r() * 34 : H - 14 - r() * 34;
        dot(c, x, y, 1.5 + r() * 4);
      }
    },
    art(c, X) {
      gray(c, X, 0.5);
      tint(c, X, "#7a0008", 0.25);
      const v = c.createRadialGradient(
        X.W / 2,
        X.ay + X.ah * 0.4,
        200,
        X.W / 2,
        X.ay + X.ah * 0.4,
        640,
      );
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(60,0,4,.72)");
      c.fillStyle = v;
      c.fillRect(X.ax, X.ay, X.aw, X.ah);
      c.save();
      c.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const x = X.ax + X.aw - 220 + i * 28;
        c.strokeStyle = "rgba(0,0,0,.4)";
        c.lineWidth = 9;
        c.beginPath();
        c.moveTo(x, X.ay + 150);
        c.lineTo(x + 92, X.ay + 430);
        c.stroke();
        c.strokeStyle = "rgba(255,255,255,.22)";
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(x, X.ay + 150);
        c.lineTo(x + 92, X.ay + 430);
        c.stroke();
      }
      c.restore();
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 38,
        ls: 3,
        fill: "rgba(0,0,0,.55)",
        r: 8,
        col: X.acc,
        outline: "#000",
        pad: 64,
        tx: 32,
      }),
    nameFx(c, X, name, tx, ny) {
      c.fillStyle = "#5a0006";
      c.fillText(name, tx + 3, ny + 3);
    },
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 6);
      drips(c, px + 10, px + pw - 20, py + 4, 5, 8, 30, acc);
    },
  },
  fantome: {
    shape: SHP.round,
    frame(c, X) {
      const { W, H, acc } = X;
      c.save();
      c.shadowColor = acc;
      c.shadowBlur = 12;
      c.globalAlpha = 0.85;
      c.lineWidth = 2;
      c.beginPath();
      c.roundRect(14, 14, W - 28, H - 28, 28);
      c.stroke();
      c.globalAlpha = 0.6;
      c.lineWidth = 2;
      c.setLineDash([3, 9]);
      c.beginPath();
      c.roundRect(26, 26, W - 52, H - 52, 20);
      c.stroke();
      c.restore();
    },
    art(c, X) {
      gray(c, X, 0.55);
      tint(c, X, X.acc, 0.13);
      const r = rng(53);
      for (let i = 0; i < 7; i++) {
        const x = X.ax + r() * X.aw,
          y = X.ay + 150 + r() * 450,
          R = 120 + r() * 100,
          g = c.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, "rgba(255,255,255,.12)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g;
        c.fillRect(x - R, y - R, R * 2, R * 2);
      }
      glowDots(c, X, 59, 9, 140, 560, X.acc, 2, 5);
      vignette(c, X, 0.6);
      web(c, X.ax, X.ay, 1, 1, 130, "rgba(255,255,255,.4)");
      web(c, X.ax + X.aw, X.ay, -1, 1, 130, "rgba(255,255,255,.4)");
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 28,
        ls: 5,
        fill: "rgba(4,10,14,.8)",
        stroke: X.acc,
        lw: 1.5,
        glow: 10,
        r: 24,
        col: X.acc,
        tglow: X.acc,
        pad: 80,
        tx: 40,
      }),
    nameFx(c, X, name, tx, ny) {
      c.save();
      c.shadowColor = X.acc;
      c.shadowBlur = 14;
      c.fillStyle = "#fff";
      c.fillText(name, tx, ny);
      c.restore();
    },
    panel(c, X) {
      const { px, py, pw, ph, acc, S } = X;
      c.save();
      c.shadowColor = acc;
      c.shadowBlur = 10;
      c.strokeStyle = acc;
      c.lineWidth = 3;
      shape(c, X.T, px, py, pw, ph, S.pr);
      c.stroke();
      c.restore();
      const g = c.createLinearGradient(0, py, 0, py + 60);
      g.addColorStop(0, "rgba(255,255,255,.1)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(px, py, pw, 60);
    },
  },
  gothique: {
    shape: SHP.arch,
    frame(c, X) {
      const { W, H, T } = X;
      c.lineWidth = 5;
      shape(c, T, 14, 14, W - 28, H - 28, 60);
      c.stroke();
      c.save();
      c.lineWidth = 2;
      c.globalAlpha = 0.5;
      shape(c, T, 26, 26, W - 52, H - 52, 60);
      c.stroke();
      c.restore();
    },
    art(c, X) {
      gray(c, X, 0.45);
      tint(c, X, X.acc, 0.16);
      c.save();
      c.strokeStyle = X.acc;
      c.lineWidth = 2;
      c.globalAlpha = 0.13;
      c.beginPath();
      [X.aw / 3, (X.aw * 2) / 3].forEach((x) => {
        c.moveTo(X.ax + x, X.ay + 230);
        c.lineTo(X.ax + x, X.ay + 600);
      });
      c.stroke();
      c.globalAlpha = 0.35;
      c.setLineDash([6, 6]);
      c.beginPath();
      c.arc(X.W / 2, X.ay + 175, 62, 0, 7);
      c.stroke();
      c.setLineDash([]);
      c.beginPath();
      c.arc(X.W / 2, X.ay + 175, 30, 0, 7);
      c.stroke();
      c.restore();
      vignette(c, X, 0.65);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        center: true,
        y: 694,
        h: 46,
        sz: 28,
        ls: 4,
        fill: "rgba(8,2,14,.86)",
        stroke: X.acc,
        lw: 2,
        col: X.acc,
        path: lens(20),
        pad: 88,
      }),
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 4);
      c.globalAlpha = 0.7;
      for (let x = px + 8; x < px + pw - 30; x += 30) {
        c.beginPath();
        c.moveTo(x, py + 4);
        c.lineTo(x + 22, py + 4);
        c.lineTo(x + 11, py + 16);
        c.closePath();
        c.fill();
      }
      c.globalAlpha = 1;
    },
  },
};
