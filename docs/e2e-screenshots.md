# Playwright screenshot review (meili-manager)

Minimal smoke screenshots so agents can review mobile and desktop shell UI without a live Meilisearch or real API keys.

## One-time setup

```bash
npm install
npx playwright install chromium
```

Chromium is not assumed to be installed globally.

## Run

Dev server defaults to `http://localhost:9000/`. Playwright reuses an existing server when available (`reuseExistingServer`).

```bash
# Start the app if nothing is already on :9000
npm run dev

# Write screenshots (desktop 1280x800 + mobile 390x844)
npm run test:e2e

# Same suite (tagged @visual)
npm run review:screenshots
```

Hash routes are used (`/#/`, `/#/instances`). Specs clear of credentials: empty browser storage shows the **Connect to Meilisearch** / **Not connected** shell. Do not commit secrets.

## Output (gitignored)

| Path | Purpose |
|------|---------|
| `tests/e2e/screenshots/` | PNGs named `{page}-{desktop\|mobile}.png` (plus `home-drawer-mobile.png`) |
| `test-results/` | Playwright failure artifacts |
| `playwright-report/` | HTML report if enabled |

Open the screenshot folder after a run and inspect the PNGs before treating UI work as done.

## Limitations

Without saved instance credentials, captures show the connect gate and Instances form, not a live index/workspace. That is intentional for CI and local review without API keys.
