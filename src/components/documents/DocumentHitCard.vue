<template>
  <q-card
    flat
    bordered
    class="transition-colors hover:border-primary dark:hover:border-primary"
  >
    <q-card-section class="p-3">
      <div class="flex gap-3">
        <div
          v-if="imageField && item[imageField]"
          class="flex-shrink-0"
        >
          <q-img
            :src="item[imageField]"
            :alt="documentId"
            class="rounded"
            style="width: 72px; height: 72px; object-fit: cover"
            @error="(e) => (e.target.style.display = 'none')"
          />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1 mb-2">
            <span
              class="font-semibold text-sm truncate dark:text-white flex-1 min-w-0"
              :title="documentId"
            >
              {{ documentId }}
            </span>
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
            <div
              v-for="field in visibleFields"
              :key="field"
              class="min-w-0"
            >
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
import { computed } from "vue";
import { resolveListFieldsForItem } from "src/meili-core/utils/display-settings";

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

const gridClass = computed(() => {
  const cols = Math.min(Math.max(props.listColumns, 1), 3);
  if (cols === 1) return "grid-cols-1";
  if (cols === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 md:grid-cols-2";
});

const visibleFields = computed(() =>
  resolveListFieldsForItem(props.resolvedListFields, props.item, {
    useAllItemFields: props.useAllItemFields,
    primaryKey: props.primaryKey,
    imageField: props.imageField,
  }),
);

const formatFieldValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};
</script>
