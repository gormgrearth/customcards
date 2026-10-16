/** Thèmes : Fantastique. */
import { fw } from "../core/config.js";
import { fitFont, mid, setLS, shape } from "../core/utils.js";
import {
  corners,
  diamond,
  dot,
  flower,
  glowDots,
  gray,
  label,
  leaf,
  lens,
  para,
  rng,
  SHP,
  sparkles,
  star4,
  star5,
  tint,
  vignette,
} from "./helpers.js";

export const fantastique = {
  arcane: {
    shape: (c, x, y, w, h, r) => c.roundRect(x, y, w, h, r),
    frame(c, X) {
      const { W, H, acc } = X;
      c.save();
      c.shadowColor = acc;
      c.shadowBlur = 14;
      c.lineWidth = 3;
      c.beginPath();
      c.roundRect(14, 14, W - 28, H - 28, 34);
      c.stroke();
      c.lineWidth = 3;
      c.setLineDash([2, 11]);
      c.lineCap = "round";
      c.globalAlpha = 0.8;
      c.beginPath();
      c.roundRect(27, 27, W - 54, H - 54, 24);
      c.stroke();
      c.setLineDash([]);
      c.globalAlpha = 1;
      c.fillStyle = acc;
      corners(W, H, 16).forEach(([x, y]) => star4(c, x, y, 20));
      [
        [W / 2, 14],
        [W / 2, H - 14],
      ].forEach(([x, y]) => star4(c, x, y, 12));
      c.restore();
    },
    art(c, X) {
      tint(c, X, X.acc, 0.14);
      const g = c.createRadialGradient(
        X.W / 2,
        X.ay + X.ah * 0.55,
        40,
        X.W / 2,
        X.ay + X.ah * 0.55,
        380,
      );
      g.addColorStop(0, "rgba(255,255,255,.22)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(X.ax, X.ay, X.aw, X.ah);
      const r = rng(7);
      c.fillStyle = "#fff";
      for (let i = 0; i < 16; i++) {
        c.globalAlpha = 0.4 + r() * 0.5;
        star4(
          c,
          X.ax + 20 + r() * (X.aw - 40),
          X.ay + 110 + r() * 440,
          3 + r() * 6,
        );
      }
      c.globalAlpha = 1;
    },
    title(c, X, title) {
      const { acc } = X;
      setLS(c, 3);
      fitFont(c, title, X.fT, fw(X.fT, 700), 26, 15, 500);
      const w = Math.min(654, c.measureText(title).width + 118);
      c.save();
      c.fillStyle = "rgba(12,6,28,.82)";
      c.beginPath();
      c.roundRect(48, 46, w, 52, 26);
      c.fill();
      c.shadowColor = acc;
      c.shadowBlur = 14;
      c.strokeStyle = acc;
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = acc;
      star4(c, 76, 72, 12);
      star4(c, 48 + w - 28, 72, 12);
      c.fillText(title, 100, mid(c, 72));
      c.restore();
    },
    nameFx(c, X, name, tx, ny) {
      c.save();
      c.shadowColor = X.acc;
      c.shadowBlur = 16;
      c.fillStyle = "#fff";
      c.fillText(name, tx, ny);
      c.restore();
    },
    panel(c, X) {
      const { px, py, pw, ph, acc, S } = X;
      c.save();
      c.shadowColor = acc;
      c.shadowBlur = 12;
      c.strokeStyle = acc;
      c.lineWidth = 4;
      shape(c, X.T, px, py, pw, ph, S.pr);
      c.stroke();
      c.restore();
      c.save();
      c.strokeStyle = acc;
      c.globalAlpha = 0.55;
      c.lineWidth = 2;
      c.setLineDash([2, 9]);
      c.lineCap = "round";
      c.strokeRect(px + 10, py + 10, pw - 20, ph - 20);
      c.restore();
    },
  },
  sylvestre: {
    shape: (c, x, y, w, h, r) => c.roundRect(x, y, w, h, [r, 8, r, 8]),
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 5;
      c.beginPath();
      c.roundRect(14, 14, W - 28, H - 28, [46, 10, 46, 10]);
      c.stroke();
      c.lineWidth = 2;
      c.globalAlpha = 0.5;
      c.beginPath();
      c.roundRect(26, 26, W - 52, H - 52, [36, 6, 36, 6]);
      c.stroke();
      c.globalAlpha = 1;
      c.fillStyle = acc;
      corners(W, H, 16).forEach(([x, y, sx, sy]) => {
        [
          [sx > 0 ? 0 : Math.PI, -0.32 * sx * sy],
          [sx > 0 ? 0 : Math.PI, 0.32 * sx * sy],
          [sy > 0 ? Math.PI / 2 : -Math.PI / 2, -0.32 * sx * sy],
          [sy > 0 ? Math.PI / 2 : -Math.PI / 2, 0.32 * sx * sy],
        ].forEach(([a, d], i) =>
          leaf(c, x + sx * 6, y + sy * 6, 52 - (i % 2) * 8, 11, a + d),
        );
      });
    },
    art(c, X) {
      tint(c, X, X.acc, 0.13);
      const g = c.createLinearGradient(X.ax, X.ay, X.ax + X.aw, X.ay + 500);
      g.addColorStop(0, "rgba(255,255,230,.2)");
      g.addColorStop(0.45, "rgba(255,255,230,0)");
      c.fillStyle = g;
      c.fillRect(X.ax, X.ay, X.aw, X.ah);
      const r = rng(11);
      c.save();
      c.shadowColor = "#FFF59D";
      c.shadowBlur = 12;
      c.fillStyle = "#FFF59D";
      for (let i = 0; i < 14; i++) {
        c.globalAlpha = 0.45 + r() * 0.5;
        c.beginPath();
        c.arc(
          X.ax + 20 + r() * (X.aw - 40),
          X.ay + 120 + r() * 430,
          2 + r() * 2.6,
          0,
          7,
        );
        c.fill();
      }
      c.restore();
    },
    title(c, X, title) {
      const { acc } = X;
      setLS(c, 2);
      fitFont(c, title, X.fT, fw(X.fT, 700), 26, 14, 480);
      const w = Math.min(654, c.measureText(title).width + 110),
        cx = 48 + w / 2;
      c.beginPath();
      c.moveTo(38, 72);
      c.quadraticCurveTo(cx, 22, 58 + w, 72);
      c.quadraticCurveTo(cx, 122, 38, 72);
      c.closePath();
      c.fillStyle = "rgba(5,20,10,.84)";
      c.fill();
      c.strokeStyle = acc;
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = acc;
      c.textAlign = "center";
      c.fillText(title, cx + 4, mid(c, 72));
      c.textAlign = "left";
    },
    panel(c, X) {
      const { px, py, pw, ph, acc, S } = X;
      c.strokeStyle = acc;
      c.lineWidth = 4;
      shape(c, X.T, px, py, pw, ph, S.pr);
      c.stroke();
      c.fillStyle = acc;
      c.globalAlpha = 0.5;
      leaf(c, px + pw - 78, py + 12, 54, 10, 0.25);
      leaf(c, px + pw - 48, py + 10, 40, 8, 0.75);
      c.globalAlpha = 1;
    },
  },
  draconique: {
    shape: SHP.cham,
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 5;
      c.strokeRect(16, 16, W - 32, H - 32);
      c.lineWidth = 2;
      c.globalAlpha = 0.65;
      for (let x = 44; x < W - 30; x += 24) {
        c.beginPath();
        c.arc(x, 28, 11, 0, Math.PI);
        c.stroke();
        c.beginPath();
        c.arc(x, H - 28, 11, Math.PI, Math.PI * 2);
        c.stroke();
      }
      for (let y = 44; y < H - 30; y += 24) {
        c.beginPath();
        c.arc(28, y, 11, Math.PI / 2, Math.PI * 1.5);
        c.stroke();
        c.beginPath();
        c.arc(W - 28, y, 11, -Math.PI / 2, Math.PI / 2);
        c.stroke();
      }
      c.globalAlpha = 1;
      c.fillStyle = acc;
      corners(W, H, 16).forEach(([x, y, sx, sy]) => {
        c.beginPath();
        c.moveTo(x - sx * 4, y - sy * 4);
        c.lineTo(x + sx * 70, y - sy * 4);
        c.lineTo(x - sx * 4, y + sy * 70);
        c.closePath();
        c.fill();
      });
    },
    art(c, X) {
      tint(c, X, "#3a0500", 0.15);
      const g = c.createLinearGradient(0, X.ay + 300, 0, X.ay + X.ah);
      g.addColorStop(0, "rgba(255,106,31,0)");
      g.addColorStop(1, "rgba(255,60,0,.5)");
      c.fillStyle = g;
      c.fillRect(X.ax, X.ay + 300, X.aw, X.ah - 300);
      glowDots(c, X, 4, 36, 150, 600, X.acc, 1.2, 3.4);
      vignette(c, X, 0.5);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 28,
        fill: "rgba(20,4,0,.88)",
        stroke: X.acc,
        glow: 12,
        col: X.acc,
        tglow: X.acc,
        path: para(16),
        pad: 76,
        tx: 38,
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.strokeStyle = acc;
      c.lineWidth = 3;
      shape(c, X.T, px, py, pw, ph, X.S.pr);
      c.stroke();
      c.fillStyle = acc;
      for (let x = px + 10, i = 0; x < px + pw - 30; x += 34, i++) {
        c.beginPath();
        c.moveTo(x, py);
        c.lineTo(x + 22, py);
        c.lineTo(x + 11, py + 10 + (i % 3) * 5);
        c.fill();
      }
      const g = c.createLinearGradient(px, 0, px + pw, 0);
      g.addColorStop(0, acc);
      g.addColorStop(1, "#FFD23F");
      c.fillStyle = g;
      c.fillRect(px, py + ph - 5, pw, 5);
    },
  },
  feerique: {
    shape: SHP.round,
    frame(c, X) {
      const { W, H, acc } = X;
      c.save();
      c.shadowColor = acc;
      c.shadowBlur = 10;
      c.lineWidth = 3;
      c.beginPath();
      c.roundRect(16, 16, W - 32, H - 32, 54);
      c.stroke();
      c.restore();
      c.fillStyle = "#fff";
      c.globalAlpha = 0.85;
      for (let i = 0, x = 80; x < W - 70; x += 24, i++) {
        dot(c, x, 27, i % 2 ? 2.5 : 4);
        dot(c, x, H - 27, i % 2 ? 2.5 : 4);
      }
      for (let i = 0, y = 80; y < H - 70; y += 24, i++) {
        dot(c, 27, y, i % 2 ? 2.5 : 4);
        dot(c, W - 27, y, i % 2 ? 2.5 : 4);
      }
      c.globalAlpha = 1;
      corners(W, H, 26).forEach(([x, y]) =>
        flower(c, x, y, 20, acc, "#FFF3A6"),
      );
      [
        [W / 2, 18],
        [W / 2, H - 18],
      ].forEach(([x, y]) => flower(c, x, y, 12, acc, "#FFF3A6"));
    },
    art(c, X) {
      tint(c, X, X.acc, 0.1);
      const g = c.createRadialGradient(
        X.W / 2,
        X.ay + 80,
        10,
        X.W / 2,
        X.ay + 80,
        420,
      );
      g.addColorStop(0, "rgba(255,255,255,.25)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(X.ax, X.ay, X.aw, X.ah);
      sparkles(c, X, 13, 24, 110, 600, "#fff");
      vignette(c, X, 0.35);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 26,
        fill: X.acc,
        col: "#2a1038",
        r: 24,
        pad: 92,
        tx: 58,
        ls: 2,
        deco: (c, x, y, w, h) => {
          flower(c, x + 28, y + h / 2, 13, "#fff", "#FFD166");
          c.fillStyle = "#fff";
          star4(c, x + w - 24, y + h / 2, 9);
        },
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc, S } = X;
      c.strokeStyle = acc;
      c.lineWidth = 4;
      shape(c, X.T, px, py, pw, ph, S.pr);
      c.stroke();
      c.fillStyle = "#fff";
      c.globalAlpha = 0.7;
      for (let x = px + 30; x < px + pw - 24; x += 22) dot(c, x, py + 9, 3);
      c.globalAlpha = 1;
    },
  },
  cristal: {
    shape: SHP.cham,
    frame(c, X) {
      const { W, H, acc, T } = X;
      c.lineWidth = 4;
      shape(c, T, 14, 14, W - 28, H - 28, 50);
      c.stroke();
      c.lineWidth = 2;
      c.globalAlpha = 0.5;
      shape(c, T, 26, 26, W - 52, H - 52, 38);
      c.stroke();
      c.globalAlpha = 1;
      corners(W, H, 14).forEach(([x, y, sx, sy]) => {
        c.beginPath();
        c.moveTo(x + sx * 50, y);
        c.lineTo(x + sx * 120, y);
        c.lineTo(x + sx * 60, y + sy * 24);
        c.closePath();
        c.fillStyle = "rgba(255,255,255,.2)";
        c.fill();
        c.lineWidth = 1.5;
        c.stroke();
      });
    },
    art(c, X) {
      tint(c, X, X.acc, 0.16);
      gray(c, X, 0.2);
      const r = rng(17);
      c.save();
      c.strokeStyle = "rgba(255,255,255,.16)";
      c.lineWidth = 1.5;
      for (let i = 0; i < 9; i++) {
        const x = X.ax + r() * X.aw,
          y = X.ay + 60 + r() * 520;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + (r() - 0.5) * 340, y + (r() - 0.5) * 340);
        c.stroke();
      }
      c.fillStyle = "rgba(255,255,255,.05)";
      for (let i = 0; i < 6; i++) {
        const x = X.ax + r() * X.aw,
          y = X.ay + 80 + r() * 500;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + 60 + r() * 120, y + (r() - 0.5) * 80);
        c.lineTo(x + (r() - 0.5) * 120, y + 80 + r() * 120);
        c.closePath();
        c.fill();
      }
      c.restore();
      const f = c.createRadialGradient(
        X.W / 2,
        X.ay + X.ah * 0.4,
        250,
        X.W / 2,
        X.ay + X.ah * 0.4,
        650,
      );
      f.addColorStop(0, "rgba(190,240,255,0)");
      f.addColorStop(1, "rgba(190,240,255,.3)");
      c.fillStyle = f;
      c.fillRect(X.ax, X.ay, X.aw, X.ah);
      sparkles(c, X, 19, 7, 120, 560, "#fff");
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 26,
        fill: "rgba(4,22,36,.86)",
        stroke: X.acc,
        lw: 2,
        col: X.acc,
        path: lens(16),
        pad: 84,
        tx: 42,
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.strokeStyle = acc;
      c.lineWidth = 3;
      shape(c, X.T, px, py, pw, ph, X.S.pr);
      c.stroke();
      c.fillStyle = "rgba(255,255,255,.07)";
      for (let i = 0; i < 3; i++) {
        const o = i * 120;
        c.beginPath();
        c.moveTo(px + 60 + o, py);
        c.lineTo(px + 110 + o, py);
        c.lineTo(px + 30 + o, py + ph);
        c.lineTo(px - 20 + o, py + ph);
        c.closePath();
        c.fill();
      }
    },
  },
  // ===== FANTASTIQUE (+3 : lot 3) =====
  necromancie: {
    shape: (c, x, y, w, h, r) => c.roundRect(x, y, w, h, [r, 4, r, 4]),
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 3;
      c.globalAlpha = 0.8;
      c.strokeRect(16, 16, W - 32, H - 32);
      c.globalAlpha = 0.4;
      c.lineWidth = 1.5;
      c.strokeRect(28, 28, W - 56, H - 56);
      c.globalAlpha = 1;
      c.lineWidth = 2;
      corners(W, H, 24).forEach(([x, y]) => {
        c.fillStyle = "#04100e";
        dot(c, x, y, 17);
        c.beginPath();
        c.arc(x, y, 17, 0, 7);
        c.stroke();
        c.fillStyle = acc;
        diamond(c, x, y, 9);
      });
    },
    art(c, X) {
      tint(c, X, "#00ffa0", 0.1);
      gray(c, X, 0.35);
      const g = c.createLinearGradient(0, X.ay + X.ah, 0, X.ay + X.ah - 380);
      g.addColorStop(0, "rgba(108,255,176,.35)");
      g.addColorStop(1, "rgba(108,255,176,0)");
      c.fillStyle = g;
      c.fillRect(X.ax, X.ay, X.aw, X.ah);
      glowDots(c, X, 23, 16, 100, X.ah - 40, X.acc, 1.5, 3.5);
      vignette(c, X, 0.55);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 24,
        fill: "rgba(3,16,14,.9)",
        stroke: X.acc,
        lw: 2,
        r: 4,
        col: X.acc,
        tglow: X.acc,
        glow: 10,
        pad: 76,
        tx: 38,
        h: 46,
        y: 50,
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.fillStyle = acc;
      c.globalAlpha = 0.8;
      c.fillRect(px, py, pw, 3);
      const g = c.createLinearGradient(0, py + ph, 0, py + ph - 70);
      g.addColorStop(0, "rgba(108,255,176,.22)");
      g.addColorStop(1, "rgba(108,255,176,0)");
      c.globalAlpha = 1;
      c.fillStyle = g;
      c.fillRect(px, py + ph - 70, pw, 70);
    },
  },
  elementaire: {
    frame(c, X) {
      const { W, H, acc, alt } = X;
      c.lineWidth = 4;
      c.beginPath();
      c.roundRect(16, 16, W - 32, H - 32, 28);
      c.stroke();
      c.strokeStyle = "#FFD54A";
      c.globalAlpha = 0.6;
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect(26, 26, W - 52, H - 52, 20);
      c.stroke();
      c.globalAlpha = 0.85;
      const r = rng(9);
      for (let x = 40; x < W - 30; x += 22 + r() * 18) {
        const len = 16 + r() * 22;
        c.fillStyle = r() > 0.5 ? acc : "#FFD54A";
        leaf(c, x, H - 14, len, 6 + r() * 4, -Math.PI / 2 + (r() - 0.5) * 0.5);
      }
      c.globalAlpha = 1;
    },
    art(c, X) {
      tint(c, X, "#ff4a00", 0.1);
      const g = c.createLinearGradient(0, X.ay + X.ah, 0, X.ay + X.ah - 420);
      g.addColorStop(0, "rgba(255,90,0,.42)");
      g.addColorStop(1, "rgba(255,90,0,0)");
      c.fillStyle = g;
      c.fillRect(X.ax, X.ay, X.aw, X.ah);
      glowDots(c, X, 5, 22, 160, X.ah - 20, "#FFB347", 1.5, 3.5);
      vignette(c, X, 0.55);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 28,
        fill: "#2a0c04",
        stroke: X.acc,
        lw: 3,
        r: 16,
        col: "#FFD54A",
        tglow: X.acc,
        glow: 10,
        pad: 76,
        tx: 38,
        h: 48,
        y: 50,
      }),
    panel(c, X) {
      const { px, py, pw, acc } = X;
      const g = c.createLinearGradient(px, 0, px + pw, 0);
      g.addColorStop(0, acc);
      g.addColorStop(0.5, "#FFD54A");
      g.addColorStop(1, acc);
      c.fillStyle = g;
      c.fillRect(px, py, pw, 5);
    },
  },
  celeste: {
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 2.5;
      c.beginPath();
      c.roundRect(18, 18, W - 36, H - 36, 34);
      c.stroke();
      c.globalAlpha = 0.45;
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(28, 28, W - 56, H - 56, 26);
      c.stroke();
      c.globalAlpha = 1;
      c.fillStyle = acc;
      [...corners(W, H, 24), [W / 2, 18, 0, 0], [W / 2, H - 18, 0, 0]].forEach(
        ([x, y]) => star5(c, x, y, 11),
      );
      [
        [W / 4, 18],
        [(3 * W) / 4, 18],
        [W / 4, H - 18],
        [(3 * W) / 4, H - 18],
      ].forEach(([x, y]) => star4(c, x, y, 6));
    },
    art(c, X) {
      tint(c, X, "#2b2f8f", 0.2);
      sparkles(c, X, 31, 30, 0, X.ah - 20, "#fff7c2");
      vignette(c, X, 0.45);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 24,
        fill: "rgba(10,12,50,.9)",
        stroke: X.acc,
        lw: 2,
        r: 24,
        col: X.acc,
        center: true,
        pad: 92,
        h: 44,
        y: 52,
        deco: (c, x, y, w, h) => {
          c.fillStyle = X.acc;
          star5(c, x + 18, y + h / 2, 7);
          star5(c, x + w - 18, y + h / 2, 7);
        },
      }),
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 2);
      for (let x = px + 24; x < px + pw; x += 48) star4(c, x, py + 14, 5);
    },
  },
};
