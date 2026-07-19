import { boot } from "quasar/wrappers";
import { applyTheme, readStoredThemeId } from "src/themes/applyTheme";

// Same apply path as MainLayout / settings store (anti-FOUC after first paint fallback).
export default boot(() => {
  applyTheme(readStoredThemeId());
});
