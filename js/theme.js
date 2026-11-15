(() => {
  const THEME_KEY = "crianza-theme-v1";

  function normalize(theme) {
    return theme === "day" ? "day" : "night";
  }

  function currentTheme() {
    return normalize(document.documentElement.getAttribute("data-theme"));
  }

  function applyTheme(theme) {
    const next = normalize(theme);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (_) {
      /* ignore */
    }
    syncThemeButton();
    document.dispatchEvent(
      new CustomEvent("crianza:theme", { detail: { theme: next } })
    );
  }

  function toggleTheme() {
    applyTheme(currentTheme() === "day" ? "night" : "day");
  }

  function syncThemeButton() {
    const btn = document.getElementById("btn-theme");
    if (!btn) return;
    const day = currentTheme() === "day";
    btn.setAttribute("aria-pressed", day ? "true" : "false");
    btn.title = day ? "Modo noche" : "Modo día";
    btn.setAttribute("aria-label", day ? "Cambiar a modo noche" : "Cambiar a modo día");
    btn.querySelector(".theme-icon--sun")?.classList.toggle("hidden", day);
    btn.querySelector(".theme-icon--moon")?.classList.toggle("hidden", !day);
  }

  function bindThemeButton() {
    const btn = document.getElementById("btn-theme");
    if (!btn || btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", toggleTheme);
    syncThemeButton();
  }

  function boot() {
    const saved = (() => {
      try {
        return localStorage.getItem(THEME_KEY);
      } catch (_) {
        return null;
      }
    })();
    applyTheme(saved || "night");
    bindThemeButton();
  }

  document.addEventListener("crianza:nav", () => {
    bindThemeButton();
    syncThemeButton();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.CrianzaTheme = { applyTheme, toggleTheme, currentTheme, syncThemeButton };
})();
