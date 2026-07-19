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
      <template #body="bodyProps">
        <q-tr
          :props="bodyProps"
          class="cursor-pointer"
          @click="$emit('select', { item: bodyProps.row.__item, documentId: bodyProps.row.__rowKey })"
        >
          <q-td
            v-for="col in bodyProps.cols"
            :key="col.name"
            :props="bodyProps"
          >
            <template v-if="col.name === 'actions'">
              <q-btn
                flat
                dense
                square
                size="sm"
                icon="edit"
                color="primary"
                :to="bodyProps.row.__editRoute"
                @click.stop
              />
            </template>
            <template v-else>
              <span
                class="text-xs break-all"
                :class="{
                  'text-text-muted italic':
                    bodyProps.row[`__missing__${col.name}`],
                }"
                :title="bodyProps.row[`__title__${col.name}`]"
              >
                {{ bodyProps.row[col.name] }}
              </span>
            </template>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <div class="text-caption text-text-muted py-2 px-1 text-center flex-shrink-0">
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

defineEmits(["select"]);

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
      __item: item,
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
  return `Showing ${start.toLocaleString()}-${end.toLocaleString()} of ${total.toLocaleString()} matching documents (search page ${page})`;
});
</script>
