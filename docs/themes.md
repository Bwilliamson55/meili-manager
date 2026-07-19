# Themes

Named complete presets. Pick a look in the header palette menu. Each look maps to Quasar dark or light under the hood.

## Switch theme

1. Open the app header **Theme** (palette) menu.
2. Choose Weeumson Dark, Weeumson Light, Slate Dark, Slate Light, or High Contrast.
3. Choice persists in Pinia (`themeId`) and `localStorage` key `meili-manager-theme`.

Legacy `darkMode: false` migrates to `weeumson-light`; otherwise default is `weeumson-dark`.

## Add a theme

1. Copy a block in [`src/themes/catalog.js`](../src/themes/catalog.js).
2. Set `id`, `label`, `description`, `isDark`, and every key in `TOKEN_KEYS`.
3. Add the same `id` to `THEME_IDS` in [`src/meili-core/stores/settings-store.js`](../src/meili-core/stores/settings-store.js) (and to `LIGHT_THEME_IDS` if `isDark` is false).
4. Run `npm run check:themes` and fix any AA failures.
5. The picker and `applyTheme` pick it up automatically. No per-theme CSS files.

## Tokens

Required keys (`TOKEN_KEYS`): `page`, `pageElevated`, `border`, `text`, `textMuted`, `primary`, `secondary`, `accent`, `focusRing`, `onPrimary`, `positive`, `negative`, `info`, `warning`.

Runtime CSS vars: `--color-page`, `--color-page-elevated`, and so on. Vue uses token utilities only (`bg-page`, `text-text-muted`, `border-border`, `text-on-primary`).

## Portable unit (for later Weeumson PWAs)

Copy **`catalog.js` + `applyTheme.js` + `TOKEN_KEYS`**. Each app can keep fonts and extra tokens local. Do not maintain duplicate hex palettes in CSS.

## Contrast

```bash
npm run check:themes
```

Checks fixed AA pairs for every theme (body/muted text, on-primary, primary vs page, focus, border). Pair list lives in `scripts/check-theme-contrast.mjs`.
