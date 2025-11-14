<template>
  <PresetSelector @apply-preset="applyPreset" />

  <SettingsBanners
    :has-unsaved-settings="theSettings.hasUnsavedSettings"
    :reindexing-fields="reindexingFields"
  />

  <!-- Raw JSON Viewer -->
  <q-expansion-item
    dense
    dense-toggle
    expand-separator
    icon="code"
    label="Raw Settings JSON"
    header-class="text-grey-7"
    class="q-mb-md"
  >
    <q-card flat>
      <q-card-section>
        <p class="text-caption text-grey-7 text-center q-mb-md">
          Real-time view of your complete settings object
        </p>
        <pre class="text-caption">{{ iSettingsString }}</pre>
      </q-card-section>
    </q-card>
  </q-expansion-item>

  <div v-if="!fetching">
    <!-- Tabbed Categories -->
    <q-tabs
      v-model="activeTab"
      dense
      active-color="primary"
      indicator-color="primary"
      align="justify"
      class="q-mb-md"
    >
      <q-tab
        v-for="cat in SETTINGS_CATEGORIES"
        :key="cat.value"
        :name="cat.value"
        :icon="cat.icon"
        :label="cat.label"
      />
    </q-tabs>

    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-tab-panels v-model="activeTab" animated>
        <!-- Search Behavior Tab -->
        <q-tab-panel name="search">
          <SearchTab
            v-model="iSettings"
            :has-field-changed="hasFieldChanged"
            @show-searchable-reorder="showSearchableReorder = true"
          />
        </q-tab-panel>

        <!-- Relevancy Tab -->
        <q-tab-panel name="relevancy">
          <RelevancyTab
            v-model="iSettings"
            :has-field-changed="hasFieldChanged"
            @show-ranking-reorder="showRankingReorder = true"
          />
        </q-tab-panel>

        <!-- Performance Tab -->
        <q-tab-panel name="performance">
          <PerformanceTab
            v-model="iSettings"
            :has-field-changed="hasFieldChanged"
          />
        </q-tab-panel>
      </q-tab-panels>

      <!-- Submit Section -->
      <q-separator class="q-my-md" />
      <div class="flex items-center justify-between">
        <div class="text-caption text-grey-7">
          <q-icon name="info" size="xs" class="q-mr-xs" />
          Changes are not saved until you click Submit
        </div>
        <div class="flex gap-2">
          <q-btn
            v-if="theSettings.hasUnsavedSettings"
            flat
            color="negative"
            icon="undo"
            label="Reset to Original"
            @click="resetToOriginal"
          >
            <q-tooltip>Discard all unsaved changes</q-tooltip>
          </q-btn>
          <q-btn
            :loading="iSettingsProcessing.processing"
            type="submit"
            color="primary"
            icon="save"
            label="Submit Settings"
          >
            <template v-slot:loading>
              <q-spinner-dots />
              Updating... Task: {{ iSettingsProcessing.taskId }}
            </template>
          </q-btn>
        </div>
      </div>
    </q-form>

    <ReorderDialogs
      v-model="iSettings"
      :show-searchable-reorder="showSearchableReorder"
      :show-ranking-reorder="showRankingReorder"
      @update:showSearchableReorder="showSearchableReorder = $event"
      @update:showRankingReorder="showRankingReorder = $event"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import {
  showSuccess,
  showError,
  showConfirmation,
} from "src/utils/notifications";
import PresetSelector from "./settings/PresetSelector.vue";
import SettingsBanners from "./settings/SettingsBanners.vue";
import SearchTab from "./settings/SearchTab.vue";
import RelevancyTab from "./settings/RelevancyTab.vue";
import PerformanceTab from "./settings/PerformanceTab.vue";
import ReorderDialogs from "./settings/ReorderDialogs.vue";
import {
  SETTINGS_CATEGORIES,
  SETTINGS_PRESETS,
  getReindexingSettings,
} from "src/utils/settings-config";

const fetching = ref(true);
const activeTab = ref("search");
const showSearchableReorder = ref(false);
const showRankingReorder = ref(false);

const iSettings = ref({
  distinctAttribute: null,
  displayedAttributes: ["*"],
  searchableAttributes: ["*"],
  filterableAttributes: [],
  sortableAttributes: [],
  rankingRules: [],
  stopWords: [],
  synonyms: {},
  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 5,
      twoTypos: 9,
    },
    disableOnWords: [],
    disableOnAttributes: [],
  },
  faceting: {
    maxValuesPerFacet: 100,
  },
  pagination: {
    maxTotalHits: 1000,
  },
});

