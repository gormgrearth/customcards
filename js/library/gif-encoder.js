/**
 * Encodeur GIF89a animé, sans dépendance.
 *  - palette globale de 256 couleurs (découpage médian) construite à partir d'images échantillons ;
 *  - tramage ordonné léger (stable d'une image à l'autre : pas de scintillement) ;
 *  - images successives réduites à la zone modifiée (fond opaque) : fichiers beaucoup plus légers ;
 *  - fond transparent possible (1 bit : bords non lissés).
 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Palette de 256 couleurs (ou 255 + une couleur transparente réservée à l'indice 255). */
export function buildPalette(samples, reserveTransparent) {
  const hist = new Uint32Array(32768);
  for (const d of samples)
    for (let i = 0; i < d.length; i += 12) {
      if (d[i + 3] < 128) continue;
      hist[((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3)]++;
    }
  const keys0 = [];
  for (let k = 0; k < 32768; k++) if (hist[k]) keys0.push(k);
  const mk = (keys) => {
    let count = 0,
      r0 = 31, r1 = 0, g0 = 31, g1 = 0, b0 = 31, b1 = 0;
    for (const k of keys) {
      const r = k >> 10,
        g = (k >> 5) & 31,
        b = k & 31;
      count += hist[k];
      if (r < r0) r0 = r;
      if (r > r1) r1 = r;
      if (g < g0) g0 = g;
      if (g > g1) g1 = g;
      if (b < b0) b0 = b;
      if (b > b1) b1 = b;
    }
    return { keys, count, rr: r1 - r0, gg: g1 - g0, bb: b1 - b0 };
  };
  const target = 256 - (reserveTransparent ? 1 : 0),
    boxes = [mk(keys0)];
  while (boxes.length < target) {
    let bi = -1,
      best = -1;
    boxes.forEach((b, i) => {
      if (b.keys.length < 2) return;
      const score = b.count * (Math.max(b.rr, b.gg, b.bb) + 1);
      if (score > best) {
        best = score;
        bi = i;
      }
    });
    if (bi < 0) break;
    const b = boxes[bi],
      ch = b.rr >= b.gg && b.rr >= b.bb ? 10 : b.gg >= b.bb ? 5 : 0,
      keys = b.keys.slice().sort((x, y) => ((x >> ch) & 31) - ((y >> ch) & 31));
    let acc = 0,
      cut = 1;
    for (let i = 0; i < keys.length - 1; i++) {
      acc += hist[keys[i]];
      if (acc >= b.count / 2) {
        cut = i + 1;
        break;
      }
    }
    boxes.splice(bi, 1, mk(keys.slice(0, cut)), mk(keys.slice(cut)));
  }
  const palette = new Uint8Array(768),
    n = boxes.length,
    ex = (v) => (v << 3) | (v >> 2);
  boxes.forEach((b, i) => {
    let r = 0, g = 0, bl = 0;
    for (const k of b.keys) {
      const c = hist[k];
      r += (k >> 10) * c;
      g += ((k >> 5) & 31) * c;
      bl += (k & 31) * c;
    }
    const t = b.count || 1;
    palette[i * 3] = ex(Math.round(r / t));
    palette[i * 3 + 1] = ex(Math.round(g / t));
    palette[i * 3 + 2] = ex(Math.round(bl / t));
  });
  const lut = new Uint8Array(32768);
  for (let k = 0; k < 32768; k++) {
    const r = ex(k >> 10),
      g = ex((k >> 5) & 31),
      b = ex(k & 31);
    let bi = 0,
      bd = Infinity;
    for (let i = 0; i < n; i++) {
      const dr = r - palette[i * 3],
        dg = g - palette[i * 3 + 1],
        db = b - palette[i * 3 + 2],
        dd = dr * dr * 2 + dg * dg * 4 + db * db * 3;
      if (dd < bd) {
        bd = dd;
        bi = i;
      }
    }
    lut[k] = bi;
  }
  return { palette, lut, transparentIndex: reserveTransparent ? 255 : -1 };
}

/** Pixels RGBA -> indices de palette (tramage ordonné). */
export function quantize(rgba, w, h, pal, out = new Uint8Array(w * h)) {
  const { lut, transparentIndex: t } = pal;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const p = y * w + x,
        i = p * 4;
      if (rgba[i + 3] < 128) {
        out[p] = t;
        continue;
      }
      const o = (BAYER[((y & 3) << 2) | (x & 3)] - 7.5) * 0.55,
        r = Math.min(255, Math.max(0, rgba[i] + o)),
        g = Math.min(255, Math.max(0, rgba[i + 1] + o)),
        b = Math.min(255, Math.max(0, rgba[i + 2] + o));
      out[p] = lut[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)];
    }
  return out;
}

