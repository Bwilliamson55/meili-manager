<template>
  <ais-sort-by v-if="items.length" :items="items">
    <template #default="{ items: sortItems, currentRefinement, refine }">
      <q-select
        :model-value="normalizeSortValue(currentRefinement, sortItems)"
        :options="sortItems"
        option-value="value"
        option-label="label"
        dense
        outlined
        :class="selectClass"
        :label="label"
        placeholder="Relevance"
        emit-value
        map-options
        @update:model-value="(val) => {
          // val is the value string, pass it directly to refine
          refine(val);
        }"
      />
    </template>
  </ais-sort-by>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    default: "Sort by",
  },
  selectClass: {
    type: String,
    default: "w-48",
  },
});

// Normalize the sort value - when currentRefinement is just the index name (default, no sort),
// return null/undefined so q-select shows placeholder instead of the index name
function normalizeSortValue(currentRefinement, sortItems) {
  if (!currentRefinement) {
    // If no refinement, return undefined to show placeholder
    return undefined;
  }
  
  // Check if currentRefinement matches any item value
  const matchedItem = sortItems.find(item => item.value === currentRefinement);
  if (matchedItem) {
    return currentRefinement;
  }
  
  // If currentRefinement doesn't match any item, it's likely just the index name (default)
  // Return undefined to show placeholder instead of confusing index name
  return undefined;
}
</script>
