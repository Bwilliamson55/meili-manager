<template>
  <div>
    <q-separator class="q-my-md" />
    <div class="flex items-center justify-between q-mb-sm">
      <div class="text-subtitle2">
        Typo Tolerance
        <q-badge
          v-if="hasFieldChanged('typoTolerance')"
          color="orange"
          text-color="white"
          label="Modified"
          class="q-ml-xs"
        />
      </div>
      <SettingsHelp
        :metadata="SETTINGS_METADATA.typoTolerance"
        :current-value="modelValue"
      />
    </div>
    <q-toggle
      v-model="modelValue.enabled"
      color="positive"
      label="Enable typo tolerance"
    />
    <div class="flex gap-3">
      <q-input
        v-model.number="modelValue.minWordSizeForTypos.oneTypo"
        type="number"
        label="Min size for 1 typo"
        filled
        dense
        class="flex-1"
      />
      <q-input
        v-model.number="modelValue.minWordSizeForTypos.twoTypos"
        type="number"
        label="Min size for 2 typos"
        filled
        dense
        class="flex-1"
      />
    </div>
    <q-select
      filled
      v-model="modelValue.disableOnWords"
      label="Disable on specific words"
      hint="Words where typo tolerance is disabled"
      use-input
      use-chips
      multiple
      stack-label
      hide-dropdown-icon
      input-debounce="0"
      new-value-mode="add"
    />
    <q-select
      filled
      v-model="modelValue.disableOnAttributes"
      label="Disable on attributes"
      hint="Fields where typo tolerance is disabled"
      use-input
      use-chips
      multiple
      stack-label
      hide-dropdown-icon
      input-debounce="0"
      new-value-mode="add"
    />
  </div>
</template>

<script setup>
import SettingsHelp from "src/components/SettingsHelp.vue";
import { SETTINGS_METADATA } from "src/utils/settings-config";

defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  hasFieldChanged: {
    type: Function,
    required: true,
  },
});
</script>
