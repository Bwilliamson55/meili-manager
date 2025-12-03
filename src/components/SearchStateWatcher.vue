<template>
  <!-- Invisible component that watches state and saves it -->
</template>

<script setup>
import { watch } from "vue";
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

    // Save to store
    theSettings.setIndexSearchState(props.indexName, searchState);

    // Emit event for parent component
    emit("state-changed", searchState);
  },
  { deep: true, immediate: true }
);

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

