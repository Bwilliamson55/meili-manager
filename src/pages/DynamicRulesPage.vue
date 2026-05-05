<template>
  <q-page class="p-6">
    <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold">Dynamic search rules</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Experimental: condition-based pinning via Meilisearch
          <code class="text-xs">dynamicSearchRules</code>
        </p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <q-btn
          outline
          color="primary"
          icon="refresh"
          label="Refresh"
          :loading="loading || featuresLoading"
          @click="refreshAll"
        />
        <q-btn
          color="primary"
          icon="add"
          label="New rule"
          :disable="!canMutateRules"
          @click="openCreate"
        />
      </div>
    </div>

    <q-banner
      v-if="!confirmed"
      rounded
      class="bg-red-2 text-red-10 mb-4"
    >
      Configure Meilisearch credentials in the sidebar first.
    </q-banner>

    <q-banner
      v-else-if="experimentalFeaturesError"
      rounded
      class="bg-amber-2 text-amber-10 mb-4"
    >
      Could not read experimental features:
      {{ experimentalFeaturesError }}. Your server may be older than v1.41 or
      the key may lack access.
    </q-banner>

    <q-banner
      v-else-if="dynamicSearchRulesEnabled === false"
      rounded
      class="bg-amber-2 text-amber-10 mb-4"
    >
      <template #avatar><q-icon name="info" color="amber" /></template>
      Dynamic search rules are disabled on this instance. Enable the
      experimental flag to create or apply rules.
      <template #action>
        <q-btn
          flat
          dense
          label="Enable dynamicSearchRules"
          color="amber"
          :loading="enablingFeature"
          @click="enableDynamicRules"
        />
      </template>
    </q-banner>

    <q-banner
      v-else-if="dynamicSearchRulesEnabled === true"
      rounded
      class="bg-green-2 text-green-10 mb-4"
    >
      <template #avatar><q-icon name="check_circle" color="positive" /></template>
      Dynamic search rules are <strong>enabled</strong> for this instance.
    </q-banner>

    <q-banner rounded class="bg-grey-2 text-grey-9 mb-4">
      <strong>Priority:</strong> lower numbers win. Same position → ties broken
      by ascending priority. <strong>Conditions:</strong> all must match (AND).
    </q-banner>

    <q-card flat bordered class="mb-4">
      <q-card-section>
        <div class="flex flex-wrap gap-4 items-end">
          <q-select
            v-model="listActiveFilter"
            :options="activeFilterOptions"
            label="Active"
            outlined
            dense
            emit-value
            map-options
            clearable
            class="min-w-[160px]"
            :disable="!canLoadRules"
          />
          <q-input
            v-model="attributePatternsInput"
            label="Rule UID patterns (comma-separated, e.g. promo*,bf-*)"
            outlined
            dense
            class="flex-1 min-w-[240px]"
            clearable
            :disable="!canLoadRules"
            @keyup.enter="applyListFilters"
          />
          <q-input
            v-model.number="listLimit"
            type="number"
            label="Page size"
            outlined
            dense
            class="w-28"
            :min="1"
            :max="100"
            :disable="!canLoadRules"
          />
          <q-btn
            flat
            color="primary"
            label="Apply filters"
            :disable="!canLoadRules"
            @click="applyListFilters"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-table
      flat
      bordered
      :rows="rulesResults"
      :columns="columns"
      row-key="uid"
      :loading="loading"
      :pagination="{ rowsPerPage: 0 }"
      hide-pagination
    >
      <template #body-cell-conditions="props">
        <q-td :props="props">
          <span class="text-caption">{{ summarizeConditions(props.row) }}</span>
        </q-td>
      </template>
      <template #body-cell-actionsCol="props">
        <q-td :props="props">
          <span class="text-caption">{{ summarizePins(props.row) }}</span>
        </q-td>
      </template>
      <template #body-cell-op="props">
        <q-td :props="props">
          <q-btn
            dense
            flat
            round
            icon="edit"
            color="primary"
            :disable="!canMutateRules"
            @click="openEdit(props.row.uid)"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn
            dense
            flat
            round
            icon="science"
            color="secondary"
            :disable="!canReadRules || !props.row?.uid"
            @click="openTest(props.row)"
          >
            <q-tooltip>Test search</q-tooltip>
          </q-btn>
          <q-btn
            dense
            flat
            round
            icon="delete"
            color="negative"
            :disable="!canMutateRules"
            @click="confirmDelete(props.row.uid)"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <div
      v-if="listTotal > listLimit"
      class="flex items-center justify-between mt-4 flex-wrap gap-2"
    >
      <span class="text-caption">
        Showing {{ listOffset }} –
        {{ Math.min(listOffset + rulesResults.length, listTotal) }} of
        {{ listTotal }}
      </span>
      <div class="flex gap-2">
        <q-btn
          outline
          dense
          label="Previous"
          :disable="listOffset <= 0 || loading"
          @click="pagePrev"
        />
        <q-btn
          outline
          dense
          label="Next"
          :disable="listOffset + rulesResults.length >= listTotal || loading"
          @click="pageNext"
        />
      </div>
    </div>

    <div v-if="listError" class="text-negative text-caption mt-4">
      {{ listError }}
    </div>

    <DynamicRuleEditorDialog
      v-model="editorOpen"
      :mode="editorMode"
      :rule-uid="editorRuleUid"
      @saved="onRuleSaved"
    />

    <DynamicRuleTestDialog
      v-model="testOpen"
      :rule-uid="testRuleUid"
      :rule="testRule"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "src/stores/settings-store";
