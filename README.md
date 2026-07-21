# Meili Manager

Open-source Quasar (Vue 3) PWA for managing multiple Meilisearch instances across development, staging, and production.

**Version**: 2.3.0  
**Demo**: [https://meili-manager.weeumson.com/#/](https://meili-manager.weeumson.com/#/)

Credentials never leave the browser: instance URLs and API keys are stored in `localStorage` via Pinia persisted state. Do not commit secrets.

Install icons and the header mark are original Weeumson art, not Meilisearch corporate identity. See [`docs/pwa.md`](docs/pwa.md).

## Docs

- PWA install / offline shell / icon regen: [`docs/pwa.md`](docs/pwa.md)
- Workspace UX (index-first, Playground, side panel): [`docs/workspace-ux.md`](docs/workspace-ux.md)
- Themes (picker, catalog, contrast): [`docs/themes.md`](docs/themes.md)
- Reuse/fork/embed playbook: [`docs/reuse-and-embedding.md`](docs/reuse-and-embedding.md)
- Headless core (copy-paste): [`src/meili-core/README.md`](src/meili-core/README.md)
- Dynamic search rules: [`docs/dynamic-search-rules.md`](docs/dynamic-search-rules.md)
- Release readiness summary: [`docs/release-readiness-1.42.md`](docs/release-readiness-1.42.md)
- Dual-version QA checklist: [`docs/qa-checklist-1.11-1.42.md`](docs/qa-checklist-1.11-1.42.md)
- GitHub release draft: [`RELEASE_DRAFT_1.42.md`](RELEASE_DRAFT_1.42.md)
- Playwright shell screenshots (mobile/desktop review): [`docs/e2e-screenshots.md`](docs/e2e-screenshots.md)
- Umami analytics (optional DO build env): [`docs/umami.md`](docs/umami.md)

## Quick start

```bash
npm install
npm run lint
npm run check:themes
npm run dev
```

`npm run dev` runs `quasar dev` (also fine via `npx quasar`). Dev server defaults to the Quasar/Vite port (usually `http://localhost:9000/`). Hash routing is used so the SPA works on static hosts such as `meili-manager.weeumson.com`.

### Screenshot review (Playwright)

One-time: `npx playwright install chromium`. Then with the app on `:9000` (or let Playwright start `npm run dev`):

```bash
npm run test:e2e
# or
npm run review:screenshots
```

PNGs land in `tests/e2e/screenshots/` (gitignored). No Meili API keys required; specs capture the unconnected shell. Details: [`docs/e2e-screenshots.md`](docs/e2e-screenshots.md).

### Production build (PWA)

```bash
npm run icons      # after editing public/icons/meili-manager-icon.svg
npm run build:pwa  # → dist/pwa/ (sw.js, manifest, 404.html)
```

SPA-only: `npm run build` → `dist/spa/`. CI deploys the PWA output.

### Changelog

```bash
npm run build-changelog
```

Generates `changelog.json` with versioned entries grouped by ISO week.

### Code quality

```bash
npm run lint
npm run check:themes
npm run format
```

## Core features

### Broad version compatibility

The UI is tuned for backward-compatible operation across legacy and modern Meilisearch servers. Current target support is:

- `1.11.x` (legacy-safe behavior with feature gating)
- `1.42.x` (full modern CE capabilities exposed in UI)

### Multi-instance management

Save and switch instances on the **Instances** page (drawer nav). Credentials are validated on add/switch and persisted locally.

### Index-first workspace

Open an index to work in peer tabs: **Documents** | **Settings** | **Playground** | Overview.

- Indexes home: cluster stats, dense list, **Continue** for last index/tab
- Documents: InstantSearch browser; click a hit for a JSON side panel (copy, edit toggle, Open in Playground, full editor)
- Settings: category jump + sticky unsaved/Submit bar (explicit save only)
- Playground: raw HTTP builder with redacted curl / HTTP / canvas-pasteable n8n HTTP Request JSON (with-key secondary copies)

See [`docs/workspace-ux.md`](docs/workspace-ux.md).

### API keys and tasks

- Create and manage API keys with granular permissions
- Monitor recent tasks (sortable/searchable table, cancel selected when supported)

### Dynamic search rules

Experimental condition-based pinning UI when the server exposes the feature. See [`docs/dynamic-search-rules.md`](docs/dynamic-search-rules.md).

### Preview mode (disabled)

Preview routes remain in the tree but are disabled in the router. Do not revive them unless you are intentionally working that alpha surface.

## Theme

Named presets from a single catalog (`src/themes/catalog.js`): Weeumson Dark (default), Weeumson Light, Slate Dark, Slate Light, High Contrast. Header palette picker; WCAG AA checked via `npm run check:themes`. See [`docs/themes.md`](docs/themes.md).

- IBM Plex Sans
- Runtime CSS vars + Quasar `setCssVar` from the catalog (no per-theme CSS palettes)
- Build-time Quasar brand defaults match Weeumson Dark

UI priority: Quasar props → Tailwind utilities → Quasar utility classes → scoped CSS last.

## Key dependencies

- **meilisearch** - JavaScript client for Meilisearch API
- **@meilisearch/instant-meilisearch** - Adapter for Vue InstantSearch
- **vue-instantsearch** - Search UI components
- **vue3-ts-jsoneditor** - JSON editor for document editing
- **jose** - JWT encoding for preview sharing
- **pinia** + **pinia-plugin-persistedstate** - State management with persistence
- **Quasar Framework** - Vue 3 UI framework
- **Tailwind CSS** - Utility-first CSS framework (v4)

## Architecture

### Headless core

Business logic lives in `src/meili-core/` (stores, services, pure utils). The Quasar pages are one UI on top of that core. Forkers can copy `meili-core` into another Vue app. See [`src/meili-core/README.md`](src/meili-core/README.md).

### Client management

All Meilisearch client creation goes through `src/meili-core/stores/settings-store.js`:

- Automatic connection validation
- On-demand client via store getter
- `rawRequest` / Playground helpers for HTTP that matches n8n/Postman exports
- Per-index search, display, and Playground drafts

### Routing

Hash history SPA under `MainLayout`:

- `/` Indexes
- `/instances` Credentials and instance switcher
- `/keys`, `/tasks`, `/dynamic-rules`
- `/index-details/:uid?tab=documents|settings|playground|overview`
- `/documents/:indexUid/:documentUid` full editor escape hatch
- `/similar/:indexUid/:documentUid` when embedders/similar are available

### State management

- **settings-store.js** - Instance credentials, last index/tab, per-index search/display/playground state, settings cache
- **indexes-store / keys-store / tasks-store / dynamic-rules-store** - Domain lists and mutations
- **preview-store.js** - Preview configurations (UI currently disabled)

Document list field resolution lives in `src/meili-core/utils/display-settings.js`.

---

## Deployment

### Static hosting

- Build command: `npx quasar build` (or `npm run build`)
- Output directory: `dist/spa`

Host on any static file server (Nginx, Caddy, GitHub Pages, DigitalOcean Static Site, etc.). Hash routes avoid server rewrite requirements.

### Umami (optional)

Client analytics load only when both `VITE_UMAMI_URL` and `VITE_UMAMI_WEBSITE_ID` are set at build time (`src/boot/umami.js`). See [`.env.example`](.env.example) and [`docs/umami.md`](docs/umami.md).

For GitHub Actions builds (`.github/workflows/deploy.yml` → `deploy-branch`), set **repository variables** (not secrets):

- `VITE_UMAMI_URL` = `https://analytics.weeumson.com/stats`
- `VITE_UMAMI_WEBSITE_ID` = `7d58f62f-6f41-45f2-92be-406714151bbe`

Path: **Settings → Secrets and variables → Actions → Variables**.

The same keys work for DigitalOcean Static Site build env. Register the domain in Umami admin as `meili-manager.weeumson.com`.

### Native applications

Quasar supports Cordova/Capacitor and Electron builds. See [Quasar documentation](https://quasar.dev). Browser extension scaffolding exists under `src-bex/` but is not the primary product path.

## Customization

Fork this repository and adapt to your needs. Vue 3 Composition API, Quasar components, Tailwind utilities.

Key points:

- `src/meili-core/` - Keep store/API contracts stable when embedding
- `src/pages/` / `src/components/` - App shell and workspace UI
- `src/utils/notifications.js` - Notify/Dialog helpers
- `generateChangelog.cjs` - Changelog generation

---

## Getting started

### Adding your first instance

1. Open **Instances** from the left drawer (or the connect panel if you are not connected yet)
2. Enter:
   - **Label**: Descriptive name (e.g. Production)
   - **URL**: Meilisearch endpoint (`https://example.com` or `http://localhost:7700`)
   - **API key**: Master or admin key with sufficient permissions
3. Click **Add instance**

The connection is validated before the instance is saved.

### Required permissions

Minimum for basic read paths:

- `indexes.get`
- `documents.get`

For full functionality (creating indexes, managing keys, settings writes), use a master key or admin key. Create more restrictive keys once configuration is complete.

### Endpoints/Methods used

- [getVersion](https://github.com/meilisearch/meilisearch-js#version-)

---

## Indexes home

List of indexes with created/updated timestamps, document counts, attribute counts when available, **Open** into the workspace, and delete with confirmation. **Continue** resumes the last index and tab.

### Endpoints/Methods used

- [getRawIndexes](https://github.com/meilisearch/meilisearch-js#get-all-indexes)
- [createIndex](https://github.com/meilisearch/meilisearch-js#create-a-new-index)
- [deleteIndex](https://github.com/meilisearch/meilisearch-js#delete-index)

---

## Index detail workspace

Tabs: **Documents** (default), **Settings**, **Playground**, **Overview**. Tab choice syncs to `?tab=` and is persisted per index.

### Overview

- Document count, primary key, indexing flag
- Field distribution table
- Paginated fields metadata when the server exposes `/fields`

### Settings

Review and update index settings. Expand **Raw Settings JSON** for a live object dump. Use section jump into Search / Relevancy / Performance / Advanced / AI. Changes stay local until **Submit**.

### Documents

InstantSearch browser:

- Query, sort, filters (advanced / LLM controls collapsed by default)
- Display menu: compact / detailed / table, list fields, thumbnails
- Filters panel: **Configure attributes** to choose which filterable fields show as facets (local per-index display setting), or quickly add attributes as filterable/searchable (writes Meilisearch settings and re-indexes; full reorder/remove remains under Settings → Search)
- Click a hit to open the JSON side panel; full editor via **Open full editor** or `/documents/...`
- Fetch by IDs when supported; **New** creates via the full editor route
- Diagnostics: **Open in Playground** with an effective search body when available

### Playground

Craft `GET`/`POST`/… requests against the active instance, Send, inspect status/timing/JSON, copy redacted curl (default) or with-key / HTTP / n8n workflow JSON (paste onto the n8n canvas). Presets are grouped (Search, Documents, Index, Instance, Tasks, Keys, Experimental): Search covers hybrid, multi-search, federated (`federation.distinct` knobs), similar, and facet-search. Single-index search knobs never mutate `/multi-search`. Seed from Documents hit or diagnostics. See [`docs/workspace-ux.md`](docs/workspace-ux.md).

### Endpoints/Methods used

- [index](https://github.com/meilisearch/meilisearch-js#using-the-index-object-1)
- [getStats](https://github.com/meilisearch/meilisearch-js#get-specific-index-stats)
- [getSettings](https://github.com/meilisearch/meilisearch-js#get-settings)
- [fetchPrimaryKey](https://github.com/meilisearch/meilisearch-js#get-primary-key-of-an-index)
- [updateSettings](https://github.com/meilisearch/meilisearch-js#update-settings)
- [waitForTask](https://github.com/meilisearch/meilisearch-js#using-the-index)
- Raw `fetch` via Playground / `rawRequest` for HTTP parity with exports

---

## Document detail page

Full-page JSON editor escape hatch (text mode). Prefer the Documents side panel for quick inspection.

### Endpoints/Methods used

- [getDocument](https://github.com/meilisearch/meilisearch-js#get-one-document)
- [addDocuments](https://github.com/meilisearch/meilisearch-js#add-or-replace-multiple-documents)
- [waitForTask](https://github.com/meilisearch/meilisearch-js#using-the-index)

---

## Keys page

Review keys, create with actions/indexes, update and delete. Prefer a scoped admin key over long-term master key use in the UI.

**Please review [the Keys documentation](https://docs.meilisearch.com/reference/api/keys.html).**

### Endpoints/Methods used

- [getKeys](https://github.com/meilisearch/meilisearch-js#get-keys)
- [updateKey](https://github.com/meilisearch/meilisearch-js#update-a-key)
- [deleteKey](https://github.com/meilisearch/meilisearch-js#delete-a-key)
- [createKey](https://github.com/meilisearch/meilisearch-js#create-a-key)

---

## Tasks page

Paginated, sortable, searchable table of recent tasks (capped around the most recent 1000). Useful to see whether an index is busy or a task failed.

### Endpoints/Methods used

- [getTasks](https://github.com/meilisearch/meilisearch-js#get-all-tasks)

---

## License

MIT. See [`LICENSE`](LICENSE).

## Contributing

Issues and PRs are welcome. Keep changes focused; prefer extending `meili-core` carefully over breaking store contracts. Run `npm run lint` before opening a PR. Manual acceptance ideas against a real index are listed in [`docs/workspace-ux.md`](docs/workspace-ux.md) and the UX overhaul plan checklist (Continue, side panel Esc/copy, settings Submit, Playground redacted curl, drawer Instances/Keys/Tasks/Rules).
