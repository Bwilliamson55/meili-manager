<template>
  <div
    class="playground-panel flex flex-col flex-1 min-h-0 p-3 gap-3"
    @keydown="onKeydown"
  >
    <div
      class="flex flex-wrap items-center gap-2 flex-shrink-0 border border-border bg-page-elevated p-2"
    >
      <span class="text-caption text-text-muted mr-1">Presets</span>
      <div class="flex flex-wrap items-stretch gap-1">
        <q-btn
          v-for="tpl in templates"
          :key="tpl.id"
          dense
          square
          no-caps
          size="sm"
          color="primary"
          :unelevated="activeTemplateId === tpl.id"
          :outline="activeTemplateId !== tpl.id"
          :class="
            activeTemplateId === tpl.id
              ? 'bg-primary text-on-primary'
              : 'border-border'
          "
          :label="tpl.label"
          @click="applyTemplate(tpl)"
        >
          <q-tooltip>{{ templateHint(tpl) }}</q-tooltip>
        </q-btn>
      </div>
      <q-space />
      <q-toggle
        v-if="needsWriteConfirm"
        v-model="writeConfirmed"
        dense
        color="warning"
        label="I confirm write / delete"
      >
        <q-tooltip>Required before send on write or delete requests</q-tooltip>
      </q-toggle>
      <q-btn
        unelevated
        square
        no-caps
        color="primary"
        icon="send"
        label="Send"
        :loading="sending"
        :disable="needsWriteConfirm && !writeConfirmed"
        @click="sendRequest"
      >
        <q-tooltip>Send request (Ctrl/Cmd+Enter)</q-tooltip>
      </q-btn>
    </div>

    <div
      class="flex flex-wrap items-center gap-2 flex-shrink-0 border border-border bg-page-elevated p-2"
    >
      <span class="text-caption text-text-muted">Export</span>
      <div class="flex flex-wrap items-stretch gap-1">
        <q-btn
          outline
          dense
          square
          no-caps
          size="sm"
          color="primary"
          class="border-border"
          label="Copy curl"
          @click="copyExport('curl', true)"
        >
          <q-tooltip>Copy curl with API key redacted</q-tooltip>
        </q-btn>
        <q-btn
          outline
          dense
          square
          no-caps
          size="sm"
          color="primary"
          class="border-border"
          label="curl + key"
          @click="copyExport('curl', false)"
        >
          <q-tooltip>Includes API key. Share carefully.</q-tooltip>
        </q-btn>
        <q-btn
          outline
          dense
          square
          no-caps
          size="sm"
          color="primary"
          class="border-border"
          label="Copy HTTP"
          @click="copyExport('http', true)"
        >
          <q-tooltip>Copy HTTP request with API key redacted</q-tooltip>
        </q-btn>
        <q-btn
          outline
          dense
          square
          no-caps
          size="sm"
          color="primary"
          class="border-border"
          label="Copy n8n JSON"
          @click="copyExport('n8n', true)"
        >
          <q-tooltip>Copy n8n node JSON with API key redacted</q-tooltip>
        </q-btn>
        <q-btn
          outline
          dense
          square
          no-caps
          size="sm"
          color="primary"
          class="border-border"
          label="n8n + key"
          @click="copyExport('n8n', false)"
        >
          <q-tooltip>Includes API key. Share carefully.</q-tooltip>
        </q-btn>
      </div>
    </div>

    <div
      class="grid grid-cols-1 xl:grid-cols-3 gap-3 flex-1 min-h-0 overflow-auto"
    >
      <q-card flat bordered square class="bg-page-elevated flex flex-col min-h-0">
        <q-card-section class="pb-2">
          <div class="text-subtitle2 font-semibold mb-3">Request</div>
          <q-select
            v-model="method"
            :options="methodOptions"
            outlined
            dense
            square
            label="Method"
            class="mb-3"
            @update:model-value="onRequestEdited"
          />
          <q-input
            v-model="path"
            outlined
            dense
            square
            label="Path"
            hint="Relative to instance host"
            class="mb-2"
            @update:model-value="onRequestEdited"
          />
        </q-card-section>
      </q-card>

      <q-card flat bordered square class="bg-page-elevated flex flex-col min-h-0">
        <q-card-section class="pb-2 flex-1 flex flex-col min-h-0">
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="text-subtitle2 font-semibold">Body / knobs</div>
            <q-btn
              outline
              dense
              square
              no-caps
              size="sm"
              color="primary"
              class="border-border"
              icon="content_copy"
              label="Copy"
              :disable="!needsBody || !body.trim()"
              @click="copyBody"
            >
              <q-tooltip>Copy JSON body</q-tooltip>
            </q-btn>
          </div>
          <div
            v-if="method === 'POST' && path.includes('/search')"
            class="grid grid-cols-2 gap-2 mb-3"
          >
            <q-input
              v-model="searchKnobs.q"
              outlined
              dense
              square
              label="q"
              hint="Search query"
              @update:model-value="syncKnobsToBody"
            />
            <q-input
              v-model="searchKnobs.filter"
              outlined
              dense
              square
              label="filter"
              hint="Filter expression"
              @update:model-value="syncKnobsToBody"
            />
            <q-input
              v-model.number="searchKnobs.limit"
              type="number"
              outlined
              dense
              square
              label="limit"
              @update:model-value="syncKnobsToBody"
            />
            <q-input
              v-model.number="searchKnobs.offset"
              type="number"
              outlined
              dense
              square
              label="offset"
              @update:model-value="syncKnobsToBody"
            />
            <q-input
              v-model="searchKnobs.sort"
              outlined
              dense
              square
              label="sort (comma)"
              class="col-span-2"
              @update:model-value="syncKnobsToBody"
            />
            <q-input
              v-model="searchKnobs.attributesToRetrieve"
              outlined
              dense
              square
              label="attributesToRetrieve (comma)"
              class="col-span-2"
              @update:model-value="syncKnobsToBody"
            />
          </div>
          <q-input
            v-model="body"
            type="textarea"
            outlined
            dense
            square
            autogrow
            class="font-mono text-caption flex-1"
            label="JSON body"
            :disable="!needsBody"
            @update:model-value="persist"
          />
        </q-card-section>
      </q-card>

      <q-card flat bordered square class="bg-page-elevated flex flex-col min-h-0">
        <q-card-section class="pb-2 flex-1 flex flex-col min-h-0">
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2 min-w-0">
              <div class="text-subtitle2 font-semibold">Response</div>
              <div
                v-if="responseMeta"
                class="text-caption text-text-muted truncate"
              >
                {{ responseMeta.status }} · {{ responseMeta.durationMs }}ms
              </div>
            </div>
            <q-btn
              outline
              dense
              square
              no-caps
              size="sm"
              color="primary"
              class="border-border"
              icon="content_copy"
              label="Copy"
              :disable="!hasCopyableResponse"
              @click="copyResponse"
            >
              <q-tooltip>Copy response</q-tooltip>
            </q-btn>
          </div>
          <pre
            class="text-caption whitespace-pre-wrap break-all overflow-auto flex-1 min-h-48 bg-page p-3 border border-border"
            >{{ responseText || "Send a request to see the response." }}</pre
          >
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useSettingsStore } from "src/meili-core/stores/settings-store";
import {
  PLAYGROUND_TEMPLATES,
  buildExportRequest,
  executePlaygroundRequest,
  isDestructiveMethod,
  serializeCurl,
  serializeHttp,
  serializeN8nJson,
} from "src/meili-core/utils/playground-request";
import { copyText } from "src/utils/clipboard";
import { showError } from "src/utils/notifications";