/** Compression LZW du GIF (code minimal 8). Retourne les octets (sans découpage en blocs). */
function lzw(data) {
  const MIN = 8,
    clear = 1 << MIN,
    eoi = clear + 1;
  let out = new Uint8Array(Math.max(1024, data.length >> 1)),
    n = 0,
    cur = 0,
    bits = 0,
    size = MIN + 1,
    next = eoi + 1,
    dict = new Map();
  const emit = (code) => {
    cur |= code << bits;
    bits += size;
    while (bits >= 8) {
      if (n >= out.length) {
        const bigger = new Uint8Array(out.length * 2);
        bigger.set(out);
        out = bigger;
      }
      out[n++] = cur & 255;
      cur >>>= 8;
      bits -= 8;
    }
  };
  emit(clear);
  let prefix = data[0];
  for (let i = 1; i < data.length; i++) {
    const c = data[i],
      key = (prefix << 8) | c,
      hit = dict.get(key);
    if (hit !== undefined) {
      prefix = hit;
      continue;
    }
    emit(prefix);
    if (next < 4096) {
      dict.set(key, next++);
      if (next > 1 << size && size < 12) size++;
    } else {
      emit(clear);
      dict.clear();
      size = MIN + 1;
      next = eoi + 1;
    }
    prefix = c;
  }
  emit(prefix);
  emit(eoi);
  if (bits > 0) {
    if (n >= out.length) {
      const bigger = new Uint8Array(out.length + 1);
      bigger.set(out);
      out = bigger;
    }
    out[n++] = cur & 255;
  }
  return out.subarray(0, n);
}

export class GifWriter {
  /** opts : { delayCs, loop (0 = infini), transparentBg } */
  constructor(w, h, pal, { delayCs = 5, loop = 0, transparentBg = false } = {}) {
    Object.assign(this, { w, h, pal, delayCs, transparentBg, parts: [], prev: null, frames: 0 });
    const head = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, w & 255, w >> 8, h & 255, h >> 8, 0xf7, 0, 0];
    this.parts.push(Uint8Array.from(head), pal.palette);
    this.parts.push(Uint8Array.from([0x21, 0xff, 0x0b, ...[..."NETSCAPE2.0"].map((c) => c.charCodeAt(0)), 3, 1, loop & 255, loop >> 8, 0]));
  }
  _gce(disposal, transparentIdx) {
    this.parts.push(Uint8Array.from([0x21, 0xf9, 4, (disposal << 2) | (transparentIdx >= 0 ? 1 : 0), this.delayCs & 255, this.delayCs >> 8, transparentIdx >= 0 ? transparentIdx : 0, 0]));
  }
  _image(x, y, w, h, idx) {
    this.parts.push(Uint8Array.from([0x2c, x & 255, x >> 8, y & 255, y >> 8, w & 255, w >> 8, h & 255, h >> 8, 0, 8]));
    const data = lzw(idx);
    for (let i = 0; i < data.length; i += 255) {
      const chunk = data.subarray(i, Math.min(i + 255, data.length));
      this.parts.push(Uint8Array.of(chunk.length), chunk);
    }
    this.parts.push(Uint8Array.of(0));
  }
  /** Ajoute une image (indices de palette, w × h). */
  addFrame(idx) {
    const { w, h } = this,
      t = this.pal.transparentIndex;
    if (this.transparentBg) {
      this._gce(2, t);
      this._image(0, 0, w, h, idx);
    } else if (!this.prev) {
      this._gce(1, -1);
      this._image(0, 0, w, h, idx);
    } else {
      // on ne code que la zone qui a changé ; les pixels identiques deviennent « transparents »
      let x0 = w, y0 = h, x1 = -1, y1 = -1;
      const prev = this.prev;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
          if (idx[y * w + x] !== prev[y * w + x]) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
      this._gce(1, t);
      if (x1 < 0) this._image(0, 0, 1, 1, Uint8Array.of(t));
      else {
        const bw = x1 - x0 + 1,
          bh = y1 - y0 + 1,
          sub = new Uint8Array(bw * bh);
        for (let y = 0; y < bh; y++)
          for (let x = 0; x < bw; x++) {
            const p = (y + y0) * w + x + x0;
            sub[y * bw + x] = idx[p] === prev[p] ? t : idx[p];
          }
        this._image(x0, y0, bw, bh, sub);
      }
    }
    this.prev = idx.slice();
    this.frames++;
  }
  finish() {
    this.parts.push(Uint8Array.of(0x3b));
    return new Blob(this.parts, { type: "image/gif" });
  }
}
