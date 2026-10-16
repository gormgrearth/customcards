/** Exports PNG (recto/verso, tout). */
import { $ } from "../core/dom.js";
import { H, W } from "../core/config.js";
import { state } from "../core/state.js";
import { getImg, setStatus, slug } from "../core/utils.js";
import { draw } from "../card/render.js";

export async function exportCard(d) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  draw(c.getContext("2d"), d, await getImg(d.artData));
  const a = document.createElement("a");
  a.download = "card_npc_" + slug(d.name) + ".jpg";
  a.href = c.toDataURL("image/jpeg", 0.94);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function exportBackCard(d) {
  const data = d.backArtData || state.backArtData;
  if (!data) {
    setStatus("Choisissez ou importez une illustration pour le verso.");
    return;
  }
  const im = await getImg(data);
  if (!im) {
    setStatus("Impossible de charger l’illustration du verso.");
    return;
  }
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#06121e");
  g.addColorStop(1, "#02050b");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  const pad = 28,
    iw = W - pad * 2,
    ih = H - pad * 2,
    scale = Math.max(iw / im.width, ih / im.height),
    sw = iw / scale,
    sh = ih / scale;
  x.save();
  x.beginPath();
  x.roundRect(pad, pad, iw, ih, 24);
  x.clip();
  x.drawImage(
    im,
    (im.width - sw) / 2,
    (im.height - sh) / 2,
    sw,
    sh,
    pad,
    pad,
    iw,
    ih,
  );
  x.fillStyle = "rgba(2,7,14,.18)";
  x.fillRect(pad, pad, iw, ih);
  x.restore();
  x.strokeStyle = "#00f0ff";
  x.lineWidth = 4;
  x.strokeRect(14, 14, W - 28, H - 28);
  x.strokeStyle = "#ff2d95";
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(42, 120);
  x.lineTo(42, 42);
  x.lineTo(170, 42);
  x.moveTo(W - 42, H - 120);
  x.lineTo(W - 42, H - 42);
  x.lineTo(W - 170, H - 42);
  x.stroke();
  const a = document.createElement("a");
  a.download = "verso_" + slug(d.name || "carte") + ".jpg";
  a.href = c.toDataURL("image/jpeg", 0.94);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

$("exportAll").onclick = async () => {
  if (!state.cards.length) return setStatus("La bibliothèque est vide.");
  for (const d of [...state.cards].reverse()) {
    await exportCard(d);
    await new Promise((r) => setTimeout(r, 200));
  }
  setStatus(
    "Exports lancés : autorisez les téléchargements multiples si besoin.",
  );
};
