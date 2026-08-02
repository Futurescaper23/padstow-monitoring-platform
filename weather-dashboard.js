const charts = {};

const els = {
  locationName: document.getElementById("locationName"),
  startDate: document.getElementById("startDate"),
  endDate: document.getElementById("endDate"),
  viewMode: document.getElementById("viewMode"),
  statusBox: document.getElementById("statusBox"),
  windowSummary: document.getElementById("windowSummary"),
  sourceSummary: document.getElementById("sourceSummary"),
  loadBtn: document.getElementById("loadBtn"),
  exportBtn: document.getElementById("exportBtn"),
  insights: document.getElementById("insights"),
  timeline: document.getElementById("timeline"),
  tideEvents: document.getElementById("tideEvents"),
  surveyPills: document.getElementById("surveyPills")
};

const state = {
  surveyDates: [],
  latitude: "",
  longitude: "",
  datum: "CD"
};

bootstrap();

function bootstrap() {
  applyQueryDefaults();
  els.loadBtn.addEventListener("click", loadData);
  els.exportBtn.addEventListener("click", exportJson);
  els.viewMode?.addEventListener("change", loadData);
  window.addEventListener("load", loadData);
}

function applyQueryDefaults() {
  const params = new URLSearchParams(window.location.search);
  const start = params.get("start") || "2026-03-22";
  const end = params.get("end") || "2026-04-24";
  const limitDays = Number(params.get("limitDays") || 92);
  const range = clampRange(start, end, limitDays);
  els.locationName.value = params.get("location") || "Project monitoring area";
  els.startDate.value = range.start;
  els.endDate.value = range.end;
  if (els.viewMode) {
    els.viewMode.value = params.get("mode") === "weekly" ? "weekly" : "daily";
  }
  state.latitude = params.get("lat") || state.latitude;
  state.longitude = params.get("lon") || state.longitude;
  state.datum = params.get("datum") || state.datum;
  state.surveyDates = (params.get("surveys") || "").split(",").map((item) => item.trim()).filter(Boolean);
  els.windowSummary.textContent = `${formatDate(range.start)} to ${formatDate(range.end)}`;
}

function todayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function clampRange(start, end, limitDays) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const diffDays = Math.round((endDate - startDate) / 86400000);
  if (!Number.isFinite(diffDays) || diffDays <= limitDays) {
    return { start, end };
  }
  const safeEnd = new Date(startDate.getTime() + (limitDays * 86400000));
  return { start, end: safeEnd.toISOString().slice(0, 10) };
}

function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatShortDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function earlierDate(left, right) {
  return left <= right ? left : right;
}

function laterDate(left, right) {
  return left >= right ? left : right;
}

function setStatus(message) {
  els.statusBox.value = message;
}

function surveyDates() {
  return state.surveyDates;
}

function getDayKey(isoString) {
  return isoString.slice(0, 10);
}

function mean(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : null;
}

function sum(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  return clean.length ? clean.reduce((total, value) => total + value, 0) : 0;
}

function max(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  return clean.length ? Math.max(...clean) : null;
}

function min(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  return clean.length ? Math.min(...clean) : null;
}

function fmt(value, digits = 1) {
  return Number.isFinite(value) ? Number(value).toFixed(digits) : "-";
}

function asDate(value) {
  return value instanceof Date ? value : new Date(value);
}

function formatAxisDate(value) {
  return asDate(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });
}

