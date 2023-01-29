<template>
  <q-page padding>
    <div class="q-pa-md row items-start q-gutter-md">
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
    </div>
    <div class="text-center">
      <p class="strong">Documents in this Index</p>
    </div>
    <ais-instant-search
      :search-client="searchClient"
      :index-name="currentIndex"
    >
      <ais-search-box />

      <ais-hits>
        <template v-slot:item="{ item }">
          <q-card flat bordered class="col overflow-auto">
            <q-card-section class="">
              <div class="hit-name text-center">
                <ais-highlight :hit="item" attribute="name" />
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
                          !String(i).startsWith('__')
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

const theSettings = useSettingsStore();
const { indexUrl, indexKey, currentIndex } = storeToRefs(theSettings);

const iStats = ref({});
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
  const mclient = meiliClient.index(route.params.uid);
  iStats.value = await mclient.getStats();
  fdRows.value = Object.keys(iStats.value.fieldDistribution).map((key) => {
    return { "Field Name": key, Count: iStats.value.fieldDistribution[key] };
  });
  iPk.value = await mclient.fetchPrimaryKey();
});
</script>
