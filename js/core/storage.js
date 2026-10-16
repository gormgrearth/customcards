/** Persistance locale : IndexedDB + préférences. */
import { state } from "./state.js";
import { setStatus } from "./utils.js";
import { scheduleCloud } from "../cloud/sync.js";

const openDB = (name = state.ns) =>
  new Promise((res, rej) => {
    const r = indexedDB.open("sr_anarchy_pnj" + name, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });

export const kv = async (mode, fn, name = state.ns) => {
  const db = await openDB(name);
  return new Promise((res, rej) => {
    const t = db.transaction("kv", mode),
      q = fn(t.objectStore("kv"));
    t.oncomplete = () => {
      if (mode === "readwrite") scheduleCloud();
      res(q && q.result);
    };
    t.onerror = () => rej(t.error);
  });
};

export const persist = () =>
  kv("readwrite", (s) =>
    s.put(
      { cards: state.cards, nextId: state.nextId, folders: state.folders },
      "library",
    ),
  ).catch(() =>
    setStatus(
      "Enregistrement impossible dans ce navigateur : utilisez « Sauvegarde .json ».",
    ),
  );
