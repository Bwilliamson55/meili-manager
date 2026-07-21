<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="w-full" style="min-width: 320px; max-width: 560px">
      <q-card-section class="flex items-center justify-between pb-2">
        <div class="mm-section-title text-subtitle1">Configure attributes</div>
        <q-btn
          flat
          dense
          square
          icon="close"
          aria-label="Close"
          v-close-popup
        />
      </q-card-section>
      <q-separator />

      <q-card-section class="flex flex-col gap-4">
        <section>
          <div class="mm-section-title text-subtitle2 mb-1">
            Show in filters
          </div>
          <p class="text-caption text-text-muted mb-2">
            Choose which filterable attributes appear as facets. Local only;
            does not change Meilisearch settings. Leave empty or reset to show
            all.
          </p>
          <q-select
            v-model="localVisible"
            :options="filterableAttributes"
            dense
            outlined
            square
            multiple
            use-chips
            clearable
            label="Visible facets"
            hint="Order follows Meilisearch filterableAttributes"
            class="w-full"
          />
          <div class="flex flex-wrap gap-2 mt-2">
            <q-btn
              flat
              dense
              square
              no-caps
              size="sm"
              color="primary"
              icon="restart_alt"
              label="Reset to all"
              :disable="!hasVisibleSubset"
              @click="resetVisibleToAll"
            />
            <q-btn
              unelevated
              dense
              square
              no-caps
              size="sm"
              color="primary"
              icon="check"
              label="Apply facets"
              @click="applyVisibleFacets"
            />
          </div>
        </section>

        <q-separator />

        <section>
          <div class="mm-section-title text-subtitle2 mb-1">
            Index settings
          </div>
          <p class="text-caption text-text-muted mb-2">
            Quickly add attributes as filterable and/or searchable. Changing
            these triggers a re-index. For reorder or remove, use Settings →
            Search.
          </p>

          <q-banner dense class="bg-warning text-page mb-3">
            <template #avatar>
              <q-icon name="warning" />
            </template>
            <div class="text-caption">
              {{ SETTINGS_METADATA.filterableAttributes.label }} and
              {{ SETTINGS_METADATA.searchableAttributes.label }} changes
              re-index all documents (may take time).
            </div>
          </q-banner>

          <q-select
            v-model="addFilterable"
            :options="filterableCandidates"
            dense
            outlined
            square
            multiple
            use-chips
            use-input
            input-debounce="0"
            clearable
            label="Add as filterable"
            class="w-full mb-2"
            @filter="filterCandidateOptions"
          />

          <q-checkbox
            v-model="alsoSearchable"
            dense
            label="Also make searchable"
            class="mb-2"
            :disable="!addFilterable.length || searchableIsWildcard"
          >
            <q-tooltip v-if="searchableIsWildcard">
              Searchable attributes are already ["*"] (all fields).
            </q-tooltip>
          </q-checkbox>

          <q-select
            v-model="addSearchable"
            :options="searchableCandidates"
            dense
            outlined
            square
            multiple
            use-chips
            use-input
            input-debounce="0"
            clearable
            label="Add as searchable"
            :disable="searchableIsWildcard"
            :hint="
              searchableIsWildcard
                ? 'Already searching all fields (*)'
                : 'Appended to searchableAttributes (order unchanged)'
            "
            class="w-full mb-2"
            @filter="filterSearchableOptions"
          />

          <div class="flex flex-wrap items-center gap-2 mt-1">
            <q-btn
              unelevated
              dense
              square
              no-caps
              size="sm"
              color="primary"
              icon="save"
              label="Apply to index"
              :loading="savingSettings"
              :disable="!canApplyIndexSettings"
              @click="applyIndexSettings"
            />
            <q-btn
              flat
              dense
              square
              no-caps
              size="sm"
              color="primary"
              icon="tune"
              label="Open Settings → Search"
              @click="openSettingsSearch"
            />
          </div>
        </section>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useSettingsStore } from "src/meili-core/stores/settings-store";
