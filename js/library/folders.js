/** Bibliothèque : dossiers, arborescence, glisser-déposer. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { persist } from "../core/storage.js";
import { setStatus } from "../core/utils.js";
import { renderLibrary } from "./library.js";

export const hiddenSubs = new Set(); // chemins de sous-dossiers masqués

export const isUnder = (path, base) =>
  base ? path.startsWith(base + "/") : path !== "";

export function cardVisible(c) {
  const path = c.folder || "";
  if (path === state.activeFolder) return true;
  if (!isUnder(path, state.activeFolder) || !state.showNested) return false;
  const rest = state.activeFolder
    ? path.slice(state.activeFolder.length + 1)
    : path;
  let cur = state.activeFolder;
  for (const part of rest.split("/")) {
    cur = cur ? cur + "/" + part : part;
    if (hiddenSubs.has(cur)) return false;
  }
  return true;
}

function renderViewToolbar() {
  const bar = $("viewToolbar"),
    det = $("subTree"),
    tree = $("subTreeList");
  const subs = state.folders
    .filter((f) => isUnder(f, state.activeFolder))
    .sort((a, b) => a.localeCompare(b, "fr"));
  const under = state.cards.filter((c) =>
    isUnder(c.folder || "", state.activeFolder),
  );
  bar.hidden = !subs.length && !under.length;
  det.hidden = !subs.length;
  $("showNestedCards").checked = state.showNested;
  const hiddenN = under.filter((c) => !cardVisible(c)).length;
  $("viewHiddenInfo").textContent = hiddenN
    ? hiddenN + " carte(s) masquée(s)"
    : "";
  $("subTreeCount").textContent = subs.length
    ? "(" +
      subs.filter((f) => !hiddenSubs.has(f)).length +
      "/" +
      subs.length +
      ")"
    : "";
  tree.innerHTML = "";
  const baseDepth = folderDepth(state.activeFolder);
  subs.forEach((f) => {
    let ancestorHidden = false;
    for (
      let a = parentFolder(f);
      a && a !== state.activeFolder;
      a = parentFolder(a)
    )
      if (hiddenSubs.has(a)) ancestorHidden = true;
    const off = !state.showNested || ancestorHidden;
    const lab = document.createElement("label");
    if (off) lab.className = "off";
    lab.style.paddingLeft = 4 + (folderDepth(f) - baseDepth - 1) * 18 + "px";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !hiddenSubs.has(f);
    cb.disabled = off;
    cb.onchange = () => {
      if (cb.checked) hiddenSubs.delete(f);
      else hiddenSubs.add(f);
      renderLibrary();
    };
    const n = state.cards.filter((c) => (c.folder || "") === f).length;
    lab.append(cb, "📁 " + f.split("/").pop() + " (" + n + ")");
    tree.appendChild(lab);
  });
}

const parentFolder = (path) =>
  path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";

const folderDepth = (path) => (path ? path.split("/").length : 0);

export function renderFolders() {
  const filter = $("folderFilter"),
    list = $("folderList");
  filter.innerHTML = '<option value="">Toutes les cartes</option>';
  state.folders
    .slice()
    .sort((a, b) => a.localeCompare(b, "fr"))
    .forEach((name) => {
      const o = document.createElement("option");
      o.value = name;
      o.textContent =
        "　".repeat(folderDepth(name) - 1) + name.split("/").pop();
      filter.appendChild(o);
    });
  filter.value = state.folders.includes(state.activeFolder)
    ? state.activeFolder
    : "";
  state.activeFolder = filter.value;
  list.innerHTML = "";
  if (state.activeFolder) {
    const crumb = document.createElement("div");
    crumb.className = "hint";
    crumb.style.width = "100%";
    crumb.textContent = "📂 " + state.activeFolder.replace(/\//g, "  ›  ");
    const rn = document.createElement("button");
    rn.type = "button";
    rn.textContent = "✎ Renommer";
    rn.title = "Renommer le dossier affiché";
    rn.style.cssText = "margin-left:10px;padding:2px 8px;font-size:12px";
    rn.onclick = () => renameFolder(state.activeFolder);
    crumb.appendChild(rn);
    list.appendChild(crumb);
  }
  if (state.activeFolder) {
    const par = parentFolder(state.activeFolder);
    const up = document.createElement("div");
    up.className = "folder-chip folder-up";
    up.tabIndex = 0;
    up.setAttribute("role", "button");
    up.textContent =
      "⬆ Dossier parent : " + (par ? par.split("/").pop() : "racine");
    up.title =
      "Remonter vers " +
      (par ? "« " + par.replace(/\//g, " › ") + " »" : "la racine") +
      " (déposez une carte ici pour la déplacer dans ce dossier)";
    const goUp = () => {
      state.activeFolder = par;
      renderLibrary();
    };
    up.addEventListener("click", goUp);
    up.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goUp();
      }
    });
    up.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      up.classList.add("drop-target");
    });
    up.addEventListener("dragleave", () => up.classList.remove("drop-target"));
    up.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      up.classList.remove("drop-target");
      if (draggedFolder) moveDraggedFolder(par);
      else moveDraggedCard(par);
    });
    list.appendChild(up);
  }
  const all = document.createElement("div");
  all.className = "folder-chip";
  all.tabIndex = 0;
  all.setAttribute("role", "button");
  all.textContent = "📚 Toutes les cartes";
  const showAll = () => {
    state.activeFolder = "";
    renderLibrary();
  };
  all.addEventListener("click", showAll);
  all.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      showAll();
    }
  });
  all.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    all.classList.add("drop-target");
  });
  all.addEventListener("dragleave", () => all.classList.remove("drop-target"));
  all.addEventListener("drop", (e) => {
    e.preventDefault();
    all.classList.remove("drop-target");
    if (draggedFolder) moveDraggedFolder("");
    else moveDraggedCard("");
  });
  list.appendChild(all);
  const children = state.folders
    .filter((name) => parentFolder(name) === state.activeFolder)
    .sort((a, b) => a.localeCompare(b, "fr"));
  children.forEach((name) => {
    const chip = document.createElement("div");
    chip.className = "folder-chip";
    chip.dataset.folder = name;
    chip.tabIndex = 0;
    chip.setAttribute("role", "button");
    chip.draggable = true;
    chip.addEventListener("dragstart", (e) => {
      draggedFolder = name;
      chip.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "folder:" + name);
    });
    chip.addEventListener("dragend", () => {
      draggedFolder = null;
      chip.classList.remove("dragging");
      document
        .querySelectorAll(".drop-target")
        .forEach((x) => x.classList.remove("drop-target"));
    });
    const label = document.createElement("span");
    label.className = "folder-label";
    label.textContent =
      "📁 " +
      name.split("/").pop() +
      (state.folders.some((f) => parentFolder(f) === name) ? "  ›" : "");
    chip.appendChild(label);
    const open = () => {
      state.activeFolder = name;
      renderLibrary();
    };
    chip.addEventListener("click", (e) => {
      if (!e.target.closest(".folder-delete, .folder-eye, .folder-rename"))
        open();
    });
    chip.addEventListener("keydown", (e) => {
      if (
        (e.key === "Enter" || e.key === " ") &&
        !e.target.closest(".folder-delete, .folder-eye, .folder-rename")
      ) {
        e.preventDefault();
        open();
      }
    });
    const del = document.createElement("button");
    del.className = "folder-delete";
    del.textContent = "×";
    del.title = "Supprimer ce dossier et ses sous-dossiers";
    del.setAttribute("aria-label", "Supprimer le dossier " + name);
    del.onclick = (e) => {
      e.stopPropagation();
      if (
        confirm(
          "Supprimer « " +
            name +
            " » et ses sous-dossiers ? Les cartes seront déplacées vers le dossier parent.",
        )
      ) {
        const parent = parentFolder(name);
        [...hiddenSubs].forEach((h) => {
          if (h === name || h.startsWith(name + "/")) hiddenSubs.delete(h);
        });
        state.folders = state.folders.filter(
          (f) => f !== name && !f.startsWith(name + "/"),
        );
        state.cards.forEach((c) => {
          if (c.folder === name || (c.folder || "").startsWith(name + "/"))
            c.folder = parent;
        });
        if (
          state.activeFolder === name ||
          state.activeFolder.startsWith(name + "/")
        )
          state.activeFolder = parent;
        persist();
        renderLibrary();
      }
    };
    const hid = hiddenSubs.has(name);
    if (hid || !state.showNested) chip.classList.add("sub-hidden");
    const eye = document.createElement("button");
    eye.className = "folder-eye";
    eye.type = "button";
    eye.textContent = hid ? "🚫" : "👁";
    eye.title = hid
      ? "Afficher les cartes de ce sous-dossier"
      : "Masquer les cartes de ce sous-dossier";
    eye.setAttribute("aria-label", eye.title);
    eye.setAttribute("aria-pressed", String(!hid));
    eye.onclick = (e) => {
      e.stopPropagation();
      if (hid) hiddenSubs.delete(name);
      else hiddenSubs.add(name);
      renderLibrary();
    };
    const ren = document.createElement("button");
    ren.className = "folder-rename";
    ren.type = "button";
    ren.textContent = "✎";
    ren.title = "Renommer ce dossier";
    ren.setAttribute("aria-label", "Renommer le dossier " + name);
    ren.onclick = (e) => {
      e.stopPropagation();
      renameFolder(name);
    };
    chip.appendChild(ren);
    chip.appendChild(eye);
    chip.appendChild(del);
    chip.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      chip.classList.add("drop-target");
    });
    chip.addEventListener("dragleave", () =>
      chip.classList.remove("drop-target"),
    );
    chip.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      chip.classList.remove("drop-target");
      if (draggedFolder) moveDraggedFolder(name);
      else moveDraggedCard(name);
    });
    list.appendChild(chip);
  });
  renderViewToolbar();
}

let draggedFolder = null;

function moveDraggedFolder(target) {
  if (!draggedFolder) return;
  const source = draggedFolder;
  if (target === source || target.startsWith(source + "/")) {
    draggedFolder = null;
    return;
  }
  const parent = target;
  const leaf = source.split("/").pop();
  let dest = parent ? parent + "/" + leaf : leaf;
  if (dest === source) {
    draggedFolder = null;
    return;
  }
  if (
    state.folders.some(
      (f) =>
        f.toLowerCase() === dest.toLowerCase() &&
        f !== source &&
        !f.startsWith(source + "/"),
    )
  ) {
    setStatus(
      "Déplacement impossible : un dossier de ce nom existe déjà à destination.",
    );
    draggedFolder = null;
    return;
  }
  const subtree = state.folders.filter(
    (f) => f === source || f.startsWith(source + "/"),
  );
  const mapping = new Map(
    subtree.map((f) => [f, dest + f.slice(source.length)]),
  );
  state.folders = state.folders.map((f) => mapping.get(f) || f);
  [...hiddenSubs].forEach((h) => {
    if (mapping.has(h)) {
      hiddenSubs.delete(h);
      hiddenSubs.add(mapping.get(h));
    }
  });
  state.cards.forEach((c) => {
    const old = c.folder || "";
    for (const [from, to] of mapping)
      if (old === from || old.startsWith(from + "/")) {
        c.folder = to + old.slice(from.length);
        break;
      }
  });
  if (
    state.activeFolder === source ||
    state.activeFolder.startsWith(source + "/")
  )
    state.activeFolder = dest + state.activeFolder.slice(source.length);
  draggedFolder = null;
  persist();
  renderLibrary();
  setStatus("Dossier déplacé : " + dest.replace(/\//g, " › "));
}

function renameFolder(source) {
  const oldLeaf = source.split("/").pop();
  const input = prompt("Nouveau nom du dossier :", oldLeaf);
  if (input === null) return;
  const leaf = input.trim().replace(/[\\/]/g, "-").slice(0, 40);
  if (!leaf) return setStatus("Le nom du dossier ne peut pas être vide.");
  if (leaf === oldLeaf) return;
  const parent = parentFolder(source);
  const dest = parent ? parent + "/" + leaf : leaf;
  if (
    state.folders.some(
      (f) =>
        f.toLowerCase() === dest.toLowerCase() &&
        f !== source &&
        !f.startsWith(source + "/"),
    )
  )
    return setStatus(
      "Un dossier portant ce nom existe déjà à cet emplacement.",
    );
  const remap = (path) =>
    path === source || path.startsWith(source + "/")
      ? dest + path.slice(source.length)
      : path;
  state.folders = state.folders.map(remap);
  state.cards.forEach((c) => {
    if (c.folder) c.folder = remap(c.folder);
  });
  [...hiddenSubs].forEach((h) => {
    const n = remap(h);
    if (n !== h) {
      hiddenSubs.delete(h);
      hiddenSubs.add(n);
    }
  });
  state.activeFolder = remap(state.activeFolder);
  persist();
  renderLibrary();
  setStatus("Dossier renommé : " + dest.replace(/\//g, " › "));
}

export function moveDraggedCard(folder) {
  if (state.draggedCardId == null) return;
  const c = state.cards.find((x) => x.id === state.draggedCardId);
  if (c) c.folder = folder;
  state.draggedCardId = null;
  persist();
  renderLibrary();
}
