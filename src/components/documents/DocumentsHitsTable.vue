<template>
  <div class="documents-hits-table-wrap flex flex-col min-h-0">
    <q-table
      flat
      bordered
      dense
      :rows="rows"
      :columns="columns"
      :row-key="rowKey"
      hide-pagination
      virtual-scroll
      :virtual-scroll-item-size="36"
      class="documents-hits-table flex-1 min-h-0"
      :style="{ maxHeight: tableMaxHeight }"
    >
      <template #body-cell-actions="cell">
        <q-td :props="cell" auto-width>
          <q-btn
            flat
            dense
            round
            size="sm"
            icon="edit"
            color="primary"
            :to="cell.row.__editRoute"
          />
        </q-td>
      </template>
      <template
        v-for="field in tableFields"
        :key="field"
        #[`body-cell-${field}`]="cell"
      >
        <q-td :props="cell">
          <span
            class="text-xs break-all"
            :class="{ 'text-gray-400 italic': cell.row[`__missing__${field}`] }"
            :title="cell.row[`__title__${field}`]"
          >
            {{ cell.row[field] }}
          </span>
        </q-td>
      </template>
    </q-table>

    <div class="text-caption text-gray-500 dark:text-gray-400 py-2 px-1 text-center flex-shrink-0">
      {{ pageSummary }}
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  buildDocumentRoutes,
  formatDocumentFieldDisplay,
  getDocumentIdFromItem,
  resolveTableFields,
} from "src/meili-core/utils/display-settings";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  currentIndex: {
    type: String,
    required: true,
  },
  primaryKey: {
    type: String,
    required: true,
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
  useConfiguredFieldList: {
    type: Boolean,
    default: false,
  },
  includeConfiguredMissing: {
    type: Boolean,
    default: false,
  },
  tableFieldLimit: {
    type: Number,
    default: 8,
  },
  nbHits: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 0,
  },
  hitsPerPage: {
    type: Number,
    default: 50,
  },
});

const tableMaxHeight = "calc(100vh - 280px)";

const tableFields = computed(() =>
  resolveTableFields({
    items: props.items,
    resolvedListFields: props.resolvedListFields,
    primaryKey: props.primaryKey,
    imageField: props.imageField,
    useAllItemFields: props.useAllItemFields,
    useConfiguredFieldList: props.useConfiguredFieldList,
    limit: props.tableFieldLimit,
  }),
);

const columns = computed(() => [
  ...tableFields.value.map((field) => ({
    name: field,
    label: field,
    field,
    align: "left",
    sortable: false,
  })),
  {
    name: "actions",
    label: "",
    field: "actions",
    align: "right",
  },
]);

const rows = computed(() =>
  props.items.map((item, index) => {
    const id = getDocumentIdFromItem(item, props.primaryKey) ?? `row-${index}`;
    const routes = buildDocumentRoutes(props.currentIndex, id);
    const row = {
      __rowKey: id,
      __editRoute: routes.edit,
    };
    for (const field of tableFields.value) {
      const display = formatDocumentFieldDisplay(item, field, {
        truncate: 120,
        showMissing: props.includeConfiguredMissing,
      });
      row[field] = display.text;
      row[`__title__${field}`] = display.title;
      row[`__missing__${field}`] = display.missing;
    }
    return row;
  }),
);

const rowKey = (row) => row.__rowKey;

const pageSummary = computed(() => {
  const total = props.nbHits || props.items.length;
  const page = props.currentPage + 1;
  const start = props.currentPage * props.hitsPerPage + 1;
  const end = Math.min(start + props.items.length - 1, total);
  if (total <= 0) return "No matching documents";
  if (props.items.length === 0) return `${total.toLocaleString()} matching documents`;
  return `Showing ${start.toLocaleString()}–${end.toLocaleString()} of ${total.toLocaleString()} matching documents (search page ${page})`;
});
</script>
