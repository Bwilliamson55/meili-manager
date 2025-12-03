<template>
  <!-- Invisible component that watches state and saves it -->
</template>

<script setup>
import { watch, ref, onMounted } from "vue";
import { useSettingsStore } from "src/stores/settings-store";

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

// Watch for state changes and save them
watch(
  () => props.state,
  (newState) => {
    if (!newState || !props.indexName) return;

    // Extract relevant state
    const searchState = {
      query: newState.query || "",
      filters: extractFilters(newState),
      sort: newState.sortBy || "",
      page: newState.page || 1,
    };

    // Check if this is a meaningful state change (not just initial empty state)
    const hasState =
      searchState.query ||
      Object.keys(searchState.filters).length > 0 ||
      searchState.sort ||
      searchState.page > 1;

    // On initial mount, wait until we see a non-empty state or until initialized
    // This prevents overwriting saved state with empty initial state
    if (!isInitialized.value) {
      if (hasState) {
        hasSeenNonEmptyState.value = true;
        isInitialized.value = true;
      } else {
        // Wait a bit for ais-configure to apply saved state
        // If state is still empty after initialization delay, it's likely truly empty
        return;
      }
    }

    // Only save if we've seen a non-empty state or if this is a meaningful change
    // This prevents overwriting saved state with empty state on initial mount
    if (hasSeenNonEmptyState.value || hasState) {
      // Save to store
      theSettings.setIndexSearchState(props.indexName, searchState);

      // Emit event for parent component
      emit("state-changed", searchState);
    }
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
        (currentState.page && currentState.page > 1);
      if (hasState) {
        hasSeenNonEmptyState.value = true;
      }
    }
  }, 100);
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
