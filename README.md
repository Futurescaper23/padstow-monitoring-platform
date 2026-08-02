# FutureScaping Monitoring System

This folder is the start of the unified estuary monitoring app.

## Run locally

From the workspace root:

```powershell
node server.js
```

Then open `http://localhost:3080`.

## Public demo vs internal tools

Client-facing builds are controlled by `src/config/projectConfig.js`.

```js
export const projectConfig = {
  showAdminTools: false
};
```

- `showAdminTools: false` hides the Admin tab, upload console, survey round manager, context editor, volume-change intake, and footer admin toggle.
- `showAdminTools: true` keeps the internal FutureScaping admin workflow available, using the existing admin-mode/password behaviour.

Use `false` for polished public demos and client portals. Use `true` for internal project setup, data intake, and survey management.

## Reusable project structure

The first reusable product settings now live under `src/`:

- `src/config/projectConfig.js`: product name, data path, default URL state, navigation tabs, terminology, and admin visibility.
- `src/data/surveys.js`: survey-round defaults used when creating new rounds.
- `src/data/areas.js`: area count, layer definitions, expected upload assets, survey/shared asset roots, and filename variants.
- `src/data/sections.js`: default section count and fallback section-line tracks.
- `src/data/volumeChange.js`: reusable monitored-volume terminology and fallback values.
- `src/data/environmentalContext.js`: weather-window defaults and tide provider coordinates.

The app still reads the current project records from `data/projects.json`. The next refactor pass should migrate the larger Padstow-specific area narratives and overview stories into project data files.

## Deploying

This app is best treated as a small Node service, not a static site.

Why:

- `server.js` serves the app itself
- `/api/upload` writes files into `survey-data/`
- `/api/survey-area-metadata` and `/api/volume-change` write updates into `data/projects.json`
- `/api/weather` and `/api/tides` are server routes

### Recommended host

- GitHub for source control
- Render or Railway for hosting

`Netlify` is not the best fit for this version because the current app expects:

- a long-running Node server
- writable local folders
- writable JSON data

### Render-ready setup

This repo now includes:

- `package.json`
- `.env.example`
- `render.yaml`

### Environment variables

Set these in the host:

- `ADMIN_PASSWORD`
- `WORLDTIDES_API_KEY`
- `PORT` (optional if your host sets it automatically)

### Start command

```text
npm start
```

## What this version does

- consolidates the current Padstow prototype apps into one interface
- reads shared project data from `data/projects.json`
- lets you switch between survey rounds, areas, imagery layers, and section profiles
- reads survey-specific assets from `survey-data/`
- includes a seeded baseline survey round for `2025-02-18`
- includes an admin upload tab for writing files into the correct survey and area folder
- includes a survey-wide admin board so you can inspect all 8 areas for the selected round
- uses the darker FutureScaping visual style and a viewer-first layers panel
- supports zoom, wheel zoom, drag-to-pan, and reset in the layers view

## What the survey selector means right now

The baseline survey round has been copied into:

```text
survey-data/padstow-estuary/2025-02-18/area1/
survey-data/padstow-estuary/2025-02-18/area2/
...
```

Later rounds are now genuinely treated as missing until their own files are added. The UI will show that clearly instead of silently reusing the wrong imagery.

Each survey area folder also includes a `manifest.json` checklist describing the expected file set.

## Upload workflow

1. Start the local server.
2. Open the app in the browser.
3. Go to the `Admin` tab.
4. Select the survey round and area at the top of the app.
5. Choose any subset of the expected files and upload them.
6. The files are written into the matching `survey-data/<project>/<survey>/<area>/` folder.
7. The readiness view updates after upload.
8. Use the survey board in the same tab to jump between areas and see what is still missing.

## Processing Hub sync workflow

For FutureScaping's internal rollout, the Processing Hub should now be treated as the upstream source of truth, and this app should sync from it into the local monitoring library.

The source roots live in:

- `tools/processing-hub-sources.json`

Use the importer like this:

```powershell
npm run import:processing-round -- --project-id padstow-estuary --survey-id 2026-07-21 --scan-id scan_4
```

Useful options:

- `--areas area2` imports just one area
- `--dry-run` shows what would be copied without writing files
- `--config path\to\processing-hub-sources.json` uses a different source map

What the importer does:

1. reads each `monitoring_manifest.json` inside the selected Processing Hub scan folder
2. copies `ortho`, `dsm`, and `contours` exports into `survey-data/<project>/<survey>/<area>/`
3. resolves `section_profiles.csv` from the manifest path, or falls back to the latest available dated section-profile export for that area
4. writes the monitoring-platform `manifest.json` for each imported area
5. reuses `shared-data/<project>/<area>/section_lines.png` when that shared section-line overlay already exists

This keeps the app stable for deployment while still making the Processing Hub the single place future scan rounds are pulled from.

## Next data step

For each future survey round, the intended pattern is:

1. create or confirm the survey round in `public/projects/<project>/scans.json`
2. process outputs inside the Processing Hub
3. run `npm run import:processing-round -- --project-id <project> --survey-id <survey> --scan-id <scan>`
4. keep the UI unchanged while the importer refreshes `survey-data/<project>/<survey>/<area>/`

Expected files per area:

- `ortho.jpg`
- `dsm.png`
- `contour.png`
- `section_lines.png`
- `section_profiles.csv`
- `manifest.json`

## Current structure

- `index.html`: app shell
- `styles.css`: shared styling
- `app.js`: data-driven browser logic
- `data/projects.json`: project metadata and survey records
- `server.js`: tiny local static server for testing
