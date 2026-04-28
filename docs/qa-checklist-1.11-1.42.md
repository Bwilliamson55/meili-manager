# QA Checklist - Dual Version Support (`1.11.x` and `1.42.x`)

Run this checklist against two environments:

- Env A: Meilisearch `1.11.x`
- Env B: Meilisearch `1.42.x`

## Global Smoke

- [ ] App loads and instance connection succeeds.
- [ ] Index list renders and refresh works.
- [ ] Create index and delete index both complete.
- [ ] Tasks page renders and task detail opens.
- [ ] Keys page renders and create/update/delete key workflow works.

## Settings and Index Detail

- [ ] Settings tab loads and submit settings succeeds.
- [ ] Field distribution table loads.
- [ ] Search panel loads with no console/runtime errors.
- [ ] Filters open/close and refinement interactions work.
- [ ] Filter density toggle changes row density and persists after page reload.

## Legacy Expectations (`1.11.x`)

- [ ] Unsupported controls are visibly disabled (hybrid, metadata header, modern diagnostics toggles as applicable).
- [ ] No failing requests from modern-only params (confirm by basic search usage).
- [ ] Fields metadata section fails gracefully (no hard page break) if endpoint unavailable.
- [ ] Similar-doc actions are disabled when endpoint unsupported.
- [ ] Fetch-by-IDs action is disabled when endpoint unsupported.

## Modern Expectations (`1.42.x`)

- [ ] Hybrid search toggle, embedder, and semantic ratio are active.
- [ ] LLM presets apply and update search behavior.
- [ ] Diagnostics section shows ranking/performance/metadata information when enabled.
- [ ] Fields metadata reload (offset/limit) works.
- [ ] Similar documents route loads results for a valid document.
- [ ] Fetch-by-IDs returns expected rows for known IDs.
- [ ] Rules pack export and apply in Relevancy tab works.

## Documents

- [ ] Existing document update path works.
- [ ] `skipCreation` protection behavior works on existing-doc updates.
- [ ] "Allow create if ID does not exist" toggle behaves as expected.
- [ ] New document create path works and redirects correctly.

## Final Build/Quality Gates

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Manual quick scan in both light and dark mode shows no severe contrast regressions.
