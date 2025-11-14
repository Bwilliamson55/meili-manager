<template>
  <q-page class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">API Keys</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Manage Meilisearch API keys and permissions
        </p>
      </div>
      <div class="flex gap-2">
        <q-btn
          outline
          color="primary"
          icon="refresh"
          label="Refresh"
          @click="refresh"
          :loading="keysStore.loading"
        />
        <q-btn
          color="primary"
          icon="add"
          label="Create Key"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <q-card flat bordered>
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-blue-500">
            {{ keysStore.stats.total }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Keys</div>
        </q-card-section>
      </q-card>
      <q-card flat bordered>
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-orange-500">
            {{ keysStore.stats.expiringSoon }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Expiring Soon
          </div>
        </q-card-section>
      </q-card>
      <q-card flat bordered>
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-red-500">
            {{ keysStore.stats.expired }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Expired</div>
        </q-card-section>
      </q-card>
      <q-card flat bordered>
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-green-500">
            {{ keysStore.stats.neverExpire }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Never Expire
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Search Filter -->
    <q-card flat bordered class="mb-4">
      <q-card-section>
        <q-input
          v-model="searchFilter"
          label="Search keys"
          outlined
          dense
          clearable
          placeholder="Search by name, description, or UID"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <div class="flex flex-col gap-4">
      <q-card flat bordered>
        <q-card-section>
          <div class="text-center mb-4">
            <p class="text-lg font-semibold dark:text-gray-200">
              {{ filteredKeys.length }} Key{{
                filteredKeys.length !== 1 ? "s" : ""
              }}
            </p>
          </div>
          <q-expansion-item
            dense
            expand-separator
            icon="key"
            label="Raw Keys JSON"
            header-class="text-blue"
          >
            <q-card bordered>
              <q-card-section>
                <p class="text-center mb-4 dark:text-gray-300">
                  The following is a real time look at your keys objects in
                  full.
                </p>
                <pre
                  class="text-xs overflow-auto bg-gray-900 dark:bg-gray-950 text-white p-4 rounded"
                  >{{ JSON.stringify(iKeys, null, 2) }}</pre
                >
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-card-section>
      </q-card>

      <div class="flex flex-col gap-4">
        <template v-for="(key, i) in filteredKeys" :key="key.uid">
          <q-expansion-item
            expand-separator
            dense
            icon="key"
            header-class="text-primary"
            class="mb-4 w-full"
          >
            <template v-slot:header>
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3 flex-1">
                  <q-icon name="key" size="sm" />
                  <div>
                    <div class="font-semibold">{{ key.name }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      UID: {{ key.uid }}
                    </div>
                  </div>
                </div>
                <q-badge
                  :color="getExpirationBadge(key.expiresAt).color"
                  :label="getExpirationBadge(key.expiresAt).label"
                  class="mr-2"
                />
              </div>
            </template>
            <q-card class="p-6" flat bordered>
              <p class="text-center font-bold mb-4 dark:text-gray-200">
                {{ key.name }}
              </p>
              <q-form @submit="onSubmit(key.uid)" class="space-y-4">
                <q-input
                  filled
                  v-model="key.name"
                  label="The Keys name"
                  hint="Something descriptive"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                />
                <q-input
                  filled
                  v-model="key.description"
                  label="The Keys Description"
                  hint="Something descriptive"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                  ]"
                />

                <div class="flex justify-between">
                  <q-btn label="Save" type="submit" color="primary" />
                  <q-btn
                    size="14px"
                    flat
                    bordered
                    color="red"
                    icon="delete"
                    label="Delete"
                    @click="delKey(key.uid)"
                  />
                </div>
              </q-form>

              <q-separator class="my-6" />
              <div class="text-center mb-4">
                <p class="font-semibold dark:text-gray-300">
                  The following key details can only be set at the time of
                  creation
                </p>
              </div>
              <q-input
                v-model="key.key"
                filled
                readonly
                :type="key.kKeyToggle ? 'text' : 'password'"
                hint="The Keys Key"
                label="The Keys key"
                class="mb-4 font-mono"
              >
                <template v-slot:append>
                  <q-icon
                    :name="key.kKeyToggle ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="theKeys.toggleKeyVisibility(key.uid)"
                  >
                    <q-tooltip
                      >{{ key.kKeyToggle ? "Hide" : "Show" }} key</q-tooltip
                    >
                  </q-icon>
                  <q-icon
                    name="content_copy"
                    class="cursor-pointer ml-2"
                    @click="copyKeyToClipboard(key.key)"
                  >
                    <q-tooltip>Copy key to clipboard</q-tooltip>
                  </q-icon>
                </template>
              </q-input>
              <q-input
                filled
                readonly
                v-model="key.uid"
                label="The Keys UID"
                hint="This is the id used when fetching a single key"
                class="mb-4"
              />
              <div class="flex flex-col md:flex-row justify-evenly gap-4 mb-4">
                <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded flex-1">
                  <div class="font-semibold mb-2 dark:text-gray-200">
                    Granted Actions:
                  </div>
                  <ul class="list-disc list-inside dark:text-gray-300">
                    <template v-for="action in key.actions" :key="action">
                      <li>{{ action }}</li>
                    </template>
                  </ul>
                </div>
                <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded flex-1">
                  <div class="font-semibold mb-2 dark:text-gray-200">
                    Granted Indexes:
                  </div>
                  <ul class="list-disc list-inside dark:text-gray-300">
                    <template v-for="idx in key.indexes" :key="idx">
                      <li>{{ idx }}</li>
                    </template>
                  </ul>
                </div>
              </div>
              <div class="text-center space-y-2 dark:text-gray-300">
                <p>
                  <strong>Created At:</strong> {{ formatDate(key.createdAt) }}
                </p>
                <p>
                  <strong>Updated At:</strong> {{ formatDate(key.updatedAt) }}
                </p>
                <p>
                  <strong>Expires At:</strong>
                  {{ key.expiresAt ? formatDate(key.expiresAt) : "Never" }}
                </p>
              </div>
            </q-card>
          </q-expansion-item>
        </template>
      </div>

      <q-page-scroller
        position="bottom-right"
        :scroll-offset="150"
        :offset="[18, 18]"
      >
        <q-btn fab icon="keyboard_arrow_up" color="accent" />
      </q-page-scroller>

      <!-- Create Key Dialog -->
      <q-dialog v-model="showCreateDialog" persistent>
        <q-card class="min-w-[500px]">
          <q-card-section
            class="bg-primary text-white flex justify-between items-center"
          >
            <div class="text-h6">Create New API Key</div>
            <q-btn
              flat
              round
              dense
              icon="close"
              @click="showCreateDialog = false"
            />
          </q-card-section>

          <q-card-section>
            <api-key-form @refresh="handleCreateClose" />
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { useKeysStore } from "src/stores/keys-store";
import { onMounted, ref, computed } from "vue";
import ApiKeyForm from "src/components/ApiKeyForm.vue";
import {
  showSuccess,
  showError,
  showConfirmation,
} from "src/utils/notifications";
import { copyToClipboard } from "quasar";

const keysStore = useKeysStore();
const iKeys = computed(() => ({ results: keysStore.keys }));
const newKeyFormExpanded = ref(false);
const showCreateDialog = ref(false);
const searchFilter = ref("");

const refresh = async () => {
  await keysStore.fetchKeys();
  newKeyFormExpanded.value = false;
};

// Copy key to clipboard
const copyKeyToClipboard = (key) => {
  copyToClipboard(key)
    .then(() => {
      showSuccess("API key copied to clipboard");
    })
    .catch(() => {
      showError("Failed to copy to clipboard");
    });
};

// Get expiration status badge info
const getExpirationBadge = (expiresAt) => {
  if (!expiresAt) {
    return { label: "Never", color: "blue" };
  }

  const now = new Date();
  const expiresDate = new Date(expiresAt);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (expiresDate <= now) {
    return { label: "Expired", color: "red" };
  }

  if (expiresDate <= thirtyDaysFromNow) {
    const daysUntil = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));
    return { label: `${daysUntil} days`, color: "orange" };
  }

  return { label: formatDate(expiresAt), color: "green" };
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
  }).format(date);
};

