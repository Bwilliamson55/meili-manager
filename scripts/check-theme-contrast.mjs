/**
 * WCAG AA contrast checks against src/themes/catalog.js (single source of truth).
 * Pair list lives here so docs do not go stale.
 *
 * Run: npm run check:themes
 */

import {
  TOKEN_KEYS,
  themes,
} from "../src/themes/catalog.js";

function relativeLuminance(hex) {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = parseInt(full, 16);
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a, b) {
  const L1 = relativeLuminance(a);
  const L2 = relativeLuminance(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Fixed AA pairs: [label, fgKey, bgKey, minimum] */
const PAIRS = [
  ["text / page", "text", "page", 4.5],
  ["textMuted / page", "textMuted", "page", 4.5],
  ["textMuted / pageElevated", "textMuted", "pageElevated", 4.5],
  // Filled primary buttons (Send): must never be white-on-yellow.
  ["onPrimary / primary", "onPrimary", "primary", 4.5],
  // Outline primary labels / borders on page chrome.
  ["primary / page (non-text)", "primary", "page", 3],
  ["primary / pageElevated (non-text)", "primary", "pageElevated", 3],
  ["focusRing / page", "focusRing", "page", 3],
  ["border / page", "border", "page", 3],
  ["border / pageElevated", "border", "pageElevated", 3],
];

let failed = 0;

for (const theme of Object.values(themes)) {
  for (const key of TOKEN_KEYS) {
    if (!theme.tokens[key]) {
      console.error(`FAIL ${theme.id}: missing token "${key}"`);
      failed += 1;
    }
  }

  for (const [label, fgKey, bgKey, min] of PAIRS) {
    const fg = theme.tokens[fgKey];
    const bg = theme.tokens[bgKey];
    if (!fg || !bg) continue;
    const ratio = contrastRatio(fg, bg);
    if (ratio < min) {
      console.error(
        `FAIL ${theme.id}: ${label} = ${ratio.toFixed(2)}:1 (need ≥ ${min}:1) [${fg} on ${bg}]`,
      );
      failed += 1;
    } else {
      console.log(
        `OK   ${theme.id}: ${label} = ${ratio.toFixed(2)}:1`,
      );
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} contrast check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll themes pass AA pairs (${Object.keys(themes).length} themes).`);
