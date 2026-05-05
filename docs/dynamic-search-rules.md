# Dynamic Search Rules (Meili-Manager)

This app exposes Meilisearch **Dynamic Search Rules** when the server supports the experimental flag `dynamicSearchRules` (`PATCH /experimental-features`).

## UI entry

- Header tab **Dynamic rules** → route `/dynamic-rules`.
- Requires saved Meilisearch URL + API key in the sidebar (same as other pages).

## Capabilities surfaced

| Area | Behavior |
|------|----------|
| Feature flag | Reads `GET /experimental-features`. Shows when `dynamicSearchRules` is off; **Enable** sends `PATCH` with `{ "dynamicSearchRules": true }` (requires a key with permission to update experimental features). |
| List rules | `POST /dynamic-search-rules` with `offset`, `limit`, optional `filter.active`, optional `filter.attribute_patterns` (comma-separated UID patterns in the UI). |
| Get / upsert | `GET` / `PATCH /dynamic-search-rules/{uid}` — full editor for conditions and pin actions. |
| Delete | `DELETE /dynamic-search-rules/{uid}` with confirmation. |
| Test search | **Test search** opens a dialog that runs `POST /indexes/{indexUid}/search` and compares hit order to pinned document IDs (first results page only). |

## Rule semantics (operator notes)

- **Conditions** are **AND**-combined: every condition must match for the rule to apply.
- **Query** conditions: substring `contains`, and/or “query is empty” (`isEmpty: true`).
- **Time** conditions: optional `start` / `end` (ISO 8601). The editor uses `<input type="datetime-local">` and converts to ISO when saving.
- **Pin actions**: `selector.indexUid`, `selector.id`, `action.type: "pin"`, `action.position` (0-based slot in the result list).
- **Priority**: lower numeric values win when rules disagree; ties on the same position are ordered by ascending priority.

## API keys

Use keys with the appropriate `dynamicSearchRules.*` actions (get/update/delete) as required by your Meilisearch version. If reads or writes fail with permission errors, create a new key with the right actions in **Keys** or in the Meilisearch admin.

## Upgrade / regression notes

When upgrading Meilisearch, re-check:

- Experimental-features response shape (boolean flags).
- Dynamic rules list request/response (`results`, `offset`, `limit`, `total`).
- Whether time or query condition schemas changed.

The in-app **Test search** panel is a smoke check only; it does not simulate federated or multi-index network search.
