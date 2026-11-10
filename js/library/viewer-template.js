/**
 * Modèle de la page HTML autonome « carte 3D interactive » (une carte recto/verso + le token en pièce).
 * Même rendu que la visionneuse de l'atelier (css/viewer.css) : garder les deux synchronisés.
 * Aucune dépendance : images intégrées (data URL), CSS et JS en ligne.
 */
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * @param o { title, front, back, tokFront, tokBack } images en data URL ; clampSrc / spinnerSrc : code JS partagé
 */
export function buildViewerHtml(o) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(o.title)}</title>
<style>
:root { --cw: min(86vw, 390px, calc((100vh - 96px) * 750 / 1050)); --ts: max(120px, calc(var(--cw) * 0.55)); --thick: calc(var(--ts) * 0.075); }
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; background: radial-gradient(circle at 50% 35%, #172233, #05080d 70%); color: #c9d3e3; font-family: system-ui, "Segoe UI", Roboto, sans-serif; }
body { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 24px 12px 12px; }
.stage { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 32px 44px; }
.wrap { position: relative; perspective: 1100px; }
.card-wrap { width: var(--cw); height: calc(var(--cw) * 1.4); }
.coin-wrap { width: var(--ts); height: var(--ts); perspective: 800px; }
.v-card, .v-coin { position: absolute; inset: 0; transform-style: preserve-3d; cursor: grab; touch-action: none; user-select: none; -webkit-user-select: none; }
.v-card.grabbing, .v-coin.grabbing { cursor: grabbing; }
.v-face { position: absolute; inset: 0; border-radius: 8px; backface-visibility: hidden; -webkit-backface-visibility: hidden; box-shadow: 0 18px 44px #000c; }
.v-face img { display: block; width: 100%; height: 100%; border-radius: 8px; -webkit-user-drag: none; pointer-events: none; }
.v-card .v-face.front { transform: translateZ(0.5px); }
.v-card .v-face.back { transform: rotateY(180deg) translateZ(0.5px); visibility: hidden; }
.v-card.flipped .v-face.front, .v-coin.flipped .v-face.front { visibility: hidden; }
.v-card.flipped .v-face.back, .v-coin.flipped .v-face.back { visibility: visible; }
.v-coin .v-face.back { visibility: hidden; }
.v-coin .v-face, .v-coin .v-face img { border-radius: 50%; box-shadow: none; }
.v-coin .v-face.front { transform: translateZ(calc(var(--thick) / 2 + 0.5px)); }
.v-coin .v-face.back { transform: rotateY(180deg) translateZ(calc(var(--thick) / 2 + 0.5px)); }
.v-glare { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; background: linear-gradient(110deg, transparent calc(var(--gx, 50%) - 22%), rgba(255, 255, 255, 0.16) var(--gx, 50%), transparent calc(var(--gx, 50%) + 22%)); }
.coin-edge { position: absolute; left: 0.8%; top: 0.8%; width: 98.4%; height: 98.4%; border-radius: 50%; background: linear-gradient(135deg, #cfd5de, #6b7482 50%, #2c323b); }
.coin-edge.alt { background: linear-gradient(135deg, #9aa3b0, #434a56 50%, #20252d); }
.coin-shadow { position: absolute; left: 12%; bottom: -16px; width: 76%; height: 14px; border-radius: 50%; background: radial-gradient(#000a, transparent 70%); pointer-events: none; }
.hint { margin: 0; font-size: 12px; text-align: center; color: #8d9bb0; }
@media (prefers-reduced-motion: reduce) { .v-card, .v-coin { transition: none; } }
</style>
</head>
<body>
<main class="stage" aria-label="${esc(o.title)}">
  <div class="wrap card-wrap">
    <div class="v-card" role="img" aria-label="Carte ${esc(o.title)}, recto et verso">
      <div class="v-face front"><img src="${o.front}" alt="Recto de la carte"><div class="v-glare"></div></div>
      <div class="v-face back"><img src="${o.back}" alt="Verso de la carte"><div class="v-glare"></div></div>
    </div>
  </div>
  <div class="wrap coin-wrap">
    <div class="v-coin" role="img" aria-label="Token ${esc(o.title)}">
      <div class="v-face front"><img src="${o.tokFront}" alt="Token"><div class="v-glare"></div></div>
      <div class="v-face back"><img src="${o.tokBack}" alt="Verso du token"><div class="v-glare"></div></div>
    </div>
    <div class="coin-shadow"></div>
  </div>
</main>
<p class="hint">Glissez pour tourner la carte ou la pièce · double-clic : remettre à plat</p>
<script>
${o.clampSrc}
${o.spinnerSrc}
(function () {
  var card = document.querySelector(".v-card"), coin = document.querySelector(".v-coin");
  // épaisseur de la pièce : couches empilées entre les deux faces
  for (var i = 0; i < 16; i++) {
    var e = document.createElement("div");
    e.className = "coin-edge" + (i % 2 ? " alt" : "");
    e.style.transform = "translateZ(calc(var(--thick) * " + (i / 15 - 0.5).toFixed(4) + "))";
    coin.insertBefore(e, coin.firstChild);
  }
  function glare(node) { return function (rx, ry) { node.style.setProperty("--gx", 50 + Math.sin((ry * Math.PI) / 180) * 55 - rx * 0.6 + "%"); }; }
  spinner(card, glare(card));
  spinner(coin, glare(coin));
})();
</script>
</body>
</html>
`;
}
