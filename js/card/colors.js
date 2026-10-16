/** Couleurs d’accent et couleurs personnalisées. */
import { $ } from "../core/dom.js";
import { COLORS } from "../core/config.js";
import { state } from "../core/state.js";
import { kv } from "../core/storage.js";
import { drawCurrent } from "./form.js";

function markPressed() {
  document
    .querySelectorAll(".sw")
    .forEach((b) =>
      b.setAttribute(
        "aria-pressed",
        b.dataset.c.toLowerCase() === state.color.toLowerCase(),
      ),
    );
}

export function setColor(c) {
  state.color = c;
  markPressed();
  $("customColor").value = c.length === 7 ? c.toLowerCase() : "#ffffff";
}

export const persistColors = () =>
  kv("readwrite", (s) => s.put(state.customColors, "customColors")).catch(
    () => {},
  );

export function addCustom(c) {
  if (!/^#[0-9a-f]{6}$/i.test(c || "")) return false;
  c = c.toUpperCase();
  if (
    COLORS.some((x) => x.toUpperCase() === c) ||
    state.customColors.includes(c)
  )
    return false;
  state.customColors.push(c);
  if (state.customColors.length > 30) state.customColors.shift();
  return true;
}

export function trackColor(c) {
  if (addCustom(c)) {
    persistColors();
    renderCustom();
  }
}

export function renderCustom() {
  const r = $("customSwatches");
  r.innerHTML = "";
  if (!state.customColors.length) {
    r.innerHTML =
      '<span class="hint">Aucune pour l\'instant : utilisez le sélecteur de couleur ci-dessus.</span>';
    return;
  }
  state.customColors.forEach((col) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sw mini";
    b.dataset.c = col;
    b.style.background = col;
    b.title = "Appliquer " + col;
    b.setAttribute("aria-label", "Appliquer " + col);
    b.onclick = () => {
      setColor(col);
      drawCurrent();
    };
    const t = document.createElement("span");
    t.textContent = col;
    const x = document.createElement("button");
    x.type = "button";
    x.className = "x";
    x.textContent = "×";
    x.title = "Retirer de la liste";
    x.setAttribute("aria-label", "Retirer " + col);
    x.onclick = () => {
      state.customColors = state.customColors.filter((v) => v !== col);
      persistColors();
      renderCustom();
    };
    chip.append(b, t, x);
    r.appendChild(chip);
  });
  markPressed();
}
