/** Fenêtre « Bibliothèque d'anneaux » : aperçus de tous les anneaux, avec l'illustration de la carte. */
import { $ } from "../core/dom.js";
import { THEMES } from "../themes/meta.js";
import { AUTO_RING, RINGS, RING_CATS, ringIdFor, themesOfRing } from "./rings.js";
import { drawToken } from "./render.js";
import { drawCurrent, read } from "../card/form.js";
import { tokenImage } from "./token-ui.js";

const SIZE = 112;

function tile(d, img, ringId, title, themes, color, selected, onPick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "ring-tile" + (selected ? " selected" : "");
  b.setAttribute("aria-pressed", String(selected));
  const cv = document.createElement("canvas");
  cv.width = cv.height = SIZE;
  drawToken(cv.getContext("2d"), { ...d, tokenRing: ringId, color }, img);
  const t = document.createElement("strong");
  t.textContent = title;
  b.append(cv, t);
  if (themes) {
    // rappel des thèmes qui proposent cet anneau, avec leur couleur
    const s = document.createElement("span");
    s.className = "ring-themes";
    const dot = document.createElement("i");
    dot.style.background = THEMES[themes[0]]?.color || color;
    s.append(dot, themes.map((k) => THEMES[k]?.label || k).join(", "));
    b.appendChild(s);
  }
  b.onclick = onPick;
  return b;
}

function build() {
  const grid = $("tokenRingGrid"),
    d = read(),
    img = tokenImage(d),
    cur = $("tokenRing").value,
    dlg = $("tokenRingDlg"),
    themed = $("ringThemeColors").checked;
  grid.textContent = "";
  const pick = (id) => () => {
    $("tokenRing").value = id;
    dlg.close();
    drawCurrent();
  };
  const head = (txt) => {
    const h = document.createElement("h3");
    h.className = "ring-cat";
    h.textContent = txt;
    grid.appendChild(h);
  };
  head("Suivre le thème de la carte");
  const sugId = ringIdFor({ ...d, tokenRing: AUTO_RING }),
    sug = RINGS[sugId];
  grid.appendChild(
    tile(d, img, AUTO_RING, "Automatique", null, d.color, cur === AUTO_RING, pick(AUTO_RING)),
  );
  const auto = grid.lastChild,
    cap = document.createElement("span");
  cap.textContent = (THEMES[d.theme]?.label || "") + " → " + sug.label;
  auto.appendChild(cap);
  RING_CATS.forEach((cat) => {
    head(cat);
    Object.entries(RINGS)
      .filter(([, r]) => r.cat === cat)
      .forEach(([id, r]) => {
        const themes = themesOfRing(id),
          color = themed && themes.length ? THEMES[themes[0]].color : d.color;
        grid.appendChild(
          tile(d, img, id, r.label, themes.length ? themes : null, color, cur === id, pick(id)),
        );
      });
  });
}

$("tokenRingOpen").onclick = () => {
  build();
  $("tokenRingDlg").showModal();
};
$("ringThemeColors").addEventListener("change", build);
