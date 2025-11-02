# Copilot Guidance (Agent Mode — Local Only)

## Stack & Style

- Vue 3 `<script setup>` only. JS, not TS (unless the file is TS).
- Quasar components: Use Q\* components (q-btn, q-input, q-table, q-dialog, etc.) for complex UI elements.
- Tailwind CSS: Use Tailwind utility classes for all spacing, layout, and simple styling. Replace Quasar utility classes (q-pa-_, q-mt-_, etc.) with Tailwind equivalents.
- Import alias: `src/` for all imports (e.g., `import { useSettingsStore } from 'src/stores/settings-store'`).
- Keep code **simple, readable, minimal**. Early returns > nested logic. Small functions > big ones.
- No test scaffolds, no placeholder mocks.

## Architecture: Multi-Instance Meilisearch Manager

**Core Purpose**: Manage multiple Meilisearch instances (dev/staging/prod), configure indexes, search documents, manage API keys and tasks.

### Key Data Flow

1. **Instance Management**: `settings-store.js` holds `instances[]` array with `{label, indexUrl, indexKey}` objects persisted via `pinia-plugin-persistedstate`.
2. **Centralized MeiliSearch Client**: Store provides `getMeiliClient()` action that returns validated, cached client. Components call `await theSettings.getMeiliClient()` instead of creating clients directly.
3. **Instance Switching**: Store actions `switchInstance(index)`, `addInstance(label, url, key)`, `removeInstance(index)` handle validation and state updates.
4. **Preview Mode**: Separate `preview-store.js` for shareable dashboard configs. Uses `jose` for tokenizing settings (future sharing feature). Preview has its own instance/index selection independent of main app.
5. **Named Router Views**: `MainLayout.vue` uses dual `<router-view>` slots (`name="main"` and `name="side"`) for page content + sidebar. See `routes.js` for `components: { main: PageVue, side: SidebarVue }` pattern.

### Critical Files

- `src/stores/settings-store.js`: Centralized client management. State: `activeClient`, `clientError`, `isConnecting`. Actions: `getMeiliClient()`, `getIndexClient(name)`, `switchInstance(index)`, `addInstance()`, `removeInstance()`, `invalidateClient()`.
- `src/stores/preview-store.js`: Preview configs with `previewSettings` object (pagination, filters, sortable/image/heading attributes). Actions: `savePreviewSettings()`, `loadPreviewSettings()`, `tokenizePreviewSettings()`.
- `src/boot/instant-search.js`: Registers Vue InstantSearch globally (used in `IndexDetailPage.vue` and `PreviewPage.vue` for live search UI).
- `quasar.config.js`: Boot files order matters. Current: `['instant-search']`. Uses ES modules (`import`/`export`).

## Developer Workflows

**Dev Server**: `quasar dev` (opens browser automatically, hot-reload enabled)
**Build**: `quasar build` → outputs to `dist/spa/`
**Changelog**: `npm run build-changelog` → generates `changelog.json` from git history
**Lint**: `npm run lint` (ESLint with Vue plugin)
**Format**: `npm run format` (Prettier with ignore patterns)

**Key Dependencies** (avoid adding more):

- `meilisearch` (latest): JS client for Meilisearch API
- `@meilisearch/instant-meilisearch` (latest): Adapter for Vue InstantSearch
- `vue-instantsearch` (latest): Search UI components (stats, filters, hits)
- `vue3-ts-jsoneditor` (latest): JSON editor for document editing
- `jose` (latest): JWT/token encoding (for preview sharing feature)
- `pinia-plugin-persistedstate` (latest): Auto-persist stores to localStorage
- `tailwindcss` (v4) + `@tailwindcss/postcss`: CSS framework via PostCSS (not Vite plugin)

**Developer Tools**:

- `generateChangelog.cjs`: Generates `changelog.json` from git history, grouped by ISO week
- GitHub Actions: Automated deployment with changelog generation to GitHub Pages

## Behavior in Agent Mode (Local Only)

- **Edit files directly** (no branches/commits/PRs; no Git text).
- Respect existing ESLint/Prettier. Keep diffs small and scoped.
- Add short inline comments only when they increase clarity.

## UX Patterns

### Notifications

**Always use the centralized utility** in `src/utils/notifications.js`:

```javascript
import {
  showSuccess,
  showError,
  showWarning,
  showConfirmation,
} from "src/utils/notifications";

// Simple notifications
showSuccess("Operation completed");
showError("Something went wrong");
showWarning("Please review this");

// Confirmations
showConfirmation("Really delete this item?", async () => {
  /* delete logic */
});
```

### Quasar Components

