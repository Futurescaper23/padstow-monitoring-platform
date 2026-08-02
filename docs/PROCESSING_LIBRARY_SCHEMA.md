# Processing Library Schema

This document describes a recommended JSON handoff format for an autonomous processing library that prepares new monitoring projects and repeat survey outputs for this platform.

The aim is to let the processing pipeline emit one predictable package that can later be transformed into:

- `public/projects/<slug>/project.json`
- `public/projects/<slug>/areas.json`
- `public/projects/<slug>/scans.json`
- `public/projects/<slug>/content.json`
- `public/projects/<slug>/survey-area-overrides.json`
- `survey-data/<slug>/<surveyId>/<areaId>/...`
- `shared-data/<slug>/<areaId>/...`

## Design goals

- Keep the handoff format stable even if UI wording changes later.
- Make it easy to scaffold a brand-new project from one payload.
- Make it easy to append a new survey round later without rebuilding the whole project.
- Separate required fields from optional narrative or analysis extras.
- Preserve compatibility with the current plain HTML/CSS/JavaScript runtime.

## Recommended package layout

The processing library can emit one package per project, or one package per survey round, as long as the payload shape stays consistent.

Recommended top-level files:

```text
processing-output/
  project-package.json
  surveys/
    2026-07-21/
      manifest.json
      areas/
        area1/
          manifest.json
          ortho.jpg
          dsm.png
          contours.png
          section_lines.png
          section_profiles.csv
```

## Top-level schema

```json
{
  "schemaVersion": "1.0",
  "generatedAt": "2026-07-21T10:30:00Z",
  "generator": {
    "name": "your-processing-library",
    "version": "0.1.0"
  },
  "project": {},
  "surveys": [],
  "sharedAssets": {},
  "optionalOutputs": {}
}
```

## `project`

Use this section to define the reusable project identity and area catalogue.

```json
{
  "id": "hayle-estuary",
  "name": "Hayle Estuary Monitoring",
  "shortName": "Hayle Estuary Monitoring",
  "description": "Repeat survey monitoring workspace for Hayle Estuary.",
  "status": "Baseline project",
  "selectorSummary": "Repeat survey monitoring across Hayle Estuary.",
  "singleScanMessage": "Change monitoring will become available after the second comparable survey.",
  "site": {
    "name": "Hayle Estuary",
    "county": "Cornwall",
    "country": "England",
    "context": "Plain-English project context for overview copy."
  },
  "programme": {
    "cadence": "Repeat survey programme",
    "objectiveShort": "Track estuary change over time",
    "operationalLesson": "Optional processing or delivery note.",
    "consolidationGoal": "Optional internal rollout note."
  },
  "environment": {
    "defaultLocationName": "Hayle Estuary",
    "fallbackSurveyEndDate": "2026-07-21",
    "weatherWindowMonths": 1,
    "timezone": "Europe/London",
    "tide": {
      "latitude": "50.1880",
      "longitude": "-5.4200",
      "datum": "CD"
    }
  },
  "areas": []
}
```

### Required project fields

- `project.id`
- `project.name`
- `project.description`
- `project.status`
- `project.selectorSummary`
- `project.site.name`
- `project.site.country`
- `project.environment.fallbackSurveyEndDate`
- `project.areas`

## `project.areas`

This is the best place for the processing library to define the stable area catalogue.

```json
[
  {
    "id": "area1",
    "number": 1,
    "overviewCode": "A1",
    "title": "Outer Reach",
    "day": "Day 1",
    "zone": "Outer estuary",
    "filterKey": "day1",
    "statusLabel": "Baseline area",
    "statusTone": "green",
    "purpose": "What this reach is used for in the monitoring story."
  }
]
```

### Recommended rules

- Keep `area.id` stable across all survey rounds.
- Use sequential IDs like `area1`, `area2`, `area3` unless you have a strong reason not to.
- Keep `overviewCode` aligned with the area number if possible.
- Treat this list as the source for `areas.json`.

## `surveys`

This section should contain one item per survey round.

