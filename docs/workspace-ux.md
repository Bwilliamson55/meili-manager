# Index workspace UX

Meili-Manager is open source. This note describes the current shell and index-first workflow so contributors and self-hosters know what to expect.

## Shell

- Persistent left drawer: Indexes, Instances, Keys, Tasks, Dynamic rules.
- Header context chip shows active instance label, host, and current index when you are inside an index route.
- Unconnected state shows a connect panel that links to **Instances** instead of blanking the app behind a hard banner.
- Theme tokens follow a Weeumson docs-style dark shell (IBM Plex Sans, terracotta primary, square elevated surfaces). Values live in `src/css/tailwind.css`, `src/css/app.scss`, and `src/css/quasar.variables.scss`.

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

### Settings

- Nested category tabs kept (Search, Relevancy, Performance, Advanced, AI).
- Jump buttons skip hunting; sticky bar shows unsaved state; Submit remains explicit (no auto-save).

### Playground

- Builds live calls against the active instance (raw `fetch`, not InstantSearch).
- Export strip is available before Send: redacted Bearer curl by default; secondary copies include the key for local n8n/Postman.
- Documents diagnostics and hit panel can seed search or get-document requests.
- Destructive methods require an explicit confirm toggle before Send.
- Shortcut: `Ctrl/Cmd+Enter` sends.

Helpers: `src/meili-core/utils/playground-request.js`. Drafts persist per index in `settings-store.indexPlaygroundState`.

## Contribution notes

- Prefer Quasar component props, then Tailwind utilities, then Quasar utility classes, then scoped CSS.
- Keep `src/meili-core/` store/API contracts stable; extend carefully.
- Do not commit secrets or `.env` files. Instance keys stay in browser `localStorage` via Pinia persisted state.
