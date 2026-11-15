(() => {
  const gate = document.getElementById("admin-gate");
  const panel = document.getElementById("admin-panel");
  const pagesList = document.getElementById("admin-pages");
  const channelsList = document.getElementById("admin-channels");
  const channelForm = document.getElementById("channel-form");
  const configAlert = document.getElementById("config-alert");

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isAdmin(user, profile) {
    return (
      profile?.role === "admin" ||
      window.CrianzaFirebase.isAdminEmail(user?.email)
    );
  }

  async function refreshPages(api) {
    let snap;
    try {
      snap = await api.db.collection("breedPages").orderBy("createdAt", "desc").limit(100).get();
    } catch (_) {
      snap = await api.db.collection("breedPages").limit(100).get();
    }
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    pagesList.innerHTML = rows.length
      ? rows
          .map(
            (p) => `
        <tr>
          <td>${escapeHtml(p.title)}</td>
          <td>${escapeHtml(p.ownerName || p.ownerId)}</td>
          <td>${p.published ? "Sí" : "No"}</td>
          <td>${p.followsCount || 0}</td>
          <td class="text-nowrap">
            <button type="button" class="btn btn-sm btn-outline-warning" data-unpublish="${escapeHtml(p.id)}">Ocultar</button>
            <button type="button" class="btn btn-sm btn-outline-danger" data-del-page="${escapeHtml(p.id)}">Borrar</button>
          </td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="5" class="text-secondary">Sin publicaciones</td></tr>`;
  }

  async function refreshChannels(api) {
    const snap = await api.db.collection("youtubeChannels").get();
    const rows = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    channelsList.innerHTML = rows.length
      ? rows
          .map(
            (c) => `
        <tr>
          <td>${escapeHtml(c.title)}</td>
          <td><a href="${escapeHtml(c.url)}" target="_blank" rel="noopener">link</a></td>
          <td>${c.order ?? 0}</td>
          <td>${c.active ? "Sí" : "No"}</td>
          <td>
            <button type="button" class="btn btn-sm btn-outline-danger" data-del-channel="${escapeHtml(c.id)}">Borrar</button>
          </td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="5" class="text-secondary">Sin canales</td></tr>`;
  }

  async function bootAdmin() {
    if (!window.isFirebaseConfigured()) {
      configAlert?.classList.remove("d-none");
      gate.textContent = "Configura firebase-config.js primero.";
      return;
    }
    const api = await window.CrianzaFirebase.ensureFirebase();
    await refreshPages(api);
    await refreshChannels(api);
  }

  pagesList?.addEventListener("click", async (e) => {
    const api = await window.CrianzaFirebase.ensureFirebase();
    const hideId = e.target.closest("[data-unpublish]")?.getAttribute("data-unpublish");
    const delId = e.target.closest("[data-del-page]")?.getAttribute("data-del-page");
    try {
      if (hideId) {
        await api.db.collection("breedPages").doc(hideId).update({
          published: false,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      if (delId && confirm("¿Borrar esta crianza de la comunidad?")) {
        await api.db.collection("breedPages").doc(delId).delete();
      }
      await refreshPages(api);
    } catch (err) {
      alert(err.message || "Error de moderación");
    }
  });

  channelsList?.addEventListener("click", async (e) => {
    const delId = e.target.closest("[data-del-channel]")?.getAttribute("data-del-channel");
    if (!delId || !confirm("¿Borrar canal?")) return;
    try {
      const api = await window.CrianzaFirebase.ensureFirebase();
      await api.db.collection("youtubeChannels").doc(delId).delete();
      await refreshChannels(api);
    } catch (err) {
      alert(err.message || "No se pudo borrar");
    }
  });

  channelForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(channelForm);
    const title = String(data.get("title") || "").trim();
    const url = String(data.get("url") || "").trim();
    const description = String(data.get("description") || "").trim();
    const thumbnail = String(data.get("thumbnail") || "").trim();
    const order = Number(data.get("order") || 0);
    if (!title || !url) {
      alert("Título y URL son obligatorios");
      return;
    }
    try {
      const api = await window.CrianzaFirebase.ensureFirebase();
      await api.db.collection("youtubeChannels").add({
        title,
        url,
        description,
        thumbnail,
        order: Number.isFinite(order) ? order : 0,
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      channelForm.reset();
      await refreshChannels(api);
    } catch (err) {
      alert(err.message || "No se pudo guardar el canal");
    }
  });

  document.addEventListener("crianza:auth", (ev) => {
    const { user, profile } = ev.detail || {};
    if (!user) {
      gate.classList.remove("d-none");
      panel.classList.add("d-none");
      gate.innerHTML =
        'Panel privado. <button type="button" class="btn btn-sm btn-warning ms-2" id="admin-login">Entrar como admin</button>';
      gate.querySelector("#admin-login")?.addEventListener("click", async () => {
        try {
          await window.CrianzaFirebase.signInWithGoogle();
        } catch (err) {
          alert(err.message || "No se pudo entrar");
        }
      });
      return;
    }
    if (!isAdmin(user, profile)) {
      gate.classList.remove("d-none");
      panel.classList.add("d-none");
      gate.textContent = "Esta cuenta no tiene permisos de administrador.";
      return;
    }
    gate.classList.add("d-none");
    panel.classList.remove("d-none");
    bootAdmin().catch((err) => {
      console.error(err);
      gate.classList.remove("d-none");
      gate.textContent = err.message || "Error al cargar admin";
    });
  });
})();
