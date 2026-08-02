import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { areaSettings, assetSettings } from "./src/data/areas.js";
import { environmentalContext } from "./src/data/environmentalContext.js";
import { surveySettings } from "./src/data/surveys.js";
import { volumeChangeSettings } from "./src/data/volumeChange.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 3080);
const WORLDTIDES_API_KEY = process.env.WORLDTIDES_API_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const TIDE_LATITUDE = environmentalContext.tide.latitude;
const TIDE_LONGITUDE = environmentalContext.tide.longitude;
const TIDE_DATUM = environmentalContext.tide.datum;
const ACCESS_USERS_PATH = resolveAccessUsersPath(process.env.ACCESS_USERS_PATH || "./data/access-users.json");
const LOGIN_PAGE_PATH = path.join(__dirname, "login.html");
const SESSION_COOKIE_NAME = "fsm_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;
const sessions = new Map();
const LOCAL_AUTH_BYPASS = process.env.LOCAL_AUTH_BYPASS === "1";
const LOCAL_BYPASS_SESSION = {
  id: "local-bypass-session",
  userId: "local-bypass-user",
  username: "local",
  label: "Local testing access",
  expiresAt: Number.MAX_SAFE_INTEGER,
  accessExpiresAt: null,
  isMaster: true,
  isAdmin: true
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".csv": "text/csv; charset=utf-8"
};

ensureAccessUsersStore();

http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const session = getSessionFromRequest(request);

  if (request.method === "GET" && url.pathname === "/login") {
    if (session) {
      response.writeHead(302, { Location: "/" });
      response.end();
      return;
    }
    serveLoginPage(response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/site-auth/login") {
    await handleSiteAuthLoginRequest(request, response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/site-auth/logout") {
    await handleSiteAuthLogoutRequest(request, response, session);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/site-auth/session") {
    handleSiteAuthSessionRequest(response, session);
    return;
  }

  if (!session) {
    if (url.pathname.startsWith("/api/")) {
      sendJson(response, 401, { error: "Sign-in required." });
      return;
    }
    response.writeHead(302, { Location: "/login" });
    response.end();
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/upload") {
    await handleUploadRequest(request, response, session);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/surveys/create") {
    await handleSurveyCreateRequest(request, response, session);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/admin-auth") {
    await handleAdminAuthRequest(request, response, session);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/survey-area-metadata") {
    await handleSurveyAreaMetadataRequest(request, response, session);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/survey-area-metadata/reset") {
    await handleSurveyAreaMetadataResetRequest(request, response, session);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/volume-change") {
    await handleVolumeChangeRequest(request, response, session);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/access-users") {
    await handleAccessUsersListRequest(response, session);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/access-users") {
    await handleAccessUsersCreateRequest(request, response, session);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/access-users/update") {
    await handleAccessUsersUpdateRequest(request, response, session);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/access-users/delete") {
    await handleAccessUsersDeleteRequest(request, response, session);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/weather") {
    await handleWeatherRequest(url, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/tides") {
    await handleTideRequest(url, response);
    return;
  }

  const requestPath = resolveAppRequestPath(url.pathname);
  const filePath = path.normalize(path.join(__dirname, requestPath));

  if (!filePath.startsWith(__dirname) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0"
  });
  fs.createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`FutureScaping monitoring system running at http://localhost:${port}`);
});

