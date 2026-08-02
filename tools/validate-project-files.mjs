import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const projectsRoot = path.join(rootDir, 'public', 'projects');
const indexPath = path.join(projectsRoot, 'index.json');

let errorCount = 0;

function fail(message) {
  errorCount += 1;
  console.error(`ERROR: ${message}`);
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDateString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function readJson(filePath, label) {
  let raw;

  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    fail(`${label} is missing at ${path.relative(rootDir, filePath)}`);
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    fail(`${label} is not valid JSON at ${path.relative(rootDir, filePath)}: ${error.message}`);
    return null;
  }
}

function expectString(value, fieldPath) {
  if (!isNonEmptyString(value)) {
    fail(`${fieldPath} must be a non-empty string`);
    return false;
  }

  return true;
}

function expectOptionalString(value, fieldPath) {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value !== 'string') {
    fail(`${fieldPath} must be a string when provided`);
    return false;
  }

  return true;
}

function expectObject(value, fieldPath) {
  if (!isPlainObject(value)) {
    fail(`${fieldPath} must be an object`);
    return false;
  }

  return true;
}

function expectArray(value, fieldPath) {
  if (!Array.isArray(value)) {
    fail(`${fieldPath} must be an array`);
    return false;
  }

  return true;
}

function normaliseProjectFilePath(projectId, relativePath) {
  if (!isNonEmptyString(relativePath)) {
    return null;
  }

  const expectedPrefix = `/public/projects/${projectId}/`;

  if (!relativePath.startsWith(expectedPrefix)) {
    fail(`Catalog path ${relativePath} must start with ${expectedPrefix}`);
    return null;
  }

  return path.join(rootDir, relativePath.replace(/^\/+/, '').replace(/\//g, path.sep));
}

function validateProjectJson(projectJson, projectId) {
  if (!expectObject(projectJson, `${projectId} project.json`)) {
    return;
  }

  expectString(projectJson.id, `${projectId} project.json:id`);
  expectString(projectJson.name, `${projectId} project.json:name`);
  expectString(projectJson.shortName, `${projectId} project.json:shortName`);
  expectString(projectJson.description, `${projectId} project.json:description`);
  expectString(projectJson.status, `${projectId} project.json:status`);
  expectString(projectJson.selectorSummary, `${projectId} project.json:selectorSummary`);
  expectString(projectJson.singleScanMessage, `${projectId} project.json:singleScanMessage`);

  if (projectJson.id && projectJson.id !== projectId) {
    fail(`${projectId} project.json:id must match folder/catalog id`);
  }

  if (expectObject(projectJson.site, `${projectId} project.json:site`)) {
    expectString(projectJson.site.name, `${projectId} project.json:site.name`);
    expectString(projectJson.site.country, `${projectId} project.json:site.country`);
  }

  if (expectObject(projectJson.programme, `${projectId} project.json:programme`)) {
    expectString(projectJson.programme.cadence, `${projectId} project.json:programme.cadence`);
    expectString(projectJson.programme.objectiveShort, `${projectId} project.json:programme.objectiveShort`);
  }

  if (expectObject(projectJson.environment, `${projectId} project.json:environment`)) {
    expectString(projectJson.environment.defaultLocationName, `${projectId} project.json:environment.defaultLocationName`);

    if (!isValidDateString(projectJson.environment.fallbackSurveyEndDate)) {
      fail(`${projectId} project.json:environment.fallbackSurveyEndDate must use YYYY-MM-DD`);
    }

    if (projectJson.environment.weatherWindowMonths !== undefined && typeof projectJson.environment.weatherWindowMonths !== 'number') {
      fail(`${projectId} project.json:environment.weatherWindowMonths must be a number when provided`);
    }

    expectOptionalString(projectJson.environment.timezone, `${projectId} project.json:environment.timezone`);

    if (projectJson.environment.tide !== undefined && !isPlainObject(projectJson.environment.tide)) {
      fail(`${projectId} project.json:environment.tide must be an object when provided`);
    }
  }

  if (projectJson.branding !== undefined && !isPlainObject(projectJson.branding)) {
    fail(`${projectId} project.json:branding must be an object when provided`);
  }

  if (projectJson.workflow !== undefined) {
    if (expectArray(projectJson.workflow, `${projectId} project.json:workflow`)) {
      projectJson.workflow.forEach((step, index) => {
        if (!expectObject(step, `${projectId} project.json:workflow[${index}]`)) {
          return;
        }

        expectString(step.stage, `${projectId} project.json:workflow[${index}].stage`);
        expectString(step.title, `${projectId} project.json:workflow[${index}].title`);
        expectString(step.copy, `${projectId} project.json:workflow[${index}].copy`);
      });
    }
  }
}

function validateAreasJson(areasJson, projectId) {
  if (!expectObject(areasJson, `${projectId} areas.json`)) {
    return new Set();
  }

  if (!expectArray(areasJson.areas, `${projectId} areas.json:areas`)) {
    return new Set();
  }

  const areaIds = new Set();

  areasJson.areas.forEach((area, index) => {
    if (!expectObject(area, `${projectId} areas.json:areas[${index}]`)) {
      return;
    }

    expectString(area.id, `${projectId} areas.json:areas[${index}].id`);
    expectString(area.overviewCode, `${projectId} areas.json:areas[${index}].overviewCode`);
    expectString(area.title, `${projectId} areas.json:areas[${index}].title`);

    if (area.number !== undefined && typeof area.number !== 'number') {
      fail(`${projectId} areas.json:areas[${index}].number must be a number when provided`);
    }

    if (area.id) {
      if (areaIds.has(area.id)) {
        fail(`${projectId} areas.json contains duplicate area id ${area.id}`);
      }

      areaIds.add(area.id);
    }
  });

  return areaIds;
}

function validateScansJson(scansJson, projectId) {
  if (!expectObject(scansJson, `${projectId} scans.json`)) {
    return new Set();
  }

  if (!expectArray(scansJson.surveys, `${projectId} scans.json:surveys`)) {
    return new Set();
  }

  const surveyIds = new Set();

  scansJson.surveys.forEach((survey, index) => {
    if (!expectObject(survey, `${projectId} scans.json:surveys[${index}]`)) {
      return;
    }

    expectString(survey.id, `${projectId} scans.json:surveys[${index}].id`);
    expectString(survey.label, `${projectId} scans.json:surveys[${index}].label`);
    expectString(survey.shortDate, `${projectId} scans.json:surveys[${index}].shortDate`);

    if (!isValidDateString(survey.dateFrom)) {
      fail(`${projectId} scans.json:surveys[${index}].dateFrom must use YYYY-MM-DD`);
    }

    if (!isValidDateString(survey.dateTo)) {
      fail(`${projectId} scans.json:surveys[${index}].dateTo must use YYYY-MM-DD`);
    }

    expectOptionalString(survey.status, `${projectId} scans.json:surveys[${index}].status`);
    expectOptionalString(survey.readiness, `${projectId} scans.json:surveys[${index}].readiness`);
    expectOptionalString(survey.assetFolder, `${projectId} scans.json:surveys[${index}].assetFolder`);
    expectOptionalString(survey.dataFolder, `${projectId} scans.json:surveys[${index}].dataFolder`);
    expectOptionalString(survey.notes, `${projectId} scans.json:surveys[${index}].notes`);

    if (survey.comparisonBaseline !== null && survey.comparisonBaseline !== undefined && typeof survey.comparisonBaseline !== 'string') {
      fail(`${projectId} scans.json:surveys[${index}].comparisonBaseline must be a string or null`);
    }

    if (survey.id) {
      if (surveyIds.has(survey.id)) {
        fail(`${projectId} scans.json contains duplicate survey id ${survey.id}`);
      }

      surveyIds.add(survey.id);
    }
  });

  scansJson.surveys.forEach((survey, index) => {
    if (survey.comparisonBaseline && !surveyIds.has(survey.comparisonBaseline)) {
      fail(`${projectId} scans.json:surveys[${index}].comparisonBaseline references missing survey id ${survey.comparisonBaseline}`);
    }
  });

  return surveyIds;
}

function validateSurveyAreaOverrides(json, projectId, areaIds) {
  if (!expectObject(json, `${projectId} survey-area-overrides.json`)) {
    return;
  }

  if (json.surveyAreaOverrides === undefined) {
    warn(`${projectId} survey-area-overrides.json has no surveyAreaOverrides key`);
    return;
  }

  if (!expectObject(json.surveyAreaOverrides, `${projectId} survey-area-overrides.json:surveyAreaOverrides`)) {
    return;
  }

  for (const [surveyId, overridesByArea] of Object.entries(json.surveyAreaOverrides)) {
    if (!expectObject(overridesByArea, `${projectId} survey-area-overrides.json:surveyAreaOverrides.${surveyId}`)) {
      continue;
    }

    for (const [areaId, areaOverride] of Object.entries(overridesByArea)) {
      if (!areaIds.has(areaId)) {
        fail(`${projectId} survey-area-overrides.json references unknown area id ${areaId} under survey ${surveyId}`);
      }

      if (!expectObject(areaOverride, `${projectId} survey-area-overrides.json:surveyAreaOverrides.${surveyId}.${areaId}`)) {
        continue;
      }
    }
  }
}

function validateVolumeChange(json, projectId, areaIds, surveyIds) {
  if (!expectObject(json, `${projectId} volume-change.json`)) {
    return;
  }

  if (json.volumeChangeComparisons === undefined) {
    warn(`${projectId} volume-change.json has no volumeChangeComparisons key`);
    return;
  }

  if (!expectObject(json.volumeChangeComparisons, `${projectId} volume-change.json:volumeChangeComparisons`)) {
    return;
  }

  for (const [surveyId, comparison] of Object.entries(json.volumeChangeComparisons)) {
    if (!surveyIds.has(surveyId)) {
      fail(`${projectId} volume-change.json references unknown survey id ${surveyId}`);
    }

    if (!expectObject(comparison, `${projectId} volume-change.json:volumeChangeComparisons.${surveyId}`)) {
      continue;
    }

    if (comparison.baselineSurveyId && !surveyIds.has(comparison.baselineSurveyId)) {
      fail(`${projectId} volume-change.json comparison ${surveyId} references unknown baseline survey id ${comparison.baselineSurveyId}`);
    }

    if (comparison.areas !== undefined) {
      if (!expectObject(comparison.areas, `${projectId} volume-change.json:volumeChangeComparisons.${surveyId}.areas`)) {
        continue;
      }

      for (const [areaId, areaComparison] of Object.entries(comparison.areas)) {
        if (!areaIds.has(areaId)) {
          fail(`${projectId} volume-change.json comparison ${surveyId} references unknown area id ${areaId}`);
        }

        if (!expectObject(areaComparison, `${projectId} volume-change.json:volumeChangeComparisons.${surveyId}.areas.${areaId}`)) {
          continue;
        }
      }
    }
  }
}

async function validateProjectEntry(projectEntry) {
  if (!expectObject(projectEntry, 'public/projects/index.json project entry')) {
    return;
  }

  const projectId = projectEntry.id;

  if (!expectString(projectId, 'public/projects/index.json project entry:id')) {
    return;
  }

  expectString(projectEntry.name, `catalog project ${projectId}:name`);
  expectString(projectEntry.status, `catalog project ${projectId}:status`);
  expectString(projectEntry.summary, `catalog project ${projectId}:summary`);

  const projectFilePath = normaliseProjectFilePath(projectId, projectEntry.projectPath);
  const areasFilePath = normaliseProjectFilePath(projectId, projectEntry.areasPath);
  const scansFilePath = normaliseProjectFilePath(projectId, projectEntry.scansPath);
  const contentFilePath = projectEntry.contentPath ? normaliseProjectFilePath(projectId, projectEntry.contentPath) : null;

  const projectJson = projectFilePath ? await readJson(projectFilePath, `${projectId} project.json`) : null;
  const areasJson = areasFilePath ? await readJson(areasFilePath, `${projectId} areas.json`) : null;
  const scansJson = scansFilePath ? await readJson(scansFilePath, `${projectId} scans.json`) : null;

  validateProjectJson(projectJson, projectId);
  const areaIds = validateAreasJson(areasJson, projectId);
  const surveyIds = validateScansJson(scansJson, projectId);

  if (contentFilePath) {
    await readJson(contentFilePath, `${projectId} content.json`);
  }

  const optionalFiles = [
    {
      fileName: 'survey-area-overrides.json',
      validate: (json) => validateSurveyAreaOverrides(json, projectId, areaIds)
    },
    {
      fileName: 'volume-change.json',
      validate: (json) => validateVolumeChange(json, projectId, areaIds, surveyIds)
    }
  ];

  for (const optionalFile of optionalFiles) {
    const optionalPath = path.join(projectsRoot, projectId, optionalFile.fileName);

    try {
      await fs.access(optionalPath);
    } catch {
      continue;
    }

    const optionalJson = await readJson(optionalPath, `${projectId} ${optionalFile.fileName}`);

    if (optionalJson) {
      optionalFile.validate(optionalJson);
    }
  }
}

async function main() {
  const projectIndex = await readJson(indexPath, 'public/projects/index.json');

  if (!projectIndex) {
    process.exit(1);
  }

  if (!expectObject(projectIndex, 'public/projects/index.json')) {
    process.exit(1);
  }

  if (!expectString(projectIndex.defaultProjectId, 'public/projects/index.json:defaultProjectId')) {
    process.exit(1);
  }

  if (!expectArray(projectIndex.projects, 'public/projects/index.json:projects')) {
    process.exit(1);
  }

  const projectIds = new Set();

  for (const projectEntry of projectIndex.projects) {
    if (isPlainObject(projectEntry) && isNonEmptyString(projectEntry.id)) {
      if (projectIds.has(projectEntry.id)) {
        fail(`public/projects/index.json contains duplicate project id ${projectEntry.id}`);
      }

      projectIds.add(projectEntry.id);
    }
  }

  if (projectIndex.defaultProjectId && !projectIds.has(projectIndex.defaultProjectId)) {
    fail(`public/projects/index.json defaultProjectId ${projectIndex.defaultProjectId} does not exist in projects list`);
  }

  for (const projectEntry of projectIndex.projects) {
    await validateProjectEntry(projectEntry);
  }

  if (errorCount > 0) {
    console.error(`\nProject validation failed with ${errorCount} error${errorCount === 1 ? '' : 's'}.`);
    process.exit(1);
  }

  console.log(`Project validation passed for ${projectIndex.projects.length} project${projectIndex.projects.length === 1 ? '' : 's'}.`);
}

await main();
