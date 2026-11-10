/** Exports PNG (recto/verso, tout). */
import { $ } from "../core/dom.js";
import { H, W } from "../core/config.js";
import { state } from "../core/state.js";
import { getImg, setStatus, slug } from "../core/utils.js";
import { draw } from "../card/render.js";
import { drawBackFace } from "../card/back-render.js";
import { TOKEN_SIZE, drawToken, metalRelief, tokenImageOf } from "../token/render.js";

const toBlob = (cv, type, q) => new Promise((res) => cv.toBlob(res, type, q));

/** Déclenche le téléchargement d'un Blob. */
export function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = name;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/** Recto de la carte sur un canvas ; `confidential` force la version confidentielle ou complète (défaut : réglage général). */
export async function cardCanvas(d, confidential = state.confidentialMode) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const img = await getImg(d.artData),
    prev = state.confidentialMode;
  state.confidentialMode = !!confidential;
  try {
    draw(c.getContext("2d"), d, img);
  } finally {
    state.confidentialMode = prev;
  }
  return c;
}

/** Token sur un canvas ; `back` = verso de la pièce (illustration en relief métal). */
export async function tokenCanvas(d, back = false) {
  const c = document.createElement("canvas");
  c.width = TOKEN_SIZE;
  c.height = TOKEN_SIZE;
  const img = await tokenImageOf(d);
  drawToken(c.getContext("2d"), d, back ? metalRelief(img) : img);
  return c;
}

/** Carte en JPG. */
export async function cardBlob(d, confidential = state.confidentialMode) {
  return toBlob(await cardCanvas(d, confidential), "image/jpeg", 0.94);
}

/** Token en PNG (fond transparent). */
export async function tokenBlob(d) {
  return toBlob(await tokenCanvas(d), "image/png");
}

export async function exportCard(d) {
  // suffixe « -cfd » : carte exportée en version confidentielle
  download(
    await cardBlob(d, state.confidentialMode),
    "card_npc_" + slug(d.name) + (state.confidentialMode ? "-cfd" : "") + ".jpg",
  );
}

/** Token en PNG (fond transparent) ; fichier suffixé « -tkn ». */
export async function exportToken(d) {
  download(await tokenBlob(d), "card_npc_" + slug(d.name) + "-tkn.png");
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
  drawBackFace(c.getContext("2d"), im);
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
