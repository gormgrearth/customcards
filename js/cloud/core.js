/** Cloud (Firebase) : état et indicateurs. */
import { $ } from "../core/dom.js";
import { state } from "../core/state.js";

export const cloudOn = !!(
  window.firebase &&
  window.FIREBASE_CONFIG &&
  window.FIREBASE_CONFIG.apiKey &&
  !/REMPLACER/i.test(window.FIREBASE_CONFIG.apiKey)
);

export const initP = new Promise((r) => (state.initResolve = r));

const syncEl = $("syncState");

export const setSync = (t, bad) => {
  syncEl.textContent = t;
  syncEl.classList.toggle("bad", !!bad);
};

export const dirtyKey = () => "pnj_dirty_" + (state.user ? state.user.uid : "");
