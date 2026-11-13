(() => {
  const PAGES_KEY = "crianza-pages-v2";
  const PAGE_FILE_FORMAT = "crianza-pokemon-page";
  const LEGACY_STORAGE_KEY = "crianza-cuaderno-v1";
  const LEGACY_DRAW_KEY = "crianza-dibujo-v1";
  const POKE_LIMIT = 1025;
  const API = "https://pokeapi.co/api/v2";
  const GRID = 8;
  const CARD_W = 150;
  const CARD_H = 230;
  const SHEET_W = 5000;
  const SHEET_H = 5000;
  const DRAG_THRESHOLD = 6;

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
    eggChips: document.getElementById("egg-chips"),
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
    btnExportPage: document.getElementById("btn-export-page"),
    btnImportPage: document.getElementById("btn-import-page"),
    btnPublishCommunity: document.getElementById("btn-publish-community"),
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
    menuUnite: document.getElementById("menu-unite"),
    menuDelete: document.getElementById("menu-delete"),
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
  };

  const drawCtx = els.draw.getContext("2d");

  let pokemonCatalog = [];
  let selectedEggGroup = null;
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
  let pairSourceUid = null;
  let pendingBreed = null;
  let babyGender = "female";
  let pendingDrop = null;
  let listPan = null;
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
    if (!els.pagesList) return;
    els.pagesList.innerHTML = "";
    for (const page of store.pages) {
      const row = document.createElement("div");
      row.className =
        "page-tab" + (page.id === store.activeId ? " is-active" : "");
      row.setAttribute("role", "tab");
      row.setAttribute("aria-selected", page.id === store.activeId ? "true" : "false");

      const info = document.createElement("div");
      info.className = "page-tab__info";

      const nameBtn = document.createElement("button");
      nameBtn.type = "button";
      nameBtn.className = "page-tab__name";
      nameBtn.textContent = page.name;
      nameBtn.title = page.name;
      nameBtn.addEventListener("click", () => switchPage(page.id));

      const meta = document.createElement("span");
      meta.className = "page-tab__meta";
      meta.textContent =
        `${page.saved.length} Pokémon · ${page.pasted.length} fotos · ${page.textBoxes.length} notas`;
      meta.title = meta.textContent;
      info.append(nameBtn, meta);

      const renameBtn = document.createElement("button");
      renameBtn.type = "button";
      renameBtn.className = "page-tab__rename";
      renameBtn.title = "Renombrar";
      renameBtn.textContent = "✎";
      renameBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        renamePage(page.id);
      });

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "page-tab__delete";
      delBtn.title = "Eliminar página";
      delBtn.textContent = "×";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deletePage(page.id);
      });

      row.append(info, renameBtn, delBtn);
      els.pagesList.appendChild(row);
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
    if (!window.isFirebaseConfigured || !window.isFirebaseConfigured()) {
      showToast("Configura firebase-config.js para publicar");
      return;
    }
    if (!window.__crianzaUser) {
      showToast("Inicia sesión con Google para subir");
      return;
    }
    try {
      const payload = buildActivePagePayload();
      sessionStorage.setItem("crianza-publish-payload", JSON.stringify(payload));
      location.href = "comunidad.html#publish";
    } catch (err) {
      console.error(err);
      showToast("No se pudo preparar la publicación");
    }
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
      (source.drawing !== null &&
        (typeof source.drawing !== "string" ||
          !/^data:image\/png;base64,[a-z\d+/=]+$/i.test(source.drawing)))
    ) {
      throw new Error("El archivo de página está incompleto o tiene datos no válidos");
    }

    const page = createPage(source.name.trim().slice(0, 80) || "Página importada");
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
        eggGroups: Array.isArray(entry.eggGroups)
          ? entry.eggGroups.filter((group) => typeof group === "string").slice(0, 20)
          : [],
        ivs: ivValues,
        x: importedPosition(entry.x, SHEET_W - CARD_W),
        y: importedPosition(entry.y, SHEET_H - CARD_H),
        isBaby: entry.isBaby === true,
        createdAt:
          typeof entry.createdAt === "string"
            ? entry.createdAt
            : new Date().toISOString(),
      };
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
      return imported;
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

  async function importPageFile(file) {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      showToast("El archivo supera el máximo de 100 MB");
      return;
    }
    try {
      const imported = validateImportedPage(JSON.parse(await file.text()));
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
      renderSaved();
      persist();
      showToast(`Página "${imported.name}" importada`);
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

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function genderLabel(g) {
    return g === "male" ? "♂ Hombre" : "♀ Mujer";
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
      move: "Mesa · Unir · Ctrl+Z deshacer · Ctrl+Y rehacer · Ctrl+V",
      pencil: "Modo lápiz: dibuja en la hoja",
      text: "Modo texto: clic en la hoja para añadir una casilla",
      eraser: "Modo borrar: pasa sobre la tinta",
    };
    els.toolHint.textContent = hints[tool];
    hideMenu();
  }

  function countInEggGroup(api) {
    return pokemonCatalog.filter((p) => p.eggGroups.includes(api)).length;
  }

  function renderEggChips() {
    els.eggChips.innerHTML = "";

    const all = document.createElement("button");
    all.type = "button";
    all.className = "egg-chip" + (selectedEggGroup === null ? " is-active" : "");
    all.innerHTML = `Todos<span class="egg-chip__count">${pokemonCatalog.length || ""}</span>`;
    all.addEventListener("click", () => {
      selectedEggGroup = null;
      renderEggChips();
      renderList(els.search.value);
    });
    els.eggChips.appendChild(all);

    for (const group of EGG_GROUPS) {
      const count = countInEggGroup(group.api);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "egg-chip" + (selectedEggGroup === group.api ? " is-active" : "");
      btn.innerHTML = `${group.label}<span class="egg-chip__count">${count || ""}</span>`;
      btn.title = `${group.label} (${count} Pokémon)`;
      btn.addEventListener("click", () => {
        selectedEggGroup =
          selectedEggGroup === group.api ? null : group.api;
        renderEggChips();
        renderList(els.search.value);
      });
      els.eggChips.appendChild(btn);
    }
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

    els.list.innerHTML = "";

    if (!items.length) {
      const p = document.createElement("p");
      p.className = "list-status";
      p.textContent = selectedEggGroup
        ? `Nadie en ${EGG_LABEL[selectedEggGroup]} con ese filtro.`
        : "Sin resultados.";
      els.list.appendChild(p);
      return;
    }

    const frag = document.createDocumentFragment();
    for (const poke of items) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "poke-item" + (selected?.id === poke.id ? " is-active" : "");
      btn.draggable = true;
      btn.title = `${capitalize(poke.name)} — arrastra al cuaderno`;
      btn.innerHTML = `
        <img class="poke-item__sprite" src="${poke.sprite}" alt="" loading="lazy" draggable="false" />
        <span class="poke-item__name">${poke.name}</span>
        <span class="poke-item__id">#${padId(poke.id)}</span>
      `;
      btn.addEventListener("click", () => selectPokemon(poke));
      btn.addEventListener("dragstart", (e) => onPokeDragStart(e, poke, btn));
      btn.addEventListener("dragend", () => onPokeDragEnd(btn));
      frag.appendChild(btn);
    }
    els.list.appendChild(frag);
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

    const entry = {
      uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      id: selected.id,
      name: selected.name,
      sprite: selected.sprite,
      gender,
      nature: nature || "",
      eggGroups: [...(selected.eggGroups || [])],
      ivs: { ...ivs },
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
      src: "assets/power-weight.png",
      name: "Pesa Recia",
      short: "Pesa HP",
      statLabel: "HP",
    },
    atk: {
      id: "bracer",
      src: "assets/power-bracer.png",
      name: "Brazal Recio",
      short: "Brazal Atk",
      statLabel: "Ataque",
    },
    def: {
      id: "belt",
      src: "assets/power-belt.png",
      name: "Cinto Recio",
      short: "Cinto Def",
      statLabel: "Defensa",
    },
    spa: {
      id: "lens",
      src: "assets/power-lens.png",
      name: "Lente Recia",
      short: "Lente SpA",
      statLabel: "At. Esp.",
    },
    spd: {
      id: "band",
      src: "assets/power-band.png",
      name: "Banda Recia",
      short: "Banda SpD",
      statLabel: "Def. Esp.",
    },
    spe: {
      id: "anklet",
      src: "assets/power-anklet.png",
      name: "Franja Recia",
      short: "Franja Spe",
      statLabel: "Velocidad",
    },
  };

  const NONE_ITEM = {
    id: "none",
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
    const iconHtml = item.src
      ? `<img class="item-icon" src="${item.src}" alt="${item.name}" width="40" height="40" />`
      : `<div class="item-icon item-icon--none" aria-hidden="true">—</div>`;

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
      card.className = "saved-card" + (entry.isBaby ? " is-baby" : "");
      card.dataset.gender = entry.gender;
      card.dataset.uid = entry.uid;
      card.style.left = `${entry.x}px`;
      card.style.top = `${entry.y}px`;

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

      card.innerHTML = `
        ${entry.isBaby ? '<span class="saved-card__badge">Cría</span>' : ""}
        <button type="button" class="saved-card__delete" aria-label="Eliminar" data-delete="${entry.uid}">×</button>
        <img class="saved-card__sprite" src="${escapeHtml(entry.sprite)}" alt="${escapeHtml(entry.name)}" loading="lazy" />
        <h3 class="saved-card__name">${escapeHtml(entry.name)}</h3>
        <p class="saved-card__gender">${genderLabel(entry.gender)}</p>
        ${natureHtml}
        ${parentsHtml}
        ${heldHtml}
        <div class="saved-card__ivs">${ivHtml}</div>
      `;

      card.addEventListener("pointerdown", (e) => onCardPointerDown(e, card, entry));
      els.canvas.appendChild(card);
    }

    renderPastes(false);
    renderTextBoxes(false);
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
        ".saved-card, .paste-shot, .note-text, .saved-card__delete, .paste-shot__delete"
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
    const maxW = drag.maxW || CARD_W;
    const maxH = drag.maxH || CARD_H;
    let x = e.clientX - sheetRect.left - drag.offsetX;
    let y = e.clientY - sheetRect.top - drag.offsetY;
    x = Math.max(0, Math.min(SHEET_W - maxW, x));
    y = Math.max(0, Math.min(SHEET_H - maxH, y));

    drag.card.style.left = `${x}px`;
    drag.card.style.top = `${y}px`;
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

    const entry = {
      uid: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      id: species.id,
      name: species.name,
      sprite: species.sprite,
      gender: babyGender,
      nature: "",
      eggGroups: [...(species.eggGroups || [])],
      ivs: { ...babyIvs },
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

  async function onPasteClipboard(e) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (!item.type.startsWith("image/")) continue;
      e.preventDefault();
      const file = item.getAsFile();
      if (file) await addPastedImage(file);
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
    els.btnMale.addEventListener("click", () => setGender("male"));
    els.btnFemale.addEventListener("click", () => setGender("female"));
    els.nature?.addEventListener("change", () => {
      nature = els.nature.value || "";
    });
    els.btnSave.addEventListener("click", saveEntry);
    els.btnClearForm.addEventListener("click", clearFormIvs);
    els.btnCloseEditor?.addEventListener("click", closeEditor);
    els.btnClearAll.addEventListener("click", clearAll);
    els.btnClearInk.addEventListener("click", onClearInkClick);
    els.btnClearShots?.addEventListener("click", clearPastes);
    els.btnNewPage?.addEventListener("click", addPage);
    els.btnExportPage?.addEventListener("click", exportActivePage);
    els.btnImportPage?.addEventListener("click", () => els.pageImportFile?.click());
    els.btnPublishCommunity?.addEventListener("click", publishActivePageToCommunity);
    els.pageImportFile?.addEventListener("change", (e) =>
      importPageFile(e.target.files?.[0])
    );

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

    document.querySelectorAll(".tool-btn").forEach((btn) => {
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
        if (els.breedModal && !els.breedModal.classList.contains("hidden")) {
          closeBreedModal();
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
    renderEggChips();
    setTool("move");
    loadDrawingFromPage();
    renderSaved();
    renderPastes();
    maybeImportFromCommunity();

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
      renderEggChips();
      renderList();
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
