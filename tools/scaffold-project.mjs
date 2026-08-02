import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const projectsRoot = path.join(rootDir, 'public', 'projects');
const catalogPath = path.join(projectsRoot, 'index.json');
const templateProjectId = 'example-estuary';
function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function toTitleCase(value) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function normaliseSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function formatDateLong(dateString) {
  const date = new Date(`${dateString}T12:00:00Z`);

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function formatDateShort(dateString) {
  const date = new Date(`${dateString}T12:00:00Z`);

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith('--')) {
      result[key] = true;
      continue;
    }

    result[key] = next;
    index += 1;
  }

  return result;
}

function isValidDateString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseAreaTitles(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function readJson(filePath, label) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    fail(`Unable to read ${label}: ${error.message}`);
  }
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function buildProjectJson({ slug, projectName, siteName, today }) {
  return {
    id: slug,
    name: projectName,
    shortName: projectName,
    description: `Starter monitoring workspace for ${siteName}, ready to be replaced with live project-specific content and survey outputs.`,
    status: 'Starter placeholder',
    selectorSummary: `Reference setup for future onboarding at ${siteName}.`,
    singleScanMessage: 'Change monitoring will become available after the second comparable survey.',
    site: {
      name: siteName,
      county: 'TBD',
      country: 'United Kingdom',
      context: `Use this folder as the safe starter for the ${siteName} rollout without affecting any live projects.`
    },
    programme: {
      cadence: 'Starter project',
      objectiveShort: 'Prepare reusable onboarding structure',
      operationalLesson: 'New projects need a clear home for identity, area setup, and scan metadata before the first repeat comparison exists.',
      consolidationGoal: 'Use the same folders, routing, and metadata shape as Padstow without inheriting Padstow-specific text or assets.'
    },
    environment: {
      defaultLocationName: siteName,
      fallbackSurveyEndDate: today,
      weatherWindowMonths: 1,
      timezone: 'Europe/London',
      tide: {
        latitude: '',
        longitude: '',
        datum: 'CD'
      }
    },
    branding: {
      overviewHeroImagePath: `/public/projects/${slug}/assets/maps/${slug}-overview.png`
    },
    workflow: [
      { stage: '1', title: 'Define the project', copy: 'Set the project metadata, public route, and reporting tone in project.json.' },
      { stage: '2', title: 'Add monitoring areas', copy: 'List the initial monitoring areas in areas.json so the shared UI can render them.' },
      { stage: '3', title: 'Load the first scan', copy: 'Add the opening survey round in scans.json and wire any available assets.' },
      { stage: '4', title: 'Unlock change monitoring', copy: 'Once a second comparable survey exists, the comparison features can be populated.' }
    ]
  };
}

function buildAreasJson(areaTitles = []) {
  const titles = areaTitles.length ? areaTitles : ['Example Monitoring Area'];

  return {
    areas: titles.map((title, index) => ({
      id: `area${index + 1}`,
      number: index + 1,
      overviewCode: `A${index + 1}`,
      title,
      day: 'Initial setup',
      zone: areaTitles.length ? 'Project-defined monitoring reach' : 'Placeholder estuary reach',
      filterKey: 'setup',
      statusLabel: areaTitles.length ? 'Area defined' : 'Starter area',
      statusTone: areaTitles.length ? 'green' : 'blue',
      purpose: areaTitles.length
        ? `Initial monitoring area for ${title}. Replace this with the real project-specific purpose for this reach.`
        : 'Starter monitoring area used to prove the multi-project structure before real survey content is added.'
    }))
  };
}

