<template>
  <q-page padding>
    <div class="flex flex-col gap-4 w-full">
      <IndexDetailTabs>
        <template #overview-tab>
          <q-card flat bordered>
            <q-card-section>
              <q-card-section>
                <div
                  v-if="iStats && iPk"
                  class="flex justify-around items-center"
                >
                  <q-chip icon="numbers" class="bg-info"
                    >Count: {{ iStats.numberOfDocuments }}</q-chip
                  >
                  <div>
                    Primary Key: <strong>{{ iPk }}</strong>
                  </div>
                  <q-chip
                    :icon="iStats.isIndexing ? 'done' : 'sync'"
                    class="bg-secondary text-white"
                    >Indexing: {{ iStats.isIndexing }}</q-chip
                  >
                </div>
              </q-card-section>

              <q-separator />

              <q-card-section>
                <div v-if="iStats && iPk" class="flex flex-col gap-4">
                  <div class="w-full text-center">
                    <p class="text-h6">Field Distribution</p>
                  </div>
                  <div class="px-4 mx-auto w-full">
                    <q-table
                      dense
                      :rows="fdRows"
                      :columns="fdColumns"
                      row-key="Field Name"
                      :rows-per-page-options="[5, 10, 15, 0]"
                      flat
                      bordered
                    />
                  </div>
                  <div class="w-full text-center mt-6">
                    <p class="text-h6">Fields Metadata</p>
                  </div>
                  <div class="flex items-end justify-center gap-2 mb-2">
                    <q-input
                      v-model.number="fieldsOffset"
                      type="number"
                      dense
                      outlined
                      label="Offset"
                      class="w-28"
                      :min="0"
                    />
                    <q-input
                      v-model.number="fieldsLimit"
                      type="number"
                      dense
                      outlined
                      label="Limit"
                      class="w-28"
                      :min="1"
                      :max="1000"
                    />
                    <q-btn
                      flat
                      dense
                      color="secondary"
                      icon="refresh"
                      label="Reload Fields"
                      :loading="fieldsLoading"
                      @click="loadFieldsMetadata"
                    />
                  </div>
                  <div
                    v-if="fieldsRows.length === 0"
                    class="text-caption text-grey-7 text-center"
                  >
                    Fields metadata unavailable or empty for this index/key.
                  </div>
                  <div class="px-4 mx-auto w-full">
                    <q-table
                      dense
                      :rows="fieldsRows"
                      :columns="fieldsColumns"
                      row-key="field"
                      :rows-per-page-options="[5, 10, 15, 25]"
                      flat
                      bordered
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card-section>
          </q-card>
        </template>
        <template #settings-tab>
          <SettingsForm @settings-updated="onIndexSettingsUpdated" />
        </template>
      </IndexDetailTabs>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-3 mt-4 mb-3">
      <span class="text-h6 dark:text-white">Documents</span>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-2">
          <span class="text-caption text-gray-600 dark:text-gray-400"
            >Show thumbnails:</span
          >
          <q-select
            v-model="displaySettings.imageField"
            :options="imageFieldOptions"
            placeholder="None"
            dense
            outlined
            clearable
            class="w-40"
            @update:model-value="saveDisplaySettings"
          >
            <template #prepend>
              <q-icon name="image" size="xs" />
            </template>
          </q-select>
        </div>
        <q-select
          v-model="displaySettings.listFields"
          :options="listFieldOptions"
          label="List fields"
          dense
          outlined
          multiple
          use-chips
          class="min-w-48 max-w-xs"
          @update:model-value="onListFieldsChange"
        />
        <span
          v-if="listFieldsSourceLabel"
          class="text-caption text-gray-500 dark:text-gray-400 w-full sm:w-auto"
        >
          {{ listFieldsSourceLabel }}
        </span>
        <q-btn
          flat
          dense
          icon="reorder"
          label="Order"
          :disable="!displaySettings.listFields?.length"
          @click="showListFieldsOrderDialog = true"
        />
        <q-btn
          flat
          dense
          icon="restart_alt"
          label="Reset fields"
          :disable="!displaySettings.listFields?.length"
          @click="resetListFields"
        />
        <q-select
          v-model="displaySettings.listColumns"
          :options="listColumnOptions"
          label="Columns"
          dense
          outlined
          emit-value
          map-options
          class="w-28"
          @update:model-value="saveDisplaySettings"
        />
        <q-input
          v-model="batchDocumentIdsInput"
          dense
          outlined
          clearable
          class="w-72"
          label="Fetch documents by IDs"
          hint="Comma-separated IDs"
        />
        <q-btn
          flat
          dense
          color="secondary"
          icon="list_alt"
          label="Fetch IDs"
          :loading="batchFetchLoading"
          :disable="!meiliCompat.supportsDocumentsFetchByIds"
          @click="fetchDocumentsByIds"
        />
        <q-btn
          flat
          dense
          icon="add_circle"
          label="New"
          :to="`/documents/${currentIndex}/new`"
        />
      </div>
    </div>
    <ais-instant-search
      v-if="iPk && searchClient"
      :search-client="searchClient"
      :index-name="currentIndex"
    >
      <SearchExperiencePanel
        :state="savedSearchState"
        :sort-by-items="sortByItems"
        :matching-strategy-options="matchingStrategyOptions"
        :compat="meiliCompat"
        @apply-preset="applyHybridPreset"
      />
      <q-splitter
        v-if="filtersVisible"
        v-model="filtersPanelWidth"
        :limits="[220, 600]"
        unit="px"
        class="documents-splitter"
        @update:model-value="onFiltersPanelWidthChange"
      >
        <template #before>
          <div class="pr-2 h-full">
            <DocumentsFiltersPanel
              :filterable-attributes="filterableAttributes"
              :filter-density="savedSearchState.filterDensity"
              @close="filtersVisible = false"
            />
          </div>
        </template>
        <template #after>
          <DocumentsHitsColumn
            :current-index="currentIndex"
            :primary-key="iPk"
            :display-settings="displaySettings"
            :resolved-list-fields="resolvedListFields"
            :use-all-item-fields="useAllItemFields"
            :show-similar="
              meiliCompat.supportsSimilarEndpoint && hasConfiguredEmbedders
            "
          />
        </template>
      </q-splitter>
      <div v-else>
        <div class="mb-3">
          <q-btn
            flat
            dense
            icon="filter_list"
            label="Show Filters"
            color="primary"
            @click="filtersVisible = true"
          />
        </div>
        <DocumentsHitsColumn
          :current-index="currentIndex"
          :primary-key="iPk"
          :display-settings="displaySettings"
          :resolved-list-fields="resolvedListFields"
          :use-all-item-fields="useAllItemFields"
          :show-similar="
            meiliCompat.supportsSimilarEndpoint && hasConfiguredEmbedders
          "
        />
      </div>
      <AisSearchDiagnostics
        :header-enabled="savedSearchState.includeSearchMetadataHeader"
        :header-value="savedSearchState.searchMetadataHeaderValue"
        :hybrid-enabled="savedSearchState.enableHybrid"
        :hybrid-embedder="savedSearchState.hybridEmbedder"
        :hybrid-semantic-ratio="
          normalizeThreshold(savedSearchState.hybridSemanticRatio)
        "
      />
      <ais-configure v-bind="searchParams" />
      <SearchStatePersistence
        :index-name="currentIndex"
        @state-changed="handleSearchStateChange"
      />
    </ais-instant-search>

    <q-dialog v-model="showBatchFetchDialog" maximized>
      <q-card>
        <q-card-section class="flex items-center justify-between">
          <div class="text-h6">Fetched Documents by ID</div>
          <q-btn flat dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-table
            :rows="batchFetchedRows"
            :columns="batchFetchedColumns"
            row-key="id"
            flat
            bordered
            :rows-per-page-options="[10, 25, 50]"
          >
            <template #body-cell-id="props">
              <q-td :props="props" class="font-mono">
                {{ props.value }}
              </q-td>
            </template>
            <template #body-cell-document="props">
              <q-td :props="props">
                <pre class="text-caption whitespace-pre-wrap break-all">{{
                  JSON.stringify(props.value, null, 2)
                }}</pre>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <ListFieldsOrderDialog
      v-model="showListFieldsOrderDialog"
      :fields="displaySettings.listFields"
      @update:fields="onListFieldsOrderChange"
    />
  </q-page>
