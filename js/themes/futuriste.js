/** Thèmes : Futuriste. */
import { fw } from "../core/config.js";
import { fitFont, mid, setLS, shape } from "../core/utils.js";
import {
  SHP,
  corners,
  dot,
  gray,
  hexPath,
  label,
  lens,
  noGlow,
  quarter,
  rng,
  tint,
} from "./helpers.js";

export const futuriste = {
  orbital: {
    shape: (c, x, y, w, h, r) => c.roundRect(x, y, w, h, [4, r, 4, r]),
    frame(c, X) {
      const { W, H, acc } = X;
      c.save();
      c.shadowColor = acc;
      c.shadowBlur = 12;
      c.lineWidth = 3;
      c.beginPath();
      c.roundRect(14, 14, W - 28, H - 28, [6, 44, 6, 44]);
      c.stroke();
      c.lineWidth = 2;
      c.globalAlpha = 0.6;
      c.setLineDash([44, 12]);
      c.beginPath();
      c.roundRect(26, 26, W - 52, H - 52, [4, 34, 4, 34]);
      c.stroke();
      c.setLineDash([]);
      c.globalAlpha = 1;
      c.fillStyle = acc;
      [-18, 0, 18].forEach((o) => {
        c.beginPath();
        c.arc(W / 2 + o, H - 14, 3.5, 0, 7);
        c.fill();
      });
      c.restore();
    },
    art(c, X) {
      tint(c, X, X.acc, 0.12);
      const r = rng(5);
      c.fillStyle = "#fff";
      for (let i = 0; i < 70; i++) {
        c.globalAlpha = 0.2 + r() * 0.7;
        const s = r() * 2 + 0.6;
        c.fillRect(X.ax + r() * X.aw, X.ay + 100 + r() * 460, s, s);
      }
      c.globalAlpha = 1;
      c.save();
      c.strokeStyle = X.acc;
      c.lineWidth = 2;
      c.globalAlpha = 0.55;
      const cx = X.ax + X.aw - 90,
        cy = X.ay + 190;
      c.beginPath();
      c.arc(cx, cy, 44, 0, 7);
      c.stroke();
      c.setLineDash([8, 8]);
      c.beginPath();
      c.arc(cx, cy, 64, 0, 7);
      c.stroke();
      c.setLineDash([]);
      c.beginPath();
      c.arc(cx + 44, cy, 5, 0, 7);
      c.fillStyle = X.acc;
      c.fill();
      c.restore();
    },
    title(c, X, title) {
      const { acc } = X;
      setLS(c, 5);
      fitFont(c, title, X.fT, fw(X.fT, 700), 24, 14, 480);
      const w = Math.min(654, c.measureText(title).width + 92);
      c.save();
      c.fillStyle = "rgba(4,8,26,.8)";
      c.beginPath();
      c.roundRect(48, 48, w, 48, [24, 6, 24, 6]);
      c.fill();
      c.shadowColor = acc;
      c.shadowBlur = 10;
      c.strokeStyle = acc;
      c.lineWidth = 2;
      c.stroke();
      noGlow(c);
      c.fillStyle = acc;
      [0, 1, 2].forEach((i) => {
        c.globalAlpha = 0.4 + i * 0.3;
        c.fillRect(68 + i * 10, 62, 6, 20);
      });
      c.globalAlpha = 1;
      c.fillText(title, 108, mid(c, 72));
      c.restore();
    },
    nameFx(c, X, name, tx, ny) {
      c.save();
      c.shadowColor = X.acc;
      c.shadowBlur = 10;
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
      c.lineWidth = 4;
      shape(c, X.T, px, py, pw, ph, S.pr);
      c.stroke();
      c.restore();
      c.fillStyle = acc;
      c.globalAlpha = 0.6;
      for (let x = px + 26; x < px + pw - 60; x += 32)
        c.fillRect(x, py + ph - 8, 22, 3);
      c.globalAlpha = 1;
    },
  },
  mecha: {
    shape: (c, x, y, w, h, r) => {
      c.moveTo(x + r, y);
      c.lineTo(x + w - 2 * r, y);
      c.lineTo(x + w - r, y + r * 0.5);
      c.lineTo(x + w, y + r * 0.5);
      c.lineTo(x + w, y + h - r);
      c.lineTo(x + w - r, y + h);
      c.lineTo(x + 2 * r, y + h);
      c.lineTo(x + r, y + h - r * 0.5);
      c.lineTo(x, y + h - r * 0.5);
      c.lineTo(x, y + r);
      c.closePath();
    },
    frame(c, X) {
      const { W, H, acc, T } = X;
      c.lineWidth = 6;
      shape(c, T, 14, 14, W - 28, H - 28, 40);
      c.stroke();
      c.lineWidth = 2;
      c.globalAlpha = 0.5;
      shape(c, T, 28, 28, W - 56, H - 56, 30);
      c.stroke();
      c.globalAlpha = 1;
      c.fillStyle = acc;
      corners(W, H, 44).forEach(([x, y]) => {
        c.beginPath();
        c.arc(x, y, 5, 0, 7);
        c.fill();
      });
      c.fillRect(8, H / 2 - 70, 10, 140);
      c.fillRect(W - 18, H / 2 - 70, 10, 140);
    },
    art(c, X) {
      tint(c, X, X.acc, 0.06);
      c.fillStyle = X.acc;
      c.globalAlpha = 0.6;
      for (let y = X.ay + 110, i = 0; y < X.ay + 500; y += 18, i++)
        c.fillRect(X.ax, y, i % 2 ? 8 : 16, 2);
      c.globalAlpha = 0.9;
      c.font = '400 16px "Share Tech Mono",monospace';
      c.fillText("LINK 98%  //  MK-II", X.ax + 26, X.ay + 118);
      c.globalAlpha = 1;
    },
    title(c, X, title) {
      const { acc } = X;
      setLS(c, 2);
      fitFont(c, title, X.fT, fw(X.fT, 700), 28, 16, 500);
      const w = Math.min(654, c.measureText(title).width + 118);
      c.fillStyle = acc;
      c.beginPath();
      c.moveTo(48, 96);
      c.lineTo(48, 60);
      c.lineTo(60, 48);
      c.lineTo(48 + w - 30, 48);
      c.lineTo(48 + w, 96);
      c.closePath();
      c.fill();
      c.fillStyle = "rgba(0,0,0,.35)";
      [0, 1, 2].forEach((i) => {
        const x0 = 48 + w - 76 + i * 14;
        c.beginPath();
        c.moveTo(x0, 52);
        c.lineTo(x0 + 6, 52);
        c.lineTo(x0 + 24, 94);
        c.lineTo(x0 + 18, 94);
        c.closePath();
        c.fill();
      });
      c.fillStyle = "#0b0805";
      c.fillText(title, 76, mid(c, 72));
    },
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.fillStyle = acc;
      c.fillRect(px, py, 14, ph);
      c.fillRect(px + 14, py, pw - 14, 4);
      c.globalAlpha = 0.8;
      for (let x = px + 40; x < px + pw - 50; x += 22)
        c.fillRect(x, py + ph - 8, 12, 8);
      c.globalAlpha = 1;
    },
  },
  biotech: {
    shape: SHP.cham,
    frame(c, X) {
      const { W, H, T } = X;
      c.lineWidth = 4;
      shape(c, T, 14, 14, W - 28, H - 28, 56);
      c.stroke();
      c.lineWidth = 1.5;
      c.globalAlpha = 0.7;
      for (let x = 110; x < W - 100; x += 22) {
        c.beginPath();
        hexPath(c, x, 25, 8);
        c.stroke();
        c.beginPath();
        hexPath(c, x, H - 25, 8);
        c.stroke();
      }
      c.globalAlpha = 1;
    },
    art(c, X) {
      tint(c, X, X.acc, 0.1);
      c.save();
      c.strokeStyle = X.acc;
      c.globalAlpha = 0.1;
      c.lineWidth = 1.2;
      c.beginPath();
      const R = 22,
        dx = R * 1.5,
        dy = R * Math.sqrt(3);
      for (let col = 0; X.ax + col * dx < X.ax + X.aw + R; col++)
        for (
          let y = X.ay + (col % 2 ? dy / 2 : 0);
          y < X.ay + X.ah + R;
          y += dy
        )
          hexPath(c, X.ax + col * dx, y, R);
      c.stroke();
      const r = rng(23);
      c.fillStyle = X.acc;
      c.globalAlpha = 0.13;
      for (let i = 0; i < 9; i++) {
        c.beginPath();
        hexPath(c, X.ax + r() * X.aw, X.ay + 80 + r() * 500, R);
        c.fill();
      }
      c.restore();
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 24,
        fill: "rgba(2,22,16,.86)",
        stroke: X.acc,
        lw: 2,
        col: X.acc,
        path: lens(18),
        pad: 100,
        tx: 56,
        deco: (c, x, y, w, h) => {
          c.strokeStyle = X.acc;
          c.lineWidth = 2;
          c.beginPath();
          hexPath(c, x + 36, y + h / 2, 9);
          c.stroke();
        },
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.strokeStyle = acc;
      c.lineWidth = 4;
      shape(c, X.T, px, py, pw, ph, X.S.pr);
      c.stroke();
      c.fillStyle = acc;
      c.globalAlpha = 0.55;
      for (let x = px + 34; x < px + pw - 40; x += 26) {
        c.beginPath();
        hexPath(c, x, py + 14, 6);
        c.fill();
      }
      c.globalAlpha = 1;
    },
  },
  quantique: {
    shape: SHP.round,
    frame(c, X) {
      const { W, H } = X;
      c.lineWidth = 2;
      c.beginPath();
      c.roundRect(14, 14, W - 28, H - 28, 26);
      c.stroke();
      c.globalAlpha = 0.85;
      c.lineWidth = 2;
      corners(W, H, 14).forEach(([x, y, sx, sy]) =>
        [26, 42, 58].forEach((r) => quarter(c, x, y, sx, sy, r)),
      );
      c.globalAlpha = 1;
    },
    art(c, X) {
      tint(c, X, X.acc, 0.06);
      const r = rng(29),
        N = [];
      for (let i = 0; i < 28; i++)
        N.push([X.ax + 20 + r() * (X.aw - 40), X.ay + 110 + r() * 460]);
      c.save();
      c.strokeStyle = X.acc;
      c.lineWidth = 1.3;
      N.forEach((a, i) =>
        N.slice(i + 1).forEach((b) => {
          const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
          if (d < 150) {
            c.globalAlpha = 0.4 * (1 - d / 150);
            c.beginPath();
            c.moveTo(a[0], a[1]);
            c.lineTo(b[0], b[1]);
            c.stroke();
          }
        }),
      );
      c.shadowColor = X.acc;
      c.shadowBlur = 10;
      c.fillStyle = "#fff";
      c.globalAlpha = 0.85;
      N.forEach(([x, y], i) => dot(c, x, y, 1.8 + (i % 3)));
      c.restore();
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 24,
        ls: 5,
        fill: "rgba(10,4,24,.82)",
        stroke: X.acc,
        r: 24,
        col: X.acc,
        pad: 98,
        tx: 58,
        deco: (c, x, y, w, h) => {
          c.strokeStyle = X.acc;
          c.lineWidth = 1.8;
          [0, 1.05, -1.05].forEach((a) => {
            c.beginPath();
            c.ellipse(x + 32, y + h / 2, 13, 5, a, 0, 7);
            c.stroke();
          });
          c.fillStyle = X.acc;
          dot(c, x + 32, y + h / 2, 3);
        },
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc, S } = X;
      c.strokeStyle = acc;
      c.lineWidth = 3;
      shape(c, X.T, px, py, pw, ph, S.pr);
      c.stroke();
      c.globalAlpha = 0.55;
      c.lineWidth = 1.5;
      [10, 17].forEach((r) => {
        c.beginPath();
        c.arc(px + pw - 36, py + 34, r, 0, 7);
        c.stroke();
      });
      c.fillStyle = acc;
      dot(c, px + pw - 36 + 17, py + 34, 3);
      c.globalAlpha = 1;
    },
  },
  sentinelle: {
    shape: SHP.cham,
    frame(c, X) {
      const { W, H, acc, T } = X;
      c.lineWidth = 4;
      shape(c, T, 14, 14, W - 28, H - 28, 34);
      c.stroke();
      c.lineWidth = 3;
      c.globalAlpha = 0.6;
      c.setLineDash([18, 10]);
      shape(c, T, 26, 26, W - 52, H - 52, 26);
      c.stroke();
      c.setLineDash([]);
      c.globalAlpha = 1;
      c.fillStyle = acc;
      [
        [W / 2, 14],
        [W / 2, H - 14],
      ].forEach(([x, y], i) => {
        c.beginPath();
        c.moveTo(x - 15, y + (i ? 8 : 18));
        c.lineTo(x + 15, y + (i ? 8 : 18));
        c.lineTo(x, y + (i ? -12 : -2));
        c.closePath();
        c.fill();
      });
    },
    art(c, X) {
      gray(c, X, 0.4);
      tint(c, X, X.acc, 0.1);
      const cx = X.W / 2,
        cy = X.ay + X.ah * 0.42;
      c.save();
      c.strokeStyle = X.acc;
      c.lineWidth = 2;
      c.globalAlpha = 0.3;
      c.setLineDash([10, 10]);
      [110, 210, 310].forEach((r) => {
        c.beginPath();
        c.arc(cx, cy, r, 0, 7);
        c.stroke();
      });
      c.setLineDash([]);
      c.beginPath();
      c.moveTo(X.ax, cy);
      c.lineTo(X.ax + X.aw, cy);
      c.moveTo(cx, X.ay + 110);
      c.lineTo(cx, X.ay + X.ah);
      c.stroke();
      c.fillStyle = X.acc;
      c.globalAlpha = 0.18;
      c.beginPath();
      c.moveTo(cx, cy);
      c.arc(cx, cy, 330, -1.25, -0.75);
      c.closePath();
      c.fill();
      c.globalAlpha = 0.9;
      c.lineWidth = 3;
      corners(X.W, X.H, 0).forEach(([, , sx, sy]) => {
        const x = cx + sx * -85,
          y = cy + sy * -85;
        c.beginPath();
        c.moveTo(x + sx * 34, y);
        c.lineTo(x, y);
        c.lineTo(x, y + sy * 34);
        c.stroke();
      });
      c.font = '400 16px "Share Tech Mono",monospace';
      c.fillStyle = X.acc;
      c.fillText("SCAN 100%  //  CIBLE VERROUILLÉE", X.ax + 26, X.ay + 120);
      c.restore();
    },
    title: (c, X, t) =>
      label(c, X, t, {
        sz: 28,
        fill: X.acc,
        col: "#120302",
        path: (c, x, y, w, h) => {
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + w - 16, y);
          c.lineTo(x + w, y + 16);
          c.lineTo(x + w, y + h);
          c.lineTo(x, y + h);
          c.closePath();
        },
        pad: 84,
        tx: 56,
        deco: (c, x, y, w, h) => {
          c.fillStyle = "#120302";
          c.beginPath();
          c.moveTo(x + 12, y + h - 10);
          c.lineTo(x + 38, y + h - 10);
          c.lineTo(x + 25, y + 9);
          c.closePath();
          c.fill();
          c.fillStyle = X.acc;
          c.fillRect(x + 23.5, y + 18, 3, 10);
          c.fillRect(x + 23.5, y + 32, 3, 3);
        },
      }),
    panel(c, X) {
      const { px, py, pw, ph, acc } = X;
      c.strokeStyle = acc;
      c.lineWidth = 4;
      shape(c, X.T, px, py, pw, ph, X.S.pr);
      c.stroke();
      c.fillStyle = acc;
      for (let x = px + 20; x < px + pw - 20; x += 18) c.fillRect(x, py, 12, 5);
    },
  },
};
