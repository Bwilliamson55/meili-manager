<template>
  <q-page class="p-6 bg-page">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="mm-page-title text-2xl">Indexes</h1>
        <p class="text-sm text-text-muted">{{ indexUrl }}</p>
        <p
          v-if="indexesStore.stats.pkgVersion"
          class="text-xs text-text-muted mt-1"
        >
          Meilisearch {{ indexesStore.stats.pkgVersion }}
        </p>
        <p
          v-if="indexesStore.stats.lastClusterUpdate"
          class="text-xs text-text-muted mt-0.5"
        >
          Stats at
          {{
            new Date(indexesStore.stats.lastClusterUpdate).toLocaleString()
          }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <q-btn
          v-if="continueTarget"
          unelevated
          square
          no-caps
          color="primary"
          icon="play_arrow"
          :label="`Continue ${continueTarget.uid}`"
          :to="continueTarget.to"
        >
          <q-tooltip
            >Resume {{ continueTarget.uid }} · {{ continueTarget.tab }}</q-tooltip
          >
        </q-btn>
        <q-btn
          outline
          square
          no-caps
          color="primary"
          icon="refresh"
          label="Refresh"
          @click="refresh"
          :loading="indexesStore.loading"
        />
        <q-btn
          outline
          square
          no-caps
          color="secondary"
          icon="download"
          label="Create dump"
          @click="createDump"
        >
          <q-tooltip>Queue a full database dump (async task)</q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          square
          no-caps
          color="primary"
          icon="add_box"
          label="New index"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <q-card flat bordered square class="bg-page-elevated">
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-primary">
            {{ indexesStore.stats.total }}
          </div>
          <div class="text-sm text-text-muted mt-1">Total indexes</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered square class="bg-page-elevated">
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-accent">
            {{ indexesStore.stats.totalDocuments.toLocaleString() }}
          </div>
          <div class="text-sm text-text-muted mt-1">Total documents</div>
        </q-card-section>
      </q-card>

      <q-card flat bordered square class="bg-page-elevated">
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-warning">
            {{ formatBytes(clusterUsedOrTotalBytes) }}
          </div>
          <div class="text-sm text-text-muted mt-1">
            {{ clusterDiskLabel }}
          </div>
          <div v-if="clusterAllocatedCaption" class="text-xs text-text-muted mt-1">
            {{ clusterAllocatedCaption }}
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered square class="bg-page-elevated">
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-secondary">
            {{ indexesStore.stats.recentlyUpdated }}
          </div>
          <div class="text-sm text-text-muted mt-1">Updated (24h)</div>
        </q-card-section>
      </q-card>
    </div>

    <q-card flat bordered square class="bg-page-elevated mb-6">
      <q-card-section class="py-3">
        <div class="flex items-center gap-3">
          <q-input
            v-model="searchFilter"
            dense
            outlined
            square
            placeholder="Search indexes by UID..."
            aria-label="Search indexes by UID"
            clearable
            class="flex-1"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-chip square color="primary" text-color="white" outline>
            {{ filteredIndexes.length }} shown
          </q-chip>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="filteredIndexes.length > 0">
      <q-card flat bordered square class="bg-page-elevated">
        <q-list separator>
          <q-item
            v-for="index in filteredIndexes"
            :key="index.uid"
            class="hover:bg-page"
          >
            <q-item-section>
              <q-item-label class="text-lg font-semibold text-text">
                {{ index.uid }}
              </q-item-label>
              <q-item-label caption class="text-text-muted">
                <span class="mr-4">
                  <q-icon name="event" size="xs" class="mr-1" />
                  Created: {{ formatDate(index.createdAt) }}
                </span>
                <span class="mr-4">
                  <q-icon name="update" size="xs" class="mr-1" />
                  Updated: {{ formatDate(index.updatedAt) }}
                </span>
                <span v-if="index.statsLoadError" class="text-negative">
                  Stats: unavailable ({{ index.statsLoadError }})
                </span>
                <span
                  v-else-if="typeof index.numberOfDocuments === 'number'"
                  class="mr-4"
                >
                  <q-icon name="description" size="xs" class="mr-1" />
                  {{ index.numberOfDocuments.toLocaleString() }} docs
                </span>
                <span v-if="typeof index.fieldCount === 'number'" class="mr-4">
                  <q-icon name="view_column" size="xs" class="mr-1" />
                  {{ index.fieldCount }} fields
                </span>
                <span
                  v-if="index.attrCounts && !index.statsLoadError"
                  class="block sm:inline mt-1 sm:mt-0 text-text-muted"
                >
                  F {{ formatAttr(index.attrCounts.filterable) }} · S
                  {{ formatAttr(index.attrCounts.searchable) }} · Sort
                  {{ formatAttr(index.attrCounts.sortable) }}
                  <q-tooltip
                    >Filterable, searchable, and sortable attribute
                    counts</q-tooltip
                  >
                </span>
                <span
                  v-if="typeof index.rawDocumentDbSize === 'number'"
                  class="block sm:inline mt-1 sm:mt-0 text-text-muted"
                >
                  Raw {{ formatBytes(index.rawDocumentDbSize) }}
                </span>
                <span
                  v-if="typeof index.avgDocumentSize === 'number'"
                  class="block sm:inline mt-1 sm:mt-0 text-text-muted"
                >
                  · Avg doc {{ formatBytes(index.avgDocumentSize) }}
                </span>
              </q-item-label>
              <div class="mt-2 flex flex-wrap gap-2 items-center">
                <q-chip
                  v-if="index.primaryKey"
                  dense
                  square
                  outline
                  color="primary"
                  icon="vpn_key"
                >
                  PK: {{ index.primaryKey }}
                </q-chip>
                <q-chip
                  v-if="index.isIndexing"
                  dense
                  square
                  color="warning"
                  text-color="dark"
                  icon="hourglass_empty"
                >
                  Indexing…
                </q-chip>
                <q-chip
                  v-if="(index.numberOfEmbeddedDocuments ?? 0) > 0"
                  dense
                  square
                  outline
                  color="accent"
                  icon="scatter_plot"
                >
                  {{ index.numberOfEmbeddedDocuments }} embedded
                </q-chip>
              </div>
            </q-item-section>

            <q-item-section side class="flex-row gap-2">
              <q-btn
                flat
                square
                no-caps
                color="primary"
                :to="`/index-details/${index.uid}`"
                label="Open"
                icon="visibility"
              />
              <q-btn
                flat
                dense
                square
                color="negative"
                icon="delete"
                aria-label="Delete index"
                @click.stop.prevent="delIndex(index.uid)"
              >
                <q-tooltip>Delete index</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <div v-else class="text-center py-12">
      <q-icon name="inbox" size="64px" class="text-text-muted" />
      <p class="text-text-muted mt-4">
        {{
          searchFilter
            ? "No indexes match your search"
            : "No indexes yet. Create one to get started."
        }}
      </p>
    </div>

    <q-dialog v-model="showCreateDialog" persistent>
      <q-card square class="min-w-[400px] bg-page-elevated">
        <q-card-section
          class="bg-primary text-on-primary flex justify-between items-center"
        >
          <div class="text-h6">Create new index</div>
          <q-btn
            flat
            square
            dense
            icon="close"
            aria-label="Close"
            @click="showCreateDialog = false"
          />
        </q-card-section>

        <q-card-section class="space-y-4">
          <q-input
            v-model="newIndexName"
            label="Index UID"
            hint="Unique identifier for the index"
            outlined
            dense
            square
            :rules="[(val) => (val && val.length > 0) || 'Required']"
          />
          <q-input
            v-model="newIndexUuid"
            label="Primary key (optional)"
            hint="Field name to use as document ID"
            outlined
            dense
            square
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat square no-caps label="Cancel" @click="showCreateDialog = false" />
          <q-btn
            unelevated
            square
            no-caps
            color="primary"
            label="Create index"
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
      <q-btn
        fab
        square
        icon="keyboard_arrow_up"
        color="accent"
        aria-label="Scroll to top"
      />
    </q-page-scroller>
  </q-page>
</template>

<script setup>
import { useSettingsStore } from "src/meili-core/stores/settings-store";
import { useIndexesStore } from "src/meili-core/stores/indexes-store";
import { storeToRefs } from "pinia";
import { ref, onMounted, watch, computed } from "vue";
import {
  showSuccess,
  showError,
  confirmDialog,
} from "src/utils/notifications";
import { formatBytes } from "src/meili-core/utils/format-bytes";

const showCreateDialog = ref(false);
const newIndexName = ref("");
const newIndexUuid = ref("");
const searchFilter = ref("");
const theSettings = useSettingsStore();
const indexesStore = useIndexesStore();
const { indexUrl, confirmed, currentInstance, lastIndexUid, lastIndexTab } =
  storeToRefs(theSettings);

const formatDate = (dateString) =>
  new Intl.DateTimeFormat("default", { dateStyle: "long" }).format(
    new Date(dateString),
  );

/** @param {number|string|null|undefined} v */
const formatAttr = (v) => {
  if (v === "*") {
    return "*";
  }
  if (typeof v === "number") {
    return String(v);
  }
  return "-";
};

const continueTarget = computed(() => {
  const uid = lastIndexUid.value;
  if (!uid) return null;
  if (
    indexesStore.indexes.length > 0 &&
    !indexesStore.indexes.some((idx) => idx.uid === uid)
  ) {
    return null;
  }
  const tab = lastIndexTab.value || "documents";
  return {
    uid,
    tab,
    to: {
      path: `/index-details/${uid}`,
      query: { tab },
    },
  };
});

/** Prefer used size from GET /stats when the server reports it. */
const clusterUsedOrTotalBytes = computed(() => {
  const s = indexesStore.stats;
  const used = s.usedDatabaseSize;
  if (typeof used === "number") {
    return used;
  }
  return s.databaseSize ?? null;
});

const clusterDiskLabel = computed(() => {
  const s = indexesStore.stats;
  if (typeof s.usedDatabaseSize === "number") {
    return "Used database size (cluster)";
  }
  return "Database size (cluster)";
});

const clusterAllocatedCaption = computed(() => {
  const s = indexesStore.stats;
  const alloc = s.databaseSize;
  const used = s.usedDatabaseSize;
  if (typeof alloc !== "number" || typeof used !== "number") {
    return null;
  }
  if (alloc === used) {
    return null;
  }
  return `Allocated ${formatBytes(alloc)}`;
});

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

watch(confirmed, async (ok) => {
  if (ok) {
    await loadInstance();
  }
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
  if (confirmed.value) {
    await loadInstance();
  }
});

const newIndex = async () => {
  try {
    await indexesStore.createIndex(newIndexName.value, {
      primaryKey: newIndexUuid.value || undefined,
    });

    showSuccess(`Index "${newIndexName.value}" created`);

    newIndexName.value = "";
    newIndexUuid.value = "";
    showCreateDialog.value = false;
  } catch (error) {
    console.log(error);
    showError(`Failed to create index: ${error.message}`);
  }
};

const createDump = async () => {
  const ok = await confirmDialog({
    title: "Create dump",
    message: `Create a dump snapshot of ${indexUrl.value}?`,
    okLabel: "Create dump",
    okColor: "secondary",
  });
  if (!ok) {
    return;
  }
  try {
    const response = await indexesStore.createDump();

    showSuccess(
      `Dump task created successfully:\nEnqueued: ${response.enqueuedAt}\nTask ID: ${response.taskUid}\nStatus: ${response.status}`,
    );
  } catch (error) {
    console.log(error);
    showError(`Failed to create dump: ${error.message}`);
  }
};

const delIndex = async (indexUidString) => {
  const ok = await confirmDialog({
    title: "Delete index",
    message: `Really delete index "${indexUidString}"? This cannot be undone.`,
    okLabel: "Delete",
    okColor: "negative",
  });
  if (!ok) {
    return;
  }
  try {
    await indexesStore.deleteIndex(indexUidString);
    showSuccess(`Index "${indexUidString}" deleted`);
  } catch (error) {
    console.log(error);
    showError(`Failed to delete index: ${error.message}`);
  }
};
</script>
