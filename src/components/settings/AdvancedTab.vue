<template>
  <div class="q-gutter-md">
    <div class="flex items-start gap-2">
      <q-select
        v-model="modelValue.prefixSearch"
        :options="prefixSearchOptions"
        filled
        emit-value
        map-options
        label="Prefix Search"
        hint="How prefix matching is handled at indexing time"
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('prefixSearch'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.prefixSearch"
        :current-value="modelValue.prefixSearch"
      />
    </div>

    <div class="flex items-start gap-2">
      <q-toggle
        v-model="modelValue.facetSearch"
        label="Enable Facet Search"
        class="flex-1"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.facetSearch"
        :current-value="modelValue.facetSearch"
      />
    </div>

    <div class="flex items-start gap-2">
      <q-select
        v-model="modelValue.separatorTokens"
        filled
        label="Separator Tokens"
        hint="Extra separators to add to the tokenizer"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add-unique"
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('separatorTokens'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.separatorTokens"
        :current-value="modelValue.separatorTokens"
      />
    </div>

    <div class="flex items-start gap-2">
      <q-select
        v-model="modelValue.nonSeparatorTokens"
        filled
        label="Non-Separator Tokens"
        hint="Characters removed from default separator list"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add-unique"
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('nonSeparatorTokens'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.nonSeparatorTokens"
        :current-value="modelValue.nonSeparatorTokens"
      />
    </div>
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

const prefixSearchOptions = [
  { label: "Indexing Time (default)", value: "indexingTime" },
  { label: "Disabled", value: "disabled" },
];
</script>
