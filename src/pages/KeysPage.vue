<template>
  <q-page padding>
    <div class="flex flex-col gap-4">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-center">
            <p class="text-h6">All Keys</p>
          </div>
          <div class="row">
            <div class="col">
              <q-expansion-item
                dense
                expand-separator
                icon="key"
                label="Raw Keys JSON"
                header-class="text-blue"
                class="my-auto"
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

      <q-card flat bordered>
        <q-card-section>
          <q-expansion-item
            v-model="newKeyFormExpanded"
            expand-separator
            dense
            icon="key"
            label="New Key Form"
            header-class="text-blue"
          >
            <q-card bordered>
              <q-card-section>
                <api-key-form @refresh="refresh" />
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-card-section>
      </q-card>

      <div class="flex flex-col gap-4">
        <template v-for="(key, i) in iKeys.results" :key="key.uid">
          <q-expansion-item
            expand-separator
            dense
            icon="key"
            :label="`${key.name} -- UID: ${key.uid}`"
            header-class="text-primary"
            class="mb-4 w-full"
          >
            <q-card class="p-4" flat bordered>
              <p class="col text-center">
                <strong>{{ iKeys.results[i].name }}</strong>
              </p>
              <q-form @submit="onSubmit(i)" class="space-y-4">
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
                class="my-2"
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
                      (iKeys.results[i].kKeyToggle =
                        !iKeys.results[i].kKeyToggle)
                    "
                  />
                </template>
              </q-input>
              <q-input
                filled
                v-model="iKeys.results[i].uid"
                label="The Keys UID"
                hint="This is the id used when fetching a single key"
                class="my-2"
              />
              <div class="flex justify-evenly">
                <div class="bg-grey-2 p-2 my-2 rounded-borders col-12 col-sm-5">
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
                <div class="bg-grey-2 p-2 my-2 rounded-borders col-12 col-sm-5">
                  Granted Indexes:
                  <ul>
                    <template
                      v-for="idx in iKeys.results[i].indexes"
                      :key="idx"
                    >
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
import { useSettingsStore } from "src/stores/settings-store";
import { onMounted, ref } from "vue";
import ApiKeyForm from "src/components/ApiKeyForm.vue";
import {
  showSuccess,
  showError,
  showConfirmation,
} from "src/utils/notifications";

const theSettings = useSettingsStore();
const iKeys = ref({});
const newKeyFormExpanded = ref(false);

const refresh = async () => {
  iKeys.value = await theSettings.client.getKeys();
  newKeyFormExpanded.value = false;
};

onMounted(async () => {
  iKeys.value = await theSettings.client.getKeys();
});
const onSubmit = async (i) => {
  try {
    await theSettings.client.updateKey(iKeys.value.results[i].uid, {
      name: iKeys.value.results[i].name ?? "",
      description: iKeys.value.results[i].description ?? "",
    });
    iKeys.value = await theSettings.client.getKeys();
    showSuccess(`${iKeys.value.results[i].uid} Updated`);
  } catch (error) {
    showError(`Failed to update key: ${error.message}`);
    iKeys.value = await theSettings.client.getKeys();
  }
};

const delKey = async (uid) => {
  showConfirmation(`Really delete ${uid}?`, async () => {
    try {
      await theSettings.client.deleteKey(uid);
      iKeys.value = {};
      refresh();
    } catch (error) {
      console.log(error);
      showError(`Failed to delete key: ${error.message}`);
    }
  });
};
</script>
