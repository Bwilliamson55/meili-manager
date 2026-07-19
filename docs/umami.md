# Umami analytics

Optional client-only pageview tracking via [`src/boot/umami.js`](../src/boot/umami.js). The boot file is a no-op unless both build-time env vars are set. Offline browsers skip inject. Hash-mode SPA navigations are recorded with `router.afterEach` (first load is handled by the Umami script).

## Env vars

| Variable | Purpose |
|----------|---------|
| `VITE_UMAMI_URL` | Tracker script URL (n8n-01 uses `TRACKER_SCRIPT_NAME=stats`, so path is `/stats`) |
| `VITE_UMAMI_WEBSITE_ID` | Website ID from Umami admin |

Copy from [`.env.example`](../.env.example) for local builds. Leave `VITE_UMAMI_WEBSITE_ID` empty locally if you do not want analytics in dev.

## Production (DigitalOcean)

For **meili-manager.weeumson.com**, set these as **build-time** environment variables on the DO Static Site / App:

- `VITE_UMAMI_URL` = `https://analytics.weeumson.com/stats`
- `VITE_UMAMI_WEBSITE_ID` = `7d58f62f-6f41-45f2-92be-406714151bbe`

In Umami admin, the website domain should be registered as `meili-manager.weeumson.com`.

Redeploy after changing build env so Vite bakes the values into the client bundle.
