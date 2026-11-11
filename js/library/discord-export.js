/**
 * Export « Discord » : la carte qui tourne, en GIF animé (lecture automatique en boucle) ou en vidéo MP4 / WebM.
 * Discord n'affiche pas les pages HTML ; ses limites de poids : 10 Mo (gratuit), 50 Mo (Nitro Basic), 500 Mo (Nitro).
 */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { setStatus, slug } from "../core/utils.js";
import { download } from "./export.js";
import { GifWriter, buildPalette, quantize } from "./gif-encoder.js";
import { drawSpinFrame, spinAngle, spinSize, spinTextures } from "./spin-render.js";

const FPS = 20,
  MB = 1048576,
  tick = () => new Promise((r) => setTimeout(r, 0)),
  fmtSize = (b) => (b / MB).toFixed(1).replace(".", ",") + " Mo";

/** GIF animé de la carte qui tourne. o = { width, bg, motion, duration, shadow, glare }. */
export async function renderGif(tex, o, onProgress) {
  const { w, h } = spinSize(o.width),
    n = Math.max(4, Math.round(o.duration * FPS)),
    cv = Object.assign(document.createElement("canvas"), { width: w, height: h }),
    ctx = cv.getContext("2d", { willReadFrequently: true }),
    frame = (k) => {
      drawSpinFrame(ctx, tex, o, spinAngle(o.motion, k, n));
      return ctx.getImageData(0, 0, w, h).data;
    },
    samples = [];
  for (let m = 0; m < 10; m++) samples.push(frame(Math.floor((m * n) / 10)));
  const pal = buildPalette(samples, true),
    gif = new GifWriter(w, h, pal, { delayCs: Math.round(100 / FPS), transparentBg: o.bg === "transparent" }),
    idx = new Uint8Array(w * h);
  for (let k = 0; k < n; k++) {
    quantize(frame(k), w, h, pal, idx);
    gif.addFrame(idx);
    onProgress && onProgress(k + 1, n, w);
    if (k % 3 === 2) await tick();
  }
  return gif.finish();
}

/** GIF dont le poids respecte `limit` (octets, 0 = illimité) : la largeur est réduite au besoin. */
export async function renderGifFit(tex, o, limit, onProgress) {
  let width = o.width,
    blob;
  for (let tries = 0; tries < 5; tries++) {
    blob = await renderGif(tex, { ...o, width }, onProgress);
    if (!limit || blob.size <= limit || width <= 160) break;
    width = Math.max(160, Math.round((width * 0.82) / 2) * 2);
  }
  return { blob, width };
}

