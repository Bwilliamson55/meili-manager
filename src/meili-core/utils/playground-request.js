import { normalizeMeiliHost } from "./meili-client";

/** Preset group order for Playground UI (default: Search). */
export const PLAYGROUND_TEMPLATE_GROUPS = [
  { id: "search", label: "Search" },
  { id: "documents", label: "Documents" },
  { id: "index", label: "Index" },
  { id: "instance", label: "Instance" },
  { id: "tasks", label: "Tasks" },
  { id: "keys", label: "Keys" },
  { id: "experimental", label: "Experimental" },
];

/**
 * True when this is a single-index search endpoint (not /multi-search).
 * @param {string} method
 * @param {string} path
 */
export function isSingleIndexSearchPath(method, path = "") {
  if (String(method || "").toUpperCase() !== "POST") return false;
  return /\/indexes\/[^/]+\/search\/?(\?|$)/.test(String(path || ""));
}

/**
 * True when this is the multi-search endpoint.
 * @param {string} method
 * @param {string} path
 */
export function isMultiSearchPath(method, path = "") {
  if (String(method || "").toUpperCase() !== "POST") return false;
  return /\/multi-search\/?(\?|$)/.test(String(path || ""));
}

/**
 * @param {string} uid
 */
function multiSearchBody(uid) {
  return JSON.stringify(
    {
      queries: [
        {
          indexUid: uid,
          q: "",
          limit: 20,
        },
      ],
    },
    null,
    2,
  );
}

/**
 * Federated starter: federation.distinct + sample federationOptions.weight.
 * No query-level distinct (Meili 400 if both are set).
 * @param {string} uid
 */
function federatedMultiSearchBody(uid) {
  return JSON.stringify(
    {
      federation: {
        limit: 20,
        offset: 0,
        distinct: "",
      },
      queries: [
        {
          indexUid: uid,
          q: "",
          federationOptions: {
            weight: 1.0,
          },
        },
      ],
    },
    null,
    2,
  );
}

