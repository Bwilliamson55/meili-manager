# Umami analytics

Optional client-only pageview tracking via [`src/boot/umami.js`](../src/boot/umami.js). The boot file is a no-op unless both build-time env vars are set. Offline browsers skip inject. Hash-mode SPA navigations are recorded with `router.afterEach` (first load is handled by the Umami script).

## Env vars

| Variable | Purpose |
|----------|---------|
| `VITE_UMAMI_URL` | Tracker script URL (n8n-01 uses `TRACKER_SCRIPT_NAME=stats`, so path is `/stats`) |
| `VITE_UMAMI_WEBSITE_ID` | Website ID from Umami admin |

Copy from [`.env.example`](../.env.example) for local builds. Leave `VITE_UMAMI_WEBSITE_ID` empty locally if you do not want analytics in dev.

## Production (GitHub Actions → `deploy-branch`)

CI builds via [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) and publishes to `deploy-branch`. Vite reads Umami values from **repository variables** (Settings → Secrets and variables → Actions → Variables):

| Repository variable | Value |
|---------------------|-------|
| `VITE_UMAMI_URL` | `https://analytics.weeumson.com/stats` |
| `VITE_UMAMI_WEBSITE_ID` | `7d58f62f-6f41-45f2-92be-406714151bbe` |

UI path: **Settings → Secrets and variables → Actions → Variables** (or `https://github.com/<owner>/meili-manager/settings/variables/actions`).

After setting or changing variables, re-run the deploy workflow (or push to `main`) so Vite bakes them into the client bundle.

## Production (DigitalOcean)

If you also build on DigitalOcean for **meili-manager.weeumson.com**, set the same keys as **build-time** environment variables on the Static Site / App.

In Umami admin, the website domain should be registered as `meili-manager.weeumson.com`.
