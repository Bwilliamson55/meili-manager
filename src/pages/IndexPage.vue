<template>
  <q-page>
    <div class="row justify-center">
      <div class="col-xs-12 col-md-8">
        <div v-if="confirmed" class="q-mt-sm">
          <q-list bordered class="rounded-borders">
            <q-item>
              <q-item-section top
                ><q-item-label header>Your Indexes</q-item-label>
              </q-item-section>
              <q-item-section top side
                ><q-btn icon="add_box" name="newIndex"></q-btn></q-item-section
            ></q-item>
            <div
              v-for="index in indexList"
              :key="index.id"
              class="q-pa-md q-gutter-md"
            >
              <q-item>
                <q-item-section top>
                  <q-item-label lines="1">
                    <span class="text-weight-medium">{{ index.uid }}</span>
                  </q-item-label>
                  <q-item-label caption lines="1">
                    Created:
                    {{ formatDate(index.createdAt) }} / Updated:
                    {{ formatDate(index.updatedAt) }}
                  </q-item-label>
                  <q-item-label
                    lines="1"
                    class="q-mt-xs text-body2 text-weight-bold text-primary text-uppercase"
                  >
                    <q-btn
                      flat
                      :to="`/index-details/${index.uid}`"
                      class="cursor-pointer q-pl-none"
                      >Show Me</q-btn
                    >
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
const { indexUrl, indexKey, confirmed, currentIndex } =
  storeToRefs(theSettings);
const indexList = ref([]);
const formatDate = (dateString) =>
  new Intl.DateTimeFormat("default", { dateStyle: "long" }).format(
    new Date(dateString)
  );
onMounted(async () => {
  if (confirmed) {
    const client = new MeiliSearch({
      host: indexUrl.value,
      apiKey: indexKey.value,
    });
    const indexes = await client.getRawIndexes();
    indexList.value = indexes.results;
  }
});
</script>
