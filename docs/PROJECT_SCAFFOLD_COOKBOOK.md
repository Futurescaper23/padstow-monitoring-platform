# Project Scaffold Cookbook

Use these commands from the project root:

```bash
npm run scaffold:project -- --id your-project-slug --name "Your Project Monitoring"
```

## 1. Bare starter scaffold

Use this when you only want the minimum starter structure and will fill the details in afterwards.

```bash
npm run scaffold:project -- --id hayle-estuary --name "Hayle Estuary Monitoring"
```

What it gives you:

- A new `public/projects/hayle-estuary/` folder
- One starter survey using today's date, `2026-07-21`
- One placeholder area
- A new catalog entry in `public/projects/index.json`

## 2. Real baseline scaffold

Use this when you already know the first survey date and want the project to start with a sensible baseline survey label.

```bash
npm run scaffold:project -- --id hayle-estuary --name "Hayle Estuary Monitoring" --site "Hayle Estuary" --country "England" --survey-date 2026-07-21 --survey-name "Baseline Survey - 21 July 2026"
```

Best for:

- A real project being onboarded now
- A first delivery that should read more cleanly in the UI
- Avoiding generic starter survey labels

## 3. Multi-area estuary scaffold

Use this when you already know the initial monitoring reaches and want them created up front.

```bash
npm run scaffold:project -- --id hayle-estuary --name "Hayle Estuary Monitoring" --site "Hayle Estuary" --survey-date 2026-07-21 --survey-name "Baseline Survey - 21 July 2026" --areas "Outer Reach|Central Flats|Inner Channel"
```

What `--areas` does:

- Creates `area1`, `area2`, `area3`, and so on
- Uses the supplied titles in `areas.json`
- Sets a better starter state for the onboarding checklist than the single placeholder area

## 4. Safe internal placeholder project

Use this when you want a non-live planning workspace that is clearly marked as a starter and not mistaken for a real client-ready rollout.

```bash
npm run scaffold:project -- --id fal-demo-estuary --name "Fal Demo Monitoring" --site "Fal Demo Estuary" --areas "North Reach|Mudflats|Upper Channel"
```

Best for:

- Testing routes and admin flow
- Trying uploads without touching Padstow
- Proving structure before the real survey metadata is ready

## After scaffolding

1. Open `public/projects/<slug>/project.json` and replace starter wording.
2. Check `areas.json` and tighten each area's purpose, zone, and day labels.
3. Confirm `scans.json` has the right first-round label and date.
4. Add any project-specific narrative to `content.json`.
5. Run `npm run check`.
6. Visit `/project/<slug>`.

## Notes

- `--survey-date` must use `YYYY-MM-DD`.
- `--areas` uses pipe-separated titles, for example `A|B|C`.
- The scaffold only creates the first survey round. Repeat-survey comparison still begins after a second comparable survey is added.
