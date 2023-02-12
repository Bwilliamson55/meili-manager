<template>
  <div class="q-pa-md">
    <div class="text-center text-bold border-bottom">
      MeiliSearch Manager Settings <br />Your Version: {{ version }}
    </div>
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input
        filled
        v-model="indexUrl"
        label="The MeiliSearch index URL"
        hint="https://myEngine.com"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />

      <q-input
        filled
        v-model="indexKey"
        label="The MeiliSearch index API Key"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />

      <q-toggle v-model="accept" label="I acknowledge this is a test app" />

      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn
          label="Reset"
          type="reset"
          color="primary"
          flat
          class="q-ml-sm"
        />
      </div>
    </q-form>
    <q-separator spaced />
    <q-item-label header
      ><a href="https://docs.meilisearch.com/reference/api/keys.html#actions"
        >Permissions Documentation Here</a
      ></q-item-label
    >
    <div v-if="currentIndex" class="q-pa-sm q-gutter-sm">
      <span
        >Current index: <strong>{{ currentIndex ?? "" }}</strong></span
      >
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { useSettingsStore } from "src/stores/settings-store";
import { ref } from "vue";
import { MeiliSearch } from "meilisearch";
import { storeToRefs } from "pinia";

const $q = useQuasar();
const theSettings = useSettingsStore();
const { indexUrl, indexKey, confirmed, currentIndex } =
  storeToRefs(theSettings);
const accept = ref(false);
const version = ref("");
const getClient = () =>
  new MeiliSearch({
    host: indexUrl.value,
    apiKey: indexKey.value,
  });

const onSubmit = () => {
  if (accept.value !== true) {
    $q.notify({
      color: "red-5",
      textColor: "white",
      icon: "warning",
      message: "You need to accept the thing",
    });
  } else {
    api.defaults.headers.common["Authorization"] = `Bearer ${indexKey.value}`;
    api
      .get(`${indexUrl.value}`)
      .then(async (response) => {
        confirmed.value = true;
        const mclient = getClient();
        try {
          version.value = (await mclient.getVersion()).pkgVersion ?? 0;
        } catch {} // no worries it's just the version number
      })
      .catch((error) => {
        console.log(error);
        confirmed.value = false;
        $q.notify({
          color: "red-5",
          textColor: "white",
          icon: "warning",
          message: `Sorry there was an error: ${error.toString()}`,
        });
      });
    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "cloud_done",
      message: "Settings Saved Locally",
    });
  }
};

const onReset = () => {
  indexUrl.value = "";
  indexKey.value = "";
  accept.value = false;
  version.value = "";
};
</script>
