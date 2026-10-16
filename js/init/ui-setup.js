/** Initialisation de l’interface (listes, pastilles de couleurs, dialogues). */
import { $ } from "../core/dom.js";
import { COLORS, FONT_GROUPS, ff } from "../core/config.js";
import { THEMES } from "../themes/meta.js";
import { drawCurrent } from "../card/form.js";
import { setColor, trackColor } from "../card/colors.js";

document
  .querySelectorAll("dialog [data-close]")
  .forEach((b) => (b.onclick = () => b.closest("dialog").close()));

{
  const groups = {};
  Object.entries(THEMES).forEach(([k, t]) => {
    const g =
      groups[t.cat] ||
      (groups[t.cat] = Object.assign(document.createElement("optgroup"), {
        label: t.cat,
      }));
    const o = document.createElement("option");
    o.value = k;
    o.textContent = t.label;
    g.appendChild(o);
  });
  Object.values(groups).forEach((g) => $("npcTheme").appendChild(g));
}

["fontT", "fontB"].forEach((id) =>
  FONT_GROUPS.forEach(([label, list]) => {
    const g = Object.assign(document.createElement("optgroup"), {
      label,
    });
    list.forEach((f) => {
      const o = document.createElement("option");
      o.value = o.textContent = f;
      o.style.fontFamily = ff(f);
      o.style.fontSize = "18px";
      g.appendChild(o);
    });
    $(id).appendChild(g);
  }),
);

COLORS.forEach((c) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "sw";
  b.dataset.c = c;
  b.style.background = c;
  b.title = c;
  b.setAttribute("aria-label", "Accent " + c);
  b.onclick = () => {
    setColor(c);
    drawCurrent();
  };
  $("swatches").appendChild(b);
});

const cc = document.createElement("input");

cc.type = "color";

cc.id = "customColor";

cc.title = "Couleur personnalisée";

cc.oninput = () => {
  setColor(cc.value);
  drawCurrent();
};

cc.onchange = () => trackColor(cc.value);

$("swatches").appendChild(cc);