</template>

<script setup>
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { useSettingsStore } from "src/meili-core/stores/settings-store";
import { useIndexesStore } from "src/meili-core/stores/indexes-store";
import {
  normalizeThreshold,
  getDefaultIndexSearchState,
} from "src/meili-core/utils/search-utils";
import {
  getCompatFeatures,
  buildCompatibleSearchParams,
} from "src/meili-core/utils/meili-compat";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import IndexDetailTabs from "components/IndexDetailTabs.vue";
import SettingsForm from "components/SettingsForm.vue";
import AisSearchDiagnostics from "components/aisComponents/AisSearchDiagnostics.vue";
import SearchStatePersistence from "components/SearchStatePersistence.vue";
import SearchExperiencePanel from "components/SearchExperiencePanel.vue";
import DocumentsFiltersPanel from "components/documents/DocumentsFiltersPanel.vue";
import DocumentsHitsColumn from "components/documents/DocumentsHitsColumn.vue";
import ListFieldsOrderDialog from "components/documents/ListFieldsOrderDialog.vue";
import {
  resolveListFields,
  resolveFilterableAttributes,
  shouldUseAllItemFields,
  getListFieldsSourceLabel,
} from "src/meili-core/utils/display-settings";
import { showError, showSuccess } from "src/utils/notifications";

