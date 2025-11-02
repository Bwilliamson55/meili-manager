<template>
  <ais-search-box class="flex-1">
    <template #default="{ currentRefinement, refine }">
      <q-input
        :model-value="currentRefinement"
        dense
        outlined
        :placeholder="placeholder"
        class="q-mb-md"
        @update:model-value="refine"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template v-if="currentRefinement" #append>
          <q-icon name="close" class="cursor-pointer" @click="refine('')" />
        </template>
      </q-input>
    </template>
  </ais-search-box>
</template>

<script setup>
defineProps({
  placeholder: {
    type: String,
    default: "Search...",
  },
});
</script>