import { isWildcardAttributes } from "src/meili-core/utils/display-settings";
import { SETTINGS_METADATA } from "src/meili-core/utils/settings-config";
import {
  confirmDialog,
  showError,
  showSuccess,
} from "src/utils/notifications";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  indexUid: {
    type: String,
    default: "",
  },
  filterableAttributes: {
    type: Array,
    default: () => [],
  },
  visibleFilterAttributes: {
    default: null,
    validator: (value) => value === null || Array.isArray(value),
  },
  searchableAttributes: {
    type: Array,
    default: () => [],
  },
  candidateAttributes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "update:modelValue",
  "update:visible-filter-attributes",
  "settings-updated",
  "open-settings-search",
]);

const theSettings = useSettingsStore();

const localVisible = ref([]);
const addFilterable = ref([]);
const addSearchable = ref([]);
const alsoSearchable = ref(false);
const savingSettings = ref(false);
const filterableOptionFilter = ref("");
const searchableOptionFilter = ref("");

const searchableIsWildcard = computed(() =>
  isWildcardAttributes(props.searchableAttributes),
);

const hasVisibleSubset = computed(
  () =>
    Array.isArray(props.visibleFilterAttributes) &&
    props.visibleFilterAttributes.length > 0,
);

const filterableSet = computed(
  () => new Set((props.filterableAttributes || []).filter(Boolean)),
);

const searchableSet = computed(() => {
  if (searchableIsWildcard.value) return new Set(props.candidateAttributes);
  return new Set((props.searchableAttributes || []).filter(Boolean));
});

const allCandidates = computed(() => {
  const keys = new Set(
    [...(props.candidateAttributes || []), ...(props.filterableAttributes || [])]
      .map((k) => String(k || "").trim())
      .filter(Boolean),
  );
  return [...keys].sort((a, b) => a.localeCompare(b));
});

const filterableCandidates = computed(() => {
  const needle = filterableOptionFilter.value.trim().toLowerCase();
  return allCandidates.value.filter((attr) => {
    if (filterableSet.value.has(attr)) return false;
    if (!needle) return true;
    return attr.toLowerCase().includes(needle);
  });
});

const searchableCandidates = computed(() => {
  if (searchableIsWildcard.value) return [];
  const needle = searchableOptionFilter.value.trim().toLowerCase();
  return allCandidates.value.filter((attr) => {
    if (searchableSet.value.has(attr)) return false;
    if (!needle) return true;
    return attr.toLowerCase().includes(needle);
  });
});

const canApplyIndexSettings = computed(() => {
  if (savingSettings.value) return false;
  if (addFilterable.value.length > 0) return true;
  if (!searchableIsWildcard.value && addSearchable.value.length > 0) {
    return true;
  }
  return false;
});

const syncLocalVisible = () => {
  if (
    Array.isArray(props.visibleFilterAttributes) &&
    props.visibleFilterAttributes.length > 0
  ) {
    const allowed = filterableSet.value;
    localVisible.value = props.visibleFilterAttributes.filter((attr) =>
      allowed.has(attr),
    );
    return;
  }
  localVisible.value = [...(props.filterableAttributes || [])];
};

watch(
  () => [props.modelValue, props.visibleFilterAttributes, props.filterableAttributes],
  ([open]) => {
    if (!open) return;
    syncLocalVisible();
    addFilterable.value = [];
    addSearchable.value = [];
    alsoSearchable.value = false;
    filterableOptionFilter.value = "";
    searchableOptionFilter.value = "";
  },
);

const makeOptionFilter = (targetRef) => (val, update) => {
  update(() => {
    targetRef.value = val ?? "";
  });
};

const filterCandidateOptions = makeOptionFilter(filterableOptionFilter);
const filterSearchableOptions = makeOptionFilter(searchableOptionFilter);

const resetVisibleToAll = () => {
  localVisible.value = [...(props.filterableAttributes || [])];
  emit("update:visible-filter-attributes", null);
};

