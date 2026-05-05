/**
 * Helpers for Dynamic Search Rules UI ↔ API payloads.
 */

/** @typedef {{ scope: "query"; contains?: string|null; isEmpty?: boolean|null }} QueryCondition */
/** @typedef {{ scope: "time"; start?: string|null; end?: string|null }} TimeCondition */
/** @typedef {QueryCondition|TimeCondition} ConditionFormRow */

/**
 * Default empty row for condition builder UI.
 * @returns {ConditionFormRow}
 */
export function emptyConditionRow() {
  return { scope: "query", contains: "", isEmpty: false };
}

/**
 * Default empty pin action row.
 * @returns {{ indexUid: string; documentId: string; position: number }}
 */
export function emptyPinActionRow() {
  return { indexUid: "", documentId: "", position: 0 };
}

/**
 * @param {ConditionFormRow[]} rows
 * @returns {Array<Record<string, unknown>>}
 */
export function conditionsToApiPayload(rows) {
  const out = [];
  for (const row of rows) {
    if (row.scope === "query") {
      const q = {};
      if (row.isEmpty === true) {
        q.isEmpty = true;
      }
      if (row.contains != null && String(row.contains).trim() !== "") {
        q.contains = String(row.contains).trim();
      }
      if (Object.keys(q).length === 0) {
        continue;
      }
      out.push({ scope: "query", ...q });
    } else if (row.scope === "time") {
      const t = { scope: "time" };
      if (row.start) t.start = row.start;
      if (row.end) t.end = row.end;
      if (!t.start && !t.end) continue;
      out.push(t);
    }
  }
  return out;
}

/**
 * ISO 8601 → value for `<input type="datetime-local">` in local timezone.
 * @param {string|null|undefined} iso
 * @returns {string}
 */
export function isoToDatetimeLocal(iso) {
  if (!iso || typeof iso !== "string") return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * @param {Array<Record<string, unknown>>|undefined} apiConditions
 * @returns {ConditionFormRow[]}
 */
export function conditionsFromApi(apiConditions) {
  if (!Array.isArray(apiConditions) || apiConditions.length === 0) {
    return [emptyConditionRow()];
  }
  return apiConditions.map((c) => {
    if (c.scope === "query") {
      return {
        scope: "query",
        contains: c.contains != null ? String(c.contains) : "",
        isEmpty: c.isEmpty === true,
      };
    }
    if (c.scope === "time") {
      const s = c.start != null ? String(c.start) : "";
      const e = c.end != null ? String(c.end) : "";
      return {
        scope: "time",
        start: isoToDatetimeLocal(s) || s,
        end: isoToDatetimeLocal(e) || e,
      };
    }
    return emptyConditionRow();
  });
}

/**
 * @param {Array<{ selector?: { indexUid?: string; id?: string }; action?: { type?: string; position?: number }}>} apiActions
 */
export function pinActionsFromApi(apiActions) {
  if (!Array.isArray(apiActions) || apiActions.length === 0) {
    return [emptyPinActionRow()];
  }
  return apiActions.map((a) => ({
    indexUid: a.selector?.indexUid != null ? String(a.selector.indexUid) : "",
    documentId: a.selector?.id != null ? String(a.selector.id) : "",
    position:
      typeof a.action?.position === "number" ? a.action.position : Number(a.action?.position) || 0,
  }));
}

/**
 * @param {Array<{ indexUid: string; documentId: string; position: number | string }>} rows
 */
export function pinActionsToApiPayload(rows) {
  return rows
    .filter((r) => r.indexUid?.trim() && r.documentId?.trim() !== "")
    .map((r) => ({
      selector: {
        indexUid: r.indexUid.trim(),
        id: String(r.documentId).trim(),
      },
      action: {
        type: "pin",
        position: Math.max(0, Number(r.position) || 0),
      },
    }));
}

/**
 * @param {ConditionFormRow[]} conditions
 * @param {Array<{ indexUid: string; documentId: string; position: number }>} pins
 * @returns {{ ok: true } | { ok: false; message: string }}
 */
export function validateRuleDraft(conditions, pins) {
  const apiConds = conditionsToApiPayload(conditions);
  if (apiConds.length === 0) {
    return { ok: false, message: "Add at least one condition (query or time window)." };
  }
  const apiPins = pinActionsToApiPayload(pins);
  if (apiPins.length === 0) {
    return { ok: false, message: "Add at least one pin action with index and document ID." };
  }
  return { ok: true };
}