function buildScansJson({ slug, surveyDate, surveyName }) {
  return {
    surveys: [
      {
        id: surveyDate,
        label: surveyName || `Survey Round 1 - ${formatDateLong(surveyDate)}`,
        shortDate: formatDateShort(surveyDate),
        dateFrom: surveyDate,
        dateTo: surveyDate,
        status: surveyName ? 'Initial survey configured' : 'Starter survey loaded',
        readiness: 'single scan only',
        assetFolder: `${slug}/${surveyDate}`,
        dataFolder: surveyDate,
        comparisonBaseline: null,
        notes: surveyName
          ? `Initial survey scaffolded for ${surveyName}.`
          : 'Placeholder single-scan project used to show the baseline multi-project behavior.'
      }
    ]
  };
}

function buildContentJson({ surveyDate, longDate, hasCustomAreas, firstAreaTitle }) {
  return {
    overviewModes: {
      information: {
        heroTitle: 'Set up the project story before the second scan exists',
        heroText: 'This placeholder project shows how a future estuary can define its own project story without inheriting Padstow text.',
        storyTitle: 'Project Information',
        contentsSubtext: 'Use this file as the template for new project narrative content.',
        story: [
          {
            id: 'starter-purpose',
            title: 'Why this placeholder exists',
            paragraphs: [
              'This starter project is here to prove the multi-project structure and make future onboarding easier.',
              'Replace this copy with the real project context, objectives, and monitoring purpose for the next estuary.'
            ]
          }
        ]
      },
      help: {
        heroTitle: 'Guide the next project without hard-coding it in the app',
        heroText: 'Each new project can now define its own help copy inside its project folder.',
        storyTitle: 'Project Help',
        contentsSubtext: 'Use this space for tool guidance and client-facing help tailored to the new project.',
        story: [
          {
            id: 'starter-help',
            title: 'How to use this placeholder',
            paragraphs: [
              'Treat this as a starter pack for the next onboarding.',
              'Add the real navigation guidance, area notes, and measurement explanations once the project is live.'
            ]
          }
        ]
      }
    },
    surveySpecificOverview: {
      [surveyDate]: {
        heroTitle: 'Single-scan starter project',
        heroText: 'This starter survey is intentionally a first-round only example. It demonstrates the baseline state before change monitoring is available.',
        storyTitle: 'Survey Notes',
        contentsSubtext: 'Use this section for project-specific field notes once the real work begins.',
        glance: [
          ['Survey window', longDate],
          ['Current state', 'Single scan only'],
          ['Change monitoring', 'Not active yet'],
          ['Next milestone', 'Add a second comparable survey'],
          ['Routing', 'Project folder structure working'],
          ['Purpose', 'Reusable onboarding baseline']
        ],
        story: [
          {
            id: 'starter-single-scan',
            title: 'Why change monitoring is not active yet',
            paragraphs: [
              'This example project only has one survey round, so the platform correctly stays in its baseline state.',
              'Once a second comparable survey exists, comparison and change features can be populated.'
            ]
          }
        ]
      }
    },
    panoramaGuides: {
      area1: {
        summary: hasCustomAreas
          ? `Starter panorama guidance for ${firstAreaTitle}.`
          : 'Starter panorama guidance for a new project.',
        stats: [
          ['Main focus', 'Future area context', 'Replace this with the real area-specific panorama purpose.'],
          ['Best for', 'Visual onboarding', 'Use this as a placeholder until a hosted panorama exists.']
        ],
        details: [
          ['What to look for', 'Describe the main landform, shoreline, or channel features that matter for this area.'],
          ['Why it matters', 'Explain how the panorama supports the measured outputs for the project.'],
          ['Client takeaway', 'Add the one-sentence message a non-technical viewer should leave with.']
        ]
      }
    }
  };
}

function buildCatalogEntry({ slug, projectName }) {
  return {
    id: slug,
    name: projectName,
    status: 'Starter placeholder',
    summary: 'Reference structure for the next project onboarding, including the single-scan fallback state.',
    projectPath: `/public/projects/${slug}/project.json`,
    areasPath: `/public/projects/${slug}/areas.json`,
    scansPath: `/public/projects/${slug}/scans.json`,
    contentPath: `/public/projects/${slug}/content.json`
  };
}

