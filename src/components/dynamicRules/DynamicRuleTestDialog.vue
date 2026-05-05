<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="max-w-3xl w-full mx-auto">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Test search: {{ ruleUid || "—" }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="flex flex-col gap-4">
        <q-banner v-if="!defaultIndexUid" rounded class="bg-amber-2 text-amber-10">
          This rule has no pin actions with an index; choose an index manually below.
        </q-banner>

        <q-select
          v-model="searchIndexUid"
          :options="indexOptions"
          label="Search index"
          outlined
          dense
          emit-value
          map-options
          use-input
          input-debounce="0"
          @filter="filterIndexes"
        />

        <q-input
          v-model="testQuery"
          label="Query (q)"
          outlined
          dense
          clearable
          hint="Prefilled from first “query contains” condition when possible"
        />

        <q-input
          v-model="filterExpr"
          label="Filter (optional Meilisearch expression)"
          outlined
          dense
          clearable
        />

        <div class="flex gap-2">
          <q-btn
            color="primary"
            icon="search"
            label="Run search"
            :loading="searching"
            :disable="!searchIndexUid"
            @click="runSearch"
          />
        </div>

        <div v-if="searchMeta !== null" class="text-caption text-grey-7">
          Processing time ms: {{ searchMeta?.processingTimeMs ?? "—" }} · hits:
          {{ hits.length }}
        </div>

        <q-table
          v-if="hits.length"
          flat
          bordered
          dense
          :rows="tableRows"
          :columns="columns"
          row-key="position"
        />
        <div v-else-if="ranOnce && !searching" class="text-grey-7 text-caption">
          No hits returned.
        </div>

        <q-banner v-if="expectations.length" rounded class="bg-grey-2 text-grey-9">
          <div class="text-weight-medium mb-1">Expected pins (from rule)</div>
          <ul class="q-pl-md q-my-none">
            <li v-for="(ex, i) in expectations" :key="i">
              Doc <code>{{ ex.id }}</code> at position <strong>{{ ex.position }}</strong>
              <span v-if="ex.foundAt !== null">
                → found at hit index <strong>{{ ex.foundAt }}</strong>
                <q-icon
                  v-if="ex.foundAt === ex.position"
                  name="check_circle"
                  color="positive"
                  class="q-ml-xs"
                />
                <q-icon
                  v-else-if="ex.foundAt >= 0"
                  name="warning"
                  color="warning"
                  class="q-ml-xs"
                />
              </span>
              <span v-else class="text-negative">→ not in first page of results</span>
            </li>
          </ul>
        </q-banner>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useSettingsStore } from "src/stores/settings-store";
import { useIndexesStore } from "src/stores/indexes-store";
import { showError } from "src/utils/notifications";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ruleUid: { type: String, default: "" },
  /** Full rule object from API */
  rule: { type: Object, default: null },
});

defineEmits(["update:modelValue"]);

const settings = useSettingsStore();
const indexesStore = useIndexesStore();

const searchIndexUid = ref("");
const testQuery = ref("");
const filterExpr = ref("");
const searching = ref(false);
/** Raw search hits; __docId is normalized for display/compare */
const hits = ref([]);
const searchMeta = ref(null);
const ranOnce = ref(false);
const indexOptions = ref([]);

const allIndexUids = computed(() =>
  (indexesStore.indexes || []).map((i) => i.uid).filter(Boolean),
);

const defaultIndexUid = computed(() => {
  const actions = props.rule?.actions;
  if (!Array.isArray(actions) || !actions.length) return "";
  const first = actions[0];
  const uid = first?.selector?.indexUid;
  return uid != null ? String(uid) : "";
});

const columns = [
  { name: "position", label: "#", field: "position", align: "left" },
  { name: "id", label: "Document ID", field: "id", align: "left" },
];

const tableRows = computed(() =>
  hits.value.map((h, idx) => ({
    position: idx,
    id: h.__docId != null ? String(h.__docId) : "—",
  })),
);

const expectations = computed(() => {
  const rule = props.rule;
  if (!rule?.actions?.length) return [];
  const results = [];
  const searchIx = searchIndexUid.value;
  for (const a of rule.actions) {
    const actionIx = a.selector?.indexUid != null ? String(a.selector.indexUid) : "";
    if (searchIx && actionIx && actionIx !== searchIx) {
      continue;
    }
    const id = a.selector?.id != null ? String(a.selector.id) : "";
    const pos =
      typeof a.action?.position === "number"
        ? a.action.position
        : Number(a.action?.position) || 0;
    if (!id) continue;
    const foundAt = hits.value.findIndex((h) => String(h.__docId) === id);
    results.push({
      id,
      position: pos,
      foundAt: foundAt >= 0 ? foundAt : null,
    });
  }
  return results;
});

watch(
  allIndexUids,
  (uids) => {
    indexOptions.value = uids;
  },
  { immediate: true },
);

function filterIndexes(val, update) {
  update(() => {
    const needle = (val || "").toLowerCase();
    const base = allIndexUids.value;
    indexOptions.value = needle
      ? base.filter((u) => u.toLowerCase().includes(needle))
      : base;
  });
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      hits.value = [];
      searchMeta.value = null;
      ranOnce.value = false;
      return;
    }
    indexOptions.value = allIndexUids.value;
    await indexesStore.fetchIndexes().catch(() => {});
    searchIndexUid.value = defaultIndexUid.value || allIndexUids.value[0] || "";

    const conds = props.rule?.conditions;
    let q = "";
    if (Array.isArray(conds)) {
      const contains = conds.find(
        (c) => c.scope === "query" && c.contains != null && String(c.contains).trim(),
      );
      if (contains) q = String(contains.contains);
    }
    testQuery.value = q;
    filterExpr.value = "";
  },
);

async function runSearch() {
  if (!searchIndexUid.value) {
    showError("Select an index.");
    return;
  }
  searching.value = true;
  ranOnce.value = true;
  try {
    const body = {
      q: testQuery.value || "",
      limit: 50,
    };
    if (filterExpr.value?.trim()) {
      body.filter = filterExpr.value.trim();
    }
    const res = await settings.rawRequest(
      `/indexes/${encodeURIComponent(searchIndexUid.value)}/search`,
      { method: "POST", body },
    );
    searchMeta.value = res || null;
    const rawHits = Array.isArray(res?.hits) ? res.hits : [];
    const pk = await indexesStore.getPrimaryKey(searchIndexUid.value);
    hits.value = rawHits.map((h) => {
      let docId = h?.id;
      if (docId === undefined || docId === null) {
        docId = pk && h && h[pk] !== undefined ? h[pk] : undefined;
      }
      return {
        ...h,
        __docId: docId != null ? String(docId) : "",
      };
    });
  } catch (e) {
    showError(e?.message || String(e));
    hits.value = [];
    searchMeta.value = null;
  } finally {
    searching.value = false;
  }
}
</script>
