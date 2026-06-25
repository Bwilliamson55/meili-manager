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

const persistFromInstantSearchState = (newState) => {
  if (!newState || !props.indexName) return;

  const searchState = {
    query: newState.query || "",
    filters: extractFilters(newState),
    sort: newState.sortBy || "",
    page: newState.page !== undefined ? newState.page : 0,
  };

  const hasState =
    searchState.query ||
    Object.keys(searchState.filters).length > 0 ||
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
    const existingState = theSettings.getIndexSearchState(props.indexName);
    theSettings.setIndexSearchState(props.indexName, {
      ...existingState,
      ...searchState,
    });
    emit("state-changed", searchState);
  }
};

// Watch for state changes and save them
watch(
  () => props.state,
  (newState) => {
    persistFromInstantSearchState(newState);
  },
  { deep: true },
);

// Mark as initialized after a short delay to allow ais-configure to apply saved state
onMounted(() => {
  // Give ais-configure time to apply the saved state before we start watching
  setTimeout(() => {
    isInitialized.value = true;
    // If we haven't seen a non-empty state yet, check if current state has any value
    const currentState = props.state;
    if (currentState) {
      const hasState =
        currentState.query ||
        (currentState.refinementList &&
          Object.keys(currentState.refinementList).length > 0) ||
        currentState.sortBy ||
        (currentState.page !== undefined && currentState.page > 0);
      if (hasState) {
        hasSeenNonEmptyState.value = true;
      }
    }
  }, 100);
});

onBeforeUnmount(() => {
  persistFromInstantSearchState(props.state);
});

// Helper to extract filters from state
function extractFilters(state) {
  const filters = {};
  if (state.refinementList) {
    Object.keys(state.refinementList).forEach((key) => {
      if (state.refinementList[key] && state.refinementList[key].length > 0) {
        filters[key] = state.refinementList[key];
      }
    });
  }
  return filters;
}
</script>
