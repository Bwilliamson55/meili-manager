# Reuse and Embedding Guide

This guide focuses on making `meili-manager` easy to fork, partially embed, or port into other Quasar apps.

## Fast Reuse Paths

## 1) Full Fork (quickest)

- Fork the repo and keep app structure intact.
- Rebrand app shell and sidebar labels first.
- Keep `src/stores/settings-store.js` unchanged initially to avoid auth/session regressions.

Best when you want a standalone admin app quickly.

## 2) Feature Embed (inside an existing Quasar app)

Embed these parts incrementally:

- Store: `src/stores/settings-store.js`
- Pages:
  - `src/pages/IndexPage.vue`
  - `src/pages/IndexDetailPage.vue`
  - `src/pages/DocumentDetailPage.vue`
  - `src/pages/TasksPage.vue`
  - `src/pages/KeysPage.vue`
- Shared settings UI:
  - `src/components/SettingsForm.vue`
  - `src/components/settings/*`
- Utilities:
  - `src/utils/notifications.js`
  - `src/utils/settings-config.js`
  - `src/utils/search-utils.js`

Then mount routes under a prefix such as `/search-admin/*`.

## 3) Headless Logic Reuse (minimal UI carry-over)

If you only want the operational logic:

- Keep Pinia store actions (`rawRequest`, per-index persisted state helpers).
- Replace UI pages with your own components.
- Reuse utility functions for state defaults and hybrid config shaping.

Best when your app already has a design system and UX.

## Portability Contract

If you want low-friction reuse across multiple apps, keep this contract stable:

- `settings-store` public methods:
  - `validateConnection()`
  - `getIndexClient(indexName)`
  - `rawRequest(path, options)`
  - `getIndexSearchState(indexName)`
  - `setIndexSearchState(indexName, state)`
- Search state defaults from `src/utils/search-utils.js`
- Settings metadata map in `src/utils/settings-config.js`

Treat these as "API-like" surfaces. Refactor internals, but keep signatures stable.

## Embedding in Another Quasar App

Suggested route namespace:

- `/search-admin` -> index list
- `/search-admin/index/:uid` -> index detail
- `/search-admin/doc/:indexUid/:documentUid` -> document editor
- `/search-admin/tasks` -> tasks
- `/search-admin/keys` -> keys

Integration checklist:

- Add Pinia persisted-state plugin in host app.
- Ensure Meilisearch credentials source is decided:
  - local admin input (current behavior), or
  - host-provided env/SSO token flow.
- Reuse `notifications.js` or adapt to host notification service.

## LLM/Hybrid Feature Bundle

For "wow" demos, keep these together:

- Settings:
  - `embedders`
  - `localizedAttributes`
- Search controls:
  - hybrid toggle
  - embedder input
  - semantic ratio
- Diagnostics:
  - ranking/performance toggles
  - metadata visibility

This bundle makes semantic behavior visible and explainable in demos.

## Practical DRY Rules for Future Work

- Add new per-index search toggles only once in defaults (`search-utils`) and consume everywhere else.
- Keep request-shaping helpers (like hybrid payload construction) in utils, not page components.
- Prefer export/import JSON packs for complex settings portability between projects.
