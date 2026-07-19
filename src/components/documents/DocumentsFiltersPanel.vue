<template>
  <q-card flat bordered square class="h-full flex flex-col min-h-0">
    <q-card-section class="px-2 py-2 flex-shrink-0">
      <div class="flex items-center justify-between gap-1">
        <span class="text-subtitle2 font-semibold text-text">
          Filters
          <span
            v-if="filterableAttributes.length"
            class="text-caption text-text-muted ml-1"
          >
            ({{ visibleAttributeCount }}/{{ filterableAttributes.length }})
          </span>
        </span>
        <div class="flex gap-0.5">
          <AisClearButton label="Clear" />
          <q-btn
            flat
            dense
            square
            size="sm"
            icon="close"
            class="text-text-muted"
            aria-label="Close filters panel"
            @click="$emit('close')"
          >
            <q-tooltip>Close filters panel</q-tooltip>
          </q-btn>
        </div>
      </div>

      <q-input
        v-model="attributeSearch"
        dense
        outlined
        square
        clearable
        debounce="150"
        label="Search filter attributes"
        placeholder="Attributes or values…"
        class="mt-2"
      >
        <template #prepend>
          <q-icon name="search" size="xs" />
        </template>
      </q-input>

      <div class="flex flex-wrap items-center gap-1 mt-2">
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          icon="unfold_more"
          label="Expand"
          class="text-caption px-1"
          @click="expandAll"
        />
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          icon="unfold_less"
          label="Collapse"
          class="text-caption px-1"
          @click="collapseAll"
        />
        <q-space />
        <q-btn-toggle
          :model-value="filterDensity"
          flat
          dense
          no-caps
          size="sm"
          toggle-color="primary"
          class="text-caption"
          :options="densityOptions"
          aria-label="Filter density"
          @update:model-value="onDensityChange"
        >
          <q-tooltip>Dense or comfortable facet spacing</q-tooltip>
        </q-btn-toggle>
        <div class="inline-flex items-center gap-0.5">
          <q-toggle
            v-model="hideZeroCounts"
            dense
            size="sm"
            color="primary"
          />
          <span class="text-caption whitespace-nowrap">Hide empty</span>
          <q-icon name="info_outline" size="14px" color="grey-6" class="cursor-help">
            <q-tooltip max-width="240px">
              Hide facet values whose document count is 0 for the current
              search. Selected values always stay visible.
            </q-tooltip>
          </q-icon>
        </div>
      </div>

      <AisCurrentRefinements container-class="mt-2 mb-0" chip-size="xs" />
    </q-card-section>

    <q-separator />

    <q-card-section class="px-0 py-0 flex-1 min-h-0 overflow-hidden flex flex-col">
      <ais-state-results>
        <template #default="{ state }">
          <FilterAttributesList
            :attributes="filteredAttributes"
            :search-query="attributeSearch"
            :filter-density="filterDensity"
            :hide-zero-counts="hideZeroCounts"
            :initial-limit="facetInitialLimit"
            :refinement-list="state.refinementList || {}"
            :expanded-attributes="expandedAttributes"
            :collapsed-attributes="collapsedAttributes"
            @toggle="toggleExpanded"
          />

          <div
            v-if="filterableAttributes.length && !filteredAttributes.length"
            class="text-caption text-text-muted p-3"
          >
            No attributes match "{{ attributeSearch }}".
          </div>

          <div
            v-else-if="!filterableAttributes.length"
            class="text-caption text-text-muted p-3"
          >
            No filterable attributes on this index. Add them in the Settings tab,
            click Submit Settings, and the facets will appear here.
          </div>
        </template>
      </ais-state-results>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import AisClearButton from "components/aisComponents/AisClearButton.vue";
import AisCurrentRefinements from "components/aisComponents/AisCurrentRefinements.vue";
import FilterAttributesList from "components/documents/FilterAttributesList.vue";

const props = defineProps({
  filterableAttributes: {
    type: Array,
    default: () => [],
  },
  filterDensity: {
    type: String,
    default: "compact",
  },
  facetInitialLimit: {
    type: Number,
    default: 8,
  },
});

const emit = defineEmits(["close", "update:filterDensity"]);

const attributeSearch = ref("");
const hideZeroCounts = ref(true);
const expandedAttributes = ref(new Set());
const collapsedAttributes = ref(new Set());

const densityOptions = [
  { label: "Dense", value: "compact" },
  { label: "Comfy", value: "comfortable" },
];

const onDensityChange = (value) => {
  if (value === "compact" || value === "comfortable") {
    emit("update:filterDensity", value);
  }
};

const filteredAttributes = computed(() => {
  const query = attributeSearch.value.trim().toLowerCase();
  if (!query) return props.filterableAttributes;
  return props.filterableAttributes.filter((attribute) =>
    attribute.toLowerCase().includes(query),
  );
});

const visibleAttributeCount = computed(() => filteredAttributes.value.length);

const expandAll = () => {
  expandedAttributes.value = new Set(filteredAttributes.value);
  collapsedAttributes.value = new Set();
};

const collapseAll = () => {
  expandedAttributes.value = new Set();
  collapsedAttributes.value = new Set(filteredAttributes.value);
};

const toggleExpanded = (attribute, isOpen) => {
  const expanded = new Set(expandedAttributes.value);
  const collapsed = new Set(collapsedAttributes.value);
  if (isOpen) {
    expanded.add(attribute);
    collapsed.delete(attribute);
  } else {
    expanded.delete(attribute);
    collapsed.add(attribute);
  }
  expandedAttributes.value = expanded;
  collapsedAttributes.value = collapsed;
};

watch(
  () => props.filterableAttributes,
  () => {
    attributeSearch.value = "";
    expandedAttributes.value = new Set();
    collapsedAttributes.value = new Set();
  },
);

watch(filteredAttributes, (attributes) => {
  if (!attributeSearch.value.trim() || attributes.length !== 1) return;
  const attribute = attributes[0];
  const expanded = new Set(expandedAttributes.value);
  expanded.add(attribute);
  expandedAttributes.value = expanded;
  const collapsed = new Set(collapsedAttributes.value);
  collapsed.delete(attribute);
  collapsedAttributes.value = collapsed;
});
</script>
