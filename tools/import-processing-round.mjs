import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const defaultConfigPath = path.join(rootDir, "tools", "processing-hub-sources.json");
const surveyDataRoot = path.join(rootDir, "survey-data");
const sharedDataRoot = path.join(rootDir, "shared-data");

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      result[key] = true;
      continue;
    }

    result[key] = next;
    index += 1;
  }

  return result;
}

function parseList(value) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return value
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normaliseAreaId(value) {
  const raw = String(value || "").trim().toLowerCase();
  const match = raw.match(/^area[_-]?0*(\d+)$/);

  if (!match) {
    return "";
  }

  return `area${Number(match[1])}`;
}

function toProcessingAreaFolder(areaId) {
  const match = String(areaId || "").match(/^area(\d+)$/);

  if (!match) {
    return "";
  }

  return `area_${String(Number(match[1])).padStart(2, "0")}`;
}

async function readJson(filePath, label) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    fail(`Unable to read ${label}: ${error.message}`);
  }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listDirectories(targetPath) {
  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function ensureDirectory(targetPath, dryRun) {
  if (dryRun) {
    return;
  }

  await fs.mkdir(targetPath, { recursive: true });
}

async function copyFile(sourcePath, targetPath, dryRun) {
  if (dryRun) {
    return;
  }

  await fs.copyFile(sourcePath, targetPath);
}

async function writeJson(filePath, value, dryRun) {
  if (dryRun) {
    return;
  }

  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function resolveSectionProfilesCsv(sectionProfilesRoot, processingAreaFolder, preferredDate) {
  if (!(await pathExists(sectionProfilesRoot))) {
    return { path: "", resolution: "missing root" };
  }

  const datedFolders = (await listDirectories(sectionProfilesRoot))
    .filter(isValidDateString)
    .sort();

  if (!datedFolders.length) {
    return { path: "", resolution: "no dated folders" };
  }

  if (preferredDate && isValidDateString(preferredDate)) {
    const preferredPath = path.join(sectionProfilesRoot, preferredDate, processingAreaFolder, "section_profiles.csv");
    if (await pathExists(preferredPath)) {
      return { path: preferredPath, resolution: `preferred date ${preferredDate}` };
    }
  }

  for (const folder of [...datedFolders].reverse()) {
    const candidate = path.join(sectionProfilesRoot, folder, processingAreaFolder, "section_profiles.csv");
    if (await pathExists(candidate)) {
      return { path: candidate, resolution: `latest available date ${folder}` };
    }
  }

  return { path: "", resolution: "no CSV found" };
}

async function resolveImageSource(manifestPaths, fieldName, fallbackPath) {
  const candidate = manifestPaths?.[fieldName];
  if (candidate && await pathExists(candidate)) {
    return candidate;
  }

  if (fallbackPath && await pathExists(fallbackPath)) {
    return fallbackPath;
  }

  return "";
}

async function buildAreaImportPlan(projectConfig, projectId, surveyId, scanId, areaFolderName) {
  const sourceAreaDir = path.join(projectConfig.mapExportsRoot, scanId, areaFolderName);
  const sourceManifestPath = path.join(sourceAreaDir, "monitoring_manifest.json");
  const hasSourceManifest = await pathExists(sourceManifestPath);
  const sourceManifest = hasSourceManifest
    ? await readJson(sourceManifestPath, `${areaFolderName} monitoring manifest`)
    : null;
  const areaId = normaliseAreaId(sourceManifest?.area_id || areaFolderName);

  if (!areaId) {
    return { skipped: true, reason: `Could not derive a monitoring-platform area id from ${areaFolderName}` };
  }

  const processingAreaFolder = toProcessingAreaFolder(areaId);
  const manifestPaths = sourceManifest?.paths || {};

  const orthoSource = await resolveImageSource(manifestPaths, "ortho_png_path", path.join(sourceAreaDir, "ortho.png"));
  const dsmSource = await resolveImageSource(manifestPaths, "dsm_png_path", path.join(sourceAreaDir, "dsm.png"));
  const contoursSource = await resolveImageSource(manifestPaths, "contours_png_path", path.join(sourceAreaDir, "contours.png"));

  const preferredCsv = manifestPaths.section_profiles_csv_path && await pathExists(manifestPaths.section_profiles_csv_path)
    ? { path: manifestPaths.section_profiles_csv_path, resolution: `manifest date ${sourceManifest?.survey_date || "unknown"}` }
    : await resolveSectionProfilesCsv(projectConfig.sectionProfilesRoot, processingAreaFolder, sourceManifest?.survey_date || surveyId);

  const sharedSectionLinesPath = path.join(sharedDataRoot, projectId, areaId, "section_lines.png");
  const hasSharedSectionLines = await pathExists(sharedSectionLinesPath);
  const targetAreaDir = path.join(surveyDataRoot, projectId, surveyId, areaId);

  return {
    skipped: false,
    areaId,
    sourceAreaDir,
    sourceManifestPath,
    targetAreaDir,
    hasSharedSectionLines,
    sourceManifest,
    hasSourceManifest,
    files: [
      { label: "ortho", source: orthoSource, targetName: "ortho.png", required: true },
      { label: "dsm", source: dsmSource, targetName: "dsm.png", required: true },
      { label: "contours", source: contoursSource, targetName: "contours.png", required: true },
      { label: "section profiles", source: preferredCsv.path, targetName: "section_profiles.csv", required: false, resolution: preferredCsv.resolution }
    ]
  };
}

function manifestPayload(projectId, surveyId, areaId, importedFiles, hasSharedSectionLines) {
  const expectedFiles = [
    "ortho.png",
    "dsm.png",
    "contours.png",
    "section_profiles.csv"
  ];
  const presentFiles = expectedFiles.filter((fileName) => (
    importedFiles.some((item) => item.targetName === fileName)
  ));
  const missingFiles = expectedFiles.filter((fileName) => !presentFiles.includes(fileName));

  const sharedPresentFiles = hasSharedSectionLines ? ["section_lines.png"] : [];
  const sharedMissingFiles = hasSharedSectionLines ? [] : ["section_lines.png"];

  return {
    projectId,
    surveyId,
    areaId,
    expectedFiles,
    presentFiles,
    missingFiles,
    sharedPresentFiles,
    sharedMissingFiles,
    comparisonFiles: [],
    status: presentFiles.length === 0
      ? "pending-upload"
      : missingFiles.length
        ? "partial"
        : "complete",
    lastUpdated: new Date().toISOString()
  };
}

async function importArea(plan, projectId, surveyId, dryRun) {
  await ensureDirectory(plan.targetAreaDir, dryRun);

  const importedFiles = [];
  const warnings = plan.hasSourceManifest ? [] : ["No monitoring_manifest.json found, so this area used folder-based fallback import."];

  for (const file of plan.files) {
    if (!file.source) {
      if (file.required) {
        warnings.push(`Missing required ${file.label} source`);
      } else {
        warnings.push(`No ${file.label} source found (${file.resolution || "not resolved"})`);
      }
      continue;
    }

    const targetPath = path.join(plan.targetAreaDir, file.targetName);
    await copyFile(file.source, targetPath, dryRun);
    importedFiles.push(file);
  }

  const payload = manifestPayload(projectId, surveyId, plan.areaId, importedFiles, plan.hasSharedSectionLines);
  payload.comparisonFiles = importedFiles
    .map((item) => item.targetName)
    .filter((fileName) => /_(height_change_analysis|gain_loss_classification)\.png$/i.test(fileName));
  await writeJson(path.join(plan.targetAreaDir, "manifest.json"), payload, dryRun);

  return {
    areaId: plan.areaId,
    importedFiles,
    warnings,
    hasSharedSectionLines: plan.hasSharedSectionLines,
    manifestStatus: payload.status
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const projectId = typeof args["project-id"] === "string" ? args["project-id"].trim() : "";
  const surveyId = typeof args["survey-id"] === "string" ? args["survey-id"].trim() : "";
  const scanId = typeof args["scan-id"] === "string" ? args["scan-id"].trim() : "";
  const configPath = typeof args.config === "string" ? path.resolve(rootDir, args.config) : defaultConfigPath;
  const dryRun = Boolean(args["dry-run"]);
  const requestedAreas = parseList(args.areas).map(normaliseAreaId).filter(Boolean);

  if (!projectId) {
    fail("Please provide --project-id, for example --project-id padstow-estuary");
  }

  if (!surveyId) {
    fail("Please provide --survey-id, for example --survey-id 2026-07-21");
  }

  if (!scanId) {
    fail("Please provide --scan-id, for example --scan-id scan_4");
  }

  const config = await readJson(configPath, "processing hub sources");
  const projectConfig = config?.projects?.[projectId];

  if (!projectConfig) {
    fail(`No processing hub source config found for ${projectId}`);
  }

  const scanRoot = path.join(projectConfig.mapExportsRoot, scanId);
  if (!(await pathExists(scanRoot))) {
    fail(`Scan root not found: ${scanRoot}`);
  }

  const scanAreaFolders = (await listDirectories(scanRoot))
    .filter((name) => /^area[_-]?\d+$/i.test(name))
    .sort();

  const areaFoldersToImport = requestedAreas.length
    ? scanAreaFolders.filter((folderName) => requestedAreas.includes(normaliseAreaId(folderName)))
    : scanAreaFolders;

  if (!areaFoldersToImport.length) {
    fail(`No matching area folders were found under ${scanRoot}`);
  }

  const results = [];

  for (const areaFolderName of areaFoldersToImport) {
    const plan = await buildAreaImportPlan(projectConfig, projectId, surveyId, scanId, areaFolderName);

    if (plan.skipped) {
      results.push({ areaId: areaFolderName, skipped: true, reason: plan.reason });
      continue;
    }

    const result = await importArea(plan, projectId, surveyId, dryRun);
    results.push({
      areaId: result.areaId,
      skipped: false,
      manifestStatus: result.manifestStatus,
      importedFiles: result.importedFiles.map((item) => ({
        targetName: item.targetName,
        source: item.source,
        resolution: item.resolution || ""
      })),
      warnings: result.warnings,
      hasSharedSectionLines: result.hasSharedSectionLines
    });
  }

  console.log(`${dryRun ? "Dry run" : "Import"} complete for ${projectId} ${surveyId} from ${scanId}.`);

  for (const result of results) {
    if (result.skipped) {
      console.log(`- ${result.areaId}: skipped (${result.reason})`);
      continue;
    }

    console.log(`- ${result.areaId}: ${result.manifestStatus}`);
    for (const file of result.importedFiles) {
      const suffix = file.resolution ? ` [${file.resolution}]` : "";
      console.log(`  copied ${file.targetName} <- ${file.source}${suffix}`);
    }
    if (result.hasSharedSectionLines) {
      console.log("  using shared section_lines.png");
    }
    for (const warning of result.warnings) {
      console.log(`  warning: ${warning}`);
    }
  }
}

await main();
