<template>
  <q-table
    flat
    bordered
    dense
    :rows="rows"
    :columns="columns"
    :row-key="rowKey"
    :rows-per-page-options="[10, 25, 50]"
    class="documents-hits-table"
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
        <span class="text-xs break-all" :title="cell.row[field]">
          {{ cell.row[field] }}
        </span>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { computed } from "vue";
import {
  buildDocumentRoutes,
  formatDocumentFieldValue,
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
  tableFieldLimit: {
    type: Number,
    default: 8,
  },
});

const tableFields = computed(() =>
  resolveTableFields({
    items: props.items,
    resolvedListFields: props.resolvedListFields,
    primaryKey: props.primaryKey,
    imageField: props.imageField,
    useAllItemFields: props.useAllItemFields,
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
      row[field] = formatDocumentFieldValue(item[field], { truncate: 120 });
    }
    return row;
  }),
);

const rowKey = (row) => row.__rowKey;
</script>
