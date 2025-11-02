<template>
  <ais-refinement-list
    :attribute="attribute"
    :show-more="showMore"
    :show-more-limit="showMoreLimit"
  >
    <template #default="{ items, refine }">
      <q-list dense class="q-pt-xs">
        <q-item
          v-for="item in items"
          :key="item.value"
          dense
          class="q-px-xs q-py-xs"
        >
          <q-item-section side top class="q-pr-sm">
            <q-checkbox
              :model-value="item.isRefined"
              dense
              size="xs"
              @update:model-value="refine(item.value)"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-xs">
              {{ item.label }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge :label="item.count" color="grey-6" class="text-xs" />
          </q-item-section>
        </q-item>
      </q-list>
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
