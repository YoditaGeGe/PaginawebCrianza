(() => {
  const els = {
    grid: document.getElementById("community-grid"),
    status: document.getElementById("community-status"),
    search: document.getElementById("community-search"),
    btnPublish: document.getElementById("btn-open-publish"),
    publishForm: document.getElementById("publish-form"),
    publishTitle: document.getElementById("publish-title"),
    publishDesc: document.getElementById("publish-desc"),
    publishPayload: document.getElementById("publish-payload"),
    publishFile: document.getElementById("publish-file"),
    configAlert: document.getElementById("config-alert"),
  };

  let pages = [];
  let myFollows = new Set();
  let publishModal = null;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setStatus(msg) {
    if (els.status) els.status.textContent = msg || "";
  }

  async function requireAuth() {
    if (!window.__crianzaUser) {
      try {
        const user = await window.CrianzaFirebase.getCurrentUser();
        if (user) {
          window.__crianzaUser = user;
        }
      } catch (_) {
        /* ignore */
      }
    }
    if (!window.__crianzaUser) {
      alert("La publicación y el seguimiento no están disponibles sin cuenta.");
      return false;
    }
    return true;
  }

  async function loadFollows(api, uid) {
    myFollows = new Set();
    if (!uid) return;
    const snap = await api.db.collection("follows").where("userId", "==", uid).get();
    snap.forEach((doc) => myFollows.add(doc.data().pageId));
  }

  async function loadPages() {
    const api = await window.CrianzaFirebase.ensureFirebase();
    if (!api) {
      pages = [];
      render();
      setStatus("Configura firebase-config.js para ver la comunidad.");
      return;
    }
    setStatus("Cargando crianzas…");
    let snap;
    try {
      snap = await api.db
        .collection("breedPages")
        .where("published", "==", true)
        .orderBy("createdAt", "desc")
        .limit(80)
        .get();
    } catch (_) {
      snap = await api.db
        .collection("breedPages")
        .where("published", "==", true)
        .limit(80)
        .get();
    }
    pages = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    pages.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
    await loadFollows(api, window.__crianzaUser?.uid);
    render();
    setStatus(pages.length ? `${pages.length} crianzas públicas` : "Aún no hay crianzas publicadas.");
  }

  function filteredPages() {
    const q = (els.search?.value || "").trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => {
      const blob = `${p.title || ""} ${p.description || ""} ${p.ownerName || ""}`.toLowerCase();
      return blob.includes(q);
    });
  }

  function render() {
    if (!els.grid) return;
    const list = filteredPages();
    if (!list.length) {
      els.grid.innerHTML = `<div class="site-empty">No hay crianzas para mostrar.</div>`;
      return;
    }
    els.grid.innerHTML = list
      .map((page) => {
        const following = myFollows.has(page.id);
        const pokeCount = Array.isArray(page.payload?.page?.saved)
          ? page.payload.page.saved.length
          : page.pokeCount || 0;
        return `
        <div class="col-md-6 col-lg-4">
          <article class="card site-card">
            <div class="card-body d-flex flex-column gap-2">
              <h2 class="card-title h6 mb-0">${escapeHtml(page.title)}</h2>
              <p class="card-text small mb-0">${escapeHtml(page.description || "Sin descripción")}</p>
              <p class="site-meta small mb-0">
                ${escapeHtml(page.ownerName || "Entrenador")} · ${pokeCount} Pokémon · ${page.followsCount || 0} follows
              </p>
              <div class="d-flex flex-wrap gap-2 mt-auto">
                <button type="button" class="btn btn-sm btn-warning" data-open="${escapeHtml(page.id)}">Abrir en cuaderno</button>
                <button type="button" class="btn btn-sm btn-outline-light" data-follow="${escapeHtml(page.id)}">
                  ${following ? "Siguiendo" : "Seguir"}
                </button>
              </div>
            </div>
          </article>
        </div>`;
      })
      .join("");
  }

  async function toggleFollow(pageId) {
    if (!(await requireAuth())) return;
    const api = await window.CrianzaFirebase.ensureFirebase();
    const uid = window.__crianzaUser.uid;
    const followId = `${uid}_${pageId}`;
    const followRef = api.db.collection("follows").doc(followId);
    const pageRef = api.db.collection("breedPages").doc(pageId);

    if (myFollows.has(pageId)) {
      await followRef.delete();
      myFollows.delete(pageId);
      await pageRef.update({
        followsCount: firebase.firestore.FieldValue.increment(-1),
      });
    } else {
      await followRef.set({
        userId: uid,
        pageId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      myFollows.add(pageId);
      await pageRef.update({
        followsCount: firebase.firestore.FieldValue.increment(1),
      });
    }
    const idx = pages.findIndex((p) => p.id === pageId);
    if (idx >= 0) {
      pages[idx].followsCount = Math.max(
        0,
        (pages[idx].followsCount || 0) + (myFollows.has(pageId) ? 1 : -1)
      );
    }
    render();
  }

  function openInNotebook(pageId) {
    const page = pages.find((p) => p.id === pageId);
    if (!page?.payload) {
      alert("Esta publicación no tiene datos de cuaderno.");
      return;
    }
    sessionStorage.setItem("crianza-import-payload", JSON.stringify(page.payload));
    location.href = "index.html?import=community";
  }

  async function readPayloadFromForm() {
    if (els.publishFile?.files?.[0]) {
      const text = await els.publishFile.files[0].text();
      return JSON.parse(text);
    }
    const raw = els.publishPayload?.value?.trim();
    if (raw) return JSON.parse(raw);
    const fromSession = sessionStorage.getItem("crianza-publish-payload");
    if (fromSession) return JSON.parse(fromSession);
    throw new Error("Pega el JSON exportado o elige un archivo .crianza.json");
  }

  async function publishPage(event) {
    event.preventDefault();
    if (!(await requireAuth())) return;
    const api = await window.CrianzaFirebase.ensureFirebase();
    if (!api) {
      alert("Firebase no configurado.");
      return;
    }

    const title = (els.publishTitle.value || "").trim().slice(0, 120);
    const description = (els.publishDesc.value || "").trim().slice(0, 500);
    if (!title) {
      alert("Pon un título.");
      return;
    }

    let payload;
    try {
      payload = await readPayloadFromForm();
    } catch (err) {
      alert(err.message || "JSON inválido");
      return;
    }

    if (payload.format !== "crianza-pokemon-page" || payload.version !== 1) {
      alert("El archivo no es una página compatible de Crianza Pokémon.");
      return;
    }

    const user = window.__crianzaUser;
    const pokeCount = Array.isArray(payload.page?.saved) ? payload.page.saved.length : 0;
    const drawing = payload.page?.drawing || null;
    let drawingUrl = null;

    const publishPayload = JSON.parse(JSON.stringify(payload));
    /* Dibujos grandes: Storage si existe; si no, se omiten para no romper la publicación. */
    if (drawing && drawing.length > 700000) {
      if (api.storage) {
        try {
          const blob = await (await fetch(drawing)).blob();
          const path = `breedDrawings/${user.uid}/${Date.now()}.png`;
          const ref = api.storage.ref().child(path);
          await ref.put(blob, { contentType: "image/png" });
          drawingUrl = await ref.getDownloadURL();
          publishPayload.page.drawing = null;
          publishPayload.drawingUrl = drawingUrl;
        } catch (err) {
          console.warn(err);
          publishPayload.page.drawing = null;
        }
      } else {
        publishPayload.page.drawing = null;
      }
    }

    try {
      await api.db.collection("breedPages").add({
        ownerId: user.uid,
        ownerName: user.displayName || "Entrenador",
        ownerPhoto: user.photoURL || "",
        title,
        description,
        published: true,
        pokeCount,
        followsCount: 0,
        payload: publishPayload,
        drawingUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      const msg = String(err?.message || err);
      if (msg.includes("permission") || msg.includes("Permission")) {
        throw new Error(
          "Firestore denegó la publicación. Publica de nuevo las reglas de firestore.rules en la consola."
        );
      }
      throw err;
    }

    sessionStorage.removeItem("crianza-publish-payload");
    els.publishForm.reset();
    publishModal?.hide();
    await loadPages();
    alert("Crianza publicada en la comunidad.");
  }

  function bind() {
    if (window.bootstrap && document.getElementById("publishModal")) {
      publishModal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("publishModal")
      );
    }

    els.btnPublish?.addEventListener("click", async () => {
      if (!(await requireAuth())) return;
      const pending = sessionStorage.getItem("crianza-publish-payload");
      if (pending && els.publishPayload) {
        els.publishPayload.value = pending;
      }
      publishModal?.show();
    });

    els.publishForm?.addEventListener("submit", (e) => {
      publishPage(e).catch((err) => {
        console.error(err);
        alert(err.message || "No se pudo publicar");
      });
    });

    els.search?.addEventListener("input", render);

    els.grid?.addEventListener("click", (e) => {
      const followId = e.target.closest("[data-follow]")?.getAttribute("data-follow");
      const openId = e.target.closest("[data-open]")?.getAttribute("data-open");
      if (followId) {
        toggleFollow(followId).catch((err) => {
          console.error(err);
          alert(err.message || "No se pudo actualizar el follow");
        });
      }
      if (openId) openInNotebook(openId);
    });

    document.addEventListener("crianza:auth", () => {
      loadPages().catch(console.error);
    });
  }

  async function init() {
    bind();
    if (!window.isFirebaseConfigured()) {
      els.configAlert?.classList.remove("d-none");
    }
    try {
      await loadPages();
    } catch (err) {
      console.error(err);
      setStatus(
        "No se pudo cargar la comunidad. Revisa reglas Firestore e índice createdAt."
      );
    }

    if (location.hash === "#publish") {
      const pending = sessionStorage.getItem("crianza-publish-payload");
      if (pending && els.publishPayload) els.publishPayload.value = pending;
      if (window.__crianzaUser) {
        publishModal?.show();
      } else {
        document.addEventListener(
          "crianza:auth",
          (ev) => {
            if (ev.detail?.user) publishModal?.show();
          },
          { once: true }
        );
      }
    }
  }

  init();
})();
