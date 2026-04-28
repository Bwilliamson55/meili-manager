import { normalizeThreshold, buildHybridConfig } from "src/utils/search-utils";

const parseVersion = (value) => {
  if (!value || typeof value !== "string") return null;
  const normalized = value.trim().replace(/^v/i, "");
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
};

const isAtLeast = (parsed, major, minor, patch = 0) => {
  if (!parsed) return false;
  if (parsed.major !== major) return parsed.major > major;
  if (parsed.minor !== minor) return parsed.minor > minor;
  return parsed.patch >= patch;
};

export const getCompatFeatures = (versionString) => {
  const parsed = parseVersion(versionString);
  const isLegacy111 = parsed && parsed.major === 1 && parsed.minor <= 11;

  return {
    versionString: versionString || "unknown",
    supportsSearchMetadataHeader: !isLegacy111,
    supportsRankingScoreThreshold: !isLegacy111,
    supportsFrequencyMatching: !isLegacy111,
    supportsDistinctQuery: !isLegacy111,
    supportsSearchDiagnosticsFlags: !isLegacy111,
    supportsHybrid: !isLegacy111,
    supportsFieldsMetadataEndpoint: !isLegacy111,
    supportsDocumentsFetchByIds: !isLegacy111,
    supportsSimilarEndpoint: !isLegacy111 && isAtLeast(parsed, 1, 12),
  };
};

export const buildCompatibleSearchParams = (state, compat) => {
  const params = {
    matchingStrategy:
      state.matchingStrategy === "frequency" &&
      !compat.supportsFrequencyMatching
        ? "last"
        : state.matchingStrategy || undefined,
  };

  if (compat.supportsDistinctQuery) {
    params.distinct = state.distinct || undefined;
  }
  if (compat.supportsSearchDiagnosticsFlags) {
    params.showRankingScore = state.showRankingScore || undefined;
    params.showRankingScoreDetails = state.showRankingScoreDetails || undefined;
    params.showPerformanceDetails = state.showPerformanceDetails || undefined;
  }
  if (compat.supportsRankingScoreThreshold) {
    params.rankingScoreThreshold = normalizeThreshold(state.rankingScoreThreshold);
  }
  if (compat.supportsHybrid) {
    params.hybrid = buildHybridConfig(state);
  }

  return params;
};
