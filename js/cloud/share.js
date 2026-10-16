/** Cloud : création et gestion des partages. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { pool } from "./images.js";
import { cardDoc } from "./serialize.js";
import { openAuth } from "./account.js";

const CODE_ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const genCode = () => {
  const b = new Uint8Array(12);
  crypto.getRandomValues(b);
  const s = Array.from(b, (x) => CODE_ALPHA[x % 32]).join("");
  return s.slice(0, 4) + "-" + s.slice(4, 8) + "-" + s.slice(8);
};

export const normCode = (s) => {
  s = (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.length === 12
    ? s.slice(0, 4) + "-" + s.slice(4, 8) + "-" + s.slice(8)
    : s;
};

const shareUrl = (code) =>
  location.origin + location.pathname + "?code=" + code;

const inFolder = (c, f) =>
  !f || c.folder === f || (c.folder || "").startsWith(f + "/");

const copyText = async (t) => {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch (_) {
    prompt("Copiez ce texte :", t);
    return false;
  }
};

async function publishShare({ code, folder, label, withBacks, create }) {
  const list = state.cards.filter((c) => inFolder(c, folder));
  if (!list.length) throw new Error("Aucune carte dans ce dossier.");
  const rel = (c) =>
    !folder
      ? c.folder || ""
      : c.folder === folder
        ? ""
        : c.folder.slice(folder.length + 1);
  const docs = new Map(),
    imgs = new Map();
  for (const c of list) {
    const r = await cardDoc({ ...c, folder: rel(c) }, !withBacks);
    docs.set(String(c.id), r.doc);
    Object.entries(r.images).forEach(([h, d]) => imgs.set(h, d));
  }
  const sref = state.fdb.collection("shares").doc(code),
    FV = firebase.firestore.FieldValue;
  let old = null;
  if (create)
    await sref.set({
      ownerUid: state.user.uid,
      ownerName: state.user.displayName || "Anonyme",
      label,
      folder,
      withBacks: !!withBacks,
      count: docs.size,
      cardIds: [...docs.keys()],
      hashes: [...imgs.keys()],
      createdAt: FV.serverTimestamp(),
      updatedAt: FV.serverTimestamp(),
    });
  else {
    old = (await sref.get()).data();
    if (!old) throw new Error("Partage introuvable.");
    await sref.update({
      cardIds: [...new Set([...(old.cardIds || []), ...docs.keys()])],
      hashes: [...new Set([...(old.hashes || []), ...imgs.keys()])],
    });
  }
  await pool([...imgs], 4, async ([h, d]) => {
    await sref.collection("images").doc(h).set({ data: d });
  });
  await pool([...docs], 6, async ([id, d]) => {
    await sref.collection("cards").doc(id).set(d);
  });
  if (old) {
    await pool(
      (old.cardIds || []).filter((id) => !docs.has(id)),
      6,
      (id) => sref.collection("cards").doc(id).delete(),
    );
    await pool(
      (old.hashes || []).filter((h) => !imgs.has(h)),
      6,
      (h) => sref.collection("images").doc(h).delete(),
    );
    await sref.update({
      count: docs.size,
      cardIds: [...docs.keys()],
      hashes: [...imgs.keys()],
      label: label || old.label,
      updatedAt: FV.serverTimestamp(),
    });
  }
  return code;
}

async function revokeShare(code) {
  const sref = state.fdb.collection("shares").doc(code),
    s = await sref.get();
  if (!s.exists) return;
  const d = s.data();
  await pool(d.cardIds || [], 6, (id) =>
    sref.collection("cards").doc(id).delete(),
  );
  await pool(d.hashes || [], 6, (h) =>
    sref.collection("images").doc(h).delete(),
  );
  await sref.delete();
}

function fillShareScope() {
  const sel = $("shareScope");
  sel.innerHTML = "";
  const add = (v, t) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    sel.appendChild(o);
  };
  add("", "Toutes mes cartes (" + state.cards.length + ")");
  state.folders
    .slice()
    .sort((a, b) => a.localeCompare(b, "fr"))
    .forEach((f) =>
      add(
        f,
        "📁 " +
          f.replace(/\//g, " › ") +
          " (" +
          state.cards.filter((c) => inFolder(c, f)).length +
          ")",
      ),
    );
  sel.value = state.folders.includes(state.activeFolder)
    ? state.activeFolder
    : "";
}

async function loadMyShares() {
  const root = $("myShares");
  root.textContent = "Chargement…";
  try {
    const q = await state.fdb
      .collection("shares")
      .where("ownerUid", "==", state.user.uid)
      .get();
    const rows = q.docs
      .map((d) => ({ code: d.id, ...d.data() }))
      .sort(
        (a, b) =>
          ((b.updatedAt && b.updatedAt.seconds) || 0) -
          ((a.updatedAt && a.updatedAt.seconds) || 0),
      );
    root.innerHTML = "";
    if (!rows.length) {
      root.textContent = "Aucun partage actif.";
      return;
    }
    rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "share-row";
      const t = document.createElement("div");
      const b = document.createElement("strong");
      b.textContent = r.label || "Partage";
      t.appendChild(b);
      const info = document.createElement("div");
      info.className = "hint";
      info.textContent =
        (r.folder
          ? "📁 " + r.folder.replace(/\//g, " › ")
          : "Toutes les cartes") +
        " · " +
        (r.count || 0) +
        " carte(s)" +
        (r.withBacks ? " + versos" : "") +
        (r.updatedAt && r.updatedAt.toDate
          ? " · mis à jour le " + r.updatedAt.toDate().toLocaleString("fr-FR")
          : "");
      const code = document.createElement("div");
      code.className = "share-code";
      code.textContent = r.code;
      const act = document.createElement("div");
      act.className = "btnrow";
      act.style.marginTop = "8px";
      const mk = (txt, fn, cls) => {
        const x = document.createElement("button");
        x.type = "button";
        x.textContent = txt;
        if (cls) x.className = cls;
        x.onclick = fn;
        act.appendChild(x);
        return x;
      };
      mk("Copier le lien", async () => {
        if (await copyText(shareUrl(r.code)))
          $("shareMsg").textContent = "Lien copié.";
      });
      mk("Copier le code", async () => {
        if (await copyText(r.code)) $("shareMsg").textContent = "Code copié.";
      });
      mk("↻ Mettre à jour", async function () {
        this.disabled = true;
        $("shareMsg").textContent = "Mise à jour…";
        try {
          await publishShare({
            code: r.code,
            folder: r.folder || "",
            label: r.label,
            withBacks: r.withBacks,
          });
          $("shareMsg").textContent = "Partage mis à jour.";
          await loadMyShares();
        } catch (e) {
          console.error(e);
          $("shareMsg").textContent = "Échec : " + (e.message || e.code);
          this.disabled = false;
        }
      });
      mk(
        "Révoquer",
        async function () {
          if (
            !confirm(
              "Révoquer ce code ? Les personnes qui l’ont ne pourront plus consulter ce partage (les cartes déjà importées leur restent).",
            )
          )
            return;
          this.disabled = true;
          try {
            await revokeShare(r.code);
            await loadMyShares();
          } catch (e) {
            console.error(e);
            $("shareMsg").textContent = "Échec : " + (e.message || e.code);
            this.disabled = false;
          }
        },
        "danger",
      );
      row.append(t, info, code, act);
      root.appendChild(row);
    });
  } catch (e) {
    console.error(e);
    root.textContent =
      "Impossible de charger vos partages (" + (e.code || e.message) + ").";
  }
}

async function openShare() {
  $("shareDlg").showModal();
  const li = !!state.user;
  $("shareLogin").hidden = li;
  $("shareMain").hidden = !li;
  if (!li) return;
  fillShareScope();
  $("shareLabel").value = "";
  $("shareMsg").textContent = "";
  await loadMyShares();
}

$("shareBtn").onclick = openShare;

$("shareLoginBtn").onclick = () => {
  $("shareDlg").close();
  openAuth("login");
};

$("shareCreate").onclick = async function () {
  const folder = $("shareScope").value,
    label = (
      $("shareLabel").value.trim() ||
      (folder ? folder.split("/").pop() : "Toutes mes cartes")
    ).slice(0, 60),
    msg = $("shareMsg");
  if (!state.cards.some((c) => inFolder(c, folder))) {
    msg.textContent = "Ce dossier ne contient aucune carte.";
    return;
  }
  this.disabled = true;
  msg.textContent = "Création du partage (envoi des images)…";
  const code = genCode();
  try {
    await publishShare({
      code,
      folder,
      label,
      withBacks: $("shareBacks").checked,
      create: true,
    });
    await copyText(code);
    msg.textContent =
      "Partage créé. Code : " + code + " (copié). Lien : " + shareUrl(code);
    await loadMyShares();
  } catch (e) {
    console.error(e);
    msg.textContent = "Échec : " + (e.message || e.code);
    try {
      await revokeShare(code);
    } catch (_) {}
  } finally {
    this.disabled = false;
  }
};