const applyVisibleFacets = () => {
  const selected = (localVisible.value || []).filter(Boolean);
  const all = props.filterableAttributes || [];
  const selectedSet = new Set(selected);
  const ordered = all.filter((attr) => selectedSet.has(attr));
  // Empty or full selection → show all (persist null)
  if (ordered.length === 0 || ordered.length === all.length) {
    emit("update:visible-filter-attributes", null);
    showSuccess("Showing all filterable facets");
    return;
  }
  emit("update:visible-filter-attributes", ordered);
  showSuccess(`Showing ${ordered.length} of ${all.length} facets`);
};

const openSettingsSearch = () => {
  emit("open-settings-search");
  emit("update:modelValue", false);
};

const applyIndexSettings = async () => {
  if (!props.indexUid || !canApplyIndexSettings.value) return;

  const toFilterable = [...new Set((addFilterable.value || []).filter(Boolean))];
  let toSearchable = [...new Set((addSearchable.value || []).filter(Boolean))];
  if (alsoSearchable.value && !searchableIsWildcard.value) {
    toSearchable = [...new Set([...toSearchable, ...toFilterable])];
  }
  if (searchableIsWildcard.value) {
    toSearchable = [];
  }

  if (!toFilterable.length && !toSearchable.length) return;

  const labels = [];
  if (toFilterable.length) {
    labels.push(SETTINGS_METADATA.filterableAttributes.label);
  }
  if (toSearchable.length) {
    labels.push(SETTINGS_METADATA.searchableAttributes.label);
  }

  const confirmed = await confirmDialog({
    title: "Changes will trigger re-indexing",
    message: `Updating ${labels.join(" and ")} will re-index all documents (may take time). Continue?`,
    okLabel: "Apply and re-index",
    okColor: "warning",
  });
  if (!confirmed) return;

  savingSettings.value = true;
  try {
    const mclient = theSettings.getIndexClient(props.indexUid);
    const current =
      theSettings.getIndexSettingsCache(props.indexUid) ||
      (await mclient.getSettings());

    const patch = {};
    if (toFilterable.length) {
      const existing = (current.filterableAttributes || []).filter(
        (field) => field && field !== "*",
      );
      patch.filterableAttributes = [
        ...existing,
        ...toFilterable.filter((attr) => !existing.includes(attr)),
      ];
    }
    if (toSearchable.length) {
      const existing = (current.searchableAttributes || []).filter(Boolean);
      if (!isWildcardAttributes(existing)) {
        patch.searchableAttributes = [
          ...existing,
          ...toSearchable.filter((attr) => !existing.includes(attr)),
        ];
      }
    }

    if (!Object.keys(patch).length) {
      showSuccess("Nothing to update");
      return;
    }

    const updateRes = await mclient.updateSettings(patch);
    if (updateRes?.taskUid) {
      await theSettings.waitForTask(updateRes.taskUid, {
        intervalMs: 5000,
      });
    }

    const updatedSettings = await mclient.getSettings();
    theSettings.setIndexSettingsCache(props.indexUid, updatedSettings);
    emit("settings-updated", updatedSettings);

    // Keep newly filterable attrs visible when a local subset is active
    if (
      toFilterable.length &&
      Array.isArray(props.visibleFilterAttributes) &&
      props.visibleFilterAttributes.length > 0
    ) {
      const nextVisible = [...props.visibleFilterAttributes];
      for (const attr of toFilterable) {
        if (!nextVisible.includes(attr)) nextVisible.push(attr);
      }
      emit("update:visible-filter-attributes", nextVisible);
    }

    addFilterable.value = [];
    addSearchable.value = [];
    alsoSearchable.value = false;
    showSuccess("Index attributes updated");
  } catch (error) {
    console.error("Configure attributes update error:", error);
    showError(`Failed to update attributes: ${error.message}`);
  } finally {
    savingSettings.value = false;
  }
};
</script>
