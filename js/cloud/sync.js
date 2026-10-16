/** Cloud : synchronisation (push/pull). */
import { state } from "../core/state.js";
import { norm } from "../card/form.js";
import { cloudOn, dirtyKey, setSync } from "./core.js";
import { pool, prepImage } from "./images.js";
import { collectState, rebuildCard } from "./serialize.js";
import { afterStateLoad, applyState, persistAll, readState } from "./local.js";

export function scheduleCloud() {
  if (!cloudOn || !state.user || !state.cloudReady) return;
  try {
    localStorage.setItem(dirtyKey(), "1");
  } catch (_) {}
  setSync("☁ Modifications en attente…");
  clearTimeout(state.pushTimer);
  state.pushTimer = setTimeout(cloudPush, 1500);
}

export async function cloudPush() {
  if (!cloudOn || !state.user || !state.cloudReady) return;
  if (state.pushing) {
    state.pushAgain = true;
    return;
  }
  state.pushing = true;
  try {
    do {
      state.pushAgain = false;
      setSync("☁ Synchronisation…");
      const uref = state.fdb.collection("users").doc(state.user.uid);
      const { cardDocs, images, meta } = await collectState();
      const changed = [...cardDocs].filter(
        ([id, d]) => state.cloudSnap.get(id) !== JSON.stringify(d),
      );
      const removed = [...state.cloudSnap.keys()].filter(
        (id) => !cardDocs.has(id),
      );
      const metaStr = JSON.stringify(meta);
      const newImgs = [...images].filter(([h]) => !state.cloudImgs.has(h));
      await pool(newImgs, 4, async ([h, d]) => {
        await uref.collection("images").doc(h).set({ data: d });
        state.cloudImgs.add(h);
      });
      await pool(changed, 6, async ([id, d]) => {
        await uref.collection("cards").doc(id).set(d);
        state.cloudSnap.set(id, JSON.stringify(d));
      });
      await pool(removed, 6, async (id) => {
        await uref.collection("cards").doc(id).delete();
        state.cloudSnap.delete(id);
      });
      if (metaStr !== state.cloudMetaSnap) {
        await uref.set(meta);
        state.cloudMetaSnap = metaStr;
      }
    } while (state.pushAgain);
    try {
      localStorage.removeItem(dirtyKey());
    } catch (_) {}
    setSync("☁ Synchronisé");
  } catch (e) {
    console.error(e);
    setSync(
      "⚠ Échec de synchronisation (" +
        (e.code || e.message) +
        ") — nouvel essai dans 15 s",
      true,
    );
    clearTimeout(state.pushTimer);
    state.pushTimer = setTimeout(cloudPush, 15000);
  } finally {
    state.pushing = false;
  }
}

export async function cloudPull() {
  const uref = state.fdb.collection("users").doc(state.user.uid);
  // Des modifications locales n'ont pas pu être envoyées lors d'une session précédente : elles priment.
  let dirty = false;
  try {
    dirty = !!localStorage.getItem(dirtyKey());
  } catch (_) {}
  if (dirty && !state.cards.length && !state.folders.length) {
    dirty = false;
    try {
      localStorage.removeItem(dirtyKey());
    } catch (_) {}
  }
  if (dirty) {
    state.cloudSnap = new Map();
    state.cloudMetaSnap = "";
    state.cloudImgs = new Set();
    state.cloudReady = true;
    await cloudPush();
    return;
  }
  setSync("☁ Chargement de votre compte…");
  const ms = await uref.get();
  if (!ms.exists) {
    // compte neuf
    const g = await readState("");
    if (
      g.lib &&
      g.lib.cards &&
      g.lib.cards.length &&
      confirm(
        "Votre compte est vide. Envoyer vers votre compte la bibliothèque présente sur cet appareil (" +
          g.lib.cards.length +
          " carte(s)) ?",
      )
    ) {
      applyState(g);
      await persistAll();
      afterStateLoad();
    }
    state.cloudSnap = new Map();
    state.cloudMetaSnap = "";
    state.cloudImgs = new Set();
    state.cloudReady = true;
    await cloudPush();
    return;
  }
  const meta = ms.data(),
    cs = await uref.collection("cards").get();
  const byId = new Map(cs.docs.map((d) => [d.id, d.data()]));
  // images déjà présentes dans le cache local (évite de tout retélécharger)
  const have = new Map();
  for (const c of state.cards) {
    if (c.artData) {
      const p = await prepImage(c.artData);
      if (p) have.set(p.hash, p.data);
    }
    if (c.backArtData) {
      const p = await prepImage(c.backArtData);
      if (p) have.set(p.hash, p.data);
    }
  }
  for (const b of state.customBacks) {
    const p = await prepImage(b.data);
    if (p) have.set(p.hash, p.data);
  }
  const need = new Set();
  byId.forEach((d) => {
    if (d.artHash) need.add(d.artHash);
    if (d.backHash) need.add(d.backHash);
  });
  (meta.backs || []).forEach((b) => need.add(b.hash));
  const missing = [...need].filter((h) => !have.has(h));
  let done = 0;
  await pool(missing, 6, async (h) => {
    const s = await uref.collection("images").doc(h).get();
    if (s.exists) have.set(h, s.data().data);
    setSync(
      "☁ Téléchargement des images " + ++done + "/" + missing.length + "…",
    );
  });
  const imgOf = (h) => have.get(h) || null;
  const order = (meta.order || []).map(String),
    ids = [
      ...order.filter((id) => byId.has(id)),
      ...[...byId.keys()].filter((id) => !order.includes(id)),
    ];
  state.cards = ids.map((id) => norm(rebuildCard(byId.get(id), imgOf)));
  state.nextId = Math.max(
    meta.nextId || 1,
    ...state.cards.map((c) => (Number(c.id) || 0) + 1),
  );
  state.folders = Array.isArray(meta.folders) ? meta.folders.slice() : [];
  state.cards.forEach((c) => {
    const parts = (c.folder || "").split("/").filter(Boolean);
    for (let i = 1; i <= parts.length; i++) {
      const f = parts.slice(0, i).join("/");
      if (!state.folders.includes(f)) state.folders.push(f);
    }
  });
  state.customColors = Array.isArray(meta.customColors)
    ? meta.customColors
    : [];
  state.customBacks = (meta.backs || [])
    .map((b) => ({ name: b.name, data: imgOf(b.hash) }))
    .filter((b) => b.data);
  state.confidentialMode = !!meta.confidentialMode;
  state.prefs = meta.prefs || null;
  await persistAll();
  const st = await collectState();
  state.cloudSnap = new Map(
    [...st.cardDocs].map(([id, d]) => [id, JSON.stringify(d)]),
  );
  state.cloudMetaSnap = JSON.stringify(st.meta);
  state.cloudImgs = new Set(st.images.keys());
  state.cloudReady = true;
  afterStateLoad();
  setSync("☁ Synchronisé");
}
