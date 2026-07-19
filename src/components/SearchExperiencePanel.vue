<template>
  <q-card flat bordered square class="bg-page-elevated mb-4">
    <q-card-section class="p-4">
      <div
        class="flex flex-col md:flex-row md:items-stretch gap-3 md:gap-4 mb-3"
      >
        <div class="flex items-center flex-shrink-0">
          <AisStatsDisplay />
        </div>
        <div class="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
          <AisSearchInput
            placeholder="Search documents..."
            class="flex-1 min-w-0"
          />
          <AisSortBySelect :items="sortByItems" class="w-full sm:w-56" />
        </div>
      </div>
      <q-expansion-item
        dense
        dense-toggle
        expand-separator
        icon="tune"
        label="Advanced search / LLM"
        header-class="text-caption text-text-muted"
      >
        <q-card flat class="mt-2">
          <q-card-section class="px-0 pb-0">
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div class="md:col-span-3 lg:col-span-4">
                <q-banner dense class="bg-page text-text border border-border">
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-caption text-text-muted">
                        LLM demo presets
                      </span>
                      <q-icon
                        name="help_outline"
                        size="xs"
                        class="text-text-muted"
                      >
                        <q-tooltip>
                          Quick hybrid search mixes. Each preset enables hybrid,
                          fills Hybrid Embedder from the index when needed, and
                          sets semantic ratio (0 = keyword only, 1 = semantic
                          only).
                        </q-tooltip>
                      </q-icon>
                      <q-btn
                        v-for="preset in presetList"
                        :key="preset.key"
                        dense
                        square
                        no-caps
                        :unelevated="state.activeLlmPreset === preset.key"
                        :outline="state.activeLlmPreset !== preset.key"
                        :flat="false"
                        color="primary"
                        :disable="
                          !compat.supportsHybrid || !hasConfiguredEmbedders
                        "
                        :label="preset.label"
                        @click="$emit('apply-preset', preset.key)"
                      >
                        <q-tooltip>{{ preset.tooltip }}</q-tooltip>
                      </q-btn>
                      <q-btn
                        dense
                        square
                        flat
                        no-caps
                        color="grey-7"
                        icon="restart_alt"
                        label="Clear"
                        :disable="!hasActivePresetFields"
                        @click="$emit('clear-preset')"
                      >
                        <q-tooltip>
                          Clear preset selection and restore hybrid / ranking
                          demo defaults
                        </q-tooltip>
                      </q-btn>
                    </div>
                    <div
                      v-if="!compat.supportsHybrid"
                      class="text-caption text-warning flex items-center gap-1"
                    >
                      <q-icon name="warning" size="xs" />
                      Hybrid presets need Meilisearch newer than 1.11 (current:
                      {{ compat.versionString || "unknown" }}).
                    </div>
                    <div
                      v-else-if="!hasConfiguredEmbedders"
                      class="text-caption text-warning flex items-center gap-1"
                    >
                      <q-icon name="warning" size="xs" />
                      Hybrid needs an embedder configured on the index
                      (Settings → AI). Presets will not enable hybrid until one
                      exists.
                    </div>
                    <div
                      v-else-if="activePresetMeta"
                      class="text-caption text-text-muted"
                    >
                      Active: {{ activePresetMeta.label }}.
                      {{ activePresetMeta.caption }}
                    </div>
                    <div v-else class="text-caption text-text-muted">
                      Keyword-heavy 0.2 · Balanced 0.5 · Semantic-heavy 0.8
                    </div>
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
                :disable="!compat.supportsRankingScoreThreshold"
              >
                <q-tooltip>
                  Drop hits whose ranking score is below this value (0-1).
                </q-tooltip>
              </q-input>
              <q-select
                v-model="state.matchingStrategy"
                :options="matchingStrategyOptions"
                outlined
                dense
                emit-value
                map-options
                label="Matching Strategy"
                :disable="!compat.supportsFrequencyMatching"
              >
                <q-tooltip>
                  How Meilisearch requires query words to match (last / all /
                  frequency).
                </q-tooltip>
              </q-select>
              <q-input
                v-model="state.distinct"
                outlined
                dense
                clearable
                label="Distinct (query-time)"
                :disable="!compat.supportsDistinctQuery"
              >
                <q-tooltip>
                  Return only one hit per distinct attribute value for this
                  query.
                </q-tooltip>
              </q-input>
              <q-toggle
                v-model="state.showRankingScore"
                label="Show Ranking Score"
                :disable="!compat.supportsSearchDiagnosticsFlags"
              />
              <q-toggle
                v-model="state.showRankingScoreDetails"
                label="Show Ranking Details"
                :disable="!compat.supportsSearchDiagnosticsFlags"
              />
              <q-toggle
                v-model="state.showPerformanceDetails"
                label="Show Performance Details"
                :disable="!compat.supportsSearchDiagnosticsFlags"
              />
              <q-toggle
                v-model="state.includeSearchMetadataHeader"
                label="Include Search Metadata Header"
                :disable="!compat.supportsSearchMetadataHeader"
              />
              <q-input
                v-model="state.searchMetadataHeaderValue"
                outlined
                dense
                clearable
                label="Metadata Header Value"
                :disable="
                  !state.includeSearchMetadataHeader ||
                  !compat.supportsSearchMetadataHeader
                "
              />
              <q-toggle
                v-model="state.enableHybrid"
                label="Enable Hybrid Search"
                :disable="!compat.supportsHybrid || !hasConfiguredEmbedders"
              >
                <q-tooltip>
                  Mix keyword search with vector/semantic ranking (needs an
                  embedder on the index).
                </q-tooltip>
              </q-toggle>
              <q-select
                v-if="availableEmbedders.length > 0"
                v-model="state.hybridEmbedder"
                :options="availableEmbedders"
                outlined
                dense
                clearable
                label="Hybrid Embedder"
                hint="Required when hybrid is on (defaults to first index embedder)"
                :disable="!state.enableHybrid || !compat.supportsHybrid"
              />
              <q-input
                v-else
                v-model="state.hybridEmbedder"
                outlined
                dense
                clearable
                label="Hybrid Embedder"
                hint="Required when hybrid is on. Configure embedders under Settings (AI)."
                :disable="!state.enableHybrid || !compat.supportsHybrid"
              />
              <q-input
                :model-value="hybridRatioDisplay"
                type="number"
                outlined
                dense
                clearable
                label="Hybrid Semantic Ratio"
                hint="0 = keyword only · 1 = semantic only"
                :min="0"
                :max="1"
                :step="0.01"
                :disable="!state.enableHybrid || !compat.supportsHybrid"
                @update:model-value="onHybridRatioUpdate"
                @clear="onHybridRatioUpdate(null)"
              >
                <q-tooltip>
                  Weight of semantic vs keyword in hybrid mode. Presets set
                  0.2 / 0.5 / 0.8.
                </q-tooltip>
              </q-input>
              <q-select
                v-model="state.filterDensity"
                :options="filterDensityOptions"
                outlined
                dense
                emit-value
                map-options
                label="Filter Density"
              />
            </div>
            <div
              v-if="compat.versionString"
              class="text-caption text-text-muted mt-3 flex items-center gap-1"
            >
              <q-icon name="info" size="xs" />
              Version-aware mode: {{ compat.versionString }}
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from "vue";
import AisSearchInput from "components/aisComponents/AisSearchInput.vue";
import AisStatsDisplay from "components/aisComponents/AisStatsDisplay.vue";
import AisSortBySelect from "components/aisComponents/AisSortBySelect.vue";
import { LLM_DEMO_PRESETS } from "src/meili-core/utils/search-utils";