// Filtered keys based on search
const filteredKeys = computed(() => {
  if (!searchFilter.value) return keysStore.keys;

  const searchLower = searchFilter.value.toLowerCase();
  return keysStore.keys.filter(
    (k) =>
      k.name?.toLowerCase().includes(searchLower) ||
      k.description?.toLowerCase().includes(searchLower) ||
      k.uid?.toLowerCase().includes(searchLower),
  );
});

onMounted(async () => {
  await keysStore.fetchKeys();
});

const onSubmit = async (uid) => {
  try {
    // Find the key by UID in the store
    const key = keysStore.keys.find((k) => k.uid === uid);
    if (!key) {
      showError("Key not found");
      return;
    }

    await keysStore.updateKey(uid, {
      name: key.name ?? "",
      description: key.description ?? "",
    });
    showSuccess(`${uid} Updated`);
  } catch (error) {
    showError(`Failed to update key: ${error.message}`);
    await keysStore.fetchKeys();
  }
};

const delKey = async (uid) => {
  showConfirmation(`Really delete ${uid}?`, async () => {
    try {
      await keysStore.deleteKey(uid);
      showSuccess("Key deleted");
    } catch (error) {
      console.log(error);
      showError(`Failed to delete key: ${error.message}`);
    }
  });
};

const handleCreateClose = async () => {
  showCreateDialog.value = false;
  await keysStore.fetchKeys();
};
</script>
