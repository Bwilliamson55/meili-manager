<template>
  <div class="flex flex-wrap gap-2 p-2">
    <q-card class="w-full p-6" flat square>
      <p class="text-center font-bold mb-4 text-text">
        {{ newKeyObj.name }}
      </p>
      <q-form @submit="onSubmit" @reset="onReset" class="space-y-4">
        <q-input
          outlined
          dense
          square
          v-model="newKeyObj.name"
          label="Key name"
          hint="Something descriptive"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />
        <q-input
          outlined
          dense
          square
          v-model="newKeyObj.description"
          label="Description"
          hint="Something descriptive"
          lazy-rules
        />
        <div class="flex flex-col md:flex-row justify-evenly gap-4">
          <div class="bg-page p-4 border border-border flex-1">
            <div class="font-semibold mb-1 text-text">Granted actions</div>
            <p class="text-caption text-text-muted mb-2">
              See Meilisearch keys docs for action meanings. Use * for all
              permissions.
            </p>
            <q-select
              outlined
              dense
              square
              v-model="newKeyObj.actions"
              label="Actions"
              hint="Press enter to add values you type"
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
          <div class="bg-page p-4 border border-border flex-1">
            <div class="font-semibold mb-2 text-text">Granted indexes</div>
            <q-select
              outlined
              dense
              square
              v-model="newKeyObj.indexes"
              label="Indexes"
              hint="Press enter to add values you type"
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
            outlined
            dense
            square
            v-model="newKeyObj.expiresAt"
            label="Expires at"
            hint="Leave empty for no expiration"
            clearable
            class="flex-1"
          >
            <template v-slot:prepend>
              <q-icon
                name="event"
                class="cursor-pointer"
                aria-label="Pick expiration date"
              >
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
                      <q-btn
                        v-close-popup
                        label="Close"
                        color="primary"
                        flat
                        square
                        no-caps
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon
                name="access_time"
                class="cursor-pointer"
                aria-label="Pick expiration time"
              >
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
                      <q-btn
                        v-close-popup
                        label="Close"
                        color="primary"
                        flat
                        square
                        no-caps
                      />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div>
          <q-btn
            unelevated
            square
            no-caps
            label="Create key"
            type="submit"
            color="primary"
          />
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<script setup>
import { useSettingsStore } from "src/meili-core/stores/settings-store";
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
  "tasks.cancel",
  "tasks.delete",
  "tasks.get",
  "settings.get",
  "settings.update",
  "stats.get",
  "dumps.create",
  "snapshots.create",
  "version",
  "keys.get",
  "keys.create",
  "keys.update",
  "keys.delete",
  "*",
];
const keyActionsFilter = ref(keyActions);
const allAvailableActions = ref([...keyActions]);
const availableIndexes = ref([]);
const allAvailableIndexes = ref([]);

const listIndexes = async (client) => {
  if (typeof client.getRawIndexes === "function") {
    return client.getRawIndexes();
  }
  return client.getIndexes();
};

onMounted(async () => {
  try {
    const client = theSettings.client;
    const indexes = await listIndexes(client);
    allAvailableIndexes.value = (indexes.results || []).map((i) => i.uid);
    availableIndexes.value = [...allAvailableIndexes.value];
    iKeys.value = await client.getKeys();
    const discoveredActions = (iKeys.value.results || []).flatMap(
      (key) => key.actions || [],
    );
    allAvailableActions.value = Array.from(
      new Set([...keyActions, ...discoveredActions]),
    ).sort();
    keyActionsFilter.value = [...allAvailableActions.value];
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
          keyActionsFilter.value = [...allAvailableActions.value];
        } else {
          const needle = val.toLowerCase();
          keyActionsFilter.value = allAvailableActions.value.filter(
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
            const indexes = await listIndexes(client);
            allAvailableIndexes.value = (indexes.results || []).map((i) => i.uid);
            availableIndexes.value = [...allAvailableIndexes.value];
          } catch (error) {
            console.error("Failed to load indexes:", error);
          }
        } else {
          const needle = val.toLowerCase();
          availableIndexes.value = allAvailableIndexes.value.filter(
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
