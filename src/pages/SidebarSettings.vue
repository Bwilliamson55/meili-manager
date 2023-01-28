<template>
  <div class="q-pa-md">
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
  </div>
</template>

<script>
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { useSettingsStore } from "src/stores/settings-store";
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";

export default {
  setup() {
    const $q = useQuasar();
    const theSettings = useSettingsStore();
    const { indexUrl, indexKey } = storeToRefs(theSettings);
    const accept = ref(false);
    const credsConfirmed = ref(false);

    return {
      indexUrl,
      indexKey,
      accept,

      onSubmit() {
        if (accept.value !== true) {
          $q.notify({
            color: "red-5",
            textColor: "white",
            icon: "warning",
            message: "You need to accept the thing",
          });
        } else {
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${indexKey.value}`;
          api
            .get(`${indexUrl.value}/version`)
            .then((response) => {
              if (!response.data.commitDate) {
                console.log(response.data);
                $q.notify({
                  color: "red-5",
                  textColor: "white",
                  icon: "warning",
                  message: "Sorry those creds didn't work",
                });
                credsConfirmed.value = false;
              } else {
                $q.notify({
                  color: "green-4",
                  textColor: "white",
                  icon: "cloud_done",
                  message: "Creds authenticated",
                });
                credsConfirmed.value = true;
              }
            })
            .catch((error) => {
              console.log(error);
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
      },

      onReset() {
        indexUrl.value = "";
        indexKey.value = "";
        accept.value = false;
      },
    };
  },
};
</script>
