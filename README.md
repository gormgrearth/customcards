# Atelier de cartes PNJ — structure du projet

Application statique (GitHub Pages). Point d'entrée unique : `index.html` → `js/main.js` (modules ES).

> Les modules ES ne fonctionnent pas en `file://`. En local : `python3 -m http.server` puis http://localhost:8000

```
index.html              structure HTML + chargement des scripts
css/                    base · editor · library · backs · token · selection · viewer · discord · responsive-dialogs (ordre = cascade)
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
- Sélection multiple : Ctrl / ⌘ + clic sur les cartes de la bibliothèque (Maj + clic : plage, Échap : tout désélectionner) — `js/library/selection.js`. La barre de téléchargement groupé (carte / carte confidentielle `-cfd` / token `-tkn`, ZIP via `zip.js`, `batch-export.js`) et le bandeau de l'éditeur apparaissent dès qu'une carte est sélectionnée.
- Édition groupée (`js/library/multi-edit.js`) : avec une sélection, les changements de titre, thème, couleur, anneau, cadre de l'illustration et verso faits dans l'éditeur sont appliqués à toutes les cartes sélectionnées.
- Visionneuse 3D (`js/library/card-viewer.js`, `css/viewer.css`) : le curseur reste 1,5 s sur une carte de la bibliothèque (ou clic) → carte recto/verso orientable au glisser + token en pièce épaisse orientable séparément (verso en relief métal).
- Export « carte 3D » (`js/library/viewer-export.js`, modèle dans `viewer-template.js`) : page HTML autonome (images intégrées, sans dépendance) avec la carte recto/verso et le token en pièce, à tourner à la souris ; depuis l'éditeur, la tuile (◈), la visionneuse ou l'export groupé (`-3d.html`, `-cfd-3d.html` en version confidentielle). Le code de rotation est partagé avec la visionneuse (`spinner`), le CSS est à garder synchronisé avec `css/viewer.css`.
- Export Discord (`js/library/discord-export.js`) : la carte qui tourne en GIF animé (encodeur maison `gif-encoder.js`, rendu en perspective `spin-render.js`, poids limité à 10 Mo / 50 Mo par réduction automatique de la taille) ou en vidéo MP4/WebM (`MediaRecorder`). Fenêtre accessible depuis l'éditeur, la tuile (↻) et la visionneuse ; styles dans `css/discord.css`. Discord n'affiche pas le HTML (d'où l'export image/vidéo).
- Bibliothèque d'anneaux de token : un anneau distinct par thème de carte (62) + quelques anneaux libres, dessinés par catégorie dans `js/token/rings/*.js` (outils communs : `js/token/ring-tools.js`), catalogue et lien thème → anneau dans `js/token/rings.js` (`BY_THEME`). Valeur « auto » (défaut) = anneau du thème de la carte ; tout autre choix est indépendant du thème. Les anneaux sans `accent: true` reçoivent automatiquement un liseré à la couleur de la carte. Ajouter un anneau : une entrée dans le fichier de sa catégorie (liste, fenêtre d'aperçus et export la prennent en compte).
- Noms de fichiers exportés : `card_npc_<nom>.jpg` · `card_npc_<nom>-cfd.jpg` (mode confidentiel) · `card_npc_<nom>-tkn.png` (token).
- Variables partagées entre modules : objet `state` dans `js/core/state.js` (`state.cards`, `state.folders`…).