const route = useRoute();

const theSettings = useSettingsStore();
const indexesStore = useIndexesStore();
const { currentIndex } = storeToRefs(theSettings);
const iStats = ref({});
const iSettings = ref({});
const sortByItems = ref([]);
const iPk = ref("");
const searchClient = ref(null);
const fdRows = ref([]);
const fieldsRows = ref([]);
const fdColumns = [
  {
    name: "Field Name",
    label: "Field Name",
    field: "Field Name",
    align: "left",
    sortable: true,
  },
  {
    name: "Count",
    label: "Count",
    field: "Count",
    align: "right",
    sortable: true,
  },
];
const fieldsColumns = [
  {
    name: "field",
    label: "Field",
    field: "field",
    align: "left",
    sortable: true,
  },
  {
    name: "searchable",
    label: "Searchable",
    field: "searchable",
    align: "left",
    sortable: true,
  },
  {
    name: "filterable",
    label: "Filterable",
    field: "filterable",
    align: "left",
    sortable: true,
  },
  {
    name: "sortable",
    label: "Sortable",
    field: "sortable",
    align: "left",
    sortable: true,
  },
];
const displaySettings = ref({ imageField: null, listFields: [], listColumns: 2 });
const imageFieldOptions = ref([]);
const listFieldOptions = ref([]);
const listColumnOptions = [
  { label: "1 col", value: 1 },
  { label: "2 cols", value: 2 },
  { label: "3 cols", value: 3 },
];
const showListFieldsOrderDialog = ref(false);
const filtersVisible = ref(true);
const filtersPanelWidth = ref(320);
const previousIndex = ref("");
const previousQuery = ref("");
const fieldsOffset = ref(0);
const fieldsLimit = ref(100);
const fieldsLoading = ref(false);
const meiliCompat = ref(getCompatFeatures("unknown"));
const batchDocumentIdsInput = ref("");
const batchFetchLoading = ref(false);
const showBatchFetchDialog = ref(false);
const batchFetchedRows = ref([]);
const batchFetchedColumns = [
  { name: "id", label: "ID", field: "id", align: "left", sortable: true },
  { name: "document", label: "Document", field: "document", align: "left" },
];

// Search state persistence
// Note: page is 0-based to match InstantSearch's internal format (0 = first page, 1 = second page)
const savedSearchState = ref(getDefaultIndexSearchState());

const matchingStrategyOptions = [
  { label: "Last", value: "last" },
  { label: "All", value: "all" },
  { label: "Frequency", value: "frequency" },
];

const searchParams = computed(() => {
  const compatParams = buildCompatibleSearchParams(
    savedSearchState.value,
    meiliCompat.value,
  );
  const params = {
    hitsPerPage: 50,
    query: savedSearchState.value.query || undefined,
    sortBy: savedSearchState.value.sort || undefined,
    page:
      savedSearchState.value.page !== undefined && savedSearchState.value.page >= 0
        ? savedSearchState.value.page
        : undefined,
    ...compatParams,
  };
  if (filterableAttributes.value.length > 0) {
    params.facets = filterableAttributes.value;
  }
  return params;
});

