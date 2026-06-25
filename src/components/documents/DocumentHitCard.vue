<template>
  <q-card
    flat
    bordered
    class="transition-colors hover:border-primary dark:hover:border-primary"
  >
    <q-card-section class="p-3">
      <div class="flex gap-3">
        <div v-if="imageField && item[imageField]" class="flex-shrink-0">
          <q-img
            :src="item[imageField]"
            :alt="documentId"
            class="rounded"
            style="width: 64px; height: 64px; object-fit: cover"
            @error="(e) => (e.target.style.display = 'none')"
          />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1 mb-1">
            <span
              class="font-semibold text-sm truncate dark:text-white flex-1 min-w-0"
              :title="String(titleLabel)"
            >
              {{ titleLabel }}
            </span>
            <q-btn
              v-if="canExpand"
              flat
              dense
              size="sm"
              :icon="expanded ? 'expand_less' : 'expand_more'"
              :label="expanded ? 'Less' : `+${hiddenFieldCount} more`"
              class="text-caption"
              @click="expanded = !expanded"
            />
            <q-btn
              flat
              dense
              size="sm"
              icon="edit"
              color="primary"
              :to="editRoute"
            />
            <q-btn
              v-if="showSimilar"
              flat
              dense
              size="sm"
              icon="hub"
              color="secondary"
              :to="similarRoute"
            />
          </div>

          <div
            v-if="visibleFields.length > 0"
            class="grid gap-x-4 gap-y-1 text-xs"
            :class="gridClass"
          >
            <div v-for="field in visibleFields" :key="field" class="min-w-0">
              <span class="text-gray-600 dark:text-gray-400">{{ field }}:</span>
              <span
                class="ml-1 dark:text-gray-200 break-all"
                :title="formatFieldValue(item[field])"
              >
                {{ formatFieldValue(item[field]) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import {
  resolveListFieldsForItem,
  resolveCompactPreviewFields,
  formatDocumentFieldValue,
  getDocumentTitleLabel,
} from "src/meili-core/utils/display-settings";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  documentId: {
    type: [String, Number],
    required: true,
  },
  primaryKey: {
    type: String,
    default: "",
  },
  imageField: {
    type: String,
    default: null,
  },
  resolvedListFields: {
    type: Array,
    default: () => [],
  },
  useAllItemFields: {
    type: Boolean,
    default: false,
  },
  listViewMode: {
    type: String,
    default: "compact",
  },
  compactFieldLimit: {
    type: Number,
    default: 4,
  },
  listColumns: {
    type: Number,
    default: 2,
  },
  editRoute: {
    type: String,
    required: true,
  },
  similarRoute: {
    type: String,
    default: "",
  },
  showSimilar: {
    type: Boolean,
    default: false,
  },
});

const expanded = ref(false);

watch(
  () => props.documentId,
  () => {
    expanded.value = false;
  },
);

const allFieldsForItem = computed(() =>
  resolveListFieldsForItem(props.resolvedListFields, props.item, {
    useAllItemFields: props.useAllItemFields,
    primaryKey: props.primaryKey,
    imageField: props.imageField,
  }),
);

const isCompact = computed(() => props.listViewMode === "compact");

const visibleFields = computed(() => {
  if (!isCompact.value || expanded.value) {
    return allFieldsForItem.value;
  }
  return resolveCompactPreviewFields(
    allFieldsForItem.value,
    props.compactFieldLimit,
  );
});

const hiddenFieldCount = computed(() =>
  Math.max(allFieldsForItem.value.length - visibleFields.value.length, 0),
);

const canExpand = computed(
  () => isCompact.value && hiddenFieldCount.value > 0,
);

const titleLabel = computed(() =>
  getDocumentTitleLabel(props.item, props.primaryKey, props.documentId),
);

const gridClass = computed(() => {
  const cols = Math.min(Math.max(props.listColumns, 1), 3);
  if (cols === 1) return "grid-cols-1";
  if (cols === 3) return "grid-cols-1 lg:grid-cols-3";
  return "grid-cols-1 md:grid-cols-2";
});

const formatFieldValue = (value) => formatDocumentFieldValue(value);
</script>
