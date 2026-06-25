# meili-core

Headless Meilisearch management logic: Pinia stores, API services, and pure utilities with **no UI dependency**. Bring your own UI (Quasar, plain Vue, or anything else that runs Pinia).

This is the canonical source of truth for [meili-manager](../../README.md); the app's pages and components are just one UI built on top of it.

## What's inside

```
meili-core/
  stores/      Pinia stores (settings, indexes, tasks, keys, dynamic-rules, preview)
  services/    Thin Meilisearch REST wrappers (dynamic search rules, experimental features)
  utils/       Pure helpers (search state, display-settings, settings metadata, version compat, stats, formatting)
```

Every file imports only `meilisearch`, `jose`, `pinia`, and its siblings (relative paths). Nothing here imports a UI framework, so the folder is portable as-is.

## Use it in another project

1. Copy the whole `meili-core/` folder into your project (e.g. `src/meili-core/`).
2. Install the peer dependencies:

```bash
npm i meilisearch jose pinia pinia-plugin-persistedstate
```

3. Register the persisted-state plugin once, wherever you create Pinia:

```js
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
```

4. Import the stores and build any UI against them:

```js
import { useSettingsStore } from "src/meili-core/stores/settings-store";
import { useIndexesStore } from "src/meili-core/stores/indexes-store";

const settings = useSettingsStore();
await settings.addInstance("Prod", "https://meili.example.com", "masterKey");

await useIndexesStore().fetchIndexes();
```

## Notes for adapters

- **Errors surface to you.** Store actions `throw` on failure and never call a notification system. Wrap calls in `try/catch` and show errors with your own UI.
- **Import base path.** The examples use Quasar's built-in `src` alias. In a non-Quasar app, swap `src/meili-core/...` for your own relative or aliased base; the folder's internal imports are already relative and need no change.
- **Persistence.** `settings-store` and `preview-store` persist to `localStorage` via `pinia-plugin-persistedstate`. `keys-store` deliberately persists nothing.

## Portability contract (keep stable)

Treat these as the public API. Refactor internals freely, but keep these signatures:

- `settings-store`: `validateConnection()`, `getIndexClient(indexName)`, `rawRequest(path, options)`, `getIndexSearchState(indexName)`, `setIndexSearchState(indexName, state)`, `getIndexDisplaySettings(indexName)`, `setIndexDisplaySettings(indexName, settings)`, `getIndexSettingsCache(indexName)`, `setIndexSettingsCache(indexName, settings)`
- `utils/search-utils`: default search state + hybrid config helpers
- `utils/display-settings`: list field resolution, document id/title helpers, `DEFAULT_DISPLAY_SETTINGS`, `mergeDisplaySettings()`
- `utils/settings-config`: `SETTINGS_METADATA` (drives any settings UI)
