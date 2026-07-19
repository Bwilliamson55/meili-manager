/**
 * Single source of truth for meili-manager themes.
 * Picker swatches, CSS vars, Quasar brand, and contrast checks all read from here.
 */

export const DEFAULT_THEME_ID = "weeumson-dark";

export const TOKEN_KEYS = [
  "page",
  "pageElevated",
  "border",
  "text",
  "textMuted",
  "primary",
  "secondary",
  "accent",
  "focusRing",
  "onPrimary",
  "positive",
  "negative",
  "info",
  "warning",
];

/** Quasar setCssVar brand keys derived from the same tokens object. */
export const QUASAR_BRAND_KEYS = [
  "primary",
  "secondary",
  "accent",
  "positive",
  "negative",
  "info",
  "warning",
];

export const themes = {
  "weeumson-dark": {
    id: "weeumson-dark",
    label: "Weeumson Dark",
    description: "Earthy dark shell with terracotta primary.",
    isDark: true,
    tokens: {
      page: "#1a1714",
      pageElevated: "#232019",
      border: "#7a7268",
      text: "#ebe6dc",
      textMuted: "#b8b0a4",
      primary: "#b85538",
      secondary: "#8a9480",
      accent: "#b8956c",
      focusRing: "#d4a574",
      onPrimary: "#ffffff",
      positive: "#7a9a70",
      negative: "#d46a5c",
      info: "#7a9eb0",
      warning: "#d4a05a",
    },
  },
  "weeumson-light": {
    id: "weeumson-light",
    label: "Weeumson Light",
    description: "Warm paper surfaces with the same terracotta brand.",
    isDark: false,
    tokens: {
      page: "#f7f3ec",
      pageElevated: "#fffdf8",
      border: "#8a8278",
      text: "#1c1916",
      textMuted: "#5a544c",
      primary: "#a34a30",
      secondary: "#5a6554",
      accent: "#8a6e4a",
      focusRing: "#a34a30",
      onPrimary: "#ffffff",
      positive: "#3d6b38",
      negative: "#a84335",
      info: "#3d6a80",
      warning: "#8a5a18",
    },
  },
  "slate-dark": {
    id: "slate-dark",
    label: "Slate Dark",
    description: "Cool slate chrome with blue-teal primary.",
    isDark: true,
    tokens: {
      page: "#121418",
      pageElevated: "#1a1d24",
      border: "#6b7280",
      text: "#e8eaed",
      textMuted: "#a8adb6",
      primary: "#2dd4bf",
      secondary: "#94a3b8",
      accent: "#67e8f9",
      focusRing: "#5eead4",
      onPrimary: "#042f2e",
      positive: "#4ade80",
      negative: "#f87171",
      info: "#7dd3fc",
      warning: "#fbbf24",
    },
  },
  "slate-light": {
    id: "slate-light",
    label: "Slate Light",
    description: "Clean light admin chrome in the slate family.",
    isDark: false,
    tokens: {
      page: "#f4f6f8",
      pageElevated: "#ffffff",
      border: "#6b7280",
      text: "#111827",
      textMuted: "#4b5563",
      primary: "#0f766e",
      secondary: "#475569",
      accent: "#0e7490",
      focusRing: "#0d9488",
      onPrimary: "#ffffff",
      positive: "#166534",
      negative: "#b91c1c",
      info: "#0369a1",
      warning: "#8a5a18",
    },
  },
  "high-contrast": {
    id: "high-contrast",
    label: "High Contrast",
    description: "Near black and white with strong borders and focus.",
    isDark: true,
    tokens: {
      // Primary is bright yellow; onPrimary must stay near-black (not white).
      page: "#000000",
      pageElevated: "#0a0a0a",
      border: "#ffffff",
      text: "#ffffff",
      textMuted: "#f0f0f0",
      primary: "#ffe600",
      secondary: "#ffffff",
      accent: "#00e5ff",
      focusRing: "#00e5ff",
      onPrimary: "#000000",
      positive: "#00ff66",
      negative: "#ff4d4d",
      info: "#00e5ff",
      warning: "#ffe600",
    },
  },
};

export function resolveTheme(id) {
  return themes[id] || themes[DEFAULT_THEME_ID];
}

/** pageElevated → --color-page-elevated */
export function tokenToCssVar(key) {
  const kebab = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  return `--color-${kebab}`;
}
