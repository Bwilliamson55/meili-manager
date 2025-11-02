<template>
  <q-page>
    <div class="flex justify-center">
      <div class="col-12">
        <div v-if="searchClient" class="m-1">
          <ais-instant-search
            :search-client="searchClient"
            :index-name="previewCurrentIndex"
            class="row justify-center"
          >
            <ais-configure
              v-if="
                previewSettings.pagination && previewSettings.paginationSize
              "
              :hits-per-page.camel="previewSettings.paginationSize"
            />
            <div class="col col-12 col-sm-3">
              <span class="text-center">
                <ais-stats />
              </span>
              <div
                v-if="previewSettings.sortableAttributes?.length > 0"
                class="col-12"
              >
                <p class="text-center text-primary mb-0">Sort Options:</p>
                <ais-sort-by :items="sortByItems" />
              </div>
              <q-expansion-item
                v-model="filtersExpanded"
                icon="list"
                label="Filters"
              >
                <span class="bg-warning text-black p-1"
                  >Warning - Experimental</span
                >
                <q-card
                  dense
                  v-for="att in filters"
                  :key="att"
                  class="col-12 p-2 mt-2"
                >
                  <ais-panel
                    :class-names="{
                      'ais-Panel': 'no-margin',
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
            <div class="col col-12 col-sm-8 mx-2 px-2">
              <ais-clear-refinements
                v-if="previewSettings.showClearRefinements"
              />
              <ais-current-refinements v-if="previewSettings.showRefinements" />
              <ais-search-box placeholder="Search here…" class="searchbox" />
              <component
                :is="
                  previewSettings.pagination ? 'ais-hits' : 'ais-infinite-hits'
                "
              >
                <template v-slot:item="{ item }">
                  <q-card class="result-card" flat bordered>
                    <q-carousel
                      v-if="previewSettings.imageAttributes.length > 0"
                      animated
                      v-model="slide"
                      navigation
                      infinite
                      :autoplay="autoplay"
                      arrows
                      swipeable
                      transition-prev="slide-right"
                      transition-next="slide-left"
                      @mouseenter="(autoplay = false)"
                      @mouseleave="(autoplay = true)"
                    >
                      <template
                        :key="imgAttribute"
                        v-for="(
                          imgAttribute, i
                        ) in previewSettings.imageAttributes"
                      >
                        <q-carousel-slide
                          v-if="item[imgAttribute]"
                          :name="imgAttribute + i"
                          :img-src="item[imgAttribute]"
                      /></template>
                    </q-carousel>

                    <q-card-section>
                      <div
                        v-if="previewSettings.headingAttributes.length > 0"
                        class="text-h6"
                      >
                        <div
                          :key="headingAttribute"
                          v-for="headingAttribute in previewSettings.headingAttributes"
                          class="row"
                        >
                          <ais-highlight
                            :hit="item"
                            :attribute="headingAttribute"
                          />
                        </div>
                      </div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section
                      v-if="previewSettings.descriptionAttributes.length > 0"
                    >
                      <div
                        :key="descriptionAttribute"
                        v-for="descriptionAttribute in previewSettings.descriptionAttributes"
                        class="text-body2 shadow-1"
                      >
                        <ais-highlight
                          :hit="item"
                          :attribute="descriptionAttribute"
                          class="row"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </template>
              </component>
              <div
                v-if="previewSettings.pagination"
                class="pagination justify-center m-2 text-center flex"
              >
                <ais-pagination :padding="3" />
              </div>
            </div>
          </ais-instant-search>
        </div>
        <div v-else class="m-2">
          <q-card class="p-2">
            <q-card-section>
              <div class="text-h6">Preview</div>
              <div class="text-subtitle2">
                Please select an instance and index to preview
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn fab icon="keyboard_arrow_up" color="accent" />
      </q-page-scroller>
    </div>
  </q-page>
</template>

<script setup>
import { usePreviewStore } from "src/stores/preview-store";
import { instantMeiliSearch } from "@meilisearch/instant-meilisearch";
import { storeToRefs } from "pinia";
import { ref, watchEffect, computed } from "vue";

const autoplay = ref(false);
const filtersExpanded = ref(true);
const thePreviewSettings = usePreviewStore();
const {
  previewIndexUrl,
  previewIndexKey,
  previewCurrentIndex,
  previewSettings,
} = storeToRefs(thePreviewSettings);
const searchClient = ref(null);
searchClient.value = instantMeiliSearch(
  previewIndexUrl.value,
  previewIndexKey.value,
).searchClient;
const sortByItems = computed(() => {
  let items = [];
  previewSettings.value.sortableAttributes.forEach((att) => {
    items.push({
      value: `${previewCurrentIndex.value}:${att}:asc`,
      label: `${att} asc`,
    });
    items.push({
      value: `${previewCurrentIndex.value}:${att}:desc`,
      label: `${att} desc`,
    });
  });
  return items;
});

const filters = computed(() => {
  let filters = [];
  Object.keys(previewSettings.value.filters).forEach((key) => {
    if (previewSettings.value.filters[key]) {
      filters.push(key);
    }
  });
  return filters;
  //TODO: add filter object options and types - for now just the keys for refinement lists
});

watchEffect(() => {
  setTimeout(() => {
    searchClient.value = instantMeiliSearch(
      previewIndexUrl.value,
      previewIndexKey.value,
    ).searchClient;
  }, 500);
});

const formatDate = (dateString) =>
  new Intl.DateTimeFormat("default", { dateStyle: "long" }).format(
    new Date(dateString),
  );
</script>
