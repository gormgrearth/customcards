/** Thèmes : Contemporain. */
import { fw } from "../core/config.js";
import { fitFont, mid, setLS, shape } from "../core/utils.js";
import { dot, gray, label, para, SHP, tint, vignette } from "./helpers.js";

export const contemporain = {
  urbain: {
    shape: (c, x, y, w, h, r) => c.roundRect(x, y, w, h, r),
    frame(c, X) {
      const { W, H } = X;
      c.lineWidth = 2;
      c.globalAlpha = 0.45;
      c.beginPath();
      c.roundRect(16, 16, W - 32, H - 32, 30);
      c.stroke();
      c.globalAlpha = 1;
      c.lineWidth = 8;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(60, 16);
      c.lineTo(170, 16);
      c.moveTo(W - 60, H - 16);
      c.lineTo(W - 170, H - 16);
      c.stroke();
      c.lineCap = "butt";
    },
    art(c, X) {
      gray(c, X, 0.25);
      const g = c.createLinearGradient(0, X.ay, 0, X.ay + 160);
      g.addColorStop(0, "rgba(0,0,0,.45)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(X.ax, X.ay, X.aw, 160);
    },
    title(c, X, title) {
      const { acc } = X;
      setLS(c, 4);
      fitFont(c, title, X.fT, fw(X.fT, 700), 24, 14, 520);
      const w = Math.min(654, c.measureText(title).width + 74);
      c.fillStyle = acc;
      c.beginPath();
      c.roundRect(48, 50, w, 44, 10);
      c.fill();
      c.fillStyle = "#101216";
      c.fillRect(64, 66, 12, 12);
      c.fillText(title, 90, mid(c, 72));
    },
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py + ph - 5, pw, 5);
      c.fillRect(px, py, 70, 5);
    },
  },
  magazine: {
    frame(c, X) {
      const { W, H } = X;
      c.lineWidth = 6;
      c.beginPath();
      c.moveTo(24, 22);
      c.lineTo(W - 24, 22);
      c.moveTo(24, H - 22);
      c.lineTo(W - 24, H - 22);
      c.stroke();
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(24, 32);
      c.lineTo(W - 24, 32);
      c.moveTo(24, H - 32);
      c.lineTo(W - 24, H - 32);
      c.moveTo(22, 22);
      c.lineTo(22, H - 22);
      c.moveTo(W - 22, 22);
      c.lineTo(W - 22, H - 22);
      c.stroke();
    },
    art(c, X) {
      gray(c, X, 0.2);
      c.save();
      c.strokeStyle = "#fff";
      c.globalAlpha = 0.5;
      c.lineWidth = 1.5;
      c.strokeRect(X.ax + 14, X.ay + 14, X.aw - 28, X.ah - 28);
      c.restore();
    },
    title(c, X, title) {
      const { acc, W } = X;
      setLS(c, 7);
      fitFont(c, title, X.fT, fw(X.fT, 700), 30, 16, 560);
      c.fillStyle = acc;
      c.fillRect(48, 48, 654, 48);
      c.fillStyle = "rgba(16,14,10,.6)";
      c.fillRect(48, 54, 654, 1.5);
      c.fillRect(48, 90, 654, 1.5);
      c.fillStyle = "#16140f";
      c.textAlign = "center";
      c.fillText(title, W / 2 + 3, mid(c, 72));
      c.textAlign = "left";
    },
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 5);
      c.fillRect(px, py + 9, pw, 1.5);
    },
  },
  instantane: {
    shape: SHP.round,
    frame(c, X) {
      const { W, H } = X;
      c.save();
      c.strokeStyle = "#F1ECDD";
      c.lineWidth = 26;
      c.strokeRect(27, 27, W - 54, H - 54);
      c.strokeStyle = "#cfc8b4";
      c.lineWidth = 2;
      c.strokeRect(14, 14, W - 28, H - 28);
      c.restore();
      [
        [48, 44, -0.75],
        [W - 48, 44, 0.75],
      ].forEach(([x, y, a]) => {
        c.save();
        c.translate(x, y);
        c.rotate(a);
        c.fillStyle = "rgba(235,220,150,.82)";
        c.fillRect(-66, -15, 132, 30);
        c.fillStyle = "rgba(0,0,0,.06)";
        for (let i = -60; i < 60; i += 8) c.fillRect(i, -15, 2, 30);
        c.restore();
      });
    },
    art(c, X) {
      gray(c, X, 0.25);
      tint(c, X, "#ffb703", 0.08);
      vignette(c, X, 0.3);
      const g = c.createLinearGradient(
        X.ax + X.aw,
        X.ay,
        X.ax + X.aw - 340,
        X.ay + 300,
      );
      g.addColorStop(0, "rgba(255,140,0,.38)");
      g.addColorStop(1, "rgba(255,140,0,0)");
      c.fillStyle = g;
      c.fillRect(X.ax, X.ay, X.aw, X.ah);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        x: 108,
        y: 56,
        h: 44,
        cap: 540,
        sz: 32,
        ls: 1,
        fill: "#F1ECDD",
        col: "#2a2418",
        r: 4,
        pad: 44,
        tx: 22,
      }),
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 5);
      c.globalAlpha = 0.5;
      for (let x = px + 12; x < px + pw - 12; x += 14)
        c.fillRect(x, py + 11, 8, 2);
      c.globalAlpha = 1;
    },
  },
  police: {
    frame(c, X) {
      const { W, H } = X;
      c.lineWidth = 2;
      c.strokeRect(14, 14, W - 28, H - 28);
      [[14], [H - 30]].forEach(([y]) => {
        c.save();
        c.beginPath();
        c.rect(14, y, W - 28, 16);
        c.clip();
        c.fillStyle = "#FFD60A";
        c.fillRect(14, y, W - 28, 16);
        c.fillStyle = "#111";
        for (let x = -20; x < W; x += 40) {
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + 20, y);
          c.lineTo(x + 4, y + 16);
          c.lineTo(x - 16, y + 16);
          c.closePath();
          c.fill();
        }
        c.restore();
      });
    },
    art(c, X) {
      gray(c, X, 0.9);
      tint(c, X, "#000", 0.12);
      c.fillStyle = "rgba(255,255,255,.55)";
      c.font = '400 14px "Share Tech Mono",monospace';
      for (let y = X.ay + 110, i = 0; y < X.ay + 560; y += 22, i++) {
        c.fillRect(X.ax, y, i % 5 === 0 ? 34 : 16, 2);
        if (i % 5 === 0) c.fillText(String(210 - i * 2), X.ax + 40, y + 5);
      }
    },
    title(c, X, title) {
      setLS(c, 3);
      fitFont(c, title, X.fT, fw(X.fT, 700), 28, 15, 520);
      const w = c.measureText(title).width + 34;
      c.save();
      c.translate(52, 52);
      c.rotate(-0.025);
      c.fillStyle = "rgba(0,0,0,.5)";
      c.fillRect(0, 0, w, 46);
      c.strokeStyle = X.acc;
      c.lineWidth = 4;
      c.strokeRect(0, 0, w, 46);
      c.fillStyle = X.acc;
      c.fillText(title, 17, mid(c, 23));
      c.restore();
    },
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, 8, ph);
      for (let x = px + 14; x < px + pw; x += 16) c.fillRect(x, py, 10, 3);
    },
  },
  social: {
    shape: SHP.round,
    frame(c, X) {
      const { W, H, acc } = X;
      c.save();
      c.strokeStyle = "rgba(255,255,255,.3)";
      c.lineWidth = 2;
      c.beginPath();
      c.roundRect(16, 16, W - 32, H - 32, 40);
      c.stroke();
      c.restore();
      const w = (W - 96 - 24) / 4;
      for (let i = 0; i < 4; i++) {
        c.fillStyle = i < 2 ? acc : "rgba(255,255,255,.3)";
        c.beginPath();
        c.roundRect(48 + i * (w + 8), 22, w, 5, 2.5);
        c.fill();
      }
    },
    art(c, X) {
      gray(c, X, 0.1);
      const g = c.createLinearGradient(0, X.ay, 0, X.ay + 200);
      g.addColorStop(0, "rgba(0,0,0,.4)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(X.ax, X.ay, X.aw, 200);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 24,
        ls: 1,
        fill: "rgba(10,12,18,.84)",
        r: 24,
        col: "#fff",
        pad: 112,
        tx: 64,
        deco: (c, x, y, w, h) => {
          c.fillStyle = X.acc;
          dot(c, x + 32, y + h / 2, 14);
          c.strokeStyle = "#fff";
          c.lineWidth = 2;
          c.beginPath();
          c.arc(x + 32, y + h / 2, 9, 0, 7);
          c.stroke();
          dot(c, x + w - 28, y + h / 2, 10);
          c.strokeStyle = "#fff";
          c.lineWidth = 2.5;
          c.beginPath();
          c.moveTo(x + w - 33, y + h / 2);
          c.lineTo(x + w - 29, y + h / 2 + 4);
          c.lineTo(x + w - 22, y + h / 2 - 4);
          c.stroke();
        },
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc, S } = X;
      c.strokeStyle = "rgba(255,255,255,.24)";
      c.lineWidth = 3;
      shape(c, X.T, px, py, pw, ph, S.pr);
      c.stroke();
      c.save();
      c.translate(px + pw - 46, py + 34);
      c.fillStyle = acc;
      c.beginPath();
      c.moveTo(0, 8);
      c.bezierCurveTo(-20, -8, -10, -24, 0, -11);
      c.bezierCurveTo(10, -24, 20, -8, 0, 8);
      c.fill();
      c.restore();
    },
  },
  // ===== CONTEMPORAIN (+3 : lot 3) =====
  medical: {
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 4;
      c.beginPath();
      c.roundRect(16, 16, W - 32, H - 32, 28);
      c.stroke();
      c.globalAlpha = 0.35;
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect(27, 27, W - 54, H - 54, 20);
      c.stroke();
      c.globalAlpha = 1;
      c.fillStyle = acc;
      [W / 2 - 80, W / 2, W / 2 + 80].forEach((x) => {
        c.fillRect(x - 8, H - 21, 16, 4);
        c.fillRect(x - 2, H - 27, 4, 16);
      });
    },
    art(c, X) {
      tint(c, X, "#d8ffff", 0.06);
      vignette(c, X, 0.38);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 24,
        fill: "rgba(8,32,34,.92)",
        stroke: X.acc,
        lw: 2.5,
        r: 14,
        col: "#EAFFFD",
        pad: 100,
        tx: 62,
        h: 46,
        y: 50,
        deco: (c, x, y, w, h) => {
          c.fillStyle = X.acc;
          c.fillRect(x + 18, y + h / 2 - 3, 20, 6);
          c.fillRect(x + 25, y + h / 2 - 10, 6, 20);
        },
      }),
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 6);
      c.strokeStyle = acc;
      c.globalAlpha = 0.5;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(px + pw - 220, py + 22);
      [
        [30, 0],
        [40, -8],
        [52, 12],
        [64, -14],
        [76, 8],
        [90, 0],
        [220, 0],
      ].forEach(([dx, dy]) => c.lineTo(px + pw - 220 + dx, py + 22 + dy));
      c.stroke();
      c.globalAlpha = 1;
    },
  },
  startup: {
    frame(c, X) {
      const { W, H, acc, alt } = X;
      const g = c.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, acc);
      g.addColorStop(1, alt);
      c.strokeStyle = g;
      c.lineWidth = 6;
      c.beginPath();
      c.roundRect(16, 16, W - 32, H - 32, 34);
      c.stroke();
      c.lineWidth = 1.5;
      c.globalAlpha = 0.5;
      c.beginPath();
      c.roundRect(28, 28, W - 56, H - 56, 24);
      c.stroke();
      c.globalAlpha = 1;
    },
    art(c, X) {
      tint(c, X, "#7c5cff", 0.1);
      c.save();
      c.fillStyle = "#fff";
      c.globalAlpha = 0.18;
      for (let i = 0; i < 5; i++)
        for (let j = 0; j < 5; j++)
          dot(c, X.ax + X.aw - 100 + i * 16, X.ay + 24 + j * 16, 2);
      c.restore();
      vignette(c, X, 0.42);
    },
    title: (c, X, t) => {
      const g = c.createLinearGradient(48, 0, 600, 0);
      g.addColorStop(0, X.acc);
      g.addColorStop(1, X.alt);
      label(c, X, t, {
        sz: 24,
        fill: g,
        r: 24,
        col: "#fff",
        ls: 1,
        pad: 76,
        tx: 38,
        h: 46,
        y: 50,
      });
    },
    panel(c, X) {
      const { px, py, pw, acc, alt } = X;
      const g = c.createLinearGradient(px, 0, px + pw, 0);
      g.addColorStop(0, acc);
      g.addColorStop(1, alt);
      c.fillStyle = g;
      c.fillRect(px, py, pw, 5);
    },
  },
  stade: {
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 10;
      c.strokeRect(20, 20, W - 40, H - 40);
      c.strokeStyle = "#fff";
      c.lineWidth = 2;
      c.globalAlpha = 0.7;
      c.strokeRect(31, 31, W - 62, H - 62);
      c.globalAlpha = 1;
      c.fillStyle = acc;
      for (let x = 60; x < W - 60; x += 56) {
        c.beginPath();
        c.moveTo(x, H - 14);
        c.lineTo(x + 18, H - 14);
        c.lineTo(x + 28, H - 26);
        c.lineTo(x + 10, H - 26);
        c.closePath();
        c.fill();
      }
    },
    art(c, X) {
      tint(c, X, "#ffb300", 0.08);
      c.save();
      c.strokeStyle = "rgba(255,255,255,.07)";
      c.lineWidth = 14;
      for (let i = -X.ah; i < X.aw; i += 60) {
        c.beginPath();
        c.moveTo(X.ax + i, X.ay + X.ah);
        c.lineTo(X.ax + i + X.ah, X.ay);
        c.stroke();
      }
      c.restore();
      vignette(c, X, 0.5);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 34,
        min: 18,
        fill: X.acc,
        col: "#111",
        ls: 2,
        pad: 76,
        tx: 40,
        h: 50,
        y: 48,
        path: para(18),
      }),
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 6);
      c.globalAlpha = 0.5;
      for (let x = px + 10; x < px + pw; x += 34) {
        c.beginPath();
        c.moveTo(x, py + 6);
        c.lineTo(x + 12, py + 6);
        c.lineTo(x + 20, py + 16);
        c.lineTo(x + 8, py + 16);
        c.closePath();
        c.fill();
      }
      c.globalAlpha = 1;
    },
  },
};