const props = defineProps({
  indexUid: {
    type: String,
    required: true,
  },
});

const theSettings = useSettingsStore();
const templates = PLAYGROUND_TEMPLATES;
const methodOptions = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const TEMPLATE_HINTS = {
  search: "POST search this index",
  "get-document": "GET one document by id",
  "get-settings": "GET index settings",
  "get-stats": "GET index stats",
  "add-documents": "POST documents (write)",
  "delete-document": "DELETE one document by id",
};

const templateHint = (tpl) =>
  TEMPLATE_HINTS[tpl.id] || `${tpl.method} ${tpl.label}`;

const method = ref("POST");
const path = ref("");
const body = ref("");
const sending = ref(false);
const writeConfirmed = ref(false);
const responseText = ref("");
const responseMeta = ref(null);
const activeTemplateId = ref(null);

const searchKnobs = reactive({
  q: "",
  filter: "",
  limit: 20,
  offset: 0,
  sort: "",
  attributesToRetrieve: "",
});

const needsBody = computed(() =>
  ["POST", "PUT", "PATCH"].includes(method.value),
);

const needsWriteConfirm = computed(() =>
  isDestructiveMethod(method.value, path.value),
);

const hasCopyableResponse = computed(() =>
  Boolean((responseText.value || "").trim()),
);

const persist = () => {
  theSettings.setIndexPlaygroundState(props.indexUid, {
    method: method.value,
    path: path.value,
    body: body.value,
  });
};

const matchActiveTemplate = () => {
  const match = templates.find(
    (tpl) =>
      tpl.method === method.value && tpl.path(props.indexUid) === path.value,
  );
  activeTemplateId.value = match?.id || null;
};

const onRequestEdited = () => {
  matchActiveTemplate();
  persist();
};

const applyTemplate = (tpl) => {
  method.value = tpl.method;
  path.value = tpl.path(props.indexUid);
  body.value = tpl.body || "";
  writeConfirmed.value = false;
  activeTemplateId.value = tpl.id;
  if (tpl.id === "search") {
    syncBodyToKnobs();
  }
  persist();
};

