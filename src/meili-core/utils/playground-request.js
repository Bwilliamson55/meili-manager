import { normalizeMeiliHost } from "./meili-client";

export const PLAYGROUND_TEMPLATES = [
  {
    id: "search",
    label: "Search",
    method: "POST",
    path: (uid) => `/indexes/${uid}/search`,
    body: '{\n  "q": "",\n  "limit": 20\n}',
  },
  {
    id: "get-document",
    label: "Get document",
    method: "GET",
    path: (uid, docId = ":id") =>
      `/indexes/${uid}/documents/${encodeURIComponent(docId)}`,
    body: "",
  },
  {
    id: "get-settings",
    label: "Get settings",
    method: "GET",
    path: (uid) => `/indexes/${uid}/settings`,
    body: "",
  },
  {
    id: "get-stats",
    label: "Get stats",
    method: "GET",
    path: (uid) => `/indexes/${uid}/stats`,
    body: "",
  },
  {
    id: "add-documents",
    label: "Add documents",
    method: "POST",
    path: (uid) => `/indexes/${uid}/documents`,
    body: "[\n  {}\n]",
  },
  {
    id: "delete-document",
    label: "Delete document",
    method: "DELETE",
    path: (uid, docId = ":id") =>
      `/indexes/${uid}/documents/${encodeURIComponent(docId)}`,
    body: "",
  },
];

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
  return false;
}
