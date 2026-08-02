# Multi-Project Structure

## Phase 1 goal

Phase 1 keeps the current Padstow monitoring app working while introducing a reusable folder structure for multiple monitoring projects.

The Phase 1 result now uses `public/projects/` as the main runtime and admin-write structure for project identity, scans, area overrides, content, and volume-change records.
Padstow remains the first live project inside that structure, while the original legacy dataset files are still retained in the repo for reference and low-risk rollback.

## New project catalog

```text
public/
  projects/
    index.json
    padstow-estuary/
      project.json
      areas.json
      scans.json
      content.json
      survey-area-overrides.json
      volume-change.json
      assets/
        maps/
        panoramas/
        models/
        reports/
        stats/
    example-estuary/
      project.json
      areas.json
      scans.json
      content.json
      survey-area-overrides.json
      volume-change.json
      assets/
        maps/
        panoramas/
        models/
        reports/
        stats/
```

## File roles

- `public/projects/index.json`
  Lists all available projects and points the selector page and app loader to each project's metadata files.

- `project.json`
  Holds project identity, summary text, high-level programme metadata, and any legacy data-source pointer needed for incremental migration.

- `areas.json`
  Holds the project's monitoring area list and baseline area metadata.

- `scans.json`
  Holds the project's survey-round list in a reusable format.

- `content.json`
  Holds project-specific overview copy, help copy, and survey-round notes so future projects do not inherit Padstow narrative text from the app runtime.

- `survey-area-overrides.json`
  Holds per-survey area metadata saved through the admin tools, such as timing, tide alignment, notes, and status labels.

- `volume-change.json`
  Holds per-survey change-analysis records saved through the admin tools, including comparison summaries and polygon totals.

- `assets/...`
  Reserved project-local folders for future maps, panoramas, models, reports, and stats that should sit with project content instead of staying mixed into app-level paths.

## Current routing

- `/`
  Backward-compatible default app entry.

- `/projects`
  Project selector page.

- `/project/:slug`
  Main monitoring app route for a specific project.

## Runtime loading model

1. The app reads the project slug from `/project/:slug`.
2. The app loads `project.json`, `areas.json`, `scans.json`, and optionally `content.json` from `public/projects/<slug>/`.
3. The app also loads optional `survey-area-overrides.json` and `volume-change.json` files when they exist.
4. Admin save flows now write back into those same project-local files instead of the old shared dataset.

## Validation

- `npm run check`
  Runs JavaScript syntax checks for the main runtime files and validates the `public/projects/` catalog plus each project's required JSON files.

- `tools/validate-project-files.mjs`
  Confirms required files exist, required fields are present, IDs stay aligned across folder names and catalog entries, and common cross-references such as survey baselines and area IDs stay valid.

## Padstow status

Padstow is the first project inside the new structure.
Its active runtime content, area overrides, and volume-change records now load from the project folder.
The original shared dataset files are still present in the repo as a fallback reference, but they are no longer the main runtime path for Padstow.

## Adding a future project

1. Run `npm run scaffold:project -- --id hayle-estuary --name "Hayle Estuary Monitoring"`.
2. Optionally add:
   `--site "Hayle Estuary"`
   `--country "England"`
   `--survey-date 2026-07-21`
   `--survey-name "Baseline Survey - 21 July 2026"`
   `--areas "Outer Reach|Central Flats|Inner Channel"`
3. Update the generated `project.json`, `areas.json`, `scans.json`, and `content.json` with the real project details.
4. Add project assets into the matching `assets/` subfolders as needed.
5. Visit `/project/<new-slug>`.

The scaffold command creates the folder, starter JSON files, empty admin-write files, asset subfolders, and the matching `public/projects/index.json` entry automatically.
When `--areas` is supplied, the scaffold creates `area1`, `area2`, and so on from the provided titles.
For copy-paste command examples, see `docs/PROJECT_SCAFFOLD_COOKBOOK.md`.
For a recommended autonomous pipeline handoff format, see `docs/PROCESSING_LIBRARY_SCHEMA.md`.

## Known Phase 1 limitations

- Some offline `file:///` preview behavior still depends on the bundled inline data script in `data/projects.inline.js`.
- The original legacy dataset files remain in the repo for safety and reference, even though the main runtime path now uses project-local files.
- Asset loading is mostly, but not completely, project-local in this phase.
- The example project is intentionally a placeholder with single-scan behavior only.
