<template>
  <q-page padding>
    <div class="q-pa-md row items-start q-gutter-md full-width">
      <IndexDetailTabs>
        <template #overview-tab>
          <q-card class="col" flat bordered>
            <q-card-section>
              <q-card-section>
                <div v-if="iStats && iPk" class="flex justify-around">
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
                <div v-if="iStats && iPk" class="flex">
                  <div class="full-width text-center">
                    <p>Field Distribution</p>
                  </div>
                  <div class="q-px-md q-mx-auto col">
                    <q-table
                      dense
                      :rows="fdRows"
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
    <div class="text-center">
      <p class="strong">Documents in this Index</p>
    </div>
    <ais-instant-search
      v-if="iPk"
      :search-client="searchClient"
      :index-name="currentIndex"
    >
      <p class="text-center">Stats: <ais-stats /></p>
      <div class="row justify-evenly q-mx-sm">
        <div class="col-12 col-sm-5">
          <p class="text-center text-blue q-my-sm">Search Query</p>
          <ais-search-box />
        </div>
        <div class="col-12 col-sm-5">
          <p class="text-center text-blue q-my-sm">Sort Options</p>
          <ais-sort-by v-if="sortByItems" :items="sortByItems" />
        </div>
      </div>
      <hr />
      <div class="row">
        <div class="col text-center">
          Current Refinements
          <ais-current-refinements />
        </div>
      </div>
      <hr />
      <template v-if="iSettings.filterableAttributes.length">
        <div class="row">
          <p class="col text-center text-blue q-my-sm">Filters</p>
          <template v-for="att in iSettings.filterableAttributes" :key="att">
            <q-card class="col-12 col-sm-6 col-md-4 col-xl-3 q-pa-sm">
              {{ att }}
              <ais-refinement-list :attribute="att" /></q-card
          ></template></div
      ></template>
      <ais-hits>
        <template v-slot:item="{ item }">
          <q-card flat bordered class="col overflow-auto">
            <q-card-section class="">
              <div class="hit-name text-center row">
                <ais-highlight
                  :hit="item"
                  attribute="name"
                  class="col q-py-auto q-my-auto"
                />
                <q-btn
                  flat
                  icon="edit"
                  :to="`/documents/${currentIndex}/${item[iPk]}`"
                  class="float-right cursor-pointer q-py-auto q-my-auto"
                  >Edit</q-btn
                >
              </div>
            </q-card-section>
            <q-separator horizontal />
            <div class="row wrap">
              <q-card-section class="col">
                <q-img
                  width-full
                  class="q-ma-sm"
                  :src="item.picture_url ?? item.image ?? item.image_url"
                  :alt="item.picture_url ?? item.image ?? item.image_url"
                />
              </q-card-section>
              <q-card-section class="col-xs-12 col-sm-8 col-lg-10">
                <div v-show="item.description" class="hit-description">
                  <ais-snippet :hit="item" attribute="description" />
                </div>
                <q-table
                  style="max-height: 400px"
                  virtual-scroll
                  :rows="
                    Object.keys(item)
                      .filter((i) => {
                        return (
                          !String(i).startsWith('_') &&
                          !String(i).startsWith('__') &&
                          i
                        );
                      })
                      .map((k) => {
                        return {
                          Field: k,
                          Value:
                            typeof item[k] == 'object'
                              ? JSON.stringify(item[k], null, 2)
                              : item[k],
                        };
                      })
                  "
                  :columns="itemColumns"
                  :rows-per-page-options="[0]"
                  :hide-pagination="true"
                  row-key="Field"
                  dense
                  flat
                  bordered
                />
              </q-card-section>
            </div>
          </q-card>
        </template>
      </ais-hits>
      <ais-configure
        :attributesToSnippet="['description:50']"
        snippetEllipsisText="…"
      />
    </ais-instant-search>
  </q-page>
</template>

<script setup>
import { MeiliSearch } from "meilisearch";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";
import IndexDetailTabs from "components/IndexDetailTabs.vue";
import SettingsForm from "components/SettingsForm.vue";

const $q = useQuasar();

const theSettings = useSettingsStore();
const { indexUrl, indexKey, currentIndex } = storeToRefs(theSettings);
const iStats = ref({});
const iSettings = ref({});
const sortByItems = ref([]);
const iPk = ref("");
const searchClient = instantMeiliSearch(indexUrl.value, indexKey.value);
const fdRows = ref([]);
const itemColumns = [
  {
    name: "Field",
    label: "Field",
    field: "Field",
    align: "Left",
    sortable: "True",
  },
  {
    name: "Value",
    label: "Value",
    field: "Value",
    align: "Left",
    sortable: "True",
  },
];
onMounted(async () => {
  const route = useRoute();
  currentIndex.value = route.params.uid;
  const meiliClient = new MeiliSearch({
    host: indexUrl.value,
    apiKey: indexKey.value,
  });
  const mclient = meiliClient.index(currentIndex.value);
  iStats.value = await mclient.getStats();
  iSettings.value = await mclient.getSettings();
  fdRows.value = Object.keys(iStats.value.fieldDistribution).map((key) => {
    return { "Field Name": key, Count: iStats.value.fieldDistribution[key] };
  });
  iPk.value = await mclient.fetchPrimaryKey();

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
});
</script>