const syncBodyToKnobs = () => {
  try {
    const parsed = JSON.parse(body.value || "{}");
    searchKnobs.q = parsed.q ?? "";
    searchKnobs.filter = parsed.filter ?? "";
    searchKnobs.limit = parsed.limit ?? 20;
    searchKnobs.offset = parsed.offset ?? 0;
    searchKnobs.sort = Array.isArray(parsed.sort)
      ? parsed.sort.join(",")
      : parsed.sort || "";
    searchKnobs.attributesToRetrieve = Array.isArray(
      parsed.attributesToRetrieve,
    )
      ? parsed.attributesToRetrieve.join(",")
      : "";
  } catch {
    // Keep knobs as-is when body is invalid JSON.
  }
};

const syncKnobsToBody = () => {
  let parsed = {};
  try {
    parsed = JSON.parse(body.value || "{}");
  } catch {
    parsed = {};
  }
  parsed.q = searchKnobs.q;
  if (searchKnobs.filter) parsed.filter = searchKnobs.filter;
  else delete parsed.filter;
  parsed.limit = Number(searchKnobs.limit) || 20;
  parsed.offset = Number(searchKnobs.offset) || 0;
  if (searchKnobs.sort) {
    parsed.sort = searchKnobs.sort
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    delete parsed.sort;
  }
  if (searchKnobs.attributesToRetrieve) {
    parsed.attributesToRetrieve = searchKnobs.attributesToRetrieve
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    delete parsed.attributesToRetrieve;
  }
  body.value = JSON.stringify(parsed, null, 2);
  persist();
};

const sendRequest = async () => {
  if (needsWriteConfirm.value && !writeConfirmed.value) {
    showError("Confirm write / delete before sending.");
    return;
  }
  sending.value = true;
  try {
    const result = await executePlaygroundRequest({
      host: theSettings.indexUrl,
      apiKey: theSettings.indexKey,
      method: method.value,
      path: path.value,
      body: body.value,
    });
    responseMeta.value = {
      status: result.status,
      durationMs: result.durationMs,
    };
    responseText.value =
      typeof result.data === "string"
        ? result.data
        : JSON.stringify(result.data, null, 2);
    if (!result.ok) {
      showError(`Request failed (${result.status})`);
    }
  } catch (error) {
    showError(`Request error: ${error.message}`);
    responseText.value = error.message;
  } finally {
    sending.value = false;
  }
};

const copyBody = () =>
  copyText(body.value, {
    successMessage: "JSON body copied",
    emptyMessage: "JSON body is empty",
  });

const copyResponse = () =>
  copyText(responseText.value, {
    successMessage: "Response copied",
    emptyMessage: "No response to copy yet",
  });

const copyExport = async (kind, redact) => {
  const req = buildExportRequest({
    host: theSettings.indexUrl,
    apiKey: theSettings.indexKey,
    method: method.value,
    path: path.value,
    body: body.value,
    redact,
  });
  let text = "";
  if (kind === "curl") text = serializeCurl(req);
  else if (kind === "http") text = serializeHttp(req);
  else text = serializeN8nJson(req);
  await copyText(text, {
    successMessage: redact
      ? "Copied (redacted Bearer)"
      : "Copied (includes API key)",
  });
};

const onKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    sendRequest();
  }
};

const applySeed = (seed) => {
  if (!seed || seed.indexUid !== props.indexUid) return;
  if (seed.type === "document" && seed.documentId != null) {
    method.value = "GET";
    path.value = `/indexes/${props.indexUid}/documents/${encodeURIComponent(seed.documentId)}`;
    body.value = "";
  } else if (seed.type === "search") {
    method.value = "POST";
    path.value = `/indexes/${props.indexUid}/search`;
    body.value =
      typeof seed.body === "string"
        ? seed.body
        : JSON.stringify(seed.body || { q: "", limit: 20 }, null, 2);
    syncBodyToKnobs();
  }
  matchActiveTemplate();
  persist();
};

onMounted(() => {
  const saved = theSettings.getIndexPlaygroundState(props.indexUid);
  method.value = saved.method || "POST";
  path.value = saved.path || `/indexes/${props.indexUid}/search`;
  body.value = saved.body || '{\n  "q": "",\n  "limit": 20\n}';
  syncBodyToKnobs();
  matchActiveTemplate();

  const seed = theSettings.consumePlaygroundSeed();
  if (seed) applySeed(seed);
});

watch(
  () => props.indexUid,
  (uid) => {
    const saved = theSettings.getIndexPlaygroundState(uid);
    method.value = saved.method || "POST";
    path.value = saved.path || `/indexes/${uid}/search`;
    body.value = saved.body || '{\n  "q": "",\n  "limit": 20\n}';
    syncBodyToKnobs();
    writeConfirmed.value = false;
    responseText.value = "";
    responseMeta.value = null;
    matchActiveTemplate();
  },
);

watch(
  () => theSettings.playgroundSeed,
  (seed) => {
    if (!seed) return;
    const consumed = theSettings.consumePlaygroundSeed();
    if (consumed) applySeed(consumed);
  },
);
</script>