export const PLAYGROUND_TEMPLATES = [
  // —— Search ——
  {
    id: "search",
    group: "search",
    label: "Search",
    method: "POST",
    path: (uid) => `/indexes/${uid}/search`,
    body: '{\n  "q": "",\n  "limit": 20\n}',
  },
  {
    id: "hybrid",
    group: "search",
    label: "Hybrid",
    method: "POST",
    path: (uid) => `/indexes/${uid}/search`,
    body: () =>
      JSON.stringify(
        {
          q: "",
          limit: 20,
          hybrid: {
            embedder: "default",
            semanticRatio: 0.5,
          },
        },
        null,
        2,
      ),
  },
  {
    id: "multi-search",
    group: "search",
    label: "Multi-search",
    method: "POST",
    path: () => "/multi-search",
    body: (uid) => multiSearchBody(uid),
  },
  {
    id: "federated",
    group: "search",
    label: "Federated",
    method: "POST",
    path: () => "/multi-search",
    body: (uid) => federatedMultiSearchBody(uid),
  },
  {
    id: "similar",
    group: "search",
    label: "Similar",
    method: "POST",
    path: (uid) => `/indexes/${uid}/similar`,
    body: '{\n  "id": ":id",\n  "limit": 20,\n  "embedder": "default"\n}',
  },
  {
    id: "facet-search",
    group: "search",
    label: "Facet search",
    method: "POST",
    path: (uid) => `/indexes/${uid}/facet-search`,
    body: '{\n  "facetName": "",\n  "facetQuery": "",\n  "q": ""\n}',
  },

  // —— Documents ——
  {
    id: "get-document",
    group: "documents",
    label: "Get document",
    method: "GET",
    path: (uid, docId = ":id") =>
      `/indexes/${uid}/documents/${encodeURIComponent(docId)}`,
    body: "",
  },
  {
    id: "list-documents",
    group: "documents",
    label: "List documents",
    method: "GET",
    path: (uid) => `/indexes/${uid}/documents?limit=20&offset=0`,
    body: "",
  },
  {
    id: "fetch-documents",
    group: "documents",
    label: "Fetch by IDs",
    method: "POST",
    path: (uid) => `/indexes/${uid}/documents/fetch`,
    body: '{\n  "ids": [":id"]\n}',
  },
  {
    id: "add-documents",
    group: "documents",
    label: "Add documents",
    method: "POST",
    path: (uid) => `/indexes/${uid}/documents`,
    body: "[\n  {}\n]",
  },
  {
    id: "delete-document",
    group: "documents",
    label: "Delete document",
    method: "DELETE",
    path: (uid, docId = ":id") =>
      `/indexes/${uid}/documents/${encodeURIComponent(docId)}`,
    body: "",
  },
  {
    id: "delete-documents-batch",
    group: "documents",
    label: "Delete batch",
    method: "POST",
    path: (uid) => `/indexes/${uid}/documents/delete-batch`,
    body: '[\n  ":id"\n]',
  },

  // —— Index ——
  {
    id: "get-settings",
    group: "index",
    label: "Get settings",
    method: "GET",
    path: (uid) => `/indexes/${uid}/settings`,
    body: "",
  },
  {
    id: "patch-settings",
    group: "index",
    label: "Patch settings",
    method: "PATCH",
    path: (uid) => `/indexes/${uid}/settings`,
    body: "{\n  \n}",
  },
  {
    id: "get-stats",
    group: "index",
    label: "Get stats",
    method: "GET",
    path: (uid) => `/indexes/${uid}/stats`,
    body: "",
  },
  {
    id: "get-fields",
    group: "index",
    label: "Fields",
    method: "GET",
    path: (uid) => `/indexes/${uid}/fields`,
    body: "",
  },
  {
    id: "get-index",
    group: "index",
    label: "Get index",
    method: "GET",
    path: (uid) => `/indexes/${uid}`,
    body: "",
  },

  // —— Instance ——
  {
    id: "health",
    group: "instance",
    label: "Health",
    method: "GET",
    path: () => "/health",
    body: "",
  },
  {
    id: "version",
    group: "instance",
    label: "Version",
    method: "GET",
    path: () => "/version",
    body: "",
  },
  {
    id: "cluster-stats",
    group: "instance",
    label: "Cluster stats",
    method: "GET",
    path: () => "/stats",
    body: "",
  },
  {
    id: "list-indexes",
    group: "instance",
    label: "List indexes",
    method: "GET",
    path: () => "/indexes",
    body: "",
  },
  {
    id: "create-dump",
    group: "instance",
    label: "Create dump",
    method: "POST",
    path: () => "/dumps",
    body: "",
  },

  // —— Tasks ——
  {
    id: "list-tasks",
    group: "tasks",
    label: "List tasks",
    method: "GET",
    path: () => "/tasks?limit=20",
    body: "",
  },
  {
    id: "get-task",
    group: "tasks",
    label: "Get task",
    method: "GET",
    path: () => "/tasks/:uid",
    body: "",
  },
  {
    id: "cancel-tasks",
    group: "tasks",
    label: "Cancel tasks",
    method: "POST",
    path: () => "/tasks/cancel",
    body: '{\n  "uids": []\n}',
  },
  {
    id: "delete-tasks",
    group: "tasks",
    label: "Delete tasks",
    method: "POST",
    path: () => "/tasks/delete",
    body: '{\n  "uids": []\n}',
  },

  // —— Keys ——
  {
    id: "list-keys",
    group: "keys",
    label: "List keys",
    method: "GET",
    path: () => "/keys",
    body: "",
  },
  {
    id: "get-key",
    group: "keys",
    label: "Get key",
    method: "GET",
    path: () => "/keys/:key",
    body: "",
  },
  {
    id: "create-key",
    group: "keys",
    label: "Create key",
    method: "POST",
    path: () => "/keys",
    body: '{\n  "description": "",\n  "actions": ["search"],\n  "indexes": ["*"],\n  "expiresAt": null\n}',
  },
  {
    id: "delete-key",
    group: "keys",
    label: "Delete key",
    method: "DELETE",
    path: () => "/keys/:key",
    body: "",
  },

  // —— Experimental ——
  {
    id: "get-experimental",
    group: "experimental",
    label: "Get experimental",
    method: "GET",
    path: () => "/experimental-features",
    body: "",
  },
  {
    id: "patch-experimental",
    group: "experimental",
    label: "Patch experimental",
    method: "PATCH",
    path: () => "/experimental-features",
    body: '{\n  "dynamicSearchRules": true\n}',
  },
  {
    id: "list-dynamic-rules",
    group: "experimental",
    label: "List dynamic rules",
    method: "POST",
    path: () => "/dynamic-search-rules",
    body: '{\n  "offset": 0,\n  "limit": 20\n}',
  },
  {
    id: "get-dynamic-rule",
    group: "experimental",
    label: "Get dynamic rule",
    method: "GET",
    path: () => "/dynamic-search-rules/:uid",
    body: "",
  },
  {
    id: "get-network",
    group: "experimental",
    label: "Get network",
    method: "GET",
    path: () => "/network",
    body: "",
  },
  {
    id: "patch-network",
    group: "experimental",
    label: "Patch network",
    method: "PATCH",
    path: () => "/network",
    body: "{\n  \n}",
  },
];

