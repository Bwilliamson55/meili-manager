<template>
  <q-card flat bordered class="q-mb-md">
    <q-card-section>
      <div class="flex items-center justify-between q-mb-sm">
        <div class="text-subtitle1 font-semibold">Quick Presets</div>
        <q-btn flat dense size="sm" icon="info" @click="showInfo = true">
          <q-tooltip>About presets</q-tooltip>
        </q-btn>
      </div>
      <div class="flex flex-wrap gap-2">
        <q-btn
          v-for="(preset, key) in SETTINGS_PRESETS"
          :key="key"
          outline
          :icon="preset.icon"
          :label="preset.label"
          @click="$emit('apply-preset', key)"
          class="q-mb-xs"
        >
          <q-tooltip>{{ preset.description }}</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>

    <!-- Preset Info Dialog -->
    <q-dialog v-model="showInfo">
      <q-card style="min-width: 600px; max-width: 800px" class="bg-dark">
        <q-card-section>
          <div class="text-h6">About Presets</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p class="text-body2 q-mb-md">
            Presets provide optimized settings for common use cases. Applying a
            preset will overwrite your current settings.
          </p>

          <q-list class="q-mt-md">
            <q-expansion-item
              v-for="(preset, key) in SETTINGS_PRESETS"
              :key="key"
              :icon="preset.icon"
              :label="preset.label"
              :caption="preset.description"
              class="q-mb-sm"
            >
              <q-card flat bordered class="q-mt-sm">
                <q-card-section class="text-caption">
                  <div class="q-mb-sm">
                    <strong>Searchable Attributes:</strong>
                    {{ preset.settings.searchableAttributes.join(", ") }}
                  </div>
                  <div class="q-mb-sm">
                    <strong>Filterable:</strong>
                    {{
                      preset.settings.filterableAttributes.length > 0
                        ? preset.settings.filterableAttributes.join(", ")
                        : "None"
                    }}
                  </div>
                  <div class="q-mb-sm">
                    <strong>Sortable:</strong>
                    {{
                      preset.settings.sortableAttributes.length > 0
                        ? preset.settings.sortableAttributes.join(", ")
                        : "None"
                    }}
                  </div>
                  <div class="q-mb-sm">
                    <strong>Ranking Rules:</strong>
                    {{ preset.settings.rankingRules.join(" → ") }}
                  </div>
                  <div class="q-mb-sm">
                    <strong>Stop Words:</strong>
                    {{
                      preset.settings.stopWords.length > 0
                        ? preset.settings.stopWords.join(", ")
                        : "None"
                    }}
                  </div>
                  <div class="q-mb-sm">
                    <strong>Max Results:</strong>
                    {{ preset.settings.pagination.maxTotalHits }}
                  </div>
                  <div class="q-mb-sm">
                    <strong>Typo Tolerance:</strong>
                    {{
                      preset.settings.typoTolerance.enabled
                        ? "Enabled"
                        : "Disabled"
                    }}
                    <span v-if="preset.settings.typoTolerance.enabled">
                      (1 typo at
                      {{
                        preset.settings.typoTolerance.minWordSizeForTypos
                          .oneTypo
                      }}+ chars, 2 typos at
                      {{
                        preset.settings.typoTolerance.minWordSizeForTypos
                          .twoTypos
                      }}+ chars)
                    </span>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref } from "vue";
import { SETTINGS_PRESETS } from "src/utils/settings-config";

defineEmits(["apply-preset"]);

const showInfo = ref(false);
</script>
