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
    <div class="text-center row">
      <span class="col-12 q-py-auto q-my-auto q-mx-auto"
        >Documents in this Index</span
      >
      <q-btn
        flat
        icon="add_circle"
        :to="`/documents/${currentIndex}/new`"
        class="cursor-pointer q-py-auto q-my-auto q-ml-auto"
        >New</q-btn
      >
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
        <div class="col-12 col-md-3">
          <div class="row">
            <div class="col text-center q-mx-auto">
              Current Refinements --
              <ais-clear-refinements class="inline-block q-my-sm" />
              <ais-current-refinements
                :class-names="{
                  'ais-CurrentRefinements': 'flex wrap',
                  'ais-CurrentRefinements-list': 'block row',
                  'ais-CurrentRefinements-item':
                    'flex row full-width wrap q-ma-xs',
                  'ais-CurrentRefinements-label': 'text-bold q-mr-xs',
                  'ais-CurrentRefinements-category':
                    'col-12 q-mx-xs q-pt-xs text-left',
                }"
                style="width: 100%"
              />
            </div>
          </div>
          <hr />
          <div
            class="row q-pa-sm"
            v-if="iSettings.filterableAttributes.length > 0"
          >
            <q-expansion-item
              v-model="filtersExpanded"
              icon="filter_alt"
              label="Filters"
              class="col-12 text-center text-blue q-my-xs"
            >
              <q-card
                dense
                v-for="att in iSettings.filterableAttributes"
                :key="att"
                class="col-12 q-pa-sm q-mt-sm"
              >
                <ais-panel
                  :class-names="{
                    'ais-Panel': 'no-margin',
                    // 'ais-Panel-body': 'MyCustomPanelBody',
                  }"
                >
                  <template #header="{ hasRefinements }">
                    <p>
                      {{ att
                      }}<span v-if="!hasRefinements"> (no results) </span>
                    </p>
                  </template>
                  <template #default>
                    <ais-refinement-list
                      :attribute="att"
                      show-more
                      :show-more-limit="1000"
                    />
                  </template>
                </ais-panel>
              </q-card>
            </q-expansion-item>
          </div>
        </div>
        <div class="col-12 col-md-9">
          <ais-infinite-hits :escapeHTML="true">
            <template #item="{ item }">
              <q-card flat bordered class="col overflow-auto">
                <q-card-section>
                  <div class="hit-name text-center row">
                    <ais-highlight
                      :hit="item"
                      :attribute="docNameFieldChoice"
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
                    <q-select
                      v-model="docNameFieldChoice"
                      :options="attributeCodes"
                      label="Heading Attribute"
                      width-full
                    ></q-select>
                    <q-select
                      v-model="imgFieldSelectChoice"
                      :options="attributeCodes"
                      label="Attribute for Image"
                      width-full
                    ></q-select>
                    <q-img
                      width-full
                      class="q-ma-sm"
                      :src="
                        item[imgFieldSelectChoice] ??
                        item.picture_url ??
                        item.image ??
                        item.image_url
                      "
                      :alt="
                        item[imgFieldSelectChoice] ??
                        item.picture_url ??
                        item.image ??
                        item.image_url
                      "
                    />
                  </q-card-section>
                  <q-card-section class="col-xs-12 col-sm-8 col-lg-10">
                    <span class="text-center text-italic row"
                      >Displayed attributes</span
                    >
                    <div v-show="item.description" class="hit-description">
                      <ais-snippet :hit="item" attribute="description" />
                    </div>
                    <q-list
                      bordered
                      separator
                      style="max-height: 30vh; overflow-y: scroll"
                    >
                      <template
                        v-for="field in Object.keys(item)
                          .filter((i) => {
                            return (
                              !String(i).startsWith('_') &&
                              !String(i).startsWith('__') && // make sure there's a value and it's not a system value
                              i
                            );
                          })
                          .map((k) => {
                            return {
                              fieldName: k,
                              fieldValue:
                                typeof item[k] == 'object'
                                  ? JSON.stringify(item[k], null, 2) // make the json pretty plz
                                  : item[k],
                            };
                          })"
                        :key="field.fieldName"
                      >
                        <q-item>
                          <q-item-section>
                            <q-item-label overline>{{
                              field.fieldName
                            }}</q-item-label>
                            <q-item-label>
                              {{ field.fieldValue }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-card-section>
                </div>
              </q-card>
            </template>
          </ais-infinite-hits>
        </div>
      </div>
      <ais-configure
        :attributesToSnippet="['description:50']"
        :hits-per-page="10"
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
const searchClient = instantMeiliSearch(indexUrl.value, indexKey.value).searchClient;
const fdRows = ref([]);
const imgFieldSelectChoice = ref("");
const docNameFieldChoice = ref("");
const attributeCodes = ref([]);
const filtersExpanded = ref(true);

const loadInstance = async () => {
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
  attributeCodes.value = fdRows.value.map((row) => row["Field Name"]); // use the stats table for attribute codes
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