const rebuildSearchClient = () => {
  const compatParams = buildCompatibleSearchParams(
    savedSearchState.value,
    meiliCompat.value,
  );
  const options = {
    placeholderSearch: true,
    keepZeroFacets: true,
    meiliSearchParams: {
      ...compatParams,
    },
    requestInit:
      meiliCompat.value.supportsSearchMetadataHeader &&
      savedSearchState.value.includeSearchMetadataHeader &&
      savedSearchState.value.searchMetadataHeaderValue
        ? {
            headers: {
              "Meili-Include-Metadata":
                savedSearchState.value.searchMetadataHeaderValue,
            },
          }
        : undefined,
  };

  searchClient.value = instantMeiliSearch(
    theSettings.indexUrl,
    theSettings.indexKey,
    options,
  ).searchClient;
};

const sanitizeSearchStateForCompat = () => {
  if (!meiliCompat.value.supportsFrequencyMatching) {
    if (savedSearchState.value.matchingStrategy === "frequency") {
      savedSearchState.value.matchingStrategy = "last";
    }
  }
  if (!meiliCompat.value.supportsDistinctQuery) {
    savedSearchState.value.distinct = "";
  }
  if (!meiliCompat.value.supportsRankingScoreThreshold) {
    savedSearchState.value.rankingScoreThreshold = null;
  }
  if (!meiliCompat.value.supportsSearchDiagnosticsFlags) {
    savedSearchState.value.showRankingScore = false;
    savedSearchState.value.showRankingScoreDetails = false;
    savedSearchState.value.showPerformanceDetails = false;
  }
  if (!meiliCompat.value.supportsSearchMetadataHeader) {
    savedSearchState.value.includeSearchMetadataHeader = false;
    savedSearchState.value.searchMetadataHeaderValue = "";
  }
  if (!meiliCompat.value.supportsHybrid) {
    savedSearchState.value.enableHybrid = false;
    savedSearchState.value.hybridEmbedder = "";
    savedSearchState.value.hybridSemanticRatio = null;
  }
};

const persistSearchState = () => {
  if (!currentIndex.value) return;
  theSettings.setIndexSearchState(currentIndex.value, {
    ...savedSearchState.value,
    filtersVisible: filtersVisible.value,
    filtersPanelWidth: filtersPanelWidth.value,
  });
};

const persistSearchStateAndRebuild = () => {
  persistSearchState();
  rebuildSearchClient();
};

const saveDisplaySettings = () => {
  theSettings.setIndexDisplaySettings(
    currentIndex.value,
    displaySettings.value,
  );
};

const onListFieldsChange = (nextFields) => {
  const previous = displaySettings.value.listFields || [];
  const appended = (nextFields || []).filter((field) => !previous.includes(field));
  displaySettings.value.listFields = [
    ...previous.filter((field) => (nextFields || []).includes(field)),
    ...appended,
  ];
  saveDisplaySettings();
};

const onListFieldsOrderChange = (nextFields) => {
  displaySettings.value.listFields = nextFields;
  saveDisplaySettings();
};

const resetListFields = () => {
  displaySettings.value.listFields = [];
  saveDisplaySettings();
};

const onFiltersPanelWidthChange = (width) => {
  filtersPanelWidth.value = width;
  if (!currentIndex.value) return;
  theSettings.setIndexSearchState(currentIndex.value, {
    ...theSettings.getIndexSearchState(currentIndex.value),
    filtersPanelWidth: width,
  });
};

const hasConfiguredEmbedders = computed(() => {
  const embedders = iSettings.value?.embedders;
  return !!(
    embedders &&
    typeof embedders === "object" &&
    Object.keys(embedders).length > 0
  );
});

const resolvedListFields = computed(() =>
  resolveListFields({
    displaySettings: displaySettings.value,
    indexSettings: iSettings.value,
    primaryKey: iPk.value,
    imageField: displaySettings.value.imageField,
    fieldDistributionKeys: fdRows.value.map((row) => row["Field Name"]),
  }),
);

const filterableAttributes = computed(() => {
  const cached =
    theSettings.getIndexSettingsCache(currentIndex.value) || iSettings.value;
  return resolveFilterableAttributes(cached, fieldsRows.value);
});

const syncIndexSettings = (settings) => {
  if (!settings || !currentIndex.value) return;
  theSettings.setIndexSettingsCache(currentIndex.value, settings);
  iSettings.value = { ...settings };
  buildSortByItems();
};

const onIndexSettingsUpdated = (settings) => {
  syncIndexSettings(settings);
};

