# Meili Manager PWA

Meili Manager ships as an installable Progressive Web App (Quasar **InjectManifest**, same pattern as Weeumson Menu).

## What offline means

- **Cached:** app shell (HTML/JS/CSS), fonts, and static icons so the UI chrome can load when the network is down.
- **Not cached:** Meilisearch API traffic. Managing indexes, documents, keys, and tasks still needs a reachable Meilisearch host.

Offline = UI shell only. Connect an instance when the network is available.

## Install names

| Field | Value |
|-------|--------|
| Manifest `name` / `short_name` | **Meili Manager** |
| `package.json` `productName` | **Meili Manager** |

## Branding / icons

Install icons and the header mark are **original Weeumson art** (`public/icons/meili-manager-icon.svg`), not Meilisearch corporate identity. Nav tabs use Quasar Material Icons only.

Regenerate rasters after editing the SVG master:

```bash
npm run icons
```

That writes favicons, `icon-192` / `icon-512`, maskable variants, `apple-touch-icon.png`, and `public/favicon.ico`.

## Local commands

```bash
npm run dev:pwa    # PWA mode with service worker
npm run build:pwa  # production → dist/pwa (+ 404.html spa-fallback)
```

After `build:pwa`, confirm `dist/pwa/sw.js` and `dist/pwa/manifest.json` exist.

## Updates

When a new service worker is waiting, the UI shows a Notify: **Update available / Reload**. Choosing Reload applies `SKIP_WAITING` and refreshes the page.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) runs `npm run build:pwa` and publishes `./dist/pwa` to `deploy-branch`. Optional Umami build env (`VITE_UMAMI_*`) is unchanged; see [`docs/umami.md`](umami.md).
