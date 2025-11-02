<template>
  <ais-current-refinements :class="containerClass">
    <template #default="{ items, refine }">
      <div v-if="items.length" class="flex flex-wrap gap-2">
        <template v-for="item in items" :key="item.attribute">
          <q-chip
            v-for="refinement in item.refinements"
            :key="refinement.label"
            :size="chipSize"
            removable
            color="primary"
            text-color="white"
            @remove="refine(refinement)"
          >
            <span class="font-semibold">{{ item.attribute }}:</span>
            <span class="ml-1">{{ refinement.label }}</span>
          </q-chip>
        </template>
      </div>
    </template>
  </ais-current-refinements>
</template>

<script setup>
defineProps({
  containerClass: {
    type: String,
    default: "q-mb-md",
  },
  chipSize: {
    type: String,
    default: "sm",
  },
});
</script>
