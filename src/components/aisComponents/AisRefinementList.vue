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
      <div
        v-if="visibleItems(items).length > 0"
        class="px-0 pb-0"
        :class="isCompact ? 'refinement-list--compact' : 'refinement-list--comfortable'"
      >
        <q-list :dense="isCompact" :padding="!isCompact">
          <q-item
            v-for="item in visibleItems(items)"
            :key="item.value"
            :dense="isCompact"
            :class="itemClass"
          >
            <q-item-section side class="pr-0 flex-shrink-0 min-w-0">
              <q-checkbox
                :model-value="item.isRefined"
                :dense="isCompact"
                :size="isCompact ? 'xs' : 'sm'"
                color="primary"
                @update:model-value="refine(item.value)"
              />
            </q-item-section>
            <q-item-section class="min-w-0" :class="isCompact ? 'py-0' : 'py-1'">
              <q-item-label
                :class="labelClass"
                :title="item.label"
              >
                {{ item.label }}
              </q-item-label>
            </q-item-section>
            <q-item-section side class="flex-shrink-0 pl-1" :class="isCompact ? 'py-0' : 'py-1'">
              <q-badge
                :label="item.count"
                :color="item.isRefined ? 'primary' : 'grey-6'"
                :outline="!item.isRefined"
                :class="badgeClass"
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
            :class="isCompact ? 'text-[10px] min-h-0 py-0' : 'text-xs py-1'"
            @click="toggleShowMore"
          />
        </div>
      </div>
      <div
        v-else-if="items.length > 0"
        :class="emptyClass"
      >
        No values match this search.
      </div>
      <div v-else :class="emptyClass">
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

const isCompact = computed(() => props.density !== "comfortable");

const itemClass = computed(() =>
  isCompact.value
    ? "px-0 py-0 min-h-[22px] hover:bg-page rounded-sm"
    : "px-2 py-1 min-h-[36px] hover:bg-page rounded-md",
);

const labelClass = computed(() =>
  isCompact.value
    ? "text-[11px] font-medium text-text break-all leading-tight"
    : "text-sm font-medium text-text break-all leading-snug",
);

const badgeClass = computed(() =>
  isCompact.value
    ? "text-[10px] min-w-6 justify-center px-1"
    : "text-xs min-w-8 justify-center px-1.5",
);

const emptyClass = computed(() =>
  isCompact.value
    ? "text-[11px] text-text-muted px-2 py-1"
    : "text-sm text-text-muted px-3 py-2",
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
