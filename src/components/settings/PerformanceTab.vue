<template>
  <div class="q-gutter-md">
    <!-- Pagination -->
    <div class="flex items-start gap-2">
      <div class="flex-1">
        <q-input
          v-model.number="modelValue.pagination.maxTotalHits"
          type="number"
          label="Max Total Results"
          hint="Maximum search results (default: 1000)"
          filled
          :rules="[
            (val) => val > 0 || 'Must be positive',
            (val) =>
              val <= 20000 || 'Values over 20,000 severely impact performance',
          ]"
          :class="{
            'border-2 border-orange-500': hasFieldChanged('pagination'),
          }"
        >
          <template #append>
            <q-icon :name="paginationImpactIcon" :color="paginationImpactColor">
              <q-tooltip>{{ paginationImpactMessage }}</q-tooltip>
            </q-icon>
          </template>
        </q-input>
      </div>
      <SettingsHelp
        :metadata="SETTINGS_METADATA.pagination"
        :current-value="modelValue.pagination"
      />
    </div>

    <!-- Faceting -->
    <div class="flex items-start gap-2">
      <q-input
        v-model.number="modelValue.faceting.maxValuesPerFacet"
        type="number"
        label="Max Values Per Facet"
        hint="Maximum facet values returned (default: 100)"
        filled
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('faceting'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.faceting"
        :current-value="modelValue.faceting"
      />
    </div>

    <!-- Proximity Precision -->
    <div class="flex items-start gap-2">
      <q-select
        v-model="modelValue.proximityPrecision"
        :options="proximityOptions"
        filled
        emit-value
        map-options
        label="Proximity Precision"
        hint="Choose between better relevancy or faster indexing"
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('proximityPrecision'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.proximityPrecision"
        :current-value="modelValue.proximityPrecision"
      />
    </div>

    <!-- Search Cutoff -->
    <div class="flex items-start gap-2">
      <q-input
        v-model.number="modelValue.searchCutoffMs"
        type="number"
        filled
        label="Search Cutoff (ms)"
        hint="Maximum search processing time before returning partial results"
        class="flex-1"
        :class="{
          'border-2 border-orange-500': hasFieldChanged('searchCutoffMs'),
        }"
      />
      <SettingsHelp
        :metadata="SETTINGS_METADATA.searchCutoffMs"
        :current-value="modelValue.searchCutoffMs"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import SettingsHelp from "src/components/SettingsHelp.vue";
import {
  SETTINGS_METADATA,
  getPerformanceImpact,
} from "src/utils/settings-config";

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

const paginationImpact = computed(() => {
  const maxHits = props.modelValue.pagination?.maxTotalHits || 1000;
  return getPerformanceImpact("pagination", { maxTotalHits: maxHits });
});

const proximityOptions = [
  { label: "By Word (more precise)", value: "byWord" },
  { label: "By Attribute (faster)", value: "byAttribute" },
];

const paginationImpactIcon = computed(() => {
  switch (paginationImpact.value?.level) {
    case "critical":
      return "error";
    case "high":
      return "warning";
    case "medium":
      return "info";
    default:
      return "check_circle";
  }
});

const paginationImpactColor = computed(() => {
  switch (paginationImpact.value?.level) {
    case "critical":
      return "negative";
    case "high":
      return "warning";
    case "medium":
      return "info";
    default:
      return "positive";
  }
});

const paginationImpactMessage = computed(() => {
  const maxHits = props.modelValue.pagination?.maxTotalHits || 1000;
  if (maxHits > 20000) return "Critical performance impact: >20,000 results";
  if (maxHits > 10000) return "High performance impact: >10,000 results";
  if (maxHits > 5000) return "Medium performance impact: >5,000 results";
  return "Optimal: ≤5,000 results";
});
</script>