```json
[
  {
    "id": "2026-07-21",
    "label": "Baseline Survey - 21 July 2026",
    "shortDate": "21 Jul 2026",
    "dateFrom": "2026-07-21",
    "dateTo": "2026-07-21",
    "status": "Initial survey configured",
    "readiness": "single scan only",
    "assetFolder": "hayle-estuary/2026-07-21",
    "dataFolder": "2026-07-21",
    "comparisonBaseline": null,
    "notes": "Optional plain-English round note.",
    "overview": {},
    "areas": []
  }
]
```

### Required survey fields

- `id`
- `label`
- `dateFrom`
- `dateTo`
- `assetFolder`
- `areas`

### Recommended rules

- Use `YYYY-MM-DD` for survey IDs unless you truly need something else.
- Keep `comparisonBaseline` set to another survey ID or `null`.
- Treat the top-level survey list as the source for `scans.json`.

## `surveys[].overview`

This is optional, but useful if your pipeline can produce client-facing survey summary text.

```json
{
  "heroTitle": "Baseline survey round",
  "heroText": "Optional narrative summary for the selected survey.",
  "storyTitle": "Survey Notes",
  "contentsSubtext": "Optional help text.",
  "glance": [
    ["Survey window", "21 Jul 2026"],
    ["Current state", "Single scan only"]
  ],
  "story": [
    {
      "id": "round-summary",
      "title": "Why this survey matters",
      "paragraphs": [
        "Optional client-facing note one.",
        "Optional client-facing note two."
      ]
    }
  ]
}
```

This maps naturally into `content.json > surveySpecificOverview`.

## `surveys[].areas`

This is the most useful section for the autonomous library, because it lets one survey round carry its own per-area outputs and notes.

```json
[
  {
    "areaId": "area1",
    "summary": {
      "statusLabel": "Near low tide",
      "statusTone": "green",
      "purpose": "Optional survey-specific purpose override.",
      "start": "13:14",
      "finish": "13:56",
      "size": "0.91 km2",
      "lowTide": "13:47",
      "lowTideHeight": "0.53 m",
      "launchOffset": "33 mins before low tide",
      "estimatedDuration": "31m 21s",
      "actualDuration": "39m 11s",
      "tideWindow": "Crossing low water",
      "tideScore": 95,
      "missionRole": "What role this area played in the field session.",
      "operationalNote": "Access, weather, or logistics note.",
      "weatherNotes": "Plain-English conditions note.",
      "surveyNotes": "Interpretation note.",
      "tags": ["Day 1", "Outer estuary", "Near low tide"],
      "cardNote": "Short card summary"
    },
    "assets": {
      "ortho": "ortho.jpg",
      "dsm": "dsm.png",
      "contours": "contours.png",
      "sectionLines": "section_lines.png",
      "sectionProfilesCsv": "section_profiles.csv"
    },
    "manifest": {
      "expectedFiles": ["ortho.jpg", "dsm.png", "contours.png", "section_lines.png", "section_profiles.csv"],
      "presentFiles": ["ortho.jpg", "dsm.png"],
      "missingFiles": ["contours.png", "section_lines.png", "section_profiles.csv"],
      "status": "partial"
    },
    "panorama": {
      "embedUrl": "https://example-panorama-host/",
      "summary": "Optional panorama summary."
    },
    "volumeChange": {
      "baselineSurveyId": "2026-06-01",
      "method": "DSM difference raster clipped to fixed polygons",
      "cellSize": "0.05 m",
      "notes": "Plain-English area note.",
      "polygons": [
        {
          "label": "Outer Bar",
          "gainM3": 120.5,
          "lossM3": 45.2,
          "netM3": 75.3,
          "confidence": "High confidence",
          "summary": "Build-up on seaward edge."
        }
      ]
    }
  }
]
```

## `sharedAssets`

Use this for files that are not survey-specific and should live once under `shared-data/<slug>/<areaId>/`.

```json
{
  "areas": {
    "area1": {
      "sectionLinesImage": "shared-data/hayle-estuary/area1/section_lines.png",
      "sectionGeometry": "shared-data/hayle-estuary/area1/section_lines.geojson",
      "sandbarPolygons": "shared-data/hayle-estuary/area1/sandbar_polygons.geojson"
    }
  }
}
```