- **Forms**: `<q-form @submit="onSubmit">` with `q-input`/`q-select` and inline `:rules` arrays
- **Dialogs**: `q-dialog` with `v-model` + `persistent` prop for confirmations
- **Tables**: `q-table` with `:rows`, `:columns`, `row-key`
- **Drawers**: `q-drawer` with `behavior="mobile"` for responsive sidebars
- **Icons**: Material icons only: `<q-icon name="delete">` (not FontAwesome)

### Tailwind Utilities

**Spacing** (use Tailwind, not Quasar):

- Padding: `p-4`, `px-6`, `py-2` (not `q-pa-md`)
- Margin: `mt-4`, `mb-8`, `mx-auto` (not `q-mt-sm`)
- Gap: `gap-4`, `space-x-2` (not `q-gutter-md`)

**Layout** (use Tailwind, not Quasar):

- Flexbox: `flex`, `flex-col`, `items-center`, `justify-between` (not `row`/`col`)
- Grid: `grid`, `grid-cols-3`, `gap-4`
- Sizing: `w-full`, `max-w-4xl`, `h-screen`

**Typography** (use Tailwind):

- Size: `text-sm`, `text-lg`, `text-3xl`
- Weight: `font-bold`, `font-semibold`
- Color: `text-gray-600`, `text-white`

**Responsive Design** (use Tailwind breakpoints):

- `sm:`, `md:`, `lg:`, `xl:` prefixes
- Example: `flex flex-col md:flex-row gap-4`

---

## Pinia Rules (Do This)

- **State**: serializable refs/reactives (arrays/objects/primitives). Include `isLoading`, `error`.
- **Getters**: cheap derivations only; **no async** in getters.
- **Actions**: all network I/O, side effects, debouncing/throttling live here (not in components).
- **Error handling**: wrap I/O in `try/finally`; set a user-friendly `error.value = e.message || 'Failed'`.
- **Persistence**: use `pinia-plugin-persistedstate`, but specify paths when needed in the 'persist' key.
  Do **not** persist volatile collections or server caches.
- **API placement**: if components call APIs directly, **move them into store actions** and update imports/calls.

## Version 2.0.0 Changes

**Tailwind CSS v4 Migration** (✅ Complete):

- All Quasar utility classes replaced with Tailwind equivalents
- PostCSS configuration with `@tailwindcss/postcss` plugin
- Traditional @tailwind directives (base, components, utilities)
- CommonJS config files (.cjs extension) for ES module compatibility
- All 8 page components refactored with consistent Tailwind patterns

**Centralized Notifications** (✅ Complete):

- Simplified `src/utils/notifications.js` utility
- All components use `showSuccess()`, `showError()`, `showWarning()`, `showConfirmation()`
- Zero direct `$q.notify()` calls in components
- Consistent notification styling across application

**Changelog Generation** (✅ Complete):

- `generateChangelog.cjs` script generates version history from git commits
- Grouped by ISO week with semantic versioning
- Integrated into GitHub Actions deployment workflow
- `changelog.json` deployed with application to GitHub Pages

**Centralized Client Management** (v1.0.0 baseline):

- All MeiliSearch client creation goes through `settings-store.js`
- Components use `await theSettings.getMeiliClient()` with validation and caching
- Connection errors handled gracefully with user notifications
- Store actions for `switchInstance()`, `addInstance()`, `removeInstance()`

## Edit Checklist (Agent)

1. If a component fetches data → move to a store action, persist in state with `pinia-plugin-persistedstate` if needed to reduce repetitious calls.
2. If a composable holds shared mutable state → convert to a store.
3. If a component/composable uses custom UI → replace custom UI with Quasar equivalents (QTable/QForm/QMenu/QDrawer) when present.
4. If a component uses Quasar utility classes → replace with Tailwind equivalents (q-pa-md → p-4, q-mt-sm → mt-2, etc.)
5. If a component calls $q.notify() → use centralized notification utilities from `src/utils/notifications.js`
6. Remove duplicate helpers/composables; keep one tiny, obvious version.
7. Keep diffs tight; avoid unrelated refactors.
8. Add inline comments only when they improve clarity.
9. This is a SPA so SSR guards are not needed unless the file is shared with SSR code.

## Documentation Guidelines

- Write in present/future tense only. No past tense or progress reports.
- Documentation reflects current state and future plans. Commit history tracks what was done.
- Timelines are "as soon as possible". Sprints are hours, not days or weeks.
- Use simple language, short sentences, bullet points.
- No emojis that a human would not normally use in documentation.
- Keep docs minimal: architecture diagrams, API references, and user workflows only.
- Delete progress reports, migration guides, and before/after comparisons once work is complete.

## Anti-Goals

- No branches/commits/PRs, no Git messaging.
- No new runtime dependencies without a clear, local win.
- No Options API.
- No complex abstractions or generic factories just to be clever.

## Goal

Be a helpful co-author that edits in place — fast, small, reversible changes that align with simplicity and Quasar standards.