function closestReadingIndex(readings, targetTime) {
  const target = asDate(targetTime).getTime();
  let bestIndex = -1;
  let bestDiff = Infinity;
  readings.forEach((item, index) => {
    const diff = Math.abs(asDate(item.time).getTime() - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function destroyCharts() {
  Object.values(charts).forEach((chart) => chart?.destroy?.());
}

function groupDaily(hourly) {
  const bucket = {};
  hourly.time.forEach((time, index) => {
    const day = getDayKey(time);
    if (!bucket[day]) bucket[day] = { rain: 0, temp: [], wind: [], gust: [], pressure: [] };
    bucket[day].rain += hourly.precipitation[index] || 0;
    if (Number.isFinite(hourly.temperature_2m[index])) bucket[day].temp.push(hourly.temperature_2m[index]);
    if (Number.isFinite(hourly.windspeed_10m[index])) bucket[day].wind.push(hourly.windspeed_10m[index]);
    if (Number.isFinite(hourly.windgusts_10m[index])) bucket[day].gust.push(hourly.windgusts_10m[index]);
    if (Number.isFinite(hourly.pressure_msl[index])) bucket[day].pressure.push(hourly.pressure_msl[index]);
  });
  const labels = Object.keys(bucket).sort();
  return {
    labels,
    rain: labels.map((day) => bucket[day].rain),
    tempMean: labels.map((day) => mean(bucket[day].temp)),
    tempMin: labels.map((day) => min(bucket[day].temp)),
    tempMax: labels.map((day) => max(bucket[day].temp)),
    windMean: labels.map((day) => mean(bucket[day].wind)),
    gustMax: labels.map((day) => max(bucket[day].gust)),
    pressureMin: labels.map((day) => min(bucket[day].pressure))
  };
}

function groupSeries(daily, mode) {
  if (mode === "daily") return daily;
  const bucket = {};
  daily.labels.forEach((day, index) => {
    const date = new Date(`${day}T00:00:00`);
    const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const weekday = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - weekday);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
    const key = `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
    if (!bucket[key]) bucket[key] = { rain: 0, tempMean: [], tempMin: [], tempMax: [], windMean: [], gustMax: [], pressureMin: [] };
    bucket[key].rain += daily.rain[index] || 0;
    if (Number.isFinite(daily.tempMean[index])) bucket[key].tempMean.push(daily.tempMean[index]);
    if (Number.isFinite(daily.tempMin[index])) bucket[key].tempMin.push(daily.tempMin[index]);
    if (Number.isFinite(daily.tempMax[index])) bucket[key].tempMax.push(daily.tempMax[index]);
    if (Number.isFinite(daily.windMean[index])) bucket[key].windMean.push(daily.windMean[index]);
    if (Number.isFinite(daily.gustMax[index])) bucket[key].gustMax.push(daily.gustMax[index]);
    if (Number.isFinite(daily.pressureMin[index])) bucket[key].pressureMin.push(daily.pressureMin[index]);
  });
  const labels = Object.keys(bucket).sort();
  return {
    labels,
    rain: labels.map((key) => bucket[key].rain),
    tempMean: labels.map((key) => mean(bucket[key].tempMean)),
    tempMin: labels.map((key) => min(bucket[key].tempMin)),
    tempMax: labels.map((key) => max(bucket[key].tempMax)),
    windMean: labels.map((key) => mean(bucket[key].windMean)),
    gustMax: labels.map((key) => max(bucket[key].gustMax)),
    pressureMin: labels.map((key) => min(bucket[key].pressureMin))
  };
}

async function fetchWeatherSource(source, lat, lon, start, end) {
  const url = new URL("/api/weather", window.location.origin);
  url.searchParams.set("source", source);
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Weather API error ${response.status}`);
  const data = await response.json();
  if (!data.hourly?.time?.length) throw new Error("No weather data returned.");
  return data;
}

async function fetchWeather(lat, lon, start, end) {
  const today = todayIso();
  const safeEnd = earlierDate(end, today);
  const data = await fetchWeatherSource("archive", lat, lon, start, safeEnd);
  return {
    ...data,
    _meta: {
      usesForecast: false,
      forecastClamped: safeEnd !== end,
      safeEnd
    }
  };
}

async function fetchEaTides(start, end) {
  const today = todayIso();
  const safeEnd = earlierDate(end, today);
  const safeStart = start;
  if (safeStart > safeEnd) {
    return {
      items: [],
      meta: {
        clamped: safeEnd !== end,
        unavailable: true,
        safeStart,
        safeEnd
      }
    };
  }

  const url = new URL("/api/tides", window.location.origin);
  url.searchParams.set("start_date", safeStart);
  url.searchParams.set("end_date", safeEnd);
  if (state.latitude) url.searchParams.set("lat", state.latitude);
  if (state.longitude) url.searchParams.set("lon", state.longitude);
  if (state.datum) url.searchParams.set("datum", state.datum);
  const response = await fetch(url.toString());
  if (!response.ok) {
    let errorMessage = `EA tide API error ${response.status}`;
    try {
      const payload = await response.json();
      errorMessage = payload.error || errorMessage;
    } catch {
      // Keep the status-based message.
    }
    throw new Error(errorMessage);
  }
  const data = await response.json();
  return {
    items: (data.items || [])
      .map((item) => ({ time: item.time, value: Number(item.value) }))
      .filter((item) => Number.isFinite(item.value)),
    extremes: (data.extremes || [])
      .map((item) => ({ time: item.time, value: Number(item.value), type: item.type }))
      .filter((item) => Number.isFinite(item.value)),
    meta: {
      clamped: safeEnd !== end,
      safeStart,
      safeEnd,
      unavailable: !(data.items || []).length,
      datum: data.datum || state.datum || "CD"
    }
  };
}

function detectTideExtrema(readings) {
  const lows = [];
  const highs = [];
  for (let index = 1; index < readings.length - 1; index += 1) {
    const prev = readings[index - 1].value;
    const current = readings[index].value;
    const next = readings[index + 1].value;
    if (current <= prev && current < next) lows.push(readings[index]);
    if (current >= prev && current > next) highs.push(readings[index]);
  }
  return { lows, highs };
}

function classifySpringNeap(dailyTides) {
  const ranges = dailyTides.map((item) => item.range).filter(Number.isFinite).slice().sort((left, right) => left - right);
  const lowThreshold = ranges[Math.floor(ranges.length * 0.25)] ?? null;
  const highThreshold = ranges[Math.floor(ranges.length * 0.75)] ?? null;
  const states = {};
  dailyTides.forEach((item) => {
    let stateName = "mid";
    if (highThreshold !== null && item.range >= highThreshold) stateName = "spring";
    else if (lowThreshold !== null && item.range <= lowThreshold) stateName = "neap";
    states[item.day] = stateName;
  });
  return states;
}

function buildDailyTideSummary(readings) {
  const bucket = {};
  readings.forEach((item) => {
    const day = getDayKey(item.time);
    if (!bucket[day]) bucket[day] = [];
    bucket[day].push(item.value);
  });
  return Object.keys(bucket).sort().map((day) => ({ day, range: max(bucket[day]) - min(bucket[day]) }));
}

function nearestLowToSurvey(extremaLows, surveyDate) {
  const target = new Date(`${surveyDate}T12:00:00Z`).getTime();
  let best = null;
  let bestDiff = Infinity;
  extremaLows.forEach((item) => {
    const diff = Math.abs(new Date(item.time).getTime() - target);
    if (diff < bestDiff) {
      best = item;
      bestDiff = diff;
    }
  });
  return best;
}

function writeMetric(id, text) {
  document.getElementById(id).textContent = text;
}

function updateSummary(daily, dailyTides) {
  writeMetric("totalRain", `${fmt(sum(daily.rain), 0)} mm`);
  writeMetric("peakGust", `${fmt(max(daily.gustMax), 1)} km/h`);
  writeMetric("lowPressure", `${fmt(min(daily.pressureMin), 1)} hPa`);
  writeMetric("meanTemp", `${fmt(mean(daily.tempMean), 1)} C`);
  writeMetric("stormDays", `${daily.labels.filter((_, index) => (daily.gustMax[index] >= 45) || (daily.rain[index] >= 15) || (daily.pressureMin[index] <= 995)).length}`);
  writeMetric("maxTidalRange", dailyTides.length ? `${fmt(max(dailyTides.map((item) => item.range)), 2)} m` : "No tide data");
}

function updateInsights(daily, dailyTides, tideStates, extrema, dates) {
  els.surveyPills.innerHTML = dates.map((date) => `<span class="pill">${formatShortDate(date)} · ${tideStates[date] || "mid"}</span>`).join("");
  const totalRain = sum(daily.rain);
  const peakGust = max(daily.gustMax);
  const meanAir = mean(daily.tempMean);
  const lowestPressure = min(daily.pressureMin);
  const maxRange = max(dailyTides.map((item) => item.range));
  const overview = [
    `Across this window, the estuary saw ${fmt(totalRain, 0)} mm of rain, peak gusts up to ${fmt(peakGust, 1)} km/h, average air temperatures around ${fmt(meanAir, 1)} C, and a lowest pressure reading of ${fmt(lowestPressure, 1)} hPa.`,
    dailyTides.length
      ? `The biggest tidal range in the period was about ${fmt(maxRange, 2)} m, which helps show when the estuary bed was most exposed.`
      : "Tide intelligence is currently limited for this window, so the weather context is doing more of the explanatory work."
  ];
  const lines = dates.map((date) => {
    const index = daily.labels.indexOf(date);
    if (index === -1) {
      return `Survey on ${formatDate(date)} sits outside the weather window currently in view.`;
    }
    const rain7 = sum(daily.rain.slice(Math.max(0, index - 6), index + 1));
    const gust7 = max(daily.gustMax.slice(Math.max(0, index - 6), index + 1));
    const lowP7 = min(daily.pressureMin.slice(Math.max(0, index - 6), index + 1));
    const temp7 = mean(daily.tempMean.slice(Math.max(0, index - 6), index + 1));
    const tideDay = dailyTides.find((item) => item.day === date);
    const tideState = tideStates[date] || "mid";
    const nearestLow = nearestLowToSurvey(extrema.lows, date);
    const lowText = nearestLow
      ? new Date(nearestLow.time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" })
      : "not available in the current tide feed";
    const tideSentence = tideDay
      ? `The daily tide range on the survey date was about ${fmt(tideDay.range, 2)} m, which puts it in a ${tideState} tide state. The closest low tide to the survey was ${lowText}.`
      : `Tide range information is not available for that survey date in the current tide feed, but the closest low tide we could identify was ${lowText}.`;
    return `${formatDate(date)}: The week leading into this survey saw ${fmt(rain7, 1)} mm of rain, peak gusts up to ${fmt(gust7, 1)} km/h, average air temperatures around ${fmt(temp7, 1)} C, and a lowest pressure reading of ${fmt(lowP7, 1)} hPa. ${tideSentence}`;
  });
  els.insights.textContent = [...overview, ...lines].join("\n\n") || "No survey dates were found within the selected range.";
}

function updateTimeline(daily, dailyTides) {
  const events = [];
  const wetIndex = daily.rain.indexOf(max(daily.rain));
  if (wetIndex !== -1) events.push({ date: daily.labels[wetIndex], desc: `Wettest day with ${fmt(daily.rain[wetIndex], 1)} mm of rain.` });
  const gustIndex = daily.gustMax.indexOf(max(daily.gustMax));
  if (gustIndex !== -1) events.push({ date: daily.labels[gustIndex], desc: `Strongest gust day with winds up to ${fmt(daily.gustMax[gustIndex], 1)} km/h.` });
  const pressureIndex = daily.pressureMin.indexOf(min(daily.pressureMin));
  if (pressureIndex !== -1) events.push({ date: daily.labels[pressureIndex], desc: `Lowest pressure day at ${fmt(daily.pressureMin[pressureIndex], 1)} hPa.` });
  const tempIndex = daily.tempMean.indexOf(max(daily.tempMean));
  if (tempIndex !== -1) events.push({ date: daily.labels[tempIndex], desc: `Warmest average day at ${fmt(daily.tempMean[tempIndex], 1)} C.` });
  const coldIndex = daily.tempMean.indexOf(min(daily.tempMean));
  if (coldIndex !== -1) events.push({ date: daily.labels[coldIndex], desc: `Coolest average day at ${fmt(daily.tempMean[coldIndex], 1)} C.` });
  const calmIndex = daily.gustMax.indexOf(min(daily.gustMax));
  if (calmIndex !== -1) events.push({ date: daily.labels[calmIndex], desc: `Calmest gust day with winds only reaching ${fmt(daily.gustMax[calmIndex], 1)} km/h.` });
  const tideIndex = dailyTides.map((item) => item.range).indexOf(max(dailyTides.map((item) => item.range)));
  if (tideIndex !== -1) events.push({ date: dailyTides[tideIndex].day, desc: `Largest tide-range day at about ${fmt(dailyTides[tideIndex].range, 2)} m.` });
  const sortedEvents = events
    .filter((event, index, array) => array.findIndex((item) => item.date === event.date && item.desc === event.desc) === index)
    .sort((left, right) => left.date.localeCompare(right.date));
  els.timeline.innerHTML = sortedEvents.map((event) => `<div class="event"><div class="date">${formatShortDate(event.date)}</div><div class="desc">${event.desc}</div></div>`).join("");
}

function updateTideEvents(dailyTides, tideStates, tideMeta, tideError) {
  if (tideError) {
    els.tideEvents.textContent = `Tide data could not be loaded for this view. ${tideError.message}`;
    return;
  }
  if (!dailyTides.length) {
    els.tideEvents.textContent = tideMeta?.unavailable
      ? "This tide source only exposes a recent rolling window, so there is no tide history available for the currently selected dates."
      : "No tide events were returned for the selected range.";
    return;
  }
  const sortedTides = dailyTides.slice().sort((left, right) => right.range - left.range);
  const springs = dailyTides.filter((item) => tideStates[item.day] === "spring").slice(0, 4);
  const neaps = dailyTides.filter((item) => tideStates[item.day] === "neap").slice(0, 4);
  const midTides = dailyTides.filter((item) => tideStates[item.day] === "mid").slice(0, 4);
  const meanRange = mean(dailyTides.map((item) => item.range));
  els.tideEvents.textContent = [
    `Average daily tide range across this window: ${fmt(meanRange, 2)} m.`,
    springs.length ? `Spring-tide examples: ${springs.map((item) => `${formatShortDate(item.day)} (${fmt(item.range, 2)} m)`).join(", ")}` : "",
    neaps.length ? `Neap-tide examples: ${neaps.map((item) => `${formatShortDate(item.day)} (${fmt(item.range, 2)} m)`).join(", ")}` : "",
    midTides.length ? `Mid-range tide examples: ${midTides.map((item) => `${formatShortDate(item.day)} (${fmt(item.range, 2)} m)`).join(", ")}` : "",
    `Largest tide-range days: ${sortedTides.slice(0, 3).map((item) => `${formatShortDate(item.day)} (${fmt(item.range, 2)} m)`).join(", ")}`,
    `Smallest tide-range days: ${sortedTides.slice(-3).reverse().map((item) => `${formatShortDate(item.day)} (${fmt(item.range, 2)} m)`).join(", ")}`
  ].filter(Boolean).join("\n\n");
}

async function loadData() {
  try {
    setStatus("Loading weather and tide...");
    const lat = state.latitude;
    const lon = state.longitude;
    const start = els.startDate.value;
    const end = els.endDate.value;
    const mode = els.viewMode?.value || "daily";
    const dates = surveyDates();
    const weatherRaw = await fetchWeather(lat, lon, start, end);
    let tideReadings = [];
    let tideExtremes = [];
    let tideMeta = { unavailable: true };
    let tideError = null;
    try {
      const tideResult = await fetchEaTides(start, end);
      tideReadings = tideResult.items;
      tideExtremes = tideResult.extremes || [];
      tideMeta = tideResult.meta;
    } catch (error) {
      tideError = error;
    }
    const daily = groupDaily(weatherRaw.hourly);
    const series = groupSeries(daily, mode);
    const extrema = tideExtremes.length
      ? {
          lows: tideExtremes.filter((item) => item.type === "Low"),
          highs: tideExtremes.filter((item) => item.type === "High")
        }
      : tideReadings.length
        ? detectTideExtrema(tideReadings)
        : { lows: [], highs: [] };
    const dailyTides = tideReadings.length ? buildDailyTideSummary(tideReadings) : [];
    const tideStates = classifySpringNeap(dailyTides);

    updateSummary(daily, dailyTides);
    updateInsights(daily, dailyTides, tideStates, extrema, dates);
    updateTimeline(daily, dailyTides);
    updateTideEvents(dailyTides, tideStates, tideMeta, tideError);
    createCharts(series, tideReadings, extrema, dates);
    updateSourceSummary(weatherRaw._meta, tideMeta, tideError);
    window.__estuaryDashboardData = { request: { lat, lon, start, end, mode, surveyDates: dates }, weatherRaw, tideReadings, tideExtremes, daily, series, dailyTides, tideStates };
    setStatus(tideError ? "Weather loaded / tide unavailable" : "Loaded");
    announceHeight();
  } catch (error) {
    console.error(error);
    setStatus("Could not load data");
    document.getElementById("insights").textContent = `Could not load the dashboard.\n\n${error.message}`;
    announceHeight();
  }
}

function updateSourceSummary(weatherMeta = {}, tideMeta = {}, tideError = null) {
  const notes = ["Weather from Open-Meteo archive.", `Tide readings from WorldTides referenced to ${tideMeta?.datum || "CD"}.`];
  if (weatherMeta.forecastClamped) {
    notes.push(`Weather is currently available through ${formatDate(weatherMeta.safeEnd)}.`);
  }
  if (tideError) {
    notes.push("Tide data is currently unavailable in this view.");
  } else if (tideMeta?.clamped) {
    notes.push(`Tide history is currently available from ${formatDate(tideMeta.safeStart)} to ${formatDate(tideMeta.safeEnd)} in this feed.`);
  }
  els.sourceSummary.textContent = notes.join(" ");
}

function createCharts(series, tideReadings, extrema, dates) {
  destroyCharts();
  if (!tideReadings.length) {
    const tideCanvas = document.getElementById("tideChart");
    const ctx = tideCanvas.getContext("2d");
    ctx.clearRect(0, 0, tideCanvas.width, tideCanvas.height);
    document.getElementById("tideEvents").textContent = "Tide data could not be loaded for this view.";
  } else {
  const tideYMax = max(tideReadings.map((item) => item.value)) || 0;
  const tideLabels = tideReadings.map((item) => item.time);
  const tideMarkerData = tideReadings.map((item) => item.value);
  const lowPointData = new Array(tideReadings.length).fill(null);
  const highPointData = new Array(tideReadings.length).fill(null);
  const surveyPointData = new Array(tideReadings.length).fill(null);
  const surveyMarkerY = new Array(tideReadings.length).fill(null);
  const nearestLowData = new Array(tideReadings.length).fill(null);

  extrema.lows.forEach((item) => {
    const index = closestReadingIndex(tideReadings, item.time);
    if (Number.isInteger(index)) lowPointData[index] = item.value;
  });
  extrema.highs.forEach((item) => {
    const index = closestReadingIndex(tideReadings, item.time);
    if (Number.isInteger(index)) highPointData[index] = item.value;
  });

  dates.forEach((date) => {
    const surveyTarget = new Date(`${date}T12:00:00Z`).getTime();
    let bestSurveyIndex = 0;
    let bestSurveyDiff = Infinity;
    tideReadings.forEach((item, index) => {
      const diff = Math.abs(asDate(item.time).getTime() - surveyTarget);
      if (diff < bestSurveyDiff) {
        bestSurveyDiff = diff;
        bestSurveyIndex = index;
      }
    });
    surveyPointData[bestSurveyIndex] = tideMarkerData[bestSurveyIndex];
    surveyMarkerY[bestSurveyIndex] = 0.2;

    const nearestLow = nearestLowToSurvey(extrema.lows, date);
    if (nearestLow) {
      const lowIndex = closestReadingIndex(tideReadings, nearestLow.time);
      if (Number.isInteger(lowIndex)) nearestLowData[lowIndex] = nearestLow.value;
    }
  });

  charts.tide = new Chart(document.getElementById("tideChart"), {
    type: "line",
    data: {
      labels: tideLabels,
      datasets: [
        { label: "Tide height (m)", data: tideMarkerData, borderColor: "#38bdf8", backgroundColor: "rgba(56,189,248,0.12)", borderWidth: 3, pointRadius: 0, tension: 0.2 },
        { label: "Low tide", data: lowPointData, showLine: false, pointRadius: 5, pointHoverRadius: 6, pointBackgroundColor: "#34d399", pointBorderColor: "#34d399", pointBorderWidth: 2, borderColor: "#34d399" },
        { label: "High tide", data: highPointData, showLine: false, pointRadius: 5, pointHoverRadius: 6, pointBackgroundColor: "#fbbf24", pointBorderColor: "#fbbf24", pointBorderWidth: 2, borderColor: "#fbbf24" },
        { label: "Survey marker", data: surveyMarkerY, showLine: false, pointRadius: 6, pointHoverRadius: 7, pointBackgroundColor: "#fb7185", pointBorderColor: "#fb7185", pointBorderWidth: 2, borderColor: "#fb7185" },
        { label: "Closest low tide", data: nearestLowData, showLine: false, pointRadius: 6, pointHoverRadius: 7, pointBackgroundColor: "#a78bfa", pointBorderColor: "#a78bfa", pointBorderWidth: 2, borderColor: "#a78bfa" }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#dce8ff" } } },
      scales: {
        x: {
          ticks: {
            color: "#b9c9e7",
            autoSkip: true,
            maxTicksLimit: 14,
            callback(value, index) {
              const raw = tideLabels[index];
              return raw ? formatAxisDate(raw) : "";
            }
          },
          grid: { color: "rgba(255,255,255,.05)" }
        },
        y: {
          suggestedMin: 0,
          suggestedMax: Math.max(8, Math.ceil(tideYMax)),
          ticks: { color: "#b9c9e7" },
          grid: { color: "rgba(255,255,255,.05)" }
        }
      }
    }
  });
  }
  charts.rainPressure = new Chart(document.getElementById("rainPressureChart"), {
    type: "bar",
    data: { labels: series.labels, datasets: [
      { type: "bar", label: "Rainfall (mm)", data: series.rain, backgroundColor: "rgba(56,189,248,.45)", borderColor: "#38bdf8", borderWidth: 1, yAxisID: "y" },
      { type: "line", label: "Pressure (hPa)", data: series.pressureMin, borderColor: "#fbbf24", tension: 0.25, yAxisID: "y1" }
    ] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: "#dce8ff" } } }, scales: { x: { ticks: { color: "#b9c9e7" }, grid: { color: "rgba(255,255,255,.05)" } }, y: { ticks: { color: "#b9c9e7" }, grid: { color: "rgba(255,255,255,.05)" } }, y1: { position: "right", ticks: { color: "#b9c9e7" }, grid: { drawOnChartArea: false } } } }
  });
  charts.wind = new Chart(document.getElementById("windChart"), {
    type: "line",
    data: { labels: series.labels, datasets: [
      { label: "Mean wind (km/h)", data: series.windMean, borderColor: "#55c8ff", tension: 0.25 },
      { label: "Peak gust (km/h)", data: series.gustMax, borderColor: "#fb7185", tension: 0.25 }
    ] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: "#dce8ff" } } }, scales: { x: { ticks: { color: "#b9c9e7" }, grid: { color: "rgba(255,255,255,.05)" } }, y: { ticks: { color: "#b9c9e7" }, grid: { color: "rgba(255,255,255,.05)" } } } }
  });
  charts.temp = new Chart(document.getElementById("tempChart"), {
    type: "line",
    data: { labels: series.labels, datasets: [
      { label: "Mean temp (C)", data: series.tempMean, borderColor: "#fbbf24", tension: 0.25 },
      { label: "Min temp (C)", data: series.tempMin, borderColor: "#60a5fa", tension: 0.2 },
      { label: "Max temp (C)", data: series.tempMax, borderColor: "#fb7185", tension: 0.2 }
    ] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: "#dce8ff" } } }, scales: { x: { ticks: { color: "#b9c9e7" }, grid: { color: "rgba(255,255,255,.05)" } }, y: { ticks: { color: "#b9c9e7" }, grid: { color: "rgba(255,255,255,.05)" } } } }
  });
}

function exportJson() {
  if (!window.__estuaryDashboardData) {
    alert("Load data first.");
    return;
  }
  const blob = new Blob([JSON.stringify(window.__estuaryDashboardData, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "padstow-estuary-dashboard-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function announceHeight() {
  const height = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.documentElement.getBoundingClientRect().height
  );
  window.parent.postMessage({ type: "weather-dashboard-height", height }, "*");
}
