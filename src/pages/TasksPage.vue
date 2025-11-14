<template>
  <q-page class="p-6">
    <!-- Header with filters and actions -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Tasks</h1>
        <p class="text-sm text-gray-600">
          Monitor and manage Meilisearch tasks
        </p>
      </div>
      <div class="flex gap-2">
        <q-btn
          outline
          color="primary"
          icon="refresh"
          label="Refresh"
          @click="loadTasks"
          :loading="loading"
        />
        <q-btn
          v-if="selectedTasks.length > 0"
          outline
          color="negative"
          icon="cancel"
          :label="`Cancel ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}`"
          @click="cancelSelectedTasks"
        />
      </div>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <q-card flat bordered>
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-blue-500">
            {{ taskStats.total }}
          </div>
          <div class="text-sm text-gray-600">Total Tasks</div>
        </q-card-section>
      </q-card>
      <q-card flat bordered>
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-green-500">
            {{ taskStats.succeeded }}
          </div>
          <div class="text-sm text-gray-600">Succeeded</div>
        </q-card-section>
      </q-card>
      <q-card flat bordered>
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-orange-500">
            {{ taskStats.processing }}
          </div>
          <div class="text-sm text-gray-600">Processing</div>
        </q-card-section>
      </q-card>
      <q-card flat bordered>
        <q-card-section class="text-center">
          <div class="text-3xl font-bold text-red-500">
            {{ taskStats.failed }}
          </div>
          <div class="text-sm text-gray-600">Failed</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="mb-4">
      <q-card-section>
        <div class="flex flex-wrap gap-4 items-end">
          <q-input
            v-model="filter"
            label="Search"
            outlined
            dense
            class="flex-1 min-w-[200px]"
            clearable
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            label="Status"
            outlined
            dense
            multiple
            clearable
            class="min-w-[200px]"
          >
            <template #prepend>
              <q-icon name="filter_list" />
            </template>
          </q-select>

          <q-select
            v-model="typeFilter"
            :options="typeOptions"
            label="Type"
            outlined
            dense
            multiple
            clearable
            class="min-w-[200px]"
          >
            <template #prepend>
              <q-icon name="category" />
            </template>
          </q-select>

          <q-select
            v-model="indexFilter"
            :options="indexOptions"
            label="Index"
            outlined
            dense
            clearable
            class="min-w-[200px]"
          >
            <template #prepend>
              <q-icon name="storage" />
            </template>
          </q-select>
        </div>
      </q-card-section>
    </q-card>

    <!-- Tasks table -->
    <q-card flat bordered>
      <q-table
        :rows="filteredTasks"
        :columns="columns"
        :loading="loading"
        :rows-per-page-options="[10, 25, 50, 100]"
        v-model:expanded="expanded"
        v-model:selected="selectedTasks"
        row-key="uid"
        flat
        selection="multiple"
        :pagination="{ sortBy: 'uid', descending: true, rowsPerPage: 25 }"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-checkbox v-model="props.selected" dense />
            </q-td>
            <q-td key="uid" :props="props">
              <div class="font-mono text-sm">{{ props.row.uid }}</div>
            </q-td>
            <q-td key="status" :props="props">
              <q-badge
                :color="getStatusColor(props.row.status)"
                :label="props.row.status"
                class="text-xs"
              />
            </q-td>
            <q-td key="type" :props="props">
              <div class="flex items-center gap-2">
                <q-icon :name="getTypeIcon(props.row.type)" size="sm" />
                <span class="text-sm">{{ props.row.type }}</span>
              </div>
            </q-td>
            <q-td key="indexUid" :props="props">
              <div class="font-mono text-sm">
                {{ props.row.indexUid || "-" }}
              </div>
            </q-td>
            <q-td key="duration" :props="props">
              <span class="text-sm">{{
                formatDuration(props.row.duration)
              }}</span>
            </q-td>
            <q-td key="enqueuedAt" :props="props">
              <div class="text-xs text-gray-600">
                {{ formatDate(props.row.enqueuedAt) }}
              </div>
            </q-td>
            <q-td key="actions" :props="props">
              <div class="flex gap-1">
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="visibility"
                  @click="toggleExpand(props)"
                >
                  <q-tooltip>View details</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="
                    props.row.status === 'enqueued' ||
                    props.row.status === 'processing'
                  "
                  flat
                  dense
                  round
                  size="sm"
                  icon="cancel"
                  color="negative"
                  @click="cancelTask(props.row.uid)"
                >
                  <q-tooltip>Cancel task</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
          <q-tr v-if="props.expand" :props="props">
            <q-td colspan="100%">
              <div class="p-4 bg-gray-50 dark:bg-gray-800">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Task details -->
                  <div>
                    <div class="text-subtitle2 mb-2">Task Details</div>
                    <div class="space-y-2 text-sm">
                      <div
                        v-for="item in getTaskDetails(props.row)"
                        :key="item.label"
                        class="flex justify-between"
                      >
                        <span class="text-gray-600 dark:text-gray-400">{{
                          item.label
                        }}</span>
                        <component
                          :is="item.component || 'span'"
                          v-bind="item.props"
                        >
                          {{ item.value }}
                        </component>
                      </div>
                    </div>
                  </div>

                  <!-- Timestamps -->
                  <div>
                    <div class="text-subtitle2 mb-2">Timeline</div>
                    <div class="space-y-2 text-sm">
                      <div
                        v-for="item in getTimeline(props.row)"
                        :key="item.label"
                        class="flex justify-between"
                      >
                        <span class="text-gray-600 dark:text-gray-400">{{
                          item.label
                        }}</span>
                        <span>{{ item.value }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Error details if present -->
                  <div v-if="props.row.error" class="md:col-span-2">
                    <div class="text-subtitle2 mb-2 text-red-600">Error</div>
                    <q-banner dense class="bg-red-100 text-red-900">
                      <div class="space-y-1 text-sm">
                        <div>
                          <strong>Code:</strong> {{ props.row.error.code }}
                        </div>
                        <div>
                          <strong>Type:</strong> {{ props.row.error.type }}
                        </div>
                        <div>
                          <strong>Message:</strong>
                          {{ props.row.error.message }}
                        </div>
                        <div v-if="props.row.error.link">
                          <strong>Link:</strong>
                          <a
                            :href="props.row.error.link"
                            target="_blank"
                            class="text-blue-600 underline"
                            >{{ props.row.error.link }}</a
                          >
                        </div>
                      </div>
                    </q-banner>
                  </div>

                  <!-- Details object -->
                  <div class="md:col-span-2">
                    <div class="text-subtitle2 mb-2">Additional Details</div>
                    <q-card
                      flat
                      bordered
                      class="bg-gray-900 dark:bg-gray-950 text-white"
                    >
                      <q-card-section>
                        <pre class="text-xs overflow-auto">{{
                          JSON.stringify(props.row.details || {}, null, 2)
                        }}</pre>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="text-center p-8">
            <q-icon name="info" size="xl" color="grey-5" class="mb-4" />
            <div class="text-h6 text-grey-7">No tasks found</div>
            <div class="text-caption text-grey-6">
              Tasks will appear here once operations are performed
            </div>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { useTasksStore } from "src/stores/tasks-store";
import { onMounted, onUnmounted, ref, computed } from "vue";
import {
  showSuccess,
  showError,
  showConfirmation,
} from "src/utils/notifications";

const tasksStore = useTasksStore();
const filter = ref("");
const expanded = ref([]);
const selectedTasks = ref([]);

// Filters
const statusFilter = ref([]);
const typeFilter = ref([]);
const indexFilter = ref(null);

const statusOptions = [
  "enqueued",
  "processing",
  "succeeded",
  "failed",
  "canceled",
];

const loadTasks = async () => {
  try {
    await tasksStore.fetchTasks();
    showSuccess("Tasks refreshed");
  } catch (error) {
    console.error("Failed to load tasks:", error);
    showError(`Failed to load tasks: ${error.message}`);
  }
};

const cancelTask = async (taskUid) => {
  showConfirmation(`Cancel task ${taskUid}?`, async () => {
    try {
      await tasksStore.cancelTasks([taskUid]);
      showSuccess(`Task ${taskUid} canceled`);
    } catch (error) {
      showError(`Failed to cancel task: ${error.message}`);
    }
  });
};

const cancelSelectedTasks = async () => {
  const uids = selectedTasks.value.map((t) => t.uid);
  showConfirmation(
    `Cancel ${uids.length} selected task${uids.length > 1 ? "s" : ""}?`,
    async () => {
      try {
        await tasksStore.cancelTasks(uids);
        showSuccess(`${uids.length} task(s) canceled`);
        selectedTasks.value = [];
      } catch (error) {
        showError(`Failed to cancel tasks: ${error.message}`);
      }
    },
  );
};

const toggleExpand = (props) => {
  props.expand = !props.expand;
};

// Build task details array
const getTaskDetails = (task) => [
  {
    label: "UID:",
    value: task.uid,
    component: "span",
    props: { class: "font-mono" },
  },
  {
    label: "Status:",
    component: "q-badge",
    props: {
      color: getStatusColor(task.status),
      label: task.status,
    },
  },
  { label: "Type:", value: task.type },
  {
    label: "Index:",
    value: task.indexUid || "N/A",
    component: "span",
    props: { class: "font-mono" },
  },
  { label: "Duration:", value: formatDuration(task.duration) },
];

// Build timeline array
const getTimeline = (task) => {
  const timeline = [
    { label: "Enqueued:", value: formatDate(task.enqueuedAt) },
    {
      label: "Started:",
      value: task.startedAt ? formatDate(task.startedAt) : "Not started",
    },
    {
      label: "Finished:",
      value: task.finishedAt ? formatDate(task.finishedAt) : "Not finished",
    },
  ];

  if (task.canceledBy) {
    timeline.push({ label: "Canceled by:", value: task.canceledBy });
  }

  return timeline;
};

// Computed - use store getters and state
const loading = computed(() => tasksStore.loading);
const typeOptions = computed(() => tasksStore.taskTypes);
const indexOptions = computed(() => tasksStore.indexUids);
const taskStats = computed(() => tasksStore.stats);

// Filtered tasks
const filteredTasks = computed(() => {
  let tasks = tasksStore.tasks || [];

  // Apply text filter
  if (filter.value) {
    const searchLower = filter.value.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.uid?.toString().includes(searchLower) ||
        t.type?.toLowerCase().includes(searchLower) ||
        t.indexUid?.toLowerCase().includes(searchLower) ||
        t.status?.toLowerCase().includes(searchLower),
    );
  }

  // Apply status filter
  if (statusFilter.value.length > 0) {
    tasks = tasks.filter((t) => statusFilter.value.includes(t.status));
  }

  // Apply type filter
  if (typeFilter.value.length > 0) {
    tasks = tasks.filter((t) => typeFilter.value.includes(t.type));
  }

  // Apply index filter
  if (indexFilter.value) {
    tasks = tasks.filter((t) => t.indexUid === indexFilter.value);
  }

  return tasks;
});