const useAllItemFields = computed(() =>
  shouldUseAllItemFields({
    displaySettings: displaySettings.value,
    indexSettings: iSettings.value,
  }),
);

const listFieldsSourceLabel = computed(() =>
  getListFieldsSourceLabel({
    displaySettings: displaySettings.value,
    indexSettings: iSettings.value,
  }),
);

const buildSortByItems = () => {
  sortByItems.value = [
    {
      value: currentIndex.value,
      label: "Relevance",
    },
  ];
  for (const atString of iSettings.value.sortableAttributes || []) {
    if (!atString || atString === "*") continue;
    sortByItems.value.push({
      value: `${currentIndex.value}:${atString}:asc`,
      label: `${atString} asc`,
    });
    sortByItems.value.push({
      value: `${currentIndex.value}:${atString}:desc`,
      label: `${atString} desc`,
    });
  }
};

const loadFieldsMetadata = async () => {
  if (!meiliCompat.value.supportsFieldsMetadataEndpoint) {
    fieldsRows.value = [];
    return;
  }
  fieldsLoading.value = true;
  try {
    const fieldsResponse = await theSettings.rawRequest(
      `/indexes/${encodeURIComponent(currentIndex.value)}/fields`,
      {
        method: "POST",
        body: {
          offset: Math.max(Number(fieldsOffset.value) || 0, 0),
          limit: Math.min(Math.max(Number(fieldsLimit.value) || 100, 1), 1000),
        },
      },
    );
    fieldsRows.value = (fieldsResponse?.results || []).map((field) => ({
      field: field.name || field.field || field.id || "unknown",
      searchable: field.searchable ? "Yes" : "No",
      filterable: field.filterable ? "Yes" : "No",
      sortable: field.sortable ? "Yes" : "No",
    }));
  } catch (error) {
    // Keep index detail usable when /fields is unavailable or restricted.
    console.warn("Fields metadata unavailable:", error.message);
    fieldsRows.value = [];
    showError(`Failed to load fields metadata: ${error.message}`);
  } finally {
    fieldsLoading.value = false;
  }
};

const loadInstance = async () => {
  const mclient = theSettings.getIndexClient(currentIndex.value);
  try {
    const version = await theSettings.client.getVersion();
    meiliCompat.value = getCompatFeatures(version?.pkgVersion || "");
  } catch {
    // Conservative fallback for older/unknown servers.
    meiliCompat.value = getCompatFeatures("1.11.0");
  }
  iStats.value = await mclient.getStats();
  const settings = await mclient.getSettings();
  syncIndexSettings(settings);
  const fieldDistribution = iStats.value?.fieldDistribution || {};
  fdRows.value = Object.keys(fieldDistribution).map((key) => {
    return { "Field Name": key, Count: fieldDistribution[key] };
  });
  // Get primary key from indexes store (which has the correct primaryKey from getRawIndexes)
  iPk.value = await indexesStore.getPrimaryKey(currentIndex.value);
  await loadFieldsMetadata();

  // Load display settings for this index
  displaySettings.value = theSettings.getIndexDisplaySettings(
    currentIndex.value,
  );

  // Load saved search state for this index
  const savedState = theSettings.getIndexSearchState(currentIndex.value);
  savedSearchState.value = { ...savedState };
  sanitizeSearchStateForCompat();
  rebuildSearchClient();
  filtersVisible.value = savedState.filtersVisible ?? true;
  filtersPanelWidth.value = savedState.filtersPanelWidth ?? 320;
  // Initialize previous query to detect query changes
  previousQuery.value = savedState.query || "";
  // If there's no saved query, reset page to 0 (first page, 0-based)
  // Don't restore pagination for empty searches
  if (!savedState.query) {
    savedSearchState.value.page = 0;
  }

  // Build image field options from all fields
  imageFieldOptions.value = [
    "(none)",
    ...fdRows.value.map((row) => row["Field Name"]),
  ];
  listFieldOptions.value = fdRows.value.map((row) => row["Field Name"]);
};

