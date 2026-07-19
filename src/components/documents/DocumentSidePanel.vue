<template>
  <q-drawer
    :model-value="modelValue"
    side="right"
    overlay
    bordered
    :width="drawerWidth"
    class="bg-page-elevated"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="flex flex-col h-full" @keydown.esc.stop="close">
      <div
        class="flex items-center gap-2 p-3 border-b border-border flex-shrink-0"
      >
        <div class="min-w-0 flex-1">
          <div class="text-subtitle2 font-semibold truncate">
            {{ documentId || "Document" }}
          </div>
          <div class="text-caption text-text-muted truncate">
            {{ indexUid }}
          </div>
        </div>
        <q-btn
          flat
          dense
          square
          icon="close"
          aria-label="Close document panel"
          @click="close"
        >
          <q-tooltip>Close (Esc)</q-tooltip>
        </q-btn>
      </div>

      <div class="flex flex-wrap gap-1 p-2 border-b border-border flex-shrink-0">
        <q-btn
          flat
          dense
          square
          no-caps
          size="sm"
          icon="content_copy"
          label="Copy JSON"
          color="primary"
          @click="copyJson"
        />
        <q-btn
          flat
          dense
          square
          no-caps
          size="sm"
          :icon="editable ? 'visibility' : 'edit'"
          :label="editable ? 'View only' : 'Edit'"
          @click="editable = !editable"
        >
          <q-tooltip>Toggle JSON edit mode</q-tooltip>
        </q-btn>
        <q-btn
          flat
          dense
          square
          no-caps
          size="sm"
          icon="terminal"
          label="Playground"
          color="primary"
          @click="$emit('open-playground', documentId)"
        />
        <q-btn
          flat
          dense
          square
          no-caps
          size="sm"
          icon="open_in_new"
          label="Full editor"
          :to="fullEditorRoute"
        />
        <q-btn
          v-if="showSimilar"
          flat
          dense
          square
          no-caps
          size="sm"
          icon="hub"
          label="Similar"
          :to="similarRoute"
        />
      </div>

      <div class="flex-1 min-h-0 p-2 overflow-hidden">
        <vue-jsoneditor
          v-if="documentText !== null"
          class="h-full min-h-96"
          :mode="editable ? 'text' : 'view'"
          :mainMenuBar="false"
          :navigationBar="false"
          :statusBar="true"
          :readOnly="!editable"
          v-model:text="documentText"
        />
        <div v-else class="text-caption text-text-muted p-4">
          Select a document hit to inspect raw JSON.
        </div>
      </div>
    </div>
  </q-drawer>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { copyToClipboard } from "quasar";
import VueJsoneditor from "vue3-ts-jsoneditor";
import { showSuccess, showError } from "src/utils/notifications";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  indexUid: {
    type: String,
    required: true,
  },
  documentId: {
    type: [String, Number],
    default: "",
  },
  document: {
    type: Object,
    default: null,
  },
  showSimilar: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "open-playground"]);

const editable = ref(false);
const documentText = ref(null);
const drawerWidth = computed(() =>
  typeof window !== "undefined" && window.innerWidth < 768 ? 320 : 480,
);

const fullEditorRoute = computed(
  () => `/documents/${props.indexUid}/${encodeURIComponent(props.documentId)}`,
);

const similarRoute = computed(
  () => `/similar/${props.indexUid}/${encodeURIComponent(props.documentId)}`,
);

watch(
  () => props.document,
  (doc) => {
    if (!doc) {
      documentText.value = null;
      return;
    }
    documentText.value = JSON.stringify(doc, null, 2);
    editable.value = false;
  },
  { immediate: true },
);

const close = () => {
  emit("update:modelValue", false);
};

const copyJson = async () => {
  if (!documentText.value) {
    showError("Nothing to copy");
    return;
  }
  await copyToClipboard(documentText.value);
  showSuccess("JSON copied");
};
</script>