// Table columns
const columnLabels = {
  uid: "UID",
  status: "Status",
  type: "Type",
  indexUid: "Index",
  duration: "Duration",
  enqueuedAt: "Enqueued",
};

const columns = [
  ...Object.entries(columnLabels).map(([field, label]) => ({
    name: field,
    label,
    field,
    align: "left",
    sortable: true,
  })),
  { name: "actions", label: "Actions", align: "center" },
];

// Utility functions
const getStatusColor = (status) => {
  switch (status) {
    case "succeeded":
      return "positive";
    case "failed":
      return "negative";
    case "processing":
      return "warning";
    case "enqueued":
      return "info";
    case "canceled":
      return "grey";
    default:
      return "grey";
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case "documentAdditionOrUpdate":
      return "add_circle";
    case "documentDeletion":
      return "delete";
    case "settingsUpdate":
      return "settings";
    case "indexCreation":
      return "add_box";
    case "indexDeletion":
      return "delete_forever";
    case "indexUpdate":
      return "edit";
    case "indexSwap":
      return "swap_horiz";
    case "taskCancelation":
      return "cancel";
    case "taskDeletion":
      return "delete_sweep";
    case "dumpCreation":
      return "backup";
    case "snapshotCreation":
      return "camera_alt";
    default:
      return "task";
  }
};

const formatDuration = (duration) => {
  if (!duration) return "N/A";
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?/);
  if (!match) return duration;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseFloat(match[3] || 0);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds.toFixed(2)}s`);

  return parts.join(" ");
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
};

onMounted(async () => {
  await loadTasks();
  // Start auto-refresh for active tasks (every 10 seconds)
  tasksStore.startAutoRefresh(10);
});

onUnmounted(() => {
  // Clean up auto-refresh when leaving page
  tasksStore.stopAutoRefresh();
});
</script>
