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

    <!-- Dictionary -->
    <div class="flex items-start gap-2">
      <q-select
        filled
        v-model="modelValue.dictionary"
        label="Dictionary"
        hint="Terms treated as single tokens during indexing"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add-unique"
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('dictionary'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.dictionary"
        :current-value="modelValue.dictionary"
      />
    </div>

    <!-- Typo Tolerance Section -->
    <TypoToleranceSection
      v-model="modelValue.typoTolerance"
      :has-field-changed="hasFieldChanged"
    />

    <q-expansion-item
      dense
      dense-toggle
      expand-separator
      icon="inventory_2"
      label="Search Rules Pack (Portable)"
      header-class="text-grey-7"
    >
      <q-card flat bordered>
        <q-card-section class="q-gutter-sm">
          <div class="text-caption text-grey-7">
            Export/import ranking and related search rules between projects.
          </div>
          <div class="flex gap-2">
            <q-btn
              flat
              dense
              color="secondary"
              icon="download"
              label="Export Pack"
              @click="exportRulesPack"
            />
            <q-btn
              flat
              dense
              color="secondary"
              icon="upload"
              label="Apply Pack"
              @click="applyRulesPack"
            />
          </div>
          <q-input
            v-model="rulesPackJson"
            type="textarea"
            autogrow
            filled
            label="Rules Pack JSON"
            hint="Contains ranking rules, synonyms, typo tolerance, attributes, and optional embedders"
          />
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SettingsHelp from "src/components/SettingsHelp.vue";
import SynonymsSection from "./SynonymsSection.vue";
import TypoToleranceSection from "./TypoToleranceSection.vue";
import { SETTINGS_METADATA } from "src/utils/settings-config";
import { showError, showSuccess } from "src/utils/notifications";

const props = defineProps({
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

const rulesPackJson = ref("");

const exportRulesPack = () => {
  const pack = {
    version: 1,
    exportedAt: new Date().toISOString(),
    rules: {
      rankingRules: props.modelValue.rankingRules || [],
      distinctAttribute: props.modelValue.distinctAttribute || null,
      stopWords: props.modelValue.stopWords || [],
      synonyms: props.modelValue.synonyms || {},
      dictionary: props.modelValue.dictionary || [],
      typoTolerance: props.modelValue.typoTolerance || {},
      searchableAttributes: props.modelValue.searchableAttributes || ["*"],
      filterableAttributes: props.modelValue.filterableAttributes || [],
      sortableAttributes: props.modelValue.sortableAttributes || [],
      embedders: props.modelValue.embedders || {},
      localizedAttributes: props.modelValue.localizedAttributes || [],
    },
  };
  rulesPackJson.value = JSON.stringify(pack, null, 2);
  showSuccess("Search rules pack exported.");
};

const applyRulesPack = () => {
  try {
    const parsed = JSON.parse(rulesPackJson.value || "{}");
    const incoming = parsed?.rules || {};
    const allowedKeys = [
      "rankingRules",
      "distinctAttribute",
      "stopWords",
      "synonyms",
      "dictionary",
      "typoTolerance",
      "searchableAttributes",
      "filterableAttributes",
      "sortableAttributes",
      "embedders",
      "localizedAttributes",
    ];
    for (const key of allowedKeys) {
      if (incoming[key] !== undefined) {
        props.modelValue[key] = incoming[key];
      }
    }
    showSuccess("Search rules pack applied.");
  } catch (error) {
    showError(`Invalid rules pack JSON: ${error.message}`);
  }
};
</script>
