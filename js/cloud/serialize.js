/** Cloud : (dé)sérialisation des cartes. */
import { state } from "../core/state.js";
import { BACK_STYLES } from "../backs/index.js";
import { prepImage } from "./images.js";

// Une carte « cloud » = métadonnées + références d'images (les images sont des documents séparés, dédupliqués par empreinte)
export async function cardDoc(c, noBack) {
  const { artData, backArtData, ...rest } = c,
    images = {},
    doc = { ...rest };
  if (artData) {
    const p = await prepImage(artData);
    if (p) {
      doc.artHash = p.hash;
      images[p.hash] = p.data;
    }
  }
  if (backArtData && !noBack) {
    const st = BACK_STYLES.find((x) => x.data === backArtData);
    if (st) doc.backStyle = st.name;
    else {
      const p = await prepImage(backArtData);
      if (p) {
        doc.backHash = p.hash;
        images[p.hash] = p.data;
      }
    }
  }
  return { doc: JSON.parse(JSON.stringify(doc)), images };
}

export function rebuildCard(doc, imgOf) {
  const { artHash, backHash, backStyle, ...c } = doc;
  if (artHash) c.artData = imgOf(artHash) || null;
  if (backStyle)
    c.backArtData =
      (BACK_STYLES.find((x) => x.name === backStyle) || {}).data || null;
  else if (backHash) c.backArtData = imgOf(backHash) || null;
  return c;
}

export async function collectState() {
  const cardDocs = new Map(),
    images = new Map();
  for (const c of state.cards) {
    const r = await cardDoc(c);
    cardDocs.set(String(c.id), r.doc);
    Object.entries(r.images).forEach(([h, d]) => images.set(h, d));
  }
  const backs = [];
  for (const b of state.customBacks) {
    const p = await prepImage(b.data);
    if (p) {
      backs.push({ name: b.name, hash: p.hash });
      images.set(p.hash, p.data);
    }
  }
  const meta = JSON.parse(
    JSON.stringify({
      order: state.cards.map((c) => c.id),
      nextId: state.nextId,
      folders: state.folders,
      customColors: state.customColors,
      confidentialMode: state.confidentialMode,
      prefs: state.prefs,
      backs,
      v: 1,
    }),
  );
  return { cardDocs, images, meta };
}