const props = defineProps({
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
  compat: {
    type: Object,
    default: () => ({}),
  },
  availableEmbedders: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["apply-preset", "clear-preset"]);

const presetList = Object.values(LLM_DEMO_PRESETS);

const filterDensityOptions = [
  { label: "Comfortable", value: "comfortable" },
  { label: "Compact", value: "compact" },
];

const hasConfiguredEmbedders = computed(
  () => props.availableEmbedders.length > 0,
);

const activePresetMeta = computed(() => {
  const key = props.state.activeLlmPreset;
  return key ? LLM_DEMO_PRESETS[key] || null : null;
});

const hasActivePresetFields = computed(() => {
  const s = props.state;
  return Boolean(
    s.activeLlmPreset ||
      s.enableHybrid ||
      s.hybridEmbedder ||
      s.hybridSemanticRatio != null ||
      s.showRankingScore ||
      s.showRankingScoreDetails ||
      s.showPerformanceDetails,
  );
});

const hybridRatioDisplay = computed(() => {
  const value = props.state.hybridSemanticRatio;
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
});

const onHybridRatioUpdate = (raw) => {
  if (raw === null || raw === undefined || raw === "") {
    props.state.hybridSemanticRatio = null;
    props.state.activeLlmPreset = null;
    return;
  }
  const next = Number(raw);
  props.state.hybridSemanticRatio = Number.isFinite(next) ? next : null;
  // Manual edits leave the preset label so it does not look "stuck" selected.
  const active = props.state.activeLlmPreset;
  if (active && LLM_DEMO_PRESETS[active]) {
    const expected = LLM_DEMO_PRESETS[active].hybridSemanticRatio;
    if (props.state.hybridSemanticRatio !== expected) {
      props.state.activeLlmPreset = null;
    }
  }
};
</script>
