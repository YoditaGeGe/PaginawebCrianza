(() => {
  const SDKS = {
    app: "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js",
    auth: "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth-compat.js",
    firestore: "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore-compat.js",
    storage: "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage-compat.js",
  };

  let bootPromise = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === "1") {
          resolve();
          return;
        }
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error(`No se pudo cargar ${src}`)),
          { once: true }
        );
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => {
        s.dataset.loaded = "1";
        resolve();
      };
      s.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
      document.head.appendChild(s);
    });
  }

  async function ensureFirebase() {
    if (window.__crianzaFirebase) return window.__crianzaFirebase;
    if (bootPromise) return bootPromise;

    bootPromise = (async () => {
      if (!window.isFirebaseConfigured || !window.isFirebaseConfigured()) {
        return null;
      }

      await loadScript(SDKS.app);
      await loadScript(SDKS.auth);
      await loadScript(SDKS.firestore);
      try {
        await loadScript(SDKS.storage);
      } catch (err) {
        console.warn("Storage SDK no disponible (opcional)", err);
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(window.FIREBASE_CONFIG);
      }

      const auth = firebase.auth();
      try {
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      } catch (err) {
        console.warn("No se pudo fijar persistencia LOCAL", err);
      }

      const db = firebase.firestore();
      let storage = null;
      try {
        storage = firebase.storage();
      } catch (_) {
        storage = null;
      }

      window.__crianzaFirebase = { auth, db, storage, firebase };
      return window.__crianzaFirebase;
    })().catch((err) => {
      bootPromise = null;
      throw err;
    });

    return bootPromise;
  }

  function isAdminEmail(email) {
    const list = window.CRIANZA_ADMIN_EMAILS || [];
    return Boolean(
      email && list.map((e) => e.toLowerCase()).includes(String(email).toLowerCase())
    );
  }

  async function ensureUserProfile(user) {
    const api = await ensureFirebase();
    if (!api || !user) return null;
    const ref = api.db.collection("users").doc(user.uid);
    const base = {
      displayName: user.displayName || "Entrenador",
      photoURL: user.photoURL || "",
      email: user.email || "",
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    let role = isAdminEmail(user.email) ? "admin" : "user";
    try {
      const snap = await ref.get();
      if (!snap.exists) {
        /* Crear siempre como user (reglas); luego elevar admin si el email está en la lista. */
        await ref.set({
          ...base,
          role: "user",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        role = "user";
        if (isAdminEmail(user.email)) {
          try {
            await ref.update({ role: "admin", ...base });
            role = "admin";
          } catch (err) {
            console.warn("No se pudo marcar admin aún; publica firestore.rules", err);
          }
        }
      } else {
        role = snap.data().role || role;
        try {
          if (isAdminEmail(user.email) && role !== "admin") {
            await ref.update({ ...base, role: "admin" });
            role = "admin";
          } else {
            await ref.update(base);
          }
        } catch (err) {
          /* Perfil en UI no depende de este update. */
          console.warn("No se pudo actualizar perfil", err);
        }
      }
    } catch (err) {
      console.warn("Perfil Firestore no disponible", err);
    }

    return {
      uid: user.uid,
      displayName: user.displayName || "Entrenador",
      photoURL: user.photoURL || "",
      email: user.email || "",
      role,
    };
  }

  async function signInWithGoogle() {
    const api = await ensureFirebase();
    if (!api) {
      throw new Error(
        "Firebase no está configurado. Edita firebase-config.js con los datos de tu proyecto."
      );
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await api.auth.signInWithPopup(provider);
    try {
      await ensureUserProfile(result.user);
    } catch (err) {
      console.warn(err);
    }
    return result.user;
  }

  async function signOut() {
    const api = await ensureFirebase();
    if (!api) return;
    await api.auth.signOut();
  }

  async function getCurrentUser() {
    const api = await ensureFirebase();
    if (!api) return null;
    if (api.auth.currentUser) return api.auth.currentUser;
    await api.auth.authStateReady?.();
    return api.auth.currentUser;
  }

  function onAuth(callback) {
    ensureFirebase()
      .then(async (api) => {
        if (!api) {
          callback(null, null);
          return;
        }
        /* Esperar restauración de sesión antes del primer pintado útil. */
        try {
          if (typeof api.auth.authStateReady === "function") {
            await api.auth.authStateReady();
          }
        } catch (_) {
          /* compat */
        }
        api.auth.onAuthStateChanged(async (user) => {
          let profile = null;
          if (user) {
            try {
              profile = await ensureUserProfile(user);
            } catch (err) {
              console.warn(err);
              profile = {
                uid: user.uid,
                displayName: user.displayName || "Entrenador",
                email: user.email || "",
                role: isAdminEmail(user.email) ? "admin" : "user",
              };
            }
          }
          callback(user, profile);
        });
      })
      .catch((err) => {
        console.error(err);
        callback(null, null);
      });
  }

  window.CrianzaFirebase = {
    ensureFirebase,
    signInWithGoogle,
    signOut,
    onAuth,
    isAdminEmail,
    getCurrentUser,
  };
})();
