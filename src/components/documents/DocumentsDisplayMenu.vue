<template>
  <q-btn-dropdown
    flat
    dense
    color="primary"
    icon="tune"
    label="List display"
  >
    <q-list dense class="min-w-72">
      <q-item-label header class="text-caption">View mode</q-item-label>
      <q-item
        v-for="option in viewModeOptions"
        :key="option.value"
        clickable
        v-close-popup
        @click="setViewMode(option.value)"
      >
        <q-item-section avatar>
          <q-icon :name="option.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ option.label }}</q-item-label>
          <q-item-label caption>{{ option.caption }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="displaySettings.listViewMode === option.value">
          <q-icon name="check" color="primary" />
        </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item-label header class="text-caption">Thumbnail field</q-item-label>
      <q-item>
        <q-item-section class="w-full">
          <q-select
            :model-value="displaySettings.imageField"
            :options="imageFieldOptions"
            placeholder="None"
            dense
            outlined
            clearable
            class="w-full"
            @update:model-value="updateImageField"
          />
        </q-item-section>
      </q-item>

      <q-item-label header class="text-caption">List fields</q-item-label>
      <q-item>
        <q-item-section class="w-full">
          <q-select
            :model-value="displaySettings.listFields"
            :options="listFieldOptions"
            dense
            outlined
            multiple
            use-chips
            class="w-full"
            @update:model-value="$emit('list-fields-change', $event)"
          />
        </q-item-section>
      </q-item>

      <q-item clickable v-close-popup @click="$emit('open-order')">
        <q-item-section avatar>
          <q-icon name="reorder" />
        </q-item-section>
        <q-item-section>Reorder fields</q-item-section>
      </q-item>

      <q-item
        clickable
        v-close-popup
        :disable="!displaySettings.listFields?.length"
        @click="$emit('reset-fields')"
      >
        <q-item-section avatar>
          <q-icon name="restart_alt" />
        </q-item-section>
        <q-item-section>Reset to index defaults</q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item-label header class="text-caption">Card grid columns</q-item-label>
      <q-item>
        <q-item-section class="w-full">
          <q-select
            :model-value="displaySettings.listColumns"
            :options="listColumnOptions"
            dense
            outlined
            emit-value
            map-options
            :disable="displaySettings.listViewMode === 'table'"
            class="w-full"
            @update:model-value="updateListColumns"
          />
        </q-item-section>
      </q-item>

      <q-item v-if="listFieldsSourceLabel">
        <q-item-section>
          <q-item-label caption>{{ listFieldsSourceLabel }}</q-item-label>
          <q-item-label v-if="displaySettings.listFields?.length" caption class="mt-1">
            Fields show — when absent from search hits; add them to index
            displayedAttributes to load values.
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
const props = defineProps({
  displaySettings: {
    type: Object,
    required: true,
  },
  imageFieldOptions: {
    type: Array,
    default: () => [],
  },
  listFieldOptions: {
    type: Array,
    default: () => [],
  },
  listColumnOptions: {
    type: Array,
    default: () => [],
  },
  listFieldsSourceLabel: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "update:display-settings",
  "list-fields-change",
  "open-order",
  "reset-fields",
]);

const viewModeOptions = [
  {
    value: "compact",
    label: "Compact",
    caption: "Preview fields, expand per row",
    icon: "view_agenda",
  },
  {
    value: "detailed",
    label: "Detailed",
    caption: "All configured fields in cards",
    icon: "view_module",
  },
  {
    value: "table",
    label: "Table",
    caption: "Dense columns for scanning",
    icon: "table_rows",
  },
];

const patchSettings = (patch) => {
  emit("update:display-settings", { ...props.displaySettings, ...patch });
};

const setViewMode = (listViewMode) => patchSettings({ listViewMode });

const updateImageField = (imageField) => patchSettings({ imageField: imageField || null });

const updateListColumns = (listColumns) => patchSettings({ listColumns });
</script>
