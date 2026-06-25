<template>
  <q-table
    flat
    bordered
    dense
    :rows="rows"
    :columns="columns"
    row-key="__rowKey"
    :rows-per-page-options="[10, 25, 50]"
    class="documents-hits-table"
  >
    <template #body-cell-actions="props">
      <q-td :props="props" auto-width>
        <q-btn
          flat
          dense
          round
          size="sm"
          icon="edit"
          color="primary"
          :to="props.row.__editRoute"
        />
      </q-td>
    </template>
    <template #body-cell="props">
      <q-td :props="props">
        <span
          class="text-xs break-all"
          :title="props.value"
        >
          {{ props.value }}
        </span>
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { computed } from "vue";
import { resolveListFieldsForItem } from "src/meili-core/utils/display-settings";

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

const getDocumentId = (item) => {
  if (!item || !props.primaryKey) return item?.id;
  const id = item[props.primaryKey];
  if (id === undefined || id === null) return item.id;
  return id;
};

const tableFields = computed(() => {
  const sample = props.items[0];
  const fields = sample
    ? resolveListFieldsForItem(props.resolvedListFields, sample, {
        useAllItemFields: props.useAllItemFields,
        primaryKey: props.primaryKey,
        imageField: props.imageField,
      })
    : props.resolvedListFields;
  const withPk = [
    props.primaryKey,
    ...fields.filter((field) => field !== props.primaryKey),
  ].filter(Boolean);
  return [...new Set(withPk)].slice(0, props.tableFieldLimit);
});

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

const formatFieldValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
};

const rows = computed(() =>
  props.items.map((item) => {
    const id = getDocumentId(item);
    const row = {
      __rowKey: id,
      __editRoute: `/documents/${props.currentIndex}/${id}`,
    };
    for (const field of tableFields.value) {
      row[field] = formatFieldValue(item[field]);
    }
    return row;
  }),
);
</script>
