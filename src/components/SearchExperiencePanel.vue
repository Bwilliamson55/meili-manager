<template>
  <q-card flat bordered class="mb-4">
    <q-card-section class="p-4">
      <div class="flex items-center gap-4 mb-4">
        <AisStatsDisplay />
        <div class="flex gap-3 flex-1">
          <AisSearchInput placeholder="Search documents..." />
          <AisSortBySelect :items="sortByItems" />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div class="md:col-span-3 lg:col-span-4">
          <q-banner class="bg-indigo-50 text-indigo-9 rounded-md">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-caption">LLM Demo Presets:</span>
              <q-btn
                flat
                dense
                color="indigo-8"
                label="Keyword-heavy"
                @click="$emit('apply-preset', 'keyword')"
              />
              <q-btn
                flat
                dense
                color="indigo-8"
                label="Balanced"
                @click="$emit('apply-preset', 'balanced')"
              />
              <q-btn
                flat
                dense
                color="indigo-8"
                label="Semantic-heavy"
                @click="$emit('apply-preset', 'semantic')"
              />
            </div>
          </q-banner>
        </div>
        <q-input
          v-model.number="state.rankingScoreThreshold"
          type="number"
          outlined
          dense
          clearable
          label="Ranking Score Threshold"
          hint="0-1; filters low scoring hits"
          :min="0"
          :max="1"
          :step="0.01"
        />
        <q-select
          v-model="state.matchingStrategy"
          :options="matchingStrategyOptions"
          outlined
          dense
          emit-value
          map-options
          label="Matching Strategy"
        />
        <q-input
          v-model="state.distinct"
          outlined
          dense
          clearable
          label="Distinct (query-time)"
        />
        <q-toggle v-model="state.showRankingScore" label="Show Ranking Score" />
        <q-toggle
          v-model="state.showRankingScoreDetails"
          label="Show Ranking Details"
        />
        <q-toggle
          v-model="state.showPerformanceDetails"
          label="Show Performance Details"
        />
        <q-toggle
          v-model="state.includeSearchMetadataHeader"
          label="Include Search Metadata Header"
        />
        <q-input
          v-model="state.searchMetadataHeaderValue"
          outlined
          dense
          clearable
          label="Metadata Header Value"
          :disable="!state.includeSearchMetadataHeader"
        />
        <q-toggle v-model="state.enableHybrid" label="Enable Hybrid Search" />
        <q-input
          v-model="state.hybridEmbedder"
          outlined
          dense
          clearable
          label="Hybrid Embedder (optional)"
          :disable="!state.enableHybrid"
        />
        <q-input
          v-model.number="state.hybridSemanticRatio"
          type="number"
          outlined
          dense
          clearable
          label="Hybrid Semantic Ratio"
          hint="0-1 (0 keyword only, 1 semantic only)"
          :min="0"
          :max="1"
          :step="0.01"
          :disable="!state.enableHybrid"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import AisSearchInput from "components/aisComponents/AisSearchInput.vue";
import AisStatsDisplay from "components/aisComponents/AisStatsDisplay.vue";
import AisSortBySelect from "components/aisComponents/AisSortBySelect.vue";

defineProps({
  state: {
    type: Object,
    required: true,
  },
  sortByItems: {
    type: Array,
    required: true,
  },
  matchingStrategyOptions: {
    type: Array,
    required: true,
  },
});

defineEmits(["apply-preset"]);
</script>