async function handleUploadRequest(request, response, session) {
  try {
    if (!requireAdminSession(response, session)) {
      return;
    }
    const body = await readJsonBody(request);
    const { projectId, surveyId, areaId, fileName, contentBase64 } = body;

    if (!projectId || !surveyId || !areaId || !fileName || !contentBase64) {
      sendJson(response, 400, { error: "projectId, surveyId, areaId, fileName, and contentBase64 are required." });
      return;
    }

    const allowedFiles = new Set(expectedSurveyFileNames());
    if (!allowedFiles.has(fileName)) {
      sendJson(response, 400, { error: `Unsupported file name: ${fileName}` });
      return;
    }

    const areaDir = path.join(__dirname, "survey-data", projectId, surveyId, areaId);
    const safeAreaDir = path.normalize(areaDir);
    if (!safeAreaDir.startsWith(path.join(__dirname, "survey-data"))) {
      sendJson(response, 400, { error: "Invalid target path." });
      return;
    }

    fs.mkdirSync(safeAreaDir, { recursive: true });
    const filePath = path.join(safeAreaDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(contentBase64, "base64"));

    const manifestPath = path.join(safeAreaDir, "manifest.json");
    writeManifest(manifestPath, projectId, surveyId, areaId, safeAreaDir);

    sendJson(response, 200, {
      message: `Uploaded ${fileName} to ${projectId}/${surveyId}/${areaId}.`
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

async function handleSurveyCreateRequest(request, response, session) {
  try {
    if (!requireAdminSession(response, session)) {
      return;
    }
    const body = await readJsonBody(request);
    const { projectId, name, dateFrom, dateTo, comparisonBaseline } = body;

    if (!projectId || !name || !dateFrom || !dateTo) {
      sendJson(response, 400, { error: "projectId, name, dateFrom, and dateTo are required." });
      return;
    }

    if (dateTo < dateFrom) {
      sendJson(response, 400, { error: "dateTo must be the same as or later than dateFrom." });
      return;
    }

    let project;
    let scansPayload;
    let areasPayload;
    try {
      project = loadProjectDefinition(projectId);
      scansPayload = loadProjectScans(projectId);
      areasPayload = loadProjectAreas(projectId);
    } catch (error) {
      sendJson(response, 404, { error: error.message });
      return;
    }
    const surveys = Array.isArray(scansPayload?.surveys) ? scansPayload.surveys : [];

    const id = dateFrom;
    if (surveys.some((survey) => survey.id === id)) {
      sendJson(response, 409, { error: `A survey round already exists for ${dateFrom}.` });
      return;
    }

    const surveyNumber = surveys.length + 1;
    const survey = {
      id,
      label: `${name} - ${formatDateRangeLabel(dateFrom, dateTo)}`,
      shortDate: formatShortDateRange(dateFrom, dateTo),
      dateFrom,
      dateTo,
      status: surveySettings.initialStatus,
      readiness: surveySettings.initialReadiness,
      assetFolder: formatAssetFolder(projectId, id),
      dataFolder: surveySettings.dataFolderFromSurveyId ? id : dateFrom,
      comparisonBaseline: comparisonBaseline || surveys[surveys.length - 1]?.id || null,
      notes: `${name} created from the admin console as survey round ${surveyNumber}.`
    };

    surveys.push(survey);
    surveys.sort((a, b) => String(a.dateFrom).localeCompare(String(b.dateFrom)));
    saveProjectScans(projectId, surveys);

    const surveyBase = path.join(__dirname, "survey-data", projectId, id);
    const projectAreas = Array.isArray(areasPayload?.areas) && areasPayload.areas.length
      ? areasPayload.areas
      : Array.from({ length: areaSettings.count }, (_, index) => ({ id: `${areaSettings.idPrefix}${index + 1}` }));
    for (const area of projectAreas) {
      const areaId = area.id;
      const areaDir = path.join(surveyBase, areaId);
      fs.mkdirSync(areaDir, { recursive: true });
      writeManifest(path.join(areaDir, "manifest.json"), projectId, id, areaId, areaDir);
    }

    sendJson(response, 200, { survey });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

async function handleSurveyAreaMetadataRequest(request, response, session) {
  try {
    if (!requireAdminSession(response, session)) {
      return;
    }
    const body = await readJsonBody(request);
    const { projectId, surveyId, areaId, fields } = body;

    if (!projectId || !surveyId || !areaId || !fields || typeof fields !== "object") {
      sendJson(response, 400, { error: "projectId, surveyId, areaId, and fields are required." });
      return;
    }

    let project;
    let scansPayload;
    let overridesPayload;
    try {
      project = loadProjectDefinition(projectId);
      scansPayload = loadProjectScans(projectId);
      overridesPayload = loadProjectSurveyAreaOverrides(projectId);
    } catch (error) {
      sendJson(response, 404, { error: error.message });
      return;
    }

    const surveys = Array.isArray(scansPayload?.surveys) ? scansPayload.surveys : [];
    const survey = surveys.find((item) => item.id === surveyId);
    if (!survey) {
      sendJson(response, 404, { error: `Survey not found: ${surveyId}` });
      return;
    }

    const allowed = new Set([
      "statusLabel",
      "statusTone",
      "purpose",
      "start",
      "finish",
      "size",
      "lowTide",
      "lowTideHeight",
      "launchOffset",
      "estimatedDuration",
      "actualDuration",
      "tideWindow",
      "tideScore",
      "tags",
      "missionRole",
      "operationalNote",
      "weatherNotes",
      "surveyNotes"
    ]);

    const override = {};
    for (const [key, value] of Object.entries(fields)) {
      if (!allowed.has(key)) {
        continue;
      }
      if (key === "tags") {
        override.tags = Array.isArray(value)
          ? value.map((item) => String(item).trim()).filter(Boolean)
          : [];
        continue;
      }
      if (key === "tideScore") {
        const number = Number.parseInt(String(value), 10);
        override.tideScore = Number.isFinite(number) ? number : 0;
        continue;
      }
      override[key] = String(value ?? "").trim();
    }

    const surveyAreaOverrides = overridesPayload?.surveyAreaOverrides || {};
    surveyAreaOverrides[surveyId] = surveyAreaOverrides[surveyId] || {};
    surveyAreaOverrides[surveyId][areaId] = override;
    saveProjectSurveyAreaOverrides(projectId, surveyAreaOverrides);

    sendJson(response, 200, { override });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

async function handleSurveyAreaMetadataResetRequest(request, response, session) {
  try {
    if (!requireAdminSession(response, session)) {
      return;
    }
    const body = await readJsonBody(request);
    const { projectId, surveyId, areaId } = body;

    if (!projectId || !surveyId || !areaId) {
      sendJson(response, 400, { error: "projectId, surveyId, and areaId are required." });
      return;
    }

    let overridesPayload;
    try {
      loadProjectDefinition(projectId);
      overridesPayload = loadProjectSurveyAreaOverrides(projectId);
    } catch (error) {
      sendJson(response, 404, { error: error.message });
      return;
    }

    const surveyAreaOverrides = overridesPayload?.surveyAreaOverrides || {};
    if (surveyAreaOverrides?.[surveyId]) {
      delete surveyAreaOverrides[surveyId][areaId];
      if (!Object.keys(surveyAreaOverrides[surveyId]).length) {
        delete surveyAreaOverrides[surveyId];
      }
    }

    saveProjectSurveyAreaOverrides(projectId, surveyAreaOverrides);
    sendJson(response, 200, { ok: true });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

async function handleVolumeChangeRequest(request, response, session) {
  try {
    if (!requireAdminSession(response, session)) {
      return;
    }
    const body = await readJsonBody(request);
    const { projectId, surveyId, areaId, method, cellSize, notes, polygons } = body;

    if (!projectId || !surveyId || !areaId || !Array.isArray(polygons)) {
      sendJson(response, 400, { error: "projectId, surveyId, areaId, and polygons are required." });
      return;
    }

    let project;
    let scansPayload;
    let volumeChangePayload;
    try {
      project = loadProjectDefinition(projectId);
      scansPayload = loadProjectScans(projectId);
      volumeChangePayload = loadProjectVolumeChange(projectId);
    } catch (error) {
      sendJson(response, 404, { error: error.message });
      return;
    }

    const surveys = Array.isArray(scansPayload?.surveys) ? scansPayload.surveys : [];
    const survey = surveys.find((item) => item.id === surveyId);
    if (!survey) {
      sendJson(response, 404, { error: `Survey not found: ${surveyId}` });
      return;
    }

    const cleanedPolygons = polygons.map((item, index) => ({
      id: item.id || `bar_${String(index + 1).padStart(2, "0")}`,
      label: String(item.label || `${volumeChangeSettings.rowLabelFallback} ${index + 1}`).trim(),
      gainM3: Number(item.gainM3 || 0),
      lossM3: Number(item.lossM3 || 0),
      netM3: Number(item.netM3 || 0),
      confidence: String(item.confidence || volumeChangeSettings.defaultConfidence).trim(),
      summary: String(item.summary || volumeChangeSettings.defaultSummary).trim()
    }));

    const volumeChangeComparisons = volumeChangePayload?.volumeChangeComparisons || {};
    volumeChangeComparisons[surveyId] = volumeChangeComparisons[surveyId] || {
      baselineSurveyId: survey.comparisonBaseline || null,
      areas: {}
    };
    volumeChangeComparisons[surveyId].baselineSurveyId = survey.comparisonBaseline || volumeChangeComparisons[surveyId].baselineSurveyId || null;
    volumeChangeComparisons[surveyId].method = String(method || "").trim();
    volumeChangeComparisons[surveyId].cellSize = String(cellSize || "").trim();
    volumeChangeComparisons[surveyId].areas = volumeChangeComparisons[surveyId].areas || {};
    volumeChangeComparisons[surveyId].areas[areaId] = {
      method: String(method || "").trim(),
      cellSize: String(cellSize || "").trim(),
      notes: String(notes || "").trim(),
      polygons: cleanedPolygons,
      updatedAt: new Date().toISOString()
    };

    saveProjectVolumeChange(projectId, volumeChangeComparisons);

    sendJson(response, 200, {
      record: {
        baselineSurveyId: volumeChangeComparisons[surveyId].baselineSurveyId,
        method: volumeChangeComparisons[surveyId].method,
        cellSize: volumeChangeComparisons[surveyId].cellSize,
        area: volumeChangeComparisons[surveyId].areas[areaId]
      }
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

async function handleAdminAuthRequest(request, response, session) {
  try {
    if (!session) {
      sendJson(response, 401, { error: "Sign-in required." });
      return;
    }
    if (isLocalAuthBypassRequest(request)) {
      session.isAdmin = true;
      sendJson(response, 200, {
        ok: true,
        users: sanitiseAccessUsers(loadAccessUsers())
      });
      return;
    }
    if (!ADMIN_PASSWORD) {
      sendJson(response, 500, { error: "Server configuration error: ADMIN_PASSWORD is not set." });
      return;
    }

    const body = await readJsonBody(request);
    const { password } = body;
    if (!password) {
      sendJson(response, 400, { error: "Password is required." });
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      sendJson(response, 401, { error: "Incorrect password." });
      return;
    }

    session.isAdmin = true;
    sendJson(response, 200, {
      ok: true,
      users: sanitiseAccessUsers(loadAccessUsers())
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

async function handleSiteAuthLoginRequest(request, response) {
  if (isLocalAuthBypassRequest(request)) {
    sendJson(response, 200, {
      ok: true,
      user: {
        username: LOCAL_BYPASS_SESSION.username,
        label: LOCAL_BYPASS_SESSION.label,
        expiresAt: null
      }
    });
    return;
  }
  try {
    const body = await readJsonBody(request);
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      sendJson(response, 400, { error: "Username and password are required." });
      return;
    }

    const adminLoginMatch = ADMIN_PASSWORD && username.toLowerCase() === ADMIN_USERNAME.toLowerCase() && password === ADMIN_PASSWORD;
    let authUser = null;

    if (adminLoginMatch) {
      authUser = {
        id: "admin-master",
        username: ADMIN_USERNAME,
        label: "Admin master access",
        expiresAt: null,
        isMaster: true
      };
    } else {
      const users = loadAccessUsers();
      const matched = users.find((item) => item.username.toLowerCase() === username.toLowerCase());
      if (!matched || !matched.active) {
        sendJson(response, 401, { error: "Incorrect username or password." });
        return;
      }
      if (matched.expiresAt && Date.parse(matched.expiresAt) <= Date.now()) {
        sendJson(response, 401, { error: "This login has expired." });
        return;
      }
      if (!verifyPassword(password, matched)) {
        sendJson(response, 401, { error: "Incorrect username or password." });
        return;
      }
      authUser = {
        id: matched.id,
        username: matched.username,
        label: matched.label || matched.username,
        expiresAt: matched.expiresAt || null,
        isMaster: false
      };
    }

    const sessionId = crypto.randomUUID();
    const sessionExpiresAt = authUser.expiresAt
      ? Math.min(Date.parse(authUser.expiresAt), Date.now() + SESSION_DURATION_MS)
      : Date.now() + SESSION_DURATION_MS;
    sessions.set(sessionId, {
      id: sessionId,
      userId: authUser.id,
      username: authUser.username,
      label: authUser.label,
      expiresAt: sessionExpiresAt,
      accessExpiresAt: authUser.expiresAt,
      isMaster: authUser.isMaster,
      isAdmin: authUser.isMaster
    });

    sendJson(
      response,
      200,
      {
        ok: true,
        user: {
          username: authUser.username,
          label: authUser.label,
          expiresAt: authUser.expiresAt
        }
      },
      {
        "Set-Cookie": buildSessionCookie(sessionId, sessionExpiresAt, request)
      }
    );
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

async function handleSiteAuthLogoutRequest(request, response, session) {
  if (isLocalAuthBypassRequest(request)) {
    sendJson(response, 200, { ok: true });
    return;
  }
  if (session) {
    sessions.delete(session.id);
  }
  sendJson(
    response,
    200,
    { ok: true },
    {
      "Set-Cookie": clearSessionCookie(request)
    }
  );
}

function handleSiteAuthSessionRequest(response, session) {
  if (!session) {
    sendJson(response, 200, { authenticated: false });
    return;
  }
  sendJson(response, 200, {
    authenticated: true,
    user: {
      username: session.username,
      label: session.label,
      expiresAt: session.accessExpiresAt || null,
      isAdmin: Boolean(session.isAdmin)
    }
  });
}

async function handleAccessUsersListRequest(response, session) {
  if (!requireAdminSession(response, session)) {
    return;
  }
  sendJson(response, 200, {
    users: sanitiseAccessUsers(loadAccessUsers())
  });
}

async function handleAccessUsersCreateRequest(request, response, session) {
  try {
    if (!requireAdminSession(response, session)) {
      return;
    }
    const body = await readJsonBody(request);
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const label = String(body.label || "").trim() || username;
    const notes = String(body.notes || "").trim();
    const expiresAt = normaliseExpiry(body.expiresAt);
    const active = body.active !== false;

    if (!username || !password) {
      sendJson(response, 400, { error: "Username and password are required." });
      return;
    }

    const users = loadAccessUsers();
    if (users.some((item) => item.username.toLowerCase() === username.toLowerCase())) {
      sendJson(response, 409, { error: "That username already exists." });
      return;
    }

    users.push({
      id: crypto.randomUUID(),
      username,
      label,
      notes,
      expiresAt,
      active,
      ...hashPassword(password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    saveAccessUsers(users);
    sendJson(response, 200, { users: sanitiseAccessUsers(users) });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

async function handleAccessUsersUpdateRequest(request, response, session) {
  try {
    if (!requireAdminSession(response, session)) {
      return;
    }
    const body = await readJsonBody(request);
    const id = String(body.id || "").trim();
    if (!id) {
      sendJson(response, 400, { error: "User id is required." });
      return;
    }

    const users = loadAccessUsers();
    const user = users.find((item) => item.id === id);
    if (!user) {
      sendJson(response, 404, { error: "User not found." });
      return;
    }

    if (typeof body.label !== "undefined") {
      user.label = String(body.label || "").trim() || user.username;
    }
    if (typeof body.notes !== "undefined") {
      user.notes = String(body.notes || "").trim();
    }
    if (typeof body.active !== "undefined") {
      user.active = body.active !== false;
    }
    if (typeof body.expiresAt !== "undefined") {
      user.expiresAt = normaliseExpiry(body.expiresAt);
    }
    if (body.password) {
      Object.assign(user, hashPassword(String(body.password)));
    }
    user.updatedAt = new Date().toISOString();

    saveAccessUsers(users);
    sendJson(response, 200, { users: sanitiseAccessUsers(users) });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

async function handleAccessUsersDeleteRequest(request, response, session) {
  try {
    if (!requireAdminSession(response, session)) {
      return;
    }
    const body = await readJsonBody(request);
    const id = String(body.id || "").trim();
    if (!id) {
      sendJson(response, 400, { error: "User id is required." });
      return;
    }
    const users = loadAccessUsers().filter((item) => item.id !== id);
    saveAccessUsers(users);
    sendJson(response, 200, { users: sanitiseAccessUsers(users) });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

function serveLoginPage(response) {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  fs.createReadStream(LOGIN_PAGE_PATH).pipe(response);
}

function resolveAppRequestPath(pathname) {
  if (pathname === "/") {
    return "/index.html";
  }
  if (pathname === "/projects") {
    return "/projects.html";
  }
  if (/^\/project\/[^/]+\/?$/.test(pathname)) {
    return "/index.html";
  }
  return pathname;
}

function resolveAccessUsersPath(rawPath) {
  if (path.isAbsolute(rawPath)) {
    return rawPath;
  }
  return path.resolve(__dirname, rawPath);
}

function ensureAccessUsersStore() {
  fs.mkdirSync(path.dirname(ACCESS_USERS_PATH), { recursive: true });
  if (!fs.existsSync(ACCESS_USERS_PATH)) {
    fs.writeFileSync(ACCESS_USERS_PATH, JSON.stringify({ users: [] }, null, 2));
  }
}

function loadAccessUsers() {
  ensureAccessUsersStore();
  const payload = JSON.parse(fs.readFileSync(ACCESS_USERS_PATH, "utf8"));
  return Array.isArray(payload?.users) ? payload.users : [];
}

function saveAccessUsers(users) {
  fs.writeFileSync(ACCESS_USERS_PATH, JSON.stringify({ users }, null, 2));
}

function projectDirectory(projectId) {
  return path.join(__dirname, "public", "projects", projectId);
}

function projectFilePath(projectId, fileName) {
  return path.join(projectDirectory(projectId), fileName);
}

function loadProjectFile(projectId, fileName, fallbackValue = null) {
  const filePath = projectFilePath(projectId, fileName);
  if (!fs.existsSync(filePath)) {
    return fallbackValue;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveProjectFile(projectId, fileName, payload) {
  const filePath = projectFilePath(projectId, fileName);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

function loadProjectDefinition(projectId) {
  const project = loadProjectFile(projectId, "project.json");
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }
  return project;
}

function loadProjectScans(projectId) {
  return loadProjectFile(projectId, "scans.json", { surveys: [] });
}

function saveProjectScans(projectId, surveys) {
  saveProjectFile(projectId, "scans.json", { surveys });
}

function loadProjectAreas(projectId) {
  return loadProjectFile(projectId, "areas.json", { areas: [] });
}

function loadProjectSurveyAreaOverrides(projectId) {
  return loadProjectFile(projectId, "survey-area-overrides.json", { surveyAreaOverrides: {} });
}

function saveProjectSurveyAreaOverrides(projectId, surveyAreaOverrides) {
  saveProjectFile(projectId, "survey-area-overrides.json", { surveyAreaOverrides });
}

function loadProjectVolumeChange(projectId) {
  return loadProjectFile(projectId, "volume-change.json", { volumeChangeComparisons: {} });
}

function saveProjectVolumeChange(projectId, volumeChangeComparisons) {
  saveProjectFile(projectId, "volume-change.json", { volumeChangeComparisons });
}

function sanitiseAccessUsers(users) {
  return users
    .slice()
    .sort((a, b) => String(a.username).localeCompare(String(b.username)))
    .map((user) => ({
      id: user.id,
      username: user.username,
      label: user.label || user.username,
      notes: user.notes || "",
      active: user.active !== false,
      expiresAt: user.expiresAt || null,
      createdAt: user.createdAt || null,
      updatedAt: user.updatedAt || null,
      expired: Boolean(user.expiresAt && Date.parse(user.expiresAt) <= Date.now())
    }));
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { passwordSalt: salt, passwordHash: hash };
}

function verifyPassword(password, user) {
  if (!user?.passwordSalt || !user?.passwordHash) {
    return false;
  }
  const expected = Buffer.from(user.passwordHash, "hex");
  const actual = crypto.scryptSync(password, user.passwordSalt, expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function normaliseExpiry(value) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }
  const parsed = Date.parse(text);
  if (!Number.isFinite(parsed)) {
    throw new Error("Expiry must be a valid date and time.");
  }
  return new Date(parsed).toISOString();
}

function getSessionFromRequest(request) {
  if (isLocalAuthBypassRequest(request)) {
    return { ...LOCAL_BYPASS_SESSION };
  }
  cleanupExpiredSessions();
  const cookies = parseCookies(request.headers.cookie || "");
  const sessionId = cookies[SESSION_COOKIE_NAME];
  if (!sessionId) {
    return null;
  }
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

function isLocalAuthBypassRequest(request) {
  if (LOCAL_AUTH_BYPASS) {
    return true;
  }
  const host = String(request?.headers?.host || "").toLowerCase();
  return host.startsWith("localhost:") || host === "localhost" || host.startsWith("127.0.0.1:") || host === "127.0.0.1";
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(id);
    }
  }
}

function parseCookies(rawCookie) {
  return rawCookie.split(";").reduce((acc, part) => {
    const [name, ...rest] = part.trim().split("=");
    if (!name) {
      return acc;
    }
    acc[name] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function buildSessionCookie(sessionId, expiresAt, request) {
  const secure = isSecureRequest(request) ? "; Secure" : "";
  const maxAgeSeconds = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

function clearSessionCookie(request) {
  const secure = isSecureRequest(request) ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

function isSecureRequest(request) {
  return request.socket.encrypted || String(request.headers["x-forwarded-proto"] || "").toLowerCase() === "https";
}

function requireAdminSession(response, session) {
  if (!session) {
    sendJson(response, 401, { error: "Sign-in required." });
    return false;
  }
  if (!session.isAdmin) {
    sendJson(response, 403, { error: "Admin access required." });
    return false;
  }
  return true;
}

function writeManifest(manifestPath, projectId, surveyId, areaId, areaDir) {
  const expectedFiles = ["ortho.png", "dsm.png", "contours.png", "section_profiles.csv"];
  const presentFiles = expectedFiles.filter((fileName) => {
    const candidates = assetCandidatesForManifest(areaId, fileName);
    return candidates.some((candidate) => assetExistsForManifest(projectId, areaDir, areaId, fileName, candidate));
  });
  const sharedPresentFiles = assetCandidatesForManifest(areaId, "section_lines.png").some((candidate) => {
    const sharedAssetPath = path.join(__dirname, assetSettings.sharedRoot, projectId, areaId, candidate);
    return fs.existsSync(sharedAssetPath);
  }) ? ["section_lines.png"] : [];
  const status = presentFiles.length === 0
    ? "pending-upload"
    : presentFiles.length === expectedFiles.length
      ? "complete"
      : "partial";

  const payload = {
    projectId,
    surveyId,
    areaId,
    expectedFiles,
    presentFiles,
    missingFiles: expectedFiles.filter((fileName) => !presentFiles.includes(fileName)),
    sharedPresentFiles,
    sharedMissingFiles: sharedPresentFiles.length ? [] : ["section_lines.png"],
    comparisonFiles: listComparisonFiles(areaDir),
    status,
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync(manifestPath, JSON.stringify(payload, null, 2));
}

function expectedSurveyFileNames() {
  return assetSettings.expectedSurveyAssets.map((item) => item.fileName);
}

function listComparisonFiles(areaDir) {
  if (!fs.existsSync(areaDir)) {
    return [];
  }
  return fs.readdirSync(areaDir)
    .filter((name) => /_(height_change_analysis|gain_loss_classification)\.png$/i.test(name))
    .sort();
}

function assetCandidatesForManifest(areaId, fileName) {
  const configuredVariants = assetSettings.variants?.[fileName] || [];
  const areaSpecificVariants = assetSettings.areaSpecificVariants?.[areaId]?.[fileName] || [];
  return Array.from(new Set([
    fileName,
    ...configuredVariants.map((variant) => variant.replace("{areaId}", areaId)),
    ...areaSpecificVariants
  ]));
}

function assetExistsForManifest(projectId, areaDir, areaId, fileName, candidate) {
  const surveyAssetPath = path.join(areaDir, candidate);
  if (fs.existsSync(surveyAssetPath)) {
    return true;
  }
  if (fileName === "section_lines.png") {
    const sharedAssetPath = path.join(__dirname, assetSettings.sharedRoot, projectId, areaId, candidate);
    if (fs.existsSync(sharedAssetPath)) {
      return true;
    }
  }
  return false;
}

function formatAssetFolder(projectId, surveyId) {
  return surveySettings.assetFolderPattern
    .replace("{projectId}", projectId)
    .replace("{surveyId}", surveyId);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch (error) {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers
  });
  response.end(JSON.stringify(payload));
}

function formatDateRangeLabel(dateFrom, dateTo) {
  const start = new Date(`${dateFrom}T12:00:00`);
  const end = new Date(`${dateTo}T12:00:00`);
  const startDay = String(start.getDate());
  const endDay = String(end.getDate());
  if (dateFrom === dateTo) {
    return start.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const month = start.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  if (sameMonth) {
    return `${startDay} and ${endDay} ${month}`;
  }
  const startLabel = start.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const endLabel = end.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return `${startLabel} to ${endLabel}`;
}

function formatShortDateRange(dateFrom, dateTo) {
  const start = new Date(`${dateFrom}T12:00:00`);
  const end = new Date(`${dateTo}T12:00:00`);
  const startDay = String(start.getDate());
  const endDay = String(end.getDate());
  if (dateFrom === dateTo) {
    return start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const month = start.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  if (sameMonth) {
    return `${startDay}-${endDay} ${month}`;
  }
  const startLabel = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const endLabel = end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${startLabel} to ${endLabel}`;
}

async function handleWeatherRequest(url, response) {
  try {
    const source = url.searchParams.get("source");
    const latitude = url.searchParams.get("latitude");
    const longitude = url.searchParams.get("longitude");
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");

    if (!source || !latitude || !longitude || !startDate || !endDate) {
      sendJson(response, 400, { error: "source, latitude, longitude, start_date, and end_date are required." });
      return;
    }

    const baseUrl = source === "forecast"
      ? "https://api.open-meteo.com/v1/forecast"
      : "https://archive-api.open-meteo.com/v1/archive";

    const upstream = new URL(baseUrl);
    upstream.searchParams.set("latitude", latitude);
    upstream.searchParams.set("longitude", longitude);
    upstream.searchParams.set("start_date", startDate);
    upstream.searchParams.set("end_date", endDate);
    upstream.searchParams.set("hourly", "temperature_2m,precipitation,windspeed_10m,windgusts_10m,pressure_msl");
    upstream.searchParams.set("timezone", "Europe/London");

    const upstreamResponse = await fetch(upstream);
    const text = await upstreamResponse.text();
    response.writeHead(upstreamResponse.status, {
      "Content-Type": "application/json; charset=utf-8"
    });
    response.end(text);
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

async function handleTideRequest(url, response) {
  try {
    if (!WORLDTIDES_API_KEY) {
      sendJson(response, 500, { error: "Server configuration error: WORLDTIDES_API_KEY is not set." });
      return;
    }

    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");
    const latitude = url.searchParams.get("lat") || TIDE_LATITUDE;
    const longitude = url.searchParams.get("lon") || TIDE_LONGITUDE;
    const datum = url.searchParams.get("datum") || TIDE_DATUM;

    if (!startDate || !endDate) {
      sendJson(response, 400, { error: "start_date and end_date are required." });
      return;
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    const days = Math.max(1, Math.ceil((end - start) / 86400000) + 1);

    const upstream = new URL("https://www.worldtides.info/api/v3");
    upstream.searchParams.set("key", WORLDTIDES_API_KEY);
    upstream.searchParams.set("lat", latitude);
    upstream.searchParams.set("lon", longitude);
    upstream.searchParams.set("date", startDate);
    upstream.searchParams.set("days", String(days));
    upstream.searchParams.set("datum", datum);
    upstream.searchParams.set("localtime", "");
    upstream.searchParams.set("heights", "");
    upstream.searchParams.set("extremes", "");

    const upstreamResponse = await fetch(upstream);
    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      sendJson(response, upstreamResponse.status, { error: `WorldTides API error ${upstreamResponse.status}: ${errorText}` });
      return;
    }

    const data = await upstreamResponse.json();
    const items = (data.heights || []).map((item) => ({
      time: item.date || new Date(item.dt * 1000).toISOString(),
      value: item.height
    }));
    const extremes = (data.extremes || []).map((item) => ({
      time: item.date || new Date(item.dt * 1000).toISOString(),
      value: item.height,
      type: item.type
    }));
    sendJson(response, 200, {
      items,
      extremes,
      datum: data.datum || data.responseDatum || datum,
      timezone: data.timezone || null
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}