import { useDynamicRulesStore } from "src/stores/dynamic-rules-store";
import { useIndexesStore } from "src/stores/indexes-store";
import DynamicRuleEditorDialog from "src/components/dynamicRules/DynamicRuleEditorDialog.vue";
import DynamicRuleTestDialog from "src/components/dynamicRules/DynamicRuleTestDialog.vue";
import {
  showError,
  showSuccess,
  confirmDialog,
} from "src/utils/notifications";

const dynamicRules = useDynamicRulesStore();
const indexesStore = useIndexesStore();

const {
  experimentalFeatures,
  experimentalFeaturesError,
  rulesResults,
  listOffset,
  listLimit,
  listTotal,
  listError,
  loading,
  attributePatternsInput,
  listActiveFilter,
} = storeToRefs(dynamicRules);

const { confirmed } = storeToRefs(useSettingsStore());

const dynamicSearchRulesEnabled = computed(
  () => experimentalFeatures.value?.dynamicSearchRules,
);

const featuresLoading = ref(false);
const enablingFeature = ref(false);

const editorOpen = ref(false);
const editorMode = ref("create");
const editorRuleUid = ref("");

const testOpen = ref(false);
const testRuleUid = ref("");
const testRule = ref(null);

const activeFilterOptions = [
  { label: "Active only", value: true },
  { label: "Inactive only", value: false },
];

onMounted(() => {
  if (confirmed.value) {
    initPage();
  }
});

watch(confirmed, (ok) => {
  if (ok) initPage();
});

async function initPage() {
  featuresLoading.value = true;
  try {
    await indexesStore.fetchIndexes().catch(() => {});
    await dynamicRules.loadExperimentalFeatures();
    if (dynamicRules.dynamicSearchRulesEnabled === true) {
      await dynamicRules.fetchRulesList().catch(() => {});
    }
  } finally {
    featuresLoading.value = false;
  }
}

async function refreshAll() {
  await initPage();
}

const canReadRules = computed(() => confirmed.value && dynamicSearchRulesEnabled.value === true);

const canLoadRules = computed(() => canReadRules.value && !experimentalFeaturesError.value);

const canMutateRules = computed(() => canLoadRules.value);

async function enableDynamicRules() {
  enablingFeature.value = true;
  try {
    await dynamicRules.setDynamicSearchRulesEnabled(true);
    showSuccess("dynamicSearchRules enabled.");
    await dynamicRules.fetchRulesList();
  } catch (e) {
    showError(e?.message || String(e));
  } finally {
    enablingFeature.value = false;
  }
}

function applyListFilters() {
  dynamicRules.setListPage(0);
  dynamicRules.fetchRulesList().catch((e) => showError(e?.message || String(e)));
}

function pagePrev() {
  const lim = Number(listLimit.value) || 20;
  dynamicRules.setListPage(Math.max(0, (Number(listOffset.value) || 0) - lim));
  dynamicRules.fetchRulesList().catch((e) => showError(e?.message || String(e)));
}

function pageNext() {
  const lim = Number(listLimit.value) || 20;
  dynamicRules.setListPage((Number(listOffset.value) || 0) + lim);
  dynamicRules.fetchRulesList().catch((e) => showError(e?.message || String(e)));
}

watch(listLimit, () => {
  dynamicRules.setListPage(0);
});

const columns = [
  { name: "uid", label: "UID", field: "uid", align: "left", sortable: false },
  {
    name: "description",
    label: "Description",
    field: "description",
    align: "left",
    sortable: false,
  },
  {
    name: "priority",
    label: "Priority",
    field: "priority",
    align: "left",
    sortable: false,
  },
  {
    name: "active",
    label: "Active",
    field: "active",
    align: "left",
    sortable: false,
  },
  {
    name: "conditions",
    label: "Conditions",
    field: "conditions",
    align: "left",
    sortable: false,
  },
  {
    name: "actionsCol",
    label: "Pins",
    field: "actions",
    align: "left",
    sortable: false,
  },
  { name: "op", label: "", field: "op", align: "right", sortable: false },
];

function summarizeConditions(row) {
  const c = row?.conditions;
  if (!Array.isArray(c) || !c.length) return "—";
  return c
    .map((x) => {
      if (x.scope === "query") {
        if (x.isEmpty) return "empty query";
        if (x.contains) return `q ⊃ "${x.contains}"`;
        return "query";
      }
      if (x.scope === "time") return `time ${x.start || "…"}→${x.end || "…"}`;
      return "?";
    })
    .join(" AND ");
}

function summarizePins(row) {
  const a = row?.actions;
  if (!Array.isArray(a) || !a.length) return "—";
  return a
    .map((x) => {
      const uid = x.selector?.indexUid;
      const id = x.selector?.id;
      const pos = x.action?.position;
      return `${uid}:${id}@${pos}`;
    })
    .join("; ");
}

function openCreate() {
  editorMode.value = "create";
  editorRuleUid.value = "";
  editorOpen.value = true;
}

function openEdit(uid) {
  editorMode.value = "edit";
  editorRuleUid.value = uid;
  editorOpen.value = true;
}

function openTest(row) {
  testRuleUid.value = row?.uid || "";
  testRule.value = row;
  testOpen.value = true;
}

async function confirmDelete(uid) {
  if (!uid) return;
  const ok = await confirmDialog({
    title: "Delete rule",
    message: `Delete dynamic search rule "${uid}"?`,
    okLabel: "Delete",
    okColor: "negative",
  });
  if (!ok) return;
  try {
    await dynamicRules.removeRule(uid);
    showSuccess("Rule deleted.");
  } catch (e) {
    showError(e?.message || String(e));
  }
}

async function onRuleSaved() {
  showSuccess("Rule saved.");
  await dynamicRules.fetchRulesList().catch(() => {});
}
</script>
