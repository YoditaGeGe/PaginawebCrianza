(() => {
  const PAGES_KEY = "crianza-pages-v2";
  const PAGE_FILE_FORMAT = "crianza-pokemon-page";
  const LEGACY_STORAGE_KEY = "crianza-cuaderno-v1";
  const LEGACY_DRAW_KEY = "crianza-dibujo-v1";
  const DEX_KEY = "crianza-dex-v3"; /* v3: eliges Bulbasaur / Charmander / Squirtle */
  const SFX_MUTE_KEY = "crianza-sfx-muted-v1";
  const POKE_LIMIT = 1025;
  const DEX_STARTERS = [1, 4, 7]; /* Bulbasaur, Charmander, Squirtle */
  const DEX_LEGENDARIES = [
    /* Kanto–Paldea legendarios / míticos principales */
    144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380,
    381, 382, 383, 384, 385, 386, 480, 481, 482, 483, 484, 485, 486, 487, 488,
    489, 490, 491, 492, 493, 494, 638, 639, 640, 641, 642, 643, 644, 645, 646,
    647, 648, 649, 716, 717, 718, 719, 720, 721, 785, 786, 787, 788, 789, 790,
    791, 792, 800, 801, 802, 807, 808, 809, 888, 889, 890, 891, 892, 893, 894,
    895, 896, 897, 898, 905, 1001, 1002, 1003, 1004, 1007, 1008, 1009, 1010,
    1014, 1015, 1016, 1017, 1020, 1021, 1022, 1023, 1024, 1025,
  ];
  const DEX_EVOLUTIONS = {
    1: 2, 2: 3, 4: 5, 5: 6, 7: 8, 8: 9, 10: 11, 11: 12, 13: 14, 14: 15, 16: 17,
    17: 18, 19: 20, 21: 22, 23: 24, 25: 26, 27: 28, 29: 30, 30: 31, 32: 33, 33: 34,
    35: 36, 37: 38, 39: 40, 41: 42, 43: 44, 44: 45, 46: 47, 48: 49, 50: 51, 52: 53,
    54: 55, 56: 57, 58: 59, 60: 61, 61: 62, 63: 64, 64: 65, 66: 67, 67: 68, 69: 70,
    70: 71, 72: 73, 74: 75, 75: 76, 77: 78, 79: 80, 81: 82, 84: 85, 86: 87, 88: 89,
    90: 91, 92: 93, 93: 94, 96: 97, 98: 99, 100: 101, 102: 103, 104: 105, 109: 110,
    111: 112, 116: 117, 118: 119, 120: 121, 129: 130, 133: 134, 138: 139, 140: 141,
    147: 148, 148: 149, 152: 153, 153: 154, 155: 156, 156: 157, 158: 159, 159: 160,
    161: 162, 163: 164, 165: 166, 167: 168, 177: 178, 179: 180, 180: 181, 183: 184,
    187: 188, 188: 189, 191: 192, 194: 195, 198: 430, 200: 429, 204: 205, 209: 210,
    215: 461, 216: 217, 220: 221, 223: 224, 228: 229, 231: 232, 246: 247, 247: 248,
    252: 253, 253: 254, 255: 256, 256: 257, 258: 259, 259: 260, 261: 262, 263: 264,
    265: 266, 266: 267, 270: 271, 271: 272, 273: 274, 274: 275, 276: 277, 278: 279,
    280: 281, 281: 282, 283: 284, 285: 286, 287: 288, 288: 289, 293: 294, 294: 295,
    296: 297, 300: 301, 304: 305, 305: 306, 307: 308, 309: 310, 316: 317, 318: 319,
    320: 321, 322: 323, 325: 326, 328: 329, 329: 330, 331: 332, 333: 334, 341: 342,
    343: 344, 345: 346, 347: 348, 353: 354, 355: 356, 361: 362, 363: 364, 364: 365,
    371: 372, 372: 373, 374: 375, 375: 376, 387: 388, 388: 389, 390: 391, 391: 392,
    393: 394, 394: 395, 495: 496, 496: 497, 498: 499, 499: 500, 501: 502, 502: 503,
    650: 651, 651: 652, 653: 654, 654: 655, 656: 657, 657: 658, 722: 723, 723: 724,
    725: 726, 726: 727, 728: 729, 729: 730, 810: 811, 811: 812, 813: 814, 814: 815,
    816: 817, 817: 818,
  };
  const API = "https://pokeapi.co/api/v2";
  const GRID = 8;
  const CARD_W = 188;
  const CARD_H = 196;
  const SHEET_W = 5000;
  const SHEET_H = 5000;
  const DRAG_THRESHOLD = 6;
  const ZOOM_MIN = 0.25;
  const ZOOM_MAX = 1.5;
  const ZOOM_STEP = 0.1;

  /* Orden como en Pokéxperto */
  const EGG_GROUPS = [
    { api: "ground", label: "Campo" },
    { api: "plant", label: "Planta" },
    { api: "bug", label: "Bicho" },
    { api: "dragon", label: "Dragón" },
    { api: "water1", label: "Agua 1" },
    { api: "water2", label: "Agua 2" },
    { api: "water3", label: "Agua 3" },
    { api: "monster", label: "Monstruo" },
    { api: "flying", label: "Volador" },
    { api: "humanshape", label: "Humanoide" },
    { api: "fairy", label: "Hada" },
    { api: "indeterminate", label: "Amorfo" },
    { api: "mineral", label: "Mineral" },
    { api: "ditto", label: "Ditto" },
    { api: "no-eggs", label: "Desconocido" },
  ];

  const EGG_LABEL = Object.fromEntries(EGG_GROUPS.map((g) => [g.api, g.label]));

  const IV_STATS = [
    { key: "hp", label: "HP" },
    { key: "atk", label: "Atk" },
    { key: "def", label: "Def" },
    { key: "spa", label: "SpA" },
    { key: "spd", label: "SpD" },
    { key: "spe", label: "Spe" },
  ];

  const NATURES = [
    "Adamant", "Brave", "Lonely", "Naughty",
    "Bold", "Impish", "Lax", "Relaxed",
    "Modest", "Mild", "Quiet", "Rash",
    "Calm", "Careful", "Gentle", "Sassy",
    "Timid", "Hasty", "Jolly", "Naive",
    "Bashful", "Docile", "Hardy", "Quirky", "Serious",
  ];

  const els = {
    list: document.getElementById("pokemon-list"),
    listStatus: document.getElementById("list-status"),
    search: document.getElementById("search"),
    eggSelect: document.getElementById("egg-group-select"),
    btnZoomIn: document.getElementById("btn-zoom-in"),
    btnZoomOut: document.getElementById("btn-zoom-out"),
    zoomLabel: document.getElementById("zoom-label"),
    empty: document.getElementById("empty-state"),
    editor: document.getElementById("editor"),
    spriteFrame: document.getElementById("sprite-frame"),
    sprite: document.getElementById("pokemon-sprite"),
    genderBadge: document.getElementById("gender-badge"),
    name: document.getElementById("pokemon-name"),
    id: document.getElementById("pokemon-id"),
    eggs: document.getElementById("pokemon-eggs"),
    btnMale: document.getElementById("btn-male"),
    btnFemale: document.getElementById("btn-female"),
    nature: document.getElementById("pokemon-nature"),
    ivsGrid: document.getElementById("ivs-grid"),
    btnSave: document.getElementById("btn-save"),
    btnClearForm: document.getElementById("btn-clear-form"),
    btnCloseEditor: document.getElementById("btn-close-editor"),
    btnClearAll: document.getElementById("btn-clear-all"),
    btnClearInk: document.getElementById("btn-clear-ink"),
    btnClearShots: document.getElementById("btn-clear-shots"),
    btnNewPage: document.getElementById("btn-new-page"),
    pagesList: document.getElementById("pages-list"),
    pageSelect: document.getElementById("page-select"),
    btnRenamePage: document.getElementById("btn-rename-page"),
    btnDeletePage: document.getElementById("btn-delete-page"),
    btnExportPage: document.getElementById("btn-export-page"),
    btnImportPage: document.getElementById("btn-import-page"),
    btnPasteCaja: document.getElementById("btn-paste-caja"),
    btnReadBox: document.getElementById("btn-read-box"),
    boxFile: document.getElementById("box-file"),
    boxModal: document.getElementById("box-modal"),
    boxDrop: document.getElementById("box-drop"),
    boxSpecies: document.getElementById("box-species"),
    boxSpeciesList: document.getElementById("box-species-list"),
    boxPerfect: document.getElementById("box-perfect"),
    boxStatus: document.getElementById("box-status"),
    boxPreview: document.getElementById("box-preview"),
    boxConfirm: document.getElementById("box-confirm"),
    btnPublishCommunity: document.getElementById("btn-publish-community"),
    btnUpdates: document.getElementById("btn-updates"),
    btnCompanion: document.getElementById("btn-companion"),
    pageImportFile: document.getElementById("page-import-file"),
    footerLogo: document.getElementById("site-footer-logo"),
    pageTitle: document.getElementById("page-title"),
    sheetScroll: document.getElementById("sheet-scroll"),
    sheet: document.getElementById("sheet"),
    canvas: document.getElementById("saved-canvas"),
    draw: document.getElementById("draw-layer"),
    treeLinks: document.getElementById("tree-links"),
    savedEmpty: document.getElementById("saved-empty"),
    breedTotal: document.getElementById("breed-total"),
    toast: document.getElementById("toast"),
    toolHint: document.getElementById("tool-hint"),
    contextMenu: document.getElementById("context-menu"),
    menuReady: document.getElementById("menu-ready"),
    menuUnite: document.getElementById("menu-unite"),
    menuDelete: document.getElementById("menu-delete"),
    tagFilter: document.getElementById("tag-filter"),
    pairBanner: document.getElementById("pair-banner"),
    breedModal: document.getElementById("breed-modal"),
    breedSteps: document.getElementById("breed-steps"),
    breedSummary: document.getElementById("breed-summary"),
    breedIvs: document.getElementById("breed-ivs"),
    breedItems: document.getElementById("breed-items"),
    breedItemsWhy: document.getElementById("breed-items-why"),
    breedMale: document.getElementById("breed-male"),
    breedFemale: document.getElementById("breed-female"),
    breedConfirm: document.getElementById("breed-confirm"),
    updatesModal: document.getElementById("updates-modal"),
    companionModal: document.getElementById("companion-modal"),
    starterModal: document.getElementById("starter-modal"),
    starterPicks: document.getElementById("starter-picks"),
    companion: document.getElementById("companion"),
    companionSprite: document.getElementById("companion-sprite"),
    companionEvoBadge: document.getElementById("companion-evo-badge"),
    companionGrid: document.getElementById("companion-grid"),
    btnCompanionHide: document.getElementById("btn-companion-hide"),
    btnDexEvolve: document.getElementById("btn-dex-evolve"),
    dexProgress: document.getElementById("dex-progress"),
    dexSearch: document.getElementById("dex-search"),
    dexActive: document.getElementById("dex-active"),
    dexToast: document.getElementById("dex-toast"),
    dexToastSprite: document.getElementById("dex-toast-sprite"),
    dexToastTitle: document.getElementById("dex-toast-title"),
    dexToastText: document.getElementById("dex-toast-text"),
    dexSpawn: document.getElementById("dex-spawn"),
    dexSpawnSprite: document.getElementById("dex-spawn-sprite"),
  };

  const drawCtx = els.draw.getContext("2d");

  let pokemonCatalog = [];
  let selectedEggGroup = null;
  let sheetZoom = 1;
  let selected = null;
  let gender = null;
  let nature = "";
  let ivs = emptyIvs();
  let store = loadStore();
  let saved = getActivePage().saved;
  let pasted = getActivePage().pasted;
  let textBoxes = getActivePage().textBoxes;
  let selectedPasteUid = null;
  let tool = "move";
  let drag = null;
  let drawing = false;
  let lastDraw = null;
  let drawingLoadToken = 0;
  let drawingReady = true;
  let menuUid = null;
  let companionState = loadDexState();
  let companionRaf = 0;
  let dexEncounterTimer = 0;
  let activeSpawn = null;
  let spawnFleeTimer = 0;
  let sfxMuted = localStorage.getItem(SFX_MUTE_KEY) === "1";
  let audioCtx = null;
  let tagFilter = "";
  let pairSourceUid = null;
  let pendingBreed = null;
  let babyGender = "female";
  let pendingDrop = null;
  let listPan = null;
  let listView = null;
  let listRangeKey = "";
  let listPaintQueued = false;
  const UNDO_LIMIT = 40;
  let undoStack = [];
  let redoStack = [];

  function snapshotBoard() {
    let drawingData = getActivePage().drawing;
    if (drawingReady) {
      try {
        drawingData = els.draw.toDataURL("image/png");
      } catch (_) {
        /* quota / tainted — keep page.drawing */
      }
    }
    return {
      saved: JSON.parse(JSON.stringify(saved)),
      pasted: JSON.parse(JSON.stringify(pasted)),
      textBoxes: JSON.parse(JSON.stringify(textBoxes)),
      drawing: drawingData,
    };
  }

  function pushUndo() {
    undoStack.push(snapshotBoard());
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
    redoStack = [];
  }

  function clearUndoHistory() {
    undoStack = [];
    redoStack = [];
  }

  function applyBoard(snap) {
    saved = JSON.parse(JSON.stringify(snap.saved || []));
    pasted = JSON.parse(JSON.stringify(snap.pasted || []));
    textBoxes = JSON.parse(JSON.stringify(snap.textBoxes || []));
    selectedPasteUid = null;
    getActivePage().drawing = snap.drawing || null;
    persist();
    loadDrawingFromPage();
    cancelUnite();
    hideMenu();
    renderSaved();
  }

  function undo() {
    if (!undoStack.length) {
      showToast("Nada que deshacer");
      return;
    }
    redoStack.push(snapshotBoard());
    applyBoard(undoStack.pop());
    showToast("Deshecho (Ctrl+Z)");
  }

  function redo() {
    if (!redoStack.length) {
      showToast("Nada que rehacer");
      return;
    }
    undoStack.push(snapshotBoard());
    applyBoard(redoStack.pop());
    showToast("Rehecho");
  }

  function emptyIvs() {
    return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  }

  function updateBreedCostPreview() {
    if (!pendingBreed) return;
    els.breedSummary.querySelector("#breed-cost").textContent = formatMoney(
      calculateBreedCost(pendingBreed.itemPlan, babyGender)
    );
    els.breedSummary.querySelector("#breed-cost-details").textContent =
      babyGender === "male" ? " + cambio de género × $500" : "";
  }

  function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[char];
    });
  }

  function createPage(name) {
    return {
      id: makeId(),
      name: name || "Nueva crianza",
      saved: [],
      pasted: [],
      textBoxes: [],
      drawing: null,
      updatedAt: new Date().toISOString(),
    };
  }

  function normalizePage(page) {
    if (!Array.isArray(page.saved)) page.saved = [];
    if (!Array.isArray(page.pasted)) page.pasted = [];
    if (!Array.isArray(page.textBoxes)) page.textBoxes = [];
    return page;
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(PAGES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.pages?.length) {
          parsed.pages.forEach(normalizePage);
          if (!parsed.pages.some((p) => p.id === parsed.activeId)) {
            parsed.activeId = parsed.pages[0].id;
          }
          return parsed;
        }
      }
    } catch {
      /* migrate below */
    }

    let legacySaved = [];
    let legacyDraw = null;
    try {
      const old = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (old) {
        const parsed = JSON.parse(old);
        if (Array.isArray(parsed)) legacySaved = parsed;
      }
      legacyDraw = localStorage.getItem(LEGACY_DRAW_KEY);
    } catch {
      /* ignore */
    }

    const first = createPage(
      legacySaved.length ? "Crianza importada" : "Crianza 1"
    );
    first.saved = legacySaved;
    first.drawing = legacyDraw;
    const next = { activeId: first.id, pages: [first] };
    try {
      localStorage.setItem(PAGES_KEY, JSON.stringify(next));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem(LEGACY_DRAW_KEY);
    } catch {
      /* quota */
    }
    return next;
  }

  function getActivePage() {
    let page = store.pages.find((p) => p.id === store.activeId);
    if (!page) {
      page = store.pages[0] || createPage("Crianza 1");
      if (!store.pages.length) store.pages.push(page);
      store.activeId = page.id;
    }
    return page;
  }

  function persist() {
    const page = getActivePage();
    page.saved = saved;
    page.pasted = pasted;
    page.textBoxes = textBoxes;
    page.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(PAGES_KEY, JSON.stringify(store));
    } catch (err) {
      console.warn(err);
      showToast("No se pudo guardar (espacio lleno). Borra fotos grandes.");
    }
  }

  function persistDrawing() {
    const page = getActivePage();
    /* No pisar el dibujo guardado con un lienzo vacío a medias de cargar. */
    if (!drawingReady) return;
    try {
      page.drawing = els.draw.toDataURL("image/png");
      page.updatedAt = new Date().toISOString();
      localStorage.setItem(PAGES_KEY, JSON.stringify(store));
    } catch (err) {
      console.warn("No se pudo guardar el dibujo", err);
      showToast("El dibujo es muy grande para guardar");
    }
  }

  function loadDrawingFromPage() {
    const token = ++drawingLoadToken;
    const page = getActivePage();
    const data = page.drawing;
    drawCtx.clearRect(0, 0, SHEET_W, SHEET_H);

    if (!data) {
      drawingReady = true;
      return;
    }

    drawingReady = false;
    const img = new Image();
    img.onload = () => {
      if (token !== drawingLoadToken) return;
      drawCtx.clearRect(0, 0, SHEET_W, SHEET_H);
      drawCtx.drawImage(img, 0, 0);
      drawingReady = true;
    };
    img.onerror = () => {
      if (token !== drawingLoadToken) return;
      drawingReady = true;
      console.warn("No se pudo restaurar el dibujo de la página");
    };
    img.src = data;
  }

  function clearDrawing(silent = false) {
    if (!silent) pushUndo();
    drawingLoadToken += 1;
    drawingReady = true;
    drawCtx.clearRect(0, 0, SHEET_W, SHEET_H);
    getActivePage().drawing = null;
    persist();
    if (!silent) showToast("Tinta borrada");
  }

  function syncPageTitle() {
    if (els.pageTitle) {
      els.pageTitle.textContent = getActivePage().name;
    }
  }

  function renderPages() {
    if (!els.pageSelect) return;
    const prev = store.activeId;
    els.pageSelect.innerHTML = "";
    for (const page of store.pages) {
      const opt = document.createElement("option");
      opt.value = page.id;
      const meta = `${page.saved.length} Pokémon`;
      opt.textContent = `${page.name} · ${meta}`;
      opt.title = `${page.name} · ${page.saved.length} Pokémon · ${page.pasted.length} fotos · ${page.textBoxes.length} notas`;
      els.pageSelect.appendChild(opt);
    }
    els.pageSelect.value = prev;
    if (els.pageSelect.value !== prev && store.pages[0]) {
      els.pageSelect.value = store.pages[0].id;
    }
    if (els.btnDeletePage) {
      els.btnDeletePage.disabled = store.pages.length <= 1;
    }
    syncPageTitle();
  }

  function buildActivePagePayload() {
    persistDrawing();
    persist();
    const page = getActivePage();
    return {
      format: PAGE_FILE_FORMAT,
      version: 1,
      exportedAt: new Date().toISOString(),
      page: JSON.parse(JSON.stringify(page)),
    };
  }

  function exportActivePage() {
    const payload = buildActivePagePayload();
    const page = payload.page;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = page.name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "pagina-crianza";
    link.href = url;
    link.download = `${filename}.crianza.json`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 1000);
    showToast(`Página "${page.name}" exportada`);
  }

  function publishActivePageToCommunity() {
    showToast("La publicación en comunidad no está disponible");
  }

  function importCommunityPayload(data) {
    const imported = validateImportedPage(data);
    if (typeof data.drawingUrl === "string" && data.drawingUrl && !imported.drawing) {
      /* Dibujo alojado en Storage: se carga al final. */
      imported._remoteDrawingUrl = data.drawingUrl;
    }
    persistDrawing();
    persist();
    store.pages.push(imported);
    store.activeId = imported.id;
    saved = imported.saved;
    pasted = imported.pasted;
    textBoxes = imported.textBoxes;
    selectedPasteUid = null;
    clearUndoHistory();
    cancelUnite();
    hideMenu();
    loadDrawingFromPage();
    if (imported._remoteDrawingUrl) {
      const url = imported._remoteDrawingUrl;
      delete imported._remoteDrawingUrl;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        drawCtx.clearRect(0, 0, SHEET_W, SHEET_H);
        drawCtx.drawImage(img, 0, 0);
        drawingReady = true;
        persistDrawing();
      };
      img.src = url;
    }
    renderSaved();
    persist();
    showToast(`Crianza de comunidad: "${imported.name}"`);
  }

  function eggGroupsFromImport(entry) {
    const listed = Array.isArray(entry.eggGroups)
      ? entry.eggGroups.filter((group) => typeof group === "string").slice(0, 20)
      : [];
    if (listed.length) return listed;
    const cat = pokemonCatalog.find((poke) => poke.id === entry.id || poke.name === entry.name);
    return cat?.eggGroups?.length ? [...cat.eggGroups] : [];
  }

  function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function importedPosition(value, max) {
    if (!Number.isFinite(value)) throw new Error("La página contiene una posición no válida");
    return Math.max(0, Math.min(max, value));
  }

  function validateImportedPage(data) {
    if (
      !isRecord(data) ||
      data.format !== PAGE_FILE_FORMAT ||
      data.version !== 1 ||
      !isRecord(data.page)
    ) {
      throw new Error("El archivo no es una página compatible de Crianza Pokémon");
    }

    const source = data.page;
    if (
      typeof source.name !== "string" ||
      !Array.isArray(source.saved) ||
      !Array.isArray(source.pasted) ||
      !Array.isArray(source.textBoxes) ||
      (source.drawing != null &&
        (typeof source.drawing !== "string" ||
          !/^data:image\/png;base64,[a-z\d+/=]+$/i.test(source.drawing)))
    ) {
      throw new Error("El archivo de página está incompleto o tiene datos no válidos");
    }

    const page = createPage(source.name.trim().slice(0, 80) || "Página importada");
    const uidMap = new Map();
    page.saved = source.saved.map((entry) => {
      if (
        !isRecord(entry) ||
        !Number.isInteger(entry.id) ||
        entry.id < 1 ||
        entry.id > POKE_LIMIT ||
        typeof entry.name !== "string" ||
        !["male", "female"].includes(entry.gender) ||
        typeof entry.sprite !== "string" ||
        entry.sprite !== spriteUrl(entry.id) ||
        !isRecord(entry.ivs) ||
        IV_STATS.some(
          ({ key }) =>
            !Number.isInteger(entry.ivs[key]) ||
            entry.ivs[key] < 0 ||
            entry.ivs[key] > 31
        )
      ) {
        throw new Error("El archivo contiene un Pokémon guardado no válido");
      }

      const ivValues = Object.fromEntries(
        IV_STATS.map(({ key }) => [key, entry.ivs[key]])
      );
      const imported = {
        uid: makeId(),
        id: entry.id,
        name: entry.name.slice(0, 100),
        sprite: entry.sprite,
        gender: entry.gender,
        nature: typeof entry.nature === "string" ? entry.nature.slice(0, 40) : "",
        eggGroups: eggGroupsFromImport(entry),
        ivs: ivValues,
        x: importedPosition(entry.x, SHEET_W - CARD_W),
        y: importedPosition(entry.y, SHEET_H - CARD_H),
        isBaby: entry.isBaby === true,
        createdAt:
          typeof entry.createdAt === "string"
            ? entry.createdAt
            : new Date().toISOString(),
      };
      if (typeof entry.uid === "string") {
        uidMap.set(entry.uid, imported.uid);
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entry.uid)) {
          imported.gameUid = entry.uid;
        }
      }
      if (typeof entry.parents === "string") imported.parents = entry.parents.slice(0, 200);
      if (isRecord(entry.heldPlan)) {
        imported.heldPlan = {
          male: typeof entry.heldPlan.male === "string" ? entry.heldPlan.male.slice(0, 80) : "",
          female: typeof entry.heldPlan.female === "string" ? entry.heldPlan.female.slice(0, 80) : "",
        };
      }
      if (Number.isFinite(entry.breedCost) && entry.breedCost >= 0) {
        imported.breedCost = Math.min(entry.breedCost, 1000000);
      }
      if (entry.ready === true) imported.ready = true;
      if (
        Number.isInteger(entry.level) &&
        entry.level >= 1 &&
        entry.level <= 100
      ) {
        imported.level = entry.level;
      }
      if (Array.isArray(entry.parentUids)) {
        imported._parentUids = entry.parentUids
          .filter((uid) => typeof uid === "string")
          .slice(0, 2);
      }
      return imported;
    });
    page.saved.forEach((imported) => {
      if (!imported._parentUids) return;
      const mapped = imported._parentUids
        .map((uid) => uidMap.get(uid))
        .filter(Boolean);
      if (mapped.length === 2) imported.parentUids = mapped;
      delete imported._parentUids;
    });

    page.pasted = source.pasted.map((shot) => {
      if (
        !isRecord(shot) ||
        typeof shot.src !== "string" ||
        !/^data:image\/(jpeg|png|webp);base64,[a-z\d+/=]+$/i.test(shot.src)
      ) {
        throw new Error("El archivo contiene una imagen no válida");
      }
      return {
        uid: makeId(),
        src: shot.src,
        width: Number.isFinite(shot.width) ? Math.max(1, Math.min(520, shot.width)) : 320,
        height: Number.isFinite(shot.height) ? Math.max(1, Math.min(520, shot.height)) : 240,
        x: importedPosition(shot.x, SHEET_W - 520),
        y: importedPosition(shot.y, SHEET_H - 520),
      };
    });

    page.textBoxes = source.textBoxes.map((textBox) => {
      if (!isRecord(textBox) || typeof textBox.text !== "string") {
        throw new Error("El archivo contiene una nota no válida");
      }
      return {
        uid: makeId(),
        x: importedPosition(textBox.x, SHEET_W - 160),
        y: importedPosition(textBox.y, SHEET_H - 80),
        width: Number.isFinite(textBox.width)
          ? Math.max(160, Math.min(800, textBox.width))
          : 240,
        text: textBox.text.slice(0, 20000),
      };
    });
    page.drawing = source.drawing;
    return page;
  }

  function readCrianzaPages(data) {
    if (isRecord(data) && data.format === "crianza-pokemon-pages" && data.version === 1 && Array.isArray(data.pages)) {
      if (!data.pages.length) throw new Error("El archivo no trae cajas");
      return data.pages.map((page) =>
        validateImportedPage({ format: PAGE_FILE_FORMAT, version: 1, page })
      );
    }
    return [validateImportedPage(data)];
  }

  function mergeImportedPage(imported) {
    const gameUids = imported.saved.map((entry) => entry.gameUid).filter(Boolean);
    if (!gameUids.length) {
      store.pages.push(imported);
      return { target: imported, created: true, added: imported.saved.length, updated: 0 };
    }
    const known = new Set(gameUids);
    let target = store.pages.find((page) =>
      page.saved.some((entry) => entry.gameUid && known.has(entry.gameUid))
    );
    if (!target) target = store.pages.find((page) => page.name === imported.name);
    if (!target) {
      store.pages.push(imported);
      return { target: imported, created: true, added: imported.saved.length, updated: 0 };
    }
    const byGame = new Map(
      target.saved.filter((entry) => entry.gameUid).map((entry) => [entry.gameUid, entry])
    );
    let added = 0;
    let updated = 0;
    for (const entry of imported.saved) {
      const existing = entry.gameUid ? byGame.get(entry.gameUid) : null;
      if (!existing) {
        target.saved.push(entry);
        if (entry.gameUid) byGame.set(entry.gameUid, entry);
        added++;
        continue;
      }
      existing.id = entry.id;
      existing.name = entry.name;
      existing.sprite = entry.sprite;
      existing.gender = entry.gender;
      existing.nature = entry.nature;
      if (entry.eggGroups.length) existing.eggGroups = entry.eggGroups;
      existing.ivs = entry.ivs;
      if (entry.level) existing.level = entry.level;
      updated++;
    }
    target.updatedAt = new Date().toISOString();
    return { target, created: false, added, updated };
  }

  function applyCrianzaDocument(data) {
    const pages = readCrianzaPages(data);
    persistDrawing();
    persist();
    let added = 0;
    let updated = 0;
    let created = 0;
    let last = null;
    for (const imported of pages) {
      const result = mergeImportedPage(imported);
      added += result.added;
      updated += result.updated;
      if (result.created) created++;
      last = result.target;
    }
    store.activeId = last.id;
    const page = normalizePage(last);
    saved = page.saved;
    pasted = page.pasted;
    textBoxes = page.textBoxes;
    selectedPasteUid = null;
    clearUndoHistory();
    cancelUnite();
    hideMenu();
    loadDrawingFromPage();
    renderSaved();
    renderPages();
    persist();
    const parts = [];
    if (created) parts.push(created === 1 ? "1 página nueva" : `${created} páginas nuevas`);
    if (added) parts.push(added === 1 ? "1 Pokémon nuevo" : `${added} Pokémon nuevos`);
    if (updated) parts.push(updated === 1 ? "1 actualizado" : `${updated} actualizados`);
    showToast(parts.join(" · ") || `Página "${last.name}" lista`);
  }

  async function pasteCajaFromClipboard() {
    let text = "";
    try {
      text = (await navigator.clipboard.readText()).trim();
    } catch {
      showToast("No pude leer el portapapeles. Copia la caja en el juego y pulsa Ctrl+V.");
      return;
    }
    if (!text.startsWith("{") || !text.includes("crianza-pokemon-page")) {
      showToast("Primero copia la caja en el PC, con el botón Copiar caja o la tecla K.");
      return;
    }
    try {
      applyCrianzaDocument(JSON.parse(text));
    } catch (error) {
      console.error("No se pudo pegar la caja", error);
      showToast(error instanceof SyntaxError ? "El portapapeles no contiene JSON válido" : error.message);
    }
  }

  async function importPageFile(file) {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      showToast("El archivo supera el máximo de 100 MB");
      return;
    }
    try {
      applyCrianzaDocument(JSON.parse(await file.text()));
    } catch (error) {
      console.error("No se pudo importar la página", error);
      showToast(error instanceof SyntaxError ? "El archivo no contiene JSON válido" : error.message);
    } finally {
      els.pageImportFile.value = "";
    }
  }

  function switchPage(pageId) {
    if (pageId === store.activeId) return;
    /* Guarda la tinta de la página actual antes de cambiar. */
    if (drawing) {
      drawing = false;
      lastDraw = null;
    }
    persistDrawing();
    persist();
    store.activeId = pageId;
    const page = normalizePage(getActivePage());
    saved = page.saved;
    pasted = page.pasted;
    textBoxes = page.textBoxes;
    selectedPasteUid = null;
    clearUndoHistory();
    cancelUnite();
    hideMenu();
    loadDrawingFromPage();
    renderSaved();
    /* No llamar persistDrawing aquí: el lienzo puede estar vacío mientras carga. */
    persist();
    renderPages();
    showToast(`Página: ${getActivePage().name}`);
  }

  function addPage() {
    const name = prompt(
      "Nombre de la nueva página (ej. Dratini 6x31)",
      `Crianza ${store.pages.length + 1}`
    );
    if (name === null) return;
    if (drawing) {
      drawing = false;
      lastDraw = null;
    }
    persistDrawing();
    persist();
    const page = createPage(name.trim() || `Crianza ${store.pages.length + 1}`);
    store.pages.push(page);
    store.activeId = page.id;
    saved = page.saved;
    pasted = page.pasted;
    textBoxes = page.textBoxes;
    selectedPasteUid = null;
    clearUndoHistory();
    cancelUnite();
    hideMenu();
    drawingLoadToken += 1;
    drawingReady = true;
    drawCtx.clearRect(0, 0, SHEET_W, SHEET_H);
    renderSaved();
    persist();
    renderPages();
    showToast(`Página creada: ${page.name}`);
  }

  function renamePage(pageId) {
    const page = store.pages.find((p) => p.id === pageId);
    if (!page) return;
    const name = prompt("Nuevo nombre", page.name);
    if (name === null) return;
    page.name = name.trim() || page.name;
    page.updatedAt = new Date().toISOString();
    persist();
    renderPages();
  }

  function deletePage(pageId) {
    if (store.pages.length <= 1) {
      showToast("Debe quedar al menos una página");
      return;
    }
    const page = store.pages.find((p) => p.id === pageId);
    if (!page) return;
    if (!confirm(`¿Eliminar la página "${page.name}"?`)) return;

    if (store.activeId === pageId) {
      if (drawing) {
        drawing = false;
        lastDraw = null;
      }
      persistDrawing();
    }

    store.pages = store.pages.filter((p) => p.id !== pageId);
    if (store.activeId === pageId) {
      store.activeId = store.pages[0].id;
      const next = normalizePage(getActivePage());
      saved = next.saved;
      pasted = next.pasted;
      textBoxes = next.textBoxes;
      selectedPasteUid = null;
      clearUndoHistory();
      loadDrawingFromPage();
      renderSaved();
    }
    persist();
    renderPages();
    showToast("Página eliminada");
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.remove("hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => els.toast.classList.add("hidden"), 2400);
  }

  function padId(id) {
    return String(id).padStart(3, "0");
  }

  function spriteUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  /* GIF animado B/N (ciclo de caminar en sitio). Gen 1–5 tienen; luego cae a estático. */
  function companionWalkUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
  }

  function companionShowdownWalkUrl(name) {
    const slug = String(name || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "");
    if (!slug) return "";
    /* Ani lateral Showdown: se ve más “de caminar” que el idle con salto. */
    return `https://play.pokemonshowdown.com/sprites/gen5ani/${slug}.gif`;
  }

  function emptyDexState() {
    return {
      id: null,
      hidden: true,
      x: 80,
      y: 80,
      breeds: 0,
      lastEncounterAt: 0,
      starterChosen: false,
      caught: {},
    };
  }

  function loadDexState() {
    try {
      const raw = localStorage.getItem(DEX_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        const caught = data.caught && typeof data.caught === "object" ? data.caught : {};
        const starterChosen =
          data.starterChosen === true || Object.keys(caught).length > 0;
        const id = Number(data.id) || Number(Object.keys(caught)[0]) || null;
        return {
          id: id ? Math.max(1, Math.min(POKE_LIMIT, id)) : null,
          hidden: starterChosen ? data.hidden === true : true,
          x: Number.isFinite(data.x) ? data.x : 80,
          y: Number.isFinite(data.y) ? data.y : 80,
          breeds: Number.isFinite(data.breeds) ? data.breeds : 0,
          lastEncounterAt: Number(data.lastEncounterAt) || 0,
          starterChosen,
          caught,
        };
      }
    } catch (_) {
      /* ignore */
    }
    return emptyDexState();
  }

  function needsStarterChoice() {
    return !companionState.starterChosen || !companionState.id;
  }

  function openStarterModal() {
    if (!els.starterModal || !els.starterPicks) return;
    const names = { 1: "bulbasaur", 4: "charmander", 7: "squirtle" };
    els.starterPicks.innerHTML = DEX_STARTERS.map((id) => {
      const name = pokeName(id) !== `#${padId(id)}` ? pokeName(id) : names[id];
      return `
        <button type="button" class="starter-pick" data-starter="${id}" role="option">
          <img src="${escapeHtml(spriteUrl(id))}" alt="" width="72" height="72" />
          <span>${escapeHtml(capitalize(name))}</span>
        </button>`;
    }).join("");
    els.starterModal.classList.remove("hidden");
    els.starterModal.setAttribute("aria-hidden", "false");
  }

  function closeStarterModal() {
    els.starterModal?.classList.add("hidden");
    els.starterModal?.setAttribute("aria-hidden", "true");
  }

  function chooseStarter(id) {
    if (!DEX_STARTERS.includes(id)) return;
    companionState.id = id;
    companionState.hidden = false;
    companionState.starterChosen = true;
    companionState.caught = {
      [id]: {
        id,
        at: new Date().toISOString(),
        source: "starter",
      },
    };
    persistCompanionState();
    closeStarterModal();
    renderCompanion();
    playCatchSfx(false);
    showDexCatchToast(id, "caught");
    showToast(`Inicial: ${capitalize(pokeName(id))}`);
  }

  function allPokeIds() {
    if (pokemonCatalog.length) {
      return pokemonCatalog.map((p) => p.id);
    }
    return Array.from({ length: POKE_LIMIT }, (_, i) => i + 1);
  }

  function isLegendaryId(id) {
    return DEX_LEGENDARIES.includes(id);
  }

  function persistCompanionState() {
    try {
      localStorage.setItem(DEX_KEY, JSON.stringify(companionState));
    } catch (_) {
      /* ignore */
    }
  }

  function dexCaughtCount() {
    return Object.keys(companionState.caught || {}).length;
  }

  function dexPoolSize() {
    return pokemonCatalog.length || POKE_LIMIT;
  }

  function isCaught(id) {
    return Boolean(companionState.caught?.[String(id)]);
  }

  function pokeName(id) {
    return pokemonCatalog.find((p) => p.id === id)?.name || `#${padId(id)}`;
  }

  function setCompanionSprite(id) {
    if (!els.companionSprite || !els.companion) return;
    const poke = pokemonCatalog.find((p) => p.id === id);
    const name = poke?.name || "";
    /* Primero GIF B/N animado (pies/cuerpo en ciclo); sin rebote CSS. */
    const sources = [
      companionWalkUrl(id),
      companionShowdownWalkUrl(name),
      spriteUrl(id),
    ].filter(Boolean);
    let index = 0;

    els.companionSprite.onload = null;
    els.companionSprite.onerror = () => {
      index += 1;
      if (index < sources.length) {
        els.companionSprite.src = sources[index];
        return;
      }
      els.companionSprite.onerror = null;
    };
    els.companionSprite.src = sources[0];
    els.companionSprite.alt = name || `Pokémon #${id}`;
    els.companion.setAttribute(
      "title",
      `${capitalize(name || "Mascota")} · clic para abrir Pokédex`
    );
  }

  function viewToSheet(n) {
    return n / sheetZoom;
  }

  function companionBounds() {
    const size = 80;
    const pad = 8;
    const scroll = els.sheetScroll;
    if (!scroll) {
      return { minX: pad, maxX: 400, y: 200, size };
    }
    /* Solo el borde inferior visible del cuaderno (eje X). */
    const minX = viewToSheet(scroll.scrollLeft) + pad;
    const maxX = Math.max(
      minX + size,
      viewToSheet(scroll.scrollLeft + scroll.clientWidth) - size - pad
    );
    const y = viewToSheet(scroll.scrollTop + scroll.clientHeight) - size - 4;
    return { minX, maxX, y, size };
  }

  function renderCompanion() {
    if (!els.companion) return;
    if (needsStarterChoice() || companionState.hidden || !companionState.id) {
      els.companion.classList.add("hidden");
      els.companion.classList.remove("can-evolve");
      els.companionEvoBadge?.classList.add("hidden");
      if (companionRaf) {
        cancelAnimationFrame(companionRaf);
        companionRaf = 0;
      }
      return;
    }
    els.companion.classList.remove("hidden");
    setCompanionSprite(companionState.id);
    const ready = canEvolveActive();
    els.companion.classList.toggle("can-evolve", ready);
    els.companionEvoBadge?.classList.toggle("hidden", !ready);
    els.companion.setAttribute(
      "title",
      ready
        ? `${capitalize(pokeName(companionState.id))} puede evolucionar · clic`
        : `${capitalize(pokeName(companionState.id))} · clic para Pokédex`
    );
    const bounds = companionBounds();
    companionState.x = Math.max(bounds.minX, Math.min(bounds.maxX, companionState.x));
    companionState.y = bounds.y;
    els.companion.style.left = `${companionState.x}px`;
    els.companion.style.top = `${companionState.y}px`;
    startCompanionWalk();
  }

  function startCompanionWalk() {
    if (!els.companion || companionState.hidden) return;
    if (companionRaf) cancelAnimationFrame(companionRaf);
    let dirX = 1;
    let last = performance.now();
    const speed = 52; /* px/s */

    const step = (now) => {
      if (companionState.hidden || !els.companion) {
        companionRaf = 0;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const bounds = companionBounds();
      companionState.x += dirX * speed * dt;
      companionState.y = bounds.y;
      if (companionState.x >= bounds.maxX) {
        companionState.x = bounds.maxX;
        dirX = -1;
      } else if (companionState.x <= bounds.minX) {
        companionState.x = bounds.minX;
        dirX = 1;
      }
      /* Sin salto: solo desliza en X y voltea el GIF animado. */
      els.companion.style.left = `${companionState.x}px`;
      els.companion.style.top = `${companionState.y}px`;
      els.companion.style.transform = `scaleX(${dirX})`;
      companionRaf = requestAnimationFrame(step);
    };
    companionRaf = requestAnimationFrame(step);
  }

  function cardAnchor(entry) {
    return {
      x: (entry.x || 0) + CARD_W / 2,
      y: (entry.y || 0) + CARD_H / 2,
    };
  }

  function renderBreedLinks() {
    if (!els.treeLinks) return;
    const byUid = new Map(saved.map((entry) => [entry.uid, entry]));
    const parts = [];

    for (const baby of saved) {
      if (!Array.isArray(baby.parentUids) || baby.parentUids.length < 2) continue;
      const parentA = byUid.get(baby.parentUids[0]);
      const parentB = byUid.get(baby.parentUids[1]);
      if (!parentA || !parentB) continue;

      const a = cardAnchor(parentA);
      const b = cardAnchor(parentB);
      const c = cardAnchor(baby);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;

      parts.push(
        `<line class="tree-link tree-link--pair" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />`,
        `<line class="tree-link" x1="${a.x}" y1="${a.y}" x2="${midX}" y2="${midY}" />`,
        `<line class="tree-link" x1="${b.x}" y1="${b.y}" x2="${midX}" y2="${midY}" />`,
        `<line class="tree-link" x1="${midX}" y1="${midY}" x2="${c.x}" y2="${c.y}" marker-end="url(#tree-arrow)" />`
      );
    }

    els.treeLinks.innerHTML = parts.join("");
  }

  function openUpdatesModal() {
    els.updatesModal?.classList.remove("hidden");
    els.updatesModal?.setAttribute("aria-hidden", "false");
  }

  function closeUpdatesModal() {
    els.updatesModal?.classList.add("hidden");
    els.updatesModal?.setAttribute("aria-hidden", "true");
  }

  function openCompanionModal() {
    if (needsStarterChoice()) {
      openStarterModal();
      return;
    }
    renderDexPanel();
    els.companionModal?.classList.remove("hidden");
    els.companionModal?.setAttribute("aria-hidden", "false");
  }

  function closeCompanionModal() {
    els.companionModal?.classList.add("hidden");
    els.companionModal?.setAttribute("aria-hidden", "true");
  }

  function playCatchSfx(legendary = false) {
    if (legendary) {
      [392, 523, 659, 784].forEach((freq, i) => {
        setTimeout(() => playBeep({ freq, duration: 0.07, gain: 0.04 }), i * 70);
      });
      return;
    }
    playBeep({ freq: 500, duration: 0.05, gain: 0.035 });
    setTimeout(() => playBeep({ freq: 700, duration: 0.08, gain: 0.04 }), 60);
  }

  function playAppearSfx(legendary = false) {
    playBeep({
      freq: legendary ? 620 : 440,
      duration: 0.06,
      gain: 0.03,
    });
  }

  function playFleeSfx() {
    playBeep({ freq: 280, duration: 0.08, gain: 0.028 });
  }

  function showDexCatchToast(id, kind) {
    const name = pokeName(id);
    if (els.dexToastSprite) els.dexToastSprite.src = spriteUrl(id);
    if (els.dexToastTitle) {
      els.dexToastTitle.textContent =
        kind === "legendary"
          ? "¡Legendario!"
          : kind === "evolve"
            ? "¡Evolución!"
            : kind === "appear"
              ? "¡Salvaje!"
              : "¡Atrapado!";
    }
    if (els.dexToastText) {
      els.dexToastText.textContent =
        kind === "evolve"
          ? `${capitalize(name)} evoluciona y se une a tu equipo`
          : kind === "appear"
            ? `${capitalize(name)} · haz clic para atraparlo`
            : `Atrapaste a ${capitalize(name)}`;
    }
    els.dexToast?.classList.remove("hidden");
    clearTimeout(showDexCatchToast._t);
    showDexCatchToast._t = setTimeout(() => {
      els.dexToast?.classList.add("hidden");
    }, kind === "appear" ? 2800 : 4200);
  }

  function clearWildSpawn({ fled = false } = {}) {
    clearTimeout(spawnFleeTimer);
    spawnFleeTimer = 0;
    if (!els.dexSpawn) {
      activeSpawn = null;
      return;
    }
    if (fled) {
      els.dexSpawn.classList.add("is-fleeing");
      playFleeSfx();
      setTimeout(() => {
        els.dexSpawn.classList.add("hidden");
        els.dexSpawn.classList.remove("is-fleeing", "is-legendary");
        activeSpawn = null;
      }, 320);
      return;
    }
    els.dexSpawn.classList.add("hidden");
    els.dexSpawn.classList.remove("is-fleeing", "is-legendary");
    activeSpawn = null;
  }

  function spawnWildEncounter(id, kind = "wild") {
    if (!els.dexSpawn || !els.dexSpawnSprite || !els.sheetScroll) return;
    if (activeSpawn) return;
    if (isCaught(id)) return;

    const scroll = els.sheetScroll;
    const size = 84;
    const pad = 24;
    const minX = viewToSheet(scroll.scrollLeft) + pad;
    const maxX = Math.max(
      minX + size,
      viewToSheet(scroll.scrollLeft + scroll.clientWidth) - size - pad
    );
    const minY = viewToSheet(scroll.scrollTop) + pad;
    const maxY = Math.max(
      minY + size,
      viewToSheet(scroll.scrollTop + scroll.clientHeight) - size - 90
    );
    const x = minX + Math.random() * Math.max(8, maxX - minX);
    const y = minY + Math.random() * Math.max(8, maxY - minY);
    const legendary = kind === "legendary";

    activeSpawn = { id, kind, x, y };
    els.dexSpawnSprite.src = spriteUrl(id);
    els.dexSpawnSprite.alt = pokeName(id);
    els.dexSpawn.style.left = `${x}px`;
    els.dexSpawn.style.top = `${y}px`;
    els.dexSpawn.classList.toggle("is-legendary", legendary);
    els.dexSpawn.classList.remove("hidden", "is-fleeing");
    els.dexSpawn.setAttribute(
      "aria-label",
      `Atrapar ${pokeName(id)}`
    );
    els.dexSpawn.querySelector(".dex-spawn__hint").textContent = legendary
      ? "¡Legendario!"
      : "¡Clic!";

    playAppearSfx(legendary);
    showDexCatchToast(id, "appear");
    showToast(`¡${capitalize(pokeName(id))} salvaje! Clic para atrapar`);

    clearTimeout(spawnFleeTimer);
    spawnFleeTimer = setTimeout(() => {
      if (!activeSpawn || activeSpawn.id !== id) return;
      const name = pokeName(id);
      clearWildSpawn({ fled: true });
      showToast(`${capitalize(name)} huyó…`);
    }, legendary ? 9000 : 6500);
  }

  function tryCatchSpawn() {
    if (!activeSpawn) return;
    const { id, kind } = activeSpawn;
    clearWildSpawn({ fled: false });
    catchPokemon(id, { kind });
  }

  function catchPokemon(id, { kind = "wild", silent = false } = {}) {
    const key = String(id);
    if (companionState.caught[key]) return false;
    companionState.caught[key] = {
      id,
      at: new Date().toISOString(),
      source: kind,
    };
    if (!companionState.id || !isCaught(companionState.id)) {
      companionState.id = id;
    }
    companionState.hidden = false;
    persistCompanionState();
    if (!silent) {
      playCatchSfx(kind === "legendary");
      showDexCatchToast(id, kind);
      showToast(`Pokédex: ${capitalize(pokeName(id))}`);
    }
    renderCompanion();
    if (els.companionModal && !els.companionModal.classList.contains("hidden")) {
      renderDexPanel();
    }
    return true;
  }

  function pickEncounterId() {
    const all = allPokeIds();
    const missingStarters = DEX_STARTERS.filter((id) => !isCaught(id));
    const missingLegend = all.filter((id) => isLegendaryId(id) && !isCaught(id));
    const missingWild = all.filter(
      (id) => !isCaught(id) && !isLegendaryId(id) && !DEX_STARTERS.includes(id)
    );
    const roll = Math.random();

    /* Primero completar iniciales de Kanto; luego cualquier gen; legendario raro. */
    if (missingLegend.length && roll < 0.01) {
      return {
        id: missingLegend[Math.floor(Math.random() * missingLegend.length)],
        kind: "legendary",
      };
    }
    if (missingStarters.length && roll < 0.7) {
      return {
        id: missingStarters[Math.floor(Math.random() * missingStarters.length)],
        kind: "starter",
      };
    }
    if (missingWild.length) {
      return {
        id: missingWild[Math.floor(Math.random() * missingWild.length)],
        kind: "wild",
      };
    }
    if (missingStarters.length) {
      return {
        id: missingStarters[Math.floor(Math.random() * missingStarters.length)],
        kind: "starter",
      };
    }
    if (missingLegend.length && roll < 0.05) {
      return {
        id: missingLegend[Math.floor(Math.random() * missingLegend.length)],
        kind: "legendary",
      };
    }
    return null;
  }

  const DEX_ENCOUNTER_COOLDOWN_MS = 30 * 60 * 1000; /* mínimo 30 min entre apariciones */

  function maybeDexEncounter(chance = 0.35) {
    if (needsStarterChoice() || activeSpawn) return;
    const now = Date.now();
    if (now - (companionState.lastEncounterAt || 0) < DEX_ENCOUNTER_COOLDOWN_MS) return;
    if (Math.random() > chance) return;
    const found = pickEncounterId();
    if (!found) return;
    companionState.lastEncounterAt = now;
    persistCompanionState();
    spawnWildEncounter(found.id, found.kind);
  }

  function evolutionProgress() {
    const from = companionState.id;
    const next = DEX_EVOLUTIONS[from];
    if (!next || isCaught(next) || !isCaught(from)) {
      return { ready: false, next: null, ratio: 0, label: "Sin evolución disponible" };
    }
    const entry = companionState.caught[String(from)];
    const ageMs = Math.max(0, Date.now() - new Date(entry?.at || 0).getTime());
    const ageNeed = 3 * 60 * 1000;
    const breedNeed = 2;
    const breeds = companionState.breeds || 0;
    const ageRatio = Math.min(1, ageMs / ageNeed);
    const breedRatio = Math.min(1, breeds / breedNeed);
    const ratio = Math.max(ageRatio, breedRatio);
    const ready = ratio >= 1;
    const secsLeft = Math.max(0, Math.ceil((ageNeed - ageMs) / 1000));
    const breedsLeft = Math.max(0, breedNeed - breeds);
    let label;
    if (ready) {
      label = `Listo para evolucionar a ${capitalize(pokeName(next))}`;
    } else if (breedRatio >= ageRatio) {
      label = `Progreso · faltan ${breedsLeft} crianza(s) o ${secsLeft}s`;
    } else {
      label = `Progreso · ${secsLeft}s o ${breedsLeft} crianza(s)`;
    }
    return { ready, next, ratio, label };
  }

  function canEvolveActive() {
    return evolutionProgress().ready;
  }

  function evolveActiveCompanion() {
    const progress = evolutionProgress();
    const from = companionState.id;
    const next = progress.next || DEX_EVOLUTIONS[from];
    if (!progress.ready || !next) {
      showToast("Aún no puede evolucionar · mira la barra de progreso");
      return;
    }
    catchPokemon(next, { kind: "evolve" });
    companionState.id = next;
    persistCompanionState();
    renderCompanion();
    renderDexPanel();
  }

  function renderDexPanel() {
    const total = dexPoolSize();
    if (els.dexProgress) {
      els.dexProgress.textContent = `Atrapados ${dexCaughtCount()} / ${total} · empiezas con iniciales de Kanto · pueden salir Pokémon de todas las generaciones (legendarios raros).`;
    }
    const progress = evolutionProgress();
    if (els.dexActive) {
      const id = companionState.id;
      const name = pokeName(id);
      const next = progress.next;
      const pct = Math.round(progress.ratio * 100);
      els.dexActive.classList.toggle("is-ready", progress.ready);
      els.dexActive.innerHTML = `
        <div class="dex-active__row">
          <div class="dex-active__sprites">
            <img src="${escapeHtml(spriteUrl(id))}" alt="" width="64" height="64" />
            ${
              next
                ? `<span class="dex-active__arrow" aria-hidden="true">▸</span>
                   <img class="is-next" src="${escapeHtml(spriteUrl(next))}" alt="" width="64" height="64" />`
                : ""
            }
          </div>
          <div class="dex-active__meta">
            <strong>${escapeHtml(capitalize(name))}</strong>
            <span>Mascota activa · #${padId(id)}</span>
            <span class="dex-active__status${progress.ready ? " is-ready" : ""}">
              ${progress.ready ? "✦ Puede evolucionar" : next ? "Evolución en progreso" : "Forma final / sin evo"}
            </span>
          </div>
        </div>
        ${
          next
            ? `<div class="dex-evo-track" aria-hidden="true"><div class="dex-evo-track__fill" style="width:${pct}%"></div></div>
               <p class="dex-evo-label">${escapeHtml(progress.label)} · ${pct}%</p>`
            : `<p class="dex-evo-label">${escapeHtml(progress.label)}</p>`
        }
      `;
    }
    if (els.btnDexEvolve) {
      els.btnDexEvolve.disabled = !progress.ready;
      els.btnDexEvolve.classList.toggle("is-ready", progress.ready);
      els.btnDexEvolve.textContent = progress.ready
        ? "✦ Evolucionar ahora"
        : "Evolucionar";
      els.btnDexEvolve.title = progress.ready
        ? "¡Listo! Evolucionar mascota"
        : progress.label;
    }
    if (!els.companionGrid) return;

    const q = String(els.dexSearch?.value || "")
      .trim()
      .toLowerCase();
    const all = allPokeIds();
    const caughtIds = Object.keys(companionState.caught)
      .map(Number)
      .sort((a, b) => a - b);

    let ordered;
    if (q) {
      ordered = all
        .filter((id) => {
          const name = pokeName(id).toLowerCase();
          return name.includes(q) || String(id).includes(q) || padId(id).includes(q);
        })
        .slice(0, 120);
    } else {
      /* Sin búsqueda: atrapados + huecos de Kanto + muestra de no atrapados. */
      const kantoLocked = all
        .filter((id) => id <= 151 && !isCaught(id))
        .slice(0, 40);
      const otherLocked = all
        .filter((id) => id > 151 && !isCaught(id))
        .slice(0, 40);
      ordered = [...caughtIds, ...kantoLocked, ...otherLocked].filter(
        (id, i, arr) => arr.indexOf(id) === i
      );
    }

    els.companionGrid.innerHTML = "";
    if (!ordered.length) {
      els.companionGrid.innerHTML =
        '<p class="list-status">Sin resultados en la Pokédex.</p>';
      return;
    }
    const frag = document.createDocumentFragment();
    ordered.forEach((id) => {
      const caught = isCaught(id);
      const legendary = isLegendaryId(id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "companion-option" +
        (companionState.id === id ? " is-selected" : "") +
        (caught ? "" : " is-locked") +
        (legendary ? " is-legendary" : "");
      btn.setAttribute("role", "option");
      btn.disabled = !caught;
      btn.innerHTML = `
        <img src="${escapeHtml(spriteUrl(id))}" alt="" width="56" height="56" loading="lazy" />
        <span>${caught ? escapeHtml(pokeName(id)) : "???"}</span>
      `;
      if (caught) {
        btn.addEventListener("click", () => chooseCompanion(id));
      }
      frag.appendChild(btn);
    });
    els.companionGrid.appendChild(frag);
  }

  function chooseCompanion(id) {
    if (!isCaught(id)) {
      showToast("Todavía no lo has atrapado");
      return;
    }
    companionState.id = id;
    companionState.hidden = false;
    persistCompanionState();
    renderCompanion();
    renderDexPanel();
    showToast(`Mascota: ${capitalize(pokeName(id))}`);
  }

  function hideCompanion() {
    companionState.hidden = true;
    persistCompanionState();
    renderCompanion();
    closeCompanionModal();
    showToast("Mascota ocultada");
  }

  function onDexBreedActivity() {
    companionState.breeds = (companionState.breeds || 0) + 1;
    persistCompanionState();
    maybeDexEncounter(0.25);
  }

  function ensureAudio() {
    if (sfxMuted) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function playBeep({ freq = 440, duration = 0.07, gain = 0.045, type = "square" } = {}) {
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    vol.gain.setValueAtTime(gain, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  function playReadySfx(becameReady) {
    if (becameReady) {
      playBeep({ freq: 480, duration: 0.05, gain: 0.035 });
      setTimeout(() => playBeep({ freq: 640, duration: 0.07, gain: 0.04 }), 55);
    } else {
      playBeep({ freq: 360, duration: 0.06, gain: 0.03 });
    }
  }

  function playBreedSfx() {
    [392, 494, 587].forEach((freq, i) => {
      setTimeout(() => playBeep({ freq, duration: 0.06, gain: 0.038 }), i * 65);
    });
  }

  function syncSfxButton() {
    const btn = document.getElementById("btn-sfx");
    if (!btn) return;
    btn.classList.toggle("is-muted", sfxMuted);
    btn.setAttribute("aria-pressed", sfxMuted ? "false" : "true");
    btn.title = sfxMuted ? "Sonido: apagado" : "Sonido: suave";
    btn.querySelector(".sfx-icon--on")?.classList.toggle("hidden", sfxMuted);
    btn.querySelector(".sfx-icon--off")?.classList.toggle("hidden", !sfxMuted);
  }

  function toggleSfxMute() {
    sfxMuted = !sfxMuted;
    try {
      localStorage.setItem(SFX_MUTE_KEY, sfxMuted ? "1" : "0");
    } catch (_) {
      /* ignore */
    }
    syncSfxButton();
    if (!sfxMuted) playBeep({ freq: 520, duration: 0.05, gain: 0.03 });
    showToast(sfxMuted ? "Sonido apagado" : "Sonido suave");
  }

  function tagsFromIvs(ivValues) {
    return IV_STATS.filter((stat) => (ivValues?.[stat.key] ?? 0) === 31).map(
      (stat) => stat.key
    );
  }

  function buildTagFilterUi() {
    if (!els.tagFilter) return;
    const options = [
      { id: "", label: "Todas" },
      ...IV_STATS.map((stat) => ({ id: stat.key, label: stat.label })),
    ];
    els.tagFilter.innerHTML = `<span class="tag-filter__label">IVs</span>${options
      .map(
        (opt) =>
          `<button type="button" class="tag-filter__btn${tagFilter === opt.id ? " is-active" : ""}" data-tag-filter="${opt.id}">${opt.label}</button>`
      )
      .join("")}`;
  }

  function setTagFilter(next) {
    tagFilter = next || "";
    buildTagFilterUi();
    renderSaved();
  }

  function toggleReady(uid) {
    const entry = saved.find((s) => s.uid === uid);
    if (!entry) return;
    pushUndo();
    entry.ready = !entry.ready;
    persist();
    hideMenu();
    renderSaved();
    playReadySfx(entry.ready);
    if (entry.ready) maybeDexEncounter(0.18);
    showToast(entry.ready ? "Marcado como listo" : "Ya no está listo");
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function genderLabel(g) {
    return g === "male" ? "♂ Hombre" : "♀ Mujer";
  }

  function cardGenderText(entry) {
    const symbol = entry.gender === "male" ? "♂" : "♀";
    if (Number.isInteger(entry.level) && entry.level > 0) {
      return `${symbol} Nv.${entry.level}`;
    }
    return genderLabel(entry.gender);
  }

  function snap(n) {
    return Math.round(n / GRID) * GRID;
  }

  function speciesIdFromUrl(url) {
    const parts = url.replace(/\/$/, "").split("/");
    return Number(parts[parts.length - 1]);
  }

  function catalogFromLocal() {
    const raw = window.CRIANZA_CATALOG;
    if (!Array.isArray(raw) || !raw.length) return null;
    return raw.map((entry) => ({
      id: Number(entry.id),
      name: String(entry.name || ""),
      sprite: spriteUrl(entry.id),
      eggGroups: Array.isArray(entry.eggGroups) ? entry.eggGroups.slice() : [],
    }));
  }

  async function fetchCatalogFromApi() {
    const res = await fetch(`${API}/pokemon?limit=${POKE_LIMIT}`);
    if (!res.ok) throw new Error("No se pudo cargar la Pokédex");
    const data = await res.json();

    const catalog = data.results.map((entry, index) => {
      const id = index + 1;
      return {
        id,
        name: entry.name,
        sprite: spriteUrl(id),
        eggGroups: [],
      };
    });

    const byId = new Map(catalog.map((p) => [p.id, p]));

    await Promise.all(
      EGG_GROUPS.map(async (group) => {
        const groupRes = await fetch(`${API}/egg-group/${group.api}`);
        if (!groupRes.ok) return;
        const groupData = await groupRes.json();
        for (const species of groupData.pokemon_species || []) {
          const id = speciesIdFromUrl(species.url);
          const poke = byId.get(id);
          if (poke && !poke.eggGroups.includes(group.api)) {
            poke.eggGroups.push(group.api);
          }
        }
      })
    );

    return catalog;
  }

  async function fetchCatalog() {
    /* Edge/Chrome bloquean fetch a APIs al abrir el HTML como file://.
       El catálogo local (data/catalog.js) funciona sin servidor. */
    const local = catalogFromLocal();
    if (local) {
      pokemonCatalog = local;
      return;
    }

    pokemonCatalog = await fetchCatalogFromApi();
  }

  function setTool(next) {
    tool = next;
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.tool === tool);
    });
    els.sheet.classList.toggle("is-draw-mode", tool === "pencil");
    els.sheet.classList.toggle("is-erase-mode", tool === "eraser");
    els.sheet.classList.toggle("is-text-mode", tool === "text");
    els.sheetScroll?.classList.toggle("is-draw-tool", tool !== "move");
    els.sheetScroll?.classList.toggle("is-text-tool", tool === "text");

    const hints = {
      move: "Arrastra Pokémon aquí · Zoom −/+ · Clic derecho para unir",
      pencil: "Dibuja en el cuaderno",
      text: "Clic en el cuaderno para escribir una nota",
      eraser: "Pasa sobre el dibujo para borrar",
    };
    els.toolHint.textContent = hints[tool];
    hideMenu();
  }

  function countInEggGroup(api) {
    return pokemonCatalog.filter((p) => p.eggGroups.includes(api)).length;
  }

  function renderEggSelect() {
    if (!els.eggSelect) return;
    const prev = selectedEggGroup || "";
    els.eggSelect.innerHTML = "";

    const all = document.createElement("option");
    all.value = "";
    all.textContent = `Todos (${pokemonCatalog.length || 0})`;
    els.eggSelect.appendChild(all);

    for (const group of EGG_GROUPS) {
      const count = countInEggGroup(group.api);
      const opt = document.createElement("option");
      opt.value = group.api;
      opt.textContent = `${group.label} (${count})`;
      els.eggSelect.appendChild(opt);
    }

    els.eggSelect.value = prev;
    if (els.eggSelect.value !== prev) {
      selectedEggGroup = null;
      els.eggSelect.value = "";
    }
  }

  function updateZoomLabel() {
    if (els.zoomLabel) {
      els.zoomLabel.textContent = `${Math.round(sheetZoom * 100)}%`;
    }
    if (els.btnZoomOut) els.btnZoomOut.disabled = sheetZoom <= ZOOM_MIN + 0.001;
    if (els.btnZoomIn) els.btnZoomIn.disabled = sheetZoom >= ZOOM_MAX - 0.001;
  }

  function coverSheetViewport() {
    if (!els.sheet || !els.sheetScroll) return;
    const scroll = els.sheetScroll;
    const w = Math.max(
      SHEET_W,
      Math.ceil(scroll.clientWidth / sheetZoom) + 4
    );
    const h = Math.max(
      SHEET_H,
      Math.ceil(scroll.clientHeight / sheetZoom) + 4
    );
    els.sheet.style.width = `${w}px`;
    els.sheet.style.height = `${h}px`;
  }

  function setSheetZoom(next, { anchorClientX, anchorClientY } = {}) {
    if (!els.sheet || !els.sheetScroll) return;
    const scroll = els.sheetScroll;
    const prev = sheetZoom;
    const clamped = Math.round(
      Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next)) / ZOOM_STEP
    ) * ZOOM_STEP;
    const zoom = Math.round(clamped * 100) / 100;
    if (Math.abs(zoom - prev) < 0.001) {
      updateZoomLabel();
      return;
    }

    let sheetX;
    let sheetY;
    if (
      Number.isFinite(anchorClientX) &&
      Number.isFinite(anchorClientY)
    ) {
      const rect = scroll.getBoundingClientRect();
      sheetX = viewToSheet(
        scroll.scrollLeft + (anchorClientX - rect.left)
      );
      sheetY = viewToSheet(
        scroll.scrollTop + (anchorClientY - rect.top)
      );
    } else {
      sheetX = viewToSheet(scroll.scrollLeft + scroll.clientWidth / 2);
      sheetY = viewToSheet(scroll.scrollTop + scroll.clientHeight / 2);
    }

    sheetZoom = zoom;
    els.sheet.style.zoom = String(sheetZoom);
    coverSheetViewport();
    updateZoomLabel();

    if (
      Number.isFinite(anchorClientX) &&
      Number.isFinite(anchorClientY)
    ) {
      const rect = scroll.getBoundingClientRect();
      scroll.scrollLeft =
        sheetX * sheetZoom - (anchorClientX - rect.left);
      scroll.scrollTop =
        sheetY * sheetZoom - (anchorClientY - rect.top);
    } else {
      scroll.scrollLeft = sheetX * sheetZoom - scroll.clientWidth / 2;
      scroll.scrollTop = sheetY * sheetZoom - scroll.clientHeight / 2;
    }

    if (!companionState.hidden) renderCompanion();
  }

  function nudgeZoom(delta, anchor) {
    setSheetZoom(sheetZoom + delta, anchor);
  }

  const LIST_GAP = 6;
  const LIST_PAD = 8;
  const LIST_ROW_H = 84;
  const LIST_MIN_COL = 136;

  function listLayout() {
    const width = els.list.clientWidth || 280;
    const inner = Math.max(LIST_MIN_COL, width - LIST_PAD * 2);
    const cols = Math.max(
      1,
      Math.floor((inner + LIST_GAP) / (LIST_MIN_COL + LIST_GAP))
    );
    const colW = (inner - LIST_GAP * (cols - 1)) / cols;
    return { cols, colW, rowH: LIST_ROW_H, gap: LIST_GAP, pad: LIST_PAD };
  }

  function createPokeButton(poke) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "poke-item";
    btn.dataset.id = String(poke.id);
    btn.draggable = !listPan?.moved;
    btn.title = `${capitalize(poke.name)} — arrastra al cuaderno`;
    btn.innerHTML = `
      <img class="poke-item__sprite" alt="" width="36" height="36" decoding="async" loading="lazy" draggable="false" />
      <span class="poke-item__name"></span>
      <span class="poke-item__id"></span>
    `;
    const img = btn.querySelector("img");
    img.src = poke.sprite;
    btn.querySelector(".poke-item__name").textContent = poke.name;
    btn.querySelector(".poke-item__id").textContent = `#${padId(poke.id)}`;
    btn.addEventListener("click", () => {
      if (listPan?.moved) return;
      selectPokemon(poke);
    });
    btn.addEventListener("dragstart", (e) => onPokeDragStart(e, poke, btn));
    btn.addEventListener("dragend", () => onPokeDragEnd(btn));
    return btn;
  }

  function paintListWindow() {
    if (!els.list || !listView) return;

    if (!listView.length) {
      listRangeKey = "";
      els.list.innerHTML = "";
      const p = document.createElement("p");
      p.className = "list-status";
      p.textContent = selectedEggGroup
        ? `Nadie en ${EGG_LABEL[selectedEggGroup]} con ese filtro.`
        : "Sin resultados.";
      els.list.appendChild(p);
      return;
    }

    const { cols, colW, rowH, gap, pad } = listLayout();
    const stride = rowH + gap;
    const rows = Math.ceil(listView.length / cols);
    const totalH = pad * 2 + rows * rowH + Math.max(0, rows - 1) * gap;
    const viewTop = els.list.scrollTop;
    const viewH = els.list.clientHeight || 480;
    const startRow = Math.max(0, Math.floor((viewTop - pad) / stride) - 1);
    const endRow = Math.min(
      rows,
      Math.ceil((viewTop + viewH - pad) / stride) + 2
    );
    const start = startRow * cols;
    const end = Math.min(listView.length, endRow * cols);
    const key = `${cols}|${Math.round(colW)}|${start}|${end}|${selected?.id || ""}`;
    if (key === listRangeKey && els.list.querySelector(".pokemon-list__window")) {
      return;
    }
    listRangeKey = key;

    let windowEl = els.list.querySelector(".pokemon-list__window");
    if (!windowEl) {
      els.list.replaceChildren();
      windowEl = document.createElement("div");
      windowEl.className = "pokemon-list__window";
      els.list.appendChild(windowEl);
    }
    windowEl.style.height = `${totalH}px`;

    const byId = new Map(
      [...windowEl.children].map((el) => [el.dataset.id, el])
    );
    const frag = document.createDocumentFragment();
    for (let i = start; i < end; i++) {
      const poke = listView[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      let btn = byId.get(String(poke.id));
      if (!btn) btn = createPokeButton(poke);
      btn.classList.toggle("is-active", selected?.id === poke.id);
      btn.draggable = !listPan?.moved;
      btn.style.left = `${pad + col * (colW + gap)}px`;
      btn.style.top = `${pad + row * stride}px`;
      btn.style.width = `${colW}px`;
      btn.style.height = `${rowH}px`;
      frag.appendChild(btn);
    }
    windowEl.replaceChildren(frag);
  }

  function scheduleListPaint() {
    if (listPaintQueued || !listView) return;
    listPaintQueued = true;
    requestAnimationFrame(() => {
      listPaintQueued = false;
      paintListWindow();
    });
  }

  function renderList(filter = "") {
    const q = filter.trim().toLowerCase();
    const items = pokemonCatalog.filter((p) => {
      const matchesSearch =
        !q || p.name.includes(q) || String(p.id).includes(q);
      const matchesEgg =
        !selectedEggGroup || p.eggGroups.includes(selectedEggGroup);
      return matchesSearch && matchesEgg;
    });
    const same =
      listView &&
      listView.length === items.length &&
      listView.every((poke, i) => poke.id === items[i].id);
    listView = items;
    if (!same) {
      els.list.scrollTop = 0;
      listRangeKey = "";
    }
    paintListWindow();
  }

  function onPokeDragStart(e, poke, btn) {
    if (listPan?.moved) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("application/x-poke-id", String(poke.id));
    e.dataTransfer.setData("text/plain", poke.name);
    e.dataTransfer.effectAllowed = "copy";
    btn.classList.add("is-dragging-source");
    try {
      e.dataTransfer.setDragImage(btn, 40, 40);
    } catch (_) {
      /* ignore */
    }
  }

  function onPokeDragEnd(btn) {
    btn.classList.remove("is-dragging-source");
    els.sheet?.classList.remove("is-drop-target");
  }

  function setListItemsDraggable(enabled) {
    els.list?.querySelectorAll(".poke-item").forEach((el) => {
      el.draggable = enabled;
    });
  }

  function onListPanStart(e) {
    if (e.button !== undefined && e.button !== 0) return;
    listPan = {
      startY: e.clientY,
      startX: e.clientX,
      scrollTop: els.list.scrollTop,
      moved: false,
    };
  }

  function onListPanMove(e) {
    if (!listPan) return;
    const dy = e.clientY - listPan.startY;
    const dx = e.clientX - listPan.startX;
    if (!listPan.moved && Math.abs(dy) > 8 && Math.abs(dy) >= Math.abs(dx)) {
      listPan.moved = true;
      setListItemsDraggable(false);
      els.list.classList.add("is-panning");
      try {
        els.list.setPointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
    }
    if (!listPan.moved) return;
    e.preventDefault();
    els.list.scrollTop = listPan.scrollTop - dy;
  }

  function onListPanEnd() {
    if (!listPan) return;
    if (listPan.moved) {
      setListItemsDraggable(true);
      els.list.classList.remove("is-panning");
    }
    listPan = null;
  }

  function sheetCoordsFromClient(clientX, clientY) {
    const sheetRect = els.sheet.getBoundingClientRect();
    const scaleX = SHEET_W / sheetRect.width;
    const scaleY = SHEET_H / sheetRect.height;
    let x = (clientX - sheetRect.left) * scaleX - CARD_W / 2;
    let y = (clientY - sheetRect.top) * scaleY - CARD_H / 2;
    x = snap(Math.max(0, Math.min(SHEET_W - CARD_W, x)));
    y = snap(Math.max(0, Math.min(SHEET_H - CARD_H, y)));
    return { x, y };
  }

  function onSheetDragOver(e) {
    if (![...e.dataTransfer.types].includes("application/x-poke-id")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    els.sheet.classList.add("is-drop-target");
  }

  function onSheetDragLeave(e) {
    if (!els.sheet.contains(e.relatedTarget)) {
      els.sheet.classList.remove("is-drop-target");
    }
  }

  function onSheetDrop(e) {
    e.preventDefault();
    els.sheet.classList.remove("is-drop-target");
    const id = Number(e.dataTransfer.getData("application/x-poke-id"));
    if (!id) return;
    const poke = pokemonCatalog.find((p) => p.id === id);
    if (!poke) return;

    const pos = sheetCoordsFromClient(e.clientX, e.clientY);
    selectPokemon(poke);
    pendingDrop = pos;
    setTool("move");
    els.sheetScroll?.scrollTo({
      left: Math.max(0, pos.x - 80),
      top: Math.max(0, pos.y - 80),
      behavior: "smooth",
    });
    showToast("Elige género e IVs → Guardar (queda donde soltaste)");
  }

  function buildIvsUi() {
    els.ivsGrid.innerHTML = "";
    for (const stat of IV_STATS) {
      const row = document.createElement("div");
      row.className = "iv-row";
      row.dataset.stat = stat.key;
      row.innerHTML = `
        <span class="iv-row__label">${stat.label}</span>
        <div class="iv-row__track" aria-hidden="true">
          <div class="iv-row__fill" data-fill="${stat.key}"></div>
        </div>
        <input
          class="iv-row__input"
          type="number"
          min="0"
          max="31"
          value="${ivs[stat.key]}"
          data-iv="${stat.key}"
          aria-label="IV ${stat.label}"
        />
      `;
      els.ivsGrid.appendChild(row);
    }

    els.ivsGrid.querySelectorAll("[data-iv]").forEach((input) => {
      input.addEventListener("input", onIvChange);
    });
    syncIvVisuals();
  }

  function clampIv(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return 0;
    return Math.min(31, Math.max(0, Math.round(n)));
  }

  function onIvChange(e) {
    const key = e.target.dataset.iv;
    const value = clampIv(e.target.value);
    ivs[key] = value;
    e.target.value = value;
    syncIvVisuals();
  }

  function syncIvVisuals() {
    for (const stat of IV_STATS) {
      const row = els.ivsGrid.querySelector(`[data-stat="${stat.key}"]`);
      const fill = row?.querySelector("[data-fill]");
      if (!row || !fill) continue;
      const value = ivs[stat.key];
      fill.style.width = `${(value / 31) * 100}%`;
      row.classList.toggle("is-perfect", value === 31);
    }
  }

  function setGender(next) {
    gender = next;
    els.spriteFrame.dataset.gender = next || "";
    els.btnMale.classList.toggle("is-selected", next === "male");
    els.btnFemale.classList.toggle("is-selected", next === "female");

    if (next === "male") {
      els.genderBadge.textContent = "♂";
      els.genderBadge.style.color = "var(--male)";
    } else if (next === "female") {
      els.genderBadge.textContent = "♀";
      els.genderBadge.style.color = "var(--female)";
    } else {
      els.genderBadge.textContent = "";
    }
  }

  function eggGroupsText(poke) {
    if (!poke.eggGroups?.length) return "Sin grupo conocido";
    return poke.eggGroups.map((g) => EGG_LABEL[g] || g).join(" · ");
  }

  function fillNatureSelect() {
    if (!els.nature || els.nature.dataset.ready) return;
    for (const n of NATURES) {
      const opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      els.nature.appendChild(opt);
    }
    els.nature.dataset.ready = "1";
  }

  function setNature(next) {
    nature = next || "";
    if (els.nature) els.nature.value = nature;
  }

  function selectPokemon(poke) {
    selected = poke;
    gender = null;
    nature = "";
    ivs = emptyIvs();

    els.empty?.classList.add("hidden");
    els.editor.classList.remove("hidden");
    document.body.classList.add("has-editor");

    els.name.textContent = poke.name;
    els.id.textContent = `#${padId(poke.id)}`;
    els.eggs.innerHTML = `Grupos: <strong>${eggGroupsText(poke)}</strong>`;
    els.sprite.src = poke.sprite;
    els.sprite.alt = poke.name;

    setGender(null);
    fillNatureSelect();
    setNature("");
    buildIvsUi();
    renderList(els.search.value);
  }

  function nextFreePosition(nearX, nearY) {
    if (typeof nearX === "number" && typeof nearY === "number") {
      return {
        x: snap(Math.min(SHEET_W - CARD_W - 16, nearX + 40)),
        y: snap(Math.min(SHEET_H - CARD_H - 16, nearY + 40)),
      };
    }

    const used = new Set(saved.map((e) => `${e.x ?? 0},${e.y ?? 0}`));
    let col = 0;
    let row = 0;
    for (let i = 0; i < 400; i++) {
      const x = 28 + col * (CARD_W + 28);
      const y = 28 + row * (CARD_H + 28);
      const key = `${x},${y}`;
      if (!used.has(key) && x + CARD_W < SHEET_W && y + CARD_H < SHEET_H) {
        return { x, y };
      }
      col += 1;
      if (col > 10) {
        col = 0;
        row += 1;
      }
    }
    return { x: 28, y: 28 };
  }

  function saveEntry() {
    if (!selected) {
      showToast("Elige un Pokémon primero");
      return;
    }
    if (!gender) {
      showToast("Selecciona el género");
      return;
    }

    const pos = pendingDrop
      ? {
          x: snap(Math.max(0, Math.min(SHEET_W - CARD_W, pendingDrop.x))),
          y: snap(Math.max(0, Math.min(SHEET_H - CARD_H, pendingDrop.y))),
        }
      : nextFreePosition();
    pendingDrop = null;
    pushUndo();

    const ivValues = { ...ivs };
    const entry = {
      uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      id: selected.id,
      name: selected.name,
      sprite: selected.sprite,
      gender,
      nature: nature || "",
      eggGroups: [...(selected.eggGroups || [])],
      ivs: ivValues,
      lineTags: tagsFromIvs(ivValues),
      x: pos.x,
      y: pos.y,
      isBaby: false,
      createdAt: new Date().toISOString(),
    };

    saved.push(entry);
    persist();
    renderSaved();
    els.sheetScroll?.scrollTo({
      left: Math.max(0, pos.x - 40),
      top: Math.max(0, pos.y - 40),
      behavior: "smooth",
    });
    showToast(`${capitalize(selected.name)} colocado en el cuaderno`);
  }

  /** Techo teórico (NO es lo que hereda el huevo). Solo para ver el pool. */
  function mergeIvsPool(a, b) {
    const out = emptyIvs();
    for (const stat of IV_STATS) {
      out[stat.key] = Math.max(a.ivs[stat.key] ?? 0, b.ivs[stat.key] ?? 0);
    }
    return out;
  }

  const POWER_ITEMS = {
    hp: {
      id: "weight",
      icon: "fitness_center",
      name: "Pesa Recia",
      short: "Pesa HP",
      statLabel: "HP",
    },
    atk: {
      id: "bracer",
      icon: "swords",
      name: "Brazal Recio",
      short: "Brazal Atk",
      statLabel: "Ataque",
    },
    def: {
      id: "belt",
      icon: "shield",
      name: "Cinto Recio",
      short: "Cinto Def",
      statLabel: "Defensa",
    },
    spa: {
      id: "lens",
      icon: "visibility",
      name: "Lente Recia",
      short: "Lente SpA",
      statLabel: "At. Esp.",
    },
    spd: {
      id: "band",
      icon: "health_and_safety",
      name: "Banda Recia",
      short: "Banda SpD",
      statLabel: "Def. Esp.",
    },
    spe: {
      id: "anklet",
      icon: "directions_run",
      name: "Franja Recia",
      short: "Franja Spe",
      statLabel: "Velocidad",
    },
  };

  const NONE_ITEM = {
    id: "none",
    icon: "block",
    name: "Ninguno",
    short: "Sin pesa",
    detail: "Sin objeto",
  };

  function perfectKeys(poke) {
    return IV_STATS.filter((s) => (poke.ivs[s.key] ?? 0) === 31).map(
      (s) => s.key
    );
  }

  function powerFromKey(parent, key) {
    if (!key || !POWER_ITEMS[key]) return { ...NONE_ITEM };
    const base = POWER_ITEMS[key];
    return {
      ...base,
      key,
      value: parent.ivs[key] ?? 0,
      detail: `Fija ${base.statLabel} ${parent.ivs[key] ?? 0}`,
    };
  }

  function sharedPerfectKeys(male, female) {
    return IV_STATS.filter(
      (s) =>
        (male.ivs[s.key] ?? 0) === 31 && (female.ivs[s.key] ?? 0) === 31
    ).map((s) => s.key);
  }

  function uniquePerfectKeys(holder, other) {
    return perfectKeys(holder).filter((k) => (other.ivs[k] ?? 0) < 31);
  }

  /**
   * Pesa solo en IVs nuevos (únicos).
   * Si ambos ya tienen el mismo 31, no hace falta pesa para esa stat.
   */
  function suggestHeldItems(male, female) {
    const shared = sharedPerfectKeys(male, female);
    const maleUniques = uniquePerfectKeys(male, female);
    const femaleUniques = uniquePerfectKeys(female, male);

    const maleKey = maleUniques[0] || null;
    const femaleKey = femaleUniques[0] || null;

    const maleItem = maleKey
      ? {
          ...powerFromKey(male, maleKey),
          detail: `Entrega nuevo: ${POWER_ITEMS[maleKey].statLabel} 31`,
        }
      : {
          ...NONE_ITEM,
          detail: shared.length
            ? "Sin pesa (solo aporta IVs ya compartidos)"
            : "Sin 31 nuevo que entregar",
        };

    const femaleItem = femaleKey
      ? {
          ...powerFromKey(female, femaleKey),
          detail: `Entrega nuevo: ${POWER_ITEMS[femaleKey].statLabel} 31`,
        }
      : {
          ...NONE_ITEM,
          detail: shared.length
            ? "Sin pesa (solo aporta IVs ya compartidos)"
            : "Sin 31 nuevo que entregar",
        };

    const guaranteed = [maleKey, femaleKey].filter(Boolean).length;
    const sharedLabels = shared
      .map((k) => POWER_ITEMS[k]?.statLabel || k)
      .join(", ");

    let why = "";
    if (shared.length) {
      why += `IVs compartidos (${sharedLabels}): no hace falta pesa. `;
    }
    if (guaranteed >= 2) {
      why += `Pesas solo para lo nuevo: ♂ ${maleItem.short} · ♀ ${femaleItem.short}.`;
    } else if (guaranteed === 1) {
      const one = maleKey ? maleItem : femaleItem;
      const who = maleKey ? "♂" : "♀";
      why += `Solo ${who} entrega un 31 nuevo → ${one.short}. El otro no necesita pesa.`;
    } else if (shared.length) {
      why +=
        "Los dos ya comparten los mismos 31: no uses pesa (o busca un padre con un 31 distinto).";
    } else {
      why =
        "Nadie tiene un 31 único para entregar. Consigue al menos un 31 distinto en cada padre.";
    }

    return {
      maleItem,
      femaleItem,
      maleKey,
      femaleKey,
      sharedKeys: shared,
      maleUniques,
      femaleUniques,
      guaranteed,
      why,
    };
  }

  function predictBreed(male, female) {
    const itemPlan = suggestHeldItems(male, female);
    const maleP = countPerfect(male.ivs);
    const femaleP = countPerfect(female.ivs);
    const bestP = Math.max(maleP, femaleP);
    const poolPerfects = countPerfect(mergeIvsPool(male, female));
    const isBuildUp = poolPerfects > bestP;

    const certain = {};
    const forcedKeys = [];
    if (itemPlan.maleKey != null) {
      certain[itemPlan.maleKey] = 31;
      forcedKeys.push(itemPlan.maleKey);
    }
    if (itemPlan.femaleKey != null) {
      certain[itemPlan.femaleKey] = 31;
      forcedKeys.push(itemPlan.femaleKey);
    }

    const babyIvs = emptyIvs();
    for (const [k, v] of Object.entries(certain)) babyIvs[k] = v;
    /* Compartidos: se muestran como techo (sin pesa). */
    for (const k of itemPlan.sharedKeys) {
      if (!forcedKeys.includes(k)) babyIvs[k] = 31;
    }

    const guaranteedPerfects = forcedKeys.length;

    const pesaLine =
      itemPlan.guaranteed === 0
        ? "Sin pesas (no hay 31 nuevos que forzar)."
        : itemPlan.guaranteed === 1
          ? `Pesa solo en quien entrega lo nuevo: ♂ ${itemPlan.maleItem.short} · ♀ ${itemPlan.femaleItem.short}.`
          : `Pesas en lo nuevo: ♂ ${itemPlan.maleItem.short} · ♀ ${itemPlan.femaleItem.short}.`;

    const sharedLine = itemPlan.sharedKeys.length
      ? `Compartidos sin pesa: ${itemPlan.sharedKeys
          .map((k) => POWER_ITEMS[k]?.statLabel || k)
          .join(", ")}.`
      : "Ningún 31 compartido entre ambos.";

    const steps = [
      "Elige macho y hembra compatibles (grupo huevo).",
      pesaLine,
      sharedLine,
      `Cría: ${guaranteedPerfects} IV(s) fijo(s) por pesa` +
        (itemPlan.sharedKeys.length
          ? ` + ${itemPlan.sharedKeys.length} compartido(s) sin pesa.`
          : "."),
    ];

    return {
      itemPlan,
      certain,
      forcedKeys,
      sharedKeys: itemPlan.sharedKeys,
      babyIvs,
      guaranteedPerfects,
      maleP,
      femaleP,
      bestP,
      poolPerfects,
      isBuildUp,
      steps,
    };
  }

  function itemCardHtml(side, poke, item) {
    const symbol = side === "male" ? "♂" : "♀";
    const detail = item.detail || item.short || "";
    const iconName = item.icon || "block";
    const statAttr = item.key ? ` data-stat="${item.key}"` : "";
    const noneClass = item.id === "none" || !item.icon ? " item-icon--none" : "";
    const iconHtml = `<span class="item-icon material-symbols-outlined${noneClass}"${statAttr} aria-hidden="true">${iconName}</span>`;

    return `
      <div class="item-card" data-side="${side}">
        <span class="item-card__who">${symbol} ${poke.name}</span>
        ${iconHtml}
        <p class="item-card__name">${item.short || item.name}</p>
        <p class="item-card__stat">${detail}</p>
      </div>
    `;
  }

  /** Completa grupos huevo desde la Pokédex si el guardado viejo no los tiene. */
  function resolveEggGroups(poke) {
    if (Array.isArray(poke.eggGroups) && poke.eggGroups.length) {
      return poke.eggGroups;
    }
    const cat = pokemonCatalog.find(
      (p) => p.id === poke.id || p.name === poke.name
    );
    if (cat?.eggGroups?.length) {
      poke.eggGroups = [...cat.eggGroups];
      return poke.eggGroups;
    }
    return [];
  }

  function canBreed(a, b) {
    if (a.gender === b.gender) return false;
    const aGroups = resolveEggGroups(a);
    const bGroups = resolveEggGroups(b);
    if (aGroups.includes("no-eggs") || bGroups.includes("no-eggs")) return false;
    if (aGroups.includes("ditto") || bGroups.includes("ditto")) return true;
    if (!aGroups.length || !bGroups.length) {
      /* Misma especie: siempre se pueden criar (salvo legendarios no-eggs ya filtrados) */
      if (a.id && b.id && a.id === b.id) return true;
      if (a.name && b.name && a.name === b.name) return true;
      return false;
    }
    return aGroups.some((g) => g !== "ditto" && bGroups.includes(g));
  }

  function offspringSpecies(male, female) {
    const fGroups = resolveEggGroups(female);
    if (fGroups.includes("ditto")) return male;
    return female;
  }

  function countPerfect(ivObj) {
    return IV_STATS.filter((s) => (ivObj[s.key] ?? 0) === 31).length;
  }


  function compressImageFile(file, maxW = 900) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve({
          src: c.toDataURL("image/jpeg", 0.72),
          width: w,
          height: h,
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo leer la imagen"));
      };
      img.src = url;
    });
  }

  function pasteDropPosition() {
    const scroll = els.sheetScroll;
    const baseX = (scroll?.scrollLeft || 0) + 48 + pasted.length * 24;
    const baseY = (scroll?.scrollTop || 0) + 48 + pasted.length * 24;
    return {
      x: snap(Math.min(SHEET_W - 280, Math.max(0, baseX))),
      y: snap(Math.min(SHEET_H - 200, Math.max(0, baseY))),
    };
  }

  async function addPastedImage(file) {
    try {
      const { src, width, height } = await compressImageFile(file);
      const displayW = Math.min(420, width);
      const displayH = Math.round((height / width) * displayW);
      const pos = pasteDropPosition();
      const entry = {
        uid: makeId(),
        src,
        width: displayW,
        height: displayH,
        x: pos.x,
        y: pos.y,
        createdAt: new Date().toISOString(),
      };
      pushUndo();
      pasted.push(entry);
      selectedPasteUid = entry.uid;
      persist();
      renderPastes();
      showToast("Pantallazo pegado — arrástralo o bórralo con ×");
    } catch (err) {
      console.error(err);
      showToast("No se pudo pegar la imagen");
    }
  }

  function renderPastes(updatePageList = true) {
    els.canvas.querySelectorAll(".paste-shot").forEach((el) => el.remove());

    for (const shot of pasted) {
      if (typeof shot.x !== "number") shot.x = 48;
      if (typeof shot.y !== "number") shot.y = 48;

      const el = document.createElement("article");
      el.className =
        "paste-shot" + (selectedPasteUid === shot.uid ? " is-selected" : "");
      el.dataset.uid = shot.uid;
      el.style.left = `${shot.x}px`;
      el.style.top = `${shot.y}px`;
      el.style.width = `${shot.width || 320}px`;
      el.innerHTML = `
        <button type="button" class="paste-shot__delete" aria-label="Borrar pantallazo" data-delete-paste="${shot.uid}">×</button>
        <img src="${shot.src}" alt="Pantallazo" draggable="false" />
        <span class="paste-shot__label">Foto</span>
      `;
      el.addEventListener("pointerdown", (e) => onPastePointerDown(e, el, shot));
      els.canvas.appendChild(el);
    }
    if (updatePageList) renderPages();
  }

  function onPastePointerDown(e, el, shot) {
    if (tool !== "move") return;
    if (e.target.closest("[data-delete-paste]")) return;
    if (e.button !== undefined && e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();
    hideMenu();
    selectedPasteUid = shot.uid;
    els.canvas.querySelectorAll(".paste-shot").forEach((node) => {
      node.classList.toggle("is-selected", node.dataset.uid === shot.uid);
    });
    el.setPointerCapture(e.pointerId);

    drag = {
      kind: "paste",
      uid: shot.uid,
      card: el,
      entry: shot,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      offsetX: e.clientX - el.getBoundingClientRect().left,
      offsetY: e.clientY - el.getBoundingClientRect().top,
      maxW: shot.width || 320,
      maxH: shot.height || 240,
    };
  }

  function deletePaste(uid) {
    pushUndo();
    pasted = pasted.filter((p) => p.uid !== uid);
    if (selectedPasteUid === uid) selectedPasteUid = null;
    persist();
    renderPastes();
    showToast("Pantallazo borrado");
  }

  function clearPastes() {
    if (!pasted.length) return;
    if (!confirm("¿Borrar todos los pantallazos de esta página?")) return;
    pushUndo();
    pasted = [];
    selectedPasteUid = null;
    persist();
    renderPastes();
    showToast("Fotos borradas");
  }

  function renderSaved() {
    els.canvas.querySelectorAll(".saved-card").forEach((el) => el.remove());

    if (!saved.length) {
      els.savedEmpty.classList.remove("hidden");
    } else {
      els.savedEmpty.classList.add("hidden");
    }

    for (const entry of saved) {
      if (typeof entry.x !== "number") entry.x = 28;
      if (typeof entry.y !== "number") entry.y = 28;

      const card = document.createElement("article");
      const perfectTags = tagsFromIvs(entry.ivs);
      entry.lineTags = perfectTags;

      card.className =
        "saved-card" +
        (entry.isBaby ? " is-baby" : "") +
        (entry.ready ? " is-ready" : "");
      card.dataset.gender = entry.gender;
      card.dataset.uid = entry.uid;
      card.style.left = `${entry.x}px`;
      card.style.top = `${entry.y}px`;
      if (entry.ready) card.style.zIndex = "0";
      if (tagFilter && !perfectTags.includes(tagFilter)) {
        card.classList.add("is-tag-dimmed");
      }

      const pairSource = pairSourceUid
        ? saved.find((s) => s.uid === pairSourceUid)
        : null;
      if (pairSourceUid === entry.uid) card.classList.add("is-pair-source");
      if (
        pairSource &&
        pairSource.uid !== entry.uid &&
        canBreed(pairSource, entry)
      ) {
        card.classList.add("is-pair-target");
      }

      const ivHtml = IV_STATS.map((stat) => {
        const v = entry.ivs[stat.key] ?? 0;
        return `<span class="${v === 31 ? "is-max" : ""}">${stat.label} ${v}</span>`;
      }).join("");

      const parentsHtml = entry.parents
        ? `<p class="saved-card__parents">${escapeHtml(entry.parents)}</p>`
        : "";
      const natureHtml = entry.nature
        ? `<p class="saved-card__parents">${escapeHtml(entry.nature)}</p>`
        : "";
      const heldHtml =
        entry.heldPlan
          ? `<p class="saved-card__parents">♂ ${escapeHtml(entry.heldPlan.male)} · ♀ ${escapeHtml(entry.heldPlan.female)}</p>`
          : "";
      const tagsHtml = perfectTags.length
        ? `<div class="saved-card__line-tags">${perfectTags
            .map((key) => {
              const label = IV_STATS.find((s) => s.key === key)?.label || key;
              return `<span class="saved-card__line-tag" data-tag="${key}">${escapeHtml(label)}</span>`;
            })
            .join("")}</div>`
        : "";

      card.innerHTML = `
        ${entry.isBaby ? '<span class="saved-card__badge">Cría</span>' : ""}
        ${entry.ready ? '<span class="saved-card__ready-tag">Listo</span>' : ""}
        <button type="button" class="saved-card__delete" aria-label="Eliminar" data-delete="${entry.uid}">×</button>
        <img class="saved-card__sprite" src="${escapeHtml(entry.sprite)}" alt="${escapeHtml(entry.name)}" loading="lazy" />
        <div class="saved-card__head">
          <h3 class="saved-card__name">${escapeHtml(entry.name)}</h3>
          <p class="saved-card__gender">${cardGenderText(entry)}</p>
        </div>
        ${natureHtml}
        ${parentsHtml}
        ${heldHtml}
        <div class="saved-card__ivs">${ivHtml}</div>
        ${tagsHtml}
      `;

      card.addEventListener("pointerdown", (e) => onCardPointerDown(e, card, entry));
      els.canvas.appendChild(card);
    }

    renderPastes(false);
    renderTextBoxes(false);
    renderBreedLinks();
    updateBreedTotal();
    renderPages();
  }

  function calculateBreedCost(itemPlan, childGender) {
    const powerItems = [itemPlan?.maleKey, itemPlan?.femaleKey].filter(Boolean).length;
    const genderChange = childGender === "male" ? 1 : 0;
    return (powerItems + genderChange) * 500;
  }

  function getBreedCost(entry) {
    if (!entry.isBaby) return 0;
    if (Number.isFinite(entry.breedCost)) return entry.breedCost;

    const heldItems = ["male", "female"].filter((side) => {
      const item = entry.heldPlan?.[side];
      return item && item !== NONE_ITEM.short && item !== NONE_ITEM.name;
    }).length;
    return (heldItems + (entry.gender === "male" ? 1 : 0)) * 500;
  }

  function formatMoney(amount) {
    return `$${amount.toLocaleString("es-CL")}`;
  }

  function updateBreedTotal() {
    const total = saved.reduce((sum, entry) => sum + getBreedCost(entry), 0);
    if (els.breedTotal) {
      els.breedTotal.textContent = `Total crianza: ${formatMoney(total)}`;
    }
  }

  function renderTextBoxes(updatePageList = true) {
    els.canvas.querySelectorAll(".note-text").forEach((el) => el.remove());

    for (const textBox of textBoxes) {
      const box = document.createElement("article");
      box.className = "note-text";
      box.style.left = `${textBox.x}px`;
      box.style.top = `${textBox.y}px`;
      box.style.width = `${textBox.width || 240}px`;
      box.dataset.uid = textBox.uid;

      const handle = document.createElement("button");
      handle.type = "button";
      handle.className = "note-text__handle";
      handle.textContent = "Mover texto";
      handle.setAttribute("aria-label", "Mover casilla de texto");
      handle.addEventListener("pointerdown", (e) =>
        onTextPointerDown(e, box, textBox)
      );

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "note-text__delete";
      remove.textContent = "×";
      remove.setAttribute("aria-label", "Eliminar texto");
      remove.addEventListener("click", () => deleteTextBox(textBox.uid));

      const textarea = document.createElement("textarea");
      textarea.className = "note-text__input";
      textarea.value = textBox.text || "";
      textarea.placeholder = "Escribe aquí…";
      textarea.setAttribute("aria-label", "Texto de la nota");
      textarea.addEventListener("input", () => {
        textBox.text = textarea.value;
        persist();
      });

      box.append(handle, remove, textarea);
      els.canvas.appendChild(box);
    }
    if (updatePageList) renderPages();
  }

  function createTextBox(e) {
    const position = sheetPoint(e);
    pushUndo();
    const textBox = {
      uid: makeId(),
      x: Math.max(0, Math.min(SHEET_W - 240, position.x)),
      y: Math.max(0, Math.min(SHEET_H - 80, position.y)),
      width: 240,
      text: "",
    };
    textBoxes.push(textBox);
    persist();
    renderTextBoxes();
    setTool("move");
    els.canvas.querySelector(`[data-uid="${textBox.uid}"] .note-text__input`)?.focus();
  }

  function deleteTextBox(uid) {
    pushUndo();
    textBoxes = textBoxes.filter((textBox) => textBox.uid !== uid);
    persist();
    renderTextBoxes();
  }

  function onTextPointerDown(e, box, textBox) {
    if (tool !== "move" || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    box.setPointerCapture(e.pointerId);
    drag = {
      kind: "text",
      uid: textBox.uid,
      card: box,
      entry: textBox,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      offsetX: e.clientX - box.getBoundingClientRect().left,
      offsetY: e.clientY - box.getBoundingClientRect().top,
      maxW: textBox.width || 240,
      maxH: box.offsetHeight || 80,
    };
  }

  function onCardPointerDown(e, card, entry) {
    if (tool !== "move") return;
    if (e.target.closest("[data-delete]")) return;
    if (e.button !== undefined && e.button !== 0) return;

    if (pairSourceUid) {
      e.preventDefault();
      e.stopPropagation();
      tryPairWith(entry);
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    card.setPointerCapture(e.pointerId);

    drag = {
      kind: "card",
      uid: entry.uid,
      card,
      entry,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      offsetX: e.clientX - card.getBoundingClientRect().left,
      offsetY: e.clientY - card.getBoundingClientRect().top,
      maxW: CARD_W,
      maxH: CARD_H,
    };
  }

  function onSheetPanStart(e) {
    if (tool !== "move") return;
    if (e.button !== undefined && e.button !== 0) return;
    if (
      e.target.closest(
        ".saved-card, .paste-shot, .note-text, .saved-card__delete, .paste-shot__delete, .dex-spawn, .companion"
      )
    ) {
      return;
    }

    e.preventDefault();
    hideMenu();
    drag = {
      kind: "pan",
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: els.sheetScroll.scrollLeft,
      scrollTop: els.sheetScroll.scrollTop,
      moved: false,
    };
    els.sheetScroll.classList.add("is-panning");
    try {
      els.sheetScroll.setPointerCapture(e.pointerId);
    } catch (_) {
      /* ignore */
    }
  }

  function onPointerMove(e) {
    if (drawing) {
      drawAt(e);
      return;
    }

    if (!drag) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (drag.kind === "pan") {
      if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        drag.moved = true;
      }
      if (!drag.moved) return;
      els.sheetScroll.scrollLeft = drag.scrollLeft - dx;
      els.sheetScroll.scrollTop = drag.scrollTop - dy;
      return;
    }

    if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      drag.moved = true;
      if (!drag.undoPushed && (drag.kind === "card" || drag.kind === "paste" || drag.kind === "text")) {
        pushUndo();
        drag.undoPushed = true;
      }
      drag.card?.classList.add("is-dragging");
      hideMenu();
    }
    if (!drag.moved) return;

    const sheetRect = els.sheet.getBoundingClientRect();
    const scaleX = sheetRect.width / SHEET_W || 1;
    const scaleY = sheetRect.height / SHEET_H || 1;
    const maxW = drag.maxW || CARD_W;
    const maxH = drag.maxH || CARD_H;
    let x = (e.clientX - sheetRect.left - drag.offsetX) / scaleX;
    let y = (e.clientY - sheetRect.top - drag.offsetY) / scaleY;
    x = Math.max(0, Math.min(SHEET_W - maxW, x));
    y = Math.max(0, Math.min(SHEET_H - maxH, y));

    drag.card.style.left = `${x}px`;
    drag.card.style.top = `${y}px`;
    if (drag.kind === "card" && drag.entry) {
      drag.entry.x = x;
      drag.entry.y = y;
      renderBreedLinks();
    }
  }

  function onPointerUp(e) {
    if (drawing) {
      drawing = false;
      lastDraw = null;
      persistDrawing();
      return;
    }

    if (!drag) return;

    const { card, entry, moved, uid, kind } = drag;

    if (kind === "pan") {
      els.sheetScroll.classList.remove("is-panning");
      drag = null;
      return;
    }

    card?.classList.remove("is-dragging");

    if (moved) {
      const x = snap(parseFloat(card.style.left) || 0);
      const y = snap(parseFloat(card.style.top) || 0);
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      entry.x = x;
      entry.y = y;
      persist();
    } else if (kind !== "paste" && kind !== "text") {
      openMenu(e.clientX, e.clientY, uid);
    }

    drag = null;
  }

  function openMenu(x, y, uid) {
    menuUid = uid;
    const entry = saved.find((s) => s.uid === uid);
    if (els.menuReady) {
      els.menuReady.textContent = entry?.ready ? "Quitar listo" : "Marcar listo";
    }
    els.contextMenu.classList.remove("hidden");
    const pad = 8;
    const mw = els.contextMenu.offsetWidth || 160;
    const mh = els.contextMenu.offsetHeight || 90;
    els.contextMenu.style.left = `${Math.min(x, window.innerWidth - mw - pad)}px`;
    els.contextMenu.style.top = `${Math.min(y, window.innerHeight - mh - pad)}px`;
  }

  function hideMenu() {
    menuUid = null;
    els.contextMenu.classList.add("hidden");
  }

  function startUnite() {
    if (!menuUid) return;
    pairSourceUid = menuUid;
    hideMenu();
    els.pairBanner.classList.remove("hidden");
    renderSaved();
    showToast("Ahora elige la pareja (género opuesto)");
  }

  function cancelUnite() {
    pairSourceUid = null;
    els.pairBanner.classList.add("hidden");
    renderSaved();
  }

  function tryPairWith(partner) {
    const source = saved.find((s) => s.uid === pairSourceUid);
    if (!source) {
      cancelUnite();
      return;
    }

    if (partner.uid === source.uid) {
      showToast("Elige otro Pokémon");
      return;
    }

    if (source.gender === partner.gender) {
      showToast("Necesitas un hombre y una mujer");
      return;
    }

    if (!canBreed(source, partner)) {
      showToast("No comparten grupo huevo compatible");
      return;
    }

    const male = source.gender === "male" ? source : partner;
    const female = source.gender === "female" ? source : partner;
    const species = offspringSpecies(male, female);
    const pred = predictBreed(male, female);

    pendingBreed = {
      male,
      female,
      babyIvs: pred.babyIvs,
      species,
      itemPlan: pred.itemPlan,
      pred,
    };
    cancelUnite();
    openBreedModal();
  }

  function openBreedModal() {
    const { male, female, babyIvs, species, itemPlan, pred } = pendingBreed;
    const p = pred || predictBreed(male, female);
    const plan = itemPlan || p.itemPlan;
    babyGender = "female";

    if (els.breedSteps) {
      els.breedSteps.innerHTML = p.steps
        .map(
          (line, i) =>
            `<li><span class="breed-steps__n">${i + 1}</span> ${line}</li>`
        )
        .join("");
    }

    els.breedSummary.innerHTML = `
      Uniendo <strong>${capitalize(male.name)}</strong> ♂ (${p.maleP}×31) +
      <strong>${capitalize(female.name)}</strong> ♀ (${p.femaleP}×31)<br />
      Cría: <strong>${capitalize(species.name)}</strong>
      · <strong>${p.guaranteedPerfects} IV(s)</strong> fijos por pesa
      ${p.isBuildUp ? `· pool <strong>${p.poolPerfects}×31</strong>` : ""}.<br />
      Costo de esta crianza: <strong id="breed-cost">${formatMoney(calculateBreedCost(plan, babyGender))}</strong>
      (<span>${plan.guaranteed} pesa(s) × $500</span><span id="breed-cost-details">${babyGender === "male" ? " + cambio de género × $500" : ""}</span>).
    `;

    const sharedKeys = p.sharedKeys || [];
    els.breedIvs.innerHTML = IV_STATS.map((stat) => {
      const k = stat.key;
      const v = babyIvs[k];
      const forced = p.forcedKeys.includes(k);
      const shared = sharedKeys.includes(k);
      if (forced) {
        return `<span class="${v === 31 ? "is-max" : ""}">${stat.label} ${v} <small>pesa</small></span>`;
      }
      if (shared) {
        return `<span class="is-max is-shared">${stat.label} 31 <small>compartido</small></span>`;
      }
      return `<span class="is-gap">${stat.label} — <small>azar</small></span>`;
    }).join("");

    if (els.breedItems) {
      els.breedItems.innerHTML =
        itemCardHtml("male", male, plan.maleItem) +
        itemCardHtml("female", female, plan.femaleItem);
    }
    if (els.breedItemsWhy) {
      els.breedItemsWhy.textContent = plan.why;
    }

    els.breedMale.classList.remove("is-selected");
    els.breedFemale.classList.add("is-selected");
    els.breedModal.classList.remove("hidden");
    els.breedModal.setAttribute("aria-hidden", "false");
  }

  function closeBreedModal() {
    pendingBreed = null;
    els.breedModal.classList.add("hidden");
    els.breedModal.setAttribute("aria-hidden", "true");
  }

  function confirmBreed() {
    if (!pendingBreed) return;
    const { male, female, babyIvs, species, itemPlan } = pendingBreed;
    const breedCost = calculateBreedCost(itemPlan, babyGender);
    const midX = (male.x + female.x) / 2;
    const midY = Math.max(male.y, female.y);
    const pos = nextFreePosition(midX, midY);
    pushUndo();

    const ivValues = { ...babyIvs };
    const entry = {
      uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      id: species.id,
      name: species.name,
      sprite: species.sprite,
      gender: babyGender,
      nature: "",
      eggGroups: [...(species.eggGroups || [])],
      ivs: ivValues,
      lineTags: tagsFromIvs(ivValues),
      x: pos.x,
      y: pos.y,
      isBaby: true,
      parents: `${capitalize(male.name)} ♂ × ${capitalize(female.name)} ♀`,
      parentUids: [male.uid, female.uid],
      heldPlan: itemPlan
        ? {
            male: itemPlan.maleItem.short || itemPlan.maleItem.name,
            female: itemPlan.femaleItem.short || itemPlan.femaleItem.name,
          }
        : null,
      breedCost,
      createdAt: new Date().toISOString(),
    };

    saved.push(entry);
    persist();
    closeBreedModal();
    renderSaved();
    playBreedSfx();
    onDexBreedActivity();
    showToast(`¡Cría de ${capitalize(species.name)} creada!`);
  }

  function sheetPoint(e) {
    const rect = els.draw.getBoundingClientRect();
    const scaleX = SHEET_W / rect.width;
    const scaleY = SHEET_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function drawAt(e) {
    const p = sheetPoint(e);
    drawCtx.lineCap = "round";
    drawCtx.lineJoin = "round";

    if (tool === "eraser") {
      drawCtx.globalCompositeOperation = "destination-out";
      drawCtx.lineWidth = 22;
    } else {
      drawCtx.globalCompositeOperation = "source-over";
      drawCtx.strokeStyle = "#f0c14a";
      drawCtx.lineWidth = 3;
    }

    drawCtx.beginPath();
    if (lastDraw) {
      drawCtx.moveTo(lastDraw.x, lastDraw.y);
      drawCtx.lineTo(p.x, p.y);
    } else {
      drawCtx.moveTo(p.x, p.y);
      drawCtx.lineTo(p.x + 0.1, p.y);
    }
    drawCtx.stroke();
    lastDraw = p;
  }

  function onDrawPointerDown(e) {
    if (tool !== "pencil" && tool !== "eraser") return;
    pushUndo();
    drawing = true;
    lastDraw = null;
    drawAt(e);
  }

  function deleteEntry(uid) {
    pushUndo();
    saved = saved.filter((e) => e.uid !== uid);
    persist();
    hideMenu();
    renderSaved();
    showToast("Eliminado del cuaderno");
  }

  function clearAll() {
    const page = getActivePage();
    if (!saved.length && !pasted.length && !textBoxes.length && !page.drawing) return;
    if (!confirm(`¿Vaciar Pokémon, fotos, textos y dibujos de "${page.name}"?`)) return;
    pushUndo();
    saved = [];
    pasted = [];
    textBoxes = [];
    selectedPasteUid = null;
    persist();
    clearDrawing(true);
    cancelUnite();
    hideMenu();
    renderSaved();
    showToast("Página vacía");
  }

  const BOX_DIGITS = {
    "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
    "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", "#####"],
    "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
    "3": [".###.", "#...#", "....#", "..##.", "....#", "#...#", ".###."],
    "4": ["...##", "..#.#", ".#..#", "#...#", "#####", "....#", "....#"],
    "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
    "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
    "7": ["#####", "#...#", "....#", "...#.", "..#..", "...#.", "....#"],
    "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
    "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  };

  let boxMons = [];

  function isBoxMalePixel(r, g, b) {
    return g > 190 && b > 190 && r < 170 && g - r > 60;
  }

  function isBoxFemalePixel(r, g, b) {
    return r > 190 && g < 150 && b < 160 && r - g > 70;
  }

  function isBoxWhitePixel(r, g, b) {
    return r > 200 && g > 200 && b > 200;
  }

  function trimGlyphColumns(rows) {
    const width = rows[0]?.length || 0;
    let left = 0;
    let right = width - 1;
    const empty = (x) => rows.every((row) => row[x] !== "#");
    while (left <= right && empty(left)) left += 1;
    while (right >= left && empty(right)) right -= 1;
    if (left > right) return rows.map(() => "");
    return rows.map((row) => row.slice(left, right + 1));
  }

  function glyphScore(glyph, template) {
    const rows = trimGlyphColumns(glyph);
    const height = template.length;
    const width = template[0].length;
    if (!rows[0] || rows.length !== height) return 0;
    let same = 0;
    for (let y = 0; y < height; y += 1) {
      const row = rows[y];
      for (let x = 0; x < width; x += 1) {
        const sx =
          row.length === width
            ? x
            : Math.min(row.length - 1, Math.floor(((x + 0.5) * row.length) / width));
        const on = row[sx] === "#";
        const expected = template[y][x] === "#";
        if (on === expected) same += 1;
      }
    }
    return same / (width * height);
  }

  function readLevelAt(sample, slot, pitch, width, height) {
    const textH = Math.max(7, pitch * (7 / 54));
    const x0 = Math.round(slot.x - pitch * 0.66);
    const x1 = Math.round(slot.x - pitch * 0.12);
    const y0 = Math.round(slot.y - textH * 0.55);
    const srcW = Math.max(8, x1 - x0 + 1);
    const normH = 7;
    const normW = Math.max(12, Math.round((srcW * normH) / textH));
    const grid = [];
    for (let ny = 0; ny < normH; ny += 1) {
      let row = "";
      const y = Math.max(0, Math.min(height - 1, Math.round(y0 + ((ny + 0.5) * textH) / normH)));
      for (let nx = 0; nx < normW; nx += 1) {
        const x = Math.max(0, Math.min(width - 1, Math.round(x0 + ((nx + 0.5) * srcW) / normW)));
        const [r, g, b] = sample(x, y);
        row += isBoxWhitePixel(r, g, b) ? "#" : ".";
      }
      grid.push(row);
    }

    const glyphs = [];
    let current = null;
    for (let x = 0; x < normW; x += 1) {
      const ink = grid.some((row) => row[x] === "#");
      if (!ink) {
        if (current) glyphs.push(current);
        current = null;
        continue;
      }
      if (!current) current = grid.map(() => "");
      for (let y = 0; y < normH; y += 1) current[y] += grid[y][x];
    }
    if (current) glyphs.push(current);

    let digits = "";
    for (const glyph of glyphs) {
      const ink = glyph.join("").split("#").length - 1;
      if (ink < 6) continue;
      let best = "";
      let score = 0;
      for (const [digit, template] of Object.entries(BOX_DIGITS)) {
        const next = glyphScore(glyph, template);
        if (next > score) {
          score = next;
          best = digit;
        }
      }
      if (score >= 0.78) digits += best;
    }
    const level = Number(digits);
    if (!Number.isInteger(level) || level < 1 || level > 100) return null;
    return level;
  }

  function ivMarkKey(r, g, b) {
    if (r > 170 && g > 170 && b < 120) return "spd";
    if (r > 165 && b > 140 && g < 145 && b - g > 25) return "spa";
    if (r > 170 && g > 95 && g < 210 && b < 95 && r - b > 70) return "def";
    if (g > 150 && r < 155 && b < 175 && g - r > 30 && g + 25 >= b) return "hp";
    if (r > 175 && g < 145 && b < 155 && r - g > 40) return "atk";
    if (g > 150 && b > 150 && r < 155 && Math.min(g, b) - r > 30) return "spe";
    return "";
  }

  function readPerfectMarks(sample, slot, pitch, width, height) {
    const x0 = Math.max(0, Math.round(slot.x - pitch * 0.58));
    const x1 = Math.min(width - 1, Math.round(slot.x + pitch * 0.08));
    const y0 = Math.max(0, Math.round(slot.y + pitch * 0.22));
    const y1 = Math.min(height - 1, Math.round(slot.y + pitch * 0.9));
    const counts = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        const key = ivMarkKey(...sample(x, y));
        if (key) counts[key] += 1;
      }
    }
    const need = Math.max(5, Math.round(pitch * 0.12));
    return IV_STATS.map((stat) => stat.key).filter((key) => counts[key] >= need);
  }

  function readBoxScreenshot(image) {
    const maxSide = 1100;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    const sample = (x, y) => {
      const i = (y * width + x) * 4;
      return [pixels[i], pixels[i + 1], pixels[i + 2]];
    };

    const radius = Math.max(4, Math.round(width / 70));
    const blobs = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const [r, g, b] = sample(x, y);
        const male = isBoxMalePixel(r, g, b);
        const female = isBoxFemalePixel(r, g, b);
        if (!male && !female) continue;
        let blob = null;
        for (const candidate of blobs) {
          const cx = candidate.sx / candidate.n;
          const cy = candidate.sy / candidate.n;
          if (Math.abs(cx - x) <= radius && Math.abs(cy - y) <= radius) {
            blob = candidate;
            break;
          }
        }
        if (!blob) {
          blob = { sx: 0, sy: 0, n: 0, male: 0, female: 0, minX: x, maxX: x, minY: y, maxY: y };
          blobs.push(blob);
        }
        blob.sx += x;
        blob.sy += y;
        blob.n += 1;
        if (male) blob.male += 1;
        if (female) blob.female += 1;
        blob.minX = Math.min(blob.minX, x);
        blob.maxX = Math.max(blob.maxX, x);
        blob.minY = Math.min(blob.minY, y);
        blob.maxY = Math.max(blob.maxY, y);
      }
    }

    const icons = blobs
      .filter((blob) => blob.n >= 6 && blob.maxX - blob.minX < radius * 4 && blob.maxY - blob.minY < radius * 4)
      .map((blob) => ({
        x: blob.sx / blob.n,
        y: blob.sy / blob.n,
        gender: blob.male >= blob.female ? "male" : "female",
      }));
    if (icons.length < 1) {
      return { error: "No encontré los símbolos ♂ y ♀. El pantallazo tiene que mostrar la caja completa." };
    }

    icons.sort((a, b) => a.y - b.y || a.x - b.x);
    const xGaps = [];
    const byX = [...icons].sort((a, b) => a.x - b.x);
    for (let i = 1; i < byX.length; i += 1) {
      const gap = byX[i].x - byX[i - 1].x;
      if (gap > radius * 2) xGaps.push(gap);
    }
    let roughPitch = radius * 8;
    if (xGaps.length) {
      const bins = new Map();
      for (const gap of xGaps) {
        const bin = Math.round(gap / radius) * radius;
        bins.set(bin, (bins.get(bin) || 0) + 1);
      }
      let bestCount = 0;
      for (const [bin, count] of bins) {
        if (bin >= radius * 5 && count >= bestCount) {
          roughPitch = bin;
          bestCount = count;
        }
      }
    }
    const slotIcons = [];
    for (const icon of icons) {
      const stacked = slotIcons.some(
        (kept) =>
          Math.abs(kept.x - icon.x) < roughPitch * 0.72 &&
          icon.y > kept.y + roughPitch * 0.16 &&
          icon.y < kept.y + roughPitch * 0.85
      );
      if (!stacked) slotIcons.push(icon);
    }
    icons.length = 0;
    icons.push(...slotIcons);

    const rows = [];
    for (const icon of icons) {
      const row = rows.find((entry) => Math.abs(entry.y - icon.y) < radius * 1.6);
      if (row) {
        row.items.push(icon);
        row.y = row.items.reduce((sum, item) => sum + item.y, 0) / row.items.length;
      } else {
        rows.push({ y: icon.y, items: [icon] });
      }
    }
    const gaps = [];
    for (const row of rows) {
      row.items.sort((a, b) => a.x - b.x);
      for (let i = 1; i < row.items.length; i += 1) {
        gaps.push(row.items[i].x - row.items[i - 1].x);
      }
    }
    gaps.sort((a, b) => a - b);
    const pitch = gaps.length ? gaps[Math.floor(gaps.length / 2)] : radius * 8;

    const mons = [];
    for (const row of rows) {
      for (const slot of row.items) {
        mons.push({
          gender: slot.gender,
          level: readLevelAt(sample, slot, pitch, width, height),
          perfect: readPerfectMarks(sample, slot, pitch, width, height),
        });
      }
    }
    return { mons };
  }

  function fillBoxSpeciesList() {
    if (!els.boxSpeciesList || els.boxSpeciesList.dataset.ready) return;
    const html = pokemonCatalog
      .map((poke) => `<option value="${escapeHtml(poke.name)}"></option>`)
      .join("");
    els.boxSpeciesList.innerHTML = html;
    if (pokemonCatalog.length) els.boxSpeciesList.dataset.ready = "1";
  }

  function renderBoxPreview() {
    if (!els.boxPreview) return;
    els.boxPreview.innerHTML = boxMons
      .map((mon, index) => {
        const symbol = mon.gender === "male" ? "♂" : "♀";
        const who = mon.gender === "male" ? "Hombre" : "Mujer";
        const marks = (mon.perfect || [])
          .map((key) => IV_STATS.find((stat) => stat.key === key)?.label || key)
          .join(" ");
        return `
          <div class="box-row">
            <span class="box-row__gender" data-gender="${mon.gender}">${symbol} ${who}${marks ? ` · ${marks}` : ""}</span>
            <input type="number" min="1" max="100" data-box-level="${index}" value="${mon.level ?? ""}" aria-label="Nivel ${index + 1}" />
            <button type="button" class="btn btn--ghost btn--sm" data-box-skip="${index}">Quitar</button>
          </div>
        `;
      })
      .join("");
    const readable = boxMons.filter((mon) => mon.level).length;
    if (els.boxStatus) {
      els.boxStatus.textContent = boxMons.length
        ? `${boxMons.length} Pokémon · ${readable} con nivel leído. Confirma la especie.`
        : "Todavía no hay Pokémon leídos.";
    }
    if (els.boxConfirm) els.boxConfirm.disabled = boxMons.length === 0;
  }

  function openBoxModal() {
    fillBoxSpeciesList();
    els.boxModal?.classList.remove("hidden");
    els.boxModal?.setAttribute("aria-hidden", "false");
    els.boxSpecies?.focus();
  }

  function closeBoxModal() {
    els.boxModal?.classList.add("hidden");
    els.boxModal?.setAttribute("aria-hidden", "true");
  }

  function loadBoxFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Elige una imagen de la caja");
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const result = readBoxScreenshot(image);
      if (result.error) {
        boxMons = [];
        renderBoxPreview();
        if (els.boxStatus) els.boxStatus.textContent = result.error;
        if (els.boxConfirm) els.boxConfirm.disabled = true;
        return;
      }
      boxMons = result.mons;
      renderBoxPreview();
      openBoxModal();
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      showToast("No se pudo abrir la imagen");
    };
    image.src = url;
  }

  function findBoxSpecies(name) {
    const query = name.trim().toLowerCase();
    if (!query) return null;
    return (
      pokemonCatalog.find((poke) => poke.name === query) ||
      pokemonCatalog.find((poke) => poke.name.replace(/[^a-z0-9]/g, "") === query.replace(/[^a-z0-9]/g, ""))
    );
  }

  function confirmBoxImport() {
    const species = findBoxSpecies(els.boxSpecies?.value || "");
    if (!species) {
      showToast("Escribe la especie tal como sale en la lista, por ejemplo aron");
      els.boxSpecies?.focus();
      return;
    }
    const pending = boxMons.filter((mon) => !mon.skip);
    if (!pending.length) {
      showToast("No quedó ningún Pokémon para añadir");
      return;
    }
    const perfect = Boolean(els.boxPerfect?.checked);
    pushUndo();
    for (const mon of pending) {
      const ivValues = emptyIvs();
      if (mon.perfect?.length) {
        for (const key of mon.perfect) ivValues[key] = 31;
      } else if (perfect) {
        for (const stat of IV_STATS) ivValues[stat.key] = 31;
      }
      const pos = nextFreePosition();
      const level = Number(mon.level);
      saved.push({
        uid: makeId(),
        id: species.id,
        name: species.name,
        sprite: species.sprite,
        gender: mon.gender,
        nature: "",
        eggGroups: [...(species.eggGroups || [])],
        ivs: ivValues,
        lineTags: tagsFromIvs(ivValues),
        level: Number.isInteger(level) && level >= 1 && level <= 100 ? level : undefined,
        x: pos.x,
        y: pos.y,
        isBaby: false,
        createdAt: new Date().toISOString(),
      });
    }
    persist();
    closeBoxModal();
    renderSaved();
    showToast(`${pending.length} ${capitalize(species.name)} añadidos al cuaderno`);
  }

  async function onPasteClipboard(e) {
    const tag = e.target?.tagName;
    const typing = tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable;
    const text = e.clipboardData?.getData("text/plain")?.trim();
    if (!typing && text && text.startsWith("{") && text.includes("crianza-pokemon-page")) {
      e.preventDefault();
      try {
        applyCrianzaDocument(JSON.parse(text));
      } catch (error) {
        console.error("No se pudo pegar la caja", error);
        showToast(error instanceof SyntaxError ? "El texto pegado no contiene JSON válido" : error.message);
      }
      return;
    }

    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (!item.type.startsWith("image/")) continue;
      e.preventDefault();
      const file = item.getAsFile();
      if (file) {
        if (els.boxModal && !els.boxModal.classList.contains("hidden")) {
          e.preventDefault();
          loadBoxFile(file);
          return;
        }
        await addPastedImage(file);
      }
      return;
    }
  }

  // Botón "Limpiar tinta" siempre con aviso
  function onClearInkClick() {
    clearDrawing(false);
  }

  function clearFormIvs() {
    ivs = emptyIvs();
    setNature("");
    buildIvsUi();
  }

  function closeEditor() {
    selected = null;
    gender = null;
    nature = "";
    ivs = emptyIvs();
    pendingDrop = null;
    els.editor?.classList.add("hidden");
    document.body.classList.remove("has-editor");
    setGender(null);
    renderList(els.search?.value || "");
  }

  function bindEvents() {
    const footerLogoImage = els.footerLogo?.querySelector("img");
    footerLogoImage?.addEventListener("load", () => {
      els.footerLogo.classList.add("has-image");
    });
    footerLogoImage?.addEventListener("error", () => {
      els.footerLogo.classList.remove("has-image");
    });
    if (footerLogoImage?.complete && footerLogoImage.naturalWidth > 0) {
      els.footerLogo.classList.add("has-image");
    }

    els.search.addEventListener("input", () => renderList(els.search.value));
    els.eggSelect?.addEventListener("change", () => {
      selectedEggGroup = els.eggSelect.value || null;
      renderList(els.search.value);
    });
    els.btnZoomIn?.addEventListener("click", () => nudgeZoom(ZOOM_STEP));
    els.btnZoomOut?.addEventListener("click", () => nudgeZoom(-ZOOM_STEP));
    els.sheetScroll?.addEventListener(
      "wheel",
      (e) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        nudgeZoom(delta, {
          anchorClientX: e.clientX,
          anchorClientY: e.clientY,
        });
      },
      { passive: false }
    );
    els.btnMale.addEventListener("click", () => setGender("male"));
    els.btnFemale.addEventListener("click", () => setGender("female"));
    els.nature?.addEventListener("change", () => {
      nature = els.nature.value || "";
    });
    els.btnSave.addEventListener("click", saveEntry);
    els.btnClearForm.addEventListener("click", clearFormIvs);
    els.btnCloseEditor?.addEventListener("click", closeEditor);
    els.btnClearAll?.addEventListener("click", clearAll);
    els.btnClearInk?.addEventListener("click", onClearInkClick);
    els.btnClearShots?.addEventListener("click", clearPastes);
    els.btnNewPage?.addEventListener("click", addPage);
    els.pageSelect?.addEventListener("change", () => {
      const id = els.pageSelect.value;
      if (id) switchPage(id);
    });
    els.btnRenamePage?.addEventListener("click", () => {
      renamePage(store.activeId);
    });
    els.btnDeletePage?.addEventListener("click", () => {
      deletePage(store.activeId);
    });
    const pageMenu = document.getElementById("page-menu");
    const closePageMenu = () => {
      if (pageMenu) pageMenu.open = false;
    };
    els.btnExportPage?.addEventListener("click", () => {
      closePageMenu();
      exportActivePage();
    });
    els.btnImportPage?.addEventListener("click", () => {
      closePageMenu();
      els.pageImportFile?.click();
    });
    els.btnPasteCaja?.addEventListener("click", () => {
      pasteCajaFromClipboard();
    });
    els.btnReadBox?.addEventListener("click", openBoxModal);
    els.boxDrop?.addEventListener("click", () => els.boxFile?.click());
    els.boxFile?.addEventListener("change", () => {
      const file = els.boxFile.files?.[0];
      if (file) loadBoxFile(file);
      els.boxFile.value = "";
    });
    els.boxConfirm?.addEventListener("click", confirmBoxImport);
    els.boxModal?.querySelectorAll("[data-close-box]").forEach((el) => {
      el.addEventListener("click", closeBoxModal);
    });
    els.boxPreview?.addEventListener("input", (e) => {
      const index = Number(e.target.dataset.boxLevel);
      if (!boxMons[index]) return;
      const level = Number(e.target.value);
      boxMons[index].level =
        Number.isInteger(level) && level >= 1 && level <= 100 ? level : null;
    });
    els.boxPreview?.addEventListener("click", (e) => {
      const button = e.target.closest("[data-box-skip]");
      if (!button) return;
      boxMons.splice(Number(button.dataset.boxSkip), 1);
      renderBoxPreview();
    });
    els.boxDrop?.addEventListener("dragover", (e) => {
      e.preventDefault();
      els.boxDrop.classList.add("is-hot");
    });
    els.boxDrop?.addEventListener("dragleave", () => {
      els.boxDrop.classList.remove("is-hot");
    });
    els.boxDrop?.addEventListener("drop", (e) => {
      e.preventDefault();
      els.boxDrop.classList.remove("is-hot");
      const file = e.dataTransfer?.files?.[0];
      if (file) loadBoxFile(file);
    });
    els.btnPublishCommunity?.addEventListener("click", () => {
      closePageMenu();
      publishActivePageToCommunity();
    });
    document.addEventListener("pointerdown", (e) => {
      if (!pageMenu?.open) return;
      if (!pageMenu.contains(e.target)) pageMenu.open = false;
    });
    const bindNavTools = () => {
      els.btnUpdates = document.getElementById("btn-updates");
      els.btnCompanion = document.getElementById("btn-companion");
      const btnSfx = document.getElementById("btn-sfx");
      if (els.btnUpdates) els.btnUpdates.onclick = () => openUpdatesModal();
      if (els.btnCompanion) els.btnCompanion.onclick = () => openCompanionModal();
      if (btnSfx) btnSfx.onclick = () => toggleSfxMute();
      syncSfxButton();
    };
    bindNavTools();
    document.addEventListener("crianza:nav", bindNavTools);
    document.addEventListener("crianza:auth", bindNavTools);

    els.tagFilter?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tag-filter]");
      if (!btn) return;
      setTagFilter(btn.getAttribute("data-tag-filter") || "");
    });
    buildTagFilterUi();
    els.pageImportFile?.addEventListener("change", (e) =>
      importPageFile(e.target.files?.[0])
    );

    els.updatesModal?.querySelectorAll("[data-close-updates]").forEach((el) => {
      el.addEventListener("click", closeUpdatesModal);
    });
    els.companionModal?.querySelectorAll("[data-close-companion]").forEach((el) => {
      el.addEventListener("click", closeCompanionModal);
    });
    els.btnCompanionHide?.addEventListener("click", hideCompanion);
    els.btnDexEvolve?.addEventListener("click", evolveActiveCompanion);
    els.dexSearch?.addEventListener("input", () => renderDexPanel());
    els.companion?.addEventListener("click", openCompanionModal);
    els.starterPicks?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-starter]");
      if (!btn) return;
      chooseStarter(Number(btn.getAttribute("data-starter")));
    });
    els.dexSpawn?.addEventListener("pointerdown", (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      tryCatchSpawn();
    });
    els.dexSpawn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    window.addEventListener("resize", () => {
      coverSheetViewport();
      if (!companionState.hidden) renderCompanion();
    });
    els.sheetScroll?.addEventListener(
      "scroll",
      () => {
        if (!companionState.hidden) {
          const bounds = companionBounds();
          companionState.x = Math.max(bounds.minX, Math.min(bounds.maxX, companionState.x));
          companionState.y = bounds.y;
          if (els.companion) {
            els.companion.style.left = `${companionState.x}px`;
            els.companion.style.top = `${companionState.y}px`;
          }
        }
      },
      { passive: true }
    );
    window.addEventListener("beforeunload", () => persistCompanionState());

    els.sheet?.addEventListener("dragover", onSheetDragOver);
    els.sheet?.addEventListener("dragleave", onSheetDragLeave);
    els.sheet?.addEventListener("drop", onSheetDrop);
    els.sheetScroll?.addEventListener("pointerdown", onSheetPanStart);
    els.sheetScroll?.addEventListener("click", (e) => {
      if (tool !== "text") return;
      if (e.target.closest(".saved-card, .paste-shot, .note-text")) return;
      createTextBox(e);
    });
    els.list?.addEventListener("pointerdown", onListPanStart);
    els.list?.addEventListener("pointermove", onListPanMove);
    els.list?.addEventListener("pointerup", onListPanEnd);
    els.list?.addEventListener("pointercancel", onListPanEnd);
    els.list?.addEventListener("scroll", scheduleListPaint, { passive: true });
    if (els.list && "ResizeObserver" in window) {
      new ResizeObserver(() => {
        listRangeKey = "";
        scheduleListPaint();
      }).observe(els.list);
    }

    document.querySelectorAll(".tool-btn[data-tool]").forEach((btn) => {
      btn.addEventListener("click", () => setTool(btn.dataset.tool));
    });

    els.canvas.addEventListener("click", (e) => {
      const pasteBtn = e.target.closest("[data-delete-paste]");
      if (pasteBtn) {
        e.stopPropagation();
        deletePaste(pasteBtn.dataset.deletePaste);
        return;
      }
      const btn = e.target.closest("[data-delete]");
      if (!btn) return;
      e.stopPropagation();
      deleteEntry(btn.dataset.delete);
    });

    els.menuReady?.addEventListener("click", () => {
      if (menuUid) toggleReady(menuUid);
    });
    els.menuUnite.addEventListener("click", startUnite);
    els.menuDelete.addEventListener("click", () => {
      if (menuUid) deleteEntry(menuUid);
    });

    document.addEventListener("pointerdown", (e) => {
      if (!els.contextMenu.contains(e.target)) hideMenu();
    });

    document.addEventListener("paste", onPasteClipboard);

    document.addEventListener("keydown", (e) => {
      const tag = document.activeElement?.tagName;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (typing) return;
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        if (typing) return;
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === "Escape") {
        if (els.starterModal && !els.starterModal.classList.contains("hidden")) {
          /* Hay que elegir inicial; no se cierra con Esc. */
          return;
        }
        if (els.breedModal && !els.breedModal.classList.contains("hidden")) {
          closeBreedModal();
          return;
        }
        if (els.updatesModal && !els.updatesModal.classList.contains("hidden")) {
          closeUpdatesModal();
          return;
        }
        if (els.companionModal && !els.companionModal.classList.contains("hidden")) {
          closeCompanionModal();
          return;
        }
        if (els.editor && !els.editor.classList.contains("hidden")) {
          closeEditor();
          return;
        }
        cancelUnite();
        hideMenu();
        selectedPasteUid = null;
        renderPastes();
      }
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedPasteUid &&
        !typing
      ) {
        e.preventDefault();
        deletePaste(selectedPasteUid);
      }
    });

    els.breedMale.addEventListener("click", () => {
      babyGender = "male";
      els.breedMale.classList.add("is-selected");
      els.breedFemale.classList.remove("is-selected");
      updateBreedCostPreview();
    });
    els.breedFemale.addEventListener("click", () => {
      babyGender = "female";
      els.breedFemale.classList.add("is-selected");
      els.breedMale.classList.remove("is-selected");
      updateBreedCostPreview();
    });
    els.breedConfirm.addEventListener("click", confirmBreed);
    els.breedModal.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", closeBreedModal);
    });

    els.draw.addEventListener("pointerdown", onDrawPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  function maybeImportFromCommunity() {
    const params = new URLSearchParams(location.search);
    if (params.get("import") !== "community") return;
    const raw = sessionStorage.getItem("crianza-import-payload");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      sessionStorage.removeItem("crianza-import-payload");
      importCommunityPayload(data);
      history.replaceState({}, "", "index.html");
    } catch (err) {
      console.error(err);
      showToast("No se pudo abrir la crianza de la comunidad");
    }
  }

  async function init() {
    bindEvents();
    fillNatureSelect();
    buildIvsUi();
    renderPages();
    renderEggSelect();
    updateZoomLabel();
    coverSheetViewport();
    setTool("move");
    loadDrawingFromPage();
    renderSaved();
    renderPastes();
    persistCompanionState();
    renderCompanion();
    if (needsStarterChoice()) {
      openStarterModal();
    }
    maybeImportFromCommunity();
    clearInterval(dexEncounterTimer);
    dexEncounterTimer = setInterval(() => {
      /* Tras 30+ min de cooldown, baja probabilidad de que salga uno. */
      maybeDexEncounter(0.2);
      if (!companionState.hidden) renderCompanion();
      if (els.companionModal && !els.companionModal.classList.contains("hidden")) {
        renderDexPanel();
      }
    }, 10 * 60 * 1000);
    setInterval(() => {
      if (companionState.hidden) return;
      const ready = canEvolveActive();
      const shown = els.companion?.classList.contains("can-evolve");
      if (ready !== shown) renderCompanion();
      if (ready && els.companionModal && !els.companionModal.classList.contains("hidden")) {
        renderDexPanel();
      }
    }, 5000);

    window.CrianzaApp = {
      buildActivePagePayload,
      importCommunityPayload,
    };

    try {
      if (els.listStatus) {
        els.listStatus.textContent = window.CRIANZA_CATALOG
          ? "Cargando Pokédex…"
          : "Cargando Pokédex (necesita internet o data/catalog.js)…";
      }
      await fetchCatalog();
      els.listStatus?.remove();
      renderEggSelect();
      renderList();
      setCompanionSprite(companionState.id);
    } catch (err) {
      if (els.listStatus) {
        els.listStatus.textContent =
          "Error al cargar Pokémon. En Edge abre con un servidor local o asegúrate de tener data/catalog.js junto al HTML.";
      }
      console.error(err);
    }
  }

  init();
})();
