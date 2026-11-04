/** Export groupé : plusieurs cartes × (carte / carte confidentielle / token), en ZIP ou en fichiers séparés. */
import { slug } from "../core/utils.js";
import { cardBlob, download, tokenBlob } from "./export.js";
import { makeZip } from "./zip.js";

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param cards  cartes à exporter
 * @param fmt    { card, cfd, tkn, zip, folders }
 * @param onProgress (fait, total) => void
 * @returns nombre de fichiers produits
 */
export async function exportSelection(cards, fmt, onProgress = () => {}) {
  const used = new Map(),
    files = [],
    total = cards.length * (+!!fmt.card + +!!fmt.cfd + +!!fmt.tkn);
  let n = 0;
  for (const d of cards) {
    // dossiers de la bibliothèque reproduits dans le ZIP (facultatif)
    const dir =
      fmt.zip && fmt.folders && d.folder
        ? d.folder.split("/").filter(Boolean).map(slug).join("/") + "/"
        : "";
    let base = "card_npc_" + slug(d.name);
    const k = (used.get(dir + base) || 0) + 1; // deux cartes de même nom : -2, -3…
    used.set(dir + base, k);
    if (k > 1) base += "-" + k;
    const add = async (suffix, ext, make) => {
      files.push({ name: dir + base + suffix + "." + ext, blob: await make() });
      onProgress(++n, total);
      await pause(0); // laisse le navigateur respirer
    };
    if (fmt.card) await add("", "jpg", () => cardBlob(d, false));
    if (fmt.cfd) await add("-cfd", "jpg", () => cardBlob(d, true));
    if (fmt.tkn) await add("-tkn", "png", () => tokenBlob(d));
  }
  if (fmt.zip) {
    const entries = [];
    for (const f of files)
      entries.push({ name: f.name, data: new Uint8Array(await f.blob.arrayBuffer()) });
    download(makeZip(entries), "cartes_pnj_" + new Date().toISOString().slice(0, 10) + ".zip");
  } else {
    for (const f of files) {
      download(f.blob, f.name);
      await pause(250);
    }
  }
  return files.length;
}
