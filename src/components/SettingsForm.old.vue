<template>
  <!-- Presets Section -->
  <q-card flat bordered class="q-mb-md">
    <q-card-section>
      <div class="flex items-center justify-between q-mb-sm">
        <div class="text-subtitle1 font-semibold">Quick Presets</div>
        <q-btn flat dense size="sm" icon="info" @click="showPresetInfo = true">
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
          @click="applyPreset(key)"
          class="q-mb-xs"
        >
          <q-tooltip>{{ preset.description }}</q-tooltip>
        </q-btn>
      </div>
    </q-card-section>
  </q-card>

  <!-- Unsaved Changes Warning -->
  <q-banner
    v-if="theSettings.hasUnsavedSettings"
    class="bg-orange text-white q-mb-md"
  >
    <template #avatar>
      <q-icon name="edit" size="md" />
    </template>
    <div class="text-subtitle2 font-semibold">Unsaved Changes</div>
    <div class="text-caption">
      You have unsaved settings changes. Click "Submit Settings" to save them.
    </div>
  </q-banner>

  <!-- Re-indexing Warning -->
  <q-banner
    v-if="reindexingFields.length > 0"
    class="bg-warning text-black q-mb-md"
  >
    <template #avatar>
      <q-icon name="warning" size="md" />
    </template>
    <div class="text-subtitle2 font-semibold">
      Changes will trigger re-indexing
    </div>
    <div class="text-caption q-mt-xs">
      These settings will re-index all documents (may take time):
      <div class="flex flex-wrap gap-1 q-mt-xs">
        <q-chip
          v-for="field in reindexingFields"
          :key="field"
          size="sm"
          dense
          color="warning"
          text-color="black"
        >
          {{ field }}
        </q-chip>
      </div>
    </div>
  </q-banner>

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
          <div class="q-gutter-md">
            <!-- Displayed Attributes -->
            <div class="flex items-start gap-2">
              <q-select
                filled
                v-model="iSettings.displayedAttributes"
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
                  'border-2 border-orange-500': hasFieldChanged(
                    'displayedAttributes',
                  ),
                }"
              />
              <SettingsHelp
                :metadata="SETTINGS_METADATA.displayedAttributes"
                :current-value="iSettings.displayedAttributes"
              />
            </div>

            <!-- Searchable Attributes -->
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <q-select
                  filled
                  v-model="iSettings.searchableAttributes"
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
                  @click="showSearchableReorder = true"
                  class="q-mt-xs"
                />
              </div>
              <SettingsHelp
                :metadata="SETTINGS_METADATA.searchableAttributes"
                :current-value="iSettings.searchableAttributes"
              />
            </div>

            <!-- Filterable Attributes -->
            <div class="flex items-start gap-2">
              <q-select
                filled
                v-model="iSettings.filterableAttributes"
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
                  'border-2 border-orange-500': hasFieldChanged(
                    'filterableAttributes',
                  ),
                }"
              />
              <SettingsHelp
                :metadata="SETTINGS_METADATA.filterableAttributes"
                :current-value="iSettings.filterableAttributes"
              />
            </div>

            <!-- Sortable Attributes -->
            <div class="flex items-start gap-2">
              <q-select
                filled
                v-model="iSettings.sortableAttributes"
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
                  'border-2 border-orange-500':
                    hasFieldChanged('sortableAttributes'),
                }"
              />
              <SettingsHelp
                :metadata="SETTINGS_METADATA.sortableAttributes"
                :current-value="iSettings.sortableAttributes"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- Relevancy Tab -->
        <q-tab-panel name="relevancy">
          <div class="q-gutter-md">
            <!-- Ranking Rules -->
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <q-select
                  filled
                  v-model="iSettings.rankingRules"
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
                    'border-2 border-orange-500':
                      hasFieldChanged('rankingRules'),
                  }"
                />
                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="swap_vert"
                  label="Reorder"
                  @click="showRankingReorder = true"
                  class="q-mt-xs"
                />
              </div>
              <SettingsHelp
                :metadata="SETTINGS_METADATA.rankingRules"
                :current-value="iSettings.rankingRules"
              />
            </div>

            <!-- Distinct Attribute -->
            <div class="flex items-start gap-2">
              <q-input
                filled
                v-model="iSettings.distinctAttribute"
                label="Distinct Attribute"
                hint="Field that must be unique in results (for deduplication)"
                clearable
                class="flex-1"
                :class="{
                  'border-2 border-orange-500':
                    hasFieldChanged('distinctAttribute'),
                }"
              />
              <SettingsHelp
                :metadata="SETTINGS_METADATA.distinctAttribute"
                :current-value="iSettings.distinctAttribute"
              />
            </div>

            <!-- Stop Words -->
            <div class="flex items-start gap-2">
              <q-select
                filled
                v-model="iSettings.stopWords"
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
                :current-value="iSettings.stopWords"
              />
            </div>

            <!-- Synonyms -->
            <q-separator class="q-my-md" />
            <div class="flex items-center justify-between q-mb-sm">
              <div class="text-subtitle2">Synonyms</div>
              <div class="flex gap-2">
                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="upload"
                  label="Import CSV"
                  @click="importSynonyms"
                >
                  <q-tooltip>Import synonyms from CSV file</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="download"
                  label="Export CSV"
                  @click="exportSynonyms"
                  :disable="Object.keys(iSettings.synonyms).length === 0"
                >
                  <q-tooltip>Export synonyms to CSV file</q-tooltip>
                </q-btn>
              </div>
            </div>

            <q-banner dense class="bg-info text-white q-mb-md">
              <div class="text-caption">
                <strong>CSV Format:</strong> Each row should have a key word
                followed by its synonyms. Example:<br />
                <code class="text-white"
                  >phone,mobile,smartphone,cellphone</code
                >
              </div>
            </q-banner>

            <!-- Synonyms Table -->
            <q-table
              v-if="Object.keys(iSettings.synonyms).length > 0"
              :rows="synonymRows"
              :columns="synonymColumns"
              row-key="key"
              flat
              bordered
              dense
              class="q-mb-md"
              :class="{
                'border-2 border-orange-500': hasFieldChanged('synonyms'),
              }"
            >
              <template v-slot:body-cell-key="props">
                <q-td :props="props">
                  <strong>{{ props.row.key }}</strong>
                </q-td>
              </template>
              <template v-slot:body-cell-synonyms="props">
                <q-td :props="props">
                  <div class="flex flex-wrap gap-1">
                    <q-chip
                      v-for="(syn, idx) in props.row.synonyms"
                      :key="idx"
                      size="sm"
                      removable
                      @remove="props.row.synonyms.splice(idx, 1)"
                    >
                      {{ syn }}
                    </q-chip>
                    <q-chip
                      size="sm"
                      clickable
                      icon="add"
                      color="primary"
                      text-color="white"
                      @click="addSynonymToGroup(props.row.key)"
                    >
                      Add
                    </q-chip>
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="delete"
                    color="negative"
                    @click="deleteSynonymGroup(props.row.key)"
                  >
                    <q-tooltip>Delete group</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>

            <!-- Add New Synonym Group -->
            <div class="flex items-start gap-2">
              <q-input
                filled
                v-model="newSynonymKey"
                label="New Synonym Group"
                hint="Enter a key word and press Enter"
                @keydown.enter.prevent="addNewSynonymGroup"
                class="flex-1"
              >
                <template #append>
                  <q-btn
                    flat
                    dense
                    round
                    icon="add"
                    @click="addNewSynonymGroup"
                    :disable="!newSynonymKey"
                  />
                </template>
              </q-input>
              <SettingsHelp
                :metadata="SETTINGS_METADATA.synonyms"
                :current-value="iSettings.synonyms"
              />
            </div>

            <!-- Typo Tolerance -->
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
                :current-value="iSettings.typoTolerance"
              />
            </div>
            <q-toggle
              v-model="iSettings.typoTolerance.enabled"
              color="positive"
              label="Enable typo tolerance"
            />
            <div class="flex gap-3">
              <q-input
                v-model.number="
                  iSettings.typoTolerance.minWordSizeForTypos.oneTypo
                "
                type="number"
                label="Min size for 1 typo"
                filled
                dense
                class="flex-1"
              />
              <q-input
                v-model.number="
                  iSettings.typoTolerance.minWordSizeForTypos.twoTypos
                "
                type="number"
                label="Min size for 2 typos"
                filled
                dense
                class="flex-1"
              />
            </div>
            <q-select
              filled
              v-model="iSettings.typoTolerance.disableOnWords"
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
              v-model="iSettings.typoTolerance.disableOnAttributes"
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
        </q-tab-panel>

        <!-- Performance Tab -->
        <q-tab-panel name="performance">
          <div class="q-gutter-md">
            <!-- Pagination -->
            <div class="flex items-start gap-2">
              <div class="flex-1">
                <q-input
                  v-model.number="iSettings.pagination.maxTotalHits"
                  type="number"
                  label="Max Total Results"
                  hint="Maximum search results (default: 1000)"
                  filled
                  :rules="[
                    (val) => val > 0 || 'Must be positive',
                    (val) =>
                      val <= 20000 ||
                      'Values over 20,000 severely impact performance',
                  ]"
                  :class="{
                    'border-2 border-orange-500': hasFieldChanged('pagination'),
                  }"
                >
                  <template #append>
                    <q-icon
                      :name="paginationImpactIcon"
                      :color="paginationImpactColor"
                    >
                      <q-tooltip>{{ paginationImpactMessage }}</q-tooltip>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <SettingsHelp
                :metadata="SETTINGS_METADATA.pagination"
                :current-value="iSettings.pagination"
              />
            </div>

            <!-- Faceting -->
            <div class="flex items-start gap-2">
              <q-input
                v-model.number="iSettings.faceting.maxValuesPerFacet"
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
                :current-value="iSettings.faceting"
              />
            </div>
          </div>
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

    <!-- Searchable Attributes Reorder Dialog -->
    <q-dialog v-model="showSearchableReorder">
      <q-card style="min-width: 400px" class="bg-dark">
        <q-card-section>
          <div class="text-h6">Reorder Searchable Attributes</div>
          <p class="text-caption text-grey-7">
            <q-icon name="priority_high" size="xs" color="warning" />
            Order matters! Top attributes have higher search priority.
          </p>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-banner dense class="bg-info text-white q-mb-md">
            Fields at the top are searched first and matches in them score
            higher. For example: put "title" before "description" if title
            matches should rank higher.
          </q-banner>
          <VueDraggable
            v-model="iSettings.searchableAttributes"
            handle=".handle"
            animation="150"
          >
            <q-item
              v-for="(attr, index) in iSettings.searchableAttributes"
              :key="attr"
              class="q-mb-xs rounded"
              :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
            >
              <q-item-section avatar>
                <q-icon name="drag_indicator" class="handle cursor-move" />
              </q-item-section>
              <q-item-section>
                <q-item-label
                  >{{ index + 1 }}. {{ attr }}
                  <q-badge
                    v-if="index === 0"
                    color="primary"
                    label="Highest Priority"
                    class="q-ml-xs"
                /></q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="close"
                  @click="removeSearchableAttribute(index)"
                />
              </q-item-section>
            </q-item>
          </VueDraggable>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Done" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Ranking Rules Reorder Dialog -->
    <q-dialog v-model="showRankingReorder">
      <q-card style="min-width: 400px" class="bg-dark">
        <q-card-section>
          <div class="text-h6">Reorder Ranking Rules</div>
          <p class="text-caption text-grey-7">
            Drag rules to change priority (top = highest priority)
          </p>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <VueDraggable
            v-model="iSettings.rankingRules"
            handle=".handle"
            animation="150"
          >
            <q-item
              v-for="(rule, index) in iSettings.rankingRules"
              :key="rule"
              class="q-mb-xs rounded"
              :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
            >
              <q-item-section avatar>
                <q-icon name="drag_indicator" class="handle cursor-move" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ index + 1 }}. {{ rule }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="close"
                  @click="removeRankingRule(index)"
                />
              </q-item-section>
            </q-item>
          </VueDraggable>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Done" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Preset Info Dialog -->
    <q-dialog v-model="showPresetInfo">
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import {
  showSuccess,
  showError,
  showConfirmation,
  showPrompt,
} from "src/utils/notifications";
import { VueDraggable } from "vue-draggable-plus";
import Papa from "papaparse";
import SettingsHelp from "./SettingsHelp.vue";
import {
  SETTINGS_METADATA,
  SETTINGS_CATEGORIES,
  SETTINGS_PRESETS,
  getReindexingSettings,
  getPerformanceImpact,
} from "src/utils/settings-config";

const $q = useQuasar();
const fetching = ref(true);
const activeTab = ref("search");
const showRawJson = ref(false);
const showSearchableReorder = ref(false);
const showRankingReorder = ref(false);
const showPresetInfo = ref(false);
const newSynonymKey = ref("");

// Synonym table columns
const synonymColumns = [
  {
    name: "key",
    label: "Key Word",
    field: "key",
    align: "left",
    style: "width: 200px",
  },
  {
    name: "synonyms",
    label: "Synonyms",
    field: "synonyms",
    align: "left",
  },
  {
    name: "actions",
    label: "",
    field: "actions",
    align: "right",
    style: "width: 60px",
  },
];

const synonymRows = computed(() => {
  return Object.keys(iSettings.value.synonyms).map((key) => ({
    key,
    synonyms: iSettings.value.synonyms[key],
  }));
});

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

      // Merge fetched settings with defaults
      iSettings.value = {
        ...iSettings.value,
        ...settings,
        typoTolerance: settings.typoTolerance || iSettings.value.typoTolerance,
        faceting: settings.faceting || iSettings.value.faceting,
        pagination: settings.pagination || iSettings.value.pagination,
      };

      originalSettings.value = JSON.parse(JSON.stringify(iSettings.value));
      fetching.value = false;

      // Reset unsaved flag when loading fresh settings
      theSettings.markSettingsSaved();
    } catch (error) {
      fetching.value = false;
      showError(`Failed to load settings: ${error.message}`);
    }
  }

  // Warn user about unsaved changes before leaving
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

