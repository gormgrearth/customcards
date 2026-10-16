/** Point d’entrée : démarrage de l’application. */
import { FONTS, fw } from "./core/config.js";
import { THEMES } from "./themes/meta.js";
import { state } from "./core/state.js";
import "./card/title-hit.js";
import "./card/backs-ui.js";
import { persist } from "./core/storage.js";
import { genId } from "./core/utils.js";
import { drawCurrent, fresh } from "./card/form.js";
import "./card/art.js";
import { addCustom, persistColors } from "./card/colors.js";
import "./library/zoom.js";
import "./library/props-clipboard.js";
import { renderLibrary } from "./library/library.js";
import "./library/export.js";
import "./library/backup.js";
import { afterStateLoad, loadLocal } from "./cloud/local.js";
import { initCloud } from "./cloud/account.js";
import "./cloud/share.js";
import "./init/ui-setup.js";
import { openShared } from "./cloud/shared-view.js";
import "./init/form-events.js";
import "./init/art-drag.js";
import "./init/folder-events.js";

(async () => {
  fresh();
  await loadLocal();
  try {
    // migration de l'ancienne version (localStorage)
    const old = JSON.parse(
      localStorage.getItem("shadowrun_anarchy2_npc_cards_v1") || "null",
    );
    if (old && old.cards && !state.cards.length) {
      const th = {
        neon: "standard",
        corporate: "chrome",
        anarchy: "rue",
      };
      state.cards = old.cards.map((c) => {
        const t = th[c.style] || "standard";
        return {
          ...c,
          theme: t,
          title: THEMES[t].title,
          fontT: THEMES[t].fT,
          fontB: THEMES[t].fB,
          idOn: true,
          idStr: c.symbolicId || genId(),
          opacity: Math.max(55, c.opacity || 88),
        };
      });
      state.nextId = old.nextId || state.cards.length + 1;
      await persist();
    }
  } catch (_) {}
  {
    let ch = false;
    state.cards.forEach((x) => (ch = addCustom(x.color) || ch));
    if (ch) persistColors();
  }
  afterStateLoad();
  if (navigator.storage && navigator.storage.persist)
    navigator.storage.persist().catch(() => {});
  Promise.all(
    FONTS.map((f) => document.fonts.load(`${fw(f, 700)} 20px "${f}"`)),
  )
    .catch(() => {})
    .then(() => {
      drawCurrent();
      renderLibrary();
    });
  state.initResolve();
  initCloud();
  const qc = new URLSearchParams(location.search).get("code");
  if (qc) openShared(qc);
})();
