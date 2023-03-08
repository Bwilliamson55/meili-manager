<template>
  <div class="q-pa-xs row items-start q-gutter-xs">
    <q-card class="col q-pa-md" flat>
      <p class="col text-center">
        <strong>{{ newKeyObj.name }}</strong>
      </p>
      <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
        <q-input
          filled
          v-model="newKeyObj.name"
          label="The Keys name"
          hint="Something descriptive"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />
        <q-input
          filled
          v-model="newKeyObj.description"
          label="The Keys Description"
          hint="Something descriptive"
          lazy-rules
        />
        <div class="row justify-evenly">
          <div class="bg-grey-2 q-pa-sm q-my-sm rounded-borders col-12 col-sm">
            Granted Actions:
            <q-select
              filled
              v-model="newKeyObj.actions"
              label="Searchable Actions"
              hint="A list of strings. Press enter to add values you type."
              use-input
              use-chips
              multiple
              stack-label
              fill-input
              input-debounce="0"
              :options="keyActionsFilter"
              new-value-mode="add-unique"
              @filter="filterFnActions"
              @filter-abort="abortFilterFn"
            />
          </div>
          <div class="bg-grey-2 q-pa-sm q-my-sm rounded-borders col-12 col-sm">
            Granted Indexes:
            <q-select
              filled
              v-model="newKeyObj.indexes"
              label="Searchable Indexes"
              hint="A list of strings. Press enter to add values you type."
              use-input
              use-chips
              multiple
              stack-label
              input-debounce="0"
              :options="availableIndexes"
              new-value-mode="add-unique"
              @filter="filterFnIndexes"
              @filter-abort="abortFilterFn"
            />
          </div>
        </div>
        <div class="row justify-evenly">
          <q-input
            filled
            v-model="newKeyObj.expiresAt"
            label="Expires At"
            hint="Required but can be null"
            clearable
            class="col-12 col-sm-6"
          >
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="newKeyObj.expiresAt"
                    mask="YYYY-MM-DD HH:mm:ss"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time
                    v-model="newKeyObj.expiresAt"
                    mask="YYYY-MM-DD HH:mm:ss"
                    format24h
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div>
          <q-btn label="Save" type="submit" color="primary" />
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<script setup>
import { MeiliSearch } from "meilisearch";
import { useSettingsStore } from "src/stores/settings-store";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
const emit = defineEmits(["refresh"]);

const $q = useQuasar();
const theSettings = useSettingsStore();
const { indexUrl, indexKey } = storeToRefs(theSettings);
const newKeyObj = ref({ expiresAt: null });
const iKeys = ref({});

const keyActions = [
  "search",
  "documents.add",
  "documents.get",
  "documents.delete",
  "indexes.create",
  "indexes.get",
  "indexes.update",
  "indexes.delete",
  "indexes.swap",
  "tasks.get",
  "tasks.cancel",
  "tasks.delete",
  "settings.get",
  "settings.update",
  "stats.get",
  "dumps.create",
  "version",
  "keys.get",
  "keys.create",
  "keys.update",
  "keys.delete",
  "*",
];
const keyActionsFilter = ref(keyActions);
const availableIndexes = ref([]);
const getClient = () =>
  new MeiliSearch({
    host: indexUrl.value,
    apiKey: indexKey.value,
  });

onMounted(async () => {
  const client = getClient();
  const indexes = await client.getRawIndexes();
  availableIndexes.value = indexes.results.map((i) => i.uid);
  iKeys.value = await client.getKeys();
});
const filterFnActions = (val, update) => {
  setTimeout(() => {
    update(
      () => {
        if (val === "") {
          keyActionsFilter.value = keyActions;
        } else {
          const needle = val.toLowerCase();
          keyActionsFilter.value = keyActions.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1
          );
        }
      },
      (ref) => {
        if (
          val !== "" &&
          ref.options.length > 0 &&
          ref.getOptionIndex() === -1
        ) {
          ref.moveOptionSelection(1, true); // focus the first selectable option and do not update the input-value
          ref.toggleOption(ref.options[ref.optionIndex], true); // toggle the focused option
        }
      }
    );
  }, 500);
};
const filterFnIndexes = (val, update) => {
  setTimeout(() => {
    update(
      async () => {
        if (val === "") {
          const client = getClient();
          const indexes = await client.getRawIndexes();
          availableIndexes.value = indexes.results.map((i) => i.uid);
        } else {
          const needle = val.toLowerCase();
          availableIndexes.value = availableIndexes.value.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1
          );
        }
      },
      (ref) => {
        if (
          val !== "" &&
          ref.options.length > 0 &&
          ref.getOptionIndex() === -1
        ) {
          ref.moveOptionSelection(1, true); // focus the first selectable option and do not update the input-value
          ref.toggleOption(ref.options[ref.optionIndex], true); // toggle the focused option
        }
      }
    );
  }, 500);
};
const abortFilterFn = () => {
  console.log("delayed filter aborted");
};
const onSubmit = async () => {
  try {
    const client = getClient();
    const res = await client.createKey(newKeyObj.value);
    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "cloud_done",
      message: `Saved`,
    });
    onReset();
    emit("refresh");
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
    const client = getClient();
  }
};
const onReset = () => {
  newKeyObj.value = {};
};
</script>
