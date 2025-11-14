<template>
  <div class="flex flex-wrap gap-2 p-2">
    <q-card class="w-full p-6" flat>
      <p class="text-center font-bold mb-4">
        {{ newKeyObj.name }}
      </p>
      <q-form @submit="onSubmit" @reset="onReset" class="space-y-4">
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
        <div class="flex flex-col md:flex-row justify-evenly gap-4">
          <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded flex-1">
            <div class="font-semibold mb-2">Granted Actions:</div>
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
          <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded flex-1">
            <div class="font-semibold mb-2">Granted Indexes:</div>
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
        <div class="flex flex-col md:flex-row justify-evenly gap-4">
          <q-input
            filled
            v-model="newKeyObj.expiresAt"
            label="Expires At"
            hint="Required but can be null"
            clearable
            class="flex-1"
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
                    <div class="flex items-center justify-end">
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
                    <div class="flex items-center justify-end">
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
import { useSettingsStore } from "src/stores/settings-store";
import { onMounted, ref } from "vue";
import { showSuccess, showError } from "src/utils/notifications";

const emit = defineEmits(["refresh"]);

const theSettings = useSettingsStore();
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

onMounted(async () => {
  try {
    const client = theSettings.client;
    const indexes = await client.getRawIndexes();
    availableIndexes.value = indexes.results.map((i) => i.uid);
    iKeys.value = await client.getKeys();
  } catch (error) {
    console.error("Failed to load API key form data:", error);
    showError(`Failed to load: ${error.message}`);
  }
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
            (v) => v.toLowerCase().indexOf(needle) > -1,
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
      },
    );
  }, 500);
};
const filterFnIndexes = (val, update) => {
  setTimeout(() => {
    update(
      async () => {
        if (val === "") {
          try {
            const client = theSettings.client;
            const indexes = await client.getRawIndexes();
            availableIndexes.value = indexes.results.map((i) => i.uid);
          } catch (error) {
            console.error("Failed to load indexes:", error);
          }
        } else {
          const needle = val.toLowerCase();
          availableIndexes.value = availableIndexes.value.filter(
            (v) => v.toLowerCase().indexOf(needle) > -1,
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
      },
    );
  }, 500);
};
const abortFilterFn = () => {
  console.log("delayed filter aborted");
};
const onSubmit = async () => {
  try {
    const client = theSettings.client;
    await client.createKey(newKeyObj.value);
    showSuccess("API Key created successfully");
    onReset();
    emit("refresh");
  } catch (error) {
    console.error("Failed to create API key:", error);
    showError(`Failed to create key: ${error.message}`);
  }
};
const onReset = () => {
  newKeyObj.value = {};
};
</script>
