(() => {
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function currentPage() {
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (path.includes("comunidad")) return "comunidad";
    if (path.includes("canales")) return "canales";
    if (path.includes("admin")) return "admin";
    return "cuaderno";
  }

  const GOOGLE_ICON = `<svg class="site-auth__google" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l.1.1 6.3 5.3C39.2 37.3 44 32 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>`;

  function renderNav(mount, { user, profile, loading } = {}) {
    if (!mount) return;
    const page = currentPage();
    const isAdmin =
      profile?.role === "admin" || window.CrianzaFirebase?.isAdminEmail?.(user?.email);

    let authHtml;
    if (loading) {
      authHtml = `<span class="site-auth__loading">Sesión…</span>`;
    } else if (user) {
      authHtml = `<div class="site-auth">
          <img class="site-auth__avatar" src="${escapeHtml(user.photoURL || "")}" alt="" width="28" height="28" />
          <span class="site-auth__name">${escapeHtml(user.displayName || "Cuenta")}</span>
          ${isAdmin ? '<a class="site-nav__link" href="admin.html">Admin</a>' : ""}
          <button type="button" class="site-auth__btn" data-auth="out">Salir</button>
        </div>`;
    } else {
      authHtml = `<button type="button" class="site-auth__btn site-auth__btn--primary" data-auth="in">${GOOGLE_ICON}<span>Iniciar con Google</span></button>`;
    }

    mount.innerHTML = `
      <div class="site-nav__inner">
        <a class="site-nav__brand" href="index.html">
          <img class="site-nav__mark" src="assets/logo-clan.png" alt="" width="36" height="36" />
          <span>CRIANZA</span>
        </a>
        <div class="site-nav__cluster">
          <nav class="site-nav__links" aria-label="Secciones">
            <a class="site-nav__link${page === "cuaderno" ? " is-active" : ""}" href="index.html">Cuaderno</a>
            <a class="site-nav__link${page === "comunidad" ? " is-active" : ""}" href="comunidad.html">Comunidad</a>
            <a class="site-nav__link${page === "canales" ? " is-active" : ""}" href="canales.html">Canales</a>
          </nav>
          ${authHtml}
        </div>
      </div>
    `;

    mount.querySelector('[data-auth="in"]')?.addEventListener("click", async () => {
      try {
        await window.CrianzaFirebase.signInWithGoogle();
      } catch (err) {
        alert(err.message || "No se pudo iniciar sesión");
        console.error(err);
      }
    });
    mount.querySelector('[data-auth="out"]')?.addEventListener("click", () => {
      window.CrianzaFirebase.signOut();
    });
  }

  function mountAuthUi(selector = "#site-nav") {
    const mount = document.querySelector(selector);
    if (!mount) return;
    renderNav(mount, { user: null, profile: null, loading: true });
    window.CrianzaFirebase.onAuth((user, profile) => {
      window.__crianzaUser = user;
      window.__crianzaProfile = profile;
      renderNav(mount, { user, profile, loading: false });
      document.dispatchEvent(
        new CustomEvent("crianza:auth", { detail: { user, profile } })
      );
    });
  }

  window.CrianzaAuthUi = { mountAuthUi, currentPage };
})();
