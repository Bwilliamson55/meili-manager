<template>
  <div class="q-gutter-md">
    <!-- Displayed Attributes -->
    <div class="flex items-start gap-2">
      <q-select
        filled
        v-model="modelValue.displayedAttributes"
        label="Displayed Attributes"
        hint="Fields shown in search results"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add"
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('displayedAttributes'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.displayedAttributes"
        :current-value="modelValue.displayedAttributes"
      />
    </div>

    <!-- Searchable Attributes -->
    <div class="flex items-start gap-2">
      <div class="flex-1">
        <q-select
          filled
          v-model="modelValue.searchableAttributes"
          label="Searchable Attributes"
          hint="Fields searched for query matches (order = search priority!)"
          use-input
          use-chips
          multiple
          stack-label
          hide-dropdown-icon
          input-debounce="0"
          new-value-mode="add"
          :class="{
            'border-2 border-orange-500': hasFieldChanged(
              'searchableAttributes',
            ),
          }"
        />
        <q-btn
          flat
          dense
          size="sm"
          icon="swap_vert"
          label="Reorder Priority"
          @click="$emit('show-searchable-reorder')"
          class="q-mt-xs"
        />
      </div>
      <SettingsHelp
        :metadata="SETTINGS_METADATA.searchableAttributes"
        :current-value="modelValue.searchableAttributes"
      />
    </div>

    <!-- Filterable Attributes -->
    <div class="flex items-start gap-2">
      <q-select
        filled
        v-model="modelValue.filterableAttributes"
        label="Filterable Attributes"
        hint="Fields usable as filters or facets"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add"
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('filterableAttributes'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.filterableAttributes"
        :current-value="modelValue.filterableAttributes"
      />
    </div>

    <!-- Sortable Attributes -->
    <div class="flex items-start gap-2">
      <q-select
        filled
        v-model="modelValue.sortableAttributes"
        label="Sortable Attributes"
        hint="Fields usable for sorting results"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add"
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('sortableAttributes'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.sortableAttributes"
        :current-value="modelValue.sortableAttributes"
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

defineEmits(["show-searchable-reorder"]);
</script>