## `optionalOutputs`

Use this for richer outputs the platform may consume later.

```json
{
  "trendAssets": {
    "area1": {
      "manifest": "./data/area1-trend-manifest.json",
      "stats": "./data/area1-trend-stats.json",
      "image": "./assets/area1-trend-preview.png"
    }
  },
  "niraModelsBySurvey": {
    "2026-07-21": "https://example-model-host/"
  },
  "panoramaEmbedsBySurvey": {
    "2026-07-21": {
      "area1": "https://example-panorama-host/"
    }
  }
}
```

## Recommended transformation into platform files

### `project.json`

Build from:

- `project.id`
- `project.name`
- `project.shortName`
- `project.description`
- `project.status`
- `project.selectorSummary`
- `project.singleScanMessage`
- `project.site`
- `project.programme`
- `project.environment`

### `areas.json`

Build from:

- `project.areas`

### `scans.json`

Build from:

- `surveys[].id`
- `surveys[].label`
- `surveys[].shortDate`
- `surveys[].dateFrom`
- `surveys[].dateTo`
- `surveys[].status`
- `surveys[].readiness`
- `surveys[].assetFolder`
- `surveys[].dataFolder`
- `surveys[].comparisonBaseline`
- `surveys[].notes`

### `content.json`

Build from:

- optional static project narrative supplied by the pipeline
- `surveys[].overview`
- optional panorama guidance
- optional trend asset references

### `survey-area-overrides.json`

Build from:

- `surveys[].areas[].summary`

Store as:

```json
{
  "surveyAreaOverrides": {
    "2026-07-21": {
      "area1": {
        "statusLabel": "Near low tide",
        "statusTone": "green"
      }
    }
  }
}
```

### `volume-change.json`

Build from:

- `surveys[].areas[].volumeChange`

Store as:

```json
{
  "volumeChangeComparisons": {
    "2026-07-21": {
      "baselineSurveyId": "2026-06-01",
      "method": "DSM difference raster clipped to fixed polygons",
      "cellSize": "0.05 m",
      "areas": {
        "area1": {
          "notes": "Plain-English area note.",
          "polygons": []
        }
      }
    }
  }
}
```

## Minimum viable output for first integration

If you want to keep the first version of the autonomous library simple, emit just this:

```json
{
  "schemaVersion": "1.0",
  "project": {
    "id": "hayle-estuary",
    "name": "Hayle Estuary Monitoring",
    "description": "Repeat survey monitoring workspace for Hayle Estuary.",
    "status": "Baseline project",
    "selectorSummary": "Repeat survey monitoring across Hayle Estuary.",
    "site": {
      "name": "Hayle Estuary",
      "county": "Cornwall",
      "country": "England"
    },
    "environment": {
      "defaultLocationName": "Hayle Estuary",
      "fallbackSurveyEndDate": "2026-07-21"
    },
    "areas": [
      { "id": "area1", "number": 1, "overviewCode": "A1", "title": "Outer Reach", "purpose": "Initial monitoring reach." }
    ]
  },
  "surveys": [
    {
      "id": "2026-07-21",
      "label": "Baseline Survey - 21 July 2026",
      "dateFrom": "2026-07-21",
      "dateTo": "2026-07-21",
      "assetFolder": "hayle-estuary/2026-07-21",
      "areas": [
        {
          "areaId": "area1",
          "assets": {
            "ortho": "ortho.jpg",
            "dsm": "dsm.png"
          }
        }
      ]
    }
  ]
}
```

That is enough to bootstrap:

- a real project slug
- one survey round
- one or more real areas
- a predictable area-level asset structure

## Practical guidance for your library

- Emit stable IDs first, rich text second.
- Keep project-level data separate from survey-round data.
- Treat area IDs as long-lived keys, not labels.
- Prefer explicit file names over inferred naming where possible.
- Keep optional analysis outputs grouped under their own keys so the platform can adopt them incrementally.
- If the library can output both project bootstrap data and survey append data, that will be ideal for future automation.
