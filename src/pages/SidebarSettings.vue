<template>
  <div class="q-pa-md">
    <div class="text-center text-bold border-bottom">
      MeiliSearch Manager Settings <br />Your Current Version: {{ version
      }}<br />Your Current Instance:
      {{ instances[currentInstance]?.indexUrl ?? "none" }}
    </div>
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input
        filled
        v-model="indexLabel"
        label="The Label for this instance"
        hint="eg. 'Dev instance readonly'"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />
      <q-input
        filled
        v-model="indexUrl"
        label="The MeiliSearch index URL"
        hint="https://myEngine.com"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      />
      <q-input
        v-model="indexKey"
        label="The MeiliSearch index API Key"
        filled
        :type="isPwd ? 'password' : 'text'"
        :rules="[(val) => (val && val.length > 0) || 'Please type something']"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="(isPwd = !isPwd)"
          />
        </template>
      </q-input>
      <div>
        <q-btn label="Add Instance" type="submit" color="primary" />
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
      ><br />
      <span
        >Current instance:
        <strong>{{ instances[currentInstance]?.label ?? "" }}</strong></span
      >
    </div>
    <q-list bordered class="rounded-borders">
      <q-item-label header>Instances</q-item-label>
      <div v-if="instances.length > 0">
        <q-item
          v-for="(value, key) in instances"
          :key="key"
          clickable
          v-ripple
          active-class="bg-blue-1"
          class="cursor-pointer"
          :active="currentInstance == key"
        >
          <q-item-section top @click="selectInstance(key)">
            <q-item-label lines="1">
              {{ value?.label ?? "" }}
            </q-item-label>
            <q-item-label caption lines="1">
              {{ value?.indexUrl ?? "" }}
            </q-item-label>
          </q-item-section>

          <q-item-section top side>
            <div class="text-grey-8 q-gutter-xs">
              <q-btn
                class="gt-xs"
                size="12px"
                flat
                dense
                round
                icon="delete"
                @click="deleteInstance(key)"
              />
              <q-btn
                class="gt-xs"
                size="12px"
                flat
                dense
                round
                icon="key"
                @click="copyKey(key)"
              />
            </div>
          </q-item-section>
        </q-item>
      </div>
      <q-separator spaced />
    </q-list>
  </div>
</template>

<script setup>
import { copyToClipboard } from "quasar";
import { useSettingsStore } from "src/stores/settings-store";
import { ref } from "vue";
import { MeiliSearch } from "meilisearch";
import { storeToRefs } from "pinia";
import {
  showSuccess,
  showError,
  showConfirmation,
} from "src/utils/notifications";
const theSettings = useSettingsStore();
const {
  indexUrl,
  indexKey,
  confirmed,
  currentIndex,
  currentInstance,
  instances,
  isConnecting,
  clientError,
} = storeToRefs(theSettings);
const indexLabel = ref("");
const version = ref("");
const isPwd = ref(true);

if (!instances.value?.length) {
  instances.value = [];
}

const onSubmit = async () => {
  try {
    const instanceIndex = await theSettings.addInstance(
      indexLabel.value,
      indexUrl.value,
      indexKey.value,
    );

    await theSettings.switchInstance(instanceIndex);

    // Get version info
    try {
      const client = await theSettings.getMeiliClient();
      version.value = (await client.getVersion()).pkgVersion ?? 0;
    } catch (e) {
      // Version is optional
    }

    showSuccess("Instance Added & Activated");

    onReset();
  } catch (error) {
    showError(`Failed to add instance: ${error.message}`);
  }
};

const onReset = () => {
  indexUrl.value = "";
  indexKey.value = "";
  indexLabel.value = "";
  version.value = "";
};

const selectInstance = async (instanceKey) => {
  try {
    await theSettings.switchInstance(instanceKey);

    const inst = instances.value[instanceKey];
    indexLabel.value = inst.label;

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
  console.log(instanceKey);
  console.log(instances.value[instanceKey]);
  await copyToClipboard(instances.value[instanceKey].indexKey).then(() => {
    showSuccess("Key copied to clipboard");
  });
};
</script>
