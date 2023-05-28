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
            @click="isPwd = !isPwd"
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
import { useQuasar, copyToClipboard } from "quasar";
import { useSettingsStore } from "src/stores/settings-store";
import { ref } from "vue";
import { MeiliSearch } from "meilisearch";
import { storeToRefs } from "pinia";

const $q = useQuasar();
const theSettings = useSettingsStore();
const {
  indexUrl,
  indexKey,
  confirmed,
  currentIndex,
  currentInstance,
  instances,
} = storeToRefs(theSettings);
const indexLabel = ref("");
const version = ref("");
const isPwd = ref(true);

const getClient = () =>
  new MeiliSearch({
    host: instances.value[currentInstance.value].indexUrl,
    apiKey: instances.value[currentInstance.value].indexKey,
  });

if (!instances.value?.length) {
  instances.value = [];
}

const onSubmit = async () => {
  confirmed.value = true;
  instances.value.push({
    indexUrl: indexUrl.value,
    indexKey: indexKey.value,
    confirmed: confirmed.value,
    label: indexLabel.value,
  });
  currentInstance.value = instances.value.length - 1;
  try {
    const mclient = getClient();
    version.value = (await mclient.getVersion()).pkgVersion ?? 0;
  } catch {} // no worries it's just the version number
  $q.notify({
    color: "green-4",
    textColor: "white",
    icon: "cloud_done",
    message: "Instance Added",
  });
};

const onReset = () => {
  indexUrl.value = "";
  indexKey.value = "";
  indexLabel.value = "";
  version.value = "";
};

const selectInstance = (instanceKey) => {
  currentInstance.value = instanceKey;
  const inst = instances.value[currentInstance.value];
  indexUrl.value = inst.indexUrl;
  indexKey.value = inst.indexKey;
  indexLabel.value = inst.label;
  confirmed.value = inst.confirmed;
  getClient();
};

const deleteInstance = (instanceKey) => {
  $q.notify({
    color: "red-4",
    textColor: "white",
    icon: "warning",
    multiLine: true,
    html: true,
    closeBtn: true,
    message: `<p>Are you sure you want to delete this instance?</p>`,
    actions: [
      {
        label: "Yes",
        color: "yellow",
        handler: () => {
          if (instanceKey == currentInstance.value) {
            currentInstance.value = instanceKey - 1;
          }
          instances.value.splice(instanceKey, 1);
        },
      },
    ],
  });
};

const copyKey = async (instanceKey) => {
  console.log(instanceKey);
  console.log(instances.value[instanceKey]);
  await copyToClipboard(instances.value[instanceKey].indexKey).then(() => {
    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "key",
      html: true,
      message: "<h5>Key copied to clipboard</h5>",
    });
  });
};
</script>
