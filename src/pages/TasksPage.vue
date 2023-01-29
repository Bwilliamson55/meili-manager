<template>
  <q-page padding>
    <div class="q-pa-xs row items-start q-gutter-xs">
      <q-card class="col" flat bordered>
        <q-card-section class="full-width">
          <div class="text-center">
            <p>All Tasks</p>
          </div>
          <q-table
            title="All Tasks"
            style="max-height: 100vh"
            virtual-scroll
            :rows="iTasks.results"
            :rows-per-page-options="[10, 20, 50, 0]"
            :filter="filter"
            row-key="uid"
            dense
            flat
            bordered
          >
            <template v-slot:top-right>
              <q-input
                borderless
                dense
                debounce="300"
                v-model="filter"
                placeholder="Search"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { MeiliSearch } from "meilisearch";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";

const theSettings = useSettingsStore();
const { indexUrl, indexKey } = storeToRefs(theSettings);
const filter = ref("");
const iTasks = ref({});
onMounted(async () => {
  const meiliClient = new MeiliSearch({
    host: indexUrl.value,
    apiKey: indexKey.value,
  });
  iTasks.value = await meiliClient.getTasks({ limit: 1000 });
});
</script>
