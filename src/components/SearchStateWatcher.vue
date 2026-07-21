<template>
  <!-- Invisible component that watches state and saves it -->
</template>

<script setup>
import { watch, ref, onMounted, onBeforeUnmount } from "vue";
import { useSettingsStore } from "src/meili-core/stores/settings-store";

const props = defineProps({
  state: {
    type: Object,
    required: true,
  },
  indexName: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["state-changed"]);

const theSettings = useSettingsStore();
const isInitialized = ref(false);
const hasSeenNonEmptyState = ref(false);
/** After remount, InstantSearch may briefly report empty refinementList. */
const restoreGraceUntil = ref(0);

const hasFilterValues = (filters = {}) =>
  Object.values(filters).some(
    (values) => Array.isArray(values) && values.length > 0,
  );

const extractFilters = (state) => {
  const filters = {};
  if (state?.refinementList) {
    Object.keys(state.refinementList).forEach((key) => {
      if (state.refinementList[key] && state.refinementList[key].length > 0) {
        filters[key] = state.refinementList[key];
      }
    });
  }
  return filters;
};

/**
 * Persist InstantSearch UI state into indexSearchState.
 * @param {object} newState
 * @param {{ preserveFiltersIfEmpty?: boolean }} [opts]
 *   When true (unmount / restore grace), do not overwrite saved facet filters
 *   with an empty map. Teardown and remount often keep `query` but drop
 *   `refinementList`, which previously wiped filters while the query stuck.
 */
const persistFromInstantSearchState = (newState, opts = {}) => {
  if (!newState || !props.indexName) return;

  const existingState = theSettings.getIndexSearchState(props.indexName);
  let filters = extractFilters(newState);
  const preserveFiltersIfEmpty =
    opts.preserveFiltersIfEmpty || Date.now() < restoreGraceUntil.value;

  if (
    preserveFiltersIfEmpty &&
    !hasFilterValues(filters) &&
    hasFilterValues(existingState.filters)
  ) {
    filters = { ...existingState.filters };
  }

  const searchState = {
    query: newState.query || "",
    filters,
    sort: newState.sortBy || "",
    page: newState.page !== undefined ? newState.page : 0,
  };

  const hasState =
    searchState.query ||
    hasFilterValues(searchState.filters) ||
    searchState.sort ||
    searchState.page > 0;

  if (!isInitialized.value) {
    if (hasState) {
      hasSeenNonEmptyState.value = true;
      isInitialized.value = true;
    } else {
      return;
    }
  }

  if (hasSeenNonEmptyState.value || hasState) {
    theSettings.setIndexSearchState(props.indexName, {
      ...existingState,
      ...searchState,
    });
    emit("state-changed", searchState);
  }
};

watch(
  () => props.state,
  (newState) => {
    persistFromInstantSearchState(newState);
  },
  { deep: true },
);

onMounted(() => {
  // Allow ais-configure to re-apply saved query/filters before empty snapshots win.
  restoreGraceUntil.value = Date.now() + 500;
  setTimeout(() => {
    isInitialized.value = true;
    const currentState = props.state;
    if (currentState) {
      const hasState =
        currentState.query ||
        (currentState.refinementList &&
          Object.keys(currentState.refinementList).some(
            (key) => currentState.refinementList[key]?.length > 0,
          )) ||
        currentState.sortBy ||
        (currentState.page !== undefined && currentState.page > 0);
      if (hasState) {
        hasSeenNonEmptyState.value = true;
      }
    }
  }, 100);
});

onBeforeUnmount(() => {
  // Tab switches destroy the Documents panel (unless keep-alive). InstantSearch
  // teardown often still has query/sort but an empty refinementList.
  persistFromInstantSearchState(props.state, { preserveFiltersIfEmpty: true });
});
</script>
