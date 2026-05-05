/**
 * Meilisearch experimental features API (runtime toggles).
 * @see https://www.meilisearch.com/docs/reference/api/experimental-features
 */

/**
 * @param {(path: string, options?: { method?: string; body?: unknown }) => Promise<unknown>} rawRequest
 */
export async function getExperimentalFeatures(rawRequest) {
  return rawRequest("/experimental-features", { method: "GET" });
}

/**
 * @param {(path: string, options?: { method?: string; body?: unknown }) => Promise<unknown>} rawRequest
 * @param {Record<string, boolean>} patch
 */
export async function updateExperimentalFeatures(rawRequest, patch) {
  return rawRequest("/experimental-features", {
    method: "PATCH",
    body: patch,
  });
}
