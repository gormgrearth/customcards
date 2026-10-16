/** Rendu de la carte (même disposition pour tous les thèmes). */
import { H, LEGACY, W, ff, fw } from "../core/config.js";
import { THEMES } from "../themes/meta.js";
import { pctx, state } from "../core/state.js";
import { fitFont, mid, setLS, shape, wrap } from "../core/utils.js";
import { EXTRA } from "../themes/index.js";

export function draw(c, d, img) {
  const T = THEMES[d.theme] ? d.theme : LEGACY[d.theme] || "standard",
    S = THEMES[T];
  const acc = d.color,
    op = Math.max(0.55, Math.min(1, d.opacity / 100)),
    fT = d.fontT,
    fB = d.fontB,
    k = c.canvas.width / W;
  const alt = acc.toLowerCase() === "#00f0ff" ? "#FF2D95" : "#00F0FF";
  const [ax, ay, aw, ah] = S.geo || [38, 38, 674, 974];
  if (c === pctx) {
    state.HIT = {};
    state.titleHit = null;
  }
  const px = ax + 10,
    pw = aw - 20,
    py = 752,
    ph = 240,
    tx = px + 22,
    mw = pw - 44,
    rx = px + pw - 26;
  const EX = EXTRA[T],
    X = {
      T,
      S,
      acc,
      alt,
      W,
      H,
      ax,
      ay,
      aw,
      ah,
      px,
      py,
      pw,
      ph,
      tx,
      mw,
      fT,
      fB,
      k,
      op,
      img,
    };
  c.save();
  c.setTransform(k, 0, 0, k, 0, 0);
  c.clearRect(0, 0, W, H);
  c.textAlign = "left";
  c.textBaseline = "alphabetic";
  setLS(c, 0);
  const bg = c.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, S.bg[0]);
  bg.addColorStop(1, S.bg[1]);
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);

  // cadre
  c.strokeStyle = acc;
  c.fillStyle = acc;
  if (T === "standard") {
    c.lineWidth = 4;
    c.beginPath();
    c.roundRect(14, 14, W - 28, H - 28, 30);
    c.stroke();
  } else if (T === "chrome") {
    c.lineWidth = 4;
    shape(c, T, 14, 14, W - 28, H - 28, 34);
    c.stroke();
    c.lineWidth = 2;
    c.globalAlpha = 0.6;
    shape(c, T, 26, 26, W - 52, H - 52, 26);
    c.stroke();
    c.globalAlpha = 1;
  } else if (T === "rue") {
    c.save();
    c.translate(W / 2, H / 2);
    c.rotate(-0.006);
    c.translate(-W / 2, -H / 2);
    c.lineWidth = 12;
    c.strokeRect(14, 14, W - 28, H - 28);
    c.restore();
    c.save();
    c.strokeStyle = "#fff";
    c.globalAlpha = 0.5;
    c.lineWidth = 2;
    c.strokeRect(24, 24, W - 48, H - 48);
    c.restore();
  } else if (T === "corpo") {
    c.lineWidth = 1.5;
    c.globalAlpha = 0.4;
    c.strokeRect(14, 14, W - 28, H - 28);
    c.globalAlpha = 1;
    c.lineWidth = 6;
    [
      [14, 14, 1, 1],
      [W - 14, 14, -1, 1],
      [14, H - 14, 1, -1],
      [W - 14, H - 14, -1, -1],
    ].forEach(([x, y, a, b]) => {
      c.beginPath();
      c.moveTo(x + a * 44, y);
      c.lineTo(x, y);
      c.lineTo(x, y + b * 44);
      c.stroke();
    });
  } else if (T === "glitch") {
    c.lineWidth = 3;
    c.save();
    c.globalCompositeOperation = "screen";
    c.strokeStyle = alt;
    c.strokeRect(10, 14, W - 28, H - 28);
    c.strokeStyle = acc;
    c.strokeRect(18, 14, W - 28, H - 28);
    c.restore();
  } else if (T === "terminal") {
    c.lineWidth = 3;
    c.strokeRect(12, 12, W - 24, H - 24);
    c.fillRect(12, 12, W - 24, 44);
  } else if (T === "noir") {
    c.lineWidth = 5;
    c.strokeRect(14, 14, W - 28, H - 28);
    c.lineWidth = 1.5;
    c.globalAlpha = 0.7;
    c.strokeRect(27, 27, W - 54, H - 54);
    c.globalAlpha = 1;
  } else if (T === "holo") {
    c.save();
    c.shadowColor = acc;
    c.shadowBlur = 14;
    c.lineWidth = 3;
    c.setLineDash([14, 8]);
    c.beginPath();
    c.roundRect(14, 14, W - 28, H - 28, 30);
    c.stroke();
    c.setLineDash([]);
    c.lineWidth = 7;
    [
      [14, 14, 1, 1],
      [W - 14, 14, -1, 1],
      [14, H - 14, 1, -1],
      [W - 14, H - 14, -1, -1],
    ].forEach(([x, y, a, b]) => {
      c.beginPath();
      c.moveTo(x + a * 56, y);
      c.lineTo(x, y);
      c.lineTo(x, y + b * 56);
      c.stroke();
    });
    c.restore();
  } else if (T === "neon") {
    c.save();
    c.shadowColor = acc;
    c.shadowBlur = 26;
    c.lineWidth = 6;
    c.beginPath();
    c.roundRect(17, 17, W - 34, H - 34, 38);
    c.stroke();
    c.shadowBlur = 8;
    c.strokeStyle = "#fff";
    c.lineWidth = 2;
    c.globalAlpha = 0.85;
    c.beginPath();
    c.roundRect(17, 17, W - 34, H - 34, 38);
    c.stroke();
    c.restore();
  } else if (T === "tactic") {
    c.lineWidth = 4;
    shape(c, T, 14, 14, W - 28, H - 28, 34);
    c.stroke();
    c.lineWidth = 2;
    c.globalAlpha = 0.6;
    for (let x = 62; x <= W - 62; x += 28) {
      c.beginPath();
      c.moveTo(x, 22);
      c.lineTo(x, 31);
      c.moveTo(x, H - 22);
      c.lineTo(x, H - 31);
      c.stroke();
    }
    for (let y = 62; y <= H - 62; y += 28) {
      c.beginPath();
      c.moveTo(22, y);
      c.lineTo(31, y);
      c.moveTo(W - 22, y);
      c.lineTo(W - 31, y);
      c.stroke();
    }
    c.globalAlpha = 1;
  } else if (T === "synth") {
    const g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, acc);
    g.addColorStop(1, alt);
    c.strokeStyle = g;
    c.lineWidth = 6;
    shape(c, T, 14, 14, W - 28, H - 28, 44);
    c.stroke();
    c.lineWidth = 2;
    c.globalAlpha = 0.55;
    shape(c, T, 27, 27, W - 54, H - 54, 32);
    c.stroke();
    c.globalAlpha = 1;
  } else if (EX) EX.frame(c, X);

  // illustration
  c.save();
  shape(c, T, ax, ay, aw, ah, S.r);
  c.clip();
  let cv = null;
  if (img) {
    // Taille (100 % = remplit le cadre) et position (50 % = centré) réglables.
    const zm = Math.max(0.5, Math.min(4, (Number(d.artZoom) || 100) / 100)),
      fx = Math.max(0, Math.min(1, (d.artX ?? 50) / 100)),
      fy = Math.max(0, Math.min(1, (d.artY ?? 50) / 100));
    const s = Math.max(aw / img.width, ah / img.height) * zm,
      dw = img.width * s,
      dh = img.height * s,
      left = ax + (aw - dw) * fx,
      top = ay + (ah - dh) * fy;
    if (dw < aw || dh < ah) {
      c.fillStyle = "#080c13";
      c.fillRect(ax, ay, aw, ah);
    }
    c.drawImage(img, left, top, dw, dh);
    cv = { s, sx: (ax - left) / s, sy: (ay - top) / s, sw: aw / s };
    if (c === pctx) state.artGeom = { aw, ah, dw, dh, k: W / c.canvas.width };
  } else {
    if (c === pctx) state.artGeom = null;
    c.fillStyle = "#080c13";
    c.fillRect(ax, ay, aw, ah);
    c.strokeStyle = acc;
    c.globalAlpha = 0.55;
    c.lineWidth = 4;
    c.beginPath();
    c.arc(375, 330, 78, 0, 7);
    c.moveTo(250, 560);
    c.quadraticCurveTo(255, 440, 375, 440);
    c.quadraticCurveTo(495, 440, 500, 560);
    c.stroke();
    c.globalAlpha = 1;
  }
  if (T === "chrome") {
    c.fillStyle = "rgba(255,255,255,.05)";
    for (let y = ay; y < H; y += 6) c.fillRect(ax, y, aw, 2);
  }
  if (T === "rue") {
    c.fillStyle = acc;
    c.globalAlpha = 0.4;
    for (let j = 0; j < 9; j++)
      for (let i = 0; i < 9 - j; i++) {
        c.beginPath();
        c.arc(
          ax + aw - 14 - i * 17,
          ay + 100 + j * 17,
          1.2 + (9 - i - j) * 0.45,
          0,
          7,
        );
        c.fill();
      }
    c.globalAlpha = 1;
  }
  if (T === "corpo") {
    const g = c.createLinearGradient(0, ay, 0, ay + 110);
    g.addColorStop(0, "rgba(5,6,10,.8)");
    g.addColorStop(1, "rgba(5,6,10,0)");
    c.fillStyle = g;
    c.fillRect(ax, ay, aw, 110);
  }
  if (T === "glitch")
    [
      [150, 10, -16],
      [214, 5, 20],
      [332, 14, -24],
      [420, 6, 14],
      [520, 9, -12],
    ].forEach(([y, h, o], i) => {
      if (cv)
        c.drawImage(
          img,
          cv.sx,
          cv.sy + (y - ay) / cv.s,
          cv.sw,
          h / cv.s,
          ax + o,
          y,
          aw,
          h,
        );
      c.globalAlpha = 0.22;
      c.fillStyle = i % 2 ? alt : acc;
      c.fillRect(ax, y, aw, h);
      c.globalAlpha = 1;
    });
  if (T === "terminal") {
    c.fillStyle = acc;
    c.globalAlpha = 0.1;
    c.fillRect(ax, ay, aw, ah);
    c.globalAlpha = 1;
    c.fillStyle = "rgba(0,0,0,.28)";
    for (let y = ay; y < ay + ah; y += 4) c.fillRect(ax, y, aw, 2);
  }
  if (T === "noir") {
    c.globalCompositeOperation = "saturation";
    c.globalAlpha = 0.88;
    c.fillStyle = "#000";
    c.fillRect(ax, ay, aw, ah);
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 0.12;
    c.fillStyle = acc;
    c.fillRect(ax, ay, aw, ah);
    c.globalAlpha = 1;
    const v = c.createRadialGradient(
      W / 2,
      ay + ah * 0.38,
      230,
      W / 2,
      ay + ah * 0.38,
      620,
    );
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,.6)");
    c.fillStyle = v;
    c.fillRect(ax, ay, aw, ah);
  }
  if (T === "holo") {
    c.fillStyle = acc;
    c.globalAlpha = 0.12;
    c.fillRect(ax, ay, aw, ah);
    c.globalAlpha = 1;
    const sw = c.createLinearGradient(0, ay + 170, 0, ay + 330);
    sw.addColorStop(0, "rgba(255,255,255,0)");
    sw.addColorStop(0.5, "rgba(255,255,255,.2)");
    sw.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = sw;
    c.fillRect(ax, ay + 170, aw, 160);
    c.fillStyle = "rgba(0,0,0,.25)";
    for (let y = ay; y < ay + ah; y += 5) c.fillRect(ax, y, aw, 1.5);
  }
  if (T === "neon") {
    c.fillStyle = "rgba(12,0,24,.22)";
    c.fillRect(ax, ay, aw, ah);
    const gl = c.createRadialGradient(
      W / 2,
      ay + ah * 0.45,
      260,
      W / 2,
      ay + ah * 0.45,
      560,
    );
    gl.addColorStop(0, "rgba(0,0,0,0)");
    gl.addColorStop(1, acc);
    c.globalAlpha = 0.38;
    c.fillStyle = gl;
    c.fillRect(ax, ay, aw, ah);
    c.globalAlpha = 1;
  }
  if (T === "tactic") {
    c.fillStyle = acc;
    c.globalAlpha = 0.07;
    c.fillRect(ax, ay, aw, ah);
    c.globalAlpha = 0.1;
    c.fillRect(ax, ay, aw, 0);
    for (let x = ax + 75; x < ax + aw; x += 75) c.fillRect(x, ay, 1, ah);
    for (let y = ay + 75; y < ay + ah; y += 75) c.fillRect(ax, y, aw, 1);
    c.globalAlpha = 0.85;
    c.strokeStyle = acc;
    c.lineWidth = 3;
    [
      [ax + 26, ay + 80, 1, 1],
      [ax + aw - 26, ay + 80, -1, 1],
      [ax + 26, ay + 520, 1, -1],
      [ax + aw - 26, ay + 520, -1, -1],
    ].forEach(([x, y, a, b]) => {
      c.beginPath();
      c.moveTo(x + a * 42, y);
      c.lineTo(x, y);
      c.lineTo(x, y + b * 42);
      c.stroke();
    });
    c.globalAlpha = 1;
  }
  if (T === "synth") {
    const sg = c.createLinearGradient(0, ay + 220, 0, ay + ah);
    sg.addColorStop(0, "rgba(255,113,206,0)");
    sg.addColorStop(1, acc);
    c.globalAlpha = 0.5;
    c.fillStyle = sg;
    c.fillRect(ax, ay + 220, aw, ah - 220);
    c.globalAlpha = 1;
    c.fillStyle = "rgba(7,2,15,.5)";
    for (let i = 0; i < 7; i++) c.fillRect(ax, 330 + i * 34, aw, 3 + i * 2.4);
  }
  if (EX && EX.art) EX.art(c, X);
  const fade = c.createLinearGradient(0, 560, 0, 1012);
  fade.addColorStop(0, "rgba(5,6,8,0)");
  fade.addColorStop(1, `rgba(5,6,8,${op})`);
  c.fillStyle = fade;
  c.fillRect(ax, 560, aw, 460);
  c.restore();

  // titre de la carte
  const title = (d.title || "").toUpperCase();
  if (c === pctx) state.titleHit = { text: title };
  if (T === "terminal") {
    c.strokeStyle = "#02100a";
    c.lineWidth = 2;
    for (let i = 0; i < 3; i++) c.strokeRect(W - 92 + i * 26, 25, 18, 18);
    if (title) {
      setLS(c, 1);
      fitFont(c, title, fT, 400, 26, 16, 540);
      c.fillStyle = "#02100a";
      c.fillText(title, 28, mid(c, 34));
    }
  } else if (title) {
    c.fillStyle = acc;
    if (T === "standard") {
      setLS(c, 3);
      fitFont(c, title, fT, fw(fT, 700), 28, 16, 560);
      const w = 68 + c.measureText(title).width - 3;
      c.fillStyle = "rgba(6,8,12,.88)";
      c.beginPath();
      c.roundRect(48, 48, w, 48, 24);
      c.fill();
      c.fillStyle = acc;
      c.beginPath();
      c.arc(74, 72, 6, 0, 7);
      c.fill();
      c.fillText(title, 92, mid(c, 72));
    } else if (T === "chrome") {
      setLS(c, 2);
      fitFont(c, title, fT, fw(fT, 700), 30, 18, 520);
      shape(c, T, 48, 48, 654, 48, 14);
      c.fill();
      c.fillStyle = "#050505";
      c.fillText(title, 66, mid(c, 72));
      c.fillRect(612, 56, 70, 4);
      c.fillRect(642, 66, 40, 4);
    } else if (T === "rue") {
      setLS(c, 1);
      fitFont(c, title, fT, fw(fT, 700), 34, 20, 570);
      const w = Math.min(654, c.measureText(title).width + 56),
        h = 50,
        z = 6;
      c.save();
      c.translate(52, 62);
      c.rotate(-0.03);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(w, 0);
      for (let i = 1; i <= 6; i++) c.lineTo(w - (i % 2 ? z : 0), (i * h) / 6);
      c.lineTo(0, h);
      for (let i = 5; i >= 1; i--) c.lineTo(i % 2 ? z : 0, (i * h) / 6);
      c.closePath();
      c.fill();
      c.strokeStyle = acc;
      c.lineCap = "round";
      c.lineWidth = 7;
      [
        [0.14, 30],
        [0.33, 14],
        [0.58, 40],
        [0.82, 20],
      ].forEach(([f, l]) => {
        c.beginPath();
        c.moveTo(f * w, h - 2);
        c.lineTo(f * w, h + l);
        c.stroke();
        c.beginPath();
        c.arc(f * w, h + l, 6, 0, 7);
        c.fill();
      });
      c.fillStyle = "#050505";
      c.fillText(title, 26, mid(c, h / 2));
      c.restore();
    } else if (T === "corpo") {
      setLS(c, 6);
      fitFont(c, title, fT, fw(fT, 700), 28, 16, 540);
      const w = c.measureText(title).width;
      c.fillRect(56, 56, 6, 36);
      c.fillStyle = "#fff";
      c.fillText(title, 76, mid(c, 74));
      if (76 + w + 18 < ax + aw - 18) {
        c.fillStyle = acc;
        c.globalAlpha = 0.6;
        c.fillRect(76 + w + 18, 73, ax + aw - 18 - (76 + w + 18), 1.5);
        c.globalAlpha = 1;
      }
    } else if (T === "glitch") {
      // glitch
      setLS(c, 2);
      fitFont(c, title, fT, fw(fT, 700), 28, 16, 560);
      const w = Math.min(654, c.measureText(title).width + 52),
        b = mid(c, 72);
      c.fillStyle = "rgba(5,6,10,.92)";
      c.fillRect(48, 48, w, 48);
      c.fillStyle = alt;
      c.fillText(title, 64, b);
      c.fillStyle = acc;
      c.fillText(title, 70, b);
      c.fillStyle = "#fff";
      c.fillText(title, 67, b);
    } else if (T === "noir") {
      setLS(c, 3);
      fitFont(c, title, fT, fw(fT, 700), 28, 16, 540);
      const w = Math.min(654, c.measureText(title).width + 48);
      c.fillStyle = acc;
      c.fillRect(48, 48, w, 48);
      c.strokeStyle = acc;
      c.lineWidth = 2;
      c.strokeRect(42, 42, w + 12, 60);
      c.fillStyle = "#1a160d";
      c.fillText(title, 72, mid(c, 72));
    } else if (T === "holo") {
      setLS(c, 4);
      fitFont(c, title, fT, fw(fT, 700), 26, 15, 520);
      const w = Math.min(654, c.measureText(title).width + 72);
      c.save();
      c.fillStyle = "rgba(2,20,26,.72)";
      c.beginPath();
      c.roundRect(48, 48, w, 48, 24);
      c.fill();
      c.shadowColor = acc;
      c.shadowBlur = 12;
      c.strokeStyle = acc;
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = acc;
      c.beginPath();
      c.moveTo(72, 64);
      c.lineTo(80, 72);
      c.lineTo(72, 80);
      c.lineTo(64, 72);
      c.closePath();
      c.fill();
      c.fillText(title, 92, mid(c, 72));
      c.restore();
    } else if (T === "neon") {
      setLS(c, 4);
      fitFont(c, title, fT, fw(fT, 700), 42, 22, 560);
      const w = Math.min(654, c.measureText(title).width + 52);
      c.fillStyle = "rgba(8,2,14,.6)";
      c.beginPath();
      c.roundRect(48, 46, w, 60, 30);
      c.fill();
      c.save();
      c.shadowColor = acc;
      c.shadowBlur = 24;
      c.fillStyle = acc;
      c.fillText(title, 74, mid(c, 76));
      c.shadowBlur = 8;
      c.fillStyle = "#fff";
      c.fillText(title, 74, mid(c, 76));
      c.restore();
    } else if (T === "tactic") {
      setLS(c, 3);
      fitFont(c, title, fT, fw(fT, 700), 28, 16, 520);
      const w = Math.min(654, c.measureText(title).width + 120);
      c.fillStyle = "rgba(5,6,4,.92)";
      shape(c, T, 48, 48, w, 48, 12);
      c.fill();
      c.save();
      c.beginPath();
      c.rect(48, 48, 40, 48);
      c.clip();
      c.fillStyle = acc;
      c.fillRect(48, 48, 40, 48);
      c.fillStyle = "#050604";
      for (let i = -2; i < 6; i++) {
        const x = 48 + i * 14;
        c.beginPath();
        c.moveTo(x, 96);
        c.lineTo(x + 7, 96);
        c.lineTo(x + 55, 48);
        c.lineTo(x + 48, 48);
        c.closePath();
        c.fill();
      }
      c.restore();
      c.fillStyle = acc;
      c.fillText(title, 104, mid(c, 72));
    } else if (T === "synth") {
      setLS(c, 3);
      fitFont(c, title, fT, fw(fT, 700), 28, 16, 540);
      const w = Math.min(654, c.measureText(title).width + 72);
      const g = c.createLinearGradient(48, 0, 48 + w, 0);
      g.addColorStop(0, acc);
      g.addColorStop(1, alt);
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(66, 48);
      c.lineTo(48 + w, 48);
      c.lineTo(48 + w - 18, 96);
      c.lineTo(48, 96);
      c.closePath();
      c.fill();
      c.fillStyle = "#12041f";
      c.fillText(title, 78, mid(c, 72));
    } else if (EX) EX.title(c, X, title);
    setLS(c, 0);
  }

  if (c === pctx) {
    state.titleHit = null;
    if (!state.HIT.title) state.HIT.title = { x: 24, y: 20, w: W - 48, h: 100 };
  }
  // Panneau descriptif : masqué en mode confidentiel (titre et illustration conservés).
  if (!state.confidentialMode) {
    if (c === pctx) {
      state.HIT.name = { x: tx - 8, y: py + 6, w: mw + 16, h: 50 };
      state.HIT.desc = { x: tx - 8, y: py + 104, w: mw + 16, h: 88 };
      state.HIT.status = { x: tx - 8, y: py + ph - 44, w: 240, h: 40 };
    }
    c.save();
    shape(c, T, px, py, pw, ph, S.pr);
    c.fillStyle = `rgba(6,7,10,${op})`;
    c.fill();
    c.clip();
    c.fillStyle = acc;
    if (T === "standard" || T === "chrome") c.fillRect(px, py, pw, 6);
    if (T === "chrome") {
      c.globalAlpha = 0.5;
      c.fillRect(px, py + ph - 3, pw, 3);
      c.globalAlpha = 1;
    }
    if (T === "rue") c.fillRect(px, py, pw, 10);
    if (T === "corpo") {
      c.fillRect(px, py, 6, ph);
      c.globalAlpha = 0.5;
      c.fillRect(px, py, pw, 2);
      c.globalAlpha = 1;
    }
    if (T === "glitch") {
      c.fillRect(px, py, pw, 6);
      c.fillStyle = alt;
      c.fillRect(px + pw - 250, py, 110, 6);
      c.fillRect(px, py + ph - 3, 160, 3);
    }
    if (T === "terminal") {
      c.strokeStyle = acc;
      c.lineWidth = 4;
      c.strokeRect(px, py, pw, ph);
    }
    if (T === "noir") {
      c.fillRect(px, py, pw, 3);
      c.fillRect(px, py + 8, pw, 1.5);
      c.globalAlpha = 0.6;
      c.fillRect(px, py + ph - 2, pw, 2);
      c.globalAlpha = 1;
    }
    if (T === "holo") {
      c.globalAlpha = 0.07;
      c.fillRect(px, py, pw, ph);
      c.globalAlpha = 1;
      c.save();
      c.shadowColor = acc;
      c.shadowBlur = 12;
      c.strokeStyle = acc;
      c.lineWidth = 4;
      shape(c, T, px, py, pw, ph, S.pr);
      c.stroke();
      c.restore();
    }
    if (T === "neon") {
      c.save();
      c.shadowColor = acc;
      c.shadowBlur = 16;
      c.strokeStyle = acc;
      c.lineWidth = 8;
      shape(c, T, px, py, pw, ph, S.pr);
      c.stroke();
      c.restore();
    }
    if (T === "tactic") {
      c.strokeStyle = acc;
      c.lineWidth = 4;
      shape(c, T, px, py, pw, ph, S.pr);
      c.stroke();
      c.fillRect(px + 30, py, 110, 9);
    }
    if (T === "synth") {
      const g = c.createLinearGradient(px, 0, px + pw, 0);
      g.addColorStop(0, acc);
      g.addColorStop(1, alt);
      c.fillStyle = g;
      c.fillRect(px, py, pw, 7);
      c.fillRect(px, py + ph - 3, pw, 3);
    }
    if (EX && EX.panel) EX.panel(c, X);
    c.restore();

    let name = (d.name || "NOUVEAU PNJ").toUpperCase().slice(0, 40);
    if (T === "terminal") name = "> " + name;
    setLS(c, T === "corpo" ? 3 : T === "tactic" ? 2 : 0);
    const ns = fitFont(c, name, fT, fw(fT, 700), 52, 30, mw),
      ny = py + (T === "rue" ? 56 : 52);
    if (T === "rue") {
      c.fillStyle = acc;
      c.fillText(name, tx + 3, ny + 3);
    }
    if (T === "glitch") {
      c.fillStyle = alt;
      c.fillText(name, tx - 3, ny);
      c.fillStyle = acc;
      c.fillText(name, tx + 3, ny);
    }
    if (T === "synth") {
      c.fillStyle = alt;
      c.fillText(name, tx + 3, ny + 3);
    }
    if (EX && EX.nameFx) EX.nameFx(c, X, name, tx, ny);
    if (T === "neon") {
      c.save();
      c.shadowColor = acc;
      c.shadowBlur = 18;
      c.fillStyle = "#fff";
      c.fillText(name, tx, ny);
      c.restore();
    }
    c.fillStyle = "#fff";
    c.fillText(name, tx, ny);
    if (T === "terminal") {
      const w = c.measureText(name).width;
      if (w + ns * 0.5 + 8 < mw) {
        c.fillStyle = acc;
        c.fillRect(tx + w + 8, ny - ns * 0.7, ns * 0.45, ns * 0.7);
      }
    }
    let rt = [d.role, d.tag].filter(Boolean).join("  •  ");
    if (T === "terminal" && rt) rt = "[ " + rt + " ]";
    if (rt) {
      setLS(c, T === "corpo" ? 2 : 0);
      fitFont(c, rt, fB, fw(fB, 700), 24, 16, mw);
      c.fillStyle = acc;
      c.fillText(rt, tx, py + 84);
      if (c === pctx) {
        const total = c.measureText(rt).width;
        if (d.role && d.tag) {
          const sp =
            c.measureText((T === "terminal" ? "[ " : "") + d.role).width +
            c.measureText("  •  ").width / 2;
          state.HIT.role = { x: tx - 8, y: py + 58, w: sp + 8, h: 36 };
          state.HIT.tag = { x: tx + sp, y: py + 58, w: total - sp + 8, h: 36 };
        } else {
          const own = d.role ? "role" : "tag",
            other = d.role ? "tag" : "role",
            rest = mw - total - 24;
          state.HIT[own] = { x: tx - 8, y: py + 58, w: total + 16, h: 36 };
          if (rest >= 70)
            state.HIT[other] = {
              x: tx + total + 20,
              y: py + 58,
              w: rest,
              h: 36,
            };
        }
      }
    } else if (c === pctx) {
      state.HIT.role = { x: tx - 8, y: py + 58, w: mw / 2 - 4, h: 36 };
      state.HIT.tag = { x: tx + mw / 2 + 4, y: py + 58, w: mw / 2 - 4, h: 36 };
    }
    setLS(c, 0);
    c.fillStyle = "rgba(255,255,255,.28)";
    if (T === "terminal")
      for (let x = tx; x < tx + mw; x += 10) c.fillRect(x, py + 97, 6, 2);
    else c.fillRect(tx, py + 97, mw, 1.5);

    if (d.desc) {
      const box = 76;
      let s = 24,
        L;
      for (; ; s--) {
        c.font = `${fw(fB, 500)} ${s}px ${ff(fB)}`;
        L = wrap(c, d.desc, mw);
        if (L.length * s * 1.3 <= box || s <= 15) break;
      }
      const max = Math.max(1, Math.floor(box / (s * 1.3)));
      if (L.length > max) {
        L = L.slice(0, max);
        L[max - 1] = L[max - 1].replace(/\s*\S*$/, "") + "…";
      }
      c.fillStyle = T === "terminal" ? "#d2ffd9" : "#f4f6fa";
      L.forEach((l, i) => c.fillText(l, tx, py + 110 + s + i * s * 1.3));
    }
    // pied : statut + ID décoratif
    c.fillStyle = acc;
    c.beginPath();
    c.arc(tx + 8, py + ph - 21, 7, 0, 7);
    c.fill();
    c.font = `${fw(fB, 700)} 19px ${ff(fB)}`;
    c.fillStyle = "#fff";
    c.fillText((d.status || "Inconnu").toUpperCase(), tx + 24, py + ph - 14);
    if (d.idOn && d.idStr) {
      c.font = `400 17px "Share Tech Mono",monospace`;
      if (c === pctx) {
        const iw = c.measureText(d.idStr).width;
        state.HIT.idStr = {
          x: rx - iw - 8,
          y: py + ph - 40,
          w: iw + 16,
          h: 32,
        };
      }
      c.fillStyle = "#d6dce8";
      c.textAlign = "right";
      c.fillText(d.idStr, rx, py + ph - 15);
      c.textAlign = "left";
    }
    c.restore();
  } // fin du mode descriptif
}
