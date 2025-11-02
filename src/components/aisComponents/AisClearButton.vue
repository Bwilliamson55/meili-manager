<template>
  <ais-clear-refinements>
    <template #default="{ canRefine, refine }">
      <q-btn
        flat
        dense
        :size="size"
        :label="label"
        :icon="icon"
        :disable="!canRefine"
        @click="refine"
      />
    </template>
  </ais-clear-refinements>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: "Clear",
  },
  icon: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "sm",
  },
});
</script>