async function createAssetDirectories(targetDir) {
  const directories = [
    targetDir,
    path.join(targetDir, 'assets'),
    path.join(targetDir, 'assets', 'maps'),
    path.join(targetDir, 'assets', 'panoramas'),
    path.join(targetDir, 'assets', 'models'),
    path.join(targetDir, 'assets', 'reports'),
    path.join(targetDir, 'assets', 'stats')
  ];

  for (const directory of directories) {
    await fs.mkdir(directory, { recursive: true });
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const rawSlug = typeof args.id === 'string' ? args.id : '';
  const slug = normaliseSlug(rawSlug);

  if (!slug) {
    fail('Please provide a project slug with --id, for example --id hayle-estuary');
  }

  if (slug === templateProjectId) {
    fail(`The slug ${templateProjectId} is reserved for the scaffold template.`);
  }

  const projectName = typeof args.name === 'string' && args.name.trim()
    ? args.name.trim()
    : `${toTitleCase(slug.replace(/-/g, ' '))} Monitoring`;
  const siteName = typeof args.site === 'string' && args.site.trim()
    ? args.site.trim()
    : toTitleCase(slug.replace(/-/g, ' '));
  const country = typeof args.country === 'string' && args.country.trim()
    ? args.country.trim()
    : 'United Kingdom';
  const surveyDate = typeof args['survey-date'] === 'string' && args['survey-date'].trim()
    ? args['survey-date'].trim()
    : new Date().toISOString().slice(0, 10);
  const surveyName = typeof args['survey-name'] === 'string' && args['survey-name'].trim()
    ? args['survey-name'].trim()
    : '';
  const areaTitles = parseAreaTitles(args.areas);

  if (!isValidDateString(surveyDate)) {
    fail('Please provide --survey-date in YYYY-MM-DD format, for example --survey-date 2026-07-21');
  }

  const longDate = formatDateLong(surveyDate);

  const targetDir = path.join(projectsRoot, slug);

  if (await pathExists(targetDir)) {
    fail(`Project folder already exists for ${slug}`);
  }

  const catalog = await readJson(catalogPath, 'public/projects/index.json');

  if (!catalog || !Array.isArray(catalog.projects)) {
    fail('Project catalog is missing a projects array');
  }

  if (catalog.projects.some((project) => project && project.id === slug)) {
    fail(`Project catalog already contains ${slug}`);
  }

  await createAssetDirectories(targetDir);

  const projectJson = buildProjectJson({ slug, projectName, siteName, today: surveyDate });
  projectJson.site.country = country;

  await writeJson(path.join(targetDir, 'project.json'), projectJson);
  await writeJson(path.join(targetDir, 'areas.json'), buildAreasJson(areaTitles));
  await writeJson(path.join(targetDir, 'scans.json'), buildScansJson({ slug, surveyDate, surveyName }));
  await writeJson(path.join(targetDir, 'content.json'), buildContentJson({
    surveyDate,
    longDate,
    hasCustomAreas: areaTitles.length > 0,
    firstAreaTitle: areaTitles[0] || 'Area 1'
  }));
  await writeJson(path.join(targetDir, 'survey-area-overrides.json'), { surveyAreaOverrides: {} });
  await writeJson(path.join(targetDir, 'volume-change.json'), { volumeChangeComparisons: {} });

  catalog.projects.push(buildCatalogEntry({ slug, projectName }));
  await writeJson(catalogPath, catalog);

  console.log(`Created project scaffold ${slug}`);
  console.log(`Route: /project/${slug}`);
  console.log(`Initial survey: ${surveyName || `Survey Round 1 - ${formatDateLong(surveyDate)}`} (${surveyDate})`);
  console.log(`Areas created: ${areaTitles.length || 1}`);
  console.log(`Files written under public/projects/${slug}/`);
}

await main();
