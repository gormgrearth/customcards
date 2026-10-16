/** Glisser-déposer de l’illustration sur l’aperçu. */
import { $ } from "../core/dom.js";
import { canvas, state } from "../core/state.js";
import { drawCurrent } from "../card/form.js";
import { syncArtLabels } from "../card/art.js";

// Glisser sur l'aperçu pour déplacer ; Ctrl/⌘ + molette pour redimensionner
(() => {
  let drag = null;
  const clamp = (v) => Math.max(0, Math.min(100, v));
  canvas.addEventListener("pointerdown", (e) => {
    if (
      !state.art ||
      !state.artGeom ||
      e.pointerType === "touch" ||
      e.button !== 0
    )
      return;
    const r = canvas.getBoundingClientRect();
    drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      fx: Number($("artX").value),
      fy: Number($("artY").value),
      u: (canvas.width / r.width) * state.artGeom.k, // pixels d'écran -> unités de la carte
    };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("art-dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id || !state.artGeom) return;
    const g = state.artGeom,
      dx = (e.clientX - drag.x) * drag.u,
      dy = (e.clientY - drag.y) * drag.u;
    // left = ax + (aw - dw) * fx  =>  déplacement 1:1 avec le pointeur
    if (g.aw !== g.dw)
      $("artX").value = Math.round(clamp(drag.fx + (dx / (g.aw - g.dw)) * 100));
    if (g.ah !== g.dh)
      $("artY").value = Math.round(clamp(drag.fy + (dy / (g.ah - g.dh)) * 100));
    syncArtLabels();
    drawCurrent();
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    canvas.classList.remove("art-dragging");
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener(
    "wheel",
    (e) => {
      if (!state.art || !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const z = Number($("artZoom").value);
      $("artZoom").value = Math.max(
        50,
        Math.min(400, Math.round(z * (e.deltaY < 0 ? 1.06 : 1 / 1.06))),
      );
      syncArtLabels();
      drawCurrent();
    },
    { passive: false },
  );
})();
