import { copyToClipboard } from "quasar";
import { showError, showSuccess } from "src/utils/notifications";

/**
 * Copy text to the clipboard and show a Quasar Notify result.
 * @param {string} text
 * @param {{ successMessage?: string; emptyMessage?: string }} [opts]
 * @returns {Promise<boolean>} true when something was copied
 */
export async function copyText(text, opts = {}) {
  const {
    successMessage = "Copied to clipboard",
    emptyMessage = "Nothing to copy",
  } = opts;

  const value = text == null ? "" : String(text);
  if (!value.trim()) {
    showError(emptyMessage);
    return false;
  }

  try {
    await copyToClipboard(value);
    showSuccess(successMessage);
    return true;
  } catch {
    showError("Failed to copy to clipboard");
    return false;
  }
}
