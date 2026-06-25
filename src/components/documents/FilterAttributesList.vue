<template>
  <div
    v-if="attributes.length"
    class="flex-1 min-h-0 overflow-y-auto px-1 pb-1"
    :class="isCompact ? 'filter-list--compact' : 'filter-list--comfortable'"
  >
    <q-list :dense="isCompact" :padding="!isCompact" class="rounded-md">
      <q-expansion-item
        v-for="attribute in attributes"
        :key="`${attribute}-${filterDensity}`"
        :model-value="isExpanded(attribute)"
        :dense="isCompact"
        expand-separator
        :header-class="headerClass"
        class="filter-expansion-item"
        @update:model-value="(open) => $emit('toggle', attribute, open)"
      >
        <template #header>
          <q-item-section class="min-w-0">
            <q-item-label
              :class="headerLabelClass"
              :title="attribute"
            >
              {{ attribute }}
            </q-item-label>
          </q-item-section>
          <q-item-section v-if="activeCount(attribute)" side>
            <q-badge
              color="primary"
              :label="activeCount(attribute)"
              :class="isCompact ? 'text-[10px]' : 'text-xs'"
            />
          </q-item-section>
        </template>

        <AisRefinementList
          v-if="isExpanded(attribute)"
          :key="`${attribute}-${filterDensity}-list`"
          :attribute="attribute"
          :show-more="true"
          :show-more-limit="50"
          :initial-limit="initialLimit"
          :density="filterDensity"
          :value-filter="searchQuery"
          :hide-zero-counts="hideZeroCounts"
        />
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script setup>
import { computed } from "vue";
import AisRefinementList from "components/aisComponents/AisRefinementList.vue";

const props = defineProps({
  attributes: {
    type: Array,
    default: () => [],
  },
  searchQuery: {
    type: String,
    default: "",
  },
  filterDensity: {
    type: String,
    default: "compact",
  },
  hideZeroCounts: {
    type: Boolean,
    default: true,
  },
  initialLimit: {
    type: Number,
    default: 8,
  },
  refinementList: {
    type: Object,
    default: () => ({}),
  },
  expandedAttributes: {
    type: Object,
    default: () => new Set(),
  },
  collapsedAttributes: {
    type: Object,
    default: () => new Set(),
  },
});

defineEmits(["toggle"]);

const isCompact = computed(() => props.filterDensity !== "comfortable");

const headerClass = computed(() =>
  isCompact.value
    ? "filter-expansion-header filter-expansion-header--compact py-0 min-h-0"
    : "filter-expansion-header filter-expansion-header--comfortable py-1 min-h-0",
);

const headerLabelClass = computed(() =>
  isCompact.value
    ? "text-xs font-medium break-all dark:text-gray-200 leading-tight"
    : "text-sm font-semibold break-all dark:text-gray-200 leading-snug",
);

const activeCount = (attribute) =>
  Array.isArray(props.refinementList?.[attribute])
    ? props.refinementList[attribute].length
    : 0;

const isExpanded = (attribute) => {
  if (props.collapsedAttributes.has(attribute)) return false;
  if (props.expandedAttributes.has(attribute)) return true;
  return activeCount(attribute) > 0;
};
</script>

<style scoped>
:deep(.filter-expansion-header--compact) {
  min-height: 26px;
  padding-top: 2px;
  padding-bottom: 2px;
}

:deep(.filter-expansion-header--comfortable) {
  min-height: 40px;
  padding-top: 6px;
  padding-bottom: 6px;
}

:deep(.filter-expansion-item .q-item) {
  min-height: unset;
}

:deep(.filter-list--comfortable .filter-expansion-item .q-expansion-item__content) {
  padding: 4px 8px 8px;
}

:deep(.filter-list--compact .filter-expansion-item .q-expansion-item__content) {
  padding: 0 4px 4px;
}
</style>