const fetchDocumentsByIds = async () => {
  const ids = batchDocumentIdsInput.value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!ids.length) {
    showError("Enter at least one document ID.");
    return;
  }

  batchFetchLoading.value = true;
  try {
    const response = await theSettings.rawRequest(
      `/indexes/${encodeURIComponent(currentIndex.value)}/documents/fetch`,
      {
        method: "POST",
        body: { ids },
      },
    );
    const results = response?.results || [];
    batchFetchedRows.value = results.map((document) => ({
      id: document?.[iPk.value] ?? document?.id ?? "(missing-id)",
      document,
    }));
    if (!batchFetchedRows.value.length) {
      showError("No documents were returned for the provided IDs.");
      return;
    }
    showBatchFetchDialog.value = true;
    showSuccess(`Fetched ${batchFetchedRows.value.length} documents.`);
  } catch (error) {
    showError(`Failed to fetch documents by IDs: ${error.message}`);
  } finally {
    batchFetchLoading.value = false;
  }
};

const applyHybridPreset = (preset) => {
  if (!meiliCompat.value.supportsHybrid) {
    showError(
      `Hybrid presets require a newer server version (current: ${meiliCompat.value.versionString}).`,
    );
    return;
  }
  const presets = {
    keyword: { enableHybrid: true, hybridSemanticRatio: 0.2 },
    balanced: { enableHybrid: true, hybridSemanticRatio: 0.5 },
    semantic: { enableHybrid: true, hybridSemanticRatio: 0.8 },
  };
  const next = presets[preset];
  if (!next) return;
  savedSearchState.value = {
    ...savedSearchState.value,
    ...next,
    showRankingScore: true,
    showRankingScoreDetails: true,
    showPerformanceDetails: true,
  };
  persistSearchStateAndRebuild();
  showSuccess(`Applied ${preset} LLM demo preset.`);
};

// Handle search state changes from persistence component
const handleSearchStateChange = (state) => {
  // If query changed, reset page to 0 (first page, 0-based)
  if (state.query !== previousQuery.value) {
    state.page = 0;
    previousQuery.value = state.query;
  }

  // Update local state
  savedSearchState.value = {
    ...savedSearchState.value,
    ...state,
  };
  persistSearchState();
};

// Watch filtersVisible to save it for the current index
watch(filtersVisible, () => {
  if (currentIndex.value) {
    persistSearchState();
  }
});

watch(
  () => savedSearchState.value.filterDensity,
  () => {
    persistSearchState();
  },
);

// Watch route params to handle navigation between indices
watch(
  () => route.params.uid,
  async (newIndexUid, oldIndexUid) => {
    // Save filtersVisible for the old index BEFORE loading the new one
    if (oldIndexUid && previousIndex.value === oldIndexUid) {
      const oldState = theSettings.getIndexSearchState(oldIndexUid);
      theSettings.setIndexSearchState(oldIndexUid, {
        ...oldState,
        filtersVisible: filtersVisible.value,
        filtersPanelWidth: filtersPanelWidth.value,
      });
    }

    // Update currentIndex and previousIndex
    if (newIndexUid) {
      previousIndex.value = newIndexUid;
      currentIndex.value = newIndexUid;
      await loadInstance();
    }
  },
  { immediate: false },
);

onMounted(async () => {
  currentIndex.value = route.params.uid;
  previousIndex.value = currentIndex.value;
  await loadInstance();
  if (!searchClient.value) {
    rebuildSearchClient();
  }

  // Set up watchers for search state after component is mounted
  await nextTick();
});

watch(
  () => ({
    rankingScoreThreshold: savedSearchState.value.rankingScoreThreshold,
    matchingStrategy: savedSearchState.value.matchingStrategy,
    distinct: savedSearchState.value.distinct,
    showRankingScore: savedSearchState.value.showRankingScore,
    showRankingScoreDetails: savedSearchState.value.showRankingScoreDetails,
    showPerformanceDetails: savedSearchState.value.showPerformanceDetails,
    includeSearchMetadataHeader:
      savedSearchState.value.includeSearchMetadataHeader,
    searchMetadataHeaderValue: savedSearchState.value.searchMetadataHeaderValue,
    enableHybrid: savedSearchState.value.enableHybrid,
    hybridEmbedder: savedSearchState.value.hybridEmbedder,
    hybridSemanticRatio: savedSearchState.value.hybridSemanticRatio,
    filterDensity: savedSearchState.value.filterDensity,
  }),
  () => {
    persistSearchStateAndRebuild();
  },
  { deep: true },
);
</script>

<style scoped>
.documents-splitter {
  min-height: calc(100vh - 320px);
}
</style>
