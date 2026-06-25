<template>
  <div
    v-if="attributes.length"
    class="flex-1 min-h-0 overflow-y-auto px-1 pb-1"
  >
    <q-list dense padding class="rounded-md">
      <q-expansion-item
        v-for="attribute in attributes"
        :key="attribute"
        :model-value="isExpanded(attribute)"
        dense
        expand-separator
        header-class="filter-expansion-header py-0 min-h-0"
        class="filter-expansion-item"
        @update:model-value="(open) => $emit('toggle', attribute, open)"
      >
        <template #header>
          <q-item-section class="min-w-0">
            <q-item-label
              class="text-xs font-medium break-all dark:text-gray-200 leading-tight"
              :title="attribute"
            >
              {{ attribute }}
            </q-item-label>
          </q-item-section>
          <q-item-section v-if="activeCount(attribute)" side>
            <q-badge
              color="primary"
              :label="activeCount(attribute)"
              class="text-[10px]"
            />
          </q-item-section>
        </template>

        <AisRefinementList
          v-if="isExpanded(attribute)"
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
:deep(.filter-expansion-header) {
  min-height: 28px;
  padding-top: 2px;
  padding-bottom: 2px;
}

:deep(.filter-expansion-item .q-item) {
  min-height: 28px;
}

:deep(.filter-expansion-item .q-expansion-item__content) {
  padding: 0 4px 4px;
}
</style>
