# Atelier de cartes PNJ — structure du projet

Application statique (GitHub Pages). Point d'entrée unique : `index.html` → `js/main.js` (modules ES).

> Les modules ES ne fonctionnent pas en `file://`. En local : `python3 -m http.server` puis http://localhost:8000

```
index.html              structure HTML + chargement des scripts
css/                    base · editor · library · backs · token · selection · responsive-dialogs (ordre = cascade)
js/firebase-config.js   configuration Firebase (script classique)
js/main.js              démarrage de l'application
js/core/                dom, config, state (état partagé), storage, utils
js/themes/              meta (libellés), helpers (primitives), un fichier par catégorie, index (assemblage)
js/backs/               un fichier par dos de carte (image base64) + index
js/card/                render, form, art, colors, inline-editor, title-hit, backs-ui
js/token/               rings (bibliothèque d'anneaux), ring-library (fenêtre d'aperçus), render, token-ui, token-drag
js/library/             library, folders, zoom, props-clipboard, export, backup
js/cloud/               core, images, serialize, local, sync, account, share, shared-view
js/init/                ui-setup, form-events, art-drag, folder-events
```

## Où modifier quoi
- Ajouter/modifier un thème : `js/themes/meta.js` (libellé, couleur, catégorie) + `js/themes/<catégorie>.js` (dessin).
- Ajouter un dos de carte : créer `js/backs/<nom>.js` (`export default { name, data }`) et l'ajouter dans `js/backs/index.js`.
- Sélection multiple : bouton « ☑ Sélectionner » de la bibliothèque (`js/library/selection.js`) → export groupé carte / carte confidentielle (`-cfd`) / token (`-tkn`) en ZIP (`zip.js`, sans dépendance) ou en fichiers séparés (`batch-export.js`).
- Bibliothèque d'anneaux de token : un anneau distinct par thème de carte (62) + quelques anneaux libres, dessinés par catégorie dans `js/token/rings/*.js` (outils communs : `js/token/ring-tools.js`), catalogue et lien thème → anneau dans `js/token/rings.js` (`BY_THEME`). Valeur « auto » (défaut) = anneau du thème de la carte ; tout autre choix est indépendant du thème. Les anneaux sans `accent: true` reçoivent automatiquement un liseré à la couleur de la carte. Ajouter un anneau : une entrée dans le fichier de sa catégorie (liste, fenêtre d'aperçus et export la prennent en compte).
- Noms de fichiers exportés : `card_npc_<nom>.jpg` · `card_npc_<nom>-cfd.jpg` (mode confidentiel) · `card_npc_<nom>-tkn.png` (token).
- Variables partagées entre modules : objet `state` dans `js/core/state.js` (`state.cards`, `state.folders`…).
