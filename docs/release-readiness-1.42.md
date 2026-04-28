# Release Readiness - Meili Manager Upgrade (1.11 -> 1.42.x)

This note summarizes what shipped in the current upgrade wave and what to verify before release.

## Scope Delivered

- Meilisearch JS dependencies upgraded for newer server compatibility.
- Backward-safe behavior added for legacy `1.11.x` via version-aware feature gating.
- New stable CE features added where available:
  - stricter document updates (`skipCreation`) with optional task metadata
  - search diagnostics toggles and metadata header support
  - fields metadata explorer
  - similar documents flow
  - document fetch-by-IDs
  - LLM-facing controls (`embedders`, localized attributes, hybrid search controls)
  - transportable search rules pack import/export
- UX polish:
  - reusable search controls panel
  - refinement list styling and filter density control
  - index list scanability improvements

## Compatibility Strategy

- Target support:
  - `1.11.x` (legacy-safe mode)
  - `1.42.x` (full modern CE mode)
- Runtime capability detection is based on server `pkgVersion`.
- Unsupported controls are disabled and unsupported params are omitted from requests.

## User-Visible Improvements

- Search panel now includes one-click LLM demo presets:
  - Keyword-heavy
  - Balanced
  - Semantic-heavy
- Search diagnostics now expose runtime behavior clearly for demos.
- Relevancy tab includes pinning helper and rules pack portability workflow.

## Residual Risks / Notes

- Legacy servers may still expose edge behavior differences depending on patch-level quirks.
- Large chunk warnings remain in build output; not a release blocker for this scope.
- Existing lint rule relaxations remain in place from prior compatibility passes.

## Release Recommendation

Release is suitable after running the versioned QA checklist in `docs/qa-checklist-1.11-1.42.md`.
