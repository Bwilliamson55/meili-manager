<template>
  <p>Value is {{ iSettingsString }}</p>
  <p class="text-center">
    Please see
    <a
      href="https://docs.meilisearch.com/reference/api/settings.html#settings-object"
      >the meilisearch options reference</a
    >
    to understand available options.
  </p>
  <div class="q-pa-md">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-select
        filled
        v-model="iSettings.displayedAttributes"
        label="Displayed Attributes"
        hint="A list of strings, or *. Press enter to add values you type."
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add"
      />
      <q-select
        filled
        v-model="iSettings.searchableAttributes"
        label="Searchable Attributes"
        hint="A list of strings, or *"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add"
      />
      <q-select
        filled
        v-model="iSettings.filterableAttributes"
        label="Filterable Attributes"
        hint="A list of strings, or empty"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add"
      />
      <q-select
        filled
        v-model="iSettings.sortableAttributes"
        label="Sortable Attributes"
        hint="A list of strings, or empty"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add"
      />
      <q-select
        filled
        v-model="iSettings.rankingRules"
        label="Ranking Rules"
        hint="A list of strings, or empty"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add"
      />
      <q-select
        filled
        v-model="iSettings.stopWords"
        label="Stop Words"
        hint="A list of strings, or empty"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        new-value-mode="add"
      />
      <hr />
      <q-select
        filled
        v-model="iSettingsSynonymKeys"
        label="Synonyms"
        hint="A list of words, or empty"
        use-input
        use-chips
        multiple
        stack-label
        hide-dropdown-icon
        input-debounce="0"
        @new-value="addSynonymParent"
        @remove="removeSynonym"
      />
      <template v-for="(value, key) in iSettings.synonyms" :key="key">
        <div class="q-ml-xl">
          <q-select
            filled
            v-model="iSettings.synonyms[key]"
            :label="`Synonyms for ${key}`"
            :hint="`Words that are synonyms for ${key}`"
            use-input
            use-chips
            multiple
            stack-label
            hide-dropdown-icon
            input-debounce="0"
            new-value-mode="add"
          />
        </div>
      </template>
      <hr />
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
const iSettingsSynonymKeys = computed(() => {
  return Object.keys(iSettings.value?.synonyms || {});
});
const addSynonymParent = (synonymString, done) => {
  iSettings.value.synonyms[synonymString] = [""];
  done();
};
const removeSynonym = ({ details }) => {
  console.log(details);
  delete iSettings.value.synonyms[details.value];
};

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
