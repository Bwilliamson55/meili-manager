export const normalizeThreshold = (value) => {
  if (value === null || value === undefined || value === "") return undefined;
  return Math.min(Math.max(Number(value), 0), 1);
};

export const DEFAULT_INDEX_SEARCH_STATE = Object.freeze({
  query: "",
  filters: {},
  sort: "",
  page: 0,
  filtersVisible: true,
  rankingScoreThreshold: null,
  matchingStrategy: "last",
  distinct: "",
  showRankingScore: false,
  showRankingScoreDetails: false,
  showPerformanceDetails: false,
  includeSearchMetadataHeader: false,
  searchMetadataHeaderValue: "",
  enableHybrid: false,
  hybridEmbedder: "",
  hybridSemanticRatio: null,
  activeLlmPreset: null,
  filterDensity: "compact",
  filtersPanelWidth: 380,
  detailPanelTab: "documents",
});

/** Demo hybrid ratios for Documents Advanced search / LLM presets. */
export const LLM_DEMO_PRESETS = Object.freeze({
  keyword: {
    key: "keyword",
    label: "Keyword-heavy",
    caption: "Mostly text match (ratio 0.2)",
    tooltip:
      "Turns on hybrid search with a low semantic ratio so keyword ranking dominates.",
    enableHybrid: true,
    hybridSemanticRatio: 0.2,
    showRankingScore: true,
    showRankingScoreDetails: true,
    showPerformanceDetails: true,
  },
  balanced: {
    key: "balanced",
    label: "Balanced",
    caption: "Even mix (ratio 0.5)",
    tooltip:
      "Turns on hybrid search with a 50/50 mix of keyword and semantic ranking.",
    enableHybrid: true,
    hybridSemanticRatio: 0.5,
    showRankingScore: true,
    showRankingScoreDetails: true,
    showPerformanceDetails: true,
  },
  semantic: {
    key: "semantic",
    label: "Semantic-heavy",
    caption: "Mostly meaning match (ratio 0.8)",
    tooltip:
      "Turns on hybrid search with a high semantic ratio so embedding similarity dominates.",
    enableHybrid: true,
    hybridSemanticRatio: 0.8,
    showRankingScore: true,
    showRankingScoreDetails: true,
    showPerformanceDetails: true,
  },
});

export const LLM_DEMO_PRESET_KEYS = Object.freeze(
  Object.keys(LLM_DEMO_PRESETS),
);

export const getDefaultIndexSearchState = () => ({
  ...DEFAULT_INDEX_SEARCH_STATE,
  filters: {},
});

/** Fields written by LLM demo presets (used by Clear / Reset). */
export const getClearedLlmPresetFields = () => ({
  activeLlmPreset: null,
  enableHybrid: DEFAULT_INDEX_SEARCH_STATE.enableHybrid,
  hybridSemanticRatio: DEFAULT_INDEX_SEARCH_STATE.hybridSemanticRatio,
  showRankingScore: DEFAULT_INDEX_SEARCH_STATE.showRankingScore,
  showRankingScoreDetails: DEFAULT_INDEX_SEARCH_STATE.showRankingScoreDetails,
  showPerformanceDetails: DEFAULT_INDEX_SEARCH_STATE.showPerformanceDetails,
});

export const getLlmPresetPatch = (presetKey) => {
  const preset = LLM_DEMO_PRESETS[presetKey];
  if (!preset) return null;
  return {
    activeLlmPreset: preset.key,
    enableHybrid: preset.enableHybrid,
    hybridSemanticRatio: preset.hybridSemanticRatio,
    showRankingScore: preset.showRankingScore,
    showRankingScoreDetails: preset.showRankingScoreDetails,
    showPerformanceDetails: preset.showPerformanceDetails,
  };
};

export const buildHybridConfig = (state) => {
  if (!state?.enableHybrid) return undefined;
  const hybrid = {
    semanticRatio: normalizeThreshold(state.hybridSemanticRatio),
  };
  if (state.hybridEmbedder?.trim()) {
    hybrid.embedder = state.hybridEmbedder.trim();
  }
  return hybrid;
};

export const buildRefinementListFromFilters = (filters = {}) => {
  const refinementList = {};
  for (const [attribute, values] of Object.entries(filters)) {
    if (Array.isArray(values) && values.length > 0) {
      refinementList[attribute] = [...values];
    }
  }
  return refinementList;
};

export const hasActiveSavedSearch = (state = {}) => {
  const filters = state.filters || {};
  const hasFilters = Object.values(filters).some(
    (values) => Array.isArray(values) && values.length > 0,
  );
  return Boolean(
    state.query?.trim() || hasFilters || state.sort || (state.page ?? 0) > 0,
  );
};
