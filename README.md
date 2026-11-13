# Crianza Pokémon · Cuervos Negros

Cuaderno de crianza para **Cobblemon**: IVs, pesas, dibujo a lápiz, varias páginas y comunidad compartida.

**Sitio en vivo:** [https://yoditagege.github.io/PaginawebCrianza/](https://yoditagege.github.io/PaginawebCrianza/)

Clan **Cuervos Negros** · _yoditagg_

## Qué incluye

- **Cuaderno** — busca Pokémon, guarda IVs/naturaleza/género, une crias, pesas, notas y dibujo (con deshacer)
- **Varias páginas** — exportar / importar `.crianza.json` y guardar en el navegador
- **Comunidad** — inicia sesión con Google, publica una página y abre crianzas de otros
- **Canales** — Twitch en vivo (y canales YouTube desde admin)
- **Admin** — moderar publicaciones y gestionar canales (emails en `CRIANZA_ADMIN_EMAILS`)

## Páginas

| Archivo | Sección |
|---------|---------|
| `index.html` | Cuaderno |
| `comunidad.html` | Comunidad |
| `canales.html` | Canales |
| `admin.html` | Panel admin |

## Stack

- HTML / CSS / JavaScript (sin framework)
- [Firebase](https://firebase.google.com/) — Auth (Google), Firestore
- Bootstrap 5 en Comunidad / Canales / Admin
- Hosting: [GitHub Pages](https://pages.github.com/) (también compatible con Netlify)

## Probar en local

Sirve la carpeta por `http://` (Auth de Google no funciona bien con `file://`):

```bash
npx serve .
```

Abre la URL que muestre la terminal (por ejemplo `http://localhost:3000`).

## Firebase

La config pública está en `firebase-config.js`. Detalle paso a paso: [`FIREBASE.md`](FIREBASE.md).

Resumen:

1. Proyecto Firebase con Auth Google + Firestore
2. Pegar y publicar `firestore.rules`
3. En **Authentication → Settings → Authorized domains** añadir:
   - `localhost`
   - `yoditagege.github.io`
   - (y tu dominio de Netlify u otro host, si lo usas)
4. Emails admin en `CRIANZA_ADMIN_EMAILS` y en `firestore.rules`

## Estructura

```
├── index.html / app.js / styles.css   # Cuaderno
├── comunidad.html / canales.html / admin.html
├── css/site.css
├── js/           # Firebase, auth, comunidad, canales, admin
├── data/catalog.js
├── assets/       # Logo clan e iconos de items
├── firebase-config.js
├── firestore.rules / storage.rules
└── scripts/make-netlify-zip.js
```

## Licencia / uso

Proyecto del clan Cuervos Negros. Los datos de Pokémon se apoyan en catálogo local / PokéAPI; nombres e imágenes de Pokémon pertenecen a sus respectivos dueños.
