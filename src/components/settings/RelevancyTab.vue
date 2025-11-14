<template>
  <div class="q-gutter-md">
    <!-- Ranking Rules -->
    <div class="flex items-start gap-2">
      <div class="flex-1">
        <q-select
          filled
          v-model="modelValue.rankingRules"
          label="Ranking Rules"
          hint="Order determines priority. Drag to reorder or add custom rules."
          use-input
          use-chips
          multiple
          stack-label
          hide-dropdown-icon
          input-debounce="0"
          new-value-mode="add"
          :class="{
            'border-2 border-orange-500': hasFieldChanged('rankingRules'),
          }"
        />
        <q-btn
          flat
          dense
          size="sm"
          icon="swap_vert"
          label="Reorder"
          @click="$emit('show-ranking-reorder')"
          class="q-mt-xs"
        />
      </div>
      <SettingsHelp
        :metadata="SETTINGS_METADATA.rankingRules"
        :current-value="modelValue.rankingRules"
      />
    </div>

    <!-- Distinct Attribute -->
    <div class="flex items-start gap-2">
      <q-input
        filled
        v-model="modelValue.distinctAttribute"
        label="Distinct Attribute"
        hint="Field that must be unique in results (for deduplication)"
        clearable
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('distinctAttribute'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.distinctAttribute"
        :current-value="modelValue.distinctAttribute"
      />
    </div>

    <!-- Stop Words -->
    <div class="flex items-start gap-2">
      <q-select
        filled
        v-model="modelValue.stopWords"
        label="Stop Words"
        hint="Words ignored in searches (e.g., 'the', 'a', 'of')"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add"
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('stopWords'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.stopWords"
        :current-value="modelValue.stopWords"
      />
    </div>

    <!-- Synonyms Section -->
    <SynonymsSection
      v-model="modelValue.synonyms"
      :has-field-changed="hasFieldChanged"
    />

    <!-- Typo Tolerance Section -->
    <TypoToleranceSection
      v-model="modelValue.typoTolerance"
      :has-field-changed="hasFieldChanged"
    />
  </div>
</template>

<script setup>
import SettingsHelp from "src/components/SettingsHelp.vue";
import SynonymsSection from "./SynonymsSection.vue";
import TypoToleranceSection from "./TypoToleranceSection.vue";
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

defineEmits(["show-ranking-reorder"]);
</script>
