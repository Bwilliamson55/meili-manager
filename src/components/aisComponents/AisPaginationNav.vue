<template>
  <ais-pagination :padding="padding">
    <template #default="{ currentRefinement, nbPages, refine }">
      <q-pagination
        :model-value="currentRefinement + 1"
        :max="nbPages"
        :max-pages="maxPages"
        :boundary-numbers="boundaryNumbers"
        direction-links
        @update:model-value="(page) => refine(page - 1)"
      />
    </template>
  </ais-pagination>
</template>

<script setup>
defineProps({
  padding: {
    type: Number,
    default: 2,
  },
  maxPages: {
    type: Number,
    default: 7,
  },
  boundaryNumbers: {
    type: Boolean,
    default: false,
  },
});
</script>
