<template>
  <q-expansion-item
    dense
    dense-toggle
    expand-separator
    icon="settings"
    label="Raw Settings JSON"
    header-class="text-blue"
    class="q-mb-md"
  >
    <q-card>
      <q-card-section>
        <p class="text-center">
          The following is a real time look at your settings object in full.
        </p>
        <pre>{{ iSettingsString }}</pre>
      </q-card-section>
    </q-card>
  </q-expansion-item>
  <p class="text-center">
    Please see
    <a
      href="https://docs.meilisearch.com/reference/api/settings.html#settings-object"
      >the meilisearch options reference</a
    >
    to understand available options.
  </p>
  <p class="text-center text-red text-bold">
    You must click 'Submit' to persist settings!
  </p>
  <div class="q-pa-md" v-if="!fetching">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-input
        filled
        v-model="iSettings.distinctAttribute"
        label="Distinct (Unique) attribute"
        hint="A single string - the attribute that is unique in every result list. Can be different from PK"
        use-input
        stack-label
        hide-dropdown-icon
        input-debounce="0"
      />
      <hr />
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

      <p class="text-center">Typo Tollerance</p>
      <q-toggle
        v-model="iSettings.typoTolerance.enabled"
        color="green"
        label="Enabled"
      />
      <div class="row q-py-sm justify-between">
        <q-input
          v-model.number="iSettings.typoTolerance.minWordSizeForTypos.oneTypo"
          type="number"
          label="Min word size for one typo"
          filled
          stack-label
          class="col-12 col-sm-5 q-mt-xs"
        />
        <q-input
          v-model.number="iSettings.typoTolerance.minWordSizeForTypos.twoTypos"
          type="number"
          label="Min word size for two typos"
          filled
          stack-label
          class="col-12 col-sm-5 q-mt-xs"
        />
      </div>
      <q-select
        filled
        v-model="iSettings.typoTolerance.disableOnWords"
        label="Disable on words"
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
        v-model="iSettings.typoTolerance.disableOnAttributes"
        label="Disable on attributes"
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
      <div class="row q-py-sm justify-between">
        <q-input
          v-model.number="iSettings.faceting.maxValuesPerFacet"
          type="number"
          label="Max returned values per facet"
          filled
          stack-label
          class="col-12 col-sm-5 q-mt-xs"
        />
        <q-input
          v-model.number="iSettings.pagination.maxTotalHits"
          type="number"
          label="Max results"
          filled
          stack-label
          class="col-12 col-sm-5 q-mt-xs"
        />
      </div>
      <div>
        <q-btn
          :loading="iSettingsProcessing.processing"
          type="submit"
          color="primary"
        >
          Submit to save settings
          <template v-slot:loading>
            Settings updating... Task: {{ iSettingsProcessing.taskId }}
          </template>
        </q-btn>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, onMounted, computed } from "vue";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { showSuccess, showError } from "src/utils/notifications";

const $q = useQuasar();
const fetching = ref(true);
const iSettings = ref({});
const iSettingsProcessing = ref({ taskId: 0, processing: false });

const theSettings = useSettingsStore();
const { currentIndex, confirmed } = storeToRefs(theSettings);

onMounted(async () => {
  if (confirmed.value) {
    try {
      const mclient = theSettings.getIndexClient(currentIndex.value);
      fetching.value = true;
      iSettings.value = await mclient.getSettings();
      fetching.value = false;
    } catch (error) {
      fetching.value = false;
      showError(`Failed to load settings: ${error.message}`);
    }
  }
});

const iSettingsString = computed(() => {
  return JSON.stringify(iSettings.value, null, 2);
});
const iSettingsSynonymKeys = computed(() => {
  return Object.keys(iSettings.value?.synonyms || {});
});
const addSynonymParent = (synonymString, done) => {
  iSettings.value.synonyms[synonymString] = [""];
};
const removeSynonym = (details) => {
  delete iSettings.value.synonyms[details.value];
};

const onSubmit = async () => {
  iSettingsProcessing.value.processing = true;
  try {
    const mclient = theSettings.getIndexClient(currentIndex.value);
    const updateRes = await mclient.updateSettings(iSettings.value);
    iSettingsProcessing.value.taskId = updateRes.taskUid ?? 0;

    // waitForTask is on the client.tasks object in SDK 0.53.0
    await theSettings.client.tasks.waitForTask(updateRes.taskUid, {
      intervalMs: 5000,
    });

    iSettingsProcessing.value.processing = false;
    iSettings.value = await mclient.getSettings();

    showSuccess("Settings Updated");
  } catch (error) {
    iSettingsProcessing.value.processing = false;
    iSettingsProcessing.value.taskId = 0;

    console.error("Settings update error:", error);
    showError(`Failed to update settings: ${error.message}`);

    // Reload settings to show current state
    try {
      const mclient = theSettings.getIndexClient(currentIndex.value);
      iSettings.value = await mclient.getSettings();
    } catch (reloadError) {
      console.error("Failed to reload settings:", reloadError);
    }
  }
};
</script>