const iSettingsSynonymKeys = computed(() => {
  return Object.keys(iSettings.value?.synonyms || {});
});

// Watch for changes to mark as unsaved
watch(
  iSettings,
  () => {
    // Only mark as unsaved if there are actual changes from original
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

// Helper to check if a specific field has changed
function hasFieldChanged(fieldName) {
  return changedSettings.value.includes(fieldName);
}

const reindexingFields = computed(() => {
  return getReindexingSettings(changedSettings.value);
});

const paginationImpact = computed(() => {
  const maxHits = iSettings.value.pagination?.maxTotalHits || 1000;
  return getPerformanceImpact("pagination", { maxTotalHits: maxHits });
});

const paginationImpactIcon = computed(() => {
  switch (paginationImpact.value) {
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
  switch (paginationImpact.value) {
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
  const maxHits = iSettings.value.pagination?.maxTotalHits || 1000;
  if (maxHits > 20000) return "Critical performance impact: >20,000 results";
  if (maxHits > 10000) return "High performance impact: >10,000 results";
  if (maxHits > 5000) return "Medium performance impact: >5,000 results";
  return "Optimal: ≤5,000 results";
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

function removeSearchableAttribute(index) {
  iSettings.value.searchableAttributes.splice(index, 1);
}

function removeRankingRule(index) {
  iSettings.value.rankingRules.splice(index, 1);
}

function addNewSynonymGroup() {
  const key = newSynonymKey.value.trim();
  if (key && !iSettings.value.synonyms[key]) {
    iSettings.value.synonyms[key] = [];
    newSynonymKey.value = "";
    showSuccess(`Added synonym group for '${key}'`);
  } else if (iSettings.value.synonyms[key]) {
    showError(`Synonym group '${key}' already exists`);
  }
}

function addSynonymToGroup(key) {
  showPrompt(`Add synonym to '${key}'`, "Enter a synonym:", (synonym) => {
    const trimmed = synonym.trim();
    if (trimmed && !iSettings.value.synonyms[key].includes(trimmed)) {
      iSettings.value.synonyms[key].push(trimmed);
    }
  });
}

const addSynonymParent = (synonymString, done) => {
  iSettings.value.synonyms[synonymString] = [""];
  done(synonymString, "add-unique");
};

const removeSynonym = (details) => {
  delete iSettings.value.synonyms[details.value];
};

function deleteSynonymGroup(key) {
  delete iSettings.value.synonyms[key];
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

function importSynonyms() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        let imported = 0;
        let errors = 0;

        results.data.forEach((row) => {
          // Skip empty rows
          if (!row || row.length === 0 || !row[0]) return;

          const key = row[0].trim();
          const synonyms = row
            .slice(1)
            .filter((s) => s && s.trim())
            .map((s) => s.trim());

          if (key && synonyms.length > 0) {
            iSettings.value.synonyms[key] = synonyms;
            imported++;
          } else {
            errors++;
          }
        });

        if (imported > 0) {
          showSuccess(
            `Imported ${imported} synonym group${imported !== 1 ? "s" : ""}${errors > 0 ? ` (${errors} skipped)` : ""}`,
          );
        } else {
          showError("No valid synonyms found in CSV file");
        }
      },
      error: (error) => {
        showError(`Failed to parse CSV: ${error.message}`);
      },
    });
  };
  input.click();
}

function exportSynonyms() {
  const rows = Object.entries(iSettings.value.synonyms).map(
    ([key, synonyms]) => [key, ...synonyms],
  );

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${currentIndex.value}-synonyms-${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showSuccess("Synonyms exported to CSV");
}

const onSubmit = async () => {
  iSettingsProcessing.value.processing = true;
  try {
    const mclient = theSettings.getIndexClient(currentIndex.value);
    const updateRes = await mclient.updateSettings(iSettings.value);
    iSettingsProcessing.value.taskId = updateRes.taskUid ?? 0;

    // waitForTask is on the client.tasks object in SDK 0.53.0
    await theSettings.client.tasks.waitForTask(updateRes.taskUid, {
      intervalMs: 5000,
    });

    iSettingsProcessing.value.processing = false;

    // Reload settings and update original
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

    // Reload settings to show current state
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