/**
 * Resolve a template body (string or uid => string).
 * @param {{ body?: string | ((uid: string) => string) }} tpl
 * @param {string} uid
 */
export function resolveTemplateBody(tpl, uid) {
  if (typeof tpl.body === "function") return tpl.body(uid) || "";
  return tpl.body || "";
}

/**
 * @param {string} host
 * @param {string} path
 * @returns {string}
 */
export function buildPlaygroundUrl(host, path) {
  const baseUrl = normalizeMeiliHost(host);
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(cleanPath, `${baseUrl}/`).toString();
}

/**
 * @param {{ method: string, url: string, headers: Record<string,string>, body?: string }} req
 * @returns {string}
 */
export function serializeCurl(req) {
  const parts = [`curl -X ${req.method} '${req.url}'`];
  for (const [key, value] of Object.entries(req.headers || {})) {
    parts.push(`  -H '${key}: ${value}'`);
  }
  if (req.body && ["POST", "PUT", "PATCH"].includes(req.method)) {
    const escaped = String(req.body).replace(/'/g, `'\\''`);
    parts.push(`  --data-raw '${escaped}'`);
  }
  return parts.join(" \\\n");
}

/**
 * @param {{ method: string, url: string, headers: Record<string,string>, body?: string }} req
 * @returns {string}
 */
export function serializeHttp(req) {
  const lines = [`${req.method} ${req.url}`];
  for (const [key, value] of Object.entries(req.headers || {})) {
    lines.push(`${key}: ${value}`);
  }
  if (req.body && ["POST", "PUT", "PATCH"].includes(req.method)) {
    lines.push("");
    lines.push(String(req.body));
  }
  return lines.join("\n");
}

/**
 * Build a canvas-pasteable n8n workflow snippet with one HTTP Request node.
 * Shape matches n8n 1.x paste import (`nodes` + `connections` + `meta.instanceId`).
 * Parameter names follow `n8n-nodes-base.httpRequest` V3/4.x (typeVersion 4.2).
 *
 * @param {{ method: string, url: string, headers: Record<string,string>, body?: string }} req
 * @returns {string}
 */
export function serializeN8nJson(req) {
  const method = String(req.method || "GET").toUpperCase();
  const needsBody = ["POST", "PUT", "PATCH"].includes(method);
  const headers = req.headers || {};
  const authHeader =
    headers.Authorization || headers.authorization || "Bearer REDACTED";

  /** @type {Record<string, unknown>} */
  const parameters = {
    method,
    url: req.url,
    authentication: "none",
    sendHeaders: true,
    headerParameters: {
      parameters: [
        {
          name: "Authorization",
          value: authHeader,
        },
      ],
    },
    // HTTP Request Options.timeout (ms). Meili search/docs can be slow; 30s is
    // defensive without the 300s runtime fallback used when timeout is omitted.
    options: {
      timeout: 30000,
    },
  };

  if (needsBody && req.body !== undefined && req.body !== null && req.body !== "") {
    parameters.sendBody = true;
    parameters.contentType = "json";
    parameters.specifyBody = "json";
    // jsonBody is an n8n "json" string field; keep pretty JSON when parseable.
    if (typeof req.body === "string") {
      try {
        parameters.jsonBody = JSON.stringify(JSON.parse(req.body), null, 2);
      } catch {
        parameters.jsonBody = req.body;
      }
    } else {
      parameters.jsonBody = JSON.stringify(req.body, null, 2);
    }
  }

  const nodeId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `meili-http-${Date.now()}`;

  const node = {
    parameters,
    id: nodeId,
    name: "Meilisearch Request",
    type: "n8n-nodes-base.httpRequest",
    typeVersion: 4.2,
    position: [0, 0],
    // Node Settings (not parameters.options): light retry for transient failures.
    retryOnFail: true,
    maxTries: 3,
    waitBetweenTries: 1000,
  };

  return JSON.stringify(
    {
      nodes: [node],
      connections: {},
      pinData: {},
      meta: {
        instanceId: "meili-manager-playground",
      },
    },
    null,
    2,
  );
}

/**
 * @param {{ host: string, apiKey: string, method: string, path: string, body?: string, redact?: boolean }} options
 */
export function buildExportRequest(options) {
  const {
    host,
    apiKey,
    method,
    path,
    body = "",
    redact = true,
  } = options;
  const url = buildPlaygroundUrl(host, path);
  const bearer = redact ? "REDACTED" : apiKey;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${bearer}`,
  };
  const needsBody = ["POST", "PUT", "PATCH"].includes(method);
  return {
    method,
    url,
    headers,
    body: needsBody ? body : undefined,
  };
}

/**
 * Execute a raw Meilisearch HTTP request (same auth pattern as settings-store.rawRequest).
 * @returns {Promise<{ ok: boolean, status: number, durationMs: number, data: any, rawText: string }>}
 */
export async function executePlaygroundRequest({
  host,
  apiKey,
  method,
  path,
  body = "",
}) {
  const url = buildPlaygroundUrl(host, path);
  const headers = new Headers({
    "Content-Type": "application/json",
  });
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }

  const requestOptions = {
    method,
    headers,
  };

  if (["POST", "PUT", "PATCH"].includes(method) && body !== undefined) {
    requestOptions.body =
      typeof body === "string" ? body : JSON.stringify(body);
  }

  const started = performance.now();
  const response = await fetch(url, requestOptions);
  const durationMs = Math.round(performance.now() - started);
  const rawText = await response.text();
  let data = null;
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    durationMs,
    data,
    rawText,
  };
}

export function isDestructiveMethod(method, path = "") {
  const m = String(method || "").toUpperCase();
  if (m === "DELETE") return true;
  if (
    ["POST", "PUT", "PATCH"].includes(m) &&
    /\/documents(\/|$|\?)/.test(path) &&
    !/\/documents\/fetch/.test(path)
  ) {
    return true;
  }
  // Task cancel/delete and dump creation mutate cluster state.
  if (m === "POST" && /\/(tasks\/(cancel|delete)|dumps)\/?(\?|$)/.test(path)) {
    return true;
  }
  // Keys create / experimental + network patches.
  if (
    ["POST", "PUT", "PATCH"].includes(m) &&
    /\/(keys|experimental-features|network)\/?(\?|$)/.test(path)
  ) {
    return true;
  }
  return false;
}
