import { Dark, setCssVar } from "quasar";
import {
  DEFAULT_THEME_ID,
  QUASAR_BRAND_KEYS,
  TOKEN_KEYS,
  resolveTheme,
  themes,
  tokenToCssVar,
} from "./catalog.js";

export const THEME_STORAGE_KEY = "meili-manager-theme";
export { DEFAULT_THEME_ID };

/**
 * Resolve a stored theme id, including legacy darkMode from Pinia settings.
 */
export function readStoredThemeId() {
  try {
    const direct = localStorage.getItem(THEME_STORAGE_KEY);
    if (direct && themes[direct]) return direct;

    const raw = localStorage.getItem("settings");
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.themeId && themes[data.themeId]) return data.themeId;
      if (data?.darkMode === false) return "weeumson-light";
    }
  } catch {
    // ignore corrupt storage
  }
  return DEFAULT_THEME_ID;
}

/**
 * Apply a catalog theme: CSS vars, data-theme, Quasar Dark + brand.
 */
export function applyTheme(id) {
  const theme = resolveTheme(id);
  const root = document.documentElement;

  root.dataset.theme = theme.id;
  root.style.colorScheme = theme.isDark ? "dark" : "light";

  for (const key of TOKEN_KEYS) {
    const value = theme.tokens[key];
    if (value) {
      root.style.setProperty(tokenToCssVar(key), value);
    }
  }

  Dark.set(theme.isDark);

  for (const key of QUASAR_BRAND_KEYS) {
    const value = theme.tokens[key];
    if (value) setCssVar(key, value);
  }
  setCssVar("dark", theme.tokens.pageElevated);
  setCssVar("dark-page", theme.tokens.page);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);
  } catch {
    // private mode / quota
  }

  return theme;
}
