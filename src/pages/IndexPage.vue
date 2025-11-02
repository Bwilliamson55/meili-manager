<template>
  <q-page>
    <div class="row justify-center">
      <div class="col-xs-12 col-md-8">
        <div v-if="confirmed" class="q-mt-sm">
          <q-item>
            <q-item-section top
              ><q-item-label header class="text-bold"
                >This Instance: {{ indexUrl }}</q-item-label
              >
            </q-item-section>
            <q-item-section top side
              ><q-btn
                icon="download"
                name="createDump"
                label="Create Dump"
                @click="createDump"
              ></q-btn></q-item-section
          ></q-item>
          <q-list bordered class="rounded-borders">
            <q-item>
              <q-item-section top
                ><q-item-label header>This instances Indexes</q-item-label>
              </q-item-section>
              <q-item-section top side
                ><q-btn
                  icon="add_box"
                  name="newIndex"
                  label="New Index"
                  @click="(prompt = true)"
                ></q-btn></q-item-section
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
                      @click="delIndex(index.uid)"
                    />
                  </div>
                </q-item-section>
              </q-item>

              <q-separator spaced />
            </div>
          </q-list>
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
    <q-dialog v-model="prompt" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <p>
            Index Name
            <q-input class="q-pt-none" dense v-model="newIndexName" autofocus />
          </p>
        </q-card-section>
        <q-card-section>
          <p>
            Index Primary Key (Optional)
            <q-input dense v-model="newIndexUuid" autofocus />
          </p>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn @click="newIndex" flat label="Add Index" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="delPrompt" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="primary" text-color="white" />
          <span class="q-ml-sm"
            >Are you REALLY sure you want to delete this index?</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            @click="delIndex"
            flat
            label="Delete Index"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { ref, onMounted, watch } from "vue";
import { MeiliSearch } from "meilisearch";
import {
  showSuccess,
  showError,
  showConfirmation,
} from "src/utils/notifications";

const prompt = ref(false);
const delPrompt = ref(false);
const newIndexName = ref("");
const newIndexUuid = ref("");
const theSettings = useSettingsStore();
const { indexUrl, indexKey, confirmed, currentIndex, currentInstance } =
  storeToRefs(theSettings);
const indexList = ref([]);

const formatDate = (dateString) =>
  new Intl.DateTimeFormat("default", { dateStyle: "long" }).format(
    new Date(dateString),
  );

const getClient = async () => {
  try {
    return await theSettings.getMeiliClient();
  } catch (error) {
    showError(`Connection failed: ${error.message}`);
    throw error;
  }
};

watch(currentInstance, async () => {
  await loadInstance();
});

const loadInstance = async () => {
  try {
    const client = await getClient();
    const indexes = await client.getRawIndexes();
    indexList.value = indexes.results;
  } catch (e) {
    console.log(e);
    indexList.value = [];
  }
};

onMounted(async () => {
  if (confirmed) {
    loadInstance();
  }
});

const newIndex = async () => {
  try {
    const client = await getClient();
    await client.createIndex(newIndexName.value, {
      primaryKey: newIndexUuid.value,
    });

    showSuccess("Index Created");

    const indexes = await client.getRawIndexes();
    indexList.value = indexes.results;
  } catch (error) {
    console.log(error);
    showError(`Sorry there was an error: ${error.toString()}`);
  }
};
const createDump = async () => {
  showConfirmation(`Create dump of ${indexUrl.value}?`, async () => {
    try {
      const client = await getClient();
      const response = await client.createDump();

      showSuccess(
        `Dump task created successfully:\nEnqueued: ${response.enqueuedAt}\nTask ID: ${response.taskUid}\nStatus: ${response.status}`,
      );
    } catch (error) {
      console.log(error);
      showError(`Sorry there was an error: ${error.toString()}`);
    }
  });
};
const delIndex = async (indexUidString) => {
  showConfirmation(`Really delete ${indexUidString}?`, async () => {
    try {
      const client = await getClient();
      await client.deleteIndex(indexUidString);
      const indexes = await client.getRawIndexes();
      indexList.value = indexes.results;
    } catch (error) {
      console.log(error);
      showError(`Sorry there was an error: ${error.toString()}`);
    }
  });
};
</script>
