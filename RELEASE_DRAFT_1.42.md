# Meili Manager - Compatibility + UX Upgrade (Draft)

This draft is intended for the GitHub Releases page.

## Highlights

- Upgraded Meili Manager for modern Meilisearch compatibility while preserving legacy support.
- Added version-aware behavior to support both:
  - `1.11.x` (legacy-safe mode)
  - `1.42.x` (full modern CE feature set)
- Improved UI polish and search/filter ergonomics for day-to-day usage.

## What is New

### Cross-version compatibility hardening

- Added runtime feature gating based on server version.
- Disabled unsupported controls automatically on older servers.
- Prevented modern-only params from being sent to legacy `1.11.x` servers.
- Added graceful fallbacks for newer endpoints that may be unavailable in older versions.

### Stable CE feature expansion

- Document update safety improvements:
  - strict update flow support (`skipCreation`)
  - optional task metadata on writes
- Search capability upgrades:
  - ranking diagnostics toggles
  - metadata header support
  - hybrid search controls (where supported)
  - LLM demo presets (keyword-heavy, balanced, semantic-heavy)
- New operational workflows:
  - fields metadata explorer with paging controls
  - similar-documents route and UI
  - document fetch-by-IDs workflow
- API key action coverage updated for stable CE usage.

### Relevancy and transportability improvements

- Portable Search Rules Pack export/import.
- Pinning helper UX for easier ranking-rule setup (`desc(field)` helper flow).
- New AI/LLM settings tab support for:
  - `embedders`
  - `localizedAttributes`

### UX and maintainability polish

- Extracted reusable `SearchExperiencePanel` component.
- Refined filter list visuals and added density controls (comfortable/compact).
- Improved index list scanability (shown-count chip, primary-key chip).
- DRY cleanup for shared search-state defaults and hybrid request shaping.

## Docs included in this release

- `docs/release-readiness-1.42.md`
- `docs/qa-checklist-1.11-1.42.md`
- `docs/reuse-and-embedding.md`

## Test Plan (recommended before publish)

- Validate core flows on Meilisearch `1.11.x` and `1.42.x`.
- Run:
  - `npm run lint`
  - `npm run build`
- Execute checklist in `docs/qa-checklist-1.11-1.42.md`.

## Notes

- This release draft is intentionally conservative: broad compatibility first, feature breadth second.
- Branch status: currently intended to remain on `dev` until local validation is complete.
