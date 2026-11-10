/** Export de la carte 3D interactive : une page HTML autonome (carte recto/verso + token en pièce). */
import { H, W } from "../core/config.js";
import { state } from "../core/state.js";
import { getImg, setStatus, slug } from "../core/utils.js";
import { drawBackFace } from "../card/back-render.js";
import { cardCanvas, download, tokenCanvas } from "./export.js";
import { clamp, spinner } from "./card-viewer.js";
import { buildViewerHtml } from "./viewer-template.js";

export const viewerFileName = (d, confidential = state.confidentialMode) =>
  "card_npc_" + slug(d.name) + (confidential ? "-cfd" : "") + "-3d.html";

/** Contenu HTML (texte) de la carte 3D de `d`. */
export async function viewerHtml(d, confidential = state.confidentialMode) {
  const back = document.createElement("canvas");
  back.width = W;
  back.height = H;
  drawBackFace(back.getContext("2d"), await getImg(d.backArtData));
  const [front, tokFront, tokBack] = await Promise.all([cardCanvas(d, confidential), tokenCanvas(d), tokenCanvas(d, true)]);
  return buildViewerHtml({
    title: d.name || "Carte",
    front: front.toDataURL("image/jpeg", 0.92),
    back: back.toDataURL("image/jpeg", 0.92),
    tokFront: tokFront.toDataURL("image/png"),
    tokBack: tokBack.toDataURL("image/png"),
    // même code de rotation que la visionneuse de l'atelier
    clampSrc: "const clamp = " + clamp.toString() + ";",
    spinnerSrc: spinner.toString(),
  });
}

export const viewerBlob = async (d, confidential) =>
  new Blob([await viewerHtml(d, confidential)], { type: "text/html;charset=utf-8" });

/** Télécharge la carte 3D interactive (réglage « confidentiel » général pris en compte : suffixe -cfd). */
export async function exportViewerHtml(d) {
  const cfd = state.confidentialMode;
  download(await viewerBlob(d, cfd), viewerFileName(d, cfd));
  setStatus("Carte 3D exportée : ouvrez le fichier .html dans un navigateur.");
}
