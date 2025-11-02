<template>
  <ais-sort-by v-if="items.length" :items="items">
    <template #default="{ items: sortItems, currentRefinement, refine }">
      <q-select
        :model-value="currentRefinement"
        :options="sortItems"
        option-value="value"
        option-label="label"
        dense
        outlined
        :class="selectClass"
        :label="label"
        @update:model-value="(val) => refine(val.value)"
      />
    </template>
  </ais-sort-by>
</template>

<script setup>
defineProps({
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
</script>
