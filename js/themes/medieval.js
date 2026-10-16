/** Thèmes : Médiéval. */
import { fw } from "../core/config.js";
import { fitFont, mid, setLS } from "../core/utils.js";
import {
  corners,
  diamond,
  dot,
  gray,
  label,
  tint,
  vignette,
} from "./helpers.js";

export const medieval = {
  parchemin: {
    shape: (c, x, y, w, h, r) => c.roundRect(x, y, w, h, r),
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 6;
      c.strokeRect(14, 14, W - 28, H - 28);
      c.lineWidth = 2;
      c.globalAlpha = 0.7;
      c.strokeRect(27, 27, W - 54, H - 54);
      c.globalAlpha = 1;
      corners(W, H, 14).forEach(([x, y]) => {
        c.fillStyle = acc;
        diamond(c, x, y, 15);
        c.fillStyle = "#1a1008";
        diamond(c, x, y, 6);
      });
      c.fillStyle = acc;
      [
        [W / 2, 14],
        [W / 2, H - 14],
      ].forEach(([x, y]) => {
        c.beginPath();
        c.arc(x, y, 8, 0, 7);
        c.fill();
      });
    },
    art(c, X) {
      gray(c, X, 0.6);
      tint(c, X, X.acc, 0.18);
      vignette(c, X, 0.6);
    },
    title(c, X, title) {
      const { acc } = X;
      setLS(c, 3);
      fitFont(c, title, X.fT, fw(X.fT, 700), 26, 15, 520);
      const w = Math.min(654, c.measureText(title).width + 84);
      c.beginPath();
      c.moveTo(48, 48);
      c.lineTo(48 + w, 48);
      c.quadraticCurveTo(48 + w - 14, 72, 48 + w, 96);
      c.lineTo(48, 96);
      c.quadraticCurveTo(62, 72, 48, 48);
      c.closePath();
      c.fillStyle = acc;
      c.fill();
      c.strokeStyle = "rgba(42,26,10,.5)";
      c.lineWidth = 1.5;
      c.strokeRect(70, 54, w - 44, 36);
      c.fillStyle = "#2a1a0a";
      c.fillText(title, 90, mid(c, 72));
    },
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 3);
      c.fillRect(px, py + ph - 3, pw, 3);
      c.globalAlpha = 0.45;
      c.strokeStyle = acc;
      c.lineWidth = 1.5;
      c.strokeRect(px + 8, py + 8, pw - 16, ph - 16);
      c.globalAlpha = 1;
    },
  },
  heraldic: {
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 10;
      c.strokeRect(15, 15, W - 30, H - 30);
      c.lineWidth = 2;
      c.strokeStyle = "#fff";
      c.globalAlpha = 0.4;
      c.strokeRect(30, 30, W - 60, H - 60);
      c.globalAlpha = 1;
      const pts = [
        ...corners(W, H, 24).map(([x, y]) => [x, y]),
        [W / 2, 15],
        [W / 2, H - 15],
        [15, H / 2],
        [W - 15, H / 2],
      ];
      pts.forEach(([x, y]) => {
        c.fillStyle = acc;
        c.beginPath();
        c.arc(x, y, 9, 0, 7);
        c.fill();
        c.fillStyle = "#12060a";
        c.beginPath();
        c.arc(x, y, 4, 0, 7);
        c.fill();
      });
    },
    art(c, X) {
      tint(c, X, X.acc, 0.1);
      vignette(c, X, 0.55);
    },
    title(c, X, title) {
      const { acc } = X;
      setLS(c, 2);
      fitFont(c, title, X.fT, fw(X.fT, 700), 34, 20, 540);
      const w = Math.min(654, c.measureText(title).width + 90);
      c.fillStyle = acc;
      c.beginPath();
      c.moveTo(48, 48);
      c.lineTo(48 + w, 48);
      c.lineTo(48 + w - 28, 72);
      c.lineTo(48 + w, 96);
      c.lineTo(48, 96);
      c.closePath();
      c.fill();
      c.fillStyle = "rgba(0,0,0,.35)";
      c.fillRect(48, 48, 12, 48);
      c.fillStyle = "#12060a";
      c.fillText(title, 80, mid(c, 72));
    },
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, 10, ph);
      c.fillRect(px, py, pw, 4);
      [
        [px + pw - 20, py + 20],
        [px + pw - 20, py + ph - 20],
      ].forEach(([x, y]) => {
        c.beginPath();
        c.arc(x, y, 5, 0, 7);
        c.fill();
      });
    },
  },
  enluminure: {
    frame(c, X) {
      const { W, H, acc } = X,
        cols = [acc, "#B3262E", "#2E59B3"];
      c.lineWidth = 4;
      c.strokeRect(14, 14, W - 28, H - 28);
      for (let i = 0, x = 44; x <= W - 44; x += 22, i++) {
        c.fillStyle = cols[i % 3];
        dot(c, x, 25, 4.5);
        dot(c, x, H - 25, 4.5);
      }
      for (let i = 0, y = 44; y <= H - 44; y += 22, i++) {
        c.fillStyle = cols[i % 3];
        dot(c, 25, y, 4.5);
        dot(c, W - 25, y, 4.5);
      }
      corners(W, H, 22).forEach(([x, y]) => {
        c.fillStyle = acc;
        dot(c, x, y, 17);
        c.fillStyle = "#B3262E";
        dot(c, x, y, 9);
        c.fillStyle = "#2E59B3";
        dot(c, x, y, 4);
      });
    },
    art(c, X) {
      tint(c, X, "#2E59B3", 0.1);
      tint(c, X, X.acc, 0.08);
      vignette(c, X, 0.5);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 26,
        fill: X.acc,
        stroke: "#B3262E",
        lw: 3,
        r: 4,
        col: "#14183a",
        pad: 80,
        tx: 40,
        deco: (c, x, y, w, h) => {
          c.fillStyle = "#B3262E";
          diamond(c, x + 18, y + h / 2, 7);
          diamond(c, x + w - 18, y + h / 2, 7);
        },
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 4);
      c.fillRect(px, py + ph - 3, pw, 3);
      c.fillStyle = "#B3262E";
      c.fillRect(px, py + 6, pw, 2);
      c.fillStyle = "#2E59B3";
      c.fillRect(px, py + 10, pw, 2);
    },
  },
  forteresse: {
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 6;
      c.strokeRect(14, 22, W - 28, H - 44);
      c.fillStyle = acc;
      for (let x = 14; x < W - 30; x += 38) {
        c.fillRect(x, 8, 22, 14);
        c.fillRect(x, H - 22, 22, 14);
      }
      c.lineWidth = 2;
      c.globalAlpha = 0.4;
      c.beginPath();
      for (let y = 60; y < H - 40; y += 60) {
        c.moveTo(14, y);
        c.lineTo(32, y);
        c.moveTo(W - 14, y);
        c.lineTo(W - 32, y);
      }
      c.stroke();
      c.globalAlpha = 1;
    },
    art(c, X) {
      gray(c, X, 0.55);
      tint(c, X, "#3a3f48", 0.15);
      vignette(c, X, 0.6);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 28,
        fill: X.acc,
        col: "#15171b",
        r: 3,
        pad: 80,
        tx: 40,
        deco: (c, x, y, w, h) => {
          c.fillStyle = "#15171b";
          [
            [12, 12],
            [w - 12, 12],
            [12, h - 12],
            [w - 12, h - 12],
          ].forEach(([a, b]) => dot(c, x + a, y + b, 3));
        },
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 6);
      c.fillRect(px, py, 6, ph);
      c.fillRect(px + pw - 6, py, 6, ph);
      c.globalAlpha = 0.18;
      for (let y = py + 40; y < py + ph; y += 40)
        c.fillRect(px + 6, y, pw - 12, 1.5);
      c.globalAlpha = 1;
    },
  },
  taverne: {
    frame(c, X) {
      const { W, H, acc } = X;
      c.strokeStyle = "#4a2a12";
      c.lineWidth = 16;
      c.strokeRect(22, 22, W - 44, H - 44);
      c.strokeStyle = "#2b1608";
      c.lineWidth = 1.5;
      c.strokeRect(18, 18, W - 36, H - 36);
      c.strokeRect(26, 26, W - 52, H - 52);
      c.strokeStyle = acc;
      c.lineWidth = 2;
      c.globalAlpha = 0.8;
      c.strokeRect(33, 33, W - 66, H - 66);
      c.globalAlpha = 1;
      c.fillStyle = acc;
      [
        [22, 22],
        [W - 22, 22],
        [22, H - 22],
        [W - 22, H - 22],
      ].forEach(([x, y]) => dot(c, x, y, 5));
      for (let x = 120; x < W - 100; x += 130) {
        dot(c, x, 22, 4);
        dot(c, x, H - 22, 4);
      }
      for (let y = 120; y < H - 100; y += 130) {
        dot(c, 22, y, 4);
        dot(c, W - 22, y, 4);
      }
    },
    art(c, X) {
      tint(c, X, "#ff9a3c", 0.12);
      vignette(c, X, 0.55);
      const g = c.createRadialGradient(
        X.W / 2,
        X.ay + 150,
        20,
        X.W / 2,
        X.ay + 150,
        420,
      );
      g.addColorStop(0, "rgba(255,190,90,.28)");
      g.addColorStop(1, "rgba(255,190,90,0)");
      c.fillStyle = g;
      c.fillRect(X.ax, X.ay, X.aw, X.ah);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 26,
        fill: "#3b2210",
        stroke: X.acc,
        lw: 3,
        r: 6,
        col: X.acc,
        pad: 76,
        tx: 38,
        y: 52,
        h: 44,
        deco: (c, x, y, w, h) => {
          c.strokeStyle = X.acc;
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(x + 24, y);
          c.lineTo(x + 24, y - 20);
          c.moveTo(x + w - 24, y);
          c.lineTo(x + w - 24, y - 20);
          c.stroke();
          c.fillStyle = X.acc;
          dot(c, x + 10, y + h / 2, 3);
          dot(c, x + w - 10, y + h / 2, 3);
        },
      }),
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = "#4a2a12";
      c.fillRect(px, py, pw, 10);
      c.fillStyle = acc;
      c.fillRect(px, py + 10, pw, 2);
      dot(c, px + 12, py + 5, 3);
      dot(c, px + pw - 12, py + 5, 3);
    },
  },
};
