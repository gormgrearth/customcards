/** Cloud : préparation/compression des images. */
import { loadImage } from "../core/utils.js";

const MAX_IMG = 900000; // Firestore : 1 Mio max par document

export const pool = async (items, n, fn) => {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        await fn(items[k], k);
      }
    }),
  );
};

const hmemo = new Map();

function hashStr(s) {
  let m = hmemo.get(s);
  if (m) return m;
  let h1 = 0xdeadbeef ^ s.length,
    h2 = 0x41c6ce57 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  m =
    "i" +
    (h2 >>> 0).toString(16).padStart(8, "0") +
    (h1 >>> 0).toString(16).padStart(8, "0") +
    s.length.toString(36);
  hmemo.set(s, m);
  return m;
}

async function shrinkImage(data) {
  const im = await loadImage(data);
  let scale = 1,
    q = 0.85;
  for (let i = 0; i < 10; i++) {
    scale *= 0.85;
    q = Math.max(0.6, q - 0.03);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(im.width * scale));
    c.height = Math.max(1, Math.round(im.height * scale));
    const x = c.getContext("2d");
    x.fillStyle = "#000";
    x.fillRect(0, 0, c.width, c.height);
    x.drawImage(im, 0, 0, c.width, c.height);
    const out = c.toDataURL("image/jpeg", q);
    if (out.length <= MAX_IMG) return out;
  }
  return null;
}

export const prepMemo = new Map();

export async function prepImage(data) {
  if (prepMemo.has(data)) return prepMemo.get(data);
  let out = data;
  if (data.length > MAX_IMG) out = await shrinkImage(data).catch(() => null);
  const r = out ? { hash: hashStr(out), data: out } : null;
  prepMemo.set(data, r);
  return r;
}
