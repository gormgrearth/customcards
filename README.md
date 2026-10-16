# Atelier de cartes PNJ — structure du projet

Application statique (GitHub Pages). Point d'entrée unique : `index.html` → `js/main.js` (modules ES).

> Les modules ES ne fonctionnent pas en `file://`. En local : `python3 -m http.server` puis http://localhost:8000

```
index.html              structure HTML + chargement des scripts
css/                    base · editor · library · backs · responsive-dialogs (ordre = cascade)
js/firebase-config.js   configuration Firebase (script classique)
js/main.js              démarrage de l'application
js/core/                dom, config, state (état partagé), storage, utils
js/themes/              meta (libellés), helpers (primitives), un fichier par catégorie, index (assemblage)
js/backs/               un fichier par dos de carte (image base64) + index
js/card/                render, form, art, colors, inline-editor, title-hit, backs-ui
js/library/             library, folders, zoom, props-clipboard, export, backup
js/cloud/               core, images, serialize, local, sync, account, share, shared-view
js/init/                ui-setup, form-events, art-drag, folder-events
```

## Où modifier quoi
- Ajouter/modifier un thème : `js/themes/meta.js` (libellé, couleur, catégorie) + `js/themes/<catégorie>.js` (dessin).
- Ajouter un dos de carte : créer `js/backs/<nom>.js` (`export default { name, data }`) et l'ajouter dans `js/backs/index.js`.
- Variables partagées entre modules : objet `state` dans `js/core/state.js` (`state.cards`, `state.folders`…).
