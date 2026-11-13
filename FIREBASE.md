# Configurar Firebase (login + comunidad)

## 1. Proyecto

1. Entra en [Firebase Console](https://console.firebase.google.com) y crea un proyecto.
2. Añade una app **Web** y copia la config a `firebase-config.js`.
3. Pon tu email real en `CRIANZA_ADMIN_EMAILS` y en `firestore.rules` / `storage.rules`.

## 2. Authentication

1. Authentication → Sign-in method → **Google** → Enable.
2. Añade el dominio autorizado (localhost y tu dominio de Hosting).

## 3. Firestore

1. Create database (modo producción).
2. Rules → pega el contenido de `firestore.rules` → Publish.
3. Indexes: si la consola pide un índice compuesto para
   `breedPages` (`published` + `createdAt`) o `youtubeChannels` (`active` + `order`),
   acepta el enlace que muestra el error.

## 4. Storage

1. Activa Storage.
2. Rules → pega `storage.rules` → Publish.

## 5. Hosting (recomendado)

OAuth de Google funciona mejor por `https://` o `http://localhost`, no con `file://`.

```bash
npm i -g firebase-tools
firebase login
firebase init hosting
# public directory: .
firebase deploy
```

## 6. Probar

1. Abre la web con un servidor local (`npx serve .`) o Hosting.
2. Inicia sesión con Google.
3. En el cuaderno: **Subir a comunidad**.
4. En Comunidad: seguir / abrir.
5. Con tu email admin: `admin.html` → canales y moderación.
