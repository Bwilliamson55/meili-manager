<template>
  <ais-refinement-list
    :attribute="attribute"
    :limit="initialLimit"
    :show-more="showMore"
    :show-more-limit="showMoreLimit"
  >
    <template
      #default="{
        items,
        refine,
        isShowingMore,
        toggleShowMore,
        canToggleShowMore,
      }"
    >
      <div v-if="visibleItems(items).length > 0" class="px-0 pb-0">
        <q-list :dense="density === 'compact'" padding>
          <q-item
            v-for="item in visibleItems(items)"
            :key="item.value"
            dense
            :class="itemClass"
          >
            <q-item-section side class="pr-0 flex-shrink-0 min-w-0">
              <q-checkbox
                :model-value="item.isRefined"
                dense
                size="xs"
                color="primary"
                @update:model-value="refine(item.value)"
              />
            </q-item-section>
            <q-item-section class="min-w-0 py-0">
              <q-item-label
                class="text-[11px] font-medium dark:text-gray-200 break-all leading-tight"
                :title="item.label"
              >
                {{ item.label }}
              </q-item-label>
            </q-item-section>
            <q-item-section side class="flex-shrink-0 pl-1 py-0">
              <q-badge
                :label="item.count"
                :color="item.isRefined ? 'primary' : 'grey-6'"
                :outline="!item.isRefined"
                class="text-[10px] min-w-6 justify-center px-1"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="canToggleShowMore" class="flex justify-center">
          <q-btn
            flat
            dense
            no-caps
            size="sm"
            :label="isShowingMore ? 'Less' : 'More'"
            :icon="isShowingMore ? 'expand_less' : 'expand_more'"
            color="primary"
            class="text-[10px] min-h-0 py-0"
            @click="toggleShowMore"
          />
        </div>
      </div>
      <div
        v-else-if="items.length > 0"
        class="text-[11px] text-gray-500 dark:text-gray-400 px-2 py-1"
      >
        No values match this search.
      </div>
      <div v-else class="text-[11px] text-gray-500 dark:text-gray-400 px-2 py-1">
        No options available
      </div>
    </template>
  </ais-refinement-list>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  attribute: {
    type: String,
    required: true,
  },
  showMore: {
    type: Boolean,
    default: false,
  },
  showMoreLimit: {
    type: Number,
    default: 50,
  },
  initialLimit: {
    type: Number,
    default: 8,
  },
  density: {
    type: String,
    default: "compact",
  },
  valueFilter: {
    type: String,
    default: "",
  },
  hideZeroCounts: {
    type: Boolean,
    default: false,
  },
});

const itemClass = computed(() =>
  props.density === "compact"
    ? "px-0 py-0 min-h-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm"
    : "px-1 py-0.5 min-h-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md",
);

const visibleItems = (items) => {
  let next = items || [];
  if (props.hideZeroCounts) {
    next = next.filter((item) => item.isRefined || item.count > 0);
  }
  const query = props.valueFilter.trim().toLowerCase();
  if (!query) return next;
  return next.filter((item) =>
    String(item.label ?? item.value).toLowerCase().includes(query),
  );
};
</script>
