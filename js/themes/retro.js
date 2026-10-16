/** Thèmes : Rétro. */
import { fw } from "../core/config.js";
import { fitFont, mid, setLS, shape } from "../core/utils.js";
import {
  corners,
  dot,
  grain,
  gray,
  label,
  para,
  rng,
  SHP,
  star4,
  star5,
  tint,
  vignette,
} from "./helpers.js";

export const retro = {
  arcade: {
    shape: (c, x, y, w, h, r) => {
      c.moveTo(x + 2 * r, y);
      c.lineTo(x + w - 2 * r, y);
      c.lineTo(x + w - 2 * r, y + r);
      c.lineTo(x + w - r, y + r);
      c.lineTo(x + w - r, y + 2 * r);
      c.lineTo(x + w, y + 2 * r);
      c.lineTo(x + w, y + h - 2 * r);
      c.lineTo(x + w - r, y + h - 2 * r);
      c.lineTo(x + w - r, y + h - r);
      c.lineTo(x + w - 2 * r, y + h - r);
      c.lineTo(x + w - 2 * r, y + h);
      c.lineTo(x + 2 * r, y + h);
      c.lineTo(x + 2 * r, y + h - r);
      c.lineTo(x + r, y + h - r);
      c.lineTo(x + r, y + h - 2 * r);
      c.lineTo(x, y + h - 2 * r);
      c.lineTo(x, y + 2 * r);
      c.lineTo(x + r, y + 2 * r);
      c.lineTo(x + r, y + r);
      c.lineTo(x + 2 * r, y + r);
      c.closePath();
    },
    frame(c, X) {
      const { W, H, acc, T } = X;
      c.lineWidth = 8;
      c.lineJoin = "miter";
      shape(c, T, 16, 16, W - 32, H - 32, 12);
      c.stroke();
      c.lineWidth = 4;
      c.globalAlpha = 0.5;
      shape(c, T, 30, 30, W - 60, H - 60, 8);
      c.stroke();
      c.globalAlpha = 1;
      c.fillStyle = acc;
      for (let x = 70; x < W - 60; x += 24) {
        c.fillRect(x, 21, 6, 6);
        c.fillRect(x, H - 27, 6, 6);
      }
    },
    art(c, X) {
      const { ax, ay, aw, ah, k } = X,
        ps = 6,
        w2 = Math.ceil(aw / ps),
        h2 = Math.ceil(ah / ps),
        o = document.createElement("canvas");
      o.width = w2;
      o.height = h2;
      o.getContext("2d").drawImage(
        c.canvas,
        ax * k,
        ay * k,
        aw * k,
        ah * k,
        0,
        0,
        w2,
        h2,
      );
      c.imageSmoothingEnabled = false;
      c.drawImage(o, 0, 0, w2, h2, ax, ay, w2 * ps, h2 * ps);
      c.imageSmoothingEnabled = true;
      tint(c, X, X.acc, 0.06);
      c.fillStyle = "rgba(0,0,0,.22)";
      for (let y = ay; y < ay + ah; y += 4) c.fillRect(ax, y, aw, 2);
    },
    title(c, X, title) {
      const { acc } = X;
      setLS(c, 1);
      fitFont(c, title, X.fT, fw(X.fT, 700), 22, 10, 540);
      const w = Math.min(654, c.measureText(title).width + 56);
      c.fillStyle = acc;
      shape(c, X.T, 48, 48, w, 48, 8);
      c.fill();
      c.fillStyle = "#05060f";
      c.fillText(title, 76, mid(c, 72));
      c.fillRect(48 + w - 22, 66, 8, 8);
    },
    nameFx(c, X, name, tx, ny) {
      c.fillStyle = X.acc;
      c.fillText(name, tx + 3, ny + 3);
    },
    panel(c, X) {
      const { px, py, pw, ph, acc, S } = X;
      c.strokeStyle = acc;
      c.lineWidth = 8;
      shape(c, X.T, px, py, pw, ph, S.pr);
      c.stroke();
    },
  },
  seventies: {
    shape: (c, x, y, w, h, r) => c.roundRect(x, y, w, h, r),
    frame(c, X) {
      const { W, H } = X;
      [
        [18, 8, 40, null],
        [27, 5, 33, "#E6B325"],
        [34, 4, 28, "#8C3B1E"],
      ].forEach(([m, lw, r, col]) => {
        if (col) c.strokeStyle = col;
        c.lineWidth = lw;
        c.beginPath();
        c.roundRect(m, m, W - 2 * m, H - 2 * m, r);
        c.stroke();
      });
    },
    art(c, X) {
      gray(c, X, 0.4);
      tint(c, X, X.acc, 0.2);
      vignette(c, X, 0.5);
      const r = rng(3);
      for (let i = 0; i < 700; i++) {
        c.fillStyle = r() > 0.5 ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.18)";
        c.fillRect(X.ax + r() * X.aw, X.ay + r() * X.ah, 2, 2);
      }
    },
    title(c, X, title) {
      const { acc } = X;
      setLS(c, 2);
      fitFont(c, title, X.fT, fw(X.fT, 700), 30, 16, 540);
      const w = Math.min(654, c.measureText(title).width + 68);
      c.fillStyle = acc;
      c.beginPath();
      c.roundRect(48, 46, w, 50, 25);
      c.fill();
      c.fillStyle = "#2b1608";
      c.fillText(title, 82, mid(c, 71));
      c.fillStyle = "#E6B325";
      c.fillRect(73, 101, w - 50, 4);
      c.fillStyle = "#8C3B1E";
      c.fillRect(73, 108, w - 50, 3);
    },
    nameFx(c, X, name, tx, ny) {
      c.fillStyle = "#8C3B1E";
      c.fillText(name, tx + 3, ny + 3);
    },
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 6);
      c.fillStyle = "#E6B325";
      c.fillRect(px, py + 8, pw, 4);
      c.fillStyle = "#8C3B1E";
      c.fillRect(px, py + 14, pw, 3);
    },
  },
  western: {
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 6;
      c.strokeRect(14, 14, W - 28, H - 28);
      c.lineWidth = 2;
      c.strokeRect(27, 27, W - 54, H - 54);
      c.fillStyle = acc;
      corners(W, H, 20).forEach(([x, y]) => star5(c, x, y, 19));
      [
        [W / 2, 14],
        [W / 2, H - 14],
        [14, H / 2],
        [W - 14, H / 2],
      ].forEach(([x, y]) => star5(c, x, y, 11));
    },
    art(c, X) {
      gray(c, X, 0.75);
      tint(c, X, X.acc, 0.3);
      vignette(c, X, 0.7);
      grain(c, X, 31, 900, 0.18);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 34,
        fill: X.acc,
        stroke: "#2b1808",
        lw: 2,
        col: "#2b1808",
        r: 2,
        pad: 116,
        tx: 58,
        deco: (c, x, y, w, h) => {
          c.fillStyle = "#2b1808";
          star5(c, x + 28, y + h / 2, 12);
          star5(c, x + w - 28, y + h / 2, 12);
        },
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 5);
      c.fillRect(px, py + 8, pw, 2);
      c.save();
      c.strokeStyle = acc;
      c.globalAlpha = 0.5;
      c.lineWidth = 2;
      c.setLineDash([6, 6]);
      c.strokeRect(px + 8, py + 16, pw - 16, ph - 24);
      c.restore();
    },
  },
  diner: {
    shape: SHP.round,
    frame(c, X) {
      const { W, H } = X;
      c.strokeStyle = "#dfe5ea";
      c.lineWidth = 6;
      c.beginPath();
      c.roundRect(17, 17, W - 34, H - 34, 44);
      c.stroke();
      for (let i = 0, x = 74; x < W - 80; x += 12, i++) {
        c.fillStyle = i % 2 ? "#111" : "#f4f4f4";
        c.fillRect(x, 22, 12, 12);
        c.fillRect(x, H - 34, 12, 12);
      }
    },
    art(c, X) {
      tint(c, X, "#ffd6a5", 0.08);
      tint(c, X, X.acc, 0.06);
      vignette(c, X, 0.3);
      c.fillStyle = "rgba(255,255,255,.07)";
      c.beginPath();
      c.moveTo(X.ax + 200, X.ay);
      c.lineTo(X.ax + 330, X.ay);
      c.lineTo(X.ax + 130, X.ay + 560);
      c.lineTo(X.ax, X.ay + 560);
      c.lineTo(X.ax, X.ay + 440);
      c.closePath();
      c.fill();
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 34,
        ls: 1,
        fill: "#E63946",
        stroke: "#dfe5ea",
        lw: 3,
        r: 25,
        col: "#fff",
        pad: 96,
        tx: 58,
        deco: (c, x, y, w, h) => {
          c.fillStyle = "#fff";
          star5(c, x + 30, y + h / 2, 11);
          star5(c, x + w - 28, y + h / 2, 9);
        },
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc, S } = X;
      c.strokeStyle = "#dfe5ea";
      c.lineWidth = 4;
      shape(c, X.T, px, py, pw, ph, S.pr);
      c.stroke();
      c.fillStyle = "#E63946";
      c.fillRect(px, py, pw, 6);
      c.fillStyle = acc;
      c.fillRect(px, py + 6, pw, 3);
    },
  },
  vhs: {
    frame(c, X) {
      const { W, H } = X;
      c.save();
      c.strokeStyle = "#fff";
      c.globalAlpha = 0.45;
      c.lineWidth = 2;
      c.strokeRect(14, 14, W - 28, H - 28);
      c.globalAlpha = 1;
      c.lineWidth = 5;
      corners(W, H, 14).forEach(([x, y, sx, sy]) => {
        c.beginPath();
        c.moveTo(x + sx * 48, y);
        c.lineTo(x, y);
        c.lineTo(x, y + sy * 48);
        c.stroke();
      });
      c.restore();
    },
    art(c, X) {
      const { ax, ay, aw, ah, k } = X,
        r = rng(9);
      tint(c, X, "#0a3cff", 0.06);
      for (let i = 0; i < 9; i++) {
        const y = ay + 80 + r() * 520,
          h = 3 + r() * 9,
          off = (r() - 0.5) * 40;
        c.drawImage(c.canvas, ax * k, y * k, aw * k, h * k, ax + off, y, aw, h);
        c.fillStyle = "rgba(255,255,255,.1)";
        c.fillRect(ax, y, aw, h);
      }
      const by = ay + 440;
      c.drawImage(
        c.canvas,
        ax * k,
        by * k,
        aw * k,
        26 * k,
        ax + 34,
        by,
        aw,
        26,
      );
      c.fillStyle = "rgba(0,0,0,.3)";
      c.fillRect(ax, by, aw, 26);
      c.fillStyle = "rgba(255,255,255,.45)";
      for (let i = 0; i < 140; i++)
        c.fillRect(ax + r() * aw, by + r() * 26, 2 + r() * 8, 1.5);
      c.fillStyle = "rgba(0,0,0,.2)";
      for (let y = ay; y < ay + ah; y += 3) c.fillRect(ax, y, aw, 1);
      c.font = '400 22px "Share Tech Mono",monospace';
      c.fillStyle = "#fff";
      c.fillText("SP  0:42:17", ax + 26, ay + 124);
      c.fillText("REC", ax + aw - 80, ay + 124);
      c.fillStyle = "#ff2a2a";
      dot(c, ax + aw - 98, ay + 117, 8);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 30,
        ls: 2,
        fill: "rgba(0,0,0,.78)",
        col: "#fff",
        pad: 96,
        tx: 62,
        deco: (c, x, y, w, h) => {
          c.fillStyle = X.acc;
          c.beginPath();
          c.moveTo(x + 22, y + 13);
          c.lineTo(x + 22, y + h - 13);
          c.lineTo(x + 44, y + h / 2);
          c.closePath();
          c.fill();
        },
      }),
    nameFx(c, X, name, tx, ny) {
      c.fillStyle = "rgba(255,0,60,.85)";
      c.fillText(name, tx - 2.5, ny);
      c.fillStyle = "rgba(0,220,255,.85)";
      c.fillText(name, tx + 2.5, ny);
    },
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 3);
      c.globalAlpha = 0.4;
      for (let x = px; x < px + pw; x += 14) c.fillRect(x, py + 8, 8, 2);
      c.globalAlpha = 1;
    },
  },
  // ===== RÉTRO (+3 : lot 3) =====
  memphis: {
    frame(c, X) {
      const { W, H, acc, alt } = X;
      c.lineWidth = 8;
      c.beginPath();
      c.roundRect(22, 22, W - 44, H - 44, 26);
      c.stroke();
      const cols = [alt, "#FFE600", "#00F0FF", "#fff"],
        r = rng(5);
      for (let i = 0; i < 80; i++) {
        const side = i % 4,
          t = r(),
          x =
            side === 0
              ? 40 + t * (W - 80)
              : side === 1
                ? 40 + t * (W - 80)
                : side === 2
                  ? 14
                  : W - 14,
          y = side === 0 ? 14 : side === 1 ? H - 14 : 40 + t * (H - 80);
        c.fillStyle = cols[((i / 4) | 0) % cols.length];
        c.strokeStyle = cols[((i / 4) | 0) % cols.length];
        c.lineWidth = 3;
        const k = i % 3;
        if (k === 0) dot(c, x, y, 5);
        else if (k === 1) {
          c.beginPath();
          c.moveTo(x - 6, y + 5);
          c.lineTo(x, y - 6);
          c.lineTo(x + 6, y + 5);
          c.closePath();
          c.fill();
        } else {
          c.beginPath();
          c.moveTo(x - 8, y);
          c.quadraticCurveTo(x - 4, y - 7, x, y);
          c.quadraticCurveTo(x + 4, y + 7, x + 8, y);
          c.stroke();
        }
      }
    },
    art(c, X) {
      tint(c, X, "#ff5caa", 0.08);
      c.save();
      c.fillStyle = "#FFE600";
      c.globalAlpha = 0.5;
      c.beginPath();
      c.moveTo(X.ax + 14, X.ay + 14);
      c.lineTo(X.ax + 64, X.ay + 14);
      c.lineTo(X.ax + 14, X.ay + 64);
      c.closePath();
      c.fill();
      c.globalAlpha = 0.7;
      c.fillStyle = "#00F0FF";
      dot(c, X.ax + X.aw - 40, X.ay + X.ah - 280, 14);
      c.restore();
      vignette(c, X, 0.4);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 28,
        fill: "#FFE600",
        stroke: X.acc,
        lw: 4,
        r: 10,
        col: "#1a0a2e",
        ls: 2,
        pad: 76,
        tx: 38,
        h: 48,
        y: 50,
      }),
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.strokeStyle = acc;
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(px, py + 8);
      for (let x = px; x < px + pw; x += 24) {
        c.lineTo(x + 6, py + 2);
        c.lineTo(x + 18, py + 14);
        c.lineTo(x + 24, py + 8);
      }
      c.stroke();
    },
  },
  pulp: {
    shape: (c, x, y, w, h, r) => c.roundRect(x, y, w, h, Math.min(r, 6)),
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 6;
      c.strokeRect(20, 20, W - 40, H - 40);
      c.strokeStyle = "#f3e2b8";
      c.lineWidth = 1.5;
      c.strokeRect(30, 30, W - 60, H - 60);
      c.strokeStyle = acc;
      c.lineWidth = 3;
      corners(W, H, 14).forEach(([x, y, a, b]) => {
        c.beginPath();
        c.moveTo(x + a * 30, y);
        c.lineTo(x, y);
        c.lineTo(x, y + b * 30);
        c.stroke();
      });
    },
    art(c, X) {
      tint(c, X, "#d9a441", 0.2);
      c.save();
      c.fillStyle = "rgba(0,0,0,.18)";
      for (let y = X.ay + X.ah - 320; y < X.ay + X.ah; y += 12)
        for (let x = X.ax + ((y / 12) % 2) * 6; x < X.ax + X.aw; x += 12)
          dot(c, x, y, 1.6);
      c.restore();
      grain(c, X, 29, 800, 0.05);
      vignette(c, X, 0.5);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 30,
        min: 16,
        fill: X.acc,
        stroke: "#1a1208",
        lw: 3,
        col: "#1a1208",
        ls: 2,
        pad: 76,
        tx: 38,
        h: 52,
        y: 46,
      }),
    panel(c, X) {
      const { px, py, pw } = X;
      c.fillStyle = "#b3261e";
      c.fillRect(px, py, pw, 8);
      c.fillStyle = "#f3e2b8";
      for (let x = px + 20; x < px + pw; x += 44) dot(c, x, py + 4, 2);
    },
  },
  atomic: {
    frame(c, X) {
      const { W, H, acc } = X;
      c.lineWidth = 5;
      c.beginPath();
      c.roundRect(18, 18, W - 36, H - 36, 32);
      c.stroke();
      c.lineWidth = 1.5;
      c.globalAlpha = 0.5;
      c.beginPath();
      c.roundRect(29, 29, W - 58, H - 58, 24);
      c.stroke();
      c.globalAlpha = 1;
      c.fillStyle = "#FF6B4A";
      [...corners(W, H, 24), [W / 2, 18, 0, 0], [W / 2, H - 18, 0, 0]].forEach(
        ([x, y]) => star4(c, x, y, 13),
      );
      c.fillStyle = acc;
      [
        [W / 4, 18],
        [(3 * W) / 4, 18],
        [W / 4, H - 18],
        [(3 * W) / 4, H - 18],
      ].forEach(([x, y]) => dot(c, x, y, 4));
    },
    art(c, X) {
      tint(c, X, "#3dd6c0", 0.1);
      c.save();
      c.fillStyle = "#FF6B4A";
      c.globalAlpha = 0.5;
      [
        [60, 120, 14],
        [610, 250, 18],
        [90, 420, 10],
        [600, 560, 12],
      ].forEach(([dx, dy, r]) => star4(c, X.ax + dx, X.ay + dy, r));
      c.restore();
      vignette(c, X, 0.42);
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 28,
        fill: "#0b2b2b",
        stroke: X.acc,
        lw: 3,
        col: "#FFD9B8",
        ls: 1,
        pad: 84,
        tx: 44,
        h: 48,
        y: 50,
        path: para(16),
      }),
    panel(c, X) {
      const { px, py, pw, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, pw, 5);
      c.fillStyle = "#FF6B4A";
      [0, 1, 2].forEach((i) => dot(c, px + pw - 30 - i * 22, py + 18, 6));
    },
  },
};