const originalSettings = ref({});
const iSettingsProcessing = ref({ taskId: 0, processing: false });

const theSettings = useSettingsStore();
const { currentIndex, confirmed } = storeToRefs(theSettings);

onMounted(async () => {
  if (confirmed.value) {
    try {
      const mclient = theSettings.getIndexClient(currentIndex.value);
      fetching.value = true;
      const settings = await mclient.getSettings();

      iSettings.value = {
        ...iSettings.value,
        ...settings,
        typoTolerance: settings.typoTolerance || iSettings.value.typoTolerance,
        faceting: settings.faceting || iSettings.value.faceting,
        pagination: settings.pagination || iSettings.value.pagination,
      };

      originalSettings.value = JSON.parse(JSON.stringify(iSettings.value));
      fetching.value = false;

      theSettings.markSettingsSaved();
    } catch (error) {
      fetching.value = false;
      showError(`Failed to load settings: ${error.message}`);
    }
  }

  window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

function handleBeforeUnload(e) {
  if (theSettings.hasUnsavedSettings) {
    e.preventDefault();
    e.returnValue = "";
    return "";
  }
}

const iSettingsString = computed(() => {
  return JSON.stringify(iSettings.value, null, 2);
});

watch(
  iSettings,
  () => {
    const hasChanges = changedSettings.value.length > 0;
    if (hasChanges && !theSettings.hasUnsavedSettings) {
      theSettings.markSettingsUnsaved();
    } else if (!hasChanges && theSettings.hasUnsavedSettings) {
      theSettings.markSettingsSaved();
    }
  },
  { deep: true },
);

const changedSettings = computed(() => {
  const changed = [];
  for (const key in iSettings.value) {
    if (
      JSON.stringify(iSettings.value[key]) !==
      JSON.stringify(originalSettings.value[key])
    ) {
      changed.push(key);
    }
  }
  return changed;
});

function hasFieldChanged(fieldName) {
  return changedSettings.value.includes(fieldName);
}

const reindexingFields = computed(() => {
  return getReindexingSettings(changedSettings.value);
});

function applyPreset(presetKey) {
  showConfirmation(
    `Apply ${SETTINGS_PRESETS[presetKey].label} preset? This will overwrite current settings.`,
    () => {
      const preset = SETTINGS_PRESETS[presetKey];
      Object.assign(iSettings.value, preset.settings);
      showSuccess(`Applied ${preset.label} preset`);
    },
  );
}

function resetToOriginal() {
  showConfirmation(
    "Discard all unsaved changes and reset to the last saved settings?",
    () => {
      iSettings.value = JSON.parse(JSON.stringify(originalSettings.value));
      theSettings.markSettingsSaved();
      showSuccess("Settings reset to original");
    },
  );
}

const onSubmit = async () => {
  iSettingsProcessing.value.processing = true;
  try {
    const mclient = theSettings.getIndexClient(currentIndex.value);
    const updateRes = await mclient.updateSettings(iSettings.value);
    iSettingsProcessing.value.taskId = updateRes.taskUid ?? 0;

    await theSettings.client.tasks.waitForTask(updateRes.taskUid, {
      intervalMs: 5000,
    });

    iSettingsProcessing.value.processing = false;

    const updatedSettings = await mclient.getSettings();
    iSettings.value = {
      ...iSettings.value,
      ...updatedSettings,
      typoTolerance:
        updatedSettings.typoTolerance || iSettings.value.typoTolerance,
      faceting: updatedSettings.faceting || iSettings.value.faceting,
      pagination: updatedSettings.pagination || iSettings.value.pagination,
    };
    originalSettings.value = JSON.parse(JSON.stringify(iSettings.value));

    showSuccess("Settings Updated");
    theSettings.markSettingsSaved();
  } catch (error) {
    iSettingsProcessing.value.processing = false;
    iSettingsProcessing.value.taskId = 0;

    console.error("Settings update error:", error);
    showError(`Failed to update settings: ${error.message}`);

    try {
      const mclient = theSettings.getIndexClient(currentIndex.value);
      const reloadedSettings = await mclient.getSettings();
      iSettings.value = {
        ...iSettings.value,
        ...reloadedSettings,
        typoTolerance:
          reloadedSettings.typoTolerance || iSettings.value.typoTolerance,
        faceting: reloadedSettings.faceting || iSettings.value.faceting,
        pagination: reloadedSettings.pagination || iSettings.value.pagination,
      };
      originalSettings.value = JSON.parse(JSON.stringify(iSettings.value));
    } catch (reloadError) {
      console.error("Failed to reload settings:", reloadError);
    }
  }
};
</script>
