<template>
  <q-page class="p-6 bg-page">
    <div class="mb-6">
      <h1 class="mm-page-title text-2xl">Instances</h1>
      <p class="text-sm text-text-muted mt-1">
        Save and switch Meilisearch endpoints. Credentials stay in this browser.
      </p>
      <p v-if="version" class="text-xs text-text-muted mt-1">
        Active version: {{ version }}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <q-card flat bordered square class="bg-page-elevated">
        <q-card-section>
          <div class="mm-section-title text-subtitle1 mb-4">Add instance</div>
          <q-form @submit="onSubmit" @reset="onReset" class="space-y-4">
            <q-input
              outlined
              dense
              square
              v-model="formLabel"
              label="Label"
              hint="e.g. Dev readonly"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
            />
            <q-input
              outlined
              dense
              square
              v-model="formUrl"
              label="Meilisearch URL"
              hint="https://meili.example.com or http://localhost:7700"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
            />
            <q-input
              v-model="formKey"
              label="API key"
              outlined
              dense
              square
              :type="isPwd ? 'password' : 'text'"
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
              ]"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  :aria-label="isPwd ? 'Show API key' : 'Hide API key'"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
            <div class="flex gap-2">
              <q-btn
                unelevated
                square
                no-caps
                label="Add instance"
                type="submit"
                color="primary"
                :loading="isConnecting"
              />
              <q-btn
                flat
                square
                no-caps
                label="Reset"
                type="reset"
                color="primary"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <q-card flat bordered square class="bg-page-elevated">
        <q-card-section class="pb-0">
          <div class="flex items-center justify-between">
            <div class="mm-section-title text-subtitle1">Your instances</div>
            <a
              href="https://docs.meilisearch.com/reference/api/keys.html#actions"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary text-caption hover:underline"
            >
              Permissions docs
            </a>
          </div>
        </q-card-section>

        <q-list v-if="instances.length > 0" separator>
          <q-item
            v-for="(value, key) in instances"
            :key="key"
            clickable
            v-ripple
            :class="{
              'bg-page text-primary': isActiveInstance(key),
            }"
          >
            <q-item-section @click="selectInstance(key)">
              <q-item-label class="font-semibold">
                {{ value?.label ?? "" }}
              </q-item-label>
              <q-item-label caption class="text-text-muted">
                {{ value?.indexUrl ?? "" }}
              </q-item-label>
            </q-item-section>

            <q-item-section side class="flex-row gap-1">
              <q-btn
                size="sm"
                flat
                dense
                square
                icon="key"
                aria-label="Copy API key"
                @click="copyKey(key)"
              >
                <q-tooltip>Copy API key</q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                flat
                dense
                square
                icon="delete"
                color="negative"
                aria-label="Delete instance"
                @click="deleteInstance(key)"
              >
                <q-tooltip>Delete instance</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-else class="text-center py-10">
          <q-icon name="cloud_off" size="48px" class="text-text-muted" />
          <p class="text-text-muted mt-2 text-sm">No instances configured yet</p>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { copyToClipboard } from "quasar";
import { useSettingsStore } from "src/meili-core/stores/settings-store";
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import {
  showSuccess,
  showError,
  showConfirmation,
} from "src/utils/notifications";

const theSettings = useSettingsStore();
const { currentInstance, instances, confirmed } = storeToRefs(theSettings);

const formLabel = ref("");
const formUrl = ref("");
const formKey = ref("");
const version = ref("");
const isPwd = ref(true);
const isConnecting = ref(false);

const isActiveInstance = (instanceKey) =>
  Number(currentInstance.value) === Number(instanceKey);

const refreshVersion = async () => {
  if (!confirmed.value) {
    version.value = "";
    return;
  }
  try {
    version.value = (await theSettings.client.getVersion()).pkgVersion ?? "";
  } catch {
    version.value = "";
  }
};

watch(confirmed, () => refreshVersion(), { immediate: true });
watch(currentInstance, () => refreshVersion());

const onSubmit = async () => {
  isConnecting.value = true;
  try {
    const instanceIndex = await theSettings.addInstance(
      formLabel.value,
      formUrl.value,
      formKey.value,
    );

    await theSettings.switchInstance(instanceIndex);
    await refreshVersion();
    showSuccess("Instance added and activated");
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
    await refreshVersion();
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