// MP4 (H.264) en priorité : lu partout par Discord ; sinon WebM ; MP4 « générique » (codec au choix du navigateur) en dernier recours
const VIDEO_TYPES = ["video/mp4;codecs=avc1.42E01E", "video/mp4;codecs=avc1", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
export const videoMime = () =>
  typeof MediaRecorder === "undefined" ? null : VIDEO_TYPES.find((m) => MediaRecorder.isTypeSupported(m)) || null;

/** Vidéo MP4 (ou WebM selon le navigateur) : enregistrée en temps réel, `loops` tours. */
export async function renderVideo(tex, o, onProgress, loops = 2) {
  const mime = videoMime();
  if (!mime) throw new Error("Ce navigateur ne sait pas enregistrer de vidéo : utilisez le GIF.");
  const { w, h } = spinSize(o.width),
    cv = Object.assign(document.createElement("canvas"), { width: w, height: h }),
    ctx = cv.getContext("2d"),
    oo = { ...o, bg: o.bg === "transparent" ? "dark" : o.bg }, // la vidéo n'a pas de transparence
    rec = new MediaRecorder(cv.captureStream(30), { mimeType: mime, videoBitsPerSecond: Math.round(w * h * 8) }),
    chunks = [],
    total = o.duration * loops;
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  drawSpinFrame(ctx, tex, oo, 0);
  return new Promise((resolve, reject) => {
    rec.onstop = () => resolve({ blob: new Blob(chunks, { type: mime.split(";")[0] }), mime });
    rec.onerror = (e) => reject(e.error || e);
    rec.start(250);
    const t0 = performance.now(),
      step = (now) => {
        const t = (now - t0) / 1000;
        if (t >= total) return rec.stop();
        drawSpinFrame(ctx, tex, oo, spinAngle(o.motion, ((t % o.duration) / o.duration) * 1000, 1000));
        onProgress && onProgress(t / total);
        requestAnimationFrame(step);
      };
    requestAnimationFrame(step);
  });
}

/* ------------------------------ fenêtre d'export ------------------------------ */
let current = null,
  tex = null,
  raf = 0;
const dlg = () => $("discordDlg"),
  opts = () => ({
    width: +$("dcSize").value,
    bg: $("dcBg").value,
    motion: $("dcMotion").value,
    duration: +$("dcDuration").value,
    shadow: $("dcShadow").checked,
    glare: $("dcGlare").checked,
  });

async function loadTextures() {
  tex = await spinTextures(current, $("dcCfd").checked);
}

function preview() {
  cancelAnimationFrame(raf);
  const cv = $("discordPreview"),
    ctx = cv.getContext("2d"),
    { w, h } = spinSize(240);
  cv.width = w;
  cv.height = h;
  const t0 = performance.now(),
    step = (now) => {
      if (!dlg().open) return;
      const o = opts();
      if (tex) drawSpinFrame(ctx, tex, { ...o, width: 240 }, spinAngle(o.motion, (((now - t0) / 1000) % o.duration) / o.duration * 1000, 1000));
      raf = requestAnimationFrame(step);
    };
  raf = requestAnimationFrame(step);
}

/** Ouvre la fenêtre d'export Discord pour la carte `d`. */
export async function openDiscordDialog(d) {
  current = d;
  tex = null;
  $("dcStatus").textContent = "";
  $("dcCfd").checked = state.confidentialMode;
  $("dcFormat").querySelector('option[value="video"]').disabled = !videoMime();
  dlg().showModal();
  preview();
  await loadTextures();
}

$("dcCfd").addEventListener("change", loadTextures);
dlg().addEventListener("close", () => cancelAnimationFrame(raf));

$("dcGo").onclick = async () => {
  if (!current || !tex) return;
  const btn = $("dcGo"),
    status = (t) => ($("dcStatus").textContent = t),
    o = opts(),
    fmt = $("dcFormat").value,
    limit = +$("dcLimit").value * MB,
    base = "card_npc_" + slug(current.name) + ($("dcCfd").checked ? "-cfd" : "") + "-discord";
  btn.disabled = true;
  try {
    let blob,
      ext,
      note = "";
    if (fmt === "gif") {
      const r = await renderGifFit(tex, o, limit, (k, n, w) => status("GIF " + w + " px : image " + k + " / " + n + "…"));
      blob = r.blob;
      ext = "gif";
      if (r.width !== o.width) note = " — réduit à " + r.width + " px pour tenir sous la limite";
      if (limit && blob.size > limit) note += " — dépasse encore la limite : choisissez une durée plus courte ou une autre limite";
    } else {
      status("Enregistrement de la vidéo… (" + o.duration * 2 + " s)");
      const r = await renderVideo(tex, o, (p) => status("Enregistrement : " + Math.round(p * 100) + " %"));
      blob = r.blob;
      ext = r.mime.startsWith("video/mp4") ? "mp4" : "webm";
    }
    download(blob, base + "." + ext);
    status(base + "." + ext + " — " + fmtSize(blob.size) + note);
    setStatus("Export Discord terminé : " + fmtSize(blob.size) + ".");
  } catch (e) {
    console.error(e);
    status("L’export a échoué : " + (e.message || e));
  } finally {
    btn.disabled = false;
  }
};
