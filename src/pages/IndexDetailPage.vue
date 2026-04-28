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
          <SettingsForm></SettingsForm>
        </template>
      </IndexDetailTabs>
    </div>
    <div class="flex items-center justify-between mt-4 mb-3">
      <div class="flex items-center gap-4 flex-wrap">
        <span class="text-h6 w-full dark:text-white">Documents</span>
        <div class="flex items-center gap-2">
          <span class="text-caption text-gray-600 dark:text-gray-400 mr-1"
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
        <div class="flex items-center gap-2">
          <q-input
            v-model="batchDocumentIdsInput"
            dense
            outlined
            clearable
            class="w-80"
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
        </div>
      </div>
      <q-btn flat dense icon="add_circle" :to="`/documents/${currentIndex}/new`"
        >New</q-btn
      >
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
      <div class="flex gap-3">
        <!-- Filters Column with toggle -->
        <div v-if="filtersVisible" class="w-64 flex-shrink-0">
          <div class="sticky top-2">
            <q-card flat bordered>
              <q-card-section class="p-4">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-subtitle2 font-semibold dark:text-white"
                    >Filters</span
                  >
                  <div class="flex gap-2">
                    <AisClearButton label="Clear" />
                    <q-btn
                      flat
                      dense
                      size="sm"
                      icon="close"
                      class="dark:text-gray-300"
                      @click="filtersVisible = false"
                    />
                  </div>
                </div>

                <AisCurrentRefinements container-class="mb-3" chip-size="sm" />

                <div
                  v-if="
                    iSettings.filterableAttributes &&
                    iSettings.filterableAttributes.length > 0
                  "
                >
                  <q-separator class="my-4" />
                  <div
                    class="text-subtitle2 font-semibold mb-2 dark:text-white"
                  >
                    Filter By
                  </div>
                  <q-scroll-area
                    :thumb-style="{ width: '4px', opacity: 0.5 }"
                    style="height: calc(100vh - 300px)"
                  >
                    <q-list dense>
                      <q-expansion-item
                        v-for="att in iSettings.filterableAttributes"
                        :key="att"
                        :label="att"
                        dense
                        header-class="text-body2 dark:text-gray-200"
                        class="mb-2 rounded-md border border-gray-200 dark:border-gray-700"
                        :default-opened="false"
                      >
                        <template #header>
                          <q-item-section>
                            <div
                              class="flex items-center justify-between w-full"
                            >
                              <span class="text-sm dark:text-gray-200">{{
                                att
                              }}</span>
                              <q-badge
                                v-if="getActiveFilterCount(att) > 0"
                                :label="getActiveFilterCount(att)"
                                color="primary"
                                class="ml-2"
                              />
                            </div>
                          </q-item-section>
                        </template>
                        <AisRefinementList
                          :attribute="att"
                          :show-more="true"
                          :show-more-limit="50"
                          :density="savedSearchState.filterDensity"
                        />
                      </q-expansion-item>
                    </q-list>
                  </q-scroll-area>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Documents Column -->
        <div class="flex-1 min-w-0">
          <!-- Filter toggle button when hidden -->
          <div v-if="!filtersVisible" class="mb-4">
            <q-btn
              flat
              dense
              icon="filter_list"
              label="Show Filters"
              color="primary"
              @click="filtersVisible = true"
            />
          </div>

          <!-- Pagination at the top -->
          <div class="flex justify-center mb-4">
            <AisPaginationNav :padding="2" />
          </div>

          <ais-hits :escapeHTML="true">
            <template #default="{ items }">
              <div v-if="items.length === 0" class="text-center py-16">
                <q-icon
                  name="search_off"
                  size="48px"
                  class="text-gray-400 dark:text-gray-600"
                />
                <p class="text-subtitle1 text-gray-600 dark:text-gray-400 mt-4">
                  No documents found
                </p>
              </div>
              <div v-else class="flex flex-col gap-3">
                <q-card
                  v-for="item in items"
                  :key="getDocumentId(item)"
                  flat
                  bordered
                  class="cursor-pointer transition-colors hover:border-primary dark:hover:border-primary"
                >
                  <q-card-section class="p-4">
                    <div class="flex gap-3">
                      <!-- Optional Image -->
                      <div
                        v-if="
                          displaySettings.imageField &&
                          item[displaySettings.imageField]
                        "
                        class="flex-shrink-0"
                      >
                        <q-img
                          :src="item[displaySettings.imageField]"
                          :alt="getDocumentId(item)"
                          class="rounded"
                          style="width: 80px; height: 80px; object-fit: cover"
                          @error="(e) => (e.target.style.display = 'none')"
                        />
                      </div>

                      <!-- Content -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-2">
                          <span
                            class="font-semibold text-sm truncate dark:text-white"
                            >{{ getDocumentId(item) }}</span
                          >
                          <q-btn
                            flat
                            dense
                            size="sm"
                            icon="edit"
                            color="primary"
                            :to="`/documents/${currentIndex}/${getDocumentId(item)}`"
                          />
                          <q-btn
                            v-if="
                              meiliCompat.supportsSimilarEndpoint &&
                              hasConfiguredEmbedders
                            "
                            flat
                            dense
                            size="sm"
                            icon="hub"
                            color="secondary"
                            :to="`/similar/${currentIndex}/${getDocumentId(item)}`"
                          />
                        </div>

                        <!-- Compact field display - 2 columns -->
                        <div class="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                          <template
                            v-for="field in Object.keys(item)
                              .filter((i) => {
                                return (
                                  !String(i).startsWith('_') &&
                                  !String(i).startsWith('__') &&
                                  i !== iPk &&
                                  i !== displaySettings.imageField &&
                                  i
                                );
                              })
                              .slice(0, 8)"
                            :key="field"
                          >
                            <div class="truncate">
                              <span class="text-gray-600 dark:text-gray-400"
                                >{{ field }}:</span
                              >
                              <span class="ml-1 dark:text-gray-200">
                                {{
                                  typeof item[field] === "object"
                                    ? JSON.stringify(item[field])
                                    : item[field]
                                }}
                              </span>
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </template>
          </ais-hits>
        </div>
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
  </q-page>
