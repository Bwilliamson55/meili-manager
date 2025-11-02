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
        <span class="text-h6 w-full">Documents</span>
        <div class="flex items-center gap-2">
          <span class="text-caption text-grey-7 mr-1">Show thumbnails:</span>
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
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="q-pa-md">
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
              <q-card-section class="q-pa-md">
                <div class="flex items-center justify-between q-mb-md">
                  <span class="text-subtitle2 font-semibold">Filters</span>
                  <div class="flex gap-2">
                    <AisClearButton label="Clear" />
                    <q-btn
                      flat
                      dense
                      size="sm"
                      icon="close"
                      @click="(filtersVisible = false)"
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
                  <q-separator class="q-my-md" />
                  <div class="text-subtitle2 font-semibold q-mb-sm">
                    Filter By
                  </div>
                  <q-list dense>
                    <q-expansion-item
                      v-for="att in iSettings.filterableAttributes"
                      :key="att"
                      :label="att"
                      dense
                      header-class="text-body2"
                      class="q-mb-xs"
                    >
                      <AisRefinementList
                        :attribute="att"
                        :show-more-limit="50"
                      />
                    </q-expansion-item>
                  </q-list>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Documents Column -->
        <div class="flex-1 min-w-0">
          <!-- Filter toggle button when hidden -->
          <div v-if="!filtersVisible" class="q-mb-md">
            <q-btn
              flat
              dense
              icon="filter_list"
              label="Show Filters"
              color="primary"
              @click="(filtersVisible = true)"
            />
          </div>

          <ais-hits :escapeHTML="true">
            <template #default="{ items }">
              <div v-if="items.length === 0" class="text-center q-py-xl">
                <q-icon name="search_off" size="48px" color="grey-5" />
                <p class="text-subtitle1 text-grey-7 q-mt-md">
                  No documents found
                </p>
              </div>
              <div v-else class="flex flex-col gap-3">
                <q-card
                  v-for="item in items"
                  :key="item[iPk]"
                  flat
                  bordered
                  class="cursor-pointer transition-colors"
                >
                  <q-card-section class="q-pa-md">
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
                        <div class="flex items-center justify-between q-mb-sm">
                          <span class="font-semibold text-sm truncate">{{
                            item[iPk]
                          }}</span>
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
                              <span class="text-grey-7">{{ field }}:</span>
                              <span class="ml-1">
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
          <div class="flex justify-center q-mt-lg">
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

const saveDisplaySettings = () => {
  theSettings.setIndexDisplaySettings(
    currentIndex.value,
    displaySettings.value,
  );
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
