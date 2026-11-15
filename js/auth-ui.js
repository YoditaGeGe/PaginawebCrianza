(() => {
  function currentPage() {
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (path.includes("comunidad")) return "comunidad";
    if (path.includes("canales")) return "canales";
    if (path.includes("admin")) return "admin";
    return "cuaderno";
  }

  const THEME_BTN = `
    <button type="button" class="site-nav__icon-btn" id="btn-theme" title="Modo día" aria-label="Cambiar a modo día" aria-pressed="false">
      <svg class="theme-icon theme-icon--sun" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <circle cx="8" cy="8" r="2.6" fill="currentColor"/>
        <path d="M8 1.4v1.8M8 12.8v1.8M1.4 8h1.8M12.8 8h1.8M3.2 3.2l1.3 1.3M11.5 11.5l1.3 1.3M12.8 3.2l-1.3 1.3M4.5 11.5l-1.3 1.3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/>
      </svg>
      <svg class="theme-icon theme-icon--moon hidden" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path d="M11.2 2.4a5.8 5.8 0 1 0 2.4 9.8 6.2 6.2 0 1 1-2.4-9.8z" fill="currentColor"/>
      </svg>
    </button>`;

  const NOTEBOOK_TOOLS = `
    <div class="site-nav__tools" aria-label="Herramientas">
      <button type="button" class="site-nav__icon-btn" id="btn-companion" title="Pokédex / mascota" aria-label="Pokédex">
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <path d="M1.8 8h12.4" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="8" cy="8" r="2" fill="currentColor"/>
        </svg>
      </button>
      <button type="button" class="site-nav__icon-btn" id="btn-updates" title="Updates" aria-label="Updates">
        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M3 3.5h10v2H3zm0 4h10v2H3zm0 4h7v2H3z" fill="currentColor"/>
          <circle cx="13" cy="12.5" r="2" fill="currentColor"/>
        </svg>
      </button>
      <button type="button" class="site-nav__icon-btn" id="btn-sfx" title="Sonido" aria-label="Sonido" aria-pressed="true">
        <svg class="sfx-icon sfx-icon--on" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M2 6h3l3-3v10L5 10H2V6zm8 1.2a2.2 2.2 0 0 1 0 1.6M11.5 5a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/>
        </svg>
        <svg class="sfx-icon sfx-icon--off hidden" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M2 6h3l3-3v10L5 10H2V6zM10 6l4 4M14 6l-4 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/>
        </svg>
      </button>
      ${THEME_BTN}
    </div>`;

  const SITE_TOOLS = `
    <div class="site-nav__tools" aria-label="Apariencia">
      ${THEME_BTN}
    </div>`;

  function renderNav(mount) {
    if (!mount) return;
    const page = currentPage();
    const toolsHtml = page === "cuaderno" ? NOTEBOOK_TOOLS : SITE_TOOLS;

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
          ${toolsHtml}
        </div>
      </div>
    `;

    document.dispatchEvent(new CustomEvent("crianza:nav"));
  }

  function mountAuthUi(selector = "#site-nav") {
    const mount = document.querySelector(selector);
    if (!mount) return;
    renderNav(mount);
    if (!window.CrianzaFirebase?.onAuth) {
      document.dispatchEvent(
        new CustomEvent("crianza:auth", { detail: { user: null, profile: null } })
      );
      return;
    }
    window.CrianzaFirebase.onAuth((user, profile) => {
      window.__crianzaUser = user;
      window.__crianzaProfile = profile;
      document.dispatchEvent(
        new CustomEvent("crianza:auth", { detail: { user, profile } })
      );
    });
  }

  window.CrianzaAuthUi = { mountAuthUi, currentPage };
})();
