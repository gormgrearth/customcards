/** Édition directe sur l’aperçu (zones cliquables). */
import { $ } from "../core/dom.js";
import { H, KEYS, W, ff } from "../core/config.js";
import { state } from "../core/state.js";

const HIT_LABELS = {
  title: "le titre",
  name: "le nom",
  role: "le rôle",
  tag: "la faction / origine",
  desc: "la description",
  status: "le statut",
  idStr: "l’ID",
};

let inlineEd = null;

function closeInlineEditor() {
  if (!inlineEd) return;
  const e = inlineEd;
  inlineEd = null;
  e.remove();
}

export function renderHitZones() {
  const layer = $("hitLayer");
  if (!layer) return;
  layer.textContent = "";
  Object.entries(state.HIT).forEach(([key, r]) => {
    const x = Math.max(0, r.x),
      y = Math.max(0, r.y),
      w = Math.min(W - x, r.w),
      h = Math.min(H - y, r.h);
    if (w <= 0 || h <= 0) return;
    const z = document.createElement("div");
    z.className = "hit-zone";
    z.dataset.key = key;
    z.tabIndex = 0;
    z.setAttribute("role", "button");
    z.setAttribute("aria-label", "Modifier " + HIT_LABELS[key]);
    z.title = "Cliquer pour modifier " + HIT_LABELS[key];
    z.style.cssText =
      "left:" +
      (x / W) * 100 +
      "%;top:" +
      (y / H) * 100 +
      "%;width:" +
      (w / W) * 100 +
      "%;height:" +
      (h / H) * 100 +
      "%";
    z.onclick = () => openInlineEditor(key);
    z.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openInlineEditor(key);
      }
    };
    layer.appendChild(z);
  });
}

function openInlineEditor(key) {
  closeInlineEditor();
  const r = state.HIT[key],
    field = $(KEYS[key]),
    shell = $("hitLayer").parentElement;
  if (!r || !field) return;
  const sw = shell.clientWidth,
    sh = shell.clientHeight,
    sc = sw / W,
    isSel = field.tagName === "SELECT",
    isArea = key === "desc",
    ed = document.createElement(
      isSel ? "select" : isArea ? "textarea" : "input",
    ),
    orig = field.value;
  ed.className = "inline-editor";
  if (isSel) ed.innerHTML = field.innerHTML;
  else if (!isArea) ed.type = "text";
  ed.value = orig;
  if (field.maxLength > 0) ed.maxLength = field.maxLength;
  ed.setAttribute("aria-label", "Modifier " + HIT_LABELS[key]);
  if (key === "name") ed.placeholder = "Nouveau PNJ";
  const w = Math.min(sw - 8, Math.max(r.w * sc, isArea ? sw * 0.8 : 190)),
    h = isArea ? Math.max(r.h * sc, 96) : Math.max(r.h * sc, 34),
    l = Math.max(4, Math.min(r.x * sc, sw - w - 4)),
    t = Math.max(4, Math.min(r.y * sc, sh - h - 4));
  ed.style.cssText =
    "left:" +
    l +
    "px;top:" +
    t +
    "px;width:" +
    w +
    "px;height:" +
    h +
    "px;" +
    "font-family:" +
    ff(
      key === "title" || key === "name" ? $("fontT").value : $("fontB").value,
    ) +
    ";" +
    "font-size:" +
    Math.max(13, Math.min(20, r.h * sc * 0.55)) +
    "px;" +
    "border-color:" +
    state.color;
  const apply = () => {
    field.value = ed.value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
  };
  ed.addEventListener("input", apply);
  ed.addEventListener("change", () => {
    apply();
    if (isSel) closeInlineEditor();
  });
  ed.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      ed.value = orig;
      apply();
      closeInlineEditor();
    } else if (e.key === "Enter" && (!isArea || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      closeInlineEditor();
    }
  });
  ed.addEventListener("blur", () => {
    if (inlineEd === ed) closeInlineEditor();
  });
  shell.appendChild(ed);
  inlineEd = ed;
  ed.focus();
  if (isSel) {
    try {
      ed.showPicker && ed.showPicker();
    } catch (_) {}
  } else ed.select();
}
