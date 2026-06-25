<template>
  <div class="flex flex-col flex-1 min-h-0 w-full">
    <q-card flat bordered class="flex flex-col flex-1 min-h-0">
      <q-tabs
        v-model="tabModel"
        dense
        class="text-grey flex-shrink-0"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="documents" label="Documents" icon="description" />
        <q-tab name="overview" label="Overview" icon="analytics" />
        <q-tab name="settings" label="Settings" icon="settings" />
      </q-tabs>

      <q-separator />

      <q-tab-panels
        v-model="tabModel"
        animated
        class="flex-1 min-h-0 bg-transparent"
      >
        <q-tab-panel name="documents" class="p-0 flex flex-col flex-1 min-h-0">
          <slot name="documents-tab" />
        </q-tab-panel>

        <q-tab-panel name="overview" class="p-4">
          <slot name="overview-tab" />
        </q-tab-panel>

        <q-tab-panel name="settings" class="p-4">
          <slot name="settings-tab" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "documents",
  },
});

const emit = defineEmits(["update:modelValue"]);

const tabModel = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<style scoped>
:deep(.q-tab-panels) {
  flex: 1;
  min-height: 0;
}

:deep(.q-panel) {
  min-height: 0;
}

:deep(.q-tab-panel) {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 160px);
}
</style>
