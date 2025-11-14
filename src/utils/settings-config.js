/**
 * Meilisearch settings configuration with metadata, help text, and presets
 */

export const SETTINGS_METADATA = {
  // Search Behavior
  displayedAttributes: {
    category: "search",
    label: "Displayed Attributes",
    helpText:
      'Fields shown in search results. Use ["*"] to show all fields. Order does not affect relevancy.',
    docs: "https://www.meilisearch.com/docs/learn/relevancy/displayed_searchable_attributes#displayed-fields",
    reindexes: false,
    type: "array",
  },
  searchableAttributes: {
    category: "search",
    label: "Searchable Attributes",
    helpText:
      "Fields searched for matching query words. ORDER MATTERS: earlier fields in the list have higher search priority and matches score higher. For example, put 'title' before 'description' if title matches should rank higher. Use ['*'] to search all fields.",
    docs: "https://www.meilisearch.com/docs/learn/relevancy/displayed_searchable_attributes#searchable-fields",
    reindexes: true,
    type: "array",
  },
  filterableAttributes: {
    category: "search",
    label: "Filterable Attributes",
    helpText:
      "Fields that can be used as filters or facets. Required for filtering and faceted search.",
    docs: "https://www.meilisearch.com/docs/learn/filtering_and_sorting/filter_search_results",
    reindexes: true,
    type: "array",
  },
  sortableAttributes: {
    category: "search",
    label: "Sortable Attributes",
    helpText: "Fields that can be used to sort search results at query time.",
    docs: "https://www.meilisearch.com/docs/learn/filtering_and_sorting/sort_search_results",
    reindexes: true,
    type: "array",
  },

  // Relevancy
  rankingRules: {
    category: "relevancy",
    label: "Ranking Rules",
    helpText:
      "Rules determining result order. Applied in sequence from first to last. Default: words, typo, proximity, attribute, sort, exactness.",
    docs: "https://www.meilisearch.com/docs/learn/relevancy/ranking_rules",
    reindexes: false,
    type: "array",
    orderable: true,
  },
  distinctAttribute: {
    category: "relevancy",
    label: "Distinct Attribute",
    helpText:
      "Field whose value must be unique in returned results. Useful for deduplication (e.g., show only one result per product).",
    docs: "https://www.meilisearch.com/docs/learn/relevancy/distinct_attribute",
    reindexes: true,
    type: "string",
  },
  stopWords: {
    category: "relevancy",
    label: "Stop Words",
    helpText:
      'Words ignored in search queries. Common words like "the", "a", "of" that don\'t add value.',
    docs: "https://www.meilisearch.com/docs/learn/relevancy/stop_words",
    reindexes: true,
    type: "array",
  },
  synonyms: {
    category: "relevancy",
    label: "Synonyms",
    helpText:
      'Words treated as equal for search purposes. Example: "phone" = "mobile" = "smartphone".',
    docs: "https://www.meilisearch.com/docs/learn/relevancy/synonyms",
    reindexes: false,
    type: "object",
  },
  dictionary: {
    category: "relevancy",
    label: "Dictionary",
    helpText:
      'Groups of strings treated as single terms. Useful for names like "J. R. R. Tolkien" or languages without spaces.',
    docs: "https://www.meilisearch.com/docs/reference/api/settings#dictionary",
    reindexes: true,
    type: "array",
  },

  // Typo Tolerance
  typoTolerance: {
    category: "relevancy",
    label: "Typo Tolerance",
    helpText:
      "Helps users find results even with spelling mistakes. Configure minimum word size and exceptions.",
    docs: "https://www.meilisearch.com/docs/learn/relevancy/typo_tolerance_settings",
    reindexes: false,
    type: "object",
  },

  // Performance
  pagination: {
    category: "performance",
    label: "Pagination",
    helpText:
      "Max search results (default 1000). Values over 20,000 severely impact performance.",
    docs: "https://www.meilisearch.com/docs/guides/front_end/pagination",
    reindexes: false,
    type: "object",
    performanceImpact: "high",
  },
  faceting: {
    category: "performance",
    label: "Faceting",
    helpText:
      "Max values per facet (default 100). Higher values may impact performance.",
    docs: "https://www.meilisearch.com/docs/learn/filtering_and_sorting/search_with_facet_filters",
    reindexes: false,
    type: "object",
    performanceImpact: "medium",
  },
  proximityPrecision: {
    category: "performance",
    label: "Proximity Precision",
    helpText:
      '"byWord" (precise, slower) or "byAttribute" (faster, less precise). Affects indexing time.',
    docs: "https://www.meilisearch.com/docs/reference/api/settings#proximity-precision",
    reindexes: true,
    type: "string",
    performanceImpact: "high",
  },
  searchCutoffMs: {
    category: "performance",
    label: "Search Cutoff (ms)",
    helpText:
      "Max search duration in milliseconds. Default is 1500ms. Search stops and returns partial results if exceeded.",
    docs: "https://www.meilisearch.com/docs/reference/api/settings#search-cutoff",
    reindexes: false,
    type: "number",
    performanceImpact: "medium",
  },

  // Advanced
  separatorTokens: {
    category: "advanced",
    label: "Separator Tokens",
    helpText:
      'Custom characters that separate words (added to defaults). Example: ["|", "…"]',
    docs: "https://www.meilisearch.com/docs/reference/api/settings#separator-tokens",
    reindexes: true,
    type: "array",
  },
  nonSeparatorTokens: {
    category: "advanced",
    label: "Non-Separator Tokens",
    helpText:
      "Characters to remove from default separators. Useful for @ in emails, # in hashtags.",
    docs: "https://www.meilisearch.com/docs/reference/api/settings#non-separator-tokens",
    reindexes: true,
    type: "array",
  },
  prefixSearch: {
    category: "advanced",
    label: "Prefix Search",
    helpText:
      '"indexingTime" (default, calculated during indexing) or "disabled" (faster indexing, less relevant results).',
    docs: "https://www.meilisearch.com/docs/reference/api/settings#prefix-search",
    reindexes: true,
    type: "string",
    performanceImpact: "high",
  },
  facetSearch: {
    category: "advanced",
    label: "Facet Search",
    helpText:
      "Enable/disable facet search. Disabling speeds up indexing but removes /facet-search endpoint.",
    docs: "https://www.meilisearch.com/docs/reference/api/settings#facet-search",
    reindexes: true,
    type: "boolean",
    performanceImpact: "medium",
  },
};

