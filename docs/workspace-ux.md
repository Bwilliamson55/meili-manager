# Index workspace UX

Meili-Manager is open source. This note describes the current shell and index-first workflow so contributors and self-hosters know what to expect.

## Shell

- Persistent left drawer: Indexes, Instances, Keys, Tasks, Dynamic rules.
- Header context chip shows active instance label, host, and current index when you are inside an index route.
- Unconnected state shows a connect panel that links to **Instances** instead of blanking the app behind a hard banner.
- Themes are named presets from [`src/themes/catalog.js`](../src/themes/catalog.js) (Weeumson Dark default, plus Light / Slate / High Contrast). Runtime CSS vars and Quasar `setCssVar` come from the catalog; see [`docs/themes.md`](themes.md). Shell uses IBM Plex Sans and square elevated surfaces.

## Indexes home

- Cluster stats and index list use bordered elevated cards.
- **Continue** resumes the last index and last tab (`lastIndexUid` / `lastIndexTab` in `settings-store`).
- Create index stays a dialog.

## Index workspace (`/index-details/:uid`)

Peer tabs (query `?tab=` is shareable):

| Tab | Role |
| --- | --- |
| **Documents** | InstantSearch browser; click a hit for a JSON side panel |
| **Settings** | Full settings form with section jump and sticky Submit |
| **Playground** | Raw HTTP request builder with curl / HTTP / n8n exports |
| **Overview** | Stats, field distribution, fields metadata |

### Documents side panel

- Read-only JSON by default (`vue3-ts-jsoneditor` view mode).
- Actions: Copy JSON, Edit (toggle writable), Open in Playground, Open full editor, Similar (when available).
- Full `/documents/:index/:id` page remains the deep-link escape hatch.
- Shortcuts: `Esc` closes the panel; `/` focuses the search query when focus is not in an input.

### Documents filters and facets

- The Filters panel lists Meilisearch `filterableAttributes` as InstantSearch facets.
- **Configure attributes** (tune icon next to Clear) opens a dialog with two layers:
  - **Show in filters**: pick which filterable attributes appear as facets. Stored per index in `indexDisplaySettings.visibleFilterAttributes` (`null` = show all). Does not write Meilisearch settings.
  - **Index settings**: append attributes to `filterableAttributes` and/or `searchableAttributes` via `updateSettings`, wait for the task, refresh the settings cache, then refresh facets. Confirms with a re-index warning (same tone as Settings). Append only; reorder/remove stay on **Settings → Search**.

### Settings

- Nested category tabs kept (Search, Relevancy, Performance, Advanced, AI).
- Jump buttons skip hunting; sticky bar shows unsaved state; Submit remains explicit (no auto-save).

### Playground

- Builds live calls against the active instance (raw `fetch`, not InstantSearch).
- Presets are grouped: **Search**, **Documents**, **Index**, **Instance**, **Tasks**, **Keys**, **Experimental** (default group: Search). Pick a group, then a chip; free-form method/path/body still works for anything without a preset.
- Search group includes hybrid (`hybrid.embedder` + `semanticRatio`), multi-search, federated multi-search, similar, and facet-search starters.
- **Federation knobs** appear for `POST /multi-search` when the body has `federation`. They sync only into `body.federation` (`distinct`, `limit`, `offset`) and never rewrite `queries`. Prefer `federation.distinct` over query-level `distinct` (Meilisearch returns 400 if both are set).
- **Single-index search knobs** (q, filter, limit, offset, sort, attributesToRetrieve, hybrid) apply only to `POST /indexes/.../search`. They never run on `/multi-search`.
- Export strip is available before Send: redacted Bearer curl by default; secondary copies include the key for local n8n/Postman.
- **Copy n8n JSON** / **n8n + key** copy a canvas-pasteable workflow snippet (one `n8n-nodes-base.httpRequest` node, typeVersion 4.2). Paste with Ctrl/Cmd+V on the n8n canvas. Redacted uses `Bearer REDACTED`; **n8n + key** embeds the real key in the Authorization header. Node defaults: `options.timeout` 30000 ms, `retryOnFail` with `maxTries` 3 and `waitBetweenTries` 1000 ms. JSON body uses `contentType: json` + `specifyBody: json` + string `jsonBody` (Meili search/documents). Content-Type is left to the HTTP Request node; only Authorization is set as a header.
- Documents diagnostics and hit panel can seed search or get-document requests.
- Destructive methods require an explicit confirm toggle before Send.
- Shortcut: `Ctrl/Cmd+Enter` sends.

Helpers: `src/meili-core/utils/playground-request.js`. Drafts persist per index in `settings-store.indexPlaygroundState`.

## Contribution notes

- Prefer Quasar component props, then Tailwind utilities, then Quasar utility classes, then scoped CSS.
- Keep `src/meili-core/` store/API contracts stable; extend carefully.
- Do not commit secrets or `.env` files. Instance keys stay in browser `localStorage` via Pinia persisted state.
