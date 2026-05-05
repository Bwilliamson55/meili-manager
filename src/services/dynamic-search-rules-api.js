/**
 * Meilisearch Dynamic Search Rules API (experimental).
 * @see https://www.meilisearch.com/docs/reference/api/dynamic-search-rules
 */

/**
 * @typedef {object} ListDynamicRulesBody
 * @property {number} [offset]
 * @property {number} [limit]
 * @property {{ active?: boolean|null; attribute_patterns?: string[]|null }} [filter]
 */

/**
 * @param {(path: string, options?: { method?: string; body?: unknown }) => Promise<unknown>} rawRequest
 * @param {ListDynamicRulesBody} body
 */
export async function listDynamicSearchRules(rawRequest, body = {}) {
  return rawRequest("/dynamic-search-rules", {
    method: "POST",
    body,
  });
}

/**
 * @param {(path: string, options?: { method?: string; body?: unknown }) => Promise<unknown>} rawRequest
 * @param {string} uid
 */
export async function getDynamicSearchRule(rawRequest, uid) {
  const enc = encodeURIComponent(uid);
  return rawRequest(`/dynamic-search-rules/${enc}`, { method: "GET" });
}

/**
 * @param {(path: string, options?: { method?: string; body?: unknown }) => Promise<unknown>} rawRequest
 * @param {string} uid
 * @param {Record<string, unknown>} rulePayload — fields to set (omit uid; it is in the path)
 */
export async function upsertDynamicSearchRule(rawRequest, uid, rulePayload) {
  const enc = encodeURIComponent(uid);
  return rawRequest(`/dynamic-search-rules/${enc}`, {
    method: "PATCH",
    body: rulePayload,
  });
}

/**
 * @param {(path: string, options?: { method?: string; body?: unknown }) => Promise<unknown>} rawRequest
 * @param {string} uid
 */
export async function deleteDynamicSearchRule(rawRequest, uid) {
  const enc = encodeURIComponent(uid);
  return rawRequest(`/dynamic-search-rules/${enc}`, { method: "DELETE" });
}