export const SETTINGS_CATEGORIES = [
  {
    value: "search",
    label: "Search Behavior",
    icon: "search",
    color: "primary",
  },
  { value: "relevancy", label: "Relevancy", icon: "tune", color: "secondary" },
  {
    value: "performance",
    label: "Performance",
    icon: "speed",
    color: "warning",
  },
];

export const SETTINGS_PRESETS = {
  ecommerce: {
    label: "E-commerce",
    description: "Optimized for product catalogs with faceted search",
    icon: "shopping_cart",
    settings: {
      searchableAttributes: ["title", "brand", "description", "category"],
      displayedAttributes: ["*"],
      filterableAttributes: ["category", "brand", "price", "inStock", "rating"],
      sortableAttributes: ["price", "rating", "createdAt"],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
      ],
      distinctAttribute: "productId",
      stopWords: ["the", "a", "an"],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 },
        disableOnWords: [],
        disableOnAttributes: ["brand", "sku"],
      },
      faceting: { maxValuesPerFacet: 100 },
      pagination: { maxTotalHits: 1000 },
    },
  },
  blog: {
    label: "Blog/Content",
    description: "Optimized for articles, posts, and long-form content",
    icon: "article",
    settings: {
      searchableAttributes: ["title", "content", "author", "tags"],
      displayedAttributes: ["*"],
      filterableAttributes: ["category", "author", "publishedAt", "tags"],
      sortableAttributes: ["publishedAt", "title"],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
      ],
      distinctAttribute: null,
      stopWords: [
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
      ],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 },
        disableOnWords: [],
        disableOnAttributes: ["author"],
      },
      faceting: { maxValuesPerFacet: 50 },
      pagination: { maxTotalHits: 2000 },
    },
  },
  documentation: {
    label: "Documentation",
    description: "Optimized for technical docs with code examples",
    icon: "code",
    settings: {
      searchableAttributes: ["title", "content", "category", "tags"],
      displayedAttributes: ["*"],
      filterableAttributes: ["category", "version", "tags"],
      sortableAttributes: ["title", "order"],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "exactness",
        "sort",
      ],
      distinctAttribute: null,
      stopWords: [],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 6, twoTypos: 10 },
        disableOnWords: [],
        disableOnAttributes: ["code"],
      },
      faceting: { maxValuesPerFacet: 100 },
      pagination: { maxTotalHits: 5000 },
    },
  },
  fast: {
    label: "Fast Indexing",
    description: "Optimized for speed over relevancy",
    icon: "bolt",
    settings: {
      searchableAttributes: ["*"],
      displayedAttributes: ["*"],
      filterableAttributes: [],
      sortableAttributes: [],
      rankingRules: [
        "words",
        "typo",
        "proximity",
        "attribute",
        "sort",
        "exactness",
      ],
      distinctAttribute: null,
      stopWords: [],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 },
        disableOnWords: [],
        disableOnAttributes: [],
      },
      faceting: { maxValuesPerFacet: 50 },
      pagination: { maxTotalHits: 1000 },
      proximityPrecision: "byAttribute",
      prefixSearch: "disabled",
    },
  },
};

export function getSettingsByCategory(category) {
  return Object.entries(SETTINGS_METADATA)
    .filter(([_, meta]) => meta.category === category)
    .map(([key, meta]) => ({ key, ...meta }));
}

export function getReindexingSettings(changedSettings) {
  return Object.keys(changedSettings)
    .filter((key) => SETTINGS_METADATA[key]?.reindexes)
    .map((key) => SETTINGS_METADATA[key]?.label || key);
}

export function getPerformanceImpact(setting, value) {
  const meta = SETTINGS_METADATA[setting];
  if (!meta?.performanceImpact) return null;

  // Specific logic for pagination
  if (setting === "pagination" && value?.maxTotalHits) {
    const hits = value.maxTotalHits;
    if (hits > 20000)
      return { level: "critical", message: "Severely impacts performance" };
    if (hits > 10000)
      return { level: "high", message: "May slow down searches" };
    if (hits > 5000) return { level: "medium", message: "Moderate impact" };
    return { level: "low", message: "Minimal impact" };
  }

  return {
    level: meta.performanceImpact,
    message: `${meta.performanceImpact} performance impact`,
  };
}
