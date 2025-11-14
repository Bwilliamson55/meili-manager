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
      <div class="flex items-center gap-4">
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
      </div>
      <q-btn flat dense icon="add_circle" :to="`/documents/${currentIndex}/new`"
        >New</q-btn
      >
    </div>
    <ais-instant-search
      v-if="iPk"
      :search-client="searchClient"
      :index-name="currentIndex"
    >
      <q-card flat bordered class="mb-4">
        <q-card-section class="p-4">
          <div class="flex items-center gap-4">
            <AisStatsDisplay />
            <div class="flex gap-3 flex-1">
              <AisSearchInput placeholder="Search documents..." />
              <AisSortBySelect :items="sortByItems" />
            </div>
          </div>
        </q-card-section>
      </q-card>
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

                <AisCurrentRefinements />

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
                        class="mb-1"
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
                  :key="item[iPk]"
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
                          :alt="item[iPk]"
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
                            >{{ item[iPk] }}</span
                          >
                          <q-btn
                            flat
                            dense
                            size="sm"
                            icon="edit"
                            color="primary"
                            :to="`/documents/${currentIndex}/${item[iPk]}`"
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
          <div class="flex justify-center mt-8">
            <AisPaginationNav :padding="2" />
          </div>
        </div>
      </div>
      <ais-configure :hits-per-page="50" />
    </ais-instant-search>
  </q-page>
</template>

<script setup>
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import IndexDetailTabs from "components/IndexDetailTabs.vue";
import SettingsForm from "components/SettingsForm.vue";
import AisSearchInput from "components/aisComponents/AisSearchInput.vue";
import AisStatsDisplay from "components/aisComponents/AisStatsDisplay.vue";
import AisSortBySelect from "components/aisComponents/AisSortBySelect.vue";
import AisClearButton from "components/aisComponents/AisClearButton.vue";
import AisCurrentRefinements from "components/aisComponents/AisCurrentRefinements.vue";
import AisRefinementList from "components/aisComponents/AisRefinementList.vue";
import AisPaginationNav from "components/aisComponents/AisPaginationNav.vue";

const $q = useQuasar();

const theSettings = useSettingsStore();
const { indexUrl, indexKey, currentIndex } = storeToRefs(theSettings);
const iStats = ref({});
const iSettings = ref({});
const sortByItems = ref([]);
const iPk = ref("");
const searchClient = instantMeiliSearch(
  indexUrl.value,
  indexKey.value,
).searchClient;
const fdRows = ref([]);
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
const displaySettings = ref({ imageField: null });
const imageFieldOptions = ref([]);
const filtersVisible = ref(true);
const activeFilters = ref({});

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

const loadInstance = async () => {
  const mclient = theSettings.getIndexClient(currentIndex.value);
  iStats.value = await mclient.getStats();
  iSettings.value = await mclient.getSettings();
  fdRows.value = Object.keys(iStats.value.fieldDistribution).map((key) => {
    return { "Field Name": key, Count: iStats.value.fieldDistribution[key] };
  });
  iPk.value = await mclient.fetchPrimaryKey();

  // Load display settings for this index
  displaySettings.value = theSettings.getIndexDisplaySettings(
    currentIndex.value,
  );

  // Build image field options from all fields
  imageFieldOptions.value = [
    "(none)",
    ...fdRows.value.map((row) => row["Field Name"]),
  ];

  for (const atString of iSettings.value.sortableAttributes) {
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

onMounted(async () => {
  const route = useRoute();
  currentIndex.value = route.params.uid;
  loadInstance();
});
</script>
