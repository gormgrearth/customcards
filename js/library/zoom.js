/** Zoom sur une carte. */
let zoomBackdrop = null;

function closeZoom() {
  document
    .querySelectorAll(".zoom-overlay")
    .forEach((c) => c.classList.remove("zoom-overlay"));
  document
    .querySelectorAll(".npc-tile.zoomed")
    .forEach((t) => t.classList.remove("zoomed"));
  if (zoomBackdrop) {
    zoomBackdrop.remove();
    zoomBackdrop = null;
  }
}

export function openZoom(tile, mini) {
  if (zoomBackdrop && mini.classList.contains("zoom-overlay")) return;
  closeZoom();
  zoomBackdrop = document.createElement("div");
  zoomBackdrop.className = "zoom-backdrop";
  zoomBackdrop.setAttribute("aria-label", "Fermer le zoom");
  zoomBackdrop.addEventListener("click", closeZoom);
  document.body.appendChild(zoomBackdrop);
  tile.classList.add("zoomed");
  mini.classList.add("zoom-overlay");
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeZoom();
});
