/**
 * Configuración pública de Firebase (proyecto CrianzaDiosesmon).
 */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDa3ff6Q1tE0nfjG0pTWlPFdbEkK6sBoX4",
  authDomain: "crianzadiosesmon.firebaseapp.com",
  projectId: "crianzadiosesmon",
  storageBucket: "crianzadiosesmon.firebasestorage.app",
  messagingSenderId: "372971529503",
  appId: "1:372971529503:web:cec538edb5d5eaa64dbc2a",
  measurementId: "G-W335ZE5TKE",
};

/** Emails con acceso al panel admin. */
window.CRIANZA_ADMIN_EMAILS = ["yoditagg.mine@gmail.com"];

window.isFirebaseConfigured = function isFirebaseConfigured() {
  const c = window.FIREBASE_CONFIG || {};
  return Boolean(
    c.apiKey &&
      !String(c.apiKey).startsWith("REEMPLAZA") &&
      c.projectId &&
      !String(c.projectId).startsWith("REEMPLAZA")
  );
};
