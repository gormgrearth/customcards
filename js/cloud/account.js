/** Cloud : compte et authentification. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";
import { kv } from "../core/storage.js";
import { cloudOn, dirtyKey, initP, setSync } from "./core.js";
import { prepMemo } from "./images.js";
import { afterStateLoad, loadLocal } from "./local.js";
import { cloudPull, cloudPush } from "./sync.js";

const AUTH_ERR = {
  "auth/invalid-email": "Adresse e-mail invalide.",
  "auth/email-already-in-use": "Un compte existe déjà avec cet e-mail.",
  "auth/weak-password": "Mot de passe trop faible (6 caractères minimum).",
  "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
  "auth/user-not-found": "E-mail ou mot de passe incorrect.",
  "auth/wrong-password": "E-mail ou mot de passe incorrect.",
  "auth/too-many-requests": "Trop de tentatives, réessayez plus tard.",
  "auth/network-request-failed": "Réseau indisponible.",
  "auth/operation-not-allowed":
    "La connexion par e-mail / mot de passe n’est pas activée dans Firebase.",
  "auth/missing-password": "Saisissez un mot de passe.",
};

function updateAccountUI() {
  $("loginBtn").hidden = !cloudOn || !!state.user;
  $("logoutBtn").hidden = !cloudOn || !state.user;
  $("syncBtn").hidden = !cloudOn || !state.user;
  $("shareBtn").hidden = !cloudOn;
  $("codeBtn").hidden = !cloudOn;
  $("acctName").textContent = state.user
    ? "👤 " + (state.user.displayName || "Compte connecté")
    : "";
  if (!cloudOn) setSync("Mode local — cloud non configuré");
  else if (!state.user)
    setSync("Mode invité : données enregistrées sur cet appareil uniquement");
}

async function onAuth(u) {
  await initP;
  const prevNs = state.ns;
  state.user = u || null;
  state.cloudReady = false;
  clearTimeout(state.pushTimer);
  prepMemo.clear(); // d'abord : plus aucune synchro possible
  if (!u && prevNs) {
    // déconnexion : on vide le cache de ce compte (sans le signaler comme « modification »)
    try {
      await kv("readwrite", (s) => s.clear(), prevNs);
    } catch (_) {}
    try {
      localStorage.removeItem("pnj_dirty_" + prevNs.slice(1));
    } catch (_) {}
  }
  state.cloudSnap = new Map();
  state.cloudMetaSnap = "";
  state.cloudImgs = new Set();
  state.ns = u ? ":" + u.uid : "";
  updateAccountUI();
  await loadLocal();
  afterStateLoad();
  if (u) {
    try {
      await cloudPull();
    } catch (e) {
      console.error(e);
      setSync(
        "⚠ Cloud injoignable (" +
          (e.code || e.message) +
          ") : données locales affichées, bouton ↻ pour réessayer",
        true,
      );
    }
  }
}

export function initCloud() {
  updateAccountUI();
  if (!cloudOn) return;
  try {
    firebase.initializeApp(window.FIREBASE_CONFIG);
    state.fauth = firebase.auth();
    state.fdb = firebase.firestore();
  } catch (e) {
    console.error(e);
    setSync("⚠ Configuration Firebase invalide", true);
    return;
  }
  state.fauth.onAuthStateChanged(onAuth);
}

let authMode = "login";

function setAuthMode(m) {
  authMode = m;
  $("authTitle").textContent = m === "login" ? "Connexion" : "Créer un compte";
  $("authPseudoWrap").hidden = m !== "register";
  $("authResetWrap").hidden = m !== "login";
  $("authSubmit").textContent =
    m === "login" ? "Se connecter" : "Créer mon compte";
  $("authSwitch").textContent =
    m === "login"
      ? "Pas de compte ? En créer un"
      : "Déjà un compte ? Se connecter";
  $("authPw").autocomplete =
    m === "login" ? "current-password" : "new-password";
  $("authMsg").textContent = "";
}

export const openAuth = (m) => {
  setAuthMode(m || "login");
  $("authDlg").showModal();
};

$("loginBtn").onclick = () => openAuth("login");

$("authSwitch").onclick = (e) => {
  e.preventDefault();
  setAuthMode(authMode === "login" ? "register" : "login");
};

$("authReset").onclick = async (e) => {
  e.preventDefault();
  const email = $("authEmail").value.trim(),
    msg = $("authMsg");
  if (!email) {
    msg.textContent = "Saisissez d’abord votre e-mail ci-dessus.";
    return;
  }
  try {
    await state.fauth.sendPasswordResetEmail(email);
    msg.textContent = "E-mail de réinitialisation envoyé (pensez aux spams).";
  } catch (err) {
    msg.textContent =
      AUTH_ERR[err.code] || "Erreur : " + (err.code || err.message);
  }
};

$("authForm").onsubmit = async (e) => {
  e.preventDefault();
  const email = $("authEmail").value.trim(),
    pw = $("authPw").value,
    msg = $("authMsg");
  msg.textContent = "";
  $("authSubmit").disabled = true;
  try {
    if (authMode === "login")
      await state.fauth.signInWithEmailAndPassword(email, pw);
    else {
      const cred = await state.fauth.createUserWithEmailAndPassword(email, pw);
      const pseudo = $("authPseudo").value.trim().slice(0, 30);
      if (pseudo) await cred.user.updateProfile({ displayName: pseudo });
      updateAccountUI();
    }
    $("authPw").value = "";
    $("authDlg").close();
  } catch (err) {
    msg.textContent =
      AUTH_ERR[err.code] || "Erreur : " + (err.code || err.message);
  } finally {
    $("authSubmit").disabled = false;
  }
};

$("logoutBtn").onclick = async () => {
  let dirty = false;
  try {
    dirty = !!localStorage.getItem(dirtyKey());
  } catch (_) {}
  if (
    (dirty || !state.cloudReady) &&
    !confirm(
      "Votre bibliothèque n’est pas (ou pas entièrement) synchronisée avec le cloud : les données locales seront perdues. Se déconnecter quand même ?",
    )
  )
    return;
  try {
    localStorage.removeItem(dirtyKey());
  } catch (_) {}
  await state.fauth.signOut();
};

$("syncBtn").onclick = async () => {
  try {
    if (!state.cloudReady) await cloudPull();
    else await cloudPush();
  } catch (e) {
    console.error(e);
    setSync("⚠ Cloud injoignable", true);
  }
};
