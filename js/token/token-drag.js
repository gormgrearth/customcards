/** Glisser / molette sur l'aperçu du token pour cadrer son image. */
import { $ } from "../core/dom.js";
import { state, tcanvas } from "../core/state.js";
import { drawCurrent } from "../card/form.js";
import { syncTokenLabels } from "./token-ui.js";

(() => {
  let drag = null;
  const clamp = (v) => Math.max(0, Math.min(100, v));
  tcanvas.addEventListener("pointerdown", (e) => {
    if (!state.tokenGeom || e.pointerType === "touch" || e.button !== 0) return;
    const r = tcanvas.getBoundingClientRect();
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      fx: Number($("tokenX").value),
      fy: Number($("tokenY").value),
      u: (tcanvas.width / r.width) * state.tokenGeom.k, // pixels d'écran -> unités du token
    };
    tcanvas.setPointerCapture(e.pointerId);
    tcanvas.classList.add("token-dragging");
  });
  tcanvas.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id || !state.tokenGeom) return;
    const g = state.tokenGeom,
      dx = (e.clientX - drag.x) * drag.u,
      dy = (e.clientY - drag.y) * drag.u;
    if (g.aw !== g.dw)
      $("tokenX").value = Math.round(
        clamp(drag.fx + (dx / (g.aw - g.dw)) * 100),
      );
    if (g.ah !== g.dh)
      $("tokenY").value = Math.round(
        clamp(drag.fy + (dy / (g.ah - g.dh)) * 100),
      );
    syncTokenLabels();
    drawCurrent();
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    tcanvas.classList.remove("token-dragging");
  };
  tcanvas.addEventListener("pointerup", end);
  tcanvas.addEventListener("pointercancel", end);
  tcanvas.addEventListener(
    "wheel",
    (e) => {
      if (!state.tokenGeom || !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const z = Number($("tokenZoom").value);
      $("tokenZoom").value = Math.max(
        50,
        Math.min(400, Math.round(z * (e.deltaY < 0 ? 1.06 : 1 / 1.06))),
      );
      syncTokenLabels();
      drawCurrent();
    },
    { passive: false },
  );
})();
