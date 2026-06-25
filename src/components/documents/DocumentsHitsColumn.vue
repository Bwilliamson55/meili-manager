<template>
  <div class="min-w-0 pl-3">
    <div class="flex justify-center mb-3">
      <AisPaginationNav :padding="2" />
    </div>

    <ais-hits :escapeHTML="true">
      <template #default="{ items }">
        <div v-if="items.length === 0" class="text-center py-12">
          <q-icon
            name="search_off"
            size="48px"
            class="text-gray-400 dark:text-gray-600"
          />
          <p class="text-subtitle1 text-gray-600 dark:text-gray-400 mt-4">
            No documents found
          </p>
        </div>
        <div v-else class="flex flex-col gap-2">
          <DocumentHitCard
            v-for="item in items"
            :key="getDocumentId(item)"
            :item="item"
            :document-id="getDocumentId(item)"
            :primary-key="primaryKey"
            :image-field="displaySettings.imageField"
            :resolved-list-fields="resolvedListFields"
            :use-all-item-fields="useAllItemFields"
            :list-columns="displaySettings.listColumns"
            :edit-route="`/documents/${currentIndex}/${getDocumentId(item)}`"
            :similar-route="`/similar/${currentIndex}/${getDocumentId(item)}`"
            :show-similar="showSimilar"
          />
        </div>
      </template>
    </ais-hits>

    <div class="flex justify-center mt-3 mb-2">
      <AisPaginationNav :padding="2" />
    </div>
  </div>
</template>

<script setup>
import AisPaginationNav from "components/aisComponents/AisPaginationNav.vue";
import DocumentHitCard from "components/documents/DocumentHitCard.vue";

const props = defineProps({
  currentIndex: {
    type: String,
    required: true,
  },
  primaryKey: {
    type: String,
    required: true,
  },
  displaySettings: {
    type: Object,
    required: true,
  },
  resolvedListFields: {
    type: Array,
    default: () => [],
  },
  useAllItemFields: {
    type: Boolean,
    default: false,
  },
  showSimilar: {
    type: Boolean,
    default: false,
  },
});

const getDocumentId = (item) => {
  if (!item || !props.primaryKey) return item?.id;
  const id = item[props.primaryKey];
  if (id === undefined || id === null) return item.id;
  return id;
};
</script>
