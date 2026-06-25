<template>
  <div class="p-4">
    <!-- Header -->
    <div
      class="text-center font-bold border-b border-gray-300 dark:border-gray-700 pb-4 mb-4 dark:text-white"
    >
      <div class="text-lg">Meilisearch Manager Settings</div>
      <div class="text-sm font-normal text-gray-600 dark:text-gray-400 mt-2">
        Version: {{ version || "N/A" }}
      </div>
      <div class="text-sm font-normal text-gray-600 dark:text-gray-400">
        Instance:
        {{ activeInstance?.indexUrl ?? "none" }}
      </div>
    </div>

    <!-- Add Instance Form -->
    <q-form @submit="onSubmit" @reset="onReset" class="space-y-4 mb-6">
      <q-input
        filled
        v-model="formLabel"
        label="The Label for this instance"
        hint="eg. 'Dev instance readonly'"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />
      <q-input
        filled
        v-model="formUrl"
        label="The MeiliSearch index URL"
        hint="https://myEngine.com"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />
      <q-input
        v-model="formKey"
        label="The MeiliSearch index API Key"
        filled
        :type="isPwd ? 'password' : 'text'"
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
      <div>
        <q-btn
          label="Add Instance"
          type="submit"
          color="primary"
          :loading="isConnecting"
        />
        <q-btn label="Reset" type="reset" color="primary" flat class="ml-2" />
      </div>
    </q-form>

    <q-separator class="my-6" />

    <!-- Documentation Link -->
    <div class="mb-4">
      <a
        href="https://docs.meilisearch.com/reference/api/keys.html#actions"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary hover:underline text-sm dark:text-blue-400"
      >
        <q-icon name="help_outline" size="xs" class="mr-1" />
        Permissions Documentation
      </a>
    </div>

    <!-- Current Context Info -->
    <div
      v-if="currentIndex"
      class="p-3 bg-gray-100 dark:bg-gray-800 rounded mb-4"
    >
      <div class="text-sm space-y-1 dark:text-gray-300">
        <div>
          <span class="font-semibold">Current index:</span>
          <span class="ml-2">{{ currentIndex ?? "" }}</span>
        </div>
        <div>
          <span class="font-semibold">Current instance:</span>
          <span class="ml-2">{{ activeInstance?.label ?? "" }}</span>
        </div>
      </div>
    </div>

    <!-- Instances List -->
    <q-card flat bordered>
      <q-card-section class="pb-0">
        <div class="text-lg font-semibold dark:text-white">Your Instances</div>
      </q-card-section>

      <q-list v-if="instances.length > 0" separator>
        <q-item
          v-for="(value, key) in instances"
          :key="key"
          clickable
          v-ripple
          class="cursor-pointer dark:hover:bg-gray-800"
          :class="{
            'bg-blue-50 dark:bg-blue-900': isActiveInstance(key),
          }"
        >
          <q-item-section @click="selectInstance(key)">
            <q-item-label class="font-semibold dark:text-white">
              {{ value?.label ?? "" }}
            </q-item-label>
            <q-item-label caption class="dark:text-gray-400">
              {{ value?.indexUrl ?? "" }}
            </q-item-label>
          </q-item-section>

          <q-item-section side class="flex-row gap-1">
            <q-btn
              size="sm"
              flat
              dense
              round
              icon="key"
              @click="copyKey(key)"
              class="dark:text-gray-300"
            >
              <q-tooltip>Copy API Key</q-tooltip>
            </q-btn>
            <q-btn
              size="sm"
              flat
              dense
              round
              icon="delete"
              color="negative"
              @click="deleteInstance(key)"
            >
              <q-tooltip>Delete Instance</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Empty state -->
      <div v-else class="text-center py-8">
        <q-icon
          name="cloud_off"
          size="48px"
          class="text-gray-400 dark:text-gray-600"
        />
        <p class="text-gray-600 dark:text-gray-400 mt-2 text-sm">
          No instances configured yet
        </p>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { copyToClipboard } from "quasar";
import { useSettingsStore } from "src/meili-core/stores/settings-store";
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import {
  showSuccess,
  showError,
  showConfirmation,
} from "src/utils/notifications";

const theSettings = useSettingsStore();
const { currentIndex, currentInstance, instances } = storeToRefs(theSettings);

const formLabel = ref("");
const formUrl = ref("");
const formKey = ref("");
const version = ref("");
const isPwd = ref(true);
const isConnecting = ref(false);

const activeInstance = computed(() => {
  if (currentInstance.value === null || currentInstance.value === undefined) {
    return null;
  }
  return instances.value[currentInstance.value] ?? null;
});

const isActiveInstance = (instanceKey) =>
  Number(currentInstance.value) === Number(instanceKey);

const onSubmit = async () => {
  isConnecting.value = true;
  try {
    const instanceIndex = await theSettings.addInstance(
      formLabel.value,
      formUrl.value,
      formKey.value,
    );

    await theSettings.switchInstance(instanceIndex);

    try {
      const client = theSettings.client;
      version.value = (await client.getVersion()).pkgVersion ?? 0;
    } catch {
      // Version is optional
    }

    showSuccess("Instance Added & Activated");
    onReset();
  } catch (error) {
    showError(`Failed to add instance: ${error.message}`);
  } finally {
    isConnecting.value = false;
  }
};

const onReset = () => {
  formUrl.value = "";
  formKey.value = "";
  formLabel.value = "";
};

const selectInstance = async (instanceKey) => {
  try {
    await theSettings.switchInstance(instanceKey);

    const inst = instances.value[instanceKey];
    formLabel.value = inst.label;

    showSuccess(`Switched to ${inst.label}`);
  } catch (error) {
    showError(`Failed to switch instance: ${error.message}`);
  }
};

const deleteInstance = (instanceKey) => {
  showConfirmation("Are you sure you want to delete this instance?", () => {
    try {
      theSettings.removeInstance(instanceKey);
      showSuccess("Instance removed");
    } catch (error) {
      showError(error.message);
    }
  });
};

const copyKey = async (instanceKey) => {
  await copyToClipboard(instances.value[instanceKey].indexKey).then(() => {
    showSuccess("Key copied to clipboard");
  });
};
</script>