</template>

<script setup>
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { useSettingsStore } from "src/stores/settings-store";
import { useIndexesStore } from "src/stores/indexes-store";
import {
  normalizeThreshold,
  getDefaultIndexSearchState,
} from "src/utils/search-utils";
import {
  getCompatFeatures,
  buildCompatibleSearchParams,
} from "src/utils/meili-compat";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import IndexDetailTabs from "components/IndexDetailTabs.vue";
import SettingsForm from "components/SettingsForm.vue";
import AisClearButton from "components/aisComponents/AisClearButton.vue";
import AisCurrentRefinements from "components/aisComponents/AisCurrentRefinements.vue";
import AisRefinementList from "components/aisComponents/AisRefinementList.vue";
import AisPaginationNav from "components/aisComponents/AisPaginationNav.vue";
import AisSearchDiagnostics from "components/aisComponents/AisSearchDiagnostics.vue";
import SearchStatePersistence from "components/SearchStatePersistence.vue";
import SearchExperiencePanel from "components/SearchExperiencePanel.vue";
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
const displaySettings = ref({ imageField: null });
const imageFieldOptions = ref([]);
const filtersVisible = ref(true);
const activeFilters = ref({});
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
  return params;
});

const rebuildSearchClient = () => {
  const compatParams = buildCompatibleSearchParams(
    savedSearchState.value,
    meiliCompat.value,
  );
  const options = {
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

// Helper to get count of active filters for an attribute
const getActiveFilterCount = (attribute) => {
  return activeFilters.value[attribute] || 0;
};

// Helper to safely get the document ID from a search result item
const getDocumentId = (item) => {
  if (!item || !iPk.value) return undefined;
  // Try to get the primary key value
  const id = item[iPk.value];
  // If not found, try common fallbacks (shouldn't happen, but defensive)
  if (id === undefined || id === null) {
    // Try 'id' as fallback
    return item.id;
  }
  return id;
};

const hasConfiguredEmbedders = computed(() => {
  const embedders = iSettings.value?.embedders;
  return !!(
    embedders &&
    typeof embedders === "object" &&
    Object.keys(embedders).length > 0
  );
});

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
  iSettings.value = await mclient.getSettings();
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

  // Build sort by items (no default relevance option - just sortable attributes)
  sortByItems.value = [
    {
      value: currentIndex.value,
      label: "Relevance",
    },
  ];
  for (const atString of iSettings.value.sortableAttributes || []) {
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
    const currentState = theSettings.getIndexSearchState(currentIndex.value);
    savedSearchState.value = {
      ...savedSearchState.value,
      ...currentState,
      filtersVisible: filtersVisible.value,
    };
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
