<template>
  <div class="min-w-0 pl-3 flex flex-col flex-1 min-h-0">
    <div class="flex justify-center mb-3 flex-shrink-0">
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
        <DocumentsHitsTable
          v-else-if="displaySettings.listViewMode === 'table'"
          :items="items"
          :current-index="currentIndex"
          :primary-key="primaryKey"
          :image-field="displaySettings.imageField"
          :resolved-list-fields="resolvedListFields"
          :use-all-item-fields="useAllItemFields"
        />
        <div v-else class="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
          <DocumentHitCard
            v-for="(item, index) in items"
            :key="rowKey(item, index)"
            :item="item"
            :document-id="documentId(item, index)"
            :primary-key="primaryKey"
            :image-field="displaySettings.imageField"
            :resolved-list-fields="resolvedListFields"
            :use-all-item-fields="useAllItemFields"
            :list-view-mode="displaySettings.listViewMode"
            :compact-field-limit="displaySettings.compactFieldLimit || 4"
            :list-columns="displaySettings.listColumns"
            :edit-route="routes(item, index).edit"
            :similar-route="routes(item, index).similar"
            :show-similar="showSimilar"
          />
        </div>
      </template>
    </ais-hits>

    <div class="flex justify-center mt-3 mb-2 flex-shrink-0">
      <AisPaginationNav :padding="2" />
    </div>
  </div>
</template>

<script setup>
import AisPaginationNav from "components/aisComponents/AisPaginationNav.vue";
import DocumentHitCard from "components/documents/DocumentHitCard.vue";
import DocumentsHitsTable from "components/documents/DocumentsHitsTable.vue";
import {
  buildDocumentRoutes,
  getDocumentIdFromItem,
} from "src/meili-core/utils/display-settings";

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

const documentId = (item, index) =>
  getDocumentIdFromItem(item, props.primaryKey) ?? `row-${index}`;

const rowKey = (item, index) => documentId(item, index);

const routes = (item, index) =>
  buildDocumentRoutes(props.currentIndex, documentId(item, index));
</script>
