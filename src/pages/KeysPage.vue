<template>
  <q-page padding>
    <div class="q-pa-xs row items-start q-gutter-xs">
      <q-card class="col" flat bordered>
        <q-card-section class="full-width">
          <div class="text-center">
            <p>All Keys</p>
          </div>
          <div class="row">
            <div class="col">
              <q-expansion-item
                dense
                expand-separator
                icon="key"
                label="Raw Keys JSON"
                header-class="text-blue"
                class="q-my-auto"
              >
                <q-card bordered>
                  <q-card-section>
                    <p class="text-center">
                      The following is a real time look at your keys objects in
                      full.
                    </p>
                    <pre>{{ JSON.stringify(iKeys, null, 2) }}</pre>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="q-pa-xs row items-start q-gutter-xs">
      <q-card class="col" flat bordered>
        <q-card-section class="full-width">
          <div class="row">
            <div class="col">
              <q-expansion-item
                v-model="newKeyFormExpanded"
                expand-separator
                dense
                icon="key"
                label="New Key Form"
                header-class="text-blue"
                class="q-my-auto"
              >
                <q-card bordered>
                  <q-card-section>
                    <api-key-form @refresh="refresh" />
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="q-pa-xs row items-start q-gutter-xs">
      <template v-for="(key, i) in iKeys.results" :key="key.uid">
        <q-expansion-item
          expand-separator
          dense
          icon="key"
          :label="`${key.name} -- UID: ${key.uid}`"
          header-class="text-primary"
          class="q-mb-md col-12"
        >
          <q-card class="col q-pa-md" flat bordered>
            <p class="col text-center">
              <strong>{{ iKeys.results[i].name }}</strong>
            </p>
            <q-form @submit="onSubmit(i)" class="q-gutter-md">
              <q-input
                filled
                v-model="iKeys.results[i].name"
                label="The Keys name"
                hint="Something descriptive"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
              />
              <q-input
                filled
                v-model="iKeys.results[i].description"
                label="The Keys Description"
                hint="Something descriptive"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                ]"
              />

              <div class="flex justify-between">
                <q-btn
                  class="inline-block"
                  label="Save"
                  type="submit"
                  color="primary"
                />
                <q-btn
                  class="gt-xs inline-block"
                  size="14px"
                  flat
                  bordered
                  color="red"
                  icon="delete"
                  @click="delKey(key.uid)"
                />
              </div>
            </q-form>

            <q-separator spaced />
            <div class="row">
              <div class="col text-center">
                <p>
                  <strong>
                    The following key details can only be set at the time of
                    creation
                  </strong>
                </p>
              </div>
            </div>
            <q-input
              v-model="iKeys.results[i].key"
              filled
              readonly
              :type="iKeys.results[i].kKeyToggle ? 'text' : 'password'"
              hint="The Keys Key"
              label="The Keys key"
              class="q-my-sm"
            >
              <template v-slot:append>
                <q-icon
                  :name="
                    iKeys.results[i].kKeyToggle
                      ? 'visibility'
                      : 'visibility_off'
                  "
                  class="cursor-pointer"
                  @click="
                    iKeys.results[i].kKeyToggle = !iKeys.results[i].kKeyToggle
                  "
                />
              </template>
            </q-input>
            <q-input
              filled
              v-model="iKeys.results[i].uid"
              label="The Keys UID"
              hint="This is the id used when fetching a single key"
              class="q-my-sm"
            />
            <div class="row justify-evenly">
              <div
                class="bg-grey-2 q-pa-sm q-my-sm rounded-borders col-12 col-sm-5"
              >
                Granted Actions:
                <ul>
                  <template
                    v-for="action in iKeys.results[i].actions"
                    :key="action"
                  >
                    <li>{{ action }}</li>
                  </template>
                </ul>
              </div>
              <div
                class="bg-grey-2 q-pa-sm q-my-sm rounded-borders col-12 col-sm-5"
              >
                Granted Indexes:
                <ul>
                  <template v-for="idx in iKeys.results[i].indexes" :key="idx">
                    <li>{{ idx }}</li>
                  </template>
                </ul>
              </div>
            </div>
            <div class="col text-center">
              <p>
                <strong>Created At</strong> - {{ iKeys.results[i].createdAt }}
              </p>
              <p>
                <strong>Updated At</strong> - {{ iKeys.results[i].updatedAt }}
              </p>
              <p>
                <strong>Expires At</strong> - {{ iKeys.results[i].expiresAt }}
              </p>
            </div>
          </q-card>
        </q-expansion-item>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { MeiliSearch } from "meilisearch";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import ApiKeyForm from "src/components/ApiKeyForm.vue";

const $q = useQuasar();
const theSettings = useSettingsStore();
const { indexUrl, indexKey } = storeToRefs(theSettings);
const iKeys = ref({});
const newKeyFormExpanded = ref(false);
const getClient = () =>
  new MeiliSearch({
    host: indexUrl.value,
    apiKey: indexKey.value,
  });
const refresh = async () => {
  const meiliClient = getClient();
  iKeys.value = await meiliClient.getKeys();
  newKeyFormExpanded.value = false;
};
onMounted(async () => {
  const meiliClient = getClient();
  iKeys.value = await meiliClient.getKeys();
});
const onSubmit = async (i) => {
  try {
    const meiliClient = getClient();
    const updateRes = await meiliClient.updateKey(iKeys.value.results[i].uid, {
      name: iKeys.value.results[i].name ?? "",
      description: iKeys.value.results[i].description ?? "",
    });
    iKeys.value = await meiliClient.getKeys();
    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "cloud_done",
      message: `${iKeys.value.results[i].uid} Updated`,
    });
  } catch (error) {
    $q.notify({
      color: "red-5",
      textColor: "white",
      icon: "warning",
      multiLine: true,
      html: true,
      message: `<p>Something went wrong<br/><pre>${JSON.stringify(
        error,
        null,
        2
      )}</pre></p>`,
    });
    const meiliClient = getClient();
    iKeys.value = await meiliClient.getKeys();
  }
};
const delKey = async (uid) => {
  $q.notify({
    color: "orange-4",
    textColor: "black",
    icon: "delete",
    timeout: 7000,
    message: `Really delete ${uid} ?`,
    actions: [
      {
        label: "Cancel",
        color: "black",
        handler: () => {
          /* ... */
        },
      },
      {
        label: "Yes",
        color: "red",
        handler: async () => {
          const client = getClient();
          const delRes = await client.deleteKey(uid).catch((error) => {
            console.log(error);
            $q.notify({
              color: "red-5",
              textColor: "white",
              icon: "warning",
              message: `Sorry there was an error: ${error.toString()}`,
            });
          });
          iKeys.value = {};
          refresh();
        },
      },
    ],
  });
};
</script>
