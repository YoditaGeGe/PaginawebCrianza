(() => {
  const FEATURED = [
    {
      login: "katndrea",
      title: "Katndrea",
      url: "https://www.twitch.tv/katndrea",
      description: "Canal Twitch del clan · Cobblemon y streams",
    },
    {
      login: "yodita_gg",
      title: "Yodita_gg",
      url: "https://www.twitch.tv/yodita_gg",
      description: "Canal Twitch · Cuervos Negros",
    },
  ];

  const FEATURED_LOGINS = new Set(FEATURED.map((c) => c.login.toLowerCase()));

  const grid = document.getElementById("channels-grid");
  const status = document.getElementById("channels-status");
  const configAlert = document.getElementById("config-alert");
  const featuredMount = document.getElementById("twitch-featured");

  const liveState = Object.fromEntries(FEATURED.map((c) => [c.login, false]));

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parentsForEmbed() {
    const hosts = new Set(["localhost", "127.0.0.1"]);
    if (location.hostname) hosts.add(location.hostname);
    return [...hosts].map((h) => `parent=${encodeURIComponent(h)}`).join("&");
  }

  async function isTwitchLive(login) {
    try {
      const res = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(login)}`, {
        cache: "no-store",
      });
      if (!res.ok) return false;
      const text = (await res.text()).trim().toLowerCase();
      if (!text) return false;
      return !(
        text.includes("offline") ||
        text.includes("is offline") ||
        text.includes("not found") ||
        text.includes("error")
      );
    } catch (err) {
      console.warn("No se pudo consultar estado Twitch", err);
      return false;
    }
  }

  function renderChannelCard(channel, live) {
    const embedParents = parentsForEmbed();
    return `
      <article class="twitch-card${live ? " is-live" : ""}">
        <div class="twitch-card__head">
          <div class="twitch-card__identity">
            <img
              class="twitch-card__avatar"
              src="https://decapi.me/twitch/avatar/${escapeHtml(channel.login)}"
              alt=""
              width="56"
              height="56"
              onerror="this.style.display='none'"
            />
            <div>
              <h2 class="twitch-card__title">${escapeHtml(channel.title)}</h2>
              <p class="twitch-card__desc">${escapeHtml(channel.description)}</p>
            </div>
          </div>
          <div class="twitch-card__status" aria-live="polite">
            ${
              live
                ? `<span class="live-badge"><span class="live-badge__dot" aria-hidden="true"></span> EN VIVO</span>`
                : `<span class="offline-badge">Fuera de línea</span>`
            }
          </div>
        </div>
        ${
          live
            ? `<div class="twitch-card__player">
                <iframe
                  src="https://player.twitch.tv/?channel=${escapeHtml(channel.login)}&${embedParents}&muted=true"
                  allowfullscreen
                  title="Stream de ${escapeHtml(channel.title)}"
                ></iframe>
              </div>`
            : ""
        }
        <div class="twitch-card__actions">
          <a class="btn btn-warning" href="${escapeHtml(channel.url)}" target="_blank" rel="noopener noreferrer">
            Abrir en Twitch
          </a>
        </div>
      </article>
    `;
  }

  function renderFeatured() {
    if (!featuredMount) return;
    featuredMount.innerHTML = `
      <div class="twitch-featured-grid">
        ${FEATURED.map((channel) => renderChannelCard(channel, liveState[channel.login])).join("")}
      </div>
    `;
  }

  async function refreshLive() {
    await Promise.all(
      FEATURED.map(async (channel) => {
        liveState[channel.login] = await isTwitchLive(channel.login);
      })
    );
    renderFeatured();
  }

  async function loadExtraChannels() {
    if (!grid) return;
    if (!window.isFirebaseConfigured || !window.isFirebaseConfigured()) {
      configAlert?.classList.add("d-none");
      grid.innerHTML = "";
      if (status) status.textContent = "";
      return;
    }
    try {
      const api = await window.CrianzaFirebase.ensureFirebase();
      if (status) status.textContent = "Cargando más canales…";
      const snap = await api.db.collection("youtubeChannels").get();
      const channels = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => c.active !== false)
        .filter((c) => {
          const url = String(c.url || "").toLowerCase();
          return ![...FEATURED_LOGINS].some((login) => url.includes(`twitch.tv/${login}`));
        })
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      if (!channels.length) {
        grid.innerHTML = "";
        if (status) status.textContent = "";
        return;
      }
      grid.innerHTML = channels
        .map(
          (ch) => `
        <div class="col-md-6 col-lg-4">
          <a class="card site-card text-decoration-none" href="${escapeHtml(ch.url)}" target="_blank" rel="noopener noreferrer">
            <div class="card-body">
              <h2 class="card-title h6 mb-2">${escapeHtml(ch.title)}</h2>
              <p class="card-text small mb-0">${escapeHtml(ch.description || "Canal de la comunidad")}</p>
            </div>
          </a>
        </div>`
        )
        .join("");
      if (status) status.textContent = `${channels.length} canales extra`;
    } catch (err) {
      console.warn(err);
      if (status) status.textContent = "";
    }
  }

  async function init() {
    renderFeatured();
    await refreshLive();
    await loadExtraChannels();
    setInterval(() => {
      refreshLive().catch(console.warn);
    }, 60000);
  }

  init().catch(console.error);
})();
