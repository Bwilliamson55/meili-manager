<template>
  <p>Value is {{ iSettingsString }}</p>

  <div class="q-pa-md" style="max-width: 400px">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input
        filled
        v-model="name"
        label="Some field label prop"
        hint="Field hint prop"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />

      <q-input
        filled
        type="number"
        v-model="age"
        label="Another field label prop"
        lazy-rules
        :rules="[
          (val) => (val !== null && val !== '') || 'Please type things',
          (val) =>
            (val > 0 && val < 100) || 'Please type a number between 0 and 100',
        ]"
      />

      <div>
        <q-btn label="Submit" type="submit" color="primary" />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, onMounted, computed } from "vue";
import { MeiliSearch } from "meilisearch";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";

const $q = useQuasar();

const name = ref(null);
const age = ref(null);
const accept = ref(false);
const iSettings = ref({});

const theSettings = useSettingsStore();
const { indexUrl, indexKey, currentIndex, confirmed } =
  storeToRefs(theSettings);

onMounted(async () => {
  if (confirmed) {
    const meiliClient = new MeiliSearch({
      host: indexUrl.value,
      apiKey: indexKey.value,
    });
    const mclient = meiliClient.index(currentIndex.value);

    iSettings.value = await mclient.getSettings();
  }
});

const iSettingsString = computed(() => {
  return JSON.stringify(iSettings.value);
});

const onSubmit = () => {
  // if (accept.value !== true) {
  //   $q.notify({
  //     color: "red-5",
  //     textColor: "white",
  //     icon: "warning",
  //     message: "You need to accept the license and terms first",
  //   });
  // } else {
  //   $q.notify({
  //     color: "green-4",
  //     textColor: "white",
  //     icon: "cloud_done",
  //     message: "Submitted",
  //   });
  // }
};
</script>
