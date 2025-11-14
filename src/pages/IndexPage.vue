<template>
  <q-page class="p-6">
    <div v-if="confirmed">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold dark:text-white">Indexes</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ indexUrl }}
          </p>
        </div>
        <div class="flex gap-2">
          <q-btn
            outline
            color="primary"
            icon="refresh"
            label="Refresh"
            @click="refresh"
            :loading="indexesStore.loading"
          />
          <q-btn
            outline
            color="secondary"
            icon="download"
            label="Create Dump"
            @click="createDump"
          />
          <q-btn
            color="primary"
            icon="add_box"
            label="New Index"
            @click="showCreateDialog = true"
          />
        </div>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-3xl font-bold text-primary">
              {{ indexesStore.stats.total }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Indexes
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-3xl font-bold text-blue-600">
              {{ indexesStore.stats.totalDocuments.toLocaleString() }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Documents
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section class="text-center">
            <div class="text-3xl font-bold text-green-600">
              {{ indexesStore.stats.recentlyUpdated }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Updated (24h)
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Search filter -->
      <q-card flat bordered class="mb-6">
        <q-card-section class="py-3">
          <q-input
            v-model="searchFilter"
            dense
            outlined
            placeholder="Search indexes by UID..."
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <!-- Indexes list -->
      <div v-if="filteredIndexes.length > 0">
        <q-card flat bordered>
          <q-list separator>
            <q-item
              v-for="index in filteredIndexes"
              :key="index.uid"
              class="dark:hover:bg-gray-800"
            >
              <q-item-section>
                <q-item-label class="text-lg font-semibold dark:text-white">
                  {{ index.uid }}
                </q-item-label>
                <q-item-label caption class="dark:text-gray-400">
                  <span class="mr-4">
                    <q-icon name="event" size="xs" class="mr-1" />
                    Created: {{ formatDate(index.createdAt) }}
                  </span>
                  <span class="mr-4">
                    <q-icon name="update" size="xs" class="mr-1" />
                    Updated: {{ formatDate(index.updatedAt) }}
                  </span>
                  <span v-if="index.numberOfDocuments !== undefined">
                    <q-icon name="description" size="xs" class="mr-1" />
                    {{ index.numberOfDocuments.toLocaleString() }} documents
                  </span>
                </q-item-label>
              </q-item-section>

              <q-item-section side class="flex-row gap-2">
                <q-btn
                  flat
                  color="primary"
                  :to="`/index-details/${index.uid}`"
                  label="Details"
                  icon="visibility"
                />
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  icon="delete"
                  @click="delIndex(index.uid)"
                >
                  <q-tooltip>Delete Index</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <q-icon
          name="inbox"
          size="64px"
          class="text-gray-400 dark:text-gray-600"
        />
        <p class="text-gray-600 dark:text-gray-400 mt-4">
          {{
            searchFilter
              ? "No indexes match your search"
              : "No indexes yet. Create one to get started!"
          }}
        </p>
      </div>
    </div>

    <!-- Not configured state -->
    <div v-else class="flex items-center justify-center h-96">
      <div class="text-center">
        <q-icon
          name="settings"
          size="64px"
          class="text-gray-400 dark:text-gray-600"
        />
        <p class="text-gray-600 dark:text-gray-400 mt-4">
          Please configure your Meilisearch instance in the sidebar
        </p>
      </div>
    </div>

    <!-- Create Index Dialog -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card class="min-w-[400px]">
        <q-card-section
          class="bg-primary text-white flex justify-between items-center"
        >
          <div class="text-h6">Create New Index</div>
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="showCreateDialog = false"
          />
        </q-card-section>

        <q-card-section class="space-y-4">
          <q-input
            v-model="newIndexName"
            label="Index UID"
            hint="Unique identifier for the index"
            filled
            :rules="[(val) => (val && val.length > 0) || 'Required']"
          />
          <q-input
            v-model="newIndexUuid"
            label="Primary Key (Optional)"
            hint="Field name to use as document ID"
            filled
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showCreateDialog = false" />
          <q-btn
            color="primary"
            label="Create Index"
            @click="newIndex"
            :loading="indexesStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-scroller
      position="bottom-right"
      :scroll-offset="150"
      :offset="[18, 18]"
    >
      <q-btn fab icon="keyboard_arrow_up" color="accent" />
    </q-page-scroller>
  </q-page>
</template>

<script setup>
import { useSettingsStore } from "src/stores/settings-store";
import { useIndexesStore } from "src/stores/indexes-store";
import { storeToRefs } from "pinia";
import { ref, onMounted, watch, computed } from "vue";
import {
  showSuccess,
  showError,
  showConfirmation,
} from "src/utils/notifications";

const showCreateDialog = ref(false);
const newIndexName = ref("");
const newIndexUuid = ref("");
const searchFilter = ref("");
const theSettings = useSettingsStore();
const indexesStore = useIndexesStore();
const { indexUrl, confirmed, currentInstance } = storeToRefs(theSettings);

const formatDate = (dateString) =>
  new Intl.DateTimeFormat("default", { dateStyle: "long" }).format(
    new Date(dateString),
  );

// Filtered indexes based on search
const filteredIndexes = computed(() => {
  if (!searchFilter.value) return indexesStore.indexes;

  const searchLower = searchFilter.value.toLowerCase();
  return indexesStore.indexes.filter((idx) =>
    idx.uid?.toLowerCase().includes(searchLower),
  );
});

watch(currentInstance, async () => {
  await loadInstance();
});

const loadInstance = async () => {
  try {
    await indexesStore.fetchIndexes();
  } catch (e) {
    console.log(e);
    if (!e.message?.includes("not configured")) {
      showError(`Failed to load indexes: ${e.message}`);
    }
  }
};

const refresh = async () => {
  await loadInstance();
};

onMounted(async () => {
  // Load indexes if credentials are configured
  if (indexUrl.value && indexUrl.value !== "https://#") {
    await loadInstance();
  }
});

const newIndex = async () => {
  try {
    await indexesStore.createIndex(newIndexName.value, {
      primaryKey: newIndexUuid.value || undefined,
    });

    showSuccess(`Index "${newIndexName.value}" created`);

    // Reset form and close dialog
    newIndexName.value = "";
    newIndexUuid.value = "";
    showCreateDialog.value = false;
  } catch (error) {
    console.log(error);
    showError(`Failed to create index: ${error.message}`);
  }
};

const createDump = async () => {
  showConfirmation(`Create dump of ${indexUrl.value}?`, async () => {
    try {
      const response = await indexesStore.createDump();

      showSuccess(
        `Dump task created successfully:\nEnqueued: ${response.enqueuedAt}\nTask ID: ${response.taskUid}\nStatus: ${response.status}`,
      );
    } catch (error) {
      console.log(error);
      showError(`Failed to create dump: ${error.message}`);
    }
  });
};

const delIndex = async (indexUidString) => {
  showConfirmation(`Really delete "${indexUidString}"?`, async () => {
    try {
      await indexesStore.deleteIndex(indexUidString);
      showSuccess(`Index "${indexUidString}" deleted`);
    } catch (error) {
      console.log(error);
      showError(`Failed to delete index: ${error.message}`);
    }
  });
};
</script>
