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
  filterDensity: "comfortable",
});

export const getDefaultIndexSearchState = () => ({
  ...DEFAULT_INDEX_SEARCH_STATE,
  filters: {},
});

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
