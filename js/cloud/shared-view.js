/** Cloud : consultation et import d’un partage. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { persist } from "../core/storage.js";
import { getImg, setStatus } from "../core/utils.js";
import { draw } from "../card/render.js";
import { norm } from "../card/form.js";
import { renderLibrary } from "../library/library.js";
import { pool } from "./images.js";
import { rebuildCard } from "./serialize.js";
import { normCode } from "./share.js";

let sharedView = null;

function importCards(list, label) {
  const base =
    "Partagés/" +
    String(label || "Collection")
      .replace(/[\\/]/g, "-")
      .slice(0, 40);
  const addF = (p) => {
    const parts = p.split("/");
    for (let i = 1; i <= parts.length; i++) {
      const f = parts.slice(0, i).join("/");
      if (!state.folders.includes(f)) state.folders.push(f);
    }
  };
  addF(base);
  list.forEach((c) => {
    const folder = [base, c.folder].filter(Boolean).join("/");
    addF(folder);
    const { id, ...rest } = c;
    state.cards.unshift({ ...rest, id: state.nextId++, folder });
  });
  state.activeFolder = base;
  persist();
  renderLibrary();
  setStatus(
    list.length +
      " carte(s) importée(s) dans « " +
      base.replace(/\//g, " › ") +
      " ».",
  );
}

export async function openShared(raw) {
  const dlg = $("sharedDlg");
  if (!dlg.open) dlg.showModal();
  const code = normCode(raw),
    box = $("sharedBody"),
    msg = $("sharedMsg");
  $("sharedCode").value = code;
  box.innerHTML = "";
  $("sharedImportAll").hidden = true;
  sharedView = null;
  if (!state.fdb) {
    msg.textContent = "Le cloud n’est pas configuré dans cette installation.";
    return;
  }
  if (!code) {
    msg.textContent = "Saisissez un code de partage.";
    return;
  }
  msg.textContent = "Chargement…";
  try {
    const sref = state.fdb.collection("shares").doc(code),
      s = await sref.get();
    if (!s.exists) {
      msg.textContent = "Code introuvable (ou partage révoqué).";
      return;
    }
    const info = s.data(),
      cs = await sref.collection("cards").get(),
      imgs = new Map();
    await pool(info.hashes || [], 6, async (h) => {
      const x = await sref.collection("images").doc(h).get();
      if (x.exists) imgs.set(h, x.data().data);
    });
    const list = cs.docs.map((d) =>
      norm(rebuildCard(d.data(), (h) => imgs.get(h) || null)),
    );
    sharedView = { code, info, list };
    msg.textContent =
      "« " +
      (info.label || "Partage") +
      " » — par " +
      (info.ownerName || "Anonyme") +
      " · " +
      list.length +
      " carte(s)";
    for (const c of list) {
      const tile = document.createElement("div");
      tile.className = "npc-tile";
      const mini = document.createElement("canvas");
      mini.width = 300;
      mini.height = 420;
      const nm = document.createElement("div");
      nm.className = "tile-name";
      nm.textContent = c.name;
      const f = document.createElement("div");
      f.className = "tile-folder";
      f.textContent = c.folder ? "📁 " + c.folder.replace(/\//g, " › ") : "";
      const bt = document.createElement("button");
      bt.type = "button";
      bt.textContent = "＋ Importer";
      bt.style.width = "100%";
      bt.onclick = () => {
        importCards([c], info.label);
        bt.textContent = "✓ Importée";
        bt.disabled = true;
      };
      tile.append(mini, nm, f, bt);
      box.appendChild(tile);
      getImg(c.artData).then((im) => draw(mini.getContext("2d"), c, im));
    }
    $("sharedImportAll").hidden = !list.length;
  } catch (e) {
    console.error(e);
    msg.textContent =
      "Impossible de charger ce partage (" + (e.code || e.message) + ").";
  }
}

$("sharedOpen").onclick = () => openShared($("sharedCode").value);

$("sharedCode").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    openShared($("sharedCode").value);
  }
});

$("codeBtn").onclick = () => {
  $("sharedBody").innerHTML = "";
  $("sharedMsg").textContent = "";
  $("sharedCode").value = "";
  $("sharedImportAll").hidden = true;
  sharedView = null;
  $("sharedDlg").showModal();
  $("sharedCode").focus();
};

$("sharedImportAll").onclick = () => {
  if (!sharedView) return;
  importCards(sharedView.list, sharedView.info.label);
  $("sharedDlg").close();
};

$("sharedDlg").addEventListener("close", () => {
  if (new URLSearchParams(location.search).has("code"))
    history.replaceState(null, "", location.pathname);
});
