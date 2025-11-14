<template>
  <ais-refinement-list
    :attribute="attribute"
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
      <div v-if="items.length > 0">
        <q-scroll-area
          :thumb-style="{ width: '4px', opacity: 0.5 }"
          :style="{
            height: items.length > 10 ? '400px' : `${items.length * 40}px`,
            maxHeight: '256px',
          }"
        >
          <q-list dense class="pt-2">
            <q-item
              v-for="item in items"
              :key="item.value"
              dense
              class="px-1 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <q-item-section side top class="pr-2">
                <q-checkbox
                  :model-value="item.isRefined"
                  dense
                  size="xs"
                  color="primary"
                  @update:model-value="refine(item.value)"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-xs dark:text-gray-200">
                  {{ item.label }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge
                  :label="item.count"
                  :color="item.isRefined ? 'primary' : 'grey-6'"
                  class="text-xs"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>

        <!-- Show More/Less button -->
        <div v-if="canToggleShowMore" class="flex justify-center mt-2">
          <q-btn
            flat
            dense
            size="sm"
            :label="isShowingMore ? 'Show Less' : 'Show More'"
            :icon="isShowingMore ? 'expand_less' : 'expand_more'"
            color="primary"
            class="text-xs"
            @click="toggleShowMore"
          />
        </div>
      </div>
      <div v-else class="text-xs text-gray-500 dark:text-gray-400 p-2">
        No options available
      </div>
    </template>
  </ais-refinement-list>
</template>

<script setup>
defineProps({
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
});
</script>
