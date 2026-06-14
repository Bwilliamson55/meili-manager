import { Meilisearch } from "meilisearch";

/**
 * Normalize a user-entered Meilisearch URL down to a clean origin.
 * Adds an `http://` scheme when missing and validates the host.
 * @param {string} rawUrl
 * @returns {string} origin (e.g. "https://meili.example.com")
 */
export const normalizeMeiliHost = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("Meilisearch URL is required");
  }

  let candidate = rawUrl.trim();
  if (!candidate) {
    throw new Error("Meilisearch URL is required");
  }

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `http://${candidate}`;
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Invalid Meilisearch URL");
  }

  if (!parsed.hostname) {
    throw new Error("Invalid Meilisearch URL");
  }

  return parsed.origin;
};

/**
 * Single place that constructs a Meilisearch client, with host normalization.
 * @param {{ host: string; apiKey: string }} options
 * @returns {Meilisearch}
 */
export const createMeiliClient = ({ host, apiKey }) => {
  return new Meilisearch({
    host: normalizeMeiliHost(host),
    apiKey,
  });
};

/**
 * Fetch an index's settings and merge in stats + attribute codes when available.
 * Stats failures are non-fatal; the settings object is still returned.
 * @param {{ getSettings: () => Promise<Record<string, unknown>>; getStats: () => Promise<{ fieldDistribution: Record<string, unknown> }> }} indexClient
 */
export const getIndexSettingsWithStats = async (indexClient) => {
  const settings = await indexClient.getSettings();
  try {
    const stats = await indexClient.getStats();
    settings.stats = stats;
    settings.attributeCodes = Object.keys(stats.fieldDistribution);
  } catch (error) {
    console.error(error);
  }
  return settings;
};
