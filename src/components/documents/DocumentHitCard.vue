<template>
  <q-card
    flat
    bordered
    square
    class="bg-page-elevated cursor-pointer transition-colors hover:border-primary"
    @click="$emit('select', { item, documentId })"
  >
    <q-card-section class="p-3">
      <div class="flex gap-3">
        <div v-if="imageField && getDocumentFieldValue(item, imageField)" class="flex-shrink-0">
          <q-img
            :src="getDocumentFieldValue(item, imageField)"
            :alt="String(documentId)"
            style="width: 64px; height: 64px; object-fit: cover"
            @error="(e) => (e.target.style.display = 'none')"
          />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1 mb-1">
            <span
              class="font-semibold text-sm truncate text-text flex-1 min-w-0"
              :title="String(titleLabel)"
            >
              {{ titleLabel }}
            </span>
            <q-btn
              v-if="canExpand"
              flat
              dense
              square
              size="sm"
              :icon="expanded ? 'expand_less' : 'expand_more'"
              :label="expanded ? 'Less' : `+${hiddenFieldCount} more`"
              class="text-caption"
              @click.stop="expanded = !expanded"
            />
            <q-btn
              flat
              dense
              square
              size="sm"
              icon="edit"
              color="primary"
              :to="editRoute"
              @click.stop
            />
            <q-btn
              v-if="showSimilar"
              flat
              dense
              square
              size="sm"
              icon="hub"
              color="secondary"
              :to="similarRoute"
              @click.stop
            />
          </div>

          <div
            v-if="visibleFields.length > 0"
            class="grid gap-x-4 gap-y-1 text-xs"
            :class="gridClass"
          >
            <div v-for="field in visibleFields" :key="field" class="min-w-0">
              <span class="text-text-muted">{{ field }}:</span>
              <span
                class="ml-1 text-text break-all"
                :class="{ 'text-text-muted italic': fieldDisplay(field).missing }"
                :title="fieldDisplay(field).title"
              >
                {{ fieldDisplay(field).text }}
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
  formatDocumentFieldDisplay,
  getDocumentTitleLabel,
  getDocumentFieldValue,
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
  includeConfiguredMissing: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["select"]);

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
    includeConfiguredMissing: props.includeConfiguredMissing,
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

const fieldDisplay = (field) =>
  formatDocumentFieldDisplay(props.item, field, {
    showMissing: props.includeConfiguredMissing,
  });
</script>
