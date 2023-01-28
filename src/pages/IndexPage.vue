<template>
  <q-page class="flex justify-center">
    <div class="row full-width">
      <div class="col q-gutter-none text-center">
        <div v-if="confirmed" class="q-mt-sm">
          <q-list bordered class="rounded-borders">
            <q-item-label header class="rounded-borders"
              >Your Indexes</q-item-label
            >
            <div
              v-for="index in indexList"
              :key="index.id"
              class="q-pa-md q-gutter-md"
            >
              <q-item>
                <q-item-section avatar top>
                  <q-icon name="list" color="black" size="34px" />
                </q-item-section>

                <q-item-section top>
                  <q-item-label lines="1">
                    <span class="text-weight-medium">{{ index.uid }}</span>
                  </q-item-label>
                  <q-item-label caption lines="1">
                    @rstoenescu in #3: > Generic type parameter for props
                  </q-item-label>
                  <q-item-label
                    lines="1"
                    class="q-mt-xs text-body2 text-weight-bold text-primary text-uppercase"
                  >
                    <span class="cursor-pointer">Show Me</span>
                  </q-item-label>
                </q-item-section>

                <q-item-section top side>
                  <div class="text-grey-8 q-gutter-xs">
                    <q-btn
                      class="gt-xs"
                      size="12px"
                      flat
                      dense
                      round
                      icon="delete"
                    />
                    <q-btn
                      class="gt-xs"
                      size="12px"
                      flat
                      dense
                      round
                      icon="done"
                    />
                    <q-btn size="12px" flat dense round icon="more_vert" />
                  </div>
                </q-item-section>
              </q-item>

              <q-separator spaced />
            </div>
          </q-list>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { MeiliSearch } from "meilisearch";

const theSettings = useSettingsStore();
const { indexUrl, indexKey, confirmed } = storeToRefs(theSettings);
const indexList = ref([]);
onMounted(async () => {
  if (confirmed) {
    const client = new MeiliSearch({
      host: indexUrl.value,
      apiKey: indexKey.value,
    });
    const indexes = await client.getRawIndexes();
    indexList.value = indexes.results;
    console.log(indexList);
  }
});
</script>
