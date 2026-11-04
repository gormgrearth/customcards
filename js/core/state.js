/** État partagé de l’application (objet `state` mutable) + canvas d’aperçu. */
import { $ } from "./dom.js";
import { THEMES } from "../themes/meta.js";

export const canvas = $("preview");
export const pctx = canvas.getContext("2d");
export const tcanvas = $("tokenPreview");
export const tctx = tcanvas.getContext("2d");
export const imgCache = new Map();

export const state = {
  cards: [],
  nextId: 1,
  editingId: null,
  art: null,
  artData: null,
  tokenArt: null, // image distincte du token (si choisie)
  tokenArtData: null,
  tokenGeom: null, // géométrie de l'image dans l'aperçu du token (pour le glisser)
  color: THEMES.standard.color,
  customColors: [],
  confidentialMode: false,
  folders: [],
  activeFolder: "",
  copiedVisualProps: null,
  copiedVisualPropsSourceId: null,
  artGeom: null, // géométrie de l'illustration dans l'aperçu (pour le glisser-déposer)
  HIT: {}, // zones cliquables de l'aperçu (coordonnées logiques de la carte)
  titleHit: null,
  backArtData: null,
  customBacks: [],
  backLibraryMode: "styles",
  ns: "",
  // Visibilité dans la bibliothèque (état d'affichage uniquement, non sauvegardé)
  showNested: true, // afficher les cartes qui ne sont pas directement dans le dossier actif
  draggedCardId: null,
  selectMode: false, // sélection multiple dans la bibliothèque
  selectedIds: new Set(), // identifiants (texte) des cartes sélectionnées
  lastSelectedId: null,
  fauth: null,
  fdb: null,
  user: null,
  cloudReady: false,
  pushTimer: null,
  pushing: false,
  pushAgain: false,
  prefs: null,
  prefsLoaded: false,
  prefsTimer: null,
  cloudSnap: new Map(),
  cloudMetaSnap: "",
  cloudImgs: new Set(),
  initResolve: undefined,
};
