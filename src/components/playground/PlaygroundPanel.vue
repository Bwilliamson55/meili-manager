<template>
  <div
    class="playground-panel flex flex-col flex-1 min-h-0 p-3 gap-3"
    @keydown="onKeydown"
  >
    <div
      class="flex flex-wrap items-center gap-2 flex-shrink-0 border border-border bg-page-elevated p-2"
    >
      <span class="mm-section-kicker mr-1">Presets</span>
      <q-select
        v-model="activeGroupId"
        :options="groupOptions"
        option-value="id"
        option-label="label"
        emit-value
        map-options
        outlined
        dense
        square
        label="Group"
        class="w-40"
      />
      <div class="flex flex-wrap items-stretch gap-1">
        <q-btn
          v-for="tpl in groupTemplates"
          :key="tpl.id"
          dense
          square
          no-caps
          size="sm"
          :unelevated="activeTemplateId === tpl.id"
          :outline="activeTemplateId !== tpl.id"
          :color="activeTemplateId === tpl.id ? 'primary' : undefined"
          :class="
            activeTemplateId === tpl.id
              ? 'bg-primary text-on-primary'
              : 'border-border text-text'
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
      class="flex flex-wrap items-center gap-2 flex-shrink-0 border border-border bg-page-elevated px-2 py-1.5"
    >
      <span class="mm-section-kicker">Export for n8n / curl</span>
      <div class="flex flex-wrap items-stretch gap-1">
        <q-btn
          outline
          dense
          square
          no-caps
          size="sm"
          class="border-border text-text"
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
          class="border-border text-text"
          label="curl + key"
          @click="copyExport('curl', false)"
        >
          <q-tooltip>
            curl including the API key. Share carefully; do not paste into
            public channels.
          </q-tooltip>
        </q-btn>
        <q-btn
          outline
          dense
          square
          no-caps
          size="sm"
          class="border-border text-text"
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
          class="border-border text-text"
          label="Copy n8n JSON"
          @click="copyExport('n8n', true)"
        >
          <q-tooltip>
            Paste into n8n canvas (Ctrl/Cmd+V). HTTP Request node; Bearer
            redacted.
          </q-tooltip>
        </q-btn>
        <q-btn
          outline
          dense
          square
          no-caps
          size="sm"
          class="border-border text-text"
          label="n8n + key"
          @click="copyExport('n8n', false)"
        >
          <q-tooltip>
            n8n HTTP Request node including the API key. Share carefully; do
            not paste into public workflows.
          </q-tooltip>
        </q-btn>
      </div>
    </div>

    <div
      class="grid grid-cols-1 xl:grid-cols-3 gap-3 flex-1 min-h-0 overflow-auto"
    >
      <q-card flat bordered square class="bg-page-elevated flex flex-col min-h-0">
        <q-card-section class="pb-2">
          <div class="mm-section-title text-subtitle2 mb-1">Request</div>
          <div class="text-caption text-text-muted mb-3">
            Build method and path, then Send.
          </div>
          <q-select
            v-model="method"
            :options="methodOptions"
            outlined
            dense
            square
            label="Method"
            class="mb-3"
            @update:model-value="onDraftEdited"
          />
          <q-input
            v-model="path"
            outlined
            dense
            square
            label="Path"
            hint="Relative to instance host"
            class="mb-2"
            @update:model-value="onDraftEdited"
          />
        </q-card-section>
      </q-card>

      <q-card flat bordered square class="bg-page-elevated flex flex-col min-h-0">
        <q-card-section class="pb-2 flex-1 flex flex-col min-h-0">
          <div class="flex items-center justify-between gap-2 mb-2">
            <div>
              <div class="mm-section-title text-subtitle2">Body</div>
              <div class="text-caption text-text-muted">Request body (JSON)</div>
            </div>
            <q-btn
              outline
              dense
              square
              no-caps
              size="sm"
              class="border-border text-text"
              icon="content_copy"
              label="Copy"
              :disable="!needsBody || !body.trim()"
              @click="copyBody"
            >
              <q-tooltip>Copy JSON body</q-tooltip>
            </q-btn>
          </div>
          <div v-if="isSingleIndexSearch" class="mb-3">
            <div class="mm-section-kicker mb-2">Search options</div>
            <div class="grid grid-cols-2 gap-2">
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
            <div class="mm-section-kicker mt-3 mb-2">Hybrid</div>
            <div class="grid grid-cols-2 gap-2">
              <q-input
                v-model="searchKnobs.hybridEmbedder"
                outlined
                dense
                square
                label="embedder"
                hint="Required for hybrid"
                @update:model-value="syncKnobsToBody"
              />
              <q-input
                v-model.number="searchKnobs.hybridSemanticRatio"
                type="number"
                outlined
                dense
                square
                label="semanticRatio"
                hint="0–1"
                min="0"
                max="1"
                step="0.05"
                @update:model-value="syncKnobsToBody"
              />
            </div>
          </div>
          <div v-if="isFederatedMultiSearch" class="mb-3">
            <div class="mm-section-kicker mb-2">Federation</div>
            <div class="text-caption text-text-muted mb-2">
              Syncs into body.federation only. Prefer federation.distinct over
              query-level distinct.
            </div>
            <div class="grid grid-cols-2 gap-2">
              <q-input
                v-model="federationKnobs.distinct"
                outlined
                dense
                square
                label="distinct"
                hint="Attribute for federation.distinct"
                class="col-span-2"
                @update:model-value="syncFederationKnobsToBody"
              />
              <q-input
                v-model.number="federationKnobs.limit"
                type="number"
                outlined
                dense
                square
                label="limit"
                @update:model-value="syncFederationKnobsToBody"
              />
              <q-input
                v-model.number="federationKnobs.offset"
                type="number"
                outlined
                dense
                square
                label="offset"
                @update:model-value="syncFederationKnobsToBody"
              />
            </div>
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
            :placeholder="bodyPlaceholder"
            :disable="!needsBody"
            @update:model-value="onDraftEdited"
          />
        </q-card-section>
      </q-card>

      <q-card flat bordered square class="bg-page-elevated flex flex-col min-h-0">
        <q-card-section class="pb-2 flex-1 flex flex-col min-h-0">
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2 min-w-0">
              <div>
                <div class="mm-section-title text-subtitle2">Response</div>
                <div
                  v-if="responseMeta"
                  class="text-caption text-text-muted truncate"
                >
                  {{ responseMeta.status }} · {{ responseMeta.durationMs }}ms
                </div>
                <div v-else class="text-caption text-text-muted">
                  Results appear here after Send
                </div>
              </div>
            </div>
            <q-btn
              outline
              dense
              square
              no-caps
              size="sm"
              class="border-border text-text"
              icon="content_copy"
              label="Copy"
              :disable="!hasCopyableResponse"
              @click="copyResponse"
            >
              <q-tooltip>Copy response</q-tooltip>
            </q-btn>
          </div>
          <pre
            class="text-caption whitespace-pre-wrap break-all overflow-auto flex-1 min-h-48 bg-page p-3 border border-border text-text"
            :class="responseText ? '' : 'text-text-muted'"
            >{{
              responseText ||
              "No response yet. Click Send to run the request."
            }}</pre
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
  PLAYGROUND_TEMPLATE_GROUPS,
  buildExportRequest,
  executePlaygroundRequest,
  isDestructiveMethod,
  isMultiSearchPath,
  isSingleIndexSearchPath,
  resolveTemplateBody,
  serializeCurl,
  serializeHttp,
  serializeN8nJson,
} from "src/meili-core/utils/playground-request";
import { buildHybridConfig } from "src/meili-core/utils/search-utils";
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
const groupOptions = PLAYGROUND_TEMPLATE_GROUPS;
const methodOptions = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const TEMPLATE_HINTS = {
  search: "POST search this index",
  hybrid: "POST search with hybrid embedder + semanticRatio",
  "multi-search": "POST /multi-search with queries[]",
  federated: "POST /multi-search with federation.distinct + weights",
  similar: "POST similar documents for an id",
  "facet-search": "POST facet search on one attribute",
  "get-document": "GET one document by id",
  "list-documents": "GET documents page",
  "fetch-documents": "POST documents/fetch by ids",
  "add-documents": "POST documents (write)",
  "delete-document": "DELETE one document by id",
  "delete-documents-batch": "POST documents/delete-batch (write)",
  "get-settings": "GET index settings",
  "patch-settings": "PATCH index settings (write)",
  "get-stats": "GET index stats",
  "get-fields": "GET index fields metadata",
  "get-index": "GET index definition",
  health: "GET /health",
  version: "GET /version",
  "cluster-stats": "GET /stats",
  "list-indexes": "GET /indexes",
  "create-dump": "POST /dumps (write)",
  "list-tasks": "GET /tasks",
  "get-task": "GET /tasks/:uid",
  "cancel-tasks": "POST /tasks/cancel (write)",
  "delete-tasks": "POST /tasks/delete (write)",
  "list-keys": "GET /keys",
  "get-key": "GET /keys/:key",
  "create-key": "POST /keys (write)",
  "delete-key": "DELETE /keys/:key",
  "get-experimental": "GET /experimental-features",
  "patch-experimental": "PATCH /experimental-features (write)",
  "list-dynamic-rules": "POST /dynamic-search-rules list",
  "get-dynamic-rule": "GET /dynamic-search-rules/:uid",
  "get-network": "GET /network",
  "patch-network": "PATCH /network (write)",
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
const activeGroupId = ref("search");

const searchKnobs = reactive({
  q: "",
  filter: "",
  limit: 20,
  offset: 0,
  sort: "",
  attributesToRetrieve: "",
  hybridEmbedder: "",
  hybridSemanticRatio: 0.5,
});

const federationKnobs = reactive({
  distinct: "",
  limit: 20,
  offset: 0,
});

const needsBody = computed(() =>
  ["POST", "PUT", "PATCH"].includes(method.value),
);

const bodyPlaceholder = computed(() =>
  needsBody.value
    ? '{\n  "q": "",\n  "limit": 20\n}'
    : "No body for this method",
);

const isSingleIndexSearch = computed(() =>
  isSingleIndexSearchPath(method.value, path.value),
);

const isMultiSearch = computed(() =>
  isMultiSearchPath(method.value, path.value),
);

const bodyHasFederation = computed(() => {
  if (!isMultiSearch.value) return false;
  try {
    const parsed = JSON.parse(body.value || "{}");
    return Boolean(parsed && typeof parsed === "object" && parsed.federation);
  } catch {
    return false;
  }
});

const isFederatedMultiSearch = computed(
  () => isMultiSearch.value && bodyHasFederation.value,
);

const needsWriteConfirm = computed(() =>
  isDestructiveMethod(method.value, path.value),
);

const hasCopyableResponse = computed(() =>
  Boolean((responseText.value || "").trim()),
);

const groupTemplates = computed(() =>
  templates.filter((tpl) => tpl.group === activeGroupId.value),
);

const persist = () => {
  theSettings.setIndexPlaygroundState(props.indexUid, {
    method: method.value,
    path: path.value,
    body: body.value,
  });
};

const templatePath = (tpl) => tpl.path(props.indexUid);

const matchActiveTemplate = () => {
  const candidates = templates.filter(
    (tpl) =>
      tpl.method === method.value && templatePath(tpl) === path.value,
  );
  if (!candidates.length) {
    activeTemplateId.value = null;
    return;
  }
  if (candidates.length === 1) {
    activeTemplateId.value = candidates[0].id;
    if (candidates[0].group) activeGroupId.value = candidates[0].group;
    return;
  }
  // Disambiguate search/hybrid and multi-search/federated by body shape.
  try {
    const parsed = JSON.parse(body.value || "{}");
    if (parsed && typeof parsed === "object") {
      const hasFed = Boolean(parsed.federation);
      const hasHybrid = Boolean(parsed.hybrid);
      const preferred = candidates.find((c) => {
        if (c.id === "federated" || c.id === "multi-search") {
          return hasFed ? c.id === "federated" : c.id === "multi-search";
        }
        if (c.id === "hybrid" || c.id === "search") {
          return hasHybrid ? c.id === "hybrid" : c.id === "search";
        }
        return false;
      });
      if (preferred) {
        activeTemplateId.value = preferred.id;
        activeGroupId.value = preferred.group;
        return;
      }
    }
  } catch {
    // fall through
  }
  if (candidates.some((c) => c.id === activeTemplateId.value)) {
    const current = candidates.find((c) => c.id === activeTemplateId.value);
    if (current?.group) activeGroupId.value = current.group;
    return;
  }
  activeTemplateId.value = candidates[0].id;
  if (candidates[0].group) activeGroupId.value = candidates[0].group;
};

const onDraftEdited = () => {
  matchActiveTemplate();
  if (isSingleIndexSearch.value) syncBodyToKnobs();
  if (isFederatedMultiSearch.value) syncBodyToFederationKnobs();
  persist();
};

const applyTemplate = (tpl) => {
  method.value = tpl.method;
  path.value = templatePath(tpl);
  body.value = resolveTemplateBody(tpl, props.indexUid);
  writeConfirmed.value = false;
  activeTemplateId.value = tpl.id;
  if (tpl.group) activeGroupId.value = tpl.group;
  if (isSingleIndexSearchPath(tpl.method, path.value)) {
    syncBodyToKnobs();
  }
  if (
    isMultiSearchPath(tpl.method, path.value) &&
    body.value.includes('"federation"')
  ) {
    syncBodyToFederationKnobs();
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
    const hybrid = parsed.hybrid;
    if (hybrid && typeof hybrid === "object") {
      searchKnobs.hybridEmbedder = hybrid.embedder ?? "";
      searchKnobs.hybridSemanticRatio =
        hybrid.semanticRatio ?? searchKnobs.hybridSemanticRatio ?? 0.5;
    } else {
      searchKnobs.hybridEmbedder = "";
    }
  } catch {
    // Keep knobs as-is when body is invalid JSON.
  }
};

const syncBodyToFederationKnobs = () => {
  try {
    const parsed = JSON.parse(body.value || "{}");
    const fed = parsed.federation;
    if (!fed || typeof fed !== "object") return;
    federationKnobs.distinct = fed.distinct ?? "";
    federationKnobs.limit = fed.limit ?? 20;
    federationKnobs.offset = fed.offset ?? 0;
  } catch {
    // Keep knobs as-is when body is invalid JSON.
  }
};

/**
 * Sync single-index search knobs into the body.
 * Never call for /multi-search (would wipe queries / federation).
 */
const syncKnobsToBody = () => {
  if (!isSingleIndexSearchPath(method.value, path.value)) return;
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
  const hybrid = buildHybridConfig({
    enableHybrid: Boolean(String(searchKnobs.hybridEmbedder || "").trim()),
    hybridEmbedder: searchKnobs.hybridEmbedder,
    hybridSemanticRatio: searchKnobs.hybridSemanticRatio,
  });
  if (hybrid) parsed.hybrid = hybrid;
  else delete parsed.hybrid;
  body.value = JSON.stringify(parsed, null, 2);
  persist();
};

/**
 * Sync federation knobs into body.federation only (preserve queries).
 */
const syncFederationKnobsToBody = () => {
  if (!isMultiSearchPath(method.value, path.value)) return;
  let parsed = {};
  try {
    parsed = JSON.parse(body.value || "{}");
  } catch {
    parsed = {};
  }
  if (!parsed || typeof parsed !== "object") parsed = {};
  if (!parsed.federation || typeof parsed.federation !== "object") {
    parsed.federation = {};
  }
  const fed = { ...parsed.federation };
  const distinct = String(federationKnobs.distinct || "").trim();
  if (distinct) fed.distinct = distinct;
  else delete fed.distinct;
  fed.limit = Number(federationKnobs.limit) || 20;
  fed.offset = Number(federationKnobs.offset) || 0;
  parsed.federation = fed;
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

const loadDraftForIndex = (uid) => {
  const saved = theSettings.getIndexPlaygroundState(uid);
  method.value = saved.method || "POST";
  path.value = saved.path || `/indexes/${uid}/search`;
  body.value = saved.body || '{\n  "q": "",\n  "limit": 20\n}';
  if (isSingleIndexSearchPath(method.value, path.value)) {
    syncBodyToKnobs();
  }
  if (isMultiSearchPath(method.value, path.value)) {
    syncBodyToFederationKnobs();
  }
  matchActiveTemplate();
};

onMounted(() => {
  loadDraftForIndex(props.indexUid);
  const seed = theSettings.consumePlaygroundSeed();
  if (seed) applySeed(seed);
});

watch(
  () => props.indexUid,
  (uid) => {
    writeConfirmed.value = false;
    responseText.value = "";
    responseMeta.value = null;
    loadDraftForIndex(uid);
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
