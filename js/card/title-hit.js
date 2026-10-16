/** Mesure l’emplacement réel du titre pendant le dessin de l’aperçu. */
import { pctx, state } from "../core/state.js";

(() => {
  // Mesure l'emplacement réel du titre (variable selon le style) pendant le dessin de l'aperçu.
  const orig = pctx.fillText;
  pctx.fillText = function (t, x, y, m) {
    if (state.titleHit && t === state.titleHit.text) {
      const mt = this.measureText(t),
        al = this.textAlign,
        x0 =
          al === "center"
            ? x - mt.width / 2
            : al === "right" || al === "end"
              ? x - mt.width
              : x,
        top = y - (mt.actualBoundingBoxAscent || 22) - 6,
        bot = y + (mt.actualBoundingBoxDescent || 6) + 6,
        l = x0 - 8,
        r = x0 + mt.width + 8,
        h = state.HIT.title;
      if (h) {
        const L = Math.min(h.x, l),
          T = Math.min(h.y, top);
        state.HIT.title = {
          x: L,
          y: T,
          w: Math.max(h.x + h.w, r) - L,
          h: Math.max(h.y + h.h, bot) - T,
        };
      } else state.HIT.title = { x: l, y: top, w: r - l, h: bot - top };
    }
    return orig.call(this, t, x, y, m);
  };
})();
