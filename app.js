import { projectConfig } from "./src/config/projectConfig.js?v=20260722a";
import { areaSettings, assetSettings, layerSettings } from "./src/data/areas.js?v=20260722a";
import { environmentalContext } from "./src/data/environmentalContext.js?v=20260722a";
import { sectionSettings } from "./src/data/sections.js?v=20260722a";
import { volumeChangeSettings } from "./src/data/volumeChange.js?v=20260722a";

  const state = {
  dataset: null,
  projectId: null,
  surveyId: null,
  areaId: projectConfig.defaultState.areaId,
  sectionId: projectConfig.defaultState.sectionId,
  layerKey: projectConfig.defaultState.layerKey,
  primaryLayerKey: projectConfig.defaultState.primaryLayerKey,
  secondaryLayerKey: projectConfig.defaultState.secondaryLayerKey,
  assetStatusCache: new Map(),
  primarySurveyId: null,
  secondarySurveyId: null,
  compareMode: "single",
  primaryOpacity: 1,
  secondaryOpacity: 0.55,
  showGuideDsm: false,
  showGuideContours: true,
  showChangeHighlight: false,
  overviewMode: "information",
  overviewIndexOpen: false,
  overviewAreaFilter: "all",
  sectionBasemap: projectConfig.defaultState.layerKey,
  sectionRows: [],
  sectionComparisonSurveyIds: [],
  sectionHoverDistance: null,
  swipePercent: 50,
  isDraggingSwipe: false,
  scale: 1,
  panX: 0,
  panY: 0,
  isPanning: false,
  activeViewerPointerId: null,
  activeTouchGesture: false,
  touchGestureMode: null,
  lastTouchX: 0,
  lastTouchY: 0,
  viewerPointers: new Map(),
  pinchStartDistance: null,
  pinchStartScale: 1,
  pinchStartPanX: 0,
  pinchStartPanY: 0,
  pinchStartCenter: null,
  pinchStageCenter: null,
  startX: 0,
  startY: 0,
  startPanX: 0,
  startPanY: 0,
  sectionPointerId: null,
  pendingSectionHoverDistance: null,
  pendingSectionHoverFrame: null,
  adminMode: false,
  activeTab: projectConfig.defaultState.activeTab,
  weatherFrameSrc: "",
  weatherFrameHeight: 0,
  surveyTideSummaryCache: new Map(),
  surveyTideSummaryRequests: new Map(),
  volumeViewMode: "comparison",
  jsonAssetCache: new Map(),
  processedSectionAssetCache: new Map(),
  processedHighlightAssetCache: new Map(),
  sectionTrackCache: new Map(),
  sectionArea: null,
  sectionComparisonSnapshot: null,
  volumeLightboxZoom: 1,
  volumeLightboxRotation: 0,
  volumeLightboxLegendItems: [],
  volumeLightboxPanX: 0,
  volumeLightboxPanY: 0,
  volumeLightboxIsPanning: false,
  volumeLightboxPointerId: null,
  volumeLightboxStartX: 0,
  volumeLightboxStartY: 0,
  volumeLightboxStartPanX: 0,
  volumeLightboxStartPanY: 0,
  accessUsers: [],
  projectCatalog: null
    };

const DEFAULT_TABS = Array.isArray(projectConfig.navigation.tabs) ? projectConfig.navigation.tabs : ["overview"];
const VALID_TABS = new Set(DEFAULT_TABS);
const AREA_ENABLED_TOOLBAR_TABS = new Set(["panorama", "volume", "layers", "sections"]);
const SURVEY_MODEL_TABS = new Set(["areas", "panorama", "volume", "layers", "sections"]);
const trendAreaCachePromises = new Map();

  const EXPLICIT_SECTION_IMAGE_TRACKS = {
    area1: [
      { upper: { x: 27.25, y: 4.86 }, lower: { x: 15.85, y: 46.18 } },
      { upper: { x: 52.21, y: 18.18 }, lower: { x: 58.07, y: 94.84 } },
      { upper: { x: 74.04, y: 21.49 }, lower: { x: 77.07, y: 68.87 } }
    ],
    area2: [
      { upper: { x: 25.61, y: 24.8 }, lower: { x: 24.54, y: 91.8 } },
      { upper: { x: 49.15, y: 1.24 }, lower: { x: 50.73, y: 97.29 } },
      { upper: { x: 76.66, y: 30.07 }, lower: { x: 77.42, y: 99.89 } }
    ],
    area3: [
      { upper: { x: 27.2, y: 16.45 }, lower: { x: 24.93, y: 89.88 } },
      { upper: { x: 53.8, y: 25.37 }, lower: { x: 52.37, y: 77.57 } },
      { upper: { x: 81.76, y: 9.26 }, lower: { x: 79.8, y: 97.4 } }
    ],
    area4: [
      { upper: { x: 32.45, y: 10.5 }, lower: { x: 22.53, y: 56.83 } },
      { upper: { x: 57.05, y: 12.42 }, lower: { x: 43.98, y: 78.92 } },
      { upper: { x: 76.8, y: 14.38 }, lower: { x: 62.41, y: 90.97 } }
    ],
    area5: [
      { upper: { x: 33.43, y: 2.26 }, lower: { x: 31.24, y: 89.99 } },
      { upper: { x: 53.97, y: 26.19 }, lower: { x: 53.97, y: 95.07 } },
      { upper: { x: 79.21, y: 21.6 }, lower: { x: 85.86, y: 97.4 } }
    ],
    area6: [
      { upper: { x: 32.5, y: 17.28 }, lower: { x: 27.59, y: 76.74 } },
      { upper: { x: 49.53, y: 19.35 }, lower: { x: 43.96, y: 74.26 } },
      { upper: { x: 74.2, y: 38.46 }, lower: { x: 70.5, y: 87.62 } }
    ],
    area7: [
      { upper: { x: 19.01, y: 33.72 }, lower: { x: 22.24, y: 76.1 } },
      { upper: { x: 48.89, y: 16.9 }, lower: { x: 49.23, y: 63.49 } },
      { upper: { x: 82.23, y: 18.07 }, lower: { x: 80.79, y: 71.77 } }
    ],
    area8: [
      { upper: { x: 24.69, y: 20.7 }, lower: { x: 21.32, y: 71.85 } },
      { upper: { x: 45.21, y: 1.69 }, lower: { x: 42, y: 72.49 } },
      { upper: { x: 73.17, y: 26.12 }, lower: { x: 67.02, y: 79.9 } }
    ]
  };

  function explicitTrackToSectionTrack(explicitTrack) {
    const start = { ...explicitTrack.upper };
    const end = { ...explicitTrack.lower };
    return {
      start,
      end,
      points: [start, end]
    };
  }

const SECTION_PROFILE_COLORS = [
  "#79a7ff",
  "#ff7f6e",
  "#ffd84d",
  "#7ee0c0",
  "#c7a2ff",
  "#ff9ad5"
];

const DEFAULT_SECTION_CHART_DISPLAY_BY_PROJECT = {
  "padstow-estuary": {
    maxDisplayHeight: 3,
    showClippedOverlay: true
  }
};

const SECTION_CHART_DISPLAY_OVERRIDES = {
  "padstow-estuary:area3:A3-01": {
    maxDisplayHeight: 4,
    showClippedOverlay: true
  },
  "padstow-estuary:area3:A3-02": {
    maxDisplayHeight: 4,
    showClippedOverlay: true
  },
  "padstow-estuary:area3:A3-03": {
    maxDisplayHeight: 4,
    showClippedOverlay: true
  },
  "padstow-estuary:area8:A8-01": {
    maxDisplayHeight: 4,
    showClippedOverlay: true
  },
  "padstow-estuary:area8:A8-02": {
    maxDisplayHeight: 4,
    showClippedOverlay: true
  },
  "padstow-estuary:area8:A8-03": {
    maxDisplayHeight: 4,
    showClippedOverlay: true
  }
};

const BASELINE_AREA_OVERVIEW = {
  area1: {
    title: "Hawker's Cove / Tregirls Beach",
    zone: "Outer estuary / Padstow side",
    day: "Day 1",
    filterKey: "day1",
    statusLabel: "Later than low tide",
    statusTone: "amber",
    size: "1.00 km2",
    start: "15:57",
    finish: "16:46",
    launchOffset: "130 mins after low tide",
    midOffset: 155,
    tideWindow: "Approx. 2.99 m to 3.93 m",
    lowTide: "13:47",
    lowTideHeight: "0.53 m",
    estimatedDuration: "32m 18s",
    actualDuration: "44m 23s",
    tideScore: 61,
    missionRole: "Covers the outer Padstow-side section and completes the Day 1 survey sequence.",
    operationalNote: "Reached after a long drive round from the Rock side. Conditions were good closer in, but wind increased sharply towards Stepper Point and the drone was less settled there.",
    deliverables: "High-resolution aerial image, surface height model, 3D ground model, panoramic views, future comparison views",
    weatherNotes: "Coordinate: 50.561399, -4.944237. Good conditions closer to Iron Cove, with stronger wind felt further out towards Stepper Point. More sheltered inside, more exposed on the outer edge.",
    surveyNotes: "This area was flown later in the session after travelling round from the Rock side, which added nearly 40 minutes by car. The aircraft was happy closer in, but became less comfortable further out towards Stepper Point where the wind was stronger.",
    tags: ["Day 1", "Padstow side", "Outer reach", "Late-tide context"],
    cardNote: "Outer Padstow-side baseline",
    purpose: "Shows conditions in the outer Padstow-side section after low tide and helps link this area to the rest of the estuary survey."
  },
  area2: {
    title: "Daymer Bay",
    zone: "Rock side / outer entrance",
    day: "Day 1",
    filterKey: "day1",
    statusLabel: "Early tide window",
    statusTone: "amber",
    size: "0.70 km2",
    start: "12:04",
    finish: "12:44",
    launchOffset: "103 mins before low tide",
    midOffset: -83,
    tideWindow: "Approx. 2.38 m to 1.66 m",
    lowTide: "13:47",
    lowTideHeight: "0.53 m",
    estimatedDuration: "26m 29s",
    actualDuration: "37m 42s",
    tideScore: 72,
    missionRole: "Starts the main Day 1 survey and covers the outer Rock-side section.",
    operationalNote: "This was the first proper scan of the day. Wind was not too high and the conditions were steadier than later areas.",
    deliverables: "High-resolution aerial image, surface height model, 3D ground model, panoramic views, future comparison views",
    weatherNotes: "Coordinate: 50.560443, -4.929076. Earlier in the day with lighter wind, some sun, and generally good flying conditions across the bay.",
    surveyNotes: "This was the first proper scan of the session, flown earlier in the day while the tide was still falling. Conditions were calmer here, with some sun coming through and no major wind issues during the flight.",
    tags: ["Day 1", "Rock side", "Outer entrance", "Pre-low tide"],
    cardNote: "Early Rock-side baseline",
    purpose: "Shows the outer bay area as the tide was still falling and gives context for the entrance to the estuary."
  },
  area3: {
    title: "Rock Beach",
    zone: "Central estuary / Tregirls side",
    day: "Day 1",
    filterKey: "day1",
    statusLabel: "Good low-tide alignment",
    statusTone: "green",
    size: "0.91 km2",
    start: "13:14",
    finish: "13:56",
    launchOffset: "33 mins before low tide",
    midOffset: -12,
    tideWindow: "Approx. 1.12 m to 0.70 m",
    lowTide: "13:47",
    lowTideHeight: "0.53 m",
    estimatedDuration: "31m 21s",
    actualDuration: "39m 11s",
    tideScore: 95,
    missionRole: "Covers a central section close to low tide and forms an important part of the baseline survey.",
    operationalNote: "This was the first point on site where the true scale of the sandbars was obvious. Wind was present but manageable, with sun at first and more cloud coming over as the flight went on.",
    deliverables: "High-resolution aerial image, surface height model, 3D ground model, cross-sections, panoramic views, future comparison views",
    weatherNotes: "Coordinate: 50.550143, -4.931826. Some wind was noticeable on site, but nothing too strong. Started brighter with some sun, then cloud increased as the survey moved through.",
    surveyNotes: "This area gave the first proper feet-on-the-ground sense of how high the sandbars really were, much larger than expected and in places taller than standing height. It was possible to walk down the middle of the estuary with a strong but manageable flow, then work back inland with the drone. This made the area especially valuable for understanding the true scale of exposed ground near low tide.",
    tags: ["Day 1", "Central reach", "Near low tide", "Cross-section priority"],
    cardNote: "Strong central low-tide capture",
    purpose: "Shows the central area close to low tide, when more of the estuary bed was exposed."
  },
  area4: {
    title: "Padstow Harbour Estuary",
    zone: "Padstow side / upper harbour flats",
    day: "Day 2",
    filterKey: "day2",
    statusLabel: "After low tide",
    statusTone: "amber",
    size: "1.00 km2",
    start: "14:46",
    finish: "15:56",
    launchOffset: "23 mins after low tide",
    midOffset: 58,
    tideWindow: "Approx. 1.33 m to 2.49 m",
    lowTide: "14:23",
    lowTideHeight: "0.95 m",
    estimatedDuration: "34m 32s",
    actualDuration: "48m 43s",
    tideScore: 82,
    missionRole: "Covers the harbour-side flats on Day 2 after low tide.",
    operationalNote: "Chosen for the Monday to avoid the busier Sunday conditions near Padstow. Wind was lighter closer to Padstow, then picked up a bit further down towards Little Petherick Creek bridge where the estuary opened out more.",
    deliverables: "High-resolution aerial image, surface height model, 3D ground model, cross-sections, panoramic views, future comparison views",
    weatherNotes: "Coordinate: 50.535818, -4.929569. Generally calmer closer to Padstow, with slightly more wind further down-estuary towards Little Petherick Creek bridge where the area felt more open.",
    surveyNotes: "This section was deliberately left for Monday so the Padstow edge would be quieter than on the Sunday. Even so, the route avoided direct overflight of the busier public areas. Conditions were fairly calm near Padstow itself, with a bit more wind felt further down the estuary.",
    tags: ["Day 2", "Padstow side", "Harbour flats", "Post-low tide"],
    cardNote: "Harbour flats after the tide turn",
    purpose: "Shows the Padstow-side harbour flats as the water started to return."
  },
  area5: {
    title: "Porthilly Cove",
    zone: "Transition zone / central bar area",
    day: "Day 1",
    filterKey: "day1",
    statusLabel: "Around low tide",
    statusTone: "green",
    size: "0.77 km2",
    start: "14:23",
    finish: "14:57",
    launchOffset: "36 mins after low tide",
    midOffset: 53,
    tideWindow: "Approx. 1.21 m to 1.86 m",
    lowTide: "13:47",
    lowTideHeight: "0.53 m",
    estimatedDuration: "25m 49s",
    actualDuration: "32m 46s",
    tideScore: 87,
    missionRole: "Covers an important transition area between the central estuary and the outer Padstow-side section.",
    operationalNote: "This was the third flight of Day 1. Access from Rock car park was awkward, with very soft silky sand in places making the walk-in difficult.",
    deliverables: "High-resolution aerial image, surface height model, 3D ground model, cross-sections, panoramic views, future comparison views",
    weatherNotes: "Coordinate: 50.540612, -4.921686. Cloud had built up by this point, giving flatter light and less pleasant weather than earlier in the day, although conditions remained calm enough for flying.",
    surveyNotes: "This area was meant to land as close to low tide as possible on Day 1, but like the rest of the programme it drifted later because everything took longer in the field. The route in from Rock car park was unpleasant, with deep silky sand in places up to knee depth, so in future it would probably make more sense to park nearer the church and walk in from there.",
    tags: ["Day 1", "Transition zone", "Sediment bar", "Monitoring priority"],
    cardNote: "Bar and channel transition area",
    purpose: "Shows a key transition area where changes to bars and channels are easier to track over time."
  },
  area6: {
    title: "Old Town Cove",
    zone: "Inland / upper estuary",
    day: "Day 2",
    filterKey: "day2",
    statusLabel: "Later session",
    statusTone: "rose",
    size: "1.01 km2",
    start: "16:10",
    finish: "17:05",
    launchOffset: "107 mins after low tide",
    midOffset: 135,
    tideWindow: "Approx. 2.72 m to 3.64 m",
    lowTide: "14:23",
    lowTideHeight: "0.95 m",
    estimatedDuration: "35m 42s",
    actualDuration: "42m 28s",
    tideScore: 59,
    missionRole: "Covers the inland end of the Day 2 survey and shows conditions later in the session.",
    operationalNote: "This was the final flight of Day 2. By this point the wind had dropped right away and conditions were much calmer than earlier in the day.",
    deliverables: "High-resolution aerial image, surface height model, 3D ground model, panoramic views, future comparison views",
    weatherNotes: "Coordinate: 50.531896, -4.908045. Mostly grey cloud remained, but the wind had almost disappeared and the sun was just starting to poke through again late in the day.",
    surveyNotes: "This was the last area flown on Day 2 after completing A8, A7, and A4 first, with the overall aim of getting A4 and A5 as close to low tide as possible across the two survey days. Earlier in the day the wind had been much more noticeable in the upper estuary, but by the time this block was flown it had dropped off significantly, making the aircraft much happier.",
    tags: ["Day 2", "Inner reach", "Operational test", "Late tide"],
    cardNote: "Practical limit of the session",
    purpose: "Shows the upper estuary later in the tide cycle and helps record how conditions changed further inland."
  },
  area7: {
    title: "Slate Quarry",
    zone: "Mid-inner estuary",
    day: "Day 2",
    filterKey: "day2",
    statusLabel: "Near low tide",
    statusTone: "green",
    size: "0.92 km2",
    start: "13:15",
    finish: "14:19",
    launchOffset: "68 mins before low tide",
    midOffset: -36,
    tideWindow: "Approx. 2.04 m to 1.01 m",
    lowTide: "14:23",
    lowTideHeight: "0.95 m",
    estimatedDuration: "32m 01s",
    actualDuration: "42m 34s",
    tideScore: 88,
    missionRole: "Covers an inland section before low tide and gives a useful comparison with areas flown later in the day.",
    operationalNote: "After the calm start further up-estuary, the wind picked up noticeably here. The drone was working harder and progress was slower when flying into the wind towards Padstow.",
    deliverables: "High-resolution aerial image, surface height model, 3D ground model, cross-sections, panoramic views, future comparison views",
    weatherNotes: "Coordinate: 50.532115, -4.887484. Wind was clearly stronger here than in A8, with airflow pushing down from the Padstow direction and making this section more exposed.",
    surveyNotes: "This was the second main section flown on Day 2 after starting further up at Wadebridge. As the survey moved back down the estuary towards Padstow, the wind definitely increased and the aircraft had to work harder. It did not map as quickly into the wind, especially when tracking back towards Padstow, which was the direction the airflow seemed to be coming from.",
    tags: ["Day 2", "Pre-low tide", "Mid-inner reach", "Comparison priority"],
    cardNote: "Pre-low-tide inland comparison",
    purpose: "Shows how the mid-inner estuary was exposing before low tide."
  },
  area8: {
    title: "Wadebridge",
    zone: "Rock side / upper edge",
    day: "Day 2",
    filterKey: "day2",
    statusLabel: "Early tide window",
    statusTone: "amber",
    size: "0.95 km2",
    start: "12:07",
    finish: "13:13",
    launchOffset: "136 mins before low tide",
    midOffset: -103,
    tideWindow: "Approx. 3.14 m to 2.08 m",
    lowTide: "14:23",
    lowTideHeight: "0.95 m",
    estimatedDuration: "33m 26s",
    actualDuration: "46m 19s",
    tideScore: 67,
    missionRole: "Starts Day 2 and covers the upper Rock-side section before low tide.",
    operationalNote: "This was the furthest section from Padstow and the easiest way in and out was by bike with the kit on a trailer. Once there, conditions were calm and very peaceful with no real wind.",
    deliverables: "High-resolution aerial image, surface height model, 3D ground model, panoramic views, future comparison views",
    weatherNotes: "Coordinate: 50.532295, -4.863407. Calm conditions with very little wind, soft white cloud, and good visibility, making it easier to keep the drone in sight.",
    surveyNotes: "Day 2 started here because it was the furthest point from Padstow. Access was easiest by bike and trailer, cycling all the way up towards Wadebridge before setting up just short of the bridge. The area felt peaceful and sheltered, with very little wind and some soft white cloud in the sky, making it a very comfortable place to start the day.",
    tags: ["Day 2", "Rock side", "Early sequence", "Context area"],
    cardNote: "Early Day 2 Rock-side context",
    purpose: "Shows early Day 2 conditions while the tide was still falling and more water remained across the estuary."
  }
};

const AREA_METADATA_FIELDS = [
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
];

const els = {
  surveySelect: byId("surveySelect"),
  areaSelect: byId("areaSelect"),
  sectionSelect: byId("sectionSelect"),
  projectTitle: byId("projectTitle"),
  projectSummary: byId("projectSummary"),
  shellStageEyebrow: byId("shellStageEyebrow"),
  shellStageTitle: byId("shellStageTitle"),
  shellStageSummary: byId("shellStageSummary"),
  shellStageAction: byId("shellStageAction"),
  shellStageSummaryDock: byId("shellStageSummaryDock"),
  shellStageSurvey: byId("shellStageSurvey"),
  shellStageArea: byId("shellStageArea"),
  shellStageVisual: byId("shellStageVisual"),
  shellStageVisualImage: byId("shellStageVisualImage"),
  overviewHeroTitle: byId("overviewHeroTitle"),
  overviewHeroText: byId("overviewHeroText"),
  overviewInfoBtn: byId("overviewInfoBtn"),
  overviewSurveyBtn: byId("overviewSurveyBtn"),
  overviewHelpBtn: byId("overviewHelpBtn"),
  overviewIndexBtn: byId("overviewIndexBtn"),
  overviewIndexMenu: byId("overviewIndexMenu"),
  overviewContentsTitle: byId("overviewContentsTitle"),
  overviewContentsLead: byId("overviewContentsLead"),
  overviewContentsSubtext: byId("overviewContentsSubtext"),
  overviewContentsGrid: byId("overviewContentsGrid"),
  overviewGlanceGrid: byId("overviewGlanceGrid"),
  overviewStoryTitle: byId("overviewStoryTitle"),
  overviewStory: byId("overviewStory"),
  overviewAreasSubtext: byId("overviewAreasSubtext"),
  overviewAreaFilters: byId("overviewAreaFilters"),
  overviewAreaGrid: byId("overviewAreaGrid"),
  areaOverviewPanel: byId("areaOverviewPanel"),
  metricGrid: byId("metricGrid"),
  surveyReadinessGrid: byId("surveyReadinessGrid"),
  surveyReadinessDetails: byId("surveyReadinessDetails"),
  surveyCoverageGrid: byId("surveyCoverageGrid"),
  surveyCoverageAreas: byId("surveyCoverageAreas"),
  timeline: byId("timeline"),
  areaList: byId("areaList"),
  selectedAreaPanel: byId("selectedAreaPanel"),
  selectedAreaTitle: byId("selectedAreaTitle"),
  selectedAreaSummary: byId("selectedAreaSummary"),
  selectedAreaChips: byId("selectedAreaChips"),
  selectedAreaAssets: byId("selectedAreaAssets"),
  weatherSummary: byId("weatherSummary"),
  weatherFrame: byId("weatherFrame"),
  panoramaSummary: byId("panoramaSummary"),
  panoramaFrame: byId("panoramaFrame"),
  panoramaStats: byId("panoramaStats"),
  panoramaDetails: byId("panoramaDetails"),
  volumeSummary: byId("volumeSummary"),
  volumeQuickAreas: byId("volumeQuickAreas"),
  volumeSandboxBanner: byId("volumeSandboxBanner"),
  volumeMetricGrid: byId("volumeMetricGrid"),
  volumeViewerPanel: byId("volumeViewerPanel"),
  volumeViewerTitle: byId("volumeViewerTitle"),
  volumeViewerSummary: byId("volumeViewerSummary"),
  volumeViewerFrame: byId("volumeViewerFrame"),
  volumeViewerGuide: byId("volumeViewerGuide"),
  volumeViewerStats: byId("volumeViewerStats"),
  volumeViewerDetails: byId("volumeViewerDetails"),
  volumeTrendPanel: byId("volumeTrendPanel"),
  volumeTrendIntro: byId("volumeTrendIntro"),
  volumeTrendBody: byId("volumeTrendBody"),
  volumeReferencePanel: byId("volumeReferencePanel"),
  volumeImageSummary: byId("volumeImageSummary"),
  volumeGuidancePanels: byId("volumeGuidancePanels"),
  volumeMethod: byId("volumeMethod"),
  volumeNarrative: byId("volumeNarrative"),
  volumeRolloutPanel: byId("volumeRolloutPanel"),
  volumeAreaGrid: byId("volumeAreaGrid"),
  volumeImageryGrid: byId("volumeImageryGrid"),
  volumeImageLightbox: byId("volumeImageLightbox"),
  volumeImageLightboxBackdrop: byId("volumeImageLightboxBackdrop"),
  volumeImageLightboxClose: byId("volumeImageLightboxClose"),
  volumeImageLightboxEyebrow: byId("volumeImageLightboxEyebrow"),
  volumeImageLightboxTitle: byId("volumeImageLightboxTitle"),
  volumeImageLightboxCaption: byId("volumeImageLightboxCaption"),
  volumeImageLightboxViewport: byId("volumeImageLightboxViewport"),
  volumeImageLightboxImage: byId("volumeImageLightboxImage"),
  volumeImageLightboxLegend: byId("volumeImageLightboxLegend"),
  volumeImageLightboxZoomIn: byId("volumeImageLightboxZoomIn"),
  volumeImageLightboxZoomOut: byId("volumeImageLightboxZoomOut"),
  volumeImageLightboxReset: byId("volumeImageLightboxReset"),
  viewerTitle: byId("viewerTitle"),
  layerWorkspace: byId("layerWorkspace"),
  primaryCompareSelect: byId("primaryCompareSelect"),
  secondaryCompareSelect: byId("secondaryCompareSelect"),
  primaryLayerCompareSelect: byId("primaryLayerCompareSelect"),
  secondaryLayerCompareSelect: byId("secondaryLayerCompareSelect"),
  compareModeControls: byId("compareModeControls"),
  viewerStage: byId("viewerStage"),
  transparencyControls: byId("transparencyControls"),
  primaryOpacityRange: byId("primaryOpacityRange"),
  secondaryOpacityRange: byId("secondaryOpacityRange"),
  viewerTransform: byId("viewerTransform"),
  viewerBaseImage: byId("viewerBaseImage"),
  viewerGuideDsmOverlay: byId("viewerGuideDsmOverlay"),
  viewerGuideDsmImage: byId("viewerGuideDsmImage"),
  viewerGuideContourOverlay: byId("viewerGuideContourOverlay"),
  viewerGuideContourImage: byId("viewerGuideContourImage"),
  viewerTransparencyOverlay: byId("viewerTransparencyOverlay"),
  viewerOverlayImage: byId("viewerOverlayImage"),
  viewerHighlightOverlay: byId("viewerHighlightOverlay"),
  viewerHighlightImage: byId("viewerHighlightImage"),
  viewerSliderOverlay: byId("viewerSliderOverlay"),
  viewerSliderImage: byId("viewerSliderImage"),
  sliderHandle: byId("sliderHandle"),
  viewerCaption: byId("viewerCaption"),
  layerControls: byId("layerControls"),
  zoomInBtn: byId("zoomInBtn"),
  zoomOutBtn: byId("zoomOutBtn"),
  resetViewBtn: byId("resetViewBtn"),
  viewerFullscreenBtn: byId("viewerFullscreenBtn"),
  toggleGuideDsm: byId("toggleGuideDsm"),
  toggleGuideContours: byId("toggleGuideContours"),
  toggleChangeHighlight: byId("toggleChangeHighlight"),
  compareHighlightLegend: byId("compareHighlightLegend"),
  compareInsightGrid: byId("compareInsightGrid"),
  sectionWorkspace: byId("sectionWorkspace"),
  sectionPanelTitle: byId("sectionPanelTitle"),
  sectionStatusText: byId("sectionStatusText"),
  sectionOrthoBtn: byId("sectionOrthoBtn"),
  sectionDsmBtn: byId("sectionDsmBtn"),
  sectionFullscreenBtn: byId("sectionFullscreenBtn"),
  sectionMapStage: byId("sectionMapStage"),
  sectionBaseImage: byId("sectionBaseImage"),
  sectionOverlayImage: byId("sectionOverlayImage"),
  sectionHeroTitle: byId("sectionHeroTitle"),
  sectionHeroSummary: byId("sectionHeroSummary"),
  sectionSurveyPill: byId("sectionSurveyPill"),
  sectionHeroStats: byId("sectionHeroStats"),
  sectionHotspots: byId("sectionHotspots"),
  sectionMapMarker: byId("sectionMapMarker"),
  sectionQuickSelect: byId("sectionQuickSelect"),
  sectionProfileControls: byId("sectionProfileControls"),
  sectionProfileLegend: byId("sectionProfileLegend"),
  profileChart: byId("profileChart"),
  sectionAnalysisGrid: byId("sectionAnalysisGrid"),
  sectionComparisonSummary: byId("sectionComparisonSummary"),
  sectionComparisonQuickbar: byId("sectionComparisonQuickbar"),
  sectionComparisonQuickText: byId("sectionComparisonQuickText"),
  sectionComparisonSnapshotBtn: byId("sectionComparisonSnapshotBtn"),
  sectionDifferenceSurveyLabel: byId("sectionDifferenceSurveyLabel"),
  sectionDifferenceValue: byId("sectionDifferenceValue"),
  sectionDifferenceText: byId("sectionDifferenceText"),
  sectionTrendLabel: byId("sectionTrendLabel"),
  sectionTrendText: byId("sectionTrendText"),
  sectionTrendMini: byId("sectionTrendMini"),
  sectionDifferenceRange: byId("sectionDifferenceRange"),
  sectionDifferenceInset: byId("sectionDifferenceInset"),
  sectionMetrics: byId("sectionMetrics"),
  sectionDetails: byId("sectionDetails"),
  sectionInsightOverlay: byId("sectionInsightOverlay"),
  sectionInsightOverlayBackdrop: byId("sectionInsightOverlayBackdrop"),
  sectionInsightOverlayClose: byId("sectionInsightOverlayClose"),
  sectionInsightOverlayEyebrow: byId("sectionInsightOverlayEyebrow"),
  sectionInsightOverlayTitle: byId("sectionInsightOverlayTitle"),
  sectionInsightOverlaySummary: byId("sectionInsightOverlaySummary"),
  sectionInsightOverlayBody: byId("sectionInsightOverlayBody"),
  overviewOnboardingSummary: byId("overviewOnboardingSummary"),
  overviewOnboardingDetails: byId("overviewOnboardingDetails"),
  adminTargetSummary: byId("adminTargetSummary"),
  adminExpectedFiles: byId("adminExpectedFiles"),
  uploadOrtho: byId("uploadOrtho"),
  uploadDsm: byId("uploadDsm"),
  uploadContour: byId("uploadContour"),
  uploadSectionLines: byId("uploadSectionLines"),
  uploadSectionCsv: byId("uploadSectionCsv"),
  uploadSelectedFiles: byId("uploadSelectedFiles"),
  createSurveyBtn: byId("createSurveyBtn"),
  newSurveyName: byId("newSurveyName"),
  newSurveyStart: byId("newSurveyStart"),
  newSurveyEnd: byId("newSurveyEnd"),
  newSurveyBaseline: byId("newSurveyBaseline"),
  createSurveyStatus: byId("createSurveyStatus"),
  adminMetadataSummary: byId("adminMetadataSummary"),
  metaStatusLabel: byId("metaStatusLabel"),
  metaStatusTone: byId("metaStatusTone"),
  metaPurpose: byId("metaPurpose"),
  metaStart: byId("metaStart"),
  metaFinish: byId("metaFinish"),
  metaSize: byId("metaSize"),
  metaLowTide: byId("metaLowTide"),
  metaLowTideHeight: byId("metaLowTideHeight"),
  metaLaunchOffset: byId("metaLaunchOffset"),
  metaEstimatedDuration: byId("metaEstimatedDuration"),
  metaActualDuration: byId("metaActualDuration"),
  metaTideWindow: byId("metaTideWindow"),
  metaTideScore: byId("metaTideScore"),
  metaTags: byId("metaTags"),
  metaMissionRole: byId("metaMissionRole"),
  metaOperationalNote: byId("metaOperationalNote"),
  metaWeatherNotes: byId("metaWeatherNotes"),
  metaSurveyNotes: byId("metaSurveyNotes"),
  saveAreaMetadataBtn: byId("saveAreaMetadataBtn"),
  resetAreaMetadataBtn: byId("resetAreaMetadataBtn"),
  areaMetadataStatus: byId("areaMetadataStatus"),
  volumeAdminSummary: byId("volumeAdminSummary"),
  volumeMethodInput: byId("volumeMethodInput"),
  volumeCellSizeInput: byId("volumeCellSizeInput"),
  volumeNotesInput: byId("volumeNotesInput"),
  volumeRowsInput: byId("volumeRowsInput"),
  saveVolumeBtn: byId("saveVolumeBtn"),
  volumeAdminStatus: byId("volumeAdminStatus"),
  adminUploadStatus: byId("adminUploadStatus"),
  adminOnboardingSummary: byId("adminOnboardingSummary"),
  adminOnboardingDetails: byId("adminOnboardingDetails"),
  adminBoardSummary: byId("adminBoardSummary"),
  adminBoardGrid: byId("adminBoardGrid"),
  accessLabelInput: byId("accessLabelInput"),
  accessUsernameInput: byId("accessUsernameInput"),
  accessPasswordInput: byId("accessPasswordInput"),
  accessExpiresAtInput: byId("accessExpiresAtInput"),
  accessNotesInput: byId("accessNotesInput"),
  createAccessUserBtn: byId("createAccessUserBtn"),
  accessUserStatus: byId("accessUserStatus"),
  accessUsersSummary: byId("accessUsersSummary"),
  accessUsersGrid: byId("accessUsersGrid"),
  workflowGrid: byId("workflowGrid"),
  tabs: byId("tabs"),
  backToTopBtn: byId("backToTopBtn"),
  adminModeToggle: byId("adminModeToggle"),
  signOutBtn: byId("signOutBtn")
};

bootstrap().catch((error) => {
  els.projectTitle.textContent = "Could not load project";
  els.projectSummary.textContent = error.message;
});

async function bootstrap() {
  const { dataset, projectCatalog, requestedProjectId } = await loadProjectDataset();
  state.dataset = dataset;
  state.projectCatalog = projectCatalog;
  const requestedAdminMode = new URLSearchParams(window.location.search).get("admin") === "1" || window.localStorage.getItem("fsm-admin-mode") === "1";
  const siteSession = await loadSiteSession();
  state.adminMode = adminToolsEnabled() && requestedAdminMode && Boolean(siteSession?.user?.isAdmin);
  if (!adminToolsEnabled() || !siteSession?.user?.isAdmin) {
    window.localStorage.removeItem("fsm-admin-mode");
  }
  state.projectId = requestedProjectId || state.dataset.projects[0].id;
  const defaultSurvey = currentProject().surveys[currentProject().surveys.length - 1];
  state.surveyId = defaultSurvey.id;
  state.primarySurveyId = state.surveyId;
  state.secondarySurveyId = defaultSurvey.comparisonBaseline
    || currentProject().surveys.find((survey) => survey.id !== state.surveyId)?.id
    || state.surveyId;
  state.sectionComparisonSurveyIds = defaultSectionComparisonSurveyIds();
  applyUrlState();
  bindEvents();
  renderAll();
}

async function loadSiteSession() {
  const response = await fetch("/api/site-auth/session");
  if (!response.ok) {
    return { authenticated: false };
  }
  return response.json().catch(() => ({ authenticated: false }));
}

async function loadProjectDataset() {
  if (window.location.protocol === "file:") {
    const inlineData = window.__FSM_PROJECTS__;
    if (inlineData?.projects?.length) {
      return {
        dataset: inlineData,
        projectCatalog: null,
        requestedProjectId: inlineData.projects[0]?.id || null
      };
    }
    throw new Error("This local preview needs the bundled data script. Keep `data/projects.inline.js` beside the app when opening `index.html` directly.");
  }

  const projectCatalog = await fetchJson("/public/projects/index.json", "Project catalog could not be loaded.");
  const availableProjects = Array.isArray(projectCatalog?.projects) ? projectCatalog.projects : [];
  const requestedProjectId = requestedProjectSlug()
    || new URLSearchParams(window.location.search).get("project")
    || projectCatalog?.defaultProjectId
    || availableProjects[0]?.id
    || null;

  if (!requestedProjectId) {
    throw new Error("No project is configured for this monitoring platform.");
  }

  const catalogEntry = availableProjects.find((item) => item.id === requestedProjectId) || null;
  if (!catalogEntry) {
    throw new Error(`Project not found: ${requestedProjectId}`);
  }

  const projectMeta = await fetchJson(catalogEntry.projectPath || projectDataPath(requestedProjectId, "project.json"), "Project metadata could not be loaded.");
  const areasPayload = await fetchJson(catalogEntry.areasPath || projectDataPath(requestedProjectId, "areas.json"), "Project areas could not be loaded.");
  const scansPayload = await fetchJson(catalogEntry.scansPath || projectDataPath(requestedProjectId, "scans.json"), "Project scans could not be loaded.");
  const contentPayload = await fetchOptionalJson(catalogEntry.contentPath || projectDataPath(requestedProjectId, "content.json"));
  const dataset = await buildDatasetForProject(requestedProjectId, projectMeta, areasPayload, scansPayload, contentPayload);

  return {
    dataset,
    projectCatalog,
    requestedProjectId
  };
}

async function fetchJson(path, fallbackMessage) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(fallbackMessage);
  }
  return response.json();
}

async function fetchOptionalJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    return null;
  }
  return response.json().catch(() => null);
}

function requestedProjectSlug() {
  const match = window.location.pathname.match(/^\/project\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function projectDataPath(projectId, fileName) {
  return `/public/projects/${encodeURIComponent(projectId)}/${fileName}`;
}

async function buildDatasetForProject(projectId, projectMeta, areasPayload, scansPayload, contentPayload = null) {
  const dataSource = projectMeta?.dataSource || {};
  let baseProject = null;

  if (dataSource.datasetPath) {
    const legacyDataset = await fetchJson(dataSource.datasetPath, "Project data could not be loaded.");
    const legacyProjectId = dataSource.projectId || projectId;
    baseProject = legacyDataset?.projects?.find((item) => item.id === legacyProjectId) || null;
    if (!baseProject) {
      throw new Error(`Project data is missing for ${legacyProjectId}.`);
    }
  }

  const projectAreaList = normaliseProjectAreaList(areasPayload?.areas || []);
  const projectAreaBaselines = Object.fromEntries(projectAreaList.map((area) => [area.id, area]));
  const projectSurveys = Array.isArray(scansPayload?.surveys) && scansPayload.surveys.length
    ? scansPayload.surveys
    : (baseProject?.surveys || []);
  const overridesPayload = await fetchOptionalJson(projectDataPath(projectId, "survey-area-overrides.json"));
  const volumeChangePayload = await fetchOptionalJson(projectDataPath(projectId, "volume-change.json"));

  const mergedProject = {
    ...(baseProject || {}),
    ...projectMeta,
    id: projectMeta?.id || baseProject?.id || projectId,
    site: {
      ...(baseProject?.site || {}),
      ...(projectMeta?.site || {})
    },
    programme: {
      ...(baseProject?.programme || {}),
      ...(projectMeta?.programme || {})
    },
    surveys: projectSurveys,
    workflow: Array.isArray(projectMeta?.workflow) && projectMeta.workflow.length
      ? projectMeta.workflow
      : (baseProject?.workflow || []),
    branding: {
      ...(projectMeta?.branding || {})
    },
    content: contentPayload || projectMeta?.content || {},
    surveyAreaOverrides: overridesPayload?.surveyAreaOverrides || baseProject?.surveyAreaOverrides || {},
    volumeChangeComparisons: volumeChangePayload?.volumeChangeComparisons || baseProject?.volumeChangeComparisons || {},
    projectAreaList,
    projectAreaBaselines,
    singleScanMessage: projectMeta?.singleScanMessage || "Change monitoring will become available after the second comparable survey."
  };

  return { projects: [mergedProject] };
}

function normaliseProjectAreaList(areasList) {
  return areasList.map((area, index) => {
    const inferredNumber = Number(area.number || String(area.id || "").replace(/\D+/g, "")) || (index + 1);
    return {
      ...area,
      id: area.id || `${areaSettings.idPrefix}${inferredNumber}`,
      number: inferredNumber,
      overviewCode: area.overviewCode || `${areaSettings.codePrefix}${inferredNumber}`
    };
  });
}

function applyUrlState() {
  const params = new URLSearchParams(window.location.search);
  const project = currentProject();
  const surveyId = params.get("survey") || params.get("surveyId");
  const defaultSurvey = project.surveys[project.surveys.length - 1];
  const survey = project.surveys.find((item) => item.id === surveyId) || defaultSurvey;
  state.surveyId = survey.id;
  state.primarySurveyId = state.surveyId;
  state.secondarySurveyId = preferredSecondarySurveyId();

  const areaId = normaliseAreaId(params.get("area") || params.get("areaId"));
  const area = areas().find((item) => item.id === areaId) || areas()[0];
  state.areaId = area.id;

  const sectionId = normaliseSectionId(params.get("section") || params.get("sectionId"));
  const section = area.sections.find((item) => item.id === sectionId) || area.sections[0];
  state.sectionId = section.id;

  const requestedTab = params.get("tab") || params.get("view");
  const inferredTab = sectionId ? "sections" : areaId ? "areas" : state.activeTab;
  const allowedTabs = new Set(projectNavigationTabs(project));
  const tab = allowedTabs.has(requestedTab) ? requestedTab : inferredTab;
  state.activeTab = (!adminToolsEnabled() || !state.adminMode) && tab === "admin" ? "overview" : tab;
  const overviewMode = params.get("mode");
  if (["information", "survey", "help"].includes(overviewMode)) {
    state.overviewMode = overviewMode;
  }
  state.sectionComparisonSurveyIds = defaultSectionComparisonSurveyIds();
}

function syncUrlState() {
  if (!state.dataset) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  ["tab", "view", "survey", "surveyId", "area", "areaId", "section", "sectionId", "mode"].forEach((key) => {
    params.delete(key);
  });
  params.set("tab", state.activeTab);
  params.set("survey", state.surveyId);
  params.set("area", state.areaId);
  params.set("section", state.sectionId);
  if (state.activeTab === "overview" && state.overviewMode !== "information") {
    params.set("mode", state.overviewMode);
  }

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash || ""}`;
  window.history.replaceState(null, "", nextUrl);
}

function publicProjectUrl() {
  const canonicalHref = document.querySelector("link[rel='canonical']")?.href;
  const configuredBase = projectConfig.deployment?.publicBaseUrl || canonicalHref || window.location.href;
  const shareUrl = new URL(configuredBase, window.location.href);
  shareUrl.search = "";
  shareUrl.hash = "";
  shareUrl.searchParams.set("tab", state.activeTab);
  shareUrl.searchParams.set("survey", state.surveyId);
  shareUrl.searchParams.set("area", state.areaId);
  shareUrl.searchParams.set("section", state.sectionId);
  if (state.activeTab === "overview" && state.overviewMode !== "information") {
    shareUrl.searchParams.set("mode", state.overviewMode);
  }
  return shareUrl.toString();
}

function normaliseAreaId(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(?:area|a)?(\d+)$/i);
  if (!match) {
    return text;
  }
  return `area${Number(match[1])}`;
}

function bindEvents() {
  els.surveySelect.addEventListener("change", () => {
    state.surveyId = els.surveySelect.value;
    state.primarySurveyId = state.surveyId;
    state.secondarySurveyId = preferredSecondarySurveyId();
    state.sectionComparisonSurveyIds = mergeSectionComparisonSurveyIds(defaultSectionComparisonSurveyIds(), state.sectionComparisonSurveyIds);
    resetView();
    renderShellStage();
    renderOverview();
    renderWeather();
    renderLayers();
    renderSections();
    renderAdminIfEnabled();
    syncUrlState();
  });

  els.primaryCompareSelect.addEventListener("change", () => {
    state.primarySurveyId = els.primaryCompareSelect.value;
    resetView();
    renderLayers();
  });

  els.secondaryCompareSelect.addEventListener("change", () => {
    state.secondarySurveyId = els.secondaryCompareSelect.value;
    resetView();
    renderLayers();
  });

  els.primaryLayerCompareSelect.addEventListener("change", () => {
    state.primaryLayerKey = els.primaryLayerCompareSelect.value;
    state.layerKey = state.primaryLayerKey;
    resetView();
    renderLayers();
  });

  els.secondaryLayerCompareSelect.addEventListener("change", () => {
    state.secondaryLayerKey = els.secondaryLayerCompareSelect.value;
    resetView();
    renderLayers();
  });

  els.compareModeControls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-compare-mode]");
    if (!button || button.disabled) {
      return;
    }
    state.compareMode = button.dataset.compareMode;
    resetView();
    renderLayers();
  });

  els.primaryOpacityRange.addEventListener("input", () => {
    state.primaryOpacity = Number(els.primaryOpacityRange.value) / 100;
    applyViewerOpacities();
  });

  els.secondaryOpacityRange.addEventListener("input", () => {
    state.secondaryOpacity = Number(els.secondaryOpacityRange.value) / 100;
    applyViewerOpacities();
  });

  els.toggleGuideDsm.addEventListener("change", () => {
    state.showGuideDsm = els.toggleGuideDsm.checked;
    renderLayers();
  });

  els.toggleGuideContours.addEventListener("change", () => {
    state.showGuideContours = els.toggleGuideContours.checked;
    renderLayers();
  });

  els.toggleChangeHighlight.addEventListener("change", () => {
    state.showChangeHighlight = els.toggleChangeHighlight.checked;
    if (state.showChangeHighlight) {
      state.compareMode = "single";
      state.secondaryLayerKey = state.primaryLayerKey;
      if (state.primarySurveyId === state.secondarySurveyId) {
        state.secondarySurveyId = preferredSecondarySurveyId();
      }
    }
    renderLayers();
  });

  els.areaSelect.addEventListener("change", () => updateArea(els.areaSelect.value));
  els.overviewInfoBtn.addEventListener("click", () => {
    state.overviewMode = "information";
    state.overviewIndexOpen = false;
    renderOverview();
    syncUrlState();
  });

  els.overviewSurveyBtn.addEventListener("click", () => {
    state.overviewMode = "survey";
    state.overviewIndexOpen = false;
    renderOverview();
    syncUrlState();
  });

  els.overviewHelpBtn.addEventListener("click", () => {
    state.overviewMode = "help";
    state.overviewIndexOpen = false;
    renderOverview();
    syncUrlState();
  });

  els.overviewIndexBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    state.overviewIndexOpen = !state.overviewIndexOpen;
    renderOverview();
  });

  document.addEventListener("click", (event) => {
    if (!state.overviewIndexOpen) return;
    if (els.overviewIndexMenu?.contains(event.target) || els.overviewIndexBtn?.contains(event.target)) return;
    state.overviewIndexOpen = false;
    renderOverview();
  });

  window.addEventListener("message", (event) => {
    if (event.data?.type !== "weather-dashboard-height") return;
    if (!Number.isFinite(event.data.height) || !els.weatherFrame) return;
    const nextHeight = Math.max(980, Math.ceil(event.data.height) + 8);
    if (Math.abs(nextHeight - state.weatherFrameHeight) < 24) return;
    state.weatherFrameHeight = nextHeight;
    els.weatherFrame.style.height = `${nextHeight}px`;
  });

  els.sectionSelect.addEventListener("change", () => {
    state.sectionId = els.sectionSelect.value;
    state.sectionHoverDistance = null;
    renderSections();
    syncUrlState();
  });

  els.sectionOrthoBtn.addEventListener("click", () => {
    state.sectionBasemap = "ortho";
    renderSections();
  });

  els.sectionDsmBtn.addEventListener("click", () => {
    state.sectionBasemap = "dsm";
    renderSections();
  });

  els.viewerFullscreenBtn.addEventListener("click", toggleViewerFullscreen);
  els.sectionFullscreenBtn.addEventListener("click", toggleSectionFullscreen);
  els.sectionDetails.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-section-insight]");
    if (!trigger) {
      return;
    }
    openSectionInsightOverlay(
      trigger.dataset.sectionInsightEyebrow || "Section Insight",
      trigger.dataset.sectionInsightTitle || "Insight",
      trigger.dataset.sectionInsightSummary || "",
      trigger.dataset.sectionInsightBody || ""
    );
  });
  els.sectionInsightOverlayClose.addEventListener("click", closeSectionInsightOverlay);
  els.sectionInsightOverlayBackdrop.addEventListener("click", closeSectionInsightOverlay);
  const handleVolumeLightboxTrigger = (event) => {
    const trigger = event.target.closest("[data-volume-lightbox-src]");
    if (!trigger) {
      return;
    }
    openVolumeImageLightbox(
      trigger.dataset.volumeLightboxEyebrow || "Reference map",
      trigger.dataset.volumeLightboxTitle || "Reference image",
      trigger.dataset.volumeLightboxCaption || "",
      trigger.dataset.volumeLightboxSrc || "",
      trigger.dataset.volumeLightboxAlt || trigger.dataset.volumeLightboxTitle || "Reference image",
      trigger.dataset.volumeLightboxLegend === "trend-map" ? state.volumeLightboxLegendItems : [],
      Number.parseFloat(trigger.dataset.volumeLightboxRotation || "0") || 0
    );
  };
  const handleVolumeAreaTrigger = (event) => {
    const trigger = event.target.closest("[data-volume-area]");
    if (!trigger) {
      return;
    }
    updateArea(trigger.dataset.volumeArea);
    activateTab("volume");
  };
  els.volumeImageryGrid?.addEventListener("click", handleVolumeLightboxTrigger);
  els.volumeTrendBody?.addEventListener("click", handleVolumeLightboxTrigger);
  els.volumeTrendBody?.addEventListener("click", handleVolumeAreaTrigger);
  els.volumeQuickAreas?.addEventListener("click", handleVolumeAreaTrigger);
  els.volumeImageLightboxClose?.addEventListener("click", closeVolumeImageLightbox);
  els.volumeImageLightboxBackdrop?.addEventListener("click", closeVolumeImageLightbox);
  els.volumeImageLightboxZoomIn?.addEventListener("click", () => setVolumeImageLightboxZoom(state.volumeLightboxZoom * 1.2));
  els.volumeImageLightboxZoomOut?.addEventListener("click", () => setVolumeImageLightboxZoom(state.volumeLightboxZoom / 1.2));
  els.volumeImageLightboxReset?.addEventListener("click", () => setVolumeImageLightboxZoom(1));
  els.volumeImageLightboxViewport?.addEventListener("wheel", (event) => {
    if (els.volumeImageLightbox?.classList.contains("hidden")) {
      return;
    }
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1.12 : 1 / 1.12;
    setVolumeImageLightboxZoom(state.volumeLightboxZoom * direction);
  }, { passive: false });
  els.volumeImageLightboxViewport?.addEventListener("pointerdown", (event) => {
    if (state.volumeLightboxZoom <= 1 || !els.volumeImageLightboxViewport) {
      return;
    }
    state.volumeLightboxIsPanning = true;
    state.volumeLightboxPointerId = event.pointerId;
    state.volumeLightboxStartX = event.clientX;
    state.volumeLightboxStartY = event.clientY;
    state.volumeLightboxStartPanX = state.volumeLightboxPanX;
    state.volumeLightboxStartPanY = state.volumeLightboxPanY;
    els.volumeImageLightboxViewport.setPointerCapture?.(event.pointerId);
    els.volumeImageLightboxViewport.classList.add("is-panning");
    event.preventDefault();
  });
  els.volumeImageLightboxViewport?.addEventListener("pointermove", (event) => {
    if (!state.volumeLightboxIsPanning || state.volumeLightboxPointerId !== event.pointerId) {
      return;
    }
    const nextPanX = state.volumeLightboxStartPanX + (event.clientX - state.volumeLightboxStartX);
    const nextPanY = state.volumeLightboxStartPanY + (event.clientY - state.volumeLightboxStartY);
    setVolumeImageLightboxPan(nextPanX, nextPanY);
  });
  const endVolumeLightboxPan = (event) => {
    if (state.volumeLightboxPointerId !== null && event.pointerId !== state.volumeLightboxPointerId) {
      return;
    }
    if (state.volumeLightboxPointerId !== null && els.volumeImageLightboxViewport?.hasPointerCapture?.(state.volumeLightboxPointerId)) {
      els.volumeImageLightboxViewport.releasePointerCapture(state.volumeLightboxPointerId);
    }
    state.volumeLightboxIsPanning = false;
    state.volumeLightboxPointerId = null;
    els.volumeImageLightboxViewport?.classList.remove("is-panning");
  };
  els.volumeImageLightboxViewport?.addEventListener("pointerup", endVolumeLightboxPan);
  els.volumeImageLightboxViewport?.addEventListener("pointercancel", endVolumeLightboxPan);
  els.sectionComparisonSnapshotBtn?.addEventListener("click", () => {
    if (!state.sectionComparisonSnapshot) {
      return;
    }
    openSectionInsightOverlay(
      state.sectionComparisonSnapshot.eyebrow,
      state.sectionComparisonSnapshot.title,
      state.sectionComparisonSnapshot.summary,
      state.sectionComparisonSnapshot.body,
      true
    );
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSectionInsightOverlay();
      closeVolumeImageLightbox();
    }
  });
  document.addEventListener("fullscreenchange", () => {
    updateViewerFullscreenButton();
    updateSectionFullscreenButton();
  });

  els.tabs.addEventListener("click", (event) => {
    const tab = event.target.closest(".tab");
    if (!tab) return;
    activateTab(tab.dataset.tab);
    if (tab.dataset.tab === "weather") {
      renderWeather();
    }
    updateBackToTopVisibility();
  });

  els.backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });

  els.uploadSelectedFiles.addEventListener("click", () => {
    uploadSelectedFiles();
  });

  els.createSurveyBtn.addEventListener("click", () => {
    createSurveyRound();
  });

  els.saveAreaMetadataBtn.addEventListener("click", () => {
    saveAreaMetadata();
  });

  els.resetAreaMetadataBtn.addEventListener("click", () => {
    resetAreaMetadata();
  });

  els.saveVolumeBtn.addEventListener("click", () => {
    saveVolumeChange();
  });

  els.createAccessUserBtn?.addEventListener("click", () => {
    createAccessUser();
  });

  els.accessUsersGrid?.addEventListener("click", (event) => {
    const updateButton = event.target.closest("[data-access-update]");
    if (updateButton) {
      updateAccessUser(updateButton.dataset.accessUpdate);
      return;
    }
    const deleteButton = event.target.closest("[data-access-delete]");
    if (deleteButton) {
      deleteAccessUser(deleteButton.dataset.accessDelete);
    }
  });

  els.adminModeToggle.addEventListener("click", () => {
    toggleAdminMode();
  });

  els.signOutBtn?.addEventListener("click", () => {
    signOut();
  });

  els.zoomInBtn.addEventListener("click", () => zoom(1.15));
  els.zoomOutBtn.addEventListener("click", () => zoom(1 / 1.15));
  els.resetViewBtn.addEventListener("click", resetView);

    [els.viewerBaseImage, els.viewerOverlayImage, els.viewerSliderImage].forEach((image) => {
      image.addEventListener("load", applyViewTransform);
    });

    [els.sectionBaseImage, els.sectionOverlayImage].forEach((image) => {
      image.addEventListener("load", () => {
        positionSectionHotspots();
        if (state.sectionArea && state.sectionRows?.length) {
          const section = state.sectionArea.sections.find((item) => item.id === state.sectionId) || state.sectionArea.sections[0];
          updateSectionMapMarker(state.sectionRows, section, state.sectionHoverDistance);
        }
      });
    });

    window.addEventListener("resize", () => {
      positionSectionHotspots();
      if (state.sectionArea && state.sectionRows?.length) {
        const section = state.sectionArea.sections.find((item) => item.id === state.sectionId) || state.sectionArea.sections[0];
        updateSectionMapMarker(state.sectionRows, section, state.sectionHoverDistance);
      }
    });

  els.viewerStage.addEventListener("pointerdown", (event) => {
    if (state.activeTouchGesture) {
      return;
    }
    if (event.target.closest("#transparencyControls")) {
      return;
    }
    state.viewerPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (state.viewerPointers.size === 2) {
      beginViewerPinch();
      event.preventDefault();
      return;
    }
    if (state.compareMode === "slider") {
      const handleRect = els.sliderHandle.getBoundingClientRect();
      const insideHandle = event.clientX >= handleRect.left && event.clientX <= handleRect.right
        && event.clientY >= handleRect.top && event.clientY <= handleRect.bottom;
      if (insideHandle || state.scale <= 1) {
        state.isDraggingSwipe = true;
        state.activeViewerPointerId = event.pointerId;
        event.target.setPointerCapture?.(event.pointerId);
        event.preventDefault();
        updateSwipeFromClientX(event.clientX);
        return;
      }
    }
    if (state.scale <= 1) {
      return;
    }
    state.isPanning = true;
    state.activeViewerPointerId = event.pointerId;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.startPanX = state.panX;
    state.startPanY = state.panY;
    event.target.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    applyViewTransform();
  });

  els.viewerStage.addEventListener("pointermove", (event) => {
    if (state.activeTouchGesture) {
      return;
    }
    if (state.viewerPointers.has(event.pointerId)) {
      state.viewerPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    if (state.viewerPointers.size >= 2 && state.pinchStartDistance) {
      updateViewerPinch();
      event.preventDefault();
      return;
    }
    if (state.activeViewerPointerId !== null && event.pointerId !== state.activeViewerPointerId) {
      return;
    }
    if (state.isDraggingSwipe) {
      event.preventDefault();
      updateSwipeFromClientX(event.clientX);
      return;
    }
    if (!state.isPanning) {
      return;
    }
    event.preventDefault();
    state.panX += event.clientX - state.startX;
    state.panY += event.clientY - state.startY;
    state.startX = event.clientX;
    state.startY = event.clientY;
    applyViewTransform();
  });

  const endPointerInteraction = (event) => {
    if (state.activeTouchGesture) {
      return;
    }
    state.viewerPointers.delete(event.pointerId);
    if (state.viewerPointers.size < 2) {
      state.pinchStartDistance = null;
      state.pinchStartCenter = null;
      state.pinchStageCenter = null;
    }
    if (state.activeViewerPointerId !== null && event.pointerId !== state.activeViewerPointerId) {
      return;
    }
    if (els.viewerStage.hasPointerCapture?.(event.pointerId)) {
      els.viewerStage.releasePointerCapture(event.pointerId);
    }
    if (els.sliderHandle.hasPointerCapture?.(event.pointerId)) {
      els.sliderHandle.releasePointerCapture(event.pointerId);
    }
    state.isPanning = false;
    state.isDraggingSwipe = false;
    state.activeViewerPointerId = null;
    applyViewTransform();
  };

  els.viewerStage.addEventListener("pointerup", endPointerInteraction);
  els.viewerStage.addEventListener("pointercancel", endPointerInteraction);
  els.viewerStage.addEventListener("dblclick", resetView);
  els.viewerStage.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoom(event.deltaY < 0 ? 1.08 : 1 / 1.08);
  }, { passive: false });

  els.viewerStage.addEventListener("touchstart", handleViewerTouchStart, { passive: false });
  els.viewerStage.addEventListener("touchmove", handleViewerTouchMove, { passive: false });
  els.viewerStage.addEventListener("touchend", handleViewerTouchEnd, { passive: false });
  els.viewerStage.addEventListener("touchcancel", handleViewerTouchEnd, { passive: false });
}

function renderAll() {
  syncProjectTabAvailability();
  renderShellToolbar();
  fillSelect(els.surveySelect, currentProject().surveys.map((survey) => [survey.id, survey.label]), state.surveyId);
  fillSelect(els.areaSelect, areaSelectOptions(), state.areaId);
  fillSelect(els.sectionSelect, currentArea().sections.map((section) => [section.id, section.label]), state.sectionId);
  syncAdminVisibility();
  renderShellStage();
  renderOverview();
  renderAreas();
  renderWeather();
  renderPanorama();
  renderVolume();
  renderLayers();
  renderSections();
  renderAdminIfEnabled();
  renderWorkflow();
}

function renderShellToolbar() {
  const areaSelectEnabled = AREA_ENABLED_TOOLBAR_TABS.has(state.activeTab);
  const areaField = document.querySelector(".shell-toolbar__field--area");

  els.surveySelect.disabled = false;
  els.surveySelect.setAttribute("aria-disabled", "false");
  els.areaSelect.disabled = !areaSelectEnabled;
  els.areaSelect.setAttribute("aria-disabled", String(!areaSelectEnabled));

  document.querySelector(".shell-toolbar")?.classList.toggle("shell-toolbar--inactive", !areaSelectEnabled);
  areaField?.classList.toggle("hidden", !areaSelectEnabled);
}

function projectNavigationTabs(project = currentProject()) {
  const configuredTabs = Array.isArray(project?.navigation?.tabs) ? project.navigation.tabs : DEFAULT_TABS;
  const allowedTabs = configuredTabs.filter((tab) => VALID_TABS.has(tab));
  return allowedTabs.length ? allowedTabs : DEFAULT_TABS;
}

function firstAvailableProjectTab() {
  return projectNavigationTabs()[0] || "overview";
}

function syncProjectTabAvailability() {
  const allowedTabs = new Set(projectNavigationTabs());

  document.querySelectorAll(".tab").forEach((item) => {
    item.classList.toggle("hidden", !allowedTabs.has(item.dataset.tab));
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("hidden", !allowedTabs.has(panel.dataset.panel));
  });

  if (!allowedTabs.has(state.activeTab)) {
    state.activeTab = allowedTabs.has("overview") ? "overview" : firstAvailableProjectTab();
  }
}

async function renderShellStage() {
  const project = currentProject();
  const survey = currentSurvey();
  const area = currentArea();
  const activeTabMeta = activeTabShellMeta();
  const shellRoot = document.querySelector(".shell");
  const overviewHeroTabs = new Set(["overview", "areas", "weather"]);
  const stageSurvey = survey;
  const areaHeroEnabled = AREA_ENABLED_TOOLBAR_TABS.has(state.activeTab);
  const configuredAreaHero = configuredAreaHeroImage(survey.id, area.id);
  const useOverviewHero = overviewHeroTabs.has(state.activeTab) || (!configuredAreaHero && areaHeroEnabled);
  const configuredOverviewImage = configuredOverviewHeroImage(stageSurvey?.id || survey.id);
  const configuredAreaHeroDirection = configuredAreaHeroArtDirection(survey.id, area.id);
  if (shellRoot) {
    shellRoot.dataset.activeTab = state.activeTab;
    shellRoot.dataset.stageVisual = areaHeroEnabled && configuredAreaHero
      ? "area-hero"
      : useOverviewHero
        ? "overview-hero"
        : "none";
    shellRoot.dataset.heroArea = areaHeroEnabled && configuredAreaHero ? area.id : "";
    shellRoot.style.removeProperty("--area-hero-image-position");
    shellRoot.style.removeProperty("--area-hero-image-scale");
    shellRoot.style.removeProperty("--area-hero-backdrop-opacity");
    shellRoot.style.removeProperty("--area-hero-backdrop-blur");
    shellRoot.style.removeProperty("--area-hero-backdrop-scale");
    if (areaHeroEnabled && configuredAreaHero && configuredAreaHeroDirection) {
      if (configuredAreaHeroDirection.position) {
        shellRoot.style.setProperty("--area-hero-image-position", configuredAreaHeroDirection.position);
      }
      if (Number.isFinite(configuredAreaHeroDirection.scale)) {
        shellRoot.style.setProperty("--area-hero-image-scale", String(configuredAreaHeroDirection.scale));
      }
      if (Number.isFinite(configuredAreaHeroDirection.backdropOpacity)) {
        shellRoot.style.setProperty("--area-hero-backdrop-opacity", String(configuredAreaHeroDirection.backdropOpacity));
      }
      if (Number.isFinite(configuredAreaHeroDirection.backdropBlur)) {
        shellRoot.style.setProperty("--area-hero-backdrop-blur", `${configuredAreaHeroDirection.backdropBlur}px`);
      }
      if (Number.isFinite(configuredAreaHeroDirection.backdropScale)) {
        shellRoot.style.setProperty("--area-hero-backdrop-scale", String(configuredAreaHeroDirection.backdropScale));
      }
    }
  }

  els.shellStageEyebrow.textContent = activeTabMeta.eyebrow;
  els.shellStageTitle.textContent = activeTabMeta.title;
  els.shellStageSummary.textContent = activeTabMeta.summary;
  renderShellStageAction(stageSurvey);
  const useSummaryDock = ["volume", "layers", "sections"].includes(state.activeTab) && ["area1", "area3", "area4", "area7", "area8"].includes(area.id);
  if (els.shellStageSummaryDock) {
    els.shellStageSummaryDock.textContent = activeTabMeta.summary;
    els.shellStageSummaryDock.classList.toggle("hidden", !useSummaryDock);
    els.shellStageSummaryDock.setAttribute("aria-hidden", String(!useSummaryDock));
  }
  els.shellStageSummary.classList.toggle("hidden", useSummaryDock);
  els.shellStageSurvey.innerHTML = `
      <span class="shell-stage-pill__label">Survey Dates</span>
      <strong class="shell-stage-pill__value">${escapeHtml(shellStageSurveyLabel(project, stageSurvey, state.activeTab))}</strong>
    `;
  els.shellStageArea.innerHTML = `
    <span class="shell-stage-pill__label">Survey Area</span>
    <strong class="shell-stage-pill__value">${escapeHtml(`${area.overviewCode} - ${area.label}`)}</strong>
    <span class="shell-stage-pill__sub">${escapeHtml(area.zone)}</span>
  `;
  els.shellStageArea.classList.toggle("hidden", !(areaHeroEnabled && configuredAreaHero));

  if (useOverviewHero) {
    els.shellStageVisual.style.removeProperty("--shell-stage-visual-bg");
    const overviewImage = configuredOverviewImage || await resolveExistingAsset(
      surveyAssetCandidates(project.id, survey.id, area.id, "ortho.jpg")
    );
    if (overviewImage) {
      els.shellStageVisualImage.src = overviewImage;
      els.shellStageVisualImage.alt = `${project.name} overview aerial image`;
      els.shellStageVisual.classList.remove("hidden");
      els.shellStageVisual.setAttribute("aria-hidden", "false");
    } else {
      els.shellStageVisual.classList.add("hidden");
      els.shellStageVisual.setAttribute("aria-hidden", "true");
    }
  } else if (areaHeroEnabled && configuredAreaHero) {
    els.shellStageVisual.style.setProperty(
      "--shell-stage-visual-bg",
      `url("${configuredAreaHero.replace(/"/g, '\\"')}")`
    );
    els.shellStageVisualImage.src = configuredAreaHero;
    els.shellStageVisualImage.alt = `${project.name} ${area.label} area model`;
    els.shellStageVisual.classList.remove("hidden");
    els.shellStageVisual.setAttribute("aria-hidden", "false");
  } else {
    els.shellStageVisual.style.removeProperty("--shell-stage-visual-bg");
    els.shellStageVisual.classList.add("hidden");
    els.shellStageVisual.setAttribute("aria-hidden", "true");
  }
}

function configuredAreaHeroImage(surveyId, areaId) {
  return currentProjectBranding()?.areaHeroImagesBySurvey?.[surveyId]?.[areaId] || "";
}

function configuredAreaHeroArtDirection(surveyId, areaId) {
  return currentProjectBranding()?.areaHeroArtDirectionBySurvey?.[surveyId]?.[areaId] || null;
}

function configuredOverviewHeroImage(surveyId) {
  return currentProjectBranding()?.overviewHeroImagePathBySurvey?.[surveyId]
    || currentProjectBranding()?.overviewHeroImagePath
    || "";
}

function configuredSurveyModelUrl(surveyId) {
  return String(currentProjectBranding()?.niraModelsBySurvey?.[surveyId] || "").trim();
}

function currentProjectBranding() {
  return currentProject()?.branding || {};
}

function currentProjectContent() {
  return currentProject()?.content || {};
}

function currentProjectEnvironment() {
  return currentProject()?.environment || {};
}

function renderShellStageAction(survey) {
  if (!els.shellStageAction) {
    return;
  }
  const shouldShowAction = SURVEY_MODEL_TABS.has(state.activeTab);
  const modelUrl = configuredSurveyModelUrl(survey?.id);
  if (!shouldShowAction) {
    els.shellStageAction.innerHTML = "";
    els.shellStageAction.classList.add("hidden");
    els.shellStageAction.setAttribute("aria-hidden", "true");
    return;
  }
  if (modelUrl) {
    els.shellStageAction.innerHTML = `
      <a
        class="shell-stage-action-link"
        href="${escapeAttr(modelUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="shell-stage-action-link__label">Open 3D Model</span>
        <span class="shell-stage-action-link__sub">${escapeHtml(`Open the DJI Terra model for ${survey.shortDate || survey.label} in Nira.`)}</span>
      </a>
    `;
  } else {
    els.shellStageAction.innerHTML = `
      <div class="shell-stage-action-link shell-stage-action-link--disabled" aria-disabled="true">
        <span class="shell-stage-action-link__label">3D Model Coming Soon</span>
        <span class="shell-stage-action-link__sub">${escapeHtml(`The 3D model for ${survey.shortDate || survey.label} is not available here yet.`)}</span>
      </div>
    `;
  }
  els.shellStageAction.classList.remove("hidden");
  els.shellStageAction.setAttribute("aria-hidden", "false");
}

function activeTabShellMeta() {
  const project = currentProject();
  const survey = currentSurvey();
  const area = currentArea();
  const section = currentArea().sections.find((item) => item.id === state.sectionId) || currentArea().sections[0];
  const projectSiteName = project.site?.name || currentProjectEnvironment().defaultLocationName || "the monitoring area";
  const projectShortName = project.shortName || project.name || "Monitoring Project";

  const metaByTab = {
    overview: {
      eyebrow: projectShortName,
      title: "Monitoring System",
      summary: `Visual change monitoring for ${projectSiteName}.`
    },
    areas: {
      eyebrow: "Monitoring Areas",
      title: "Explore Areas",
      summary: `Move through ${area.label} and jump into imagery, section profiles, and tracked change from one monitoring area at a time.`
    },
    weather: {
      eyebrow: "Environmental Context",
      title: "Survey Conditions",
      summary: "Weather, tide, and timing context help explain what the landscape was doing when this survey round was captured."
    },
    panorama: {
      eyebrow: "Immersive Area Tour",
      title: "Panorama Viewer",
      summary: `Open a hosted 360 tour for ${area.label} so clients can look around the area directly and, where available, move back through time inside the same experience.`
    },
    volume: {
      eyebrow: "Change Reporting",
      title: "Change Metrics",
      summary: "Quantified change sits beside the imagery so clients can move quickly from visible change to measured change."
    },
    layers: {
      eyebrow: "Image Comparison",
      title: "Compare Change",
      summary: "Switch survey dates, compare layers, and inspect visible landscape change in the main viewing stage."
    },
    sections: {
      eyebrow: "Section Profiles",
      title: "Section Profiles",
      summary: `Follow ${section.label} through ${area.label} to inspect repeatable profile readings along the same fixed line through time.`
    },
    admin: {
      eyebrow: "Internal Tools",
      title: "Admin Tools",
      summary: "Internal upload, intake, and survey management tools for preparing monitoring data behind the client-facing experience."
    }
  };

  return metaByTab[state.activeTab] || metaByTab.overview;
}

function shellStageSurveyLabel(project, survey, activeTab = state.activeTab) {
  if (["overview", "areas", "weather"].includes(activeTab)) {
    return formatOverviewSurveyDate(survey);
  }
  if (AREA_ENABLED_TOOLBAR_TABS.has(activeTab)) {
    return survey.shortDate || survey.label;
  }
  const comparisonSurvey = activeComparisonSurvey(project, survey);
  if (!comparisonSurvey) {
    return survey.shortDate || survey.label;
  }
  return `${comparisonSurvey.shortDate || comparisonSurvey.label} vs ${survey.shortDate || survey.label}`;
}

function formatOverviewSurveyDate(survey) {
  const start = String(survey?.dateFrom || "").trim();
  const end = String(survey?.dateTo || "").trim();
  if (!start) {
    return survey?.shortDate || survey?.label || "";
  }
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = end ? new Date(`${end}T12:00:00`) : null;
  if (Number.isNaN(startDate.getTime())) {
    return survey?.shortDate || survey?.label || "";
  }
  const month = startDate.toLocaleString("en-GB", { month: "long" });
  const year = startDate.getFullYear();
  const startDay = startDate.getDate();
  const endDay = endDate && !Number.isNaN(endDate.getTime()) ? endDate.getDate() : null;
  if (endDay && endDay !== startDay) {
    return `${startDay}-${endDay} ${month} ${year}`;
  }
  return `${startDay} ${month} ${year}`;
}

function latestSurvey(project = currentProject()) {
  return [...(project?.surveys || [])]
    .sort((left, right) => String(left.dateFrom || "").localeCompare(String(right.dateFrom || "")))
    .at(-1) || project?.surveys?.[0];
}

async function renderOverview() {
  const project = currentProject();
  const survey = currentSurvey();
  const overviewMode = getOverviewModePayload(project);
  els.projectTitle.textContent = project.name;
  els.projectSummary.textContent = project.description;
  document.title = project.name || projectConfig.productName;
  const stageBrand = byId("shellStageBrandName");
  if (stageBrand) {
    stageBrand.textContent = project.shortName || project.name || projectConfig.productName;
  }
  els.overviewHeroTitle.textContent = overviewMode.heroTitle;
  els.overviewHeroText.textContent = overviewMode.heroText;
  els.overviewStoryTitle.textContent = overviewMode.storyTitle;
  els.overviewContentsTitle.textContent = "Contents";
  els.overviewContentsLead.textContent = overviewMode.contentsSubtext;
  els.overviewContentsSubtext.textContent = overviewMode.contentsSubtext;
  els.overviewInfoBtn.classList.toggle("active", state.overviewMode === "information");
  els.overviewSurveyBtn.classList.toggle("active", state.overviewMode === "survey");
  els.overviewHelpBtn.classList.toggle("active", state.overviewMode === "help");
  els.overviewIndexBtn.classList.toggle("active", state.overviewIndexOpen);
  els.overviewIndexBtn.setAttribute("aria-expanded", state.overviewIndexOpen ? "true" : "false");
  els.overviewIndexMenu.classList.toggle("hidden", !state.overviewIndexOpen);
  els.overviewIndexMenu.setAttribute("aria-hidden", state.overviewIndexOpen ? "false" : "true");

  setOverviewGlance(overviewMode.glance);

  els.overviewContentsGrid.innerHTML = overviewMode.story.map((item, index) => `
    <button class="overview-index-item" type="button" data-story-target="${escapeHtml(item.id || `section-${index + 1}`)}">
      <span class="overview-index-item__number">Section ${String(index + 1).padStart(2, "0")}</span>
      <span class="overview-index-item__title">${escapeHtml(item.title)}</span>
    </button>
  `).join("");
  els.overviewContentsGrid.querySelectorAll("[data-story-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.storyTarget;
      state.overviewIndexOpen = false;
      renderOverview();
      requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  els.overviewStory.innerHTML = overviewMode.story.map((item, index) => `
    <article id="${escapeHtml(item.id || `section-${index + 1}`)}" class="card overview-story-card">
      <p class="eyebrow">Section ${String(index + 1).padStart(2, "0")}</p>
      <h3>${escapeHtml(item.title)}</h3>
      ${item.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </article>
  `).join("");

  els.overviewAreasSubtext.textContent = `The monitoring programme currently covers ${areas().length} mapped areas across ${project.site.name}.`;
  const overviewAreas = areas();
  els.overviewAreaFilters.innerHTML = [
    `<button class="chip ${state.overviewAreaFilter === "all" ? "active" : ""}" type="button" data-overview-filter="all">All areas</button>`,
    `<button class="chip ${state.overviewAreaFilter === "day1" ? "active" : ""}" type="button" data-overview-filter="day1">Day 1</button>`,
    `<button class="chip ${state.overviewAreaFilter === "day2" ? "active" : ""}" type="button" data-overview-filter="day2">Day 2</button>`,
    `<button class="chip ${state.overviewAreaFilter === "lowtide" ? "active" : ""}" type="button" data-overview-filter="lowtide">Closest to low tide</button>`,
    ...overviewAreas.map((area, index) => `<button class="chip ${state.overviewAreaFilter === area.id ? "active" : ""}" type="button" data-overview-filter="${escapeHtml(area.id)}">A${index + 1}</button>`)
  ].join("");
  els.overviewAreaFilters.querySelectorAll("[data-overview-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.overviewAreaFilter = button.dataset.overviewFilter;
      renderOverview();
    });
  });

  let filteredOverviewAreas = overviewAreas;
  if (state.overviewAreaFilter === "day1" || state.overviewAreaFilter === "day2") {
    filteredOverviewAreas = overviewAreas.filter((area) => area.filterKey === state.overviewAreaFilter);
  } else if (state.overviewAreaFilter === "lowtide") {
    filteredOverviewAreas = [...overviewAreas].sort((a, b) => Math.abs(a.midOffsetMinutes) - Math.abs(b.midOffsetMinutes));
  } else if (state.overviewAreaFilter !== "all") {
    filteredOverviewAreas = overviewAreas.filter((area) => area.id === state.overviewAreaFilter);
  }

  els.overviewAreaGrid.innerHTML = filteredOverviewAreas.map((area, index) => `
    <article class="card overview-area-card overview-area-card--${area.statusTone || overviewAreaTone(area.id, index)}">
      <div class="overview-area-card__top">
        <div>
          <p class="eyebrow">${escapeHtml(area.overviewCode)} - ${escapeHtml(area.day)}</p>
          <h3>${escapeHtml(area.label)}</h3>
        </div>
        <span class="overview-area-pill overview-area-pill--${escapeHtml(area.statusTone || "cyan")}">${escapeHtml(area.statusLabel)}</span>
      </div>
      <p class="overview-area-card__summary">${escapeHtml(area.summary)}</p>
      <div class="overview-area-card__stats">
        <div><span class="muted">Flight window</span><strong>${escapeHtml(area.start)}-${escapeHtml(area.finish)}</strong></div>
        <div><span class="muted">Area size</span><strong>${escapeHtml(area.size)}</strong></div>
        <div><span class="muted">Low tide relationship</span><strong>${escapeHtml(area.launchOffset)}</strong></div>
        <div><span class="muted">Tidal window</span><strong>${escapeHtml(area.tideWindow)}</strong></div>
      </div>
      <div class="overview-area-timeline">
        <div class="overview-area-timeline__labels">
          <span>Earlier</span>
          <span>Low tide</span>
          <span>Later</span>
        </div>
        <div class="overview-area-timeline__track">
          <div class="overview-area-timeline__marker" style="left:${timelineMarkerPosition(area.midOffsetMinutes)}%"></div>
        </div>
        <p class="overview-area-timeline__caption">Marker based on mid-flight position in relation to the low-tide window.</p>
      </div>
      <div class="overview-area-tags">
        ${area.tags.map((tag) => `<span class="overview-tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="overview-area-card__footer">
        <span>${escapeHtml(area.cardNote)}</span>
        <button class="overview-area-link" type="button" data-overview-area="${escapeHtml(area.id)}">Open details and compare rounds</button>
      </div>
    </article>
  `).join("");
  els.overviewAreaGrid.querySelectorAll("[data-overview-area]").forEach((button) => {
    button.addEventListener("click", () => {
      updateArea(button.dataset.overviewArea);
      activateTab("areas");
      requestAnimationFrame(() => {
        els.selectedAreaPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  const singleScanOnly = (project.surveys || []).length < 2;
  els.surveyReadinessGrid.innerHTML = [
    metric(
      singleScanOnly ? "Change monitoring" : "Track movement",
      singleScanOnly ? "Awaiting a second comparable survey" : "See where bars and channels shift",
      singleScanOnly ? project.singleScanMessage : "Look for visible movement between one survey and the next."
    ),
    metric("Work by area", "Focus on one stretch of estuary at a time", "Each monitoring area can be explored on its own without losing the bigger picture."),
    metric("Use cross-sections", "Check where the ground rises and falls", "Cross-sections show the shape of the estuary along a fixed line."),
    metric("Use aerial views", "Inspect the estuary closely", "Zoom in on aerial imagery, elevation colour maps, and contour views.")
  ].join("");

  els.surveyReadinessDetails.innerHTML = [
    ...(singleScanOnly ? [detail("Change monitoring status", project.singleScanMessage)] : []),
    detail("What to look for", "Focus on where sandbanks, channels, and exposed ground appear to shift between one survey and the next."),
    detail("Why low tide matters", "The surveys are most useful when more of the estuary bed is exposed, because that is where movement is easiest to see."),
    detail("How this helps", "This gives a clearer picture of what is changing, where access may be affected, and where further attention may be needed.")
  ].join("");

  els.timeline.innerHTML = [
    `<div class="timeline-item"><div><strong>1.</strong></div><div>Start with <strong>Survey Areas</strong> and choose the part of the estuary you want to look at.</div></div>`,
    `<div class="timeline-item"><div><strong>2.</strong></div><div>Open <strong>Compare</strong> to inspect aerial imagery, elevation colour maps, contour views, and visual comparisons in detail.</div></div>`,
    `<div class="timeline-item"><div><strong>3.</strong></div><div>Use <strong>Sections</strong> when you want to understand the height and shape of the ground along a fixed line.</div></div>`,
    `<div class="timeline-item"><div><strong>4.</strong></div><div>Use <strong>Information</strong> and <strong>Help</strong> whenever you want the project story or a plain-English guide.</div></div>`
  ].join("");

  enhanceOverviewGlanceWithConfirmedTides(survey, overviewMode.glance, state.overviewMode);
}

async function enhanceOverviewGlanceWithConfirmedTides(survey, glance = [], overviewMode = state.overviewMode) {
  if (!survey || !Array.isArray(glance) || !glance.length) return;

  const snapshotSurveyId = survey.id;
  const snapshotMode = overviewMode;
  const summary = await confirmedSurveyTideSummary(survey);
  if (!summary) return;

  if (state.surveyId !== snapshotSurveyId || state.overviewMode !== snapshotMode) {
    return;
  }

  const nextGlance = glance.map(([label, value]) => {
    if (label === "High tide reference" && summary.high) {
      return [label, summary.high];
    }
    if (label === "Low tide reference" && summary.low) {
      return [label, summary.low];
    }
    return [label, value];
  });

  setOverviewGlance(nextGlance);
}

async function confirmedSurveyTideSummary(survey) {
  if (!survey?.dateFrom || !survey?.dateTo) return null;
  if (window.location.protocol === "file:") return null;
  if (state.surveyTideSummaryCache.has(survey.id)) {
    return state.surveyTideSummaryCache.get(survey.id);
  }
  if (state.surveyTideSummaryRequests.has(survey.id)) {
    return state.surveyTideSummaryRequests.get(survey.id);
  }

  const request = (async () => {
    try {
      const projectEnvironment = currentProjectEnvironment();
      const url = new URL("/api/tides", window.location.origin);
      url.searchParams.set("start_date", survey.dateFrom);
      url.searchParams.set("end_date", survey.dateTo);
      if (projectEnvironment.tide?.latitude) url.searchParams.set("lat", projectEnvironment.tide.latitude);
      if (projectEnvironment.tide?.longitude) url.searchParams.set("lon", projectEnvironment.tide.longitude);
      if (projectEnvironment.tide?.datum) url.searchParams.set("datum", projectEnvironment.tide.datum);
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Tide lookup failed with status ${response.status}`);
      }
      const payload = await response.json();
      const extremes = (payload.extremes || [])
        .map((item) => ({
          time: item.time,
          value: Number(item.value),
          type: item.type
        }))
        .filter((item) => item.time && Number.isFinite(item.value) && item.type);
      const summary = summariseSurveyTideExtremes(survey, extremes);
      state.surveyTideSummaryCache.set(survey.id, summary);
      return summary;
    } catch (error) {
      console.warn("Could not confirm survey tide summary.", error);
      state.surveyTideSummaryCache.set(survey.id, null);
      return null;
    } finally {
      state.surveyTideSummaryRequests.delete(survey.id);
    }
  })();

  state.surveyTideSummaryRequests.set(survey.id, request);
  return request;
}

function summariseSurveyTideExtremes(survey, extremes = []) {
  const dayKeys = surveyDateKeys(survey);
  if (!dayKeys.length) return null;
  const highs = dayKeys.map((dayKey, index) => formatSurveyDayExtreme(extremes, "High", dayKey, index));
  const lows = dayKeys.map((dayKey, index) => formatSurveyDayExtreme(extremes, "Low", dayKey, index));
  return {
    high: highs.every(Boolean) ? highs.join(" | ") : null,
    low: lows.every(Boolean) ? lows.join(" | ") : null
  };
}

function surveyDateKeys(survey) {
  const start = new Date(`${survey?.dateFrom}T12:00:00`);
  const end = new Date(`${survey?.dateTo || survey?.dateFrom}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return [];
  }
  const keys = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

function formatSurveyDayExtreme(extremes, type, dayKey, index) {
  const item = extremes.find((entry) => entry.type === type && tideDayKey(entry.time) === dayKey);
  if (!item) return null;
  return `${formatTideClock(item.time)} Day ${index + 1} - ${fixed(item.value, 2)} m`;
}

function tideDayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return year && month && day ? `${year}-${month}-${day}` : "";
}

function formatTideClock(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "n/a";
  return date.toLocaleTimeString("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function overviewGlanceForSurvey(surveyId) {
  const surveySpecificGlance = currentProjectContent()?.surveySpecificOverview?.[surveyId]?.glance;
  if (Array.isArray(surveySpecificGlance) && surveySpecificGlance.length) {
    return surveySpecificGlance;
  }

  const survey = currentProject()?.surveys?.find((item) => item.id === surveyId) || currentSurvey();
  if (!survey) {
    return [];
  }

  return [
    ["Survey window", survey.shortDate || survey.label || survey.id],
    ["Status", survey.status || "Survey loaded"],
    ["Readiness", survey.readiness || "Assets linked"],
    ["Comparison baseline", survey.comparisonBaseline || "Baseline round"],
    ["Asset folder", survey.assetFolder || "n/a"],
    ["Data folder", survey.dataFolder || "n/a"]
  ];
}

function setOverviewGlance(glance = []) {
  const rows = Array.isArray(glance) ? glance : [];
  const metricRows = rows.slice(0, 6);

  if (els.metricGrid) {
    els.metricGrid.innerHTML = metricRows.map(([label, value]) => metric(label, value, "")).join("");
  }

  if (!els.overviewGlanceGrid) {
    return;
  }

  if (!rows.length) {
    els.overviewGlanceGrid.innerHTML = "";
    els.overviewGlanceGrid.classList.add("hidden");
    els.overviewGlanceGrid.setAttribute("aria-hidden", "true");
    return;
  }

  els.overviewGlanceGrid.innerHTML = rows.map(([label, value]) => `
    <article class="card overview-glance-card">
      <p class="muted">${escapeHtml(label)}</p>
      <h3>${escapeHtml(value)}</h3>
    </article>
  `).join("");
  els.overviewGlanceGrid.classList.remove("hidden");
  els.overviewGlanceGrid.setAttribute("aria-hidden", "false");
}

function getOverviewModePayload(project) {
  const genericInformationStory = [
    {
      id: "about",
      title: "About this project",
      paragraphs: [
        "This monitoring project tracks how the site changes over time using repeat surveys and comparable visual outputs.",
        "Project-specific background, survey method, and interpretation guidance can be added in the project content files."
      ]
    }
  ];
  const genericHelpStory = [
    {
      id: "quick-start",
      title: "Quick start",
      paragraphs: [
        "Start with Overview to understand the current survey round and the monitored areas.",
        "Then use the area tools to compare imagery, inspect sections, and review any measured change products available for the selected project."
      ]
    }
  ];
  const informationPayload = enrichOverviewPayload(
    project?.content?.overviewModes?.information,
    {
    heroTitle: `Understanding the ${project?.name || "monitoring project"}`,
    heroText: "This page explains the purpose of the project, how the surveys are being used, and any important context needed to interpret the outputs.",
    storyTitle: "Project Information",
    contentsSubtext: "Use this index to move through the project story, survey method, and data context.",
    contents: genericInformationStory.map((section) => ({
      title: section.title,
      summary: section.paragraphs[0]
    })),
    glance: overviewGlanceForSurvey(state.surveyId),
    story: genericInformationStory
    }
  );

  const helpPayload = enrichOverviewPayload(
    project?.content?.overviewModes?.help,
    {
    heroTitle: "How to use the monitoring platform",
    heroText: "This help page explains where to start, what each menu section does, and how to use the main monitoring views for the selected project.",
    storyTitle: "Project Help",
    contentsSubtext: "Use this index to move through the navigation guide and quick-start advice.",
    contents: genericHelpStory.map((section) => ({
      title: section.title,
      summary: section.paragraphs[0]
    })),
    glance: overviewGlanceForSurvey(state.surveyId),
    story: genericHelpStory
    }
  );

  const surveySpecificPayload = enrichOverviewPayload(
    project?.content?.surveySpecificOverview?.[state.surveyId],
    {
    heroTitle: `${currentSurvey().label} field notes`,
    heroText: "This survey-specific view is ready for round-by-round field notes, lessons learned, and route changes as the programme develops.",
    storyTitle: "Survey Notes",
    contentsSubtext: "Use this space to capture what worked, what did not, and how the survey method changed from one round to the next.",
    glance: [
      ["Survey window", currentSurvey().shortDate],
      ["Status", currentSurvey().status || "Survey loaded"],
      ["Readiness", currentSurvey().readiness || "Assets linked"],
      ["Focus", "Survey-specific notes pending"],
      ["What worked", "To be added"],
      ["Next change", "To be added"]
    ],
    story: [
      {
        id: "survey-notes-pending",
        title: "Survey-Specific Notes Are Ready To Fill In",
        paragraphs: [
          "This round now has a place for field notes, lessons learned, and route planning decisions without overwriting the permanent project information.",
          "As more survey rounds are completed, this tab can grow into a proper round-by-round operational log."
        ]
        }
      ]
    }
  );

  surveySpecificPayload.glance = overviewGlanceForSurvey(state.surveyId);
  
  if (state.overviewMode === "help") {
    return helpPayload;
  }
  if (state.overviewMode === "survey") {
    return surveySpecificPayload;
  }
  return informationPayload;
}

function enrichOverviewPayload(projectPayload, fallbackPayload) {
  const merged = {
    ...(fallbackPayload || {}),
    ...(projectPayload || {})
  };
  const story = Array.isArray(merged.story) ? merged.story : [];
  return {
    ...merged,
    contents: Array.isArray(merged.contents) && merged.contents.length
      ? merged.contents
      : story.map((section) => ({
        title: section.title,
        summary: Array.isArray(section.paragraphs) ? (section.paragraphs[0] || "") : ""
      }))
  };
}

function surveyShortLabel() {
  return currentSurvey().shortDate;
}

function overviewAreaTone(areaId, index) {
  const tones = ["cyan", "amber", "green", "rose"];
  const match = String(areaId).match(/(\d+)/);
  const number = match ? Number(match[1]) - 1 : index;
  return tones[((number % tones.length) + tones.length) % tones.length];
}

function timelineMarkerPosition(offsetMinutes) {
  const min = -180;
  const max = 180;
  const clamped = Math.max(min, Math.min(max, offsetMinutes || 0));
  return ((clamped - min) / (max - min)) * 100;
}

function midOffsetLabel(offsetMinutes) {
  const value = Number(offsetMinutes || 0);
  if (value === 0) return "At low tide";
  return `${Math.abs(value)} mins ${value < 0 ? "before" : "after"} low tide`;
}

function updateBackToTopVisibility() {
  const activePanel = document.querySelector(".tab-panel.active")?.dataset.panel;
  const shouldShow = activePanel === "overview" && window.scrollY > 480;
  els.backToTopBtn?.classList.toggle("hidden", !shouldShow);
}

function selectedDetailRow(label, value) {
  return `<div class="selected-detail-item"><span class="selected-detail-key">${escapeHtml(label)}</span><span class="selected-detail-value">${escapeHtml(value)}</span></div>`;
}

function surveyComparisonDetailRow(label, values) {
  return `
    <div class="survey-compare-row">
      <span class="survey-compare-row__label">${escapeHtml(label)}</span>
      ${values.map((value) => `<span class="survey-compare-row__value">${escapeHtml(value)}</span>`).join("")}
    </div>
  `;
}

function surveyComparisonMarkup(areaId) {
  const project = currentProject();
  const orderedSurveys = [...project.surveys].sort((left, right) => String(left.dateFrom || left.id).localeCompare(String(right.dateFrom || right.id)));
  const surveyAreas = orderedSurveys.map((survey) => {
    const overview = effectiveAreaOverview(areaId, survey.id);
    return {
      survey,
      overview,
      midOffset: overview.midOffset ?? overview.midOffsetMinutes ?? 0
    };
  });
  const gridStyle = `grid-template-columns: minmax(170px, 1.1fr) repeat(${surveyAreas.length}, minmax(0, 1fr));`;

  return `
    <article class="selected-detail-panel selected-detail-panel--comparison">
      <div class="selected-detail-panel__intro">
        <h3>Survey-round comparison</h3>
        <p class="selected-notes">This gives a quick same-area comparison across all saved survey rounds, so you can see how the timing and tide window shifted without hopping between screens.</p>
      </div>
      <div class="survey-compare-grid" style="${escapeAttr(gridStyle)}">
        <div class="survey-compare-grid__head"></div>
        ${surveyAreas.map(({ survey }) => `<div class="survey-compare-grid__head">${escapeHtml(survey.shortDate || survey.label)}</div>`).join("")}
        ${surveyComparisonDetailRow("Survey day", surveyAreas.map(({ overview }) => overview.day || "--"))}
        ${surveyComparisonDetailRow("Flight window", surveyAreas.map(({ overview }) => `${overview.start || "--"}-${overview.finish || "--"}`))}
        ${surveyComparisonDetailRow("Actual duration", surveyAreas.map(({ overview }) => overview.actualDuration || "--"))}
        ${surveyComparisonDetailRow("Low tide reference", surveyAreas.map(({ overview }) => `${overview.lowTide || "--"} - ${overview.lowTideHeight || "--"}`))}
        ${surveyComparisonDetailRow("Launch offset", surveyAreas.map(({ overview }) => overview.launchOffset || "--"))}
        ${surveyComparisonDetailRow("Mid-flight tide marker", surveyAreas.map(({ midOffset }) => midOffsetLabel(midOffset)))}
        ${surveyComparisonDetailRow("Tidal window", surveyAreas.map(({ overview }) => overview.tideWindow || "--"))}
        ${surveyComparisonDetailRow("Low-tide alignment", surveyAreas.map(({ overview }) => `${overview.tideScore || "--"}/100`))}
      </div>
    </article>
  `;
}

function renderAreasLegacy() {
  const area = currentArea();
  els.areaList.innerHTML = areas().map((item) => `
    <article class="card area-card area-card--${item.statusTone || "cyan"} ${item.id === area.id ? "active" : ""}">
      <div class="area-card__head">
        <div>
          <p class="muted">${escapeHtml(item.overviewCode)} - ${escapeHtml(item.day)}</p>
          <h3>${escapeHtml(item.label)}</h3>
        </div>
        <span class="overview-area-pill overview-area-pill--${escapeHtml(item.statusTone || "cyan")}">${escapeHtml(item.statusLabel)}</span>
      </div>
      <p>${escapeHtml(item.summary)}</p>
      <div class="area-card__stats">
        <div><span class="muted">Flight window</span><strong>${escapeHtml(item.start)}-${escapeHtml(item.finish)}</strong></div>
        <div><span class="muted">Area size</span><strong>${escapeHtml(item.size)}</strong></div>
      </div>
      <div class="chips">${item.tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>
      <button class="area-action section-gap" type="button" data-area="${escapeHtml(item.id)}">Use this area and compare rounds</button>
    </article>
  `).join("");

  els.areaList.querySelectorAll("[data-area]").forEach((button) => {
    button.addEventListener("click", () => {
      updateArea(button.dataset.area);
      requestAnimationFrame(() => {
        els.selectedAreaPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  els.selectedAreaTitle.textContent = area.label;
  els.selectedAreaSummary.textContent = area.summary;
  els.selectedAreaChips.innerHTML = area.tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("");
  els.selectedAreaAssets.innerHTML = `
    <article class="selected-score-card">
      <span class="selected-score-card__label">Low-tide alignment</span>
      <strong class="selected-score-card__value">${escapeHtml(String(area.tideScore))}/100</strong>
      <span class="selected-score-card__sub">Low tide at ${escapeHtml(area.lowTide)} - ${escapeHtml(area.lowTideHeight)}</span>
    </article>
    ${surveyComparisonMarkup(area.id)}
    <article class="selected-detail-panel">
      <h3>Area summary</h3>
      <div class="selected-detail-table">
        ${selectedDetailRow("Survey day", area.day)}
        ${selectedDetailRow("Area size", area.size)}
        ${selectedDetailRow("Flight start", area.start)}
        ${selectedDetailRow("Flight finish", area.finish)}
        ${selectedDetailRow("Estimated duration", area.estimatedDuration)}
        ${selectedDetailRow("Actual duration", area.actualDuration)}
        ${selectedDetailRow("Launch offset from low tide", area.launchOffset)}
        ${selectedDetailRow("Mid-flight tide marker", midOffsetLabel(area.midOffsetMinutes))}
        ${selectedDetailRow("Tidal window", area.tideWindow)}
      </div>
    </article>
    ${surveyComparisonMarkup(area.id)}
    <article class="selected-detail-panel">
      <h3>Monitoring context</h3>
      <div class="selected-detail-table">
        ${selectedDetailRow("Mission role", area.missionRole)}
        ${selectedDetailRow("Operational note", area.operationalNote)}
        ${selectedDetailRow("Planned outputs", area.deliverables)}
        ${selectedDetailRow("Weather notes", area.weatherNotes)}
      </div>
    </article>
    <article class="selected-detail-panel selected-detail-panel--full">
      <h3>Interpretation note</h3>
      <p class="selected-notes">${escapeHtml(area.surveyNotes)}</p>
    </article>
  `;
}

function renderAreas() {
  const area = currentArea();
  els.areaList.innerHTML = areas().map((item) => `
    <article class="card area-card area-card--${item.statusTone || "cyan"} ${item.id === area.id ? "active" : ""}">
      <button class="area-card__toggle" type="button" data-area-toggle="${escapeHtml(item.id)}" aria-expanded="${item.id === area.id ? "true" : "false"}">
        <div class="area-card__head">
          <div>
            <p class="muted">${escapeHtml(item.overviewCode)} - ${escapeHtml(item.day)}</p>
            <h3>${escapeHtml(item.label)}</h3>
          </div>
          <span class="overview-area-pill overview-area-pill--${escapeHtml(item.statusTone || "cyan")}">${escapeHtml(item.statusLabel)}</span>
        </div>
      </button>
      <div class="area-card__content ${item.id === area.id ? "" : "hidden"}">
        <p>${escapeHtml(item.summary)}</p>
        <div class="area-card__stats">
          <div><span class="muted">Flight window</span><strong>${escapeHtml(item.start)}-${escapeHtml(item.finish)}</strong></div>
          <div><span class="muted">Area size</span><strong>${escapeHtml(item.size)}</strong></div>
        </div>
        <div class="chips">${item.tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>
        <button class="area-action section-gap" type="button" data-area="${escapeHtml(item.id)}">Use this area and compare rounds</button>
      </div>
    </article>
  `).join("");

  els.areaList.querySelectorAll("[data-area-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      updateArea(button.dataset.areaToggle);
    });
  });

  els.areaList.querySelectorAll("[data-area]").forEach((button) => {
    button.addEventListener("click", () => {
      updateArea(button.dataset.area);
      requestAnimationFrame(() => {
        els.selectedAreaPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  els.selectedAreaTitle.textContent = area.label;
  els.selectedAreaSummary.textContent = area.summary;
  els.selectedAreaChips.innerHTML = area.tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("");
  els.selectedAreaAssets.innerHTML = `
    <article class="selected-score-card">
      <span class="selected-score-card__label">Low-tide alignment</span>
      <strong class="selected-score-card__value">${escapeHtml(String(area.tideScore))}/100</strong>
      <span class="selected-score-card__sub">Low tide at ${escapeHtml(area.lowTide)} - ${escapeHtml(area.lowTideHeight)}</span>
    </article>
    ${surveyComparisonMarkup(area.id)}
    <article class="selected-detail-panel">
      <h3>Area summary</h3>
      <div class="selected-detail-table">
        ${selectedDetailRow("Survey day", area.day)}
        ${selectedDetailRow("Area size", area.size)}
        ${selectedDetailRow("Flight start", area.start)}
        ${selectedDetailRow("Flight finish", area.finish)}
        ${selectedDetailRow("Estimated duration", area.estimatedDuration)}
        ${selectedDetailRow("Actual duration", area.actualDuration)}
        ${selectedDetailRow("Launch offset from low tide", area.launchOffset)}
        ${selectedDetailRow("Mid-flight tide marker", midOffsetLabel(area.midOffsetMinutes))}
        ${selectedDetailRow("Tidal window", area.tideWindow)}
      </div>
    </article>
    <article class="selected-detail-panel">
      <h3>Monitoring context</h3>
      <div class="selected-detail-table">
        ${selectedDetailRow("Mission role", area.missionRole)}
        ${selectedDetailRow("Operational note", area.operationalNote)}
        ${selectedDetailRow("Planned outputs", area.deliverables)}
        ${selectedDetailRow("Weather notes", area.weatherNotes)}
      </div>
    </article>
    <article class="selected-detail-panel">
      <h3>Interpretation note</h3>
      <p class="selected-notes">${escapeHtml(area.surveyNotes)}</p>
    </article>
  `;
}

async function renderLayers() {
  const area = currentArea();
  const project = currentProject();
  const layerDefinitions = imageryLayers(area);
  const primaryLayer = layerDefinitions[state.primaryLayerKey] || layerDefinitions.ortho;
  const secondaryLayer = layerDefinitions[state.secondaryLayerKey] || layerDefinitions[state.primaryLayerKey] || layerDefinitions.ortho;
  const primarySurvey = currentProject().surveys.find((survey) => survey.id === state.primarySurveyId) || currentSurvey();
  const secondarySurvey = currentProject().surveys.find((survey) => survey.id === state.secondarySurveyId) || primarySurvey;
  const dsmLayer = layerDefinitions.dsm;
  const contourLayer = layerDefinitions.contours;

  fillSelect(els.primaryCompareSelect, currentProject().surveys.map((survey) => [survey.id, survey.label]), primarySurvey.id);
  fillSelect(els.secondaryCompareSelect, currentProject().surveys.map((survey) => [survey.id, survey.label]), secondarySurvey.id);
  fillSelect(els.primaryLayerCompareSelect, Object.entries(layerDefinitions).map(([key, layer]) => [key, layer.label]), state.primaryLayerKey);
  fillSelect(els.secondaryLayerCompareSelect, Object.entries(layerDefinitions).map(([key, layer]) => [key, layer.label]), state.secondaryLayerKey);
  els.toggleGuideDsm.checked = state.showGuideDsm;
  els.toggleGuideContours.checked = state.showGuideContours;
  els.toggleChangeHighlight.checked = state.showChangeHighlight;

  els.layerControls.innerHTML = Object.entries(layerDefinitions).map(([key, layer]) => `
    <button class="chip ${key === state.primaryLayerKey ? "active" : ""}" type="button" data-layer="${escapeHtml(key)}">
      ${escapeHtml(layer.label)}
    </button>
  `).join("");

  els.layerControls.querySelectorAll("[data-layer]").forEach((button) => {
    button.addEventListener("click", () => {
      state.primaryLayerKey = button.dataset.layer;
      state.layerKey = state.primaryLayerKey;
      resetView();
      renderLayers();
    });
  });

  els.compareModeControls.querySelectorAll("[data-compare-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.compareMode === state.compareMode);
  });

  const [primarySrc, secondarySrc, guideDsmSrc, primaryGuideContourSrc, secondaryGuideContourSrc] = await Promise.all([
    resolveExistingAsset(surveyAssetCandidates(project.id, primarySurvey.id, area.id, primaryLayer.fileName)),
    resolveExistingAsset(surveyAssetCandidates(project.id, secondarySurvey.id, area.id, secondaryLayer.fileName)),
    dsmLayer ? resolveExistingAsset(surveyAssetCandidates(project.id, primarySurvey.id, area.id, dsmLayer.fileName)) : Promise.resolve(""),
    contourLayer ? resolveExistingAsset(surveyAssetCandidates(project.id, primarySurvey.id, area.id, contourLayer.fileName)) : Promise.resolve(""),
    contourLayer ? resolveExistingAsset(surveyAssetCandidates(project.id, secondarySurvey.id, area.id, contourLayer.fileName)) : Promise.resolve("")
  ]);
  const [primaryDisplaySrc, secondaryDisplaySrc, guideDsmDisplaySrc, primaryGuideContourDisplaySrc, secondaryGuideContourDisplaySrc] = await Promise.all([
    prepareSectionDisplayAsset(primarySrc),
    prepareSectionDisplayAsset(secondarySrc),
    prepareSectionDisplayAsset(guideDsmSrc),
    prepareSectionDisplayAsset(primaryGuideContourSrc),
    prepareSectionDisplayAsset(secondaryGuideContourSrc)
  ]);
  const primaryExists = Boolean(primarySrc);
  const secondaryExists = Boolean(secondarySrc);
  const guideDsmExists = Boolean(guideDsmSrc);
  const guideContourExists = Boolean(primaryGuideContourSrc);
  const secondaryGuideContourExists = Boolean(secondaryGuideContourSrc);

  els.viewerTitle.textContent = `${area.label} ${primaryLayer.label}${state.compareMode === "single" ? "" : ` vs ${secondaryLayer.label}`}`;
  els.viewerBaseImage.removeAttribute("src");
  els.viewerGuideDsmImage.removeAttribute("src");
  els.viewerGuideContourImage.removeAttribute("src");
  els.viewerOverlayImage.removeAttribute("src");
  els.viewerHighlightImage.removeAttribute("src");
  els.viewerSliderImage.removeAttribute("src");
  els.viewerGuideDsmOverlay.classList.add("hidden");
  els.viewerGuideContourOverlay.classList.add("hidden");
  els.viewerTransparencyOverlay.classList.add("hidden");
  els.viewerHighlightOverlay.classList.add("hidden");
  els.viewerSliderOverlay.classList.add("hidden");
  els.sliderHandle.classList.add("hidden");
  els.transparencyControls.classList.add("hidden");

  if (primaryExists) {
    els.viewerBaseImage.src = primaryDisplaySrc || primarySrc;
    els.viewerBaseImage.alt = `${area.label} ${primaryLayer.label} ${primarySurvey.label}`;
  } else {
    els.viewerBaseImage.alt = `${area.label} ${primaryLayer.label} missing`;
  }

  const sameSurvey = primarySurvey.id === secondarySurvey.id;
  const sameLayer = primaryLayer.fileName === secondaryLayer.fileName;
  const canCompare = secondaryExists && !(sameSurvey && sameLayer);
  const canHighlight = canCompare && primaryLayer.fileName === secondaryLayer.fileName;
  const highlightActive = state.showChangeHighlight && canHighlight;

  els.secondaryLayerCompareSelect.disabled = state.showChangeHighlight;
  els.secondaryLayerCompareSelect.title = state.showChangeHighlight
    ? "Highlight change compares the same view type across two survey rounds."
    : "";
  els.toggleGuideDsm.disabled = highlightActive;
  els.toggleGuideDsm.parentElement?.classList.toggle("is-disabled", highlightActive);
  els.toggleGuideDsm.parentElement?.setAttribute(
    "title",
    highlightActive ? "Highlight change uses its own change overlay." : ""
  );
  els.toggleGuideContours.disabled = false;
  els.toggleGuideContours.parentElement?.classList.remove("is-disabled");
  els.toggleGuideContours.parentElement?.setAttribute("title", "");

  els.compareModeControls.querySelectorAll("[data-compare-mode]").forEach((button) => {
    const mode = button.dataset.compareMode;
    const disabled = highlightActive
      ? mode !== "single"
      : (mode !== "single" && !canCompare);
    button.disabled = disabled;
    button.title = disabled
      ? (
        highlightActive
          ? "Highlight change uses a single map view with the change mask overlaid on top."
          : "Choose a different survey or layer, or upload the missing secondary image, to use this mode."
      )
      : "";
  });

  if (!canCompare && state.compareMode !== "single") {
    state.compareMode = "single";
    els.compareModeControls.querySelectorAll("[data-compare-mode]").forEach((button) => {
      button.classList.toggle("active", button.dataset.compareMode === state.compareMode);
    });
  }

  if (!canHighlight) {
    state.showChangeHighlight = false;
    els.toggleChangeHighlight.checked = false;
  }

  if (state.showGuideDsm && guideDsmExists) {
    els.viewerGuideDsmOverlay.classList.remove("hidden");
    els.viewerGuideDsmImage.src = guideDsmDisplaySrc || guideDsmSrc;
    els.viewerGuideDsmImage.alt = `${area.label} colour elevation guide`;
  }

  if (state.showGuideContours && guideContourExists) {
    els.viewerGuideContourOverlay.classList.remove("hidden");
    els.viewerGuideContourImage.src = primaryGuideContourDisplaySrc || primaryGuideContourSrc;
    els.viewerGuideContourImage.alt = `${area.label} contour guide`;
  }

  if (state.compareMode === "transparency" && canCompare) {
    els.viewerTransparencyOverlay.classList.remove("hidden");
    els.transparencyControls.classList.remove("hidden");
    els.viewerOverlayImage.src = secondaryDisplaySrc || secondarySrc;
    els.viewerOverlayImage.alt = `${area.label} ${secondaryLayer.label} ${secondarySurvey.label}`;
  }

  if (state.compareMode === "slider" && canCompare) {
    els.viewerSliderOverlay.classList.remove("hidden");
    els.viewerSliderImage.src = secondaryDisplaySrc || secondarySrc;
    els.viewerSliderImage.alt = `${area.label} ${secondaryLayer.label} ${secondarySurvey.label}`;
    els.sliderHandle.classList.remove("hidden");
    updateSliderMask();
  }

  if (state.showChangeHighlight && canHighlight) {
    const highlightDisplaySrc = await prepareCompareHighlightAsset(
      primaryDisplaySrc || primarySrc,
      secondaryDisplaySrc || secondarySrc,
      {
        primaryContourPath: primaryGuideContourDisplaySrc || primaryGuideContourSrc,
        secondaryContourPath: secondaryGuideContourExists ? (secondaryGuideContourDisplaySrc || secondaryGuideContourSrc) : ""
      }
    );
    els.viewerHighlightOverlay.classList.remove("hidden");
    els.viewerHighlightImage.src = highlightDisplaySrc || secondaryDisplaySrc || secondarySrc;
    els.viewerHighlightImage.alt = `${area.label} change highlight ${secondarySurvey.label}`;
  }

  els.viewerCaption.textContent = buildViewerCaption({
    area,
    primaryLayer,
    secondaryLayer,
    primarySurvey,
    secondarySurvey,
    primaryExists,
    secondaryExists,
    mode: state.compareMode
  });
  renderCompareHighlightLegend({
    canHighlight,
    primarySurvey,
    secondarySurvey,
    contourAssisted: Boolean(primaryGuideContourSrc && secondaryGuideContourSrc)
  });
  updateViewerFullscreenButton();
  syncTransparencyControls(canCompare);
  applyViewerOpacities();
  applyViewTransform();

  const insightCards = [
    assetCard(
      "Current comparison",
      `${primarySurvey.shortDate} ${primaryLayer.label}${canCompare ? ` against ${secondarySurvey.shortDate} ${secondaryLayer.label}` : ` on its own for ${area.label}`}.`
    ),
    assetCard(
      "Best mode for this view",
      compareModeInsight(state.compareMode, canCompare, primaryLayer.label, secondaryLayer.label)
    ),
    assetCard(
      "Overlay helpers",
      overlayInsight({
        showGuideDsm: state.showGuideDsm && guideDsmExists,
        showGuideContours: state.showGuideContours && guideContourExists,
        showChangeHighlight: state.showChangeHighlight && canHighlight
      })
    ),
    assetCard(
      "What to look for",
      compareObservationHint(primaryLayer.label, secondaryLayer.label, state.compareMode)
    )
  ];

  if (!secondaryExists && !sameSurvey) {
    insightCards.push(assetCard(
      "Secondary survey missing",
      `${secondarySurvey.label} does not yet have a ${secondaryLayer.label.toLowerCase()} image for ${area.label}. Upload that view to unlock overlay and swipe comparison.`
    ));
  } else if (!canHighlight) {
    insightCards.push(assetCard(
      "Change highlight",
      "Highlight change works best when the primary and secondary views are the same type, for example aerial against aerial."
    ));
  } else {
    insightCards.push(assetCard(
      "Change highlight",
      "Turn on Highlight change to make differences between the two selected dates stand out more quickly."
    ));
  }

  els.compareInsightGrid.innerHTML = insightCards.join("");
}

async function renderSections() {
  const baseArea = currentArea();
  const survey = currentSurvey();
  const project = currentProject();
  const geometryMap = await loadSharedSectionGeometry(currentProject().id, baseArea.id);
  const area = applySharedSectionGeometry(baseArea, geometryMap);
  state.sectionArea = area;
  const section = area.sections.find((item) => item.id === state.sectionId) || area.sections[0];
  const previousSectionId = state.sectionId;
  state.sectionId = section.id;
  if (previousSectionId !== state.sectionId) {
    syncUrlState();
  }
  fillSelect(els.sectionSelect, area.sections.map((item) => [item.id, item.label]), state.sectionId);
  els.sectionPanelTitle.textContent = `${area.label} ${section.label}`;
  updateSectionFullscreenButton();
  els.sectionOrthoBtn.classList.toggle("active", state.sectionBasemap === "ortho");
  els.sectionDsmBtn.classList.toggle("active", state.sectionBasemap === "dsm");

  const overlayCandidates = [
    ...surveyAssetCandidates(currentProject().id, survey.id, area.id, "section_lines.png"),
    ...sharedAreaAssetCandidates(currentProject().id, area.id, "section_lines.png")
  ];
  const basemapCandidates = surveyAssetCandidates(
    currentProject().id,
    survey.id,
    area.id,
    state.sectionBasemap === "ortho" ? "ortho.jpg" : "dsm.png"
  );

  const comparisonSurveyIds = activeSectionComparisonSurveyIds();
  const [surveyRows, basemapPath, overlayPath] = await Promise.all([
    Promise.all(project.surveys.map(async (profileSurvey) => ({
      survey: profileSurvey,
      rows: await loadSectionRowsForSurvey(project.id, profileSurvey, area.id, section.id)
    }))),
    resolveExistingAsset(basemapCandidates),
    resolveExistingAsset(overlayCandidates)
  ]);
  const basemapDisplayPath = await prepareSectionDisplayAsset(basemapPath);
  const basemapExists = Boolean(basemapPath);
  const overlayExists = Boolean(overlayPath);
  const surveyProfiles = project.surveys.map((profileSurvey, index) => {
    const match = surveyRows.find((item) => item.survey.id === profileSurvey.id);
    return {
      survey: profileSurvey,
      rows: match?.rows || [],
      color: SECTION_PROFILE_COLORS[index % SECTION_PROFILE_COLORS.length],
      selected: comparisonSurveyIds.includes(profileSurvey.id)
    };
  });
  const activeProfiles = surveyProfiles.filter((profile) => profile.selected && profile.rows.length);
  const anchorProfile = surveyProfiles.find((profile) => profile.survey.id === survey.id) || surveyProfiles[0];
  const anchorRows = anchorProfile?.rows || [];

  state.sectionRows = anchorRows;
  renderSectionMap(area, section, basemapDisplayPath || basemapPath, overlayPath, basemapExists, overlayExists, anchorRows);
  renderSectionHero(area, section, survey, activeProfiles, anchorRows);
  renderSectionProfileControls(surveyProfiles);
  els.sectionMetrics.innerHTML = sectionMetrics(anchorRows, area, survey, section).map((item) => metric(item.label, item.value, item.subtext)).join("");
  if (!anchorRows.length) {
    els.sectionDetails.innerHTML = [
      assetCard("Section data missing", `No section profile CSV is available yet for ${survey.label} in either the survey folder or the shared area assets.`),
      assetCard("What this area shows", area.summary),
      assetCard("Survey context", area.surveyNotes),
      assetCard("Map alignment note", geometryMap?.size ? "This area is already using the exported QGIS section geometry, so the line tracking should now follow the real section direction." : "The section guide is still using the fallback line positions. Exporting the QGIS section lines will tighten this further.")
      ].join("");
        drawSectionChart(activeProfiles, section, survey.id);
        renderSectionComparisonSummary(activeProfiles, survey.id);
        updateSectionHoverFeedback(activeProfiles, section, survey);
        return;
    }
  const minHeight = Math.min(...anchorRows.map((row) => row.height));
  const maxHeight = Math.max(...anchorRows.map((row) => row.height));
  const span = Math.max(...anchorRows.map((row) => row.distance)) - Math.min(...anchorRows.map((row) => row.distance));
  const hoverRow = nearestSectionRow(anchorRows, state.sectionHoverDistance);
  const comparedCount = activeProfiles.length;
  els.sectionDetails.innerHTML = [
    sectionInsightCard({
      eyebrow: "Section Story",
      title: "What this section shows",
      summary: `${section.label} gives one fixed slice through ${area.label}.`,
      body: `${area.summary} ${section.label} is a fixed cut through the area, so it helps us see how the ground rises, falls, and changes along one consistent line.`
    }),
    sectionInsightCard({
      eyebrow: "Live Reading",
      title: "Current reading",
      summary: hoverRow
        ? `${fixed(hoverRow.height, 2)} m at ${fixed(hoverRow.distance, 1)} m along the line.`
        : `${fixed(span, 1)} m section span with ${comparedCount > 1 ? `${comparedCount} survey rounds` : "one active survey round"}.`,
      body: hoverRow
        ? `At ${fixed(hoverRow.distance, 1)} m along the line, the ground is ${fixed(hoverRow.height, 2)} m high. Use the map marker and the chart together to understand exactly where that point sits.`
        : `This profile runs for ${fixed(span, 1)} m, from a lowest sampled height of ${fixed(minHeight, 2)} m up to ${fixed(maxHeight, 2)} m. ${comparedCount > 1 ? `${comparedCount} survey rounds are currently overlaid for comparison.` : "Move across the chart to inspect specific points."}`
    }),
    sectionInsightCard({
      eyebrow: "Visual Guide",
      title: "How to read the views",
      summary: state.sectionBasemap === "ortho"
        ? "Use the aerial image for ground appearance and context."
        : "Use colour elevation for quicker height reading.",
      body: state.sectionBasemap === "ortho"
        ? "Aerial View shows the real surface appearance underneath the section line. Switch to Colour Elevation when you want the height pattern to be easier to read at a glance."
        : "Colour Elevation makes changes in height easier to spot. Switch back to Aerial View when you want to relate the section line to visible features on the ground."
    }),
    sectionInsightCard({
      eyebrow: "Survey Context",
      title: "Survey context",
      summary: `${survey.shortDate} around low tide at ${area.lowTide}.`,
      body: `${survey.label} captured this area around low tide at ${area.lowTide}. ${activeProfiles.length > 1 ? "Use the survey profile toggles above the chart to compare up to three rounds along the same fixed line. " : ""}${area.surveyNotes}`
    })
  ].join("");
  drawSectionChart(activeProfiles, section, survey.id);
  renderSectionComparisonSummary(activeProfiles, survey.id);
  updateSectionHoverFeedback(activeProfiles, section, survey);
}

function renderWorkflow() {
  els.workflowGrid.innerHTML = currentProject().workflow.map((step) => `
    <article class="card">
      <p class="muted">Stage ${escapeHtml(step.stage)}</p>
      <h3>${escapeHtml(step.title)}</h3>
      <p>${escapeHtml(step.copy)}</p>
    </article>
  `).join("");
}

function renderWeather() {
  const project = currentProject();
  const survey = currentSurvey();
  const projectEnvironment = currentProjectEnvironment();
  const windowRange = weatherWindowForSurvey(project.surveys, survey.id);
  const surveyDates = [survey.dateFrom, survey.dateTo]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  els.weatherSummary.textContent = `${survey.label} is shown with a focused weather and tide window from ${formatDashboardDate(windowRange.start)} to ${formatDashboardDate(windowRange.end)}. Survey markers are shown for the selected survey dates only.`;
  if (els.weatherFrame) {
    els.weatherFrame.title = `${project.name || "Project"} weather and tide dashboard`;
  }

  const params = new URLSearchParams({
    location: project.site?.name || projectEnvironment.defaultLocationName || environmentalContext.defaultLocationName,
    start: windowRange.start,
    end: windowRange.end,
    surveys: surveyDates.join(","),
    mode: "daily",
    limitDays: "92"
  });
  if (projectEnvironment.tide?.latitude) params.set("lat", projectEnvironment.tide.latitude);
  if (projectEnvironment.tide?.longitude) params.set("lon", projectEnvironment.tide.longitude);
  if (projectEnvironment.tide?.datum) params.set("datum", projectEnvironment.tide.datum);
  const src = `./weather-dashboard.html?${params.toString()}`;
  if (state.weatherFrameSrc !== src) {
    state.weatherFrameSrc = src;
    els.weatherFrame.src = src;
  }
}

function configuredPanoramaEmbed(surveyId, areaId) {
  const embedsBySurvey = currentProjectBranding()?.panoramaEmbedsBySurvey || {};
  const directMatch = embedsBySurvey?.[surveyId]?.[areaId];
  if (directMatch) {
    return directMatch;
  }
  const fallbackMatch = Object.values(embedsBySurvey)
    .map((areas) => areas?.[areaId] || "")
    .find((value) => String(value || "").trim());
  return fallbackMatch || "";
}

function renderPanorama() {
  const survey = currentSurvey();
  const area = currentArea();
  const embedUrl = configuredPanoramaEmbed(survey.id, area.id);
  const hasEmbed = Boolean(String(embedUrl || "").trim());
  const guide = currentProjectContent()?.panoramaGuides?.[area.id] || {
    summary: `Panorama view for ${area.label}.`,
    stats: [
      ["Main focus", area.label, "Area-specific panorama view."],
      ["Best for", "Visual context", "Use this view alongside the imagery and sections panels."]
    ],
    details: [
      ["What to look for", "Use this panorama as a visual context layer for the selected monitoring area."],
      ["Why it matters", "It gives a client-friendly view of the area alongside the measured survey outputs."]
    ]
  };

  els.panoramaSummary.textContent = hasEmbed
    ? guide.summary
    : `${guide.summary} Hosted tour link still to be added.`;

  if (hasEmbed) {
    els.panoramaFrame.src = embedUrl;
  } else {
    els.panoramaFrame.removeAttribute("src");
  }

  els.panoramaStats.innerHTML = guide.stats
    .map(([label, value, hint]) => metric(label, value, hint))
    .join("");

  els.panoramaDetails.innerHTML = [
    ...guide.details.map(([label, value]) => detail(label, value)),
    ...(hasEmbed ? [] : [detail("Current state", "No hosted panorama link has been added for this selected area yet.")])
  ].join("");
}

async function renderVolumeLegacy() {
  const project = currentProject();
  const survey = currentSurvey();
  const area = currentArea();
  const baselineSurvey = activeComparisonSurvey(project, survey);
  const volumeDataset = currentVolumeDataset();
  const areaDataset = currentAreaVolumeDataset();
  const sharedPolygons = await loadSharedAreaPolygons(project.id, area.id);
  const configuredPolygons = areaDataset?.polygons || [];
  const polygons = mergeVolumePolygons(configuredPolygons, sharedPolygons);
  const hasConfiguredRows = configuredPolygons.length > 0;
  const [baselineImageSrc, currentImageSrc] = await Promise.all([
    baselineSurvey ? resolveExistingAsset(surveyAssetCandidates(project.id, baselineSurvey.id, area.id, "ortho.jpg")) : Promise.resolve(""),
    resolveExistingAsset(surveyAssetCandidates(project.id, survey.id, area.id, "ortho.jpg"))
  ]);
  const baselineImageExists = Boolean(baselineImageSrc);
  const currentImageExists = Boolean(currentImageSrc);

  renderVolumePolygonOverlay(els.volumeBaselineOverlay, baselineImageExists ? polygons : []);
  renderVolumePolygonOverlay(els.volumeCurrentOverlay, currentImageExists ? polygons : []);

  const totals = configuredPolygons.reduce((acc, item) => {
    acc.gain += Number(item.gainM3 || 0);
    acc.loss += Number(item.lossM3 || 0);
    acc.net += Number(item.netM3 || 0);
    return acc;
  }, { gain: 0, loss: 0, net: 0 });

  const volumeLegendMarkup = `
    <div class="detail-item">
      <strong>Change colour key</strong>
      <div class="volume-change-key">
        <span class="volume-change-key__item"><span class="volume-change-key__swatch volume-change-key__swatch--red"></span>&lt; -0.20 m</span>
        <span class="volume-change-key__item"><span class="volume-change-key__swatch volume-change-key__swatch--orange"></span>-0.20 to -0.05 m</span>
        <span class="volume-change-key__item"><span class="volume-change-key__swatch volume-change-key__swatch--yellow"></span>-0.05 to 0.05 m</span>
        <span class="volume-change-key__item"><span class="volume-change-key__swatch volume-change-key__swatch--green"></span>0.05 to 0.20 m</span>
        <span class="volume-change-key__item"><span class="volume-change-key__swatch volume-change-key__swatch--blue"></span>&gt; 0.20 m</span>
      </div>
      <p>Blue and green show where the later survey stands higher or looks more built up. Yellow sits close to little or no change. Orange and red show where the earlier survey stood higher or where material appears to have been lost by the later survey.</p>
    </div>
  `;

  if (!baselineSurvey && !volumeDataset) {
    els.volumeSummary.textContent = `${survey.label} is the baseline round, so volume change is not yet available. Switch to a later survey round once a comparison has been calculated.`;
    els.volumeImageSummary.textContent = "The imagery panel will show baseline and repeat aerial views once a comparison round exists.";
    els.volumeBaselineLabel.textContent = "No baseline comparison yet";
    els.volumeCurrentLabel.textContent = survey.shortDate;
    els.volumeBaselineImage.removeAttribute("src");
    if (currentImageExists) {
      els.volumeCurrentImage.src = currentImageSrc;
      els.volumeCurrentImage.alt = `${area.label} ${survey.label} aerial view`;
      els.volumeCurrentCaption.textContent = `${area.label} in ${survey.label}. This acts as the visual baseline for future volume reporting.`;
    } else {
      els.volumeCurrentImage.removeAttribute("src");
      els.volumeCurrentCaption.textContent = "No aerial view has been uploaded yet for this area in the selected survey.";
    }
    els.volumeBaselineCaption.textContent = "Volume comparisons begin once a later survey round is available for the same area.";
    els.volumeMetricGrid.innerHTML = [
      metric("Selected survey", survey.shortDate, "Current round"),
      metric("Comparison status", "Baseline only", "Volume change starts on repeat rounds"),
      metric("Current area", area.label, area.overviewCode),
      metric("Next step", "Add repeat survey", "Then upload the sandbar volume results")
    ].join("");
    els.volumeMethod.innerHTML = [
      detail("How this will work", "Volume change will be calculated from one elevation surface minus another inside fixed sandbar polygons."),
      detail("What goes into the app", "Gain, loss, and net cubic metre values for each monitored sandbar, plus a short plain-English note.")
    ].join("");
    els.volumeNarrative.innerHTML = [
      detail("Why this matters", "This is the clearest way to explain whether the estuary bars are building up, flattening out, or eroding away between survey rounds."),
      detail("What clients should see", "A simple readout of where sediment has been gained, where it has been lost, and how much the net change is in cubic metres.")
    ].join("");
    els.volumeAreaGrid.innerHTML = `
      <article class="card">
        <p class="muted">${escapeHtml(area.overviewCode)} - ${escapeHtml(area.label)}</p>
        <h3>Awaiting first comparison dataset</h3>
        <p>Once a repeat survey has been processed, this page will show per-sandbar gain, loss, and net volume change for this area.</p>
      </article>
    `;
    return;
  }

  const baselineLabel = volumeDataset?.baselineSurveyId
    ? (project.surveys.find((item) => item.id === volumeDataset.baselineSurveyId)?.label || baselineSurvey?.label || "baseline survey")
    : (baselineSurvey?.label || "baseline survey");

  els.volumeSummary.textContent = `${survey.label} is being compared against ${baselineLabel} for ${area.label}. This view translates elevation-surface change into plain-English cubic metre results for monitored sandbars.`;
  els.volumeImageSummary.textContent = "These aerial views give clients a quick visual before-and-after context for the same monitored area. The cubic metre figures underneath explain how much material was gained or lost.";
  els.volumeBaselineLabel.textContent = baselineSurvey?.shortDate || "Baseline survey";
  els.volumeCurrentLabel.textContent = survey.shortDate;
  if (baselineImageExists) {
    els.volumeBaselineImage.src = baselineImageSrc;
    els.volumeBaselineImage.alt = `${area.label} ${baselineLabel} aerial view`;
    els.volumeBaselineCaption.textContent = `${area.label} before the measured change. Use this to see the earlier bar shape and exposed ground pattern.`;
  } else {
    els.volumeBaselineImage.removeAttribute("src");
    els.volumeBaselineCaption.textContent = `No baseline aerial view is currently available for ${area.label}.`;
  }
  if (currentImageExists) {
    els.volumeCurrentImage.src = currentImageSrc;
    els.volumeCurrentImage.alt = `${area.label} ${survey.label} aerial view`;
    els.volumeCurrentCaption.textContent = `${area.label} during the current survey round. The sandbar volume figures below describe how this surface differs from the earlier one.`;
  } else {
    els.volumeCurrentImage.removeAttribute("src");
    els.volumeCurrentCaption.textContent = `No current aerial view is currently available for ${area.label}.`;
  }
  els.volumeMetricGrid.innerHTML = [
    metric("Monitored sandbars", String(polygons.length), area.overviewCode),
    metric("Total gain", formatVolume(totals.gain), "Deposited sediment"),
    metric("Total loss", formatVolume(totals.loss), "Eroded sediment"),
    metric("Net change", formatVolume(totals.net), totals.net >= 0 ? "Overall build-up" : "Overall erosion")
  ].join("");

  els.volumeMethod.innerHTML = [
    detail("Comparison pair", `${baselineLabel} compared with ${survey.label}.`),
    detail("Calculation method", areaDataset?.method || volumeDataset?.method || "DSM difference raster clipped to fixed sandbar polygons."),
    detail("Grid note", areaDataset?.cellSize || volumeDataset?.cellSize || "Processing note not yet added."),
    detail("Area note", areaDataset?.notes || "A short note for this area has not been added yet.")
  ].join("");

  els.volumeNarrative.innerHTML = polygons.length
    ? [
      detail("What this means", totals.net >= 0
        ? `Across ${area.label}, the monitored bars currently show a net build-up of ${formatVolume(totals.net)} over this comparison window.`
        : `Across ${area.label}, the monitored bars currently show a net erosion of ${formatVolume(Math.abs(totals.net))} over this comparison window.`),
      detail("How to explain it", "Gain means material has accumulated. Loss means material has been removed. Net change is the balance after both are considered together."),
      detail("Confidence", polygons.map((item) => `${item.label}: ${item.confidence || volumeChangeSettings.defaultConfidence}`).join(" | "))
    ].join("")
    : [
      detail("Awaiting area figures", `The comparison round exists for ${survey.label}, but no per-sandbar cubic metre figures have been entered yet for ${area.label}.`),
      detail("What to expect next", "Measured method notes and per-sandbar figures will appear here once this comparison package has been completed.")
    ].join("");

  els.volumeAreaGrid.innerHTML = polygons.length
    ? polygons.map((item) => `
      <article class="card">
        <div class="volume-card__meta">
          <div>
            <p class="muted">${escapeHtml(area.overviewCode)} - ${escapeHtml(item.id || "")}</p>
            <h3>${escapeHtml(item.label)}</h3>
          </div>
          <span class="chip">${escapeHtml(item.confidence || volumeChangeSettings.defaultConfidence)}</span>
        </div>
        <div class="volume-card__grid">
          <div class="volume-mini volume-mini--gain">
            <span class="muted">Gain</span>
            <strong>${escapeHtml(formatVolume(item.gainM3))}</strong>
          </div>
          <div class="volume-mini volume-mini--loss">
            <span class="muted">Loss</span>
            <strong>${escapeHtml(formatVolume(item.lossM3))}</strong>
          </div>
          <div class="volume-mini volume-mini--net">
            <span class="muted">Net</span>
            <strong>${escapeHtml(formatVolume(item.netM3))}</strong>
          </div>
        </div>
        <p>${escapeHtml(item.summary || "Summary to follow.")}</p>
      </article>
    `).join("")
    : `
      <article class="card">
        <p class="muted">${escapeHtml(area.overviewCode)} - ${escapeHtml(area.label)}</p>
        <h3>Ready for sandbar results</h3>
        <p>This survey pair has been prepared for volume reporting. Measured sandbar figures will appear here once they have been processed.</p>
      </article>
    `;
}

async function renderVolumePrevious() {
  const project = currentProject();
  const survey = currentSurvey();
  const area = currentArea();
  const baselineSurvey = activeComparisonSurvey(project, survey);
  const volumeDataset = currentVolumeDataset();
  const areaDataset = currentAreaVolumeDataset();
  const sharedPolygons = await loadSharedAreaPolygons(project.id, area.id);
  const configuredPolygons = areaDataset?.polygons || [];
  const polygons = mergeVolumePolygons(configuredPolygons, sharedPolygons);
  const hasConfiguredRows = configuredPolygons.length > 0;
  const [baselineImageSrc, currentImageSrc] = await Promise.all([
    baselineSurvey ? resolveExistingAsset(surveyAssetCandidates(project.id, baselineSurvey.id, area.id, "ortho.jpg")) : Promise.resolve(""),
    resolveExistingAsset(surveyAssetCandidates(project.id, survey.id, area.id, "ortho.jpg"))
  ]);
  const baselineImageExists = Boolean(baselineImageSrc);
  const currentImageExists = Boolean(currentImageSrc);

  renderVolumePolygonOverlay(els.volumeBaselineOverlay, polygons);
  renderVolumePolygonOverlay(els.volumeCurrentOverlay, polygons);

  const totals = configuredPolygons.reduce((acc, item) => {
    acc.gain += Number(item.gainM3 || 0);
    acc.loss += Number(item.lossM3 || 0);
    acc.net += Number(item.netM3 || 0);
    return acc;
  }, { gain: 0, loss: 0, net: 0 });

  if (!baselineSurvey && !volumeDataset) {
    els.volumeSummary.textContent = `${survey.label} is the baseline round, so volume change is not yet available. Switch to a later survey round once a comparison has been calculated.`;
    els.volumeImageSummary.textContent = "The imagery panel will show baseline and repeat aerial views once a comparison round exists.";
    els.volumeBaselineLabel.textContent = "No baseline comparison yet";
    els.volumeCurrentLabel.textContent = survey.shortDate;
    els.volumeBaselineImage.removeAttribute("src");
    if (currentImageExists) {
      els.volumeCurrentImage.src = currentImageSrc;
      els.volumeCurrentImage.alt = `${area.label} ${survey.label} aerial view`;
      els.volumeCurrentCaption.textContent = `${area.label} in ${survey.label}. This acts as the visual baseline for future volume reporting.`;
    } else {
      els.volumeCurrentImage.removeAttribute("src");
      els.volumeCurrentCaption.textContent = "No aerial view has been uploaded yet for this area in the selected survey.";
    }
    els.volumeBaselineCaption.textContent = "Volume comparisons begin once a later survey round is available for the same area.";
    els.volumeMetricGrid.innerHTML = [
      metric("Selected survey", survey.shortDate, "Current round"),
      metric("Comparison status", "Baseline only", "Volume change starts on repeat rounds"),
      metric("Current area", area.label, area.overviewCode),
      metric("Next step", "Add repeat survey", "Then upload the sandbar volume results")
    ].join("");
    els.volumeMethod.innerHTML = [
      detail("How this will work", "Volume change will be calculated from one elevation surface minus another inside fixed sandbar polygons."),
      detail("What goes into the app", "Gain, loss, and net cubic metre values for each monitored sandbar, plus a short plain-English note.")
    ].join("");
    els.volumeNarrative.innerHTML = [
      detail("Why this matters", "This is the clearest way to explain whether the estuary bars are building up, flattening out, or eroding away between survey rounds."),
      detail("What clients should see", "A simple readout of where sediment has been gained, where it has been lost, and how much the net change is in cubic metres.")
    ].join("");
    els.volumeAreaGrid.innerHTML = polygons.length
      ? polygons.map((item) => `
        <article class="card">
          <p class="muted">${escapeHtml(area.overviewCode)} - ${escapeHtml(item.id || "")}</p>
          <h3>${escapeHtml(item.label)}</h3>
          <p>${escapeHtml(item.notes || "Monitored sandbar polygon ready. Repeat-survey volume figures will slot into this shape once the comparison is processed.")}</p>
        </article>
      `).join("")
      : `
        <article class="card">
          <p class="muted">${escapeHtml(area.overviewCode)} - ${escapeHtml(area.label)}</p>
          <h3>Awaiting first comparison dataset</h3>
          <p>Once a repeat survey has been processed, this page will show per-sandbar gain, loss, and net volume change for this area.</p>
        </article>
      `;
    return;
  }

  const baselineLabel = volumeDataset?.baselineSurveyId
    ? (project.surveys.find((item) => item.id === volumeDataset.baselineSurveyId)?.label || baselineSurvey?.label || "baseline survey")
    : (baselineSurvey?.label || "baseline survey");

  els.volumeSummary.textContent = `${survey.label} is being compared against ${baselineLabel} for ${area.label}. This view translates elevation-surface change into plain-English cubic metre results for monitored sandbars.`;
  els.volumeImageSummary.textContent = "These aerial views give clients a quick visual before-and-after context for the same monitored area. The cubic metre figures underneath explain how much material was gained or lost.";
  els.volumeBaselineLabel.textContent = baselineSurvey?.shortDate || "Baseline survey";
  els.volumeCurrentLabel.textContent = survey.shortDate;
  if (baselineImageExists) {
    els.volumeBaselineImage.src = baselineImageSrc;
    els.volumeBaselineImage.alt = `${area.label} ${baselineLabel} aerial view`;
    els.volumeBaselineCaption.textContent = `${area.label} before the measured change. Use this to see the earlier bar shape and exposed ground pattern.`;
  } else {
    els.volumeBaselineImage.removeAttribute("src");
    els.volumeBaselineCaption.textContent = `No baseline aerial view is currently available for ${area.label}.`;
  }
  if (currentImageExists) {
    els.volumeCurrentImage.src = currentImageSrc;
    els.volumeCurrentImage.alt = `${area.label} ${survey.label} aerial view`;
    els.volumeCurrentCaption.textContent = `${area.label} during the current survey round. The sandbar volume figures below describe how this surface differs from the earlier one.`;
  } else {
    els.volumeCurrentImage.removeAttribute("src");
    els.volumeCurrentCaption.textContent = `No current aerial view is currently available for ${area.label}.`;
  }

  els.volumeMetricGrid.innerHTML = hasConfiguredRows
    ? [
      metric("Monitored sandbars", String(polygons.length), area.overviewCode),
      metric("Total gain", formatVolume(totals.gain), "Deposited sediment"),
      metric("Total loss", formatVolume(totals.loss), "Eroded sediment"),
      metric("Net change", formatVolume(totals.net), totals.net >= 0 ? "Overall build-up" : "Overall erosion")
    ].join("")
    : [
      metric("Monitored sandbars", String(polygons.length), area.overviewCode),
      metric("Comparison pair", `${baselineSurvey?.shortDate || "Baseline"} to ${survey.shortDate}`, "Imagery ready"),
      metric("Monitoring zones", polygons.length ? "Available" : "Pending", polygons.length ? "Fixed monitoring zones are in place" : "Monitoring zones have not been added to this view yet"),
      metric("Reported figures", "Awaiting values", "Measured gain, loss, and net figures will appear here once they are available")
    ].join("");

  els.volumeMethod.innerHTML = [
    detail("Comparison pair", `${baselineLabel} compared with ${survey.label}.`),
    detail("Calculation method", areaDataset?.method || volumeDataset?.method || "DSM difference raster clipped to fixed sandbar polygons."),
    detail("Grid note", areaDataset?.cellSize || volumeDataset?.cellSize || "Processing note not yet added."),
    detail("Area note", areaDataset?.notes || "A short note for this area has not been added yet.")
  ].join("");

  els.volumeNarrative.innerHTML = hasConfiguredRows
    ? [
      detail("What this means", totals.net >= 0
        ? `Across ${area.label}, the monitored bars currently show a net build-up of ${formatVolume(totals.net)} over this comparison window.`
        : `Across ${area.label}, the monitored bars currently show a net erosion of ${formatVolume(Math.abs(totals.net))} over this comparison window.`),
      detail("How to explain it", "Gain means material has accumulated. Loss means material has been removed. Net change is the balance after both are considered together."),
      detail("Confidence", polygons.map((item) => `${item.label}: ${item.confidence || volumeChangeSettings.defaultConfidence}`).join(" | "))
    ].join("")
    : [
      detail("Awaiting area figures", polygons.length
        ? `The comparison round exists for ${survey.label}, and the monitored polygons are loaded for ${area.label}, but no per-sandbar cubic metre figures have been entered yet.`
        : `The comparison round exists for ${survey.label}, but no monitored sandbar polygons or cubic metre figures have been entered yet for ${area.label}.`),
      detail("What to expect next", polygons.length
        ? "Measured gain, loss, and net figures will appear here once they have been prepared for each monitored sandbar."
        : "Monitoring zones and measured sandbar figures will appear here once this comparison package is complete.")
    ].join("");

  els.volumeAreaGrid.innerHTML = hasConfiguredRows
    ? polygons.map((item) => `
      <article class="card">
        <div class="volume-card__meta">
          <div>
            <p class="muted">${escapeHtml(area.overviewCode)} - ${escapeHtml(item.id || "")}</p>
            <h3>${escapeHtml(item.label)}</h3>
          </div>
          <span class="chip">${escapeHtml(item.confidence || volumeChangeSettings.defaultConfidence)}</span>
        </div>
        <div class="volume-card__grid">
          <div class="volume-mini volume-mini--gain">
            <span class="muted">Gain</span>
            <strong>${escapeHtml(formatVolume(item.gainM3))}</strong>
          </div>
          <div class="volume-mini volume-mini--loss">
            <span class="muted">Loss</span>
            <strong>${escapeHtml(formatVolume(item.lossM3))}</strong>
          </div>
          <div class="volume-mini volume-mini--net">
            <span class="muted">Net</span>
            <strong>${escapeHtml(formatVolume(item.netM3))}</strong>
          </div>
        </div>
        <p>${escapeHtml(item.summary || "Summary to follow.")}</p>
      </article>
    `).join("")
    : polygons.length
      ? polygons.map((item) => `
        <article class="card">
          <p class="muted">${escapeHtml(area.overviewCode)} - ${escapeHtml(item.id || "")}</p>
          <h3>${escapeHtml(item.label)}</h3>
          <p>${escapeHtml(item.notes || "This monitored sandbar is included in the comparison area. Measured results will appear here when available.")}</p>
        </article>
      `).join("")
      : `
        <article class="card">
          <p class="muted">${escapeHtml(area.overviewCode)} - ${escapeHtml(area.label)}</p>
          <h3>Ready for sandbar results</h3>
          <p>This survey pair has been prepared for volume reporting. Measured sandbar figures will appear here once they have been processed.</p>
        </article>
      `;
}

async function renderVolume() {
  const project = currentProject();
  const currentAreaSelection = currentArea();
  const singleScanOnly = (project.surveys || []).length < 2;
  const liveAreaIds = liveVolumeAreaIds(project);
  const currentAreaComparisonEntries = Object.entries(project.volumeChangeComparisons || {})
    .filter(([, entry]) => entry?.areas?.[currentAreaSelection.id]);
  const comparisonEntries = currentAreaComparisonEntries;
  const comparisonEntry = comparisonEntries.find(([surveyId]) => surveyId === state.surveyId)
    || comparisonEntries
      .sort((a, b) => {
        const aIndex = project.surveys.findIndex((item) => item.id === a[0]);
        const bIndex = project.surveys.findIndex((item) => item.id === b[0]);
        return bIndex - aIndex;
      })[0]
    || null;
  const area = currentAreaSelection;
  const isLiveArea = liveAreaIds.includes(area.id);
  const survey = comparisonEntry
    ? (project.surveys.find((item) => item.id === comparisonEntry[0]) || currentSurvey())
    : currentSurvey();
  const volumeDataset = comparisonEntry ? comparisonEntry[1] : currentVolumeDataset();
  const baselineSurvey = volumeDataset?.baselineSurveyId
    ? (project.surveys.find((item) => item.id === volumeDataset.baselineSurveyId) || activeComparisonSurvey(project, survey))
    : activeComparisonSurvey(project, survey);
  const areaDataset = volumeDataset?.areas?.[area.id] || null;
  const sharedPolygons = await loadSharedAreaPolygons(project.id, area.id);
  const configuredPolygons = areaDataset?.polygons || [];
  const polygons = mergeVolumePolygons(configuredPolygons, sharedPolygons);
  const hasConfiguredRows = configuredPolygons.length > 0;
  const previewMode = areaDataset?.previewMode || "";
  const previewImageFile = areaDataset?.previewImage || "";
  const previewBaselineImageFile = areaDataset?.previewBaselineImage || "";
  const previewCurrentImageFile = areaDataset?.previewCurrentImage || "";
  const previewBaselineLabel = areaDataset?.previewBaselineLabel || "";
  const previewCurrentLabel = areaDataset?.previewCurrentLabel || "";
  const previewBaselineCaption = areaDataset?.previewBaselineCaption || "";
  const previewCurrentCaption = areaDataset?.previewCurrentCaption || "";
  const previewLabel = areaDataset?.previewLabel || "Sandbar Volume Change Preview";
  const previewCaption = areaDataset?.previewCaption
    || "This first preview places the measured change map over the latest aerial image so people can see where the monitored sandbar appears to be building up or wearing away inside the measured zone.";
  const viewerEmbedUrl = areaDataset?.viewerEmbedUrl || "";
  const viewerTitle = areaDataset?.viewerTitle || "Area Change Viewer";
  const viewerSummary = areaDataset?.viewerSummary
    || "Explore the tested area in 3D, then use the figures and supporting maps alongside it to interpret where material appears to have been gained or lost.";
  const viewerStats = areaDataset?.viewerStats || null;
  const viewerGuideTitle = areaDataset?.viewerGuideTitle || "How to read this viewer";
  const viewerGuideWhatIs = areaDataset?.viewerGuideWhatIs
    || "This model lets you look at the same part of the beach in 3D and see where the later survey looks higher or lower than the earlier one. Use it as a visual check alongside the simple figures and maps below.";
  const viewerGuideColours = areaDataset?.viewerGuideColours
    || "Show base terrain turns the latest beach surface on or off. With it on, you can see the actual shape of the most recent scan underneath the colours. With it off, the change colours are easier to read on their own. Bigger point size makes the surface look fuller and easier to see. Smaller point size makes it look finer and lighter.";
  const viewerGuideUse = areaDataset?.viewerGuideUse
    || "Start by turning the model around and zooming into the area you care about. If the view feels too busy, switch off Show base terrain to focus on the colour change only. If the model looks too thin or patchy, increase point size. If it looks too chunky, reduce point size for a cleaner look.";
  const trendData = await loadTrendData(area.id);

  if (singleScanOnly) {
    els.volumeSandboxBanner.innerHTML = `
      <div class="detail-item">
        <strong>Change monitoring status</strong>
        <p>${escapeHtml(project.singleScanMessage)}</p>
      </div>
    `;
  }

  setVolumeUnsupportedAreaLayout(!isLiveArea);
  renderVolumeQuickAreas(isLiveArea ? liveAreaIds : [], currentAreaSelection.id);
  if (els.volumeTrendIntro) {
    els.volumeTrendIntro.textContent = isLiveArea
      ? `This brings all three survey rounds together so people can see what is steadily building up, steadily lowering, reversing, or settling down across ${currentAreaSelection.label}.`
      : "Trend analysis is currently available only in the live areas below.";
  }

  if (!isLiveArea) {
    els.volumeTrendPanel.classList.remove("is-hidden");
    state.volumeLightboxLegendItems = [];
    els.volumeTrendBody.innerHTML = `
      <div class="volume-unavailable-state">
        <article class="volume-unavailable-callout">
          <span class="eyebrow">Change Analysis Not Available Yet</span>
          <h3>We currently do not have change analysis for this area.</h3>
          <p>Trend analysis is currently available only for the live areas below.</p>
        </article>
        <div class="volume-unavailable-grid">
          ${renderVolumeLiveAreaCards(liveAreaIds)}
        </div>
      </div>
    `;
    setViewerState(false);
    renderVolumeReferenceGallery([]);
    els.volumeMetricGrid.classList.add("is-hidden");
    els.volumeSandboxBanner.innerHTML = `
      <strong>Change analysis is not available for this area yet</strong>
      <p>${escapeHtml(area.label)} has not been wired into the live change-analysis layout yet.</p>
    `;
    els.volumeSummary.textContent = `${area.label} is not currently part of the live change-analysis workflow.`;
    els.volumeImageSummary.textContent = "";
    els.volumeMetricGrid.innerHTML = "";
    els.volumeMethod.innerHTML = "";
    els.volumeNarrative.innerHTML = "";
    els.volumeAreaGrid.innerHTML = "";
    return;
  }

  const [
    baselineImageSrc,
    currentImageSrc,
    previewImageSrc,
    previewBaselineImageSrc,
    previewCurrentImageSrc,
    surveyOneVsTwoHeightSrc,
    surveyOneVsTwoClassSrc,
    surveyOneVsThreeHeightSrc,
    surveyOneVsThreeClassSrc,
    surveyTwoVsThreeHeightSrc,
    surveyTwoVsThreeClassSrc
  ] = await Promise.all([
    baselineSurvey ? resolveExistingAsset(surveyAssetCandidates(project.id, baselineSurvey.id, area.id, "ortho.jpg")) : Promise.resolve(""),
    resolveExistingAsset(surveyAssetCandidates(project.id, survey.id, area.id, "ortho.jpg")),
    previewImageFile
      ? resolveExistingAsset([
        surveyAssetPath(project.id, survey.id, area.id, previewImageFile),
        baselineSurvey ? surveyAssetPath(project.id, baselineSurvey.id, area.id, previewImageFile) : ""
      ])
      : Promise.resolve(""),
    previewBaselineImageFile
      ? resolveExistingAsset([
        baselineSurvey ? surveyAssetPath(project.id, baselineSurvey.id, area.id, previewBaselineImageFile) : "",
        surveyAssetPath(project.id, survey.id, area.id, previewBaselineImageFile)
      ])
      : Promise.resolve(""),
    previewCurrentImageFile
      ? resolveExistingAsset([
        surveyAssetPath(project.id, survey.id, area.id, previewCurrentImageFile),
        baselineSurvey ? surveyAssetPath(project.id, baselineSurvey.id, area.id, previewCurrentImageFile) : ""
      ])
      : Promise.resolve(""),
    resolveExistingAsset(comparisonAssetCandidates(project.id, area.id, "ab", "height")),
    resolveExistingAsset(comparisonAssetCandidates(project.id, area.id, "ab", "classification")),
    resolveExistingAsset(comparisonAssetCandidates(project.id, area.id, "ac", "height")),
    resolveExistingAsset(comparisonAssetCandidates(project.id, area.id, "ac", "classification")),
    resolveExistingAsset(comparisonAssetCandidates(project.id, area.id, "bc", "height")),
    resolveExistingAsset(comparisonAssetCandidates(project.id, area.id, "bc", "classification"))
  ]);

  const baselineImageExists = Boolean(baselineImageSrc);
  const currentImageExists = Boolean(currentImageSrc);
  const useSinglePreview = previewMode === "single" && Boolean(previewImageSrc);
  const usePairedPreview = previewMode === "pair" && Boolean(previewBaselineImageSrc) && Boolean(previewCurrentImageSrc);
  const allReferenceMaps = [
    {
      comparisonKey: "ab",
      eyebrow: "Height change analysis",
      title: "Survey 1 vs Survey 2",
      badge: "Comparison 1",
      label: "Measured surface difference",
      src: surveyOneVsTwoHeightSrc,
      alt: `${area.label} Survey 1 versus Survey 2 height change analysis`,
      caption: "Survey 1 versus Survey 2 height change map. Use this to see where the later survey sits higher or lower across the measured footprint."
    },
    {
      comparisonKey: "ac",
      eyebrow: "Height change analysis",
      title: "Survey 1 vs Survey 3",
      badge: "Comparison 2",
      label: "Measured surface difference",
      src: surveyOneVsThreeHeightSrc,
      alt: `${area.label} Survey 1 versus Survey 3 height change analysis`,
      caption: "Survey 1 versus Survey 3 height change map. This gives the longer-gap view from the March round straight through to June."
    },
    {
      comparisonKey: "bc",
      eyebrow: "Height change analysis",
      title: "Survey 2 vs Survey 3",
      badge: "Comparison 3",
      label: "Measured surface difference",
      src: surveyTwoVsThreeHeightSrc,
      alt: `${area.label} Survey 2 versus Survey 3 height change analysis`,
      caption: "Survey 2 versus Survey 3 height change map. This isolates what changed between the April and June rounds."
    },
    {
      comparisonKey: "ab",
      eyebrow: "Gain and loss classes",
      title: "Survey 1 vs Survey 2",
      badge: "Comparison 1",
      label: "Simplified class view",
      src: surveyOneVsTwoClassSrc,
      alt: `${area.label} Survey 1 versus Survey 2 gain and loss classification`,
      caption: "Survey 1 versus Survey 2 class map. This is the simpler flat-view version for quick client-facing reading."
    },
    {
      comparisonKey: "ac",
      eyebrow: "Gain and loss classes",
      title: "Survey 1 vs Survey 3",
      badge: "Comparison 2",
      label: "Simplified class view",
      src: surveyOneVsThreeClassSrc,
      alt: `${area.label} Survey 1 versus Survey 3 gain and loss classification`,
      caption: "Survey 1 versus Survey 3 class map. This shows the broader build-up and lowering pattern across the full time gap."
    },
    {
      comparisonKey: "bc",
      eyebrow: "Gain and loss classes",
      title: "Survey 2 vs Survey 3",
      badge: "Comparison 3",
      label: "Simplified class view",
      src: surveyTwoVsThreeClassSrc,
      alt: `${area.label} Survey 2 versus Survey 3 gain and loss classification`,
      caption: "Survey 2 versus Survey 3 class map. Use this for the latest repeat-survey pattern only."
    }
  ].filter((item) => item.src);
  const availableComparisonKeys = [...new Set(allReferenceMaps.map((item) => item.comparisonKey))];

  const totals = configuredPolygons.reduce((acc, item) => {
    acc.gain += Number(item.gainM3 || 0);
    acc.loss += Number(item.lossM3 || 0);
    acc.net += Number(item.netM3 || 0);
    return acc;
  }, { gain: 0, loss: 0, net: 0 });

  const setViewerState = (enabled) => {
    els.volumeViewerPanel.classList.toggle("is-hidden", !enabled);
    if (!enabled) {
      els.volumeViewerFrame.removeAttribute("src");
      els.volumeViewerTitle.textContent = "Area Change Viewer";
      els.volumeViewerSummary.textContent = "";
      els.volumeViewerGuide.innerHTML = "";
      els.volumeViewerStats.innerHTML = "";
      els.volumeViewerStats.classList.add("is-hidden");
      els.volumeViewerDetails.innerHTML = "";
      return;
    }

    els.volumeViewerTitle.textContent = viewerTitle;
    els.volumeViewerSummary.textContent = viewerSummary;
    els.volumeViewerGuide.innerHTML = `
      <div class="volume-viewer-guide__head">
        <p class="eyebrow">Before you start</p>
        <h3>${escapeHtml(viewerGuideTitle)}</h3>
      </div>
      <div class="volume-viewer-guide__grid">
        <article class="volume-viewer-guide__card">
          <strong>What this is</strong>
          <p>${escapeHtml(viewerGuideWhatIs)}</p>
        </article>
        <article class="volume-viewer-guide__card">
          <strong>What the colours show</strong>
          <p>${escapeHtml(viewerGuideColours)}</p>
        </article>
        <article class="volume-viewer-guide__card">
          <strong>How to use it</strong>
          <p>${escapeHtml(viewerGuideUse)}</p>
        </article>
      </div>
    `;
    els.volumeViewerFrame.src = viewerEmbedUrl;
    els.volumeViewerStats.innerHTML = "";
    els.volumeViewerStats.classList.add("is-hidden");
    els.volumeViewerDetails.innerHTML = [
      detail("How to use it", "Drag to orbit, scroll to zoom, and pan to inspect where the change surface sits against the underlying terrain."),
      detail("What the colours mean", "Cool colours show relative build-up, warmer colours show relative lowering, and the paired maps underneath give a flatter plan-view readout."),
      detail("Processing note", viewerStats
        ? `Grid size ${viewerStats.gridSize || "--"} with a reporting threshold of ${viewerStats.threshold || "--"}.`
        : "Viewer details will appear here once the viewer metadata has been entered.")
    ].join("");
  };

  const setTrendState = (data) => {
    els.volumeTrendPanel.classList.toggle("is-hidden", !data);
    if (!data) {
      state.volumeLightboxLegendItems = [];
      els.volumeTrendBody.innerHTML = "";
      return;
    }

    const pairSummaries = trendPairSummaries(data.stats);
    const trendClasses = sortedTrendClasses(data.stats.trend_classes || []);
    const topClass = trendClasses[0] || null;
    state.volumeLightboxLegendItems = trendClasses.map((item) => ({
      label: item.label,
      description: trendClassExplanation(item.key),
      meta: `${formatSquareMetres(item.area_m2)} | ${fixed(item.percent_of_classified_area, 1)}% of the classified area`,
      color: `rgb(${item.color_rgba.slice(0, 3).join(",")})`
    }));
    els.volumeTrendBody.innerHTML = `
      <div class="volume-trend-top">
        <div class="volume-trend-callout">
          <div class="volume-trend-callout__head">
            <div>
              <span class="eyebrow">Plain-English takeaway</span>
              <h3>${escapeHtml(data.manifest.summary?.top_trend_class || topClass?.label || "Trend review")}</h3>
            </div>
            <p class="volume-trend-meta">${escapeHtml(`${formatSquareMetres(data.stats.classified_area?.valid_area_m2 || 0)} reviewed | ${fixed(data.stats.classified_area?.coverage_percent_of_boundary || 0, 1)}% coverage | ${fixed(data.stats.classification_threshold_m || 0, 2)} m threshold`)}</p>
          </div>
          <p>${escapeHtml(trendHeadline(topClass))}</p>
        </div>
        <div class="volume-trend-pairs">
          ${pairSummaries.map((item) => `
            <article class="volume-trend-pair-card">
              <p class="eyebrow">${escapeHtml(item.label)}</p>
              <h3>${escapeHtml(item.readoutTitle)}</h3>
              <p>${escapeHtml(item.readoutCopy)}</p>
              <div class="volume-card__grid">
                <div class="volume-mini volume-mini--gain">
                  <span class="muted">Material added</span>
                  <strong>${escapeHtml(formatVolume(item.added))}</strong>
                </div>
                <div class="volume-mini volume-mini--loss">
                  <span class="muted">Material removed</span>
                  <strong>${escapeHtml(formatVolume(item.removed))}</strong>
                </div>
                <div class="volume-mini volume-mini--net">
                  <span class="muted">Overall balance</span>
                  <strong>${escapeHtml(formatVolume(item.net))}</strong>
                </div>
              </div>
              <p class="muted">${escapeHtml(item.supportingCopy)}</p>
            </article>
          `).join("")}
        </div>
      </div>
      <figure class="volume-trend-map" data-area-id="${escapeAttr(area.id)}">
        <button
          class="volume-trend-map__button"
          type="button"
          data-volume-lightbox-src="${escapeAttr(data.imageSrc)}"
          data-volume-lightbox-eyebrow="Trend analysis map"
          data-volume-lightbox-title="${escapeAttr(area.label)} trend pattern"
          data-volume-lightbox-caption="Expanded trend view with the class legend shown alongside it. Use the zoom controls to inspect the map in more detail."
          data-volume-lightbox-alt="Trend classification map for ${escapeAttr(area.label)} across all three survey rounds"
          data-volume-lightbox-legend="trend-map"
        >
          <div class="volume-trend-map__stage">
            <img src="${escapeAttr(data.imageSrc)}" alt="Trend classification map for ${escapeAttr(area.label)} across all three survey rounds">
          </div>
        </button>
        <figcaption class="muted">Use this map as the long-term view. The 3D viewer shows one comparison at a time, while this shows the wider three-round pattern in one place.</figcaption>
      </figure>
      <div class="volume-trend-classes">
        ${trendClasses.map((item) => `
          <article class="volume-trend-class-card">
            <div class="volume-trend-class-card__head">
              <span class="volume-trend-swatch" style="background: rgb(${item.color_rgba.slice(0, 3).join(",")});"></span>
              <strong>${escapeHtml(item.label)}</strong>
            </div>
            <p>${escapeHtml(trendClassExplanation(item.key))}</p>
            <p class="muted">${escapeHtml(`${formatSquareMetres(item.area_m2)} | ${fixed(item.percent_of_classified_area, 1)}% of the classified area`)}</p>
          </article>
        `).join("")}
      </div>
    `;
  };

  setTrendState(trendData);
  els.volumeMetricGrid.classList.add("is-hidden");

  els.volumeSandboxBanner.innerHTML = trendData
    ? `
      <strong>Longer-term trend view available</strong>
      <p>${escapeHtml(area.label)} includes a trend panel here so the longer three-round pattern can be viewed alongside the comparison imagery.</p>
    `
    : `
      <strong>Standard comparison view</strong>
      <p>${escapeHtml(area.label)} is currently shown with the standard comparison layout. A longer-term trend panel can be added here later if needed.</p>
    `;

  if (!baselineSurvey && !volumeDataset) {
    setViewerState(false);
    els.volumeSummary.textContent = `${survey.label} is the baseline round, so sandbar change is not available yet. Switch to a later survey round once a comparison has been calculated.`;
    els.volumeImageSummary.textContent = "The image panel will show the first before-and-after sandbar preview once a later survey round exists.";
    renderVolumeReferenceGallery(currentImageExists ? [{
      eyebrow: "Current aerial view",
      title: survey.shortDate,
      badge: area.overviewCode,
      label: area.label,
      src: currentImageSrc,
      alt: `${area.label} ${survey.label} aerial view`,
      caption: `${area.label} in ${survey.label}. This acts as the visual starting point for later sandbar change reporting.`
    }] : []);
    els.volumeMetricGrid.innerHTML = [
      metric("Selected survey", survey.shortDate, "Current round"),
      metric("Comparison status", "Baseline only", "Change reporting starts on repeat rounds"),
      metric("Current area", area.label, area.overviewCode),
      metric("Next stage", "Awaiting repeat comparison", "Volume change reporting begins once a later survey round has been compared")
    ].join("");
    els.volumeMethod.innerHTML = [
      detail("How this will work", "Sandbar change is measured by comparing one elevation surface with another inside fixed sandbar polygons."),
      detail("What goes into the app", "A simple preview image, plus clear added, removed, and overall balance figures for each measured sandbar.")
    ].join("");
    els.volumeNarrative.innerHTML = [
      detail("Why this matters", "This page is here to show whether the estuary bars are building up, flattening out, or wearing away between survey rounds."),
      detail("What people should see", "A simple visual preview first, followed by easy-to-read numbers that explain what changed.")
    ].join("");
    els.volumeAreaGrid.innerHTML = polygons.length
      ? polygons.map((item) => `
        <article class="card">
          <p class="muted">${escapeHtml(area.overviewCode)} - ${escapeHtml(item.id || "")}</p>
          <h3>${escapeHtml(item.label)}</h3>
          <p>${escapeHtml(item.notes || "Measured sandbar polygon ready. Repeat-survey results will slot into this shape once the comparison is processed.")}</p>
        </article>
      `).join("")
      : `
        <article class="card">
          <p class="muted">${escapeHtml(area.overviewCode)} - ${escapeHtml(area.label)}</p>
          <h3>Awaiting first comparison dataset</h3>
          <p>Once a repeat survey has been processed, this page will show per-sandbar added, removed, and overall balance figures for this area.</p>
        </article>
      `;
    return;
  }

  setViewerState(Boolean(viewerEmbedUrl));

  const baselineLabel = volumeDataset?.baselineSurveyId
    ? (project.surveys.find((item) => item.id === volumeDataset.baselineSurveyId)?.label || baselineSurvey?.label || "baseline survey")
    : (baselineSurvey?.label || "baseline survey");

  if (!hasConfiguredRows && !useSinglePreview && !usePairedPreview && !allReferenceMaps.length && !trendData) {
    const previewFallbackCards = [];
    if (currentImageExists) {
      previewFallbackCards.push({
        eyebrow: "Preview coming soon",
        title: `${area.label} test area`,
        badge: survey.shortDate,
        label: "Latest aerial context",
        src: currentImageSrc,
        alt: `${area.label} ${survey.label} aerial view`,
        caption: `${area.label} does not yet have a finished preview map or measured sandbar figures for this comparison.`
      });
    } else if (baselineImageExists) {
      previewFallbackCards.push({
        eyebrow: "Preview coming soon",
        title: `${area.label} test area`,
        badge: baselineSurvey?.shortDate || "Baseline",
        label: "Earlier aerial context",
        src: baselineImageSrc,
        alt: `${area.label} ${baselineLabel} aerial view`,
        caption: `${area.label} does not yet have a finished preview map or measured sandbar figures for this comparison.`
      });
    }
    renderVolumeReferenceGallery(previewFallbackCards);
    els.volumeSummary.textContent = `${area.label} is awaiting its finished sandbar volume comparison outputs. This page will expand as the measured results are added.`;
    els.volumeImageSummary.textContent = "The finished preview map and measured sandbar figures have not been added yet for this area.";
  } else {
    if (useSinglePreview) {
      renderVolumeReferenceGallery([{
        eyebrow: "Preview change map",
        title: previewLabel,
        badge: `${baselineSurvey?.shortDate || baselineLabel} to ${survey.shortDate}`,
        label: area.label,
        src: previewImageSrc,
        alt: `${area.label} sandbar change preview`,
        caption: previewCaption
      }], { single: true });
    els.volumeSummary.textContent = `${area.label} is being compared between ${baselineSurvey?.shortDate || baselineLabel} and ${survey.shortDate}. This first preview shows where the monitored sandbar appears to have built up or worn away over the short gap between surveys.`;
    els.volumeImageSummary.textContent = "The preview map keeps things simple: it shows the measured sandbar, where the change is concentrated, and how the later survey compares with the earlier one.";
    } else if (usePairedPreview) {
      renderVolumeReferenceGallery(allReferenceMaps.length ? allReferenceMaps : [
        {
          eyebrow: previewBaselineLabel || "Height change analysis",
          title: "Survey 1 vs Survey 2",
          badge: "Comparison 1",
          label: "Measured surface difference",
          src: previewBaselineImageSrc,
          alt: `${area.label} ${baselineLabel} volume change context`,
          caption: previewBaselineCaption || `${area.label} with the measured change overlay shown against the earlier survey context.`
        },
        {
          eyebrow: previewCurrentLabel || "Gain and loss classification",
          title: "Survey 1 vs Survey 2",
          badge: "Comparison 1",
          label: "Simplified class view",
          src: previewCurrentImageSrc,
          alt: `${area.label} ${survey.label} volume change context`,
          caption: previewCurrentCaption || `${area.label} with the measured change overlay shown against the later survey context.`
        }
      ]);
      els.volumeSummary.textContent = `${area.label} is being compared between ${baselineSurvey?.shortDate || baselineLabel} and ${survey.shortDate}. This setup now pairs the live change viewer with every flat comparison set that is currently available for this area.`;
      els.volumeImageSummary.textContent = "The available survey comparisons are shown together here. Click any one to open it full screen and zoom in.";
    } else {
      const beforeAfterCards = [];
      if (baselineImageExists) {
        beforeAfterCards.push({
          eyebrow: "Earlier aerial view",
          title: baselineSurvey?.shortDate || "Earlier survey",
          badge: "Before",
          label: area.label,
          src: baselineImageSrc,
          alt: `${area.label} ${baselineLabel} aerial view`,
          caption: `${area.label} before the measured change. Use this to see the earlier sandbar shape and exposed ground pattern.`
        });
      }
      if (currentImageExists) {
        beforeAfterCards.push({
          eyebrow: "Later aerial view",
          title: survey.shortDate,
          badge: "After",
          label: area.label,
          src: currentImageSrc,
          alt: `${area.label} ${survey.label} aerial view`,
          caption: `${area.label} during the later survey round. The figures below describe how this surface differs from the earlier one.`
        });
      }
      renderVolumeReferenceGallery(beforeAfterCards);
      if (!beforeAfterCards.length) {
        renderVolumeReferenceGallery([]);
      }
      els.volumeSummary.textContent = `${survey.label} is being compared against ${baselineLabel} for ${area.label}. This view turns the measured surface change into a simple before-and-after sandbar story.`;
      els.volumeImageSummary.textContent = "These aerial views give quick visual context for the same monitored area. The figures underneath explain how much material appears to have been added or removed.";
    }
  }

  els.volumeMetricGrid.innerHTML = hasConfiguredRows
    ? [
      metric("Measured sandbar zones", String(polygons.length), area.overviewCode),
      metric("Material added", formatVolume(totals.gain), "More material appears in the later survey"),
      metric("Material removed", formatVolume(totals.loss), "Less material appears in the later survey"),
      metric("Overall balance", formatVolume(totals.net), totals.net >= 0 ? "More material overall in the later survey" : "Less material overall in the later survey")
    ].join("")
    : [
      metric("Measured sandbar zones", String(polygons.length), area.overviewCode),
      metric("Comparison pair", `${baselineSurvey?.shortDate || "Baseline"} to ${survey.shortDate}`, "Imagery ready"),
      metric("Monitoring zones", polygons.length ? "Available" : "Pending", polygons.length ? "Fixed monitoring zones are in place" : "Monitoring zones have not been added to this view yet"),
      metric("Reported figures", "Awaiting values", "Measured gain, loss, and net figures will appear here once they are available")
    ].join("");

  els.volumeMethod.innerHTML = `
    <div class="volume-explainer">
      <div class="volume-explainer__block">
        <strong>What this page is doing now</strong>
        <p>This page now combines three layers of evidence for ${escapeHtml(area.label)}: the interactive 3D comparison viewer, the longer-term trend map across all three survey rounds, and the flat reference maps underneath.</p>
      </div>
      <div class="volume-explainer__block">
        <strong>How to read it in order</strong>
        <p>Start with the 3D viewer for detailed shape change, use the trend panel to see whether movement is repeating or reversing across the full survey set, then use the six reference maps for a simpler side-by-side plan-view check.</p>
      </div>
      <div class="volume-explainer__block">
        <strong>How the trend layer is built</strong>
        <p>The trend panel is not just one before-and-after comparison. It looks across Survey 1, Survey 2, and Survey 3 together so we can separate steady build-up, steady lowering, and areas that changed direction over time.</p>
      </div>
      <div class="volume-explainer__block">
        <strong>Current area note</strong>
        <p>${escapeHtml(areaDataset?.notes || "Add a short plain-English note here to explain what changed in this part of the estuary.")}</p>
      </div>
    </div>
  `;

  els.volumeNarrative.innerHTML = `
    <div class="volume-explainer">
      <div class="volume-explainer__block">
        <strong>What is live right now</strong>
        <p>${escapeHtml(area.label)} is using the current live change-analysis layout. Where the trend package is present, the page can now bring the three-round story, the change viewer, and the exported flat maps together in one place.</p>
      </div>
      <div class="volume-explainer__block">
        <strong>What the client should take from it</strong>
        <p>The top half of the page explains where the estuary appears to be repeatedly building up, repeatedly lowering, or changing direction between rounds. The lower reference maps then let people compare whichever survey pairs are ready for this area without leaving the page.</p>
      </div>
      <div class="volume-explainer__block">
        <strong>What comes next</strong>
        <p>Any future areas can now use this same structure: 3D viewer at the top, trend summary in the middle, and a six-image comparison strip underneath with click-to-expand detail when needed.</p>
      </div>
    </div>
  `;

  els.volumeAreaGrid.innerHTML = comparisonReadinessCards(trendData, area.label, availableComparisonKeys);
}

async function renderAdmin() {
  const project = currentProject();
  const survey = currentSurvey();
  const area = currentArea();
  if (!state.accessUsers.length) {
    try {
      await refreshAccessUsers();
    } catch (error) {
      els.accessUserStatus.innerHTML = detail("Report logins", error.message);
    }
  }
  const areaHasOverride = Boolean(areaOverride(project, survey.id, area.id) && Object.keys(areaOverride(project, survey.id, area.id)).length);
  const volumeDataset = project.volumeChangeComparisons?.[survey.id]?.areas?.[area.id] || null;
  fillSelect(
    els.newSurveyBaseline,
    project.surveys.map((item) => [item.id, item.label]),
    project.surveys[project.surveys.length - 1]?.id || survey.id
  );
  if (!els.createSurveyStatus.innerHTML.trim()) {
    els.createSurveyStatus.innerHTML = detail("Create survey round", "Add the next survey here with its name and dates. The system will scaffold the folders and make it available in the dropdowns.");
  }
  const expectedFiles = assetSettings.expectedSurveyAssets.slice(0, 3).map((item) => ({
    id: item.inputId,
    label: item.label,
    description: item.description
  }));

  els.adminTargetSummary.textContent = `Uploads for ${survey.label} and ${area.label} will be written to survey-data/${project.id}/${survey.id}/${area.id}/.`;
  els.adminExpectedFiles.innerHTML = expectedFiles.map((item) => detail(item.label, item.description)).join("")
    + detail("Shared section assets", "Section-line imagery, section CSVs, line geometry, and sandbar polygons can now live once under shared-data and be reused across survey rounds.");
  els.adminMetadataSummary.textContent = `${area.overviewCode} in ${survey.label}. Edit the timing, monitoring context, weather notes, and interpretation here.`;
  populateAreaMetadataForm(area.id, survey.id);
  els.areaMetadataStatus.innerHTML = detail(
    "Survey area notes",
    areaHasOverride
      ? "This area is already using survey-specific notes for the selected round."
      : "This area is currently using the shared baseline notes. Save here to create a survey-specific version."
  );
  if (!els.adminUploadStatus.innerHTML.trim()) {
    els.adminUploadStatus.innerHTML = detail("Status", "Choose any subset of files and upload them. The readiness view will refresh afterwards.");
  }
  els.volumeAdminSummary.textContent = `${area.overviewCode} in ${survey.label}. Add one row per sandbar using label|gain|loss|net|confidence|summary.`;
  els.volumeMethodInput.value = volumeDataset?.method || project.volumeChangeComparisons?.[survey.id]?.method || volumeChangeSettings.defaultMethod;
  els.volumeCellSizeInput.value = volumeDataset?.cellSize || project.volumeChangeComparisons?.[survey.id]?.cellSize || "";
  els.volumeNotesInput.value = volumeDataset?.notes || "";
  els.volumeRowsInput.value = serialiseVolumeRows(volumeDataset?.polygons || []);
  els.volumeAdminStatus.innerHTML = detail(
    "Volume change",
    volumeDataset?.polygons?.length
      ? `${volumeDataset.polygons.length} sandbar row(s) currently saved for this survey and area.`
      : "No sandbar volume rows saved yet for this survey and area."
  );

  const coverage = await buildSurveyCoverage(project, survey);
  const onboarding = await deriveProjectOnboarding(project, survey, coverage);
  renderOnboardingChecklist(els.adminOnboardingSummary, els.adminOnboardingDetails, onboarding);
  els.adminBoardSummary.innerHTML = [
    metric("Complete areas", String(coverage.completeAreas), "All files present"),
    metric("Partial areas", String(coverage.partialAreas), "Some files present"),
    metric("Missing areas", String(coverage.missingAreas), "No files present"),
    metric("Files present", `${coverage.presentFiles}/${coverage.totalFiles}`, "Expected files across this survey")
  ].join("");

  const manifestRows = await Promise.all(coverage.areas.map(async (item) => ({
    ...item,
    manifest: await loadManifest(project.id, survey.id, item.areaId)
  })));

  els.adminBoardGrid.innerHTML = manifestRows.map((item) => {
    const manifestStatus = item.manifest?.status || item.statusLabel.toLowerCase();
    const manifestUpdated = item.manifest?.lastUpdated
      ? new Date(item.manifest.lastUpdated).toLocaleString("en-GB")
      : "Not yet written";
    const presentText = item.presentFiles.length ? `Present: ${item.presentFiles.join(", ")}` : "No expected files uploaded yet.";
    const missingText = item.missingFiles.length ? `Missing: ${item.missingFiles.join(", ")}` : "All expected files are present.";
    return `
      <article class="card admin-board-card">
        <div class="admin-board-meta">
          <span class="chip">${escapeHtml(item.areaLabel)}</span>
          <span class="chip">${escapeHtml(capitalise(manifestStatus))}</span>
        </div>
        <h3>${item.presentCount}/${item.totalCount} files present</h3>
        <p>${escapeHtml(presentText)}</p>
        <p>${escapeHtml(missingText)}</p>
        <p>${escapeHtml(`Target: survey-data/${project.id}/${survey.id}/${item.areaId}/`)}</p>
        <p>${escapeHtml(`Manifest updated: ${manifestUpdated}`)}</p>
        <p><button class="area-action" type="button" data-admin-area="${escapeHtml(item.areaId)}">Manage This Area</button></p>
      </article>
    `;
  }).join("");

  els.adminBoardGrid.querySelectorAll("[data-admin-area]").forEach((button) => {
    button.addEventListener("click", () => {
      updateArea(button.dataset.adminArea);
      activateTab("admin");
    });
  });

  renderAccessUsersAdmin();
}

function updateArea(areaId) {
  const area = areas().find((item) => item.id === areaId) || areas()[0];
  state.areaId = area.id;
  state.sectionId = area.sections[0].id;
  state.sectionHoverDistance = null;
  state.layerKey = "ortho";
  resetView();
  fillSelect(els.areaSelect, areaSelectOptions(), state.areaId);
  renderShellStage();
  renderAreas();
  renderPanorama();
  renderVolume();
  renderLayers();
  renderSections();
  renderAdminIfEnabled();
  syncUrlState();
}

function renderSectionHero(area, section, survey, activeProfiles, rows) {
  const comparisonLabel = activeProfiles
    .map((profile) => profile.survey.shortDate || profile.survey.label)
    .filter(Boolean)
    .join(" vs ");

  els.sectionHeroTitle.textContent = `${area.label} ${section.label}`;
  els.sectionHeroSummary.textContent = `${section.label} is a fixed section through ${area.label}, making it easier to read change along one consistent line without losing the wider aerial context.`;
  els.sectionSurveyPill.innerHTML = `
    <span class="section-survey-pill__label">Survey Dates</span>
    <strong class="section-survey-pill__value">${escapeHtml(comparisonLabel || survey.shortDate || survey.label)}</strong>
  `;
  els.sectionHeroStats.innerHTML = "";
}

function sectionHeroStat(label, value, copy) {
  return `
    <article class="section-hero-stat">
      <span class="section-hero-stat__label">${escapeHtml(label)}</span>
      <strong class="section-hero-stat__value">${escapeHtml(value)}</strong>
      <span class="section-hero-stat__copy">${escapeHtml(copy)}</span>
    </article>
  `;
}

function renderAdminIfEnabled() {
  if (adminToolsEnabled()) {
    renderAdmin();
  }
}

function normaliseSectionId(value) {
  const text = String(value || "").trim();
  const match = text.match(/^A(\d+)-?(\d{2})$/i) || text.match(/^A(\d)(\d{2})$/i);
  if (!match) {
    return text;
  }
  return `A${Number(match[1])}-${match[2]}`;
}

function sectionSuffixFromValue(value) {
  const text = String(value || "").trim();
  const appMatch = text.match(/^A(\d+)-?(\d{2})$/i) || text.match(/^A(\d)(\d{2})$/i);
  if (appMatch) {
    return appMatch[2];
  }

  const plainMatch = text.match(/^0*(\d{1,2})$/);
  if (plainMatch) {
    return String(Number(plainMatch[1])).padStart(2, "0");
  }

  const sectionWordMatch = text.match(/^section\s*0*(\d{1,2})$/i);
  if (sectionWordMatch) {
    return String(Number(sectionWordMatch[1])).padStart(2, "0");
  }

  return "";
}

function csvSectionIdMatches(currentValue, targetValue) {
  const currentText = String(currentValue || "").trim();
  const targetText = String(targetValue || "").trim();

  if (!currentText || !targetText) {
    return false;
  }

  if (normaliseSectionId(currentText) === normaliseSectionId(targetText)) {
    return true;
  }

  const currentSuffix = sectionSuffixFromValue(currentText);
  const targetSuffix = sectionSuffixFromValue(targetText);
  return Boolean(currentSuffix && targetSuffix && currentSuffix === targetSuffix);
}

function cleanCsvCell(value) {
  const text = String(value ?? "").replace(/^\uFEFF/, "").trim();
  if (text.startsWith("\"") && text.endsWith("\"")) {
    return text.slice(1, -1).replace(/""/g, "\"");
  }
  return text;
}

async function loadSectionRows(path, sectionId) {
    const response = await fetch(path);
    if (!response.ok) return [];
    const text = (await response.text()).replace(/^\uFEFF/, "");
    const lines = text.trim().split(/\r?\n/);
    const headers = (lines[0] || "").split(",").map((item) => cleanCsvCell(item).toLowerCase());
    const sectionIndex = headers.indexOf("section_id");
    const labelIndex = headers.indexOf("label");
    const sortOrderIndex = headers.indexOf("sort_order");
    const heightIndex = headers.indexOf("height_m");
    const distanceIndex = headers.indexOf("distance_m") >= 0 ? headers.indexOf("distance_m") : headers.indexOf("discance_m");
    return lines.slice(1).map((line) => {
      const columns = line.split(",").map(cleanCsvCell);
      const currentSectionId = columns[sectionIndex] ?? columns[0];
      const label = columns[labelIndex] ?? columns[1];
      const sortOrder = columns[sortOrderIndex] ?? columns[2];
      const height = columns[heightIndex] ?? columns[3];
      const distance = columns[distanceIndex] ?? columns[4];
      return {
        sectionId: normaliseSectionId(currentSectionId),
        label,
        sortOrder: Number(sortOrder),
        height: Number(height),
        distance: Number(distance)
      };
    }).filter((row) => csvSectionIdMatches(row.sectionId, sectionId));
  }

async function loadSectionRowsFromCandidates(candidates, sectionId) {
  for (const candidate of Array.from(new Set(candidates)).filter(Boolean)) {
    const rows = await loadSectionRows(candidate, sectionId);
    if (rows.length) {
      return rows;
    }
  }
  return [];
}

async function loadSectionRowsForSurvey(projectId, survey, areaId, sectionId) {
  const csvCandidates = [
    ...surveyAssetCandidates(projectId, survey.id, areaId, "section_profiles.csv"),
    ...sharedAreaAssetCandidates(projectId, areaId, "section_profiles.csv")
  ];
  const rows = await loadSectionRowsFromCandidates(csvCandidates, sectionId);
  return normaliseSectionRows(rows);
}

function normaliseSectionRows(rows) {
  return rows
    .filter((row) => Number.isFinite(row.height) && Number.isFinite(row.distance))
    .sort((a, b) => a.distance - b.distance)
    .map((row) => ({
    ...row,
    height: row.height < -3 ? -3 : row.height
  }));
}

function nearestSectionRow(rows, targetDistance) {
  if (!rows.length || !Number.isFinite(targetDistance)) {
    return null;
  }
  return rows.reduce((best, row) => (
    Math.abs(row.distance - targetDistance) < Math.abs(best.distance - targetDistance) ? row : best
  ));
}

function buildSectionDifferenceSeries(anchorRows, compareRows) {
  const compareByDistance = new Map(compareRows.map((row) => [row.distance, row]));
  return anchorRows.flatMap((anchorRow) => {
    const compareRow = compareByDistance.get(anchorRow.distance);
    if (!compareRow) {
      return [];
    }
    if (anchorRow.height === 0 || compareRow.height === 0) {
      return [];
    }
    return [{
      distance: anchorRow.distance,
      delta: compareRow.height - anchorRow.height
      }];
    });
  }

function chartHoverDistanceFromPointer(event, svg, activeProfiles, metrics) {
  const { width, pad, minX, xSpan, plotWidth } = metrics;
  const rect = svg.getBoundingClientRect();
  const pointerX = ((event.clientX - rect.left) / rect.width) * width;
  const plotLeft = pad.left;
  const plotRight = pad.left + plotWidth;

  if (pointerX < plotLeft || pointerX > plotRight) {
    return null;
  }

  const hoverDistance = minX + (((pointerX - pad.left) / plotWidth) * xSpan);
  return clamp(hoverDistance, minX, minX + xSpan);
}

function focusedSectionComparison(anchorProfile, comparisonProfiles, hoverDistance = state.sectionHoverDistance) {
  if (!anchorProfile?.rows?.length || !comparisonProfiles.length) {
    return null;
  }

  const prepared = comparisonProfiles
    .map((profile) => ({
      ...profile,
      differences: buildSectionDifferenceSeries(anchorProfile.rows, profile.rows)
    }))
    .filter((profile) => profile.differences.length);

  if (!prepared.length) {
    return null;
  }

  const distance = Number.isFinite(hoverDistance)
    ? hoverDistance
    : null;

  const enriched = prepared.map((profile) => {
    const focusDifference = distance === null
      ? profile.differences.reduce((best, row) => (
        Math.abs(row.delta) > Math.abs(best.delta) ? row : best
      ), profile.differences[0])
      : nearestSectionRow(profile.differences, distance);
    return {
      ...profile,
      focusDifference
    };
  }).filter((profile) => profile.focusDifference);

  if (!enriched.length) {
    return null;
  }

  return enriched.reduce((best, profile) => {
    if (!best) {
      return profile;
    }
    return Math.abs(profile.focusDifference.delta) > Math.abs(best.focusDifference.delta)
      ? profile
      : best;
  }, null);
}

function sectionComparisonPairs(activeProfiles, hoverDistance = state.sectionHoverDistance) {
  if (activeProfiles.length < 2) {
    return [];
  }

  const orderedProfiles = [...activeProfiles].sort((left, right) => (
    String(left.survey.dateFrom || left.survey.id).localeCompare(String(right.survey.dateFrom || right.survey.id))
  ));

  return orderedProfiles.flatMap((profile, index) => {
    const nextProfile = orderedProfiles[index + 1];
    if (!nextProfile) {
      return [];
    }
    const differences = buildSectionDifferenceSeries(profile.rows, nextProfile.rows);
    if (!differences.length) {
      return [];
    }
    const focusDifference = Number.isFinite(hoverDistance)
      ? nearestSectionRow(differences, hoverDistance)
      : differences.reduce((best, row) => (
        Math.abs(row.delta) > Math.abs(best.delta) ? row : best
      ), differences[0]);
    if (!focusDifference) {
      return [];
    }
    return [{
      fromProfile: profile,
      toProfile: nextProfile,
      focusDifference
    }];
  });
}

function sectionInsetWindowRows(rows, centerDistance, radius = 6) {
  return rows.filter((row) => Math.abs(row.distance - centerDistance) <= radius);
}

function classifySectionTrend(steps) {
  const significantSteps = steps.map((step) => ({
    ...step,
    direction: step.delta > 0.03 ? "up" : step.delta < -0.03 ? "down" : "flat"
  }));
  const directions = significantSteps.map((step) => step.direction);
  const nonFlat = directions.filter((direction) => direction !== "flat");

  if (!nonFlat.length) {
    return {
      label: "Mostly stable",
      text: "The selected point changes very little across the active survey rounds, so this looks broadly stable rather than clearly building up or eroding."
    };
  }

  if (nonFlat.every((direction) => direction === "up")) {
    return {
      label: "Consistent build-up",
      text: "Each active survey sits a little higher than the one before it, suggesting repeated build-up at this point."
    };
  }

  if (nonFlat.every((direction) => direction === "down")) {
    return {
      label: "Consistent erosion",
      text: "Each active survey sits lower than the one before it, suggesting repeated lowering or erosion at this point."
    };
  }

  if (nonFlat[0] === "up" && nonFlat.includes("down")) {
    return {
      label: "Build then erosion",
      text: "The point rises in one step and then drops back in a later step, so the change is not consistently building in one direction."
    };
  }

  if (nonFlat[0] === "down" && nonFlat.includes("up")) {
    return {
      label: "Erosion then build",
      text: "The point drops first and then rises later, so the change appears to reverse rather than continue steadily."
    };
  }

  return {
    label: "Mixed change",
    text: "The active survey rounds do not show one simple direction of change here, so this point is best read as mixed or reversing."
  };
}

function renderSectionTrendMini(steps, orderedProfiles) {
  if (!els.sectionTrendMini) {
    return;
  }
  const maxHeight = Math.max(...orderedProfiles.map((profile) => profile.heightAtFocus));
  const minHeight = Math.min(...orderedProfiles.map((profile) => profile.heightAtFocus));
  const span = Math.max(0.12, maxHeight - minHeight);
  els.sectionTrendMini.innerHTML = orderedProfiles.map((profile) => {
    const barHeight = 14 + (((profile.heightAtFocus - minHeight) / span) * 38);
    return `
      <div class="section-trend-mini__step">
        <div class="section-trend-mini__bar" style="height:${fixed(barHeight, 1)}px;background:${profile.color}"></div>
        <span class="section-trend-mini__label">${escapeHtml(profile.survey.shortDate || profile.survey.label)}</span>
      </div>
    `;
  }).join("");
}

function openCurrentSectionComparisonSnapshot() {
  if (!state.sectionComparisonSnapshot) {
    return;
  }
  openSectionInsightOverlay(
    state.sectionComparisonSnapshot.eyebrow,
    state.sectionComparisonSnapshot.title,
    state.sectionComparisonSnapshot.summary,
    state.sectionComparisonSnapshot.body,
    true
  );
}

function sectionComparisonWarnings(orderedProfiles) {
  const warnings = [];
  const hasWaterSegment = orderedProfiles.some((profile) => profile.heightAtFocus <= -2.99);
  const hasBeyondSurveySegment = orderedProfiles.some((profile) => profile.heightAtFocus === 0);

  if (hasWaterSegment) {
    warnings.push("Flat -3 m stretches usually mark water, so they are not reliable for comparison.");
  }

  if (hasBeyondSurveySegment) {
    warnings.push("Dotted or zero-height stretches usually mark where the survey area ended, so they are not reliable for comparison.");
  }

  return warnings;
}

function renderSectionComparisonSummary(profiles, anchorSurveyId = state.surveyId) {
  const activeProfiles = profiles.filter((profile) => profile.selected && profile.rows.length);
  const comparisonPairs = sectionComparisonPairs(activeProfiles);

  if (!comparisonPairs.length) {
    els.sectionComparisonSummary.classList.add("hidden");
    els.sectionAnalysisGrid.classList.remove("section-analysis-grid--with-comparison");
    state.sectionComparisonSnapshot = null;
    els.sectionDifferenceValue.innerHTML = `<p class="section-difference-card__value">--</p>`;
    els.sectionDifferenceSurveyLabel.textContent = "Live comparison along this section.";
    els.sectionDifferenceText.textContent = "Tick one or more survey rounds to compare the same fixed section.";
    els.sectionTrendLabel.textContent = "Awaiting comparison";
    els.sectionTrendText.textContent = "Tick one or more survey rounds to see whether this point is building up, eroding, or reversing.";
    els.sectionTrendMini.innerHTML = "";
    els.sectionDifferenceRange.textContent = "A short window around the current cursor position.";
    els.sectionDifferenceInset.innerHTML = "";
    return;
  }

  const focusDistance = comparisonPairs.reduce((best, pair) => {
    if (!best) {
      return pair.focusDifference;
    }
    return Math.abs(pair.focusDifference.delta) > Math.abs(best.delta)
      ? pair.focusDifference
      : best;
  }, null)?.distance;

  if (!Number.isFinite(focusDistance)) {
    els.sectionComparisonSummary.classList.add("hidden");
    els.sectionAnalysisGrid.classList.remove("section-analysis-grid--with-comparison");
    state.sectionComparisonSnapshot = null;
    els.sectionTrendMini.innerHTML = "";
    els.sectionDifferenceInset.innerHTML = "";
    return;
  }

  const focusedPairs = comparisonPairs.flatMap((pair) => {
    const fromRow = nearestSectionRow(pair.fromProfile.rows, focusDistance);
    const toRow = nearestSectionRow(pair.toProfile.rows, focusDistance);
    if (!fromRow || !toRow) {
      return [];
    }
    const delta = toRow.height - fromRow.height;
    const leadingColor = delta > 0.005
      ? pair.toProfile.color
      : delta < -0.005
        ? pair.fromProfile.color
        : "#eef4ff";
    const directionText = delta > 0.005
      ? `${pair.toProfile.survey.shortDate || pair.toProfile.survey.label} is above ${pair.fromProfile.survey.shortDate || pair.fromProfile.survey.label}`
      : delta < -0.005
        ? `${pair.fromProfile.survey.shortDate || pair.fromProfile.survey.label} is above ${pair.toProfile.survey.shortDate || pair.toProfile.survey.label}`
        : `${pair.toProfile.survey.shortDate || pair.toProfile.survey.label} matches ${pair.fromProfile.survey.shortDate || pair.fromProfile.survey.label}`;
    return [{
      ...pair,
      fromRow,
      toRow,
      delta,
      leadingColor,
      directionText
    }];
  });

  if (!focusedPairs.length) {
    els.sectionComparisonSummary.classList.add("hidden");
    els.sectionAnalysisGrid.classList.remove("section-analysis-grid--with-comparison");
    state.sectionComparisonSnapshot = null;
    els.sectionTrendMini.innerHTML = "";
    els.sectionDifferenceInset.innerHTML = "";
    return;
  }

  const orderedProfiles = [...new Map(focusedPairs.flatMap((pair) => [
    [pair.fromProfile.survey.id, pair.fromProfile],
    [pair.toProfile.survey.id, pair.toProfile]
  ])).values()]
    .map((profile) => {
      const focusRow = nearestSectionRow(profile.rows, focusDistance);
      return focusRow
        ? { ...profile, heightAtFocus: focusRow.height }
        : null;
    })
    .filter(Boolean)
    .sort((left, right) => String(left.survey.dateFrom || left.survey.id).localeCompare(String(right.survey.dateFrom || right.survey.id)));

  const trend = classifySectionTrend(focusedPairs);
  const warnings = sectionComparisonWarnings(orderedProfiles);

  els.sectionComparisonSummary.classList.remove("hidden");
  els.sectionAnalysisGrid.classList.add("section-analysis-grid--with-comparison");
  els.sectionDifferenceSurveyLabel.textContent = "";
  els.sectionDifferenceValue.innerHTML = focusedPairs.map((pair) => `
    <div class="section-difference-card__row">
      <span class="section-difference-card__row-label">${escapeHtml(`${pair.fromProfile.survey.shortDate || pair.fromProfile.survey.label} to ${pair.toProfile.survey.shortDate || pair.toProfile.survey.label}`)}</span>
      <p class="section-difference-card__value" style="color:${pair.leadingColor}">${pair.delta >= 0 ? "+" : ""}${fixed(pair.delta, 2)} m</p>
    </div>
  `).join("");
  els.sectionDifferenceText.textContent = "";
  els.sectionTrendLabel.textContent = trend.label;
  els.sectionTrendText.textContent = `${trend.text} At ${fixed(focusDistance, 1)} m along the section, the active profile point is being compared across ${orderedProfiles.length} survey rounds.`;
  renderSectionTrendMini(focusedPairs, orderedProfiles);
  els.sectionDifferenceRange.textContent = `Local zoom from ${fixed(Math.max(0, focusDistance - 6), 1)} m to ${fixed(focusDistance + 6, 1)} m.`;

  drawSectionDifferenceInset(
    orderedProfiles,
    focusDistance
  );

  const localZoomMarkup = els.sectionDifferenceInset.innerHTML
    ? `
      <div class="section-snapshot-localzoom">
        <strong>Local zoom</strong>
        <p>${escapeHtml(`Snapshot from ${fixed(Math.max(0, focusDistance - 6), 1)} m to ${fixed(focusDistance + 6, 1)} m around the selected point.`)}</p>
        <svg viewBox="0 0 380 150" role="img" aria-label="Local section comparison zoom snapshot">${els.sectionDifferenceInset.innerHTML}</svg>
      </div>
    `
    : "";

  const snapshotBody = `
    <div class="section-snapshot-body">
      <div class="detail-list">
        <div class="detail-item">
          <strong>Trend</strong>
          <p>${escapeHtml(trend.label)}</p>
        </div>
        <div class="detail-item">
          <strong>What it suggests</strong>
          <p>${escapeHtml(trend.text)}</p>
        </div>
        <div class="detail-item">
          <strong>Point along section</strong>
          <p>${escapeHtml(`${fixed(focusDistance, 1)} m along the fixed section line.`)}</p>
        </div>
        ${warnings.length ? `
          <div class="detail-item">
            <strong>Use with caution</strong>
            <p>${escapeHtml(warnings.join(" "))}</p>
          </div>
        ` : ""}
      </div>
      <div class="detail-list">
        ${focusedPairs.map((pair) => `
          <div class="detail-item">
            <strong>${escapeHtml(`${pair.fromProfile.survey.shortDate || pair.fromProfile.survey.label} to ${pair.toProfile.survey.shortDate || pair.toProfile.survey.label}`)}</strong>
            <p>${escapeHtml(`${pair.delta >= 0 ? "+" : ""}${fixed(pair.delta, 2)} m. ${pair.directionText}.`)}</p>
          </div>
        `).join("")}
      </div>
      <div class="detail-list">
        <div class="detail-item">
          <strong>Local window</strong>
          <p>${escapeHtml(`This snapshot focuses on ${fixed(Math.max(0, focusDistance - 6), 1)} m to ${fixed(focusDistance + 6, 1)} m around the selected point.`)}</p>
        </div>
      </div>
      ${localZoomMarkup}
    </div>
  `;
  state.sectionComparisonSnapshot = {
    eyebrow: "Section Snapshot",
    title: trend.label,
    summary: `${fixed(focusDistance, 1)} m along ${state.sectionId}. ${orderedProfiles.length} active survey rounds compared.`,
    body: snapshotBody
  };
}

function drawChart(profiles) {
  const area = state.sectionArea || currentArea();
  drawSectionChart(profiles, area.sections.find((item) => item.id === state.sectionId) || area.sections[0], state.surveyId);
}

  function renderSectionMap(area, section, basemapPath, overlayPath, basemapExists, overlayExists, rows) {
    els.sectionBaseImage.src = basemapExists ? basemapPath : "";
    els.sectionBaseImage.alt = `${area.label} ${state.sectionBasemap}`;
    els.sectionOverlayImage.src = overlayExists ? overlayPath : "";
    els.sectionOverlayImage.alt = `${area.label} section lines`;
    els.sectionHotspots.innerHTML = "";
    els.sectionQuickSelect.innerHTML = area.sections.map((item) => `
      <button class="chip ${item.id === section.id ? "active" : ""}" type="button" data-section-quick="${escapeHtml(item.id)}">
        ${escapeHtml(item.label)}
      </button>
    `).join("");

    els.sectionQuickSelect.querySelectorAll("[data-section-quick]").forEach((button) => {
      button.addEventListener("click", () => {
        state.sectionId = button.dataset.sectionQuick;
        state.sectionHoverDistance = null;
        renderSections();
        syncUrlState();
      });
    });

    els.sectionMapMarker.classList.add("hidden");
  }

  function activeSectionMapImage() {
    if (els.sectionOverlayImage?.naturalWidth && els.sectionOverlayImage?.naturalHeight) {
      return els.sectionOverlayImage;
    }
    if (els.sectionBaseImage?.naturalWidth && els.sectionBaseImage?.naturalHeight) {
      return els.sectionBaseImage;
    }
    return null;
  }

  function sectionImageFrame() {
    const image = activeSectionMapImage();
    const stage = els.sectionMapStage;
    if (!image || !stage) {
      return null;
    }
    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    if (!stageWidth || !stageHeight || !imageWidth || !imageHeight) {
      return null;
    }
    const imageAspect = imageWidth / imageHeight;
    const stageAspect = stageWidth / stageHeight;
    let renderWidth;
    let renderHeight;
    let offsetX = 0;
    let offsetY = 0;
    if (stageAspect > imageAspect) {
      renderHeight = stageHeight;
      renderWidth = renderHeight * imageAspect;
      offsetX = (stageWidth - renderWidth) / 2;
    } else {
      renderWidth = stageWidth;
      renderHeight = renderWidth / imageAspect;
      offsetY = (stageHeight - renderHeight) / 2;
    }
    return { offsetX, offsetY, renderWidth, renderHeight };
  }

  function sectionImagePointToStage(point) {
    const frame = sectionImageFrame();
    if (!frame) {
      return null;
    }
    return {
      left: `${frame.offsetX + ((point.x / 100) * frame.renderWidth)}px`,
      top: `${frame.offsetY + ((point.y / 100) * frame.renderHeight)}px`
    };
  }

function positionSectionHotspots() {
  els.sectionHotspots.querySelectorAll("[data-hotspot-x][data-hotspot-y]").forEach((button) => {
    const x = Number(button.dataset.hotspotX);
    const y = Number(button.dataset.hotspotY);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      button.classList.remove("is-positioned");
      return;
    }
    const positioned = sectionImagePointToStage({ x, y });
    if (!positioned) {
      button.classList.remove("is-positioned");
      return;
    }
    button.style.left = positioned.left;
    button.style.top = positioned.top;
    button.classList.add("is-positioned");
  });
}

function renderSectionProfileControls(profiles) {
  els.sectionProfileControls.innerHTML = profiles.map((profile) => `
    <label class="section-profile-toggle ${profile.rows.length ? "" : "section-profile-toggle--disabled"}">
      <input type="checkbox" data-section-profile-survey="${escapeAttr(profile.survey.id)}" ${profile.selected ? "checked" : ""}>
      <span class="section-profile-toggle__swatch" style="background:${profile.color}"></span>
      <span class="section-profile-toggle__label">${escapeHtml(profile.survey.shortDate || profile.survey.label)}</span>
    </label>
  `).join("");

  els.sectionProfileControls.querySelectorAll("[data-section-profile-survey]").forEach((input) => {
    input.addEventListener("change", () => {
      const next = Array.from(els.sectionProfileControls.querySelectorAll("[data-section-profile-survey]:checked"))
        .map((element) => element.dataset.sectionProfileSurvey);
      state.sectionComparisonSurveyIds = next.length ? next : [state.surveyId];
      state.sectionHoverDistance = null;
      renderSections();
    });
  });

  const activeProfiles = profiles.filter((profile) => profile.selected && profile.rows.length);
  els.sectionProfileLegend.innerHTML = activeProfiles.map((profile) => `
    <span class="section-profile-legend__item">
      <span class="section-profile-legend__swatch" style="background:${profile.color}"></span>
      <span>${escapeHtml(profile.survey.shortDate || profile.survey.label)}</span>
    </span>
  `).join("");
}

function sectionChartDisplaySettings(section) {
  const projectId = currentProject()?.id;
  const areaId = currentArea()?.id;
  if (!projectId || !areaId || !section?.id) {
    return null;
  }
  return (
    SECTION_CHART_DISPLAY_OVERRIDES[`${projectId}:${areaId}:${section.id}`]
    || DEFAULT_SECTION_CHART_DISPLAY_BY_PROJECT[projectId]
    || null
  );
}

function drawSectionChart(profiles, section, anchorSurveyId = state.surveyId) {
  const width = 960;
  const height = 340;
  const pad = { top: 22, right: 22, bottom: 62, left: 62 };
  const activeProfiles = profiles.filter((profile) => profile.selected && profile.rows.length);
  const isComparisonMode = activeProfiles.length > 1;
  const allRows = activeProfiles.flatMap((profile) => profile.rows);

  if (!allRows.length) {
    els.profileChart.innerHTML = "";
    return;
  }

  const minX = Math.min(...allRows.map((row) => row.distance));
  const maxX = Math.max(...allRows.map((row) => row.distance));
  const displaySettings = sectionChartDisplaySettings(section);
  const minY = Math.min(...allRows.map((row) => row.height));
  const rawMaxY = Math.max(...allRows.map((row) => row.height));
  const maxY = Number.isFinite(displaySettings?.maxDisplayHeight)
    ? Math.min(rawMaxY, displaySettings.maxDisplayHeight)
    : rawMaxY;
  const xSpan = Math.max(1, maxX - minX);
  const ySpan = Math.max(1, maxY - minY);
  const xTicks = buildAxisTicks(minX, maxX, 4);
  const yTicks = buildAxisTicks(minY, maxY, 5);
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const hoverDistance = Number.isFinite(state.sectionHoverDistance)
    ? clamp(state.sectionHoverDistance, minX, maxX)
    : null;

  const buildPointString = (segment) => segment.map((point) => `${fixed(point.x, 2)},${fixed(point.y, 2)}`).join(" ");
  const profileSeries = activeProfiles.map((profile) => {
    const points = profile.rows.map((row, index) => {
      const x = pad.left + ((row.distance - minX) / xSpan) * plotWidth;
      const displayHeight = Number.isFinite(displaySettings?.maxDisplayHeight)
        ? Math.min(row.height, displaySettings.maxDisplayHeight)
        : row.height;
      const y = height - pad.bottom - ((displayHeight - minY) / ySpan) * plotHeight;
      return {
        index,
        x,
        y,
        row,
        displayHeight,
        isClipped: Number.isFinite(displaySettings?.maxDisplayHeight) && row.height > displaySettings.maxDisplayHeight
      };
    });
    const buildSegments = (predicate) => {
      const segments = [];
      let current = [];
      points.forEach((point) => {
        if (predicate(point)) {
          current.push(point);
        } else if (current.length) {
          segments.push(current);
          current = [];
        }
      });
      if (current.length) {
        segments.push(current);
      }
      return segments;
    };
    return {
      ...profile,
      points,
      measuredSegments: buildSegments((point) => point.row.height !== 0),
      zeroSegments: buildSegments((point) => point.row.height === 0),
      clippedSegments: buildSegments((point) => point.isClipped),
      hoverRow: nearestSectionRow(profile.rows, hoverDistance)
    };
  });
  const anchorProfile = profileSeries.find((profile) => profile.survey.id === anchorSurveyId) || profileSeries[0];
  const activePoint = anchorProfile?.hoverRow
    ? (() => {
        const activeDisplayHeight = Number.isFinite(displaySettings?.maxDisplayHeight)
          ? Math.min(anchorProfile.hoverRow.height, displaySettings.maxDisplayHeight)
          : anchorProfile.hoverRow.height;
        return {
          x: pad.left + ((anchorProfile.hoverRow.distance - minX) / xSpan) * plotWidth,
          y: height - pad.bottom - ((activeDisplayHeight - minY) / ySpan) * plotHeight,
          row: anchorProfile.hoverRow
        };
      })()
    : null;
  const xTickMarkup = xTicks.map((tick) => {
    const x = pad.left + ((tick - minX) / xSpan) * plotWidth;
    return `
      <line x1="${fixed(x, 2)}" y1="${pad.top}" x2="${fixed(x, 2)}" y2="${height - pad.bottom}" stroke="rgba(255,255,255,0.08)"/>
      <line x1="${fixed(x, 2)}" y1="${height - pad.bottom}" x2="${fixed(x, 2)}" y2="${height - pad.bottom + 8}" stroke="rgba(255,255,255,0.28)"/>
      <text x="${fixed(x, 2)}" y="${height - 28}" text-anchor="middle" fill="#aab9d3" font-size="10">${formatAxisTick(tick)} m</text>
    `;
  }).join("");
  const yTickMarkup = yTicks.map((tick) => {
    const y = height - pad.bottom - ((tick - minY) / ySpan) * (height - pad.top - pad.bottom);
    return `
      <line x1="${pad.left}" y1="${fixed(y, 2)}" x2="${width - pad.right}" y2="${fixed(y, 2)}" stroke="rgba(255,255,255,0.08)"/>
      <line x1="${pad.left - 8}" y1="${fixed(y, 2)}" x2="${pad.left}" y2="${fixed(y, 2)}" stroke="rgba(255,255,255,0.28)"/>
      <text x="${pad.left - 12}" y="${fixed(y + 4, 2)}" text-anchor="end" fill="#aab9d3" font-size="10">${formatAxisTick(tick)} m</text>
    `;
  }).join("");
  const fillPolygons = profileSeries
    .filter((profile) => profile.survey.id === anchorSurveyId)
    .flatMap((profile) => profile.measuredSegments
      .filter((segment) => segment.length >= 2)
      .map((segment) => {
        const pointString = buildPointString(segment);
        const start = segment[0];
        const end = segment[segment.length - 1];
        return `<polyline fill="url(#sectionFill)" stroke="none" points="${fixed(start.x, 2)},${height - pad.bottom} ${pointString} ${fixed(end.x, 2)},${height - pad.bottom}"/>`;
      }))
    .join("");
  const profileLines = profileSeries.map((profile) => {
    const measuredLines = profile.measuredSegments
      .filter((segment) => segment.length >= 2)
      .map((segment) => {
        const strokeWidth = isComparisonMode
          ? (profile.survey.id === anchorSurveyId ? 1.6 : 1.35)
          : 2.2;
        return `<polyline fill="none" stroke="${profile.color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" points="${buildPointString(segment)}"/>`;
      })
      .join("");
    const zeroLines = profile.zeroSegments
      .map((segment) => {
        if (segment.length === 1) {
          const point = segment[0];
          return `<circle cx="${fixed(point.x, 2)}" cy="${fixed(point.y, 2)}" r="2.1" fill="${profile.color}" opacity="0.72"/>`;
        }
        const zeroStrokeWidth = isComparisonMode ? 1.15 : 1.6;
        return `<polyline fill="none" stroke="${profile.color}" opacity="0.6" stroke-width="${zeroStrokeWidth}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 5" points="${buildPointString(segment)}"/>`;
      })
      .join("");
    const clippedLines = displaySettings?.showClippedOverlay
      ? profile.clippedSegments
        .filter((segment) => segment.length >= 2)
        .map((segment) => {
          const overlayStrokeWidth = isComparisonMode
            ? (profile.survey.id === anchorSurveyId ? 1.75 : 1.55)
            : 2.35;
          return `<polyline fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="${overlayStrokeWidth}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 5" points="${buildPointString(segment)}"/>`;
        })
        .join("")
      : "";
    const hoverDot = profile.hoverRow && hoverDistance !== null
      ? (() => {
          const x = pad.left + ((profile.hoverRow.distance - minX) / xSpan) * plotWidth;
          const hoverDisplayHeight = Number.isFinite(displaySettings?.maxDisplayHeight)
            ? Math.min(profile.hoverRow.height, displaySettings.maxDisplayHeight)
            : profile.hoverRow.height;
          const y = height - pad.bottom - ((hoverDisplayHeight - minY) / ySpan) * plotHeight;
          return `<circle cx="${fixed(x, 2)}" cy="${fixed(y, 2)}" r="4.2" fill="${profile.color}" stroke="rgba(255,255,255,0.85)" stroke-width="1.5"/>`;
        })()
      : "";
    return `${zeroLines}${measuredLines}${clippedLines}${hoverDot}`;
  }).join("");
  const activeLabel = activePoint ? `
    <g>
      <circle cx="${fixed(activePoint.x, 2)}" cy="${fixed(activePoint.y, 2)}" r="5.5" fill="#f7688b"/>
      <rect x="${fixed(activePoint.x + 10, 2)}" y="${fixed(activePoint.y - 28, 2)}" width="74" height="22" rx="11" fill="rgba(8,14,26,0.88)" stroke="rgba(255,255,255,0.16)"/>
      <text x="${fixed(activePoint.x + 47, 2)}" y="${fixed(activePoint.y - 13, 2)}" text-anchor="middle" fill="#eef4ff" font-size="11">${fixed(activePoint.row.height, 2)} m</text>
    </g>
  ` : "";

  els.profileChart.innerHTML = `
    <defs>
      <linearGradient id="sectionFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="rgba(121, 167, 255, 0.36)"/>
        <stop offset="100%" stop-color="rgba(121, 167, 255, 0.02)"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="transparent"/>
    ${xTickMarkup}
    ${yTickMarkup}
    <line x1="${pad.left}" y1="${height - pad.bottom}" x2="${width - pad.right}" y2="${height - pad.bottom}" stroke="rgba(255,255,255,0.3)"/>
    <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${height - pad.bottom}" stroke="rgba(255,255,255,0.3)"/>
    ${fillPolygons}
    ${profileLines}
    ${hoverDistance !== null ? `<line x1="${fixed(pad.left + ((hoverDistance - minX) / xSpan) * plotWidth, 2)}" y1="${pad.top}" x2="${fixed(pad.left + ((hoverDistance - minX) / xSpan) * plotWidth, 2)}" y2="${height - pad.bottom}" stroke="rgba(247,104,139,0.38)" stroke-width="2" stroke-dasharray="6 6"/>` : ""}
    ${activeLabel}
    <text x="${width / 2}" y="${height - 10}" text-anchor="middle" fill="#aab9d3" font-size="13">Distance along section (m)</text>
    <text x="20" y="${height / 2}" text-anchor="middle" fill="#aab9d3" font-size="13" transform="rotate(-90 20 ${height / 2})">Height (m)</text>
  `;

  const chartMetrics = {
    width,
    height,
    pad,
    minX,
    xSpan,
    plotWidth,
    minY,
    ySpan,
    plotHeight
  };
  const updateSectionHoverFromPointer = (event) => {
    const nextHoverDistance = chartHoverDistanceFromPointer(event, els.profileChart, activeProfiles, {
      ...chartMetrics
    });
    if (nextHoverDistance === null) {
      if (state.sectionHoverDistance !== null) {
        state.sectionHoverDistance = null;
        drawSectionChart(profiles, section, anchorSurveyId);
        renderSectionComparisonSummary(profiles, anchorSurveyId);
        updateSectionHoverFeedback(profiles, section, currentSurvey());
      }
      return;
    }
    if (state.sectionHoverDistance === null || Math.abs(state.sectionHoverDistance - nextHoverDistance) > 0.12) {
      state.pendingSectionHoverDistance = nextHoverDistance;
      if (state.pendingSectionHoverFrame) {
        return;
      }
      state.pendingSectionHoverFrame = window.requestAnimationFrame(() => {
        state.pendingSectionHoverFrame = null;
        state.sectionHoverDistance = state.pendingSectionHoverDistance;
        state.pendingSectionHoverDistance = null;
        drawSectionChart(profiles, section, anchorSurveyId);
        renderSectionComparisonSummary(profiles, anchorSurveyId);
        updateSectionHoverFeedback(profiles, section, currentSurvey());
      });
    }
  };
  const updateSectionHoverImmediately = (event) => {
    const nextHoverDistance = chartHoverDistanceFromPointer(event, els.profileChart, activeProfiles, {
      ...chartMetrics
    });
    if (nextHoverDistance !== null) {
      state.sectionHoverDistance = nextHoverDistance;
      drawSectionChart(profiles, section, anchorSurveyId);
      renderSectionComparisonSummary(profiles, anchorSurveyId);
      updateSectionHoverFeedback(profiles, section, currentSurvey());
    }
  };
  const openSnapshotFromPointer = (event) => {
    const nextHoverDistance = chartHoverDistanceFromPointer(event, els.profileChart, activeProfiles, {
      ...chartMetrics
    });
    if (nextHoverDistance === null) {
      return;
    }
    state.sectionHoverDistance = nextHoverDistance;
    drawSectionChart(profiles, section, anchorSurveyId);
    renderSectionComparisonSummary(profiles, anchorSurveyId);
    updateSectionHoverFeedback(profiles, section, currentSurvey());
    openCurrentSectionComparisonSnapshot();
  };
  const clearSectionHover = () => {
    if (state.sectionHoverDistance !== null) {
      state.sectionHoverDistance = null;
      drawSectionChart(profiles, section, anchorSurveyId);
      renderSectionComparisonSummary(profiles, anchorSurveyId);
      updateSectionHoverFeedback(profiles, section, currentSurvey());
    }
  };

  els.profileChart.onmousemove = updateSectionHoverFromPointer;
  els.profileChart.onpointerdown = (event) => {
    if (event.pointerType === "mouse") {
      return;
    }
    state.sectionPointerId = event.pointerId;
    event.preventDefault();
    els.profileChart.setPointerCapture?.(event.pointerId);
    updateSectionHoverImmediately(event);
  };
  els.profileChart.onpointermove = (event) => {
    if (event.pointerType === "mouse") {
      return;
    }
    if (state.sectionPointerId !== null && event.pointerId !== state.sectionPointerId) {
      return;
    }
    event.preventDefault();
    updateSectionHoverFromPointer(event);
  };
  els.profileChart.onpointerrawupdate = els.profileChart.onpointermove;
  els.profileChart.onpointerup = (event) => {
    els.profileChart.releasePointerCapture?.(event.pointerId);
    if (state.sectionPointerId === event.pointerId) {
      state.sectionPointerId = null;
    }
    if (event.pointerType !== "mouse") {
      openSnapshotFromPointer(event);
    }
  };
  els.profileChart.onpointercancel = (event) => {
    els.profileChart.releasePointerCapture?.(event.pointerId);
    if (state.sectionPointerId === event.pointerId) {
      state.sectionPointerId = null;
    }
  };
  els.profileChart.onmouseleave = () => {
    clearSectionHover();
  };
  els.profileChart.onclick = (event) => {
    openSnapshotFromPointer(event);
  };
}

function drawSectionDifferenceInset(profiles, centerDistance) {
  const width = 380;
  const height = 150;
  const pad = { top: 16, right: 18, bottom: 30, left: 42 };
  const radius = 6;
  const validProfiles = profiles.filter((profile) => profile?.rows?.length);
  if (!validProfiles.length) {
    els.sectionDifferenceInset.innerHTML = "";
    return;
  }
  const allRows = validProfiles.flatMap((profile) => profile.rows);
  const minWindowX = Math.max(
    Math.min(...allRows.map((row) => row.distance)),
    centerDistance - radius
  );
  const maxWindowX = Math.min(
    Math.max(...allRows.map((row) => row.distance)),
    centerDistance + radius
  );
  const profileWindows = validProfiles.map((profile) => ({
    ...profile,
    windowRows: sectionInsetWindowRows(profile.rows, centerDistance, radius)
  }));
  const combinedRows = profileWindows.flatMap((profile) => profile.windowRows).filter((row) => Number.isFinite(row.height));

  if (!combinedRows.length) {
    els.sectionDifferenceInset.innerHTML = "";
    return;
  }

  const minX = Math.min(...combinedRows.map((row) => row.distance), minWindowX);
  const maxX = Math.max(...combinedRows.map((row) => row.distance), maxWindowX);
  const minY = Math.min(...combinedRows.map((row) => row.height));
  const maxY = Math.max(...combinedRows.map((row) => row.height));
  const xSpan = Math.max(1, maxX - minX);
  const ySpan = Math.max(0.4, maxY - minY);
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;

  const pointString = (rows) => rows.map((row) => {
    const x = pad.left + ((row.distance - minX) / xSpan) * plotWidth;
    const y = height - pad.bottom - ((row.height - minY) / ySpan) * plotHeight;
    return `${fixed(x, 2)},${fixed(y, 2)}`;
  }).join(" ");

  const cursorX = pad.left + ((centerDistance - minX) / xSpan) * plotWidth;
  const baselineY = height - pad.bottom - ((0 - minY) / ySpan) * plotHeight;
  const insetTicks = [minX, centerDistance, maxX];

  const xTickMarkup = insetTicks.map((tick) => {
    const x = pad.left + ((tick - minX) / xSpan) * plotWidth;
    return `
      <line x1="${fixed(x, 2)}" y1="${pad.top}" x2="${fixed(x, 2)}" y2="${height - pad.bottom}" stroke="rgba(255,255,255,0.06)"/>
      <text x="${fixed(x, 2)}" y="${height - 10}" text-anchor="middle" fill="#9fb0cd" font-size="10">${fixed(tick, 1)} m</text>
    `;
  }).join("");

  const axisMarkup = `
    <line x1="${pad.left}" y1="${height - pad.bottom}" x2="${width - pad.right}" y2="${height - pad.bottom}" stroke="rgba(255,255,255,0.24)"/>
    <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${height - pad.bottom}" stroke="rgba(255,255,255,0.18)"/>
    ${minY <= 0 && maxY >= 0 ? `<line x1="${pad.left}" y1="${fixed(baselineY, 2)}" x2="${width - pad.right}" y2="${fixed(baselineY, 2)}" stroke="rgba(255,255,255,0.16)" stroke-dasharray="4 4"/>` : ""}
  `;

  const profileMarkup = profileWindows.map((profile) => (
    `<polyline fill="none" stroke="${profile.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="${pointString(profile.windowRows)}"/>`
  )).join("");

  els.sectionDifferenceInset.innerHTML = `
    <rect x="0" y="0" width="${width}" height="${height}" rx="16" fill="transparent"/>
    ${xTickMarkup}
    ${axisMarkup}
    ${profileMarkup}
    <line x1="${fixed(cursorX, 2)}" y1="${pad.top}" x2="${fixed(cursorX, 2)}" y2="${height - pad.bottom}" stroke="rgba(247,104,139,0.32)" stroke-width="1.5" stroke-dasharray="5 5"/>
  `;
}

function updateSectionHoverFeedback(profiles, section, survey) {
  const currentProfile = profiles.find((profile) => profile.survey.id === survey.id) || profiles[0];
  const currentRows = currentProfile?.rows || [];
  if (!currentRows.length) {
    els.sectionStatusText.textContent = `No profile rows are available yet for ${section.label} in ${survey.shortDate}.`;
    updateSectionMapMarker(currentRows, section, state.sectionHoverDistance);
    return;
  }
  const hoverRow = nearestSectionRow(currentRows, state.sectionHoverDistance);
  const comparedProfiles = profiles.filter((profile) => profile.selected && profile.rows.length);
  if (hoverRow) {
    const comparisonText = comparedProfiles.length > 1
      ? ` ${comparedProfiles.map((profile) => {
        const comparisonRow = nearestSectionRow(profile.rows, state.sectionHoverDistance);
        return comparisonRow
          ? `${profile.survey.shortDate}: ${fixed(comparisonRow.height, 2)} m`
          : `${profile.survey.shortDate}: no data`;
      }).join(" | ")}`
      : "";
    els.sectionStatusText.textContent = `${section.label} at ${fixed(hoverRow.distance, 1)} m along the section line, height ${fixed(hoverRow.height, 2)} m in ${survey.shortDate}.${comparisonText}`;
  } else {
    els.sectionStatusText.textContent = comparedProfiles.length > 1
      ? `${section.label} loaded for ${survey.shortDate}. ${comparedProfiles.length} survey profiles are overlaid. Move across the profile to inspect the section location.`
      : `${section.label} loaded for ${survey.shortDate}. Move across the profile to inspect the section location.`;
  }
  updateSectionMapMarker(currentRows, section, state.sectionHoverDistance);
}

function updateSectionMapMarker(rows, section, hoverDistance = state.sectionHoverDistance) {
  if (!Number.isFinite(hoverDistance)) {
    els.sectionMapMarker.classList.add("hidden");
    return;
  }
  const hoverRow = nearestSectionRow(rows, hoverDistance);
  if (!hoverRow) {
    els.sectionMapMarker.classList.add("hidden");
    return;
  }
  const markerPoint = sectionPointForRow(section, hoverRow, rows);
  const positioned = sectionImagePointToStage(markerPoint);
  if (!positioned) {
    els.sectionMapMarker.classList.add("hidden");
    return;
  }
  els.sectionMapMarker.classList.remove("hidden");
  els.sectionMapMarker.style.left = positioned.left;
  els.sectionMapMarker.style.top = positioned.top;
}

function sectionPointForRow(section, row, rows) {
  const sourceRows = Array.isArray(rows) && rows.length ? rows : [row];
  const minDistance = Math.min(...sourceRows.map((item) => item.distance));
  const maxDistance = Math.max(...sourceRows.map((item) => item.distance));
  const span = Math.max(1, maxDistance - minDistance);
  const progress = clamp((row.distance - minDistance) / span, 0, 1);
  return pointAlongTrack(section.track, progress);
}

function pointAlongTrack(track, progress) {
  if (Array.isArray(track?.points) && track.points.length > 1) {
    const segments = [];
    let totalLength = 0;

    for (let index = 1; index < track.points.length; index += 1) {
      const start = track.points[index - 1];
      const end = track.points[index];
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      segments.push({ start, end, length });
      totalLength += length;
    }

    const target = totalLength * progress;
    let traversed = 0;
    for (const segment of segments) {
      if (traversed + segment.length >= target) {
        const segmentProgress = segment.length ? (target - traversed) / segment.length : 0;
        return {
          x: segment.start.x + ((segment.end.x - segment.start.x) * segmentProgress),
          y: segment.start.y + ((segment.end.y - segment.start.y) * segmentProgress)
        };
      }
      traversed += segment.length;
    }
  }

  return {
    x: track.start.x + ((track.end.x - track.start.x) * progress),
    y: track.start.y + ((track.end.y - track.start.y) * progress)
  };
}

function buildAxisTicks(min, max, targetCount) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [];
  }
  if (min === max) {
    return [min];
  }
  const roughStep = Math.abs(max - min) / Math.max(1, targetCount - 1);
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(roughStep, 0.0001)));
  const residual = roughStep / magnitude;
  const niceResidual = residual >= 5 ? 5 : residual >= 2 ? 2 : 1;
  const step = niceResidual * magnitude;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks = [];
  for (let value = start; value <= end + (step / 2); value += step) {
    ticks.push(Number(value.toFixed(6)));
  }
  return ticks;
}

function formatAxisTick(value) {
  return Number.isInteger(value) ? String(value) : fixed(value, 1);
}

function sectionMetrics(rows, area, survey, section) {
  if (!rows.length) {
    return [
      { label: "Section", value: section.label, subtext: "No sampled heights found yet" },
      { label: "Ground range", value: "n/a", subtext: "Waiting for CSV data" },
      { label: "Distance covered", value: "n/a", subtext: "Waiting for CSV data" },
      { label: "Survey timing", value: survey.shortDate, subtext: area.launchOffset }
    ];
  }
  const minY = Math.min(...rows.map((row) => row.height));
  const maxY = Math.max(...rows.map((row) => row.height));
  const minX = Math.min(...rows.map((row) => row.distance));
  const maxX = Math.max(...rows.map((row) => row.distance));
  return [
    { label: "Section", value: section.label, subtext: `${rows.length} sampled profile points` },
    { label: "Ground range", value: `${fixed(minY, 2)} m to ${fixed(maxY, 2)} m`, subtext: "Lowest to highest sampled ground" },
    { label: "Distance covered", value: `${fixed(maxX - minX, 1)} m`, subtext: "Length of this fixed section line" },
    { label: "Survey timing", value: survey.shortDate, subtext: area.launchOffset }
  ];
}

function areas() {
  const configuredAreas = currentProject()?.projectAreaList;
  if (Array.isArray(configuredAreas) && configuredAreas.length) {
    return configuredAreas.map((area, index) => buildArea(area, index));
  }
  return Array.from({ length: areaSettings.count }, (_, index) => buildArea(index + 1, index));
}

function surveyOverrideKeys(project, surveyId) {
  const survey = project?.surveys?.find((item) => item.id === surveyId);
  return [surveyId, survey?.dateFrom, survey?.dateTo]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
}

function surveyDayLabelForOverrideKey(project, surveyId, overrideKey) {
  const survey = project?.surveys?.find((item) => item.id === surveyId);
  if (!survey || !overrideKey) {
    return "";
  }

  if (overrideKey === survey.dateFrom || overrideKey === survey.id) {
    return "Day 1";
  }

  if (overrideKey === survey.dateTo) {
    return "Day 2";
  }

  return "";
}

function areaOverrideStore(project, surveyId) {
  const stores = surveyOverrideKeys(project, surveyId)
    .map((key) => {
      const store = project?.surveyAreaOverrides?.[key] || {};
      const derivedDay = surveyDayLabelForOverrideKey(project, surveyId, key);
      return Object.fromEntries(
        Object.entries(store).map(([areaId, override]) => [
          areaId,
          {
            ...override,
            day: override?.day || derivedDay || ""
          }
        ])
      );
    })
    .filter((store) => store && Object.keys(store).length);
  return Object.assign({}, ...stores);
}

function areaOverride(project, surveyId, areaId) {
  return areaOverrideStore(project, surveyId)?.[areaId] || {};
}

function nearestPreviousAreaOverride(project, surveyId, areaId) {
  const currentSurvey = project?.surveys?.find((item) => item.id === surveyId);
  if (!currentSurvey) {
    return {};
  }

  const currentAnchor = currentSurvey.dateFrom || currentSurvey.dateTo || currentSurvey.id;
  const candidateSurveys = [...(project?.surveys || [])]
    .filter((item) => item?.id !== surveyId)
    .filter((item) => {
      const anchor = item?.dateFrom || item?.dateTo || item?.id;
      return anchor && anchor <= currentAnchor;
    })
    .sort((left, right) => {
      const leftAnchor = left.dateFrom || left.dateTo || left.id;
      const rightAnchor = right.dateFrom || right.dateTo || right.id;
      return rightAnchor.localeCompare(leftAnchor);
    });

  for (const candidate of candidateSurveys) {
    const override = areaOverride(project, candidate.id, areaId);
    if (override && Object.keys(override).length) {
      return override;
    }
  }

  return {};
}

function effectiveAreaOverview(areaId, surveyId = state.surveyId) {
  const project = currentProject();
  const baseline = {
    ...(BASELINE_AREA_OVERVIEW[areaId] || {}),
    ...(project?.projectAreaBaselines?.[areaId] || {})
  };
  const inheritedOverride = nearestPreviousAreaOverride(project, surveyId, areaId);
  const override = areaOverride(project, surveyId, areaId);
  return {
    ...baseline,
    ...inheritedOverride,
    ...override,
    tags: Array.isArray(override.tags)
      ? override.tags
      : Array.isArray(inheritedOverride.tags)
        ? inheritedOverride.tags
      : Array.isArray(baseline.tags)
        ? baseline.tags
        : []
  };
}

function serialiseAreaMetadataForm() {
  const tags = els.metaTags.value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    statusLabel: els.metaStatusLabel.value.trim(),
    statusTone: els.metaStatusTone.value,
    purpose: els.metaPurpose.value.trim(),
    start: els.metaStart.value.trim(),
    finish: els.metaFinish.value.trim(),
    size: els.metaSize.value.trim(),
    lowTide: els.metaLowTide.value.trim(),
    lowTideHeight: els.metaLowTideHeight.value.trim(),
    launchOffset: els.metaLaunchOffset.value.trim(),
    estimatedDuration: els.metaEstimatedDuration.value.trim(),
    actualDuration: els.metaActualDuration.value.trim(),
    tideWindow: els.metaTideWindow.value.trim(),
    tideScore: Number.parseInt(els.metaTideScore.value.trim(), 10) || 0,
    tags,
    missionRole: els.metaMissionRole.value.trim(),
    operationalNote: els.metaOperationalNote.value.trim(),
    weatherNotes: els.metaWeatherNotes.value.trim(),
    surveyNotes: els.metaSurveyNotes.value.trim()
  };
}

function populateAreaMetadataForm(areaId, surveyId = state.surveyId) {
  const overview = effectiveAreaOverview(areaId, surveyId);
  els.metaStatusLabel.value = overview.statusLabel || "";
  els.metaStatusTone.value = overview.statusTone || "blue";
  els.metaPurpose.value = overview.purpose || "";
  els.metaStart.value = overview.start || "";
  els.metaFinish.value = overview.finish || "";
  els.metaSize.value = overview.size || "";
  els.metaLowTide.value = overview.lowTide || "";
  els.metaLowTideHeight.value = overview.lowTideHeight || "";
  els.metaLaunchOffset.value = overview.launchOffset || "";
  els.metaEstimatedDuration.value = overview.estimatedDuration || "";
  els.metaActualDuration.value = overview.actualDuration || "";
  els.metaTideWindow.value = overview.tideWindow || "";
  els.metaTideScore.value = String(overview.tideScore ?? "");
  els.metaTags.value = Array.isArray(overview.tags) ? overview.tags.join(", ") : "";
  els.metaMissionRole.value = overview.missionRole || "";
  els.metaOperationalNote.value = overview.operationalNote || "";
  els.metaWeatherNotes.value = overview.weatherNotes || "";
  els.metaSurveyNotes.value = overview.surveyNotes || "";
}

function areaSelectOptions() {
  return areas().map((area) => [area.id, `${area.overviewCode} - ${area.label}`]);
}

function imageryLayers(area) {
  return Object.fromEntries(
    Object.entries(area.layers).filter(([key]) => key !== "sections")
  );
}

function buildAreaLayers(areaLabel) {
  return Object.fromEntries(Object.entries(layerSettings).map(([key, layer]) => [
    key,
    {
      ...layer,
      description: `${layer.description} for ${areaLabel}.`
    }
  ]));
}

  function buildArea(definition, index = 0) {
    const isObjectDefinition = typeof definition === "object" && definition !== null;
    const number = isObjectDefinition
      ? (Number(definition.number) || Number(String(definition.id || "").replace(/\D+/g, "")) || (index + 1))
      : Number(definition);
    const key = isObjectDefinition ? (definition.id || `${areaSettings.idPrefix}${number}`) : `${areaSettings.idPrefix}${number}`;
    const areaLabel = isObjectDefinition
      ? (definition.label || definition.title || `Area ${number}`)
      : `Area ${number}`;
    const overview = effectiveAreaOverview(key);
    const explicitTracks = EXPLICIT_SECTION_IMAGE_TRACKS[key];
    const sectionTracks = explicitTracks?.length
      ? explicitTracks.map((track) => explicitTrackToSectionTrack(track))
      : sectionSettings.defaultTracks;
  return {
    id: key,
    overviewCode: isObjectDefinition ? (definition.overviewCode || `${areaSettings.codePrefix}${number}`) : `${areaSettings.codePrefix}${number}`,
    day: overview?.day || areaSettings.defaultDay,
    label: overview?.title || areaLabel,
    summary: overview?.purpose || `${areaLabel} follows the same shared schema: ortho, DSM, contours, section overlay, and CSV-backed profile data.`,
    zone: overview?.zone || areaSettings.defaultZone,
    filterKey: overview?.filterKey || "all",
    statusLabel: overview?.statusLabel || areaSettings.defaultStatusLabel,
    statusTone: overview?.statusTone || overviewAreaTone(key, number - 1),
    size: overview?.size || "n/a",
    start: overview?.start || "n/a",
    finish: overview?.finish || "n/a",
    lowTide: overview?.lowTide || "n/a",
    lowTideHeight: overview?.lowTideHeight || "n/a",
    estimatedDuration: overview?.estimatedDuration || "n/a",
    actualDuration: overview?.actualDuration || "n/a",
    tideScore: overview?.tideScore ?? 0,
    launchOffset: overview?.launchOffset || "n/a",
    midOffsetMinutes: overview?.midOffset ?? 0,
    tideWindow: overview?.tideWindow || "n/a",
    missionRole: overview?.missionRole || "Monitoring area within the shared programme.",
    operationalNote: overview?.operationalNote || "Operational notes will be added as survey rounds are documented.",
    deliverables: overview?.deliverables || areaSettings.defaultDeliverables,
    weatherNotes: overview?.weatherNotes || "Weather notes will be added as survey rounds are documented.",
    surveyNotes: overview?.surveyNotes || "Interpretation notes will be added as survey rounds are documented.",
    cardNote: overview?.cardNote || areaSettings.defaultStatusLabel,
    tags: overview?.tags || areaSettings.defaultTags,
    statusNote: areaSettings.defaultStatusNote,
    layers: buildAreaLayers(areaLabel),
    sections: Array.from({ length: Number(definition?.sectionCount) || sectionSettings.countPerArea }, (_, index) => index + 1).map((section, index) => {
      const track = sectionTracks[index];
      return {
        id: `A${number}-${String(section).padStart(2, "0")}`,
        label: `Section ${section}`,
        note: `${areaLabel} profile extracted from the existing CSV output.`,
        hotspot: {
          x: (track.start.x + track.end.x) / 2,
          y: (track.start.y + track.end.y) / 2
        },
        track
      };
    })
  };
}

function currentProject() {
  return state.dataset.projects.find((project) => project.id === state.projectId);
}

function areaById(areaId) {
  return areas().find((area) => area.id === areaId) || null;
}

function liveVolumeAreaIds(project = currentProject()) {
  const liveAreaIds = new Set();
  Object.values(project.volumeChangeComparisons || {}).forEach((entry) => {
    Object.keys(entry?.areas || {}).forEach((areaId) => {
      liveAreaIds.add(areaId);
    });
  });
  return [...liveAreaIds].sort((left, right) => left.localeCompare(right));
}

function renderVolumeQuickAreas(areaIds, activeAreaId) {
  if (!els.volumeQuickAreas) {
    return;
  }
  if (!areaIds.length) {
    els.volumeQuickAreas.innerHTML = "";
    return;
  }
  els.volumeQuickAreas.innerHTML = areaIds.map((areaId) => {
    const area = areaById(areaId);
    if (!area) {
      return "";
    }
    const isActive = areaId === activeAreaId;
    return `
      <button class="chip ${isActive ? "active" : ""}" type="button" data-volume-area="${escapeAttr(areaId)}">
        ${escapeHtml(area.overviewCode)} ${escapeHtml(area.label)}
      </button>
    `;
  }).join("");
}

function setVolumeUnsupportedAreaLayout(enabled) {
  els.volumeQuickAreas?.classList.toggle("is-hidden", enabled);
  els.volumeReferencePanel?.classList.toggle("is-hidden", enabled);
  els.volumeGuidancePanels?.classList.toggle("is-hidden", enabled);
  els.volumeRolloutPanel?.classList.toggle("is-hidden", enabled);
}

function renderVolumeLiveAreaCards(areaIds) {
  return areaIds.map((areaId) => {
    const area = areaById(areaId);
    if (!area) {
      return "";
    }
    return `
      <button class="volume-unavailable-card" type="button" data-volume-area="${escapeAttr(areaId)}">
        <span class="eyebrow">Trend Analysis Live</span>
        <strong>${escapeHtml(`${area.overviewCode} ${area.label}`)}</strong>
        <span class="muted">Open the live trend analysis for this area.</span>
      </button>
    `;
  }).join("");
}

function currentSurvey() {
  return currentProject().surveys.find((survey) => survey.id === state.surveyId) || currentProject().surveys[0];
}

function weatherWindowForSurvey(surveys, surveyId) {
  const projectEnvironment = currentProjectEnvironment();
  const current = surveys.find((item) => item.id === surveyId) || surveys[0];
  const fallbackSurveyEndDate = projectEnvironment.fallbackSurveyEndDate || environmentalContext.fallbackSurveyEndDate;
  const weatherWindowMonths = projectEnvironment.weatherWindowMonths || environmentalContext.weatherWindowMonths;
  const anchor = current?.dateFrom || current?.dateTo || fallbackSurveyEndDate;
  const end = current?.dateTo || current?.dateFrom || fallbackSurveyEndDate;
  return {
    start: subtractMonths(anchor, weatherWindowMonths),
    end
  };
}

function activeComparisonSurvey(project, survey) {
  if (survey.comparisonBaseline) {
    return project.surveys.find((item) => item.id === survey.comparisonBaseline) || null;
  }
  return project.surveys.find((item) => item.comparisonBaseline === survey.id) || null;
}

function currentVolumeDataset() {
  const project = currentProject();
  const survey = currentSurvey();
  return project.volumeChangeComparisons?.[survey.id] || null;
}

function currentAreaVolumeDataset() {
  return currentVolumeDataset()?.areas?.[currentArea().id] || null;
}

function formatVolume(value) {
  const number = Number(value || 0);
  const rounded = Math.abs(number) >= 100 ? number.toFixed(0) : number.toFixed(1);
  return `${rounded} m3`;
}

function formatSquareMetres(value) {
  const number = Number(value || 0);
  return `${number.toLocaleString("en-GB", { maximumFractionDigits: 0 })} m2`;
}

function currentTrendAreaPaths(areaId) {
  return currentProjectContent()?.trendAssets?.[areaId] || null;
}

async function loadTrendData(areaId) {
  const areaTrendPaths = currentTrendAreaPaths(areaId);
  if (!areaTrendPaths) {
    return null;
  }
  if (!trendAreaCachePromises.has(areaId)) {
    trendAreaCachePromises.set(areaId, (async () => {
      const [manifestResponse, statsResponse, imageSrc] = await Promise.all([
        fetch(areaTrendPaths.manifest).catch(() => null),
        fetch(areaTrendPaths.stats).catch(() => null),
        resolveExistingAsset([areaTrendPaths.image])
      ]);
      if (!manifestResponse?.ok || !statsResponse?.ok || !imageSrc) {
        return null;
      }
      const [manifest, stats] = await Promise.all([
        manifestResponse.json(),
        statsResponse.json()
      ]);
      return { manifest, stats, imageSrc };
    })());
  }
  return trendAreaCachePromises.get(areaId);
}

function formatTrendDate(value) {
  if (!value) {
    return "";
  }
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function trendRoundById(stats, roundId) {
  return (stats?.survey_rounds || []).find((item) => item.id === roundId) || null;
}

function trendRoundDateRange(stats, fromRoundId, toRoundId) {
  const fromRound = trendRoundById(stats, fromRoundId);
  const toRound = trendRoundById(stats, toRoundId);
  const fromDate = formatTrendDate(fromRound?.dates?.[0]);
  const toDate = formatTrendDate((toRound?.dates || []).slice(-1)[0] || toRound?.dates?.[0]);
  if (!fromDate || !toDate) {
    return "";
  }
  return `${fromDate} to ${toDate}`;
}

function trendRoundIntervalDays(stats, fromRoundId, toRoundId) {
  const fromRound = trendRoundById(stats, fromRoundId);
  const toRound = trendRoundById(stats, toRoundId);
  const fromDate = fromRound?.dates?.[0];
  const toDate = (toRound?.dates || []).slice(-1)[0] || toRound?.dates?.[0];
  if (!fromDate || !toDate) {
    return null;
  }
  const fromMs = new Date(`${fromDate}T00:00:00`).getTime();
  const toMs = new Date(`${toDate}T00:00:00`).getTime();
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
    return null;
  }
  return Math.round((toMs - fromMs) / 86400000);
}

function trendPairSummaries(stats) {
  const pairAB = stats?.classification_inputs?.primary_pair_1;
  const pairBC = stats?.classification_inputs?.primary_pair_2;
  const pairAC = stats?.classification_inputs?.cumulative_pairs?.[0];
  return [
    pairAB ? { label: "Survey 1 vs Survey 2", dateRange: pairAB.date_range, intervalDays: pairAB.interval_days, ...pairAB.volume_stats } : null,
    pairAC ? {
      label: "Survey 1 vs Survey 3",
      dateRange: trendRoundDateRange(stats, "A", "C"),
      intervalDays: trendRoundIntervalDays(stats, "A", "C"),
      ...pairAC.volume_stats
    } : null,
    pairBC ? { label: "Survey 2 vs Survey 3", dateRange: pairBC.date_range, intervalDays: pairBC.interval_days, ...pairBC.volume_stats } : null
  ].filter(Boolean).map((item) => {
    const net = Number(item.net_volume_m3 || 0);
    return {
      label: item.label,
      added: Number(item.added_volume_m3 || 0),
      removed: Number(item.removed_volume_m3 || 0),
      net,
      readoutTitle: net >= 0 ? "Net build-up" : "Net lowering",
      readoutCopy: net >= 0
        ? `${item.label} ends with more material in the later survey overall.`
        : `${item.label} ends with less material in the later survey overall.`,
      supportingCopy: `${item.dateRange} • ${item.intervalDays} day gap • ${fixed(item.matching_cells_percent || 0, 1)}% of cells matched cleanly.`
    };
  });
}

function comparisonAssetCandidates(projectId, areaId, pairKey, assetType) {
  const pairAssets = {
    ab: {
      surveyId: "2026-04-18",
      height: [
        `${areaId}_s1_vs_s2_height_change_analysis.png`,
        `${areaId}_A_vs_B_height_change_analysis.png`,
        `${areaId}_height_change_analysis.png`,
        `${areaId}_height_change_analysis.jpg`
      ],
      classification: [
        `${areaId}_s1_vs_s2_gain_loss_classification.png`,
        `${areaId}_A_vs_B_gain_loss_classification.png`,
        `${areaId}_gain_loss_classification.png`,
        `${areaId}_gain_loss_classification.jpg`
      ]
    },
    ac: {
      surveyId: "2026-06-16",
      height: [
        `${areaId}_s1_vs_s3_height_change_analysis.png`,
        `${areaId}_A_vs_C_height_change_analysis.png`
      ],
      classification: [
        `${areaId}_s1_vs_s3_gain_loss_classification.png`,
        `${areaId}_A_vs_C_gain_loss_classification.png`
      ]
    },
    bc: {
      surveyId: "2026-06-16",
      height: [
        `${areaId}_s2_vs_s3_height_change_analysis.png`,
        `${areaId}_B_vs_C_height_change_analysis.png`
      ],
      classification: [
        `${areaId}_s2_vs_s3_gain_loss_classification.png`,
        `${areaId}_B_vs_C_gain_loss_classification.png`
      ]
    }
  }[pairKey];

  if (!pairAssets) {
    return [];
  }

  return (pairAssets[assetType] || []).flatMap((fileName) => ([
    projectAssetPath(projectId, "stats", pairAssets.surveyId, areaId, fileName),
    projectAssetPath(projectId, "maps", pairAssets.surveyId, areaId, fileName),
    surveyAssetPath(projectId, pairAssets.surveyId, areaId, fileName)
  ]));
}

function renderVolumeReferenceGallery(cards, options = {}) {
  const validCards = cards.filter((item) => item?.src);
  const single = options.single ?? validCards.length === 1;
  els.volumeImageryGrid.classList.toggle("volume-imagery-grid--single", single);
  els.volumeImageryGrid.classList.toggle("volume-imagery-grid--gallery", validCards.length > 2);

  if (!validCards.length) {
    els.volumeImageryGrid.innerHTML = `
      <article class="card">
        <h3>Reference maps coming soon</h3>
        <p class="muted">Once the exported imagery is in place, this section will show the comparison maps here.</p>
      </article>
    `;
    return;
  }

  els.volumeImageryGrid.innerHTML = validCards.map((item) => `
    <figure class="volume-reference-card">
      <button
        class="volume-reference-card__button"
        type="button"
        data-volume-lightbox-src="${escapeAttr(item.src)}"
        data-volume-lightbox-eyebrow="${escapeAttr(item.eyebrow || "Reference map")}"
        data-volume-lightbox-title="${escapeAttr(item.title || "Reference image")}"
        data-volume-lightbox-caption="${escapeAttr(item.caption || "")}"
        data-volume-lightbox-alt="${escapeAttr(item.alt || item.title || "Reference image")}"
      >
        <div class="volume-reference-stage">
          <img src="${escapeAttr(item.src)}" alt="${escapeAttr(item.alt || item.title || "Reference image")}">
        </div>
      </button>
      <figcaption class="volume-reference-card__meta">
        <div class="volume-reference-card__copy">
          <p class="eyebrow">${escapeHtml(item.eyebrow || "Reference map")}</p>
          <strong>${escapeHtml(item.title || "Reference image")}</strong>
          <p class="muted">${escapeHtml(item.caption || "")}</p>
        </div>
        <div class="volume-reference-card__badges">
          ${item.badge ? `<span class="chip">${escapeHtml(item.badge)}</span>` : ""}
          ${item.label ? `<span class="chip">${escapeHtml(item.label)}</span>` : ""}
        </div>
      </figcaption>
    </figure>
  `).join("");
}

function renderVolumeReferenceSelector(activeKey = "ab", availableKeys = []) {
  if (!els.volumeReferenceSelector) {
    return;
  }
  const options = [
    { key: "ab", label: "Survey 1 vs Survey 2" },
    { key: "ac", label: "Survey 1 vs Survey 3" },
    { key: "bc", label: "Survey 2 vs Survey 3" }
  ];
  els.volumeReferenceSelector.innerHTML = options.map((item) => {
    const isActive = item.key === activeKey;
    const isAvailable = availableKeys.includes(item.key);
    return `
      <span class="volume-reference-pill ${isActive ? "active" : ""} ${isAvailable ? "" : "is-disabled"}">
        <strong>${escapeHtml(item.label)}</strong>
        <span>${escapeHtml(isAvailable ? (isActive ? "Reference maps shown below" : "Available") : "Coming soon")}</span>
      </span>
    `;
  }).join("");
}

function comparisonReadinessCards(trendData, areaLabel, availableKeys = []) {
  const pairSummaries = trendData ? trendPairSummaries(trendData.stats) : [];
  const rollout = [
    {
      key: "ab",
      label: "Survey 1 vs Survey 2",
      status: availableKeys.includes("ab") ? "Live now" : "Waiting on files",
      detail: availableKeys.includes("ab")
        ? "The first comparison pair is now available with the wider trend story and flat reference maps."
        : "This first comparison pair still needs its exported reference maps added before it can sit beside the trend panel cleanly.",
      note: pairSummaries[0]?.supportingCopy || "Reference maps loaded."
    },
    {
      key: "ac",
      label: "Survey 1 vs Survey 3",
      status: availableKeys.includes("ac") ? "Live now" : "Waiting on files",
      detail: availableKeys.includes("ac")
        ? `The longer-gap comparison is now live for ${areaLabel}, so people can jump from the trend summary into the full March-to-June reference view.`
        : `The longer-gap comparison still needs its exported flat maps before the full March-to-June story is complete for ${areaLabel}.`,
      note: pairSummaries[1]?.supportingCopy || "Reference maps loaded."
    },
    {
      key: "bc",
      label: "Survey 2 vs Survey 3",
      status: availableKeys.includes("bc") ? "Live now" : "Waiting on files",
      detail: availableKeys.includes("bc")
        ? `The short late-season comparison is now live for ${areaLabel}, so the latest round-on-round change can be checked directly.`
        : `The short late-season comparison is not wired in yet for ${areaLabel}, so the latest round-on-round flat maps are still missing.`,
      note: pairSummaries[2]?.supportingCopy || "Reference maps loaded."
    }
  ];
  return rollout.map((item) => `
    <article class="card volume-breakdown-card">
      <div class="volume-card__meta">
        <div>
          <p class="muted">${escapeHtml(areaLabel)}</p>
          <h3>${escapeHtml(item.label)}</h3>
        </div>
      </div>
      <p class="volume-rollout-status">${escapeHtml(item.status)}</p>
      <p>${escapeHtml(item.detail)}</p>
      <p class="muted">${escapeHtml(item.note)}</p>
    </article>
  `).join("");
}

function sortedTrendClasses(items) {
  return [...items].sort((a, b) => Number(b.area_m2 || 0) - Number(a.area_m2 || 0));
}

function trendHeadline(topClass) {
  switch (topClass?.key) {
    case "consistent_accretion":
      return "The main pattern here is steady build-up, so this part of the footprint has mostly kept getting higher from one survey to the next.";
    case "consistent_erosion":
      return "The main pattern here is steady lowering, so this part of the footprint has mostly kept losing material from one survey to the next.";
    case "accretion_then_erosion":
      return "The main pattern here is build-up first, then lowering later. In plain English, material gathered earlier in the season, then some of that gain was lost again by June.";
    case "erosion_then_accretion":
      return "The main pattern here is lowering first, then recovery later. In plain English, this area dipped earlier on, then built back up by June.";
    case "stable":
      return "A large part of this footprint stayed broadly similar across all three rounds, so it did not move enough to count as a meaningful rise or fall.";
    default:
      return "This panel shows the longer-term story across all three survey rounds, not just one before-and-after pair.";
  }
}

function trendClassExplanation(key) {
  switch (key) {
    case "consistent_accretion":
      return "This part kept building up from round to round.";
    case "consistent_erosion":
      return "This part kept lowering from round to round.";
    case "accretion_then_erosion":
      return "This part built up first, then dropped back later.";
    case "erosion_then_accretion":
      return "This part lowered first, then built back up later.";
    case "stable":
      return "This part stayed broadly the same across the survey set.";
    case "new_latest_accretion":
      return "This part mainly changed in the latest round, ending up higher by June.";
    case "new_latest_erosion":
      return "This part mainly changed in the latest round, ending up lower by June.";
    case "earlier_accretion_now_stable":
      return "This part built up earlier, then mostly held that newer shape.";
    case "earlier_erosion_now_stable":
      return "This part lowered earlier, then mostly settled into that newer level.";
    default:
      return "This colour marks one of the repeated change patterns picked up across all three rounds.";
  }
}

function parseVolumeRows(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [label, gain, loss, net, confidence, summary] = line.split("|").map((item) => item.trim());
      return {
        id: `bar_${String(index + 1).padStart(2, "0")}`,
        label: label || `${volumeChangeSettings.rowLabelFallback} ${index + 1}`,
        gainM3: Number.parseFloat(gain || "0") || 0,
        lossM3: Number.parseFloat(loss || "0") || 0,
        netM3: Number.parseFloat(net || "0") || 0,
        confidence: confidence || volumeChangeSettings.defaultConfidence,
        summary: summary || volumeChangeSettings.defaultSummary
      };
    });
}

function serialiseVolumeRows(rows = []) {
  return rows.map((row) => [
    row.label,
    row.gainM3 ?? 0,
    row.lossM3 ?? 0,
    row.netM3 ?? 0,
    row.confidence || "",
    row.summary || ""
  ].join("|")).join("\n");
}

function formatDashboardDate(dateString) {
  if (!dateString) return "n/a";
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function subtractMonths(dateString, months = 1) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
}

function currentArea() {
  return areas().find((area) => area.id === state.areaId) || areas()[0];
}

function surveyAssetPath(projectId, surveyId, areaId, fileName) {
  const survey = currentProject().surveys.find((item) => item.id === surveyId);
  const folder = survey?.dataFolder || surveyId;
  return `/${assetSettings.surveyRoot}/${projectId}/${folder}/${areaId}/${fileName}`;
}

function sharedAreaAssetPath(projectId, areaId, fileName) {
  return `/${assetSettings.sharedRoot}/${projectId}/${areaId}/${fileName}`;
}

function projectAssetPath(projectId, ...parts) {
  const encodedParts = parts.filter(Boolean).map((part) => encodeURIComponent(String(part)).replace(/%2F/g, "/"));
  return `/public/projects/${encodeURIComponent(projectId)}/assets/${encodedParts.join("/")}`;
}

function projectSurveyAssetCandidates(projectId, surveyId, areaId, fileName) {
  return assetFileNameVariants(areaId, fileName).flatMap((variant) => ([
    projectAssetPath(projectId, "maps", surveyId, areaId, variant),
    projectAssetPath(projectId, "reports", surveyId, areaId, variant),
    projectAssetPath(projectId, "stats", surveyId, areaId, variant)
  ]));
}

function projectSharedAssetCandidates(projectId, areaId, fileName) {
  return assetFileNameVariants(areaId, fileName).flatMap((variant) => ([
    projectAssetPath(projectId, "maps", areaId, variant),
    projectAssetPath(projectId, "reports", areaId, variant),
    projectAssetPath(projectId, "stats", areaId, variant)
  ]));
}

  function assetFileNameVariants(areaId, fileName) {
    const configuredVariants = assetSettings.variants[fileName] || [];
    const areaSpecificVariants = assetSettings.areaSpecificVariants[areaId]?.[fileName] || [];
    const variants = [
      fileName,
      ...configuredVariants.map((variant) => variant.replace("{areaId}", areaId)),
      ...areaSpecificVariants
    ];
    return Array.from(new Set(variants));
  }

function surveyAssetCandidates(projectId, surveyId, areaId, fileName) {
  return [
    ...projectSurveyAssetCandidates(projectId, surveyId, areaId, fileName),
    ...assetFileNameVariants(areaId, fileName).map((variant) => surveyAssetPath(projectId, surveyId, areaId, variant))
  ];
}

function sharedAreaAssetCandidates(projectId, areaId, fileName) {
  return [
    ...projectSharedAssetCandidates(projectId, areaId, fileName),
    ...assetFileNameVariants(areaId, fileName).map((variant) => sharedAreaAssetPath(projectId, areaId, variant))
  ];
}

async function resolveExistingAsset(candidates) {
  for (const candidate of Array.from(new Set(candidates)).filter(Boolean)) {
    if (await assetExists(candidate)) {
      return candidate;
    }
  }
  return "";
}

async function fetchJsonAsset(candidates) {
  const assetPath = await resolveExistingAsset(candidates);
  if (!assetPath) {
    return null;
  }
  if (state.jsonAssetCache.has(assetPath)) {
    return { path: assetPath, json: state.jsonAssetCache.get(assetPath) };
  }
  const response = await fetch(assetPath).catch(() => null);
  if (!response || !response.ok) {
    return null;
  }
  const json = await response.json().catch(() => null);
  if (!json) {
    return null;
  }
  state.jsonAssetCache.set(assetPath, json);
  return { path: assetPath, json };
}

async function prepareSectionDisplayAsset(assetPath) {
  if (!assetPath) {
    return "";
  }
  if (state.processedSectionAssetCache.has(assetPath)) {
    return state.processedSectionAssetCache.get(assetPath);
  }

  try {
    const response = await fetch(assetPath);
    if (!response.ok) {
      return assetPath;
    }
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      return assetPath;
    }
    context.drawImage(bitmap, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    const width = canvas.width;
    const height = canvas.height;
    const visited = new Uint8Array(width * height);
    const stack = [];

    const isNearBlack = (offset) => {
      const alpha = data[offset + 3];
      if (alpha === 0) {
        return false;
      }
      return data[offset] <= 40 && data[offset + 1] <= 40 && data[offset + 2] <= 40;
    };

    const pushPixel = (x, y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) {
        return;
      }
      const index = y * width + x;
      if (visited[index]) {
        return;
      }
      const offset = index * 4;
      if (!isNearBlack(offset)) {
        return;
      }
      visited[index] = 1;
      stack.push(index);
    };

    for (let x = 0; x < width; x += 1) {
      pushPixel(x, 0);
      pushPixel(x, height - 1);
    }
    for (let y = 0; y < height; y += 1) {
      pushPixel(0, y);
      pushPixel(width - 1, y);
    }

    while (stack.length) {
      const index = stack.pop();
      const offset = index * 4;
      data[offset + 3] = 0;
      const x = index % width;
      const y = Math.floor(index / width);
      pushPixel(x - 1, y);
      pushPixel(x + 1, y);
      pushPixel(x, y - 1);
      pushPixel(x, y + 1);
    }

    context.putImageData(imageData, 0, 0);
    const processedBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!processedBlob) {
      return assetPath;
    }
    const objectUrl = URL.createObjectURL(processedBlob);
    state.processedSectionAssetCache.set(assetPath, objectUrl);
    return objectUrl;
  } catch {
    return assetPath;
  }
}

async function bitmapFromAssetPath(assetPath) {
  const response = await fetch(assetPath);
  if (!response.ok) {
    throw new Error(`Could not load asset: ${assetPath}`);
  }
  const blob = await response.blob();
  return createImageBitmap(blob);
}

async function prepareCompareHighlightAsset(primaryAssetPath, secondaryAssetPath, options = {}) {
  if (!primaryAssetPath || !secondaryAssetPath) {
    return "";
  }
  const primaryContourPath = options.primaryContourPath || "";
  const secondaryContourPath = options.secondaryContourPath || "";
  const cacheKey = `${primaryAssetPath}::${secondaryAssetPath}::${primaryContourPath}::${secondaryContourPath}`;
  if (state.processedHighlightAssetCache.has(cacheKey)) {
    return state.processedHighlightAssetCache.get(cacheKey);
  }

  try {
    const [primaryBitmap, secondaryBitmap, primaryContourBitmap, secondaryContourBitmap] = await Promise.all([
      bitmapFromAssetPath(primaryAssetPath),
      bitmapFromAssetPath(secondaryAssetPath),
      primaryContourPath ? bitmapFromAssetPath(primaryContourPath).catch(() => null) : Promise.resolve(null),
      secondaryContourPath ? bitmapFromAssetPath(secondaryContourPath).catch(() => null) : Promise.resolve(null)
    ]);

    const targetWidth = Math.max(primaryBitmap.width, secondaryBitmap.width);
    const targetHeight = Math.max(primaryBitmap.height, secondaryBitmap.height);
    const makeCanvas = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      return canvas;
    };

    const primaryCanvas = makeCanvas();
    const secondaryCanvas = makeCanvas();
    const primaryContourCanvas = primaryContourBitmap ? makeCanvas() : null;
    const secondaryContourCanvas = secondaryContourBitmap ? makeCanvas() : null;
    const outputCanvas = makeCanvas();
    const primaryContext = primaryCanvas.getContext("2d", { willReadFrequently: true });
    const secondaryContext = secondaryCanvas.getContext("2d", { willReadFrequently: true });
    const primaryContourContext = primaryContourCanvas?.getContext("2d", { willReadFrequently: true }) || null;
    const secondaryContourContext = secondaryContourCanvas?.getContext("2d", { willReadFrequently: true }) || null;
    const outputContext = outputCanvas.getContext("2d", { willReadFrequently: true });
    if (!primaryContext || !secondaryContext || !outputContext) {
      return secondaryAssetPath;
    }

    primaryContext.drawImage(primaryBitmap, 0, 0, targetWidth, targetHeight);
    secondaryContext.drawImage(secondaryBitmap, 0, 0, targetWidth, targetHeight);
    if (primaryContourContext && primaryContourBitmap) {
      primaryContourContext.drawImage(primaryContourBitmap, 0, 0, targetWidth, targetHeight);
    }
    if (secondaryContourContext && secondaryContourBitmap) {
      secondaryContourContext.drawImage(secondaryContourBitmap, 0, 0, targetWidth, targetHeight);
    }
    const primaryData = primaryContext.getImageData(0, 0, targetWidth, targetHeight);
    const secondaryData = secondaryContext.getImageData(0, 0, targetWidth, targetHeight);
    const primaryContourData = primaryContourContext?.getImageData(0, 0, targetWidth, targetHeight)?.data || null;
    const secondaryContourData = secondaryContourContext?.getImageData(0, 0, targetWidth, targetHeight)?.data || null;
    const outputImage = outputContext.createImageData(targetWidth, targetHeight);
    const sourceA = primaryData.data;
    const sourceB = secondaryData.data;
    const output = outputImage.data;

    for (let index = 0; index < output.length; index += 4) {
      const alphaA = sourceA[index + 3] / 255;
      const alphaB = sourceB[index + 3] / 255;
      if (alphaA < 0.01 && alphaB < 0.01) {
        continue;
      }

      const redA = sourceA[index];
      const greenA = sourceA[index + 1];
      const blueA = sourceA[index + 2];
      const redB = sourceB[index];
      const greenB = sourceB[index + 1];
      const blueB = sourceB[index + 2];
      const luminanceA = (0.2126 * redA) + (0.7152 * greenA) + (0.0722 * blueA);
      const luminanceB = (0.2126 * redB) + (0.7152 * greenB) + (0.0722 * blueB);
      const colorDelta = (
        Math.abs(redA - redB)
        + Math.abs(greenA - greenB)
        + Math.abs(blueA - blueB)
      ) / 3;
      const alphaDelta = Math.abs(alphaA - alphaB) * 255;
      const contourA = primaryContourData
        ? (
          primaryContourData[index + 3] > 0
          && primaryContourData[index] > 120
          && primaryContourData[index] > primaryContourData[index + 1] + 24
          && primaryContourData[index] > primaryContourData[index + 2] + 24
        )
        : false;
      const contourB = secondaryContourData
        ? (
          secondaryContourData[index + 3] > 0
          && secondaryContourData[index] > 120
          && secondaryContourData[index] > secondaryContourData[index + 1] + 24
          && secondaryContourData[index] > secondaryContourData[index + 2] + 24
        )
        : false;
      const contourDelta = contourA !== contourB ? 56 : 0;
      const totalDelta = Math.max(colorDelta, alphaDelta * 1.35, contourDelta);

      if (totalDelta < 24) {
        continue;
      }

      const secondaryDominant = contourA !== contourB
        ? contourB
        : (alphaB > alphaA + 0.08 || luminanceB >= luminanceA);
      if (secondaryDominant) {
        output[index] = 64;
        output[index + 1] = 214;
        output[index + 2] = 255;
      } else {
        output[index] = 255;
        output[index + 1] = 111;
        output[index + 2] = 84;
      }

      output[index + 3] = clamp(Math.round((totalDelta - 18) * 4.1), 0, 210);
    }

    outputContext.putImageData(outputImage, 0, 0);
    const processedBlob = await new Promise((resolve) => outputCanvas.toBlob(resolve, "image/png"));
    if (!processedBlob) {
      return secondaryAssetPath;
    }
    const objectUrl = URL.createObjectURL(processedBlob);
    state.processedHighlightAssetCache.set(cacheKey, objectUrl);
    return objectUrl;
  } catch {
    return secondaryAssetPath;
  }
}

function walkCoordinates(coordinates, callback) {
  if (!Array.isArray(coordinates)) {
    return;
  }
  if (typeof coordinates[0] === "number") {
    callback(coordinates);
    return;
  }
  coordinates.forEach((child) => walkCoordinates(child, callback));
}

function geometryExtent(features) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  features.forEach((feature) => {
    walkCoordinates(feature?.geometry?.coordinates, ([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}

function normaliseProjectedPoint(coordinate, extent) {
  const xSpan = Math.max(1, extent.maxX - extent.minX);
  const ySpan = Math.max(1, extent.maxY - extent.minY);
  return {
    x: clamp(((coordinate[0] - extent.minX) / xSpan) * 100, 0, 100),
    y: clamp(((extent.maxY - coordinate[1]) / ySpan) * 100, 0, 100)
  };
}

function polygonLabelPoint(points) {
  const xValues = points.map((point) => point.x);
  const yValues = points.map((point) => point.y);
  return {
    x: (Math.min(...xValues) + Math.max(...xValues)) / 2,
    y: (Math.min(...yValues) + Math.max(...yValues)) / 2
  };
}

  async function loadSharedSectionGeometry(projectId, areaId) {
    const asset = await fetchJsonAsset(sharedAreaAssetCandidates(projectId, areaId, "line-length.geojson"));
    const features = asset?.json?.features || [];
    const extent = geometryExtent(features);
    if (extent) {
      const geometryMap = new Map();
      features.forEach((feature) => {
        const coordinates = feature?.geometry?.coordinates;
        if (!Array.isArray(coordinates) || coordinates.length < 2) {
          return;
        }
        const points = coordinates.map((coordinate) => normaliseProjectedPoint(coordinate, extent));
        const start = points[0];
        const end = points[points.length - 1];
        const sectionId = feature?.properties?.section_id || feature?.properties?.label;
        if (!sectionId) {
          return;
        }
        geometryMap.set(sectionId, {
          hotspot: {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2
          },
          track: { start, end, points }
        });
      });
      if (geometryMap.size) {
        return geometryMap;
      }
    }

    const explicitTracks = EXPLICIT_SECTION_IMAGE_TRACKS[areaId];
    if (explicitTracks?.length && features.length) {
      const sortedFeatures = [...features].sort((a, b) => {
        const aOrder = Number(a?.properties?.sort_order || 0);
        const bOrder = Number(b?.properties?.sort_order || 0);
        return aOrder - bOrder;
      });
      return new Map(sortedFeatures.map((feature, index) => {
        const calibration = explicitTracks[index] || explicitTracks[explicitTracks.length - 1];
        const track = explicitTrackToSectionTrack(calibration);
        return [
          feature?.properties?.section_id || feature?.properties?.label,
          {
            hotspot: {
              x: (track.start.x + track.end.x) / 2,
              y: (track.start.y + track.end.y) / 2
            },
            track
          }
        ];
      }));
    }

    const overlayPath = await resolveExistingAsset(sharedAreaAssetCandidates(projectId, areaId, "section_lines.png"));
    const detectedTracks = overlayPath ? await detectSectionTracksFromImage(overlayPath, features.length) : [];
    if (detectedTracks.length === features.length && detectedTracks.length) {
      const sortedFeatures = [...features].sort((a, b) => {
        const aOrder = Number(a?.properties?.sort_order || 0);
        const bOrder = Number(b?.properties?.sort_order || 0);
        return aOrder - bOrder;
      });
      const sortedTracks = [...detectedTracks].sort((a, b) => a.hotspot.x - b.hotspot.x);
      return new Map(sortedFeatures.map((feature, index) => ([
        feature?.properties?.section_id || feature?.properties?.label,
        sortedTracks[index]
      ])));
    }

    return null;
}

async function detectSectionTracksFromImage(imagePath, expectedCount) {
  if (state.sectionTrackCache.has(imagePath)) {
    return state.sectionTrackCache.get(imagePath);
  }

  const tracks = await new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const targetWidth = Math.min(1400, image.width);
      const scale = targetWidth / image.width;
      const targetHeight = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        resolve([]);
        return;
      }
      context.drawImage(image, 0, 0, targetWidth, targetHeight);
      const { data } = context.getImageData(0, 0, targetWidth, targetHeight);
      const points = [];

      for (let y = 0; y < targetHeight; y += 1) {
        for (let x = 0; x < targetWidth; x += 1) {
          const offset = ((y * targetWidth) + x) * 4;
          const r = data[offset];
          const g = data[offset + 1];
          const b = data[offset + 2];
          const a = data[offset + 3];
          if (a > 0 && r > 180 && g < 100 && b < 100) {
            points.push({ x, y });
          }
        }
      }

      if (!points.length || !expectedCount) {
        resolve([]);
        return;
      }

      const minX = Math.min(...points.map((point) => point.x));
      const maxX = Math.max(...points.map((point) => point.x));
      const centroids = Array.from({ length: expectedCount }, (_, index) => (
        minX + (((index + 0.5) / expectedCount) * (maxX - minX))
      ));

      let clusters = Array.from({ length: expectedCount }, () => []);
      for (let iteration = 0; iteration < 10; iteration += 1) {
        clusters = Array.from({ length: expectedCount }, () => []);
        points.forEach((point) => {
          let bestIndex = 0;
          let bestDistance = Math.abs(point.x - centroids[0]);
          for (let index = 1; index < centroids.length; index += 1) {
            const distance = Math.abs(point.x - centroids[index]);
            if (distance < bestDistance) {
              bestIndex = index;
              bestDistance = distance;
            }
          }
          clusters[bestIndex].push(point);
        });

        centroids.forEach((_, index) => {
          if (clusters[index].length) {
            centroids[index] = clusters[index].reduce((sum, point) => sum + point.x, 0) / clusters[index].length;
          }
        });
      }

      const extracted = clusters
        .filter((cluster) => cluster.length)
        .map((cluster) => {
          const minY = Math.min(...cluster.map((point) => point.y));
          const maxY = Math.max(...cluster.map((point) => point.y));
          const topPoints = cluster.filter((point) => point.y <= minY + 3);
          const bottomPoints = cluster.filter((point) => point.y >= maxY - 3);
          const topX = topPoints.reduce((sum, point) => sum + point.x, 0) / Math.max(1, topPoints.length);
          const bottomX = bottomPoints.reduce((sum, point) => sum + point.x, 0) / Math.max(1, bottomPoints.length);
          const start = { x: (topX / targetWidth) * 100, y: (minY / targetHeight) * 100 };
          const end = { x: (bottomX / targetWidth) * 100, y: (maxY / targetHeight) * 100 };
          return {
            hotspot: {
              x: (start.x + end.x) / 2,
              y: (start.y + end.y) / 2
            },
            track: {
              start,
              end,
              points: [start, end]
            }
          };
        });

      resolve(extracted);
    };
    image.onerror = () => resolve([]);
    image.src = imagePath;
  });

  state.sectionTrackCache.set(imagePath, tracks);
  return tracks;
}

function applySharedSectionGeometry(area, geometryMap) {
  if (!geometryMap?.size) {
    return area;
  }
  return {
    ...area,
    sections: area.sections.map((section) => {
      const override = geometryMap.get(section.id);
      return override ? { ...section, ...override } : section;
    })
  };
}

async function loadSharedAreaPolygons(projectId, areaId) {
  const asset = await fetchJsonAsset(sharedAreaAssetCandidates(projectId, areaId, "sandbar-polygons.geojson"));
  const features = asset?.json?.features || [];
  const extent = geometryExtent(features);
  if (!extent) {
    return [];
  }

  return features.map((feature, index) => {
    const geometry = feature?.geometry;
    const rings = geometry?.type === "Polygon"
      ? geometry.coordinates
      : geometry?.type === "MultiPolygon"
        ? geometry.coordinates[0]
        : null;
    const ring = rings?.[0];
    if (!Array.isArray(ring) || ring.length < 3) {
      return null;
    }
    const points = ring.map((coordinate) => normaliseProjectedPoint(coordinate, extent));
    return {
      id: feature?.properties?.sandbar_id || `SB-${areaId}-${String(index + 1).padStart(2, "0")}`,
      label: feature?.properties?.label || `${volumeChangeSettings.rowLabelFallback} ${index + 1}`,
      areaId: feature?.properties?.area_id || areaId,
      notes: feature?.properties?.notes || "",
      sortOrder: Number(feature?.properties?.sort_order || index + 1),
      points,
      centroid: polygonLabelPoint(points)
    };
  }).filter(Boolean).sort((a, b) => a.sortOrder - b.sortOrder);
}

function normaliseCompareKey(value) {
  return String(value || "").trim().toLowerCase();
}

function mergeVolumePolygons(configuredRows = [], sharedPolygons = []) {
  if (!sharedPolygons.length) {
    return configuredRows;
  }

  const remainingRows = [...configuredRows];
  const merged = sharedPolygons.map((polygon, index) => {
    let rowIndex = remainingRows.findIndex((row) => normaliseCompareKey(row.label) === normaliseCompareKey(polygon.label));
    if (rowIndex === -1 && remainingRows[index]) {
      rowIndex = index;
    }
    const row = rowIndex >= 0 ? remainingRows.splice(rowIndex, 1)[0] : null;
    return {
      ...polygon,
      ...(row || {}),
      id: polygon.id,
      label: polygon.label,
      notes: polygon.notes
    };
  });

  return merged.concat(remainingRows);
}

function renderVolumePolygonOverlay(target, polygons = []) {
  target.innerHTML = polygons
    .filter((polygon) => Array.isArray(polygon.points) && polygon.points.length >= 3)
    .map((polygon) => {
      const pointString = polygon.points.map((point) => `${fixed(point.x, 2)},${fixed(point.y, 2)}`).join(" ");
      return `
        <g>
          <polygon points="${pointString}"></polygon>
          <text x="${fixed(polygon.centroid?.x ?? 50, 2)}" y="${fixed(polygon.centroid?.y ?? 50, 2)}">${escapeHtml(polygon.label)}</text>
        </g>
      `;
    }).join("");
}

function preferredSecondarySurveyId() {
  const selected = currentSurvey();
  return selected.comparisonBaseline
    || currentProject().surveys.find((survey) => survey.id !== selected.id)?.id
    || selected.id;
}

function defaultSectionComparisonSurveyIds() {
  const surveys = [...(currentProject()?.surveys || [])]
    .sort((a, b) => String(a.dateFrom).localeCompare(String(b.dateFrom)));
  const selectedIndex = surveys.findIndex((survey) => survey.id === state.surveyId);
  if (selectedIndex === -1) {
    return Array.from(new Set([state.surveyId, preferredSecondarySurveyId()].filter(Boolean)));
  }

  const previousIds = surveys
    .slice(Math.max(0, selectedIndex - 2), selectedIndex)
    .map((survey) => survey.id);

  const selectedIds = [
    ...previousIds,
    surveys[selectedIndex].id
  ];

  if (selectedIds.length < 2) {
    const fallbackId = preferredSecondarySurveyId();
    if (fallbackId && !selectedIds.includes(fallbackId)) {
      selectedIds.unshift(fallbackId);
    }
  }

  return Array.from(new Set(selectedIds.filter(Boolean)));
}

function mergeSectionComparisonSurveyIds(preferred = [], existing = []) {
  const validIds = new Set(currentProject().surveys.map((survey) => survey.id));
  const source = existing.length ? existing : preferred;
  const merged = Array.from(new Set(source.filter((id) => validIds.has(id))));
  return merged.length ? merged : [state.surveyId];
}

function activeSectionComparisonSurveyIds() {
  state.sectionComparisonSurveyIds = mergeSectionComparisonSurveyIds(defaultSectionComparisonSurveyIds(), state.sectionComparisonSurveyIds);
  return state.sectionComparisonSurveyIds;
}

function updateSectionFullscreenButton() {
  const isFullscreen = document.fullscreenElement === els.sectionWorkspace;
  els.sectionFullscreenBtn.textContent = isFullscreen ? "Exit Fullscreen" : "Fullscreen";
}

function updateViewerFullscreenButton() {
  const isFullscreen = document.fullscreenElement === els.layerWorkspace;
  els.viewerFullscreenBtn.textContent = isFullscreen ? "Exit Fullscreen" : "Fullscreen";
}

async function toggleSectionFullscreen() {
  if (document.fullscreenElement === els.sectionWorkspace) {
    await document.exitFullscreen();
    return;
  }
  await els.sectionWorkspace.requestFullscreen();
}

async function toggleViewerFullscreen() {
  if (document.fullscreenElement === els.layerWorkspace) {
    await document.exitFullscreen();
    return;
  }
  await els.layerWorkspace.requestFullscreen();
}

function zoom(multiplier) {
  state.scale = clamp(state.scale * multiplier, 1, 8);
  if (state.scale === 1) {
    state.panX = 0;
    state.panY = 0;
  }
  applyViewTransform();
}

function touchPoint(touch) {
  return {
    x: touch.clientX,
    y: touch.clientY
  };
}

function handleViewerTouchStart(event) {
  if (event.target.closest("#transparencyControls")) {
    return;
  }
  state.activeTouchGesture = true;
  state.viewerPointers.clear();

  if (event.touches.length >= 2) {
    state.touchGestureMode = "pinch";
    const first = touchPoint(event.touches[0]);
    const second = touchPoint(event.touches[1]);
    beginViewerPinchFromPair(first, second);
    event.preventDefault();
    return;
  }

  const touch = event.touches[0];
  if (!touch) {
    return;
  }
  state.lastTouchX = touch.clientX;
  state.lastTouchY = touch.clientY;
  if (state.compareMode === "slider" && state.scale <= 1) {
    state.touchGestureMode = "swipe";
    updateSwipeFromClientX(touch.clientX);
    event.preventDefault();
    return;
  }
  if (state.scale > 1) {
    state.touchGestureMode = "pan";
    state.isPanning = true;
    event.preventDefault();
  }
}

function handleViewerTouchMove(event) {
  if (!state.activeTouchGesture) {
    return;
  }

  if (event.touches.length >= 2) {
    if (state.touchGestureMode !== "pinch") {
      state.touchGestureMode = "pinch";
      beginViewerPinchFromPair(touchPoint(event.touches[0]), touchPoint(event.touches[1]));
    } else {
      updateViewerPinchFromPair(touchPoint(event.touches[0]), touchPoint(event.touches[1]));
    }
    event.preventDefault();
    return;
  }

  const touch = event.touches[0];
  if (!touch) {
    return;
  }

  if (state.touchGestureMode === "swipe" && state.compareMode === "slider" && state.scale <= 1) {
    updateSwipeFromClientX(touch.clientX);
    event.preventDefault();
    return;
  }

  if (state.touchGestureMode === "pan" && state.scale > 1) {
    state.panX += touch.clientX - state.lastTouchX;
    state.panY += touch.clientY - state.lastTouchY;
    state.lastTouchX = touch.clientX;
    state.lastTouchY = touch.clientY;
    applyViewTransform();
    event.preventDefault();
  }
}

function handleViewerTouchEnd(event) {
  if (event.touches.length >= 2) {
    beginViewerPinchFromPair(touchPoint(event.touches[0]), touchPoint(event.touches[1]));
    event.preventDefault();
    return;
  }
  if (event.touches.length === 1) {
    const touch = event.touches[0];
    state.lastTouchX = touch.clientX;
    state.lastTouchY = touch.clientY;
    state.touchGestureMode = state.scale > 1 ? "pan" : null;
    state.pinchStartDistance = null;
    event.preventDefault();
    return;
  }
  state.activeTouchGesture = false;
  state.touchGestureMode = null;
  state.isPanning = false;
  state.pinchStartDistance = null;
  state.pinchStartCenter = null;
  state.pinchStageCenter = null;
  applyViewTransform();
}

function viewerPointerPair() {
  const pointers = Array.from(state.viewerPointers.values());
  if (pointers.length < 2) {
    return null;
  }
  return [pointers[0], pointers[1]];
}

function pointerDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function pointerCenter(first, second) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2
  };
}

function beginViewerPinch() {
  const pair = viewerPointerPair();
  if (!pair) {
    return;
  }
  beginViewerPinchFromPair(pair[0], pair[1]);
}

function beginViewerPinchFromPair(first, second) {
  const stageRect = els.viewerStage.getBoundingClientRect();
  state.isPanning = false;
  state.isDraggingSwipe = false;
  state.activeViewerPointerId = null;
  state.pinchStartDistance = Math.max(1, pointerDistance(first, second));
  state.pinchStartScale = state.scale;
  state.pinchStartPanX = state.panX;
  state.pinchStartPanY = state.panY;
  state.pinchStartCenter = pointerCenter(first, second);
  state.pinchStageCenter = {
    x: stageRect.left + (stageRect.width / 2),
    y: stageRect.top + (stageRect.height / 2)
  };
}

function updateViewerPinch() {
  const pair = viewerPointerPair();
  if (!pair) {
    return;
  }
  updateViewerPinchFromPair(pair[0], pair[1]);
}

function updateViewerPinchFromPair(first, second) {
  if (!first || !second || !state.pinchStartDistance || !state.pinchStartCenter || !state.pinchStageCenter) {
    return;
  }
  const nextCenter = pointerCenter(first, second);
  const nextDistance = Math.max(1, pointerDistance(first, second));
  const nextScale = clamp(state.pinchStartScale * (nextDistance / state.pinchStartDistance), 1, 8);
  const startRelativeX = state.pinchStartCenter.x - state.pinchStageCenter.x - state.pinchStartPanX;
  const startRelativeY = state.pinchStartCenter.y - state.pinchStageCenter.y - state.pinchStartPanY;
  const scaleRatio = nextScale / Math.max(state.pinchStartScale, 0.001);

  state.scale = nextScale;
  state.panX = nextCenter.x - state.pinchStageCenter.x - (startRelativeX * scaleRatio);
  state.panY = nextCenter.y - state.pinchStageCenter.y - (startRelativeY * scaleRatio);
  if (state.scale === 1) {
    state.panX = 0;
    state.panY = 0;
  }
  applyViewTransform();
}

function resetView() {
  state.scale = 1;
  state.panX = 0;
  state.panY = 0;
  state.isPanning = false;
  state.isDraggingSwipe = false;
  state.activeViewerPointerId = null;
  state.viewerPointers.clear();
  state.pinchStartDistance = null;
  applyViewTransform();
}

function applyViewTransform() {
  clampPanToBounds();
  els.viewerTransform.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
  els.viewerStage.classList.toggle("is-pannable", state.scale > 1 && !state.isPanning);
  els.viewerStage.classList.toggle("is-panning", state.isPanning);
  updateSliderMask();
}

function clampPanToBounds() {
  if (state.scale <= 1) {
    state.panX = 0;
    state.panY = 0;
    return;
  }

  const metrics = getViewerImageMetrics();
  if (!metrics) {
    return;
  }

  const maxPanX = Math.max(0, ((metrics.displayWidth * state.scale) - metrics.stageWidth) / 2);
  const maxPanY = Math.max(0, ((metrics.displayHeight * state.scale) - metrics.stageHeight) / 2);
  state.panX = clamp(state.panX, -maxPanX, maxPanX);
  state.panY = clamp(state.panY, -maxPanY, maxPanY);
}

function getViewerImageMetrics() {
  const stageRect = els.viewerStage.getBoundingClientRect();
  if (!stageRect.width || !stageRect.height) {
    return null;
  }

  const image = [els.viewerBaseImage, els.viewerOverlayImage, els.viewerSliderImage]
    .find((item) => item.naturalWidth > 0 && item.naturalHeight > 0);

  if (!image) {
    return null;
  }

  const imageRatio = image.naturalWidth / image.naturalHeight;
  const stageRatio = stageRect.width / stageRect.height;
  let displayWidth = stageRect.width;
  let displayHeight = stageRect.height;

  if (imageRatio > stageRatio) {
    displayHeight = stageRect.width / imageRatio;
  } else {
    displayWidth = stageRect.height * imageRatio;
  }

  return {
    stageWidth: stageRect.width,
    stageHeight: stageRect.height,
    displayWidth,
    displayHeight
  };
}

function syncTransparencyControls(canCompare) {
  const showControls = state.compareMode === "transparency" && canCompare;
  els.transparencyControls.classList.toggle("hidden", !showControls);
  els.primaryOpacityRange.disabled = !showControls;
  els.secondaryOpacityRange.disabled = !showControls;
  els.primaryOpacityRange.value = String(Math.round(state.primaryOpacity * 100));
  els.secondaryOpacityRange.value = String(Math.round(state.secondaryOpacity * 100));
}

function applyViewerOpacities() {
  const baseOpacity = state.compareMode === "transparency" ? state.primaryOpacity : 1;
  const overlayOpacity = state.compareMode === "transparency" ? state.secondaryOpacity : 1;
  els.viewerBaseImage.style.opacity = String(baseOpacity);
  els.viewerTransparencyOverlay.style.opacity = String(overlayOpacity);
  els.viewerSliderOverlay.style.opacity = "1";
  els.viewerGuideDsmOverlay.style.opacity = state.showGuideDsm ? "0.38" : "0";
  els.viewerGuideContourOverlay.style.opacity = state.showGuideContours ? "0.92" : "0";
  els.viewerHighlightOverlay.style.opacity = state.showChangeHighlight ? "0.82" : "0";
}

function renderCompareHighlightLegend({ canHighlight, primarySurvey, secondarySurvey, contourAssisted = false }) {
  if (!els.compareHighlightLegend) {
    return;
  }
  if (!(state.showChangeHighlight && canHighlight)) {
    els.compareHighlightLegend.classList.add("hidden");
    els.compareHighlightLegend.innerHTML = "";
    return;
  }

  els.compareHighlightLegend.classList.remove("hidden");
  els.compareHighlightLegend.innerHTML = `
    <span class="compare-highlight-legend__item">
      <span class="compare-highlight-legend__swatch compare-highlight-legend__swatch--secondary"></span>
      <span>${secondarySurvey.shortDate} is higher or more exposed here</span>
    </span>
    <span class="compare-highlight-legend__item">
      <span class="compare-highlight-legend__swatch compare-highlight-legend__swatch--primary"></span>
      <span>${primarySurvey.shortDate} is higher or more exposed here</span>
    </span>
  `;
}

async function buildSurveyCoverage(project, survey) {
  const areaCoverage = await Promise.all(areas().map(async (area) => {
    const expected = Object.values(imageryLayers(area)).map((layer) => layer.fileName);
    const checks = await Promise.all(expected.map(async (fileName) => ({
      fileName,
      exists: Boolean(await resolveExistingAsset(surveyAssetCandidates(project.id, survey.id, area.id, fileName)))
    })));
    const presentFiles = checks.filter((item) => item.exists).map((item) => item.fileName);
    const missingFiles = checks.filter((item) => !item.exists).map((item) => item.fileName);
    const presentCount = presentFiles.length;
    const totalCount = expected.length;
    return {
      areaId: area.id,
      areaLabel: area.label,
      presentFiles,
      missingFiles,
      presentCount,
      totalCount,
      statusLabel: presentCount === 0 ? "Missing" : presentCount === totalCount ? "Complete" : "Partial"
    };
  }));

  return {
    completeAreas: areaCoverage.filter((item) => item.presentCount === item.totalCount).length,
    partialAreas: areaCoverage.filter((item) => item.presentCount > 0 && item.presentCount < item.totalCount).length,
    missingAreas: areaCoverage.filter((item) => item.presentCount === 0).length,
    presentFiles: areaCoverage.reduce((sum, item) => sum + item.presentCount, 0),
    totalFiles: areaCoverage.reduce((sum, item) => sum + item.totalCount, 0),
    areas: areaCoverage
  };
}

function buildViewerCaption({ area, primaryLayer, secondaryLayer, primarySurvey, secondarySurvey, primaryExists, secondaryExists, mode }) {
  if (!primaryExists) {
    return `No ${primaryLayer.label.toLowerCase()} asset has been uploaded yet for ${primarySurvey.label} in ${primarySurvey.assetFolder}/${area.id}/.`;
  }

  if (mode === "single") {
    return `${primaryLayer.description} Viewing ${primarySurvey.label} for ${area.label}.`;
  }

  if (primarySurvey.id === secondarySurvey.id) {
    if (primaryLayer.fileName !== secondaryLayer.fileName) {
      return `Comparing ${primaryLayer.label} and ${secondaryLayer.label} within ${primarySurvey.shortDate} for ${area.label}.`;
    }
    return `Choose a different secondary survey or a different secondary layer to compare ${primarySurvey.shortDate}.`;
  }

  if (!secondaryExists) {
    return `Primary image is loaded from ${primarySurvey.shortDate}, but the secondary ${secondaryLayer.label.toLowerCase()} image is missing for ${secondarySurvey.label}.`;
  }

  if (mode === "transparency") {
    return `Transparency comparison: ${primarySurvey.shortDate} ${primaryLayer.label} as the base image with ${secondarySurvey.shortDate} ${secondaryLayer.label} overlaid for ${area.label}.`;
  }

  if (mode === "slider") {
    return `Slider comparison: drag the handle to compare ${primarySurvey.shortDate} ${primaryLayer.label} and ${secondarySurvey.shortDate} ${secondaryLayer.label} for ${area.label}.`;
  }

  return `${primaryLayer.description} Viewing ${primarySurvey.label} for ${area.label}.`;
}

function compareModeInsight(mode, canCompare, primaryLabel, secondaryLabel) {
  if (!canCompare) {
    return "Use Single View while the second survey or second view is still missing. Overlay and Swipe will unlock as soon as the matching comparison image is available.";
  }

  if (mode === "transparency") {
    return `Overlay lets us fade ${primaryLabel.toLowerCase()} and ${secondaryLabel.toLowerCase()} together so edge shifts, channel drift, and exposed ground changes stand out faster.`;
  }

  if (mode === "slider") {
    return "Swipe is best when you want to inspect one shoreline, bar edge, or channel line closely from side to side.";
  }

  return "Single View is the cleanest way to inspect one image first, then switch on Overlay or Swipe once you know where to focus.";
}

function overlayInsight({ showGuideDsm, showGuideContours, showChangeHighlight }) {
  const active = [];
  if (showGuideDsm) active.push("colour elevation guide");
  if (showGuideContours) active.push("contour guide");
  if (showChangeHighlight) active.push("change highlight");

  if (!active.length) {
    return "Turn on the guide toggles when you want extra help reading slope, shape, contours, or likely areas of change.";
  }

  return `Active helpers: ${active.join(", ")}. These overlays add context without forcing you out of the main comparison view.`;
}

function compareObservationHint(primaryLabel, secondaryLabel, mode) {
  if (mode === "slider") {
    return `Drag the swipe handle along bar crests, channel edges, and wet-dry boundaries to compare ${primaryLabel.toLowerCase()} against ${secondaryLabel.toLowerCase()} edge by edge.`;
  }

  if (mode === "transparency") {
    return "Look for doubled edges, offset contours, and sandbar outlines that no longer sit on top of each other. Those usually show the story quickest.";
  }

  return `Start by reading the ${primaryLabel.toLowerCase()} on its own, then bring in ${secondaryLabel.toLowerCase()} or a second survey once you know which feature you want to inspect more closely.`;
}

function updateSwipeFromClientX(clientX) {
  const rect = els.viewerStage.getBoundingClientRect();
  if (!rect.width) {
    return;
  }
  state.swipePercent = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
  updateSliderMask();
}

function updateSliderMask() {
  const percent = `${state.swipePercent}%`;
  els.viewerSliderOverlay.style.clipPath = `inset(0 ${100 - state.swipePercent}% 0 0)`;
  els.sliderHandle.style.left = percent;
}

async function loadManifest(projectId, surveyId, areaId) {
  const manifestPath = surveyAssetPath(projectId, surveyId, areaId, "manifest.json");
  try {
    const response = await fetch(manifestPath);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

async function assetExists(src) {
  if (state.assetStatusCache.has(src)) {
    return state.assetStatusCache.get(src);
  }

  let result;
  if (src.endsWith(".csv") || src.endsWith(".json")) {
    result = await fetch(src).then((response) => response.ok).catch(() => false);
  } else {
    result = await new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  }

  state.assetStatusCache.set(src, result);
  return result;
}

async function uploadSelectedFiles() {
  const uploads = assetSettings.expectedSurveyAssets.map((item) => ({
    input: byId(item.inputId),
    fileName: item.fileName
  }));
  const selected = uploads.filter((item) => item.input.files && item.input.files[0]);

  if (!selected.length) {
    els.adminUploadStatus.innerHTML = detail("Status", "No files selected yet.");
    return;
  }

  els.adminUploadStatus.innerHTML = detail("Status", `Uploading ${selected.length} file(s) to ${currentSurvey().assetFolder}/${currentArea().id}/.`);

  const results = [];
  for (const item of selected) {
    const file = item.input.files[0];
    const contentBase64 = await readFileAsBase64(file);
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: currentProject().id,
        surveyId: currentSurvey().id,
        areaId: currentArea().id,
        fileName: item.fileName,
        contentBase64
      })
    });
    const payload = await response.json().catch(() => ({}));
    results.push({
      ok: response.ok,
      fileName: item.fileName,
      message: payload.message || payload.error || (response.ok ? "Uploaded" : "Upload failed")
    });
  }

  state.assetStatusCache.clear();
  renderOverview();
  renderLayers();
  renderSections();
  renderAdminIfEnabled();

  els.adminUploadStatus.innerHTML = results.map((result) => detail(result.fileName, `${result.ok ? "Uploaded" : "Failed"}: ${result.message}`)).join("");
  uploads.forEach((item) => {
    item.input.value = "";
  });
}

async function saveAreaMetadata() {
  const project = currentProject();
  const survey = currentSurvey();
  const area = currentArea();
  const fields = serialiseAreaMetadataForm();

  els.areaMetadataStatus.innerHTML = detail(
    "Save survey area notes",
    `Saving survey-specific context for ${area.overviewCode} in ${survey.label}...`
  );

  const response = await fetch("/api/survey-area-metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: project.id,
      surveyId: survey.id,
      areaId: area.id,
      fields
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    els.areaMetadataStatus.innerHTML = detail("Save survey area notes", payload.error || "Could not save the survey-specific area notes.");
    return;
  }

  project.surveyAreaOverrides = project.surveyAreaOverrides || {};
  project.surveyAreaOverrides[survey.id] = project.surveyAreaOverrides[survey.id] || {};
  project.surveyAreaOverrides[survey.id][area.id] = payload.override;
  renderAll();
  activateTab("admin");
  els.areaMetadataStatus.innerHTML = detail(
    "Save survey area notes",
    `${area.overviewCode} now has survey-specific monitoring notes for ${survey.label}.`
  );
}

async function resetAreaMetadata() {
  const project = currentProject();
  const survey = currentSurvey();
  const area = currentArea();

  els.areaMetadataStatus.innerHTML = detail(
    "Reset survey area notes",
    `Resetting ${area.overviewCode} back to its baseline notes for ${survey.label}...`
  );

  const response = await fetch("/api/survey-area-metadata/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: project.id,
      surveyId: survey.id,
      areaId: area.id
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    els.areaMetadataStatus.innerHTML = detail("Reset survey area notes", payload.error || "Could not reset the survey-specific area notes.");
    return;
  }

  if (project.surveyAreaOverrides?.[survey.id]) {
    delete project.surveyAreaOverrides[survey.id][area.id];
    if (!Object.keys(project.surveyAreaOverrides[survey.id]).length) {
      delete project.surveyAreaOverrides[survey.id];
    }
  }
  renderAll();
  activateTab("admin");
  els.areaMetadataStatus.innerHTML = detail(
    "Reset survey area notes",
    `${area.overviewCode} is back on its baseline notes for ${survey.label}.`
  );
}

async function saveVolumeChange() {
  const project = currentProject();
  const survey = currentSurvey();
  const area = currentArea();
  const rows = parseVolumeRows(els.volumeRowsInput.value);

  els.volumeAdminStatus.innerHTML = detail(
    "Volume change",
    `Saving ${rows.length} sandbar row(s) for ${area.overviewCode} in ${survey.label}...`
  );

  const response = await fetch("/api/volume-change", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: project.id,
      surveyId: survey.id,
      areaId: area.id,
      method: els.volumeMethodInput.value.trim(),
      cellSize: els.volumeCellSizeInput.value.trim(),
      notes: els.volumeNotesInput.value.trim(),
      polygons: rows
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    els.volumeAdminStatus.innerHTML = detail("Volume change", payload.error || "Could not save the sandbar volume results.");
    return;
  }

  project.volumeChangeComparisons = project.volumeChangeComparisons || {};
  project.volumeChangeComparisons[survey.id] = project.volumeChangeComparisons[survey.id] || {
    baselineSurveyId: survey.comparisonBaseline || null,
    areas: {}
  };
  project.volumeChangeComparisons[survey.id].baselineSurveyId = payload.record.baselineSurveyId;
  project.volumeChangeComparisons[survey.id].method = payload.record.method;
  project.volumeChangeComparisons[survey.id].cellSize = payload.record.cellSize;
  project.volumeChangeComparisons[survey.id].areas = project.volumeChangeComparisons[survey.id].areas || {};
  project.volumeChangeComparisons[survey.id].areas[area.id] = payload.record.area;

  renderAll();
  activateTab("admin");
  els.volumeAdminStatus.innerHTML = detail(
    "Volume change",
    `${rows.length} sandbar row(s) saved for ${area.overviewCode} in ${survey.label}.`
  );
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const commaIndex = text.indexOf(",");
      resolve(commaIndex >= 0 ? text.slice(commaIndex + 1) : text);
    };
    reader.onerror = () => reject(reader.error || new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

async function createSurveyRound() {
  const name = els.newSurveyName.value.trim();
  const dateFrom = els.newSurveyStart.value;
  const dateTo = els.newSurveyEnd.value;
  const baselineSurveyId = els.newSurveyBaseline.value || currentProject().surveys[currentProject().surveys.length - 1]?.id || null;

  if (!name || !dateFrom || !dateTo) {
    els.createSurveyStatus.innerHTML = detail("Create survey round", "Please give the survey a name, a start date, and an end date.");
    return;
  }

  if (dateTo < dateFrom) {
    els.createSurveyStatus.innerHTML = detail("Create survey round", "The end date needs to be the same as or later than the start date.");
    return;
  }

  els.createSurveyStatus.innerHTML = detail("Create survey round", `Creating ${name} and preparing the survey folders...`);

  const response = await fetch("/api/surveys/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: currentProject().id,
      name,
      dateFrom,
      dateTo,
      comparisonBaseline: baselineSurveyId
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    els.createSurveyStatus.innerHTML = detail("Create survey round", payload.error || "Could not create the new survey round.");
    return;
  }

  currentProject().surveys.push(payload.survey);
  currentProject().surveys.sort((a, b) => String(a.dateFrom).localeCompare(String(b.dateFrom)));
  state.surveyId = payload.survey.id;
  state.primarySurveyId = payload.survey.id;
  state.secondarySurveyId = payload.survey.comparisonBaseline || preferredSecondarySurveyId();
  state.sectionComparisonSurveyIds = defaultSectionComparisonSurveyIds();
  state.assetStatusCache.clear();
  els.newSurveyName.value = "";
  els.newSurveyStart.value = "";
  els.newSurveyEnd.value = "";
  els.createSurveyStatus.innerHTML = detail("Create survey round", `${payload.survey.label} created and ready for uploads.`);
  renderAll();
  activateTab("admin");
}

function renderCoverageCard(item) {
  const presentText = item.presentFiles.length ? `Present: ${item.presentFiles.join(", ")}` : "No expected files uploaded yet.";
  const missingText = item.missingFiles.length ? `Missing: ${item.missingFiles.join(", ")}` : "All expected files are present.";
  return `
    <article class="card">
      <p class="muted">${escapeHtml(item.areaLabel)} - ${escapeHtml(item.statusLabel)}</p>
      <h3>${item.presentCount}/${item.totalCount} files present</h3>
      <p>${escapeHtml(presentText)}</p>
      <p>${escapeHtml(missingText)}</p>
    </article>
  `;
}

function activateTab(tabName) {
  const allowedTabs = new Set(projectNavigationTabs());
  const requestedTab = allowedTabs.has(tabName) ? tabName : (allowedTabs.has("overview") ? "overview" : firstAvailableProjectTab());
  const safeTab = (!adminToolsEnabled() || !state.adminMode) && requestedTab === "admin"
    ? (allowedTabs.has("overview") ? "overview" : firstAvailableProjectTab())
    : requestedTab;
  if (safeTab !== "sections") {
    closeSectionInsightOverlay();
  }
  state.activeTab = safeTab;
  document.querySelectorAll(".tab").forEach((item) => {
    item.classList.toggle("active", item.dataset.tab === safeTab);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === safeTab);
  });
  renderShellToolbar();
  renderShellStage();
  syncUrlState();
}

function syncAdminVisibility() {
  const canShowAdmin = adminToolsEnabled() && state.adminMode;
  document.querySelectorAll("[data-admin-only='true']").forEach((item) => {
    item.classList.toggle("hidden", !canShowAdmin);
  });
  els.adminModeToggle.classList.toggle("hidden", !adminToolsEnabled());
  els.adminModeToggle.textContent = state.adminMode ? "Close Admin Console" : "Open Admin Console";
  if (!canShowAdmin && state.activeTab === "admin") {
    activateTab("overview");
  } else {
    activateTab(state.activeTab || "overview");
  }
}

function adminToolsEnabled() {
  return projectConfig.showAdminTools === true;
}

function isLocalHost() {
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

async function toggleAdminMode() {
  if (!adminToolsEnabled()) {
    return;
  }

  if (state.adminMode) {
    state.adminMode = false;
    window.localStorage.removeItem("fsm-admin-mode");
    syncAdminVisibility();
    return;
  }

  const password = window.prompt("Enter the admin password to open the admin console:");
  if (!password) {
    return;
  }

  const response = await fetch("/api/admin-auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    window.alert(payload.error || "Could not open the admin console.");
    return;
  }

  state.adminMode = true;
  window.localStorage.setItem("fsm-admin-mode", "1");
  state.accessUsers = payload.users || [];
  syncAdminVisibility();
  activateTab("admin");
}

function renderAccessUsersAdmin() {
  const users = Array.isArray(state.accessUsers) ? state.accessUsers.slice() : [];
  const activeUsers = users.filter((item) => item.active && !item.expired);
  const expiringSoon = activeUsers.filter((item) => item.expiresAt && (Date.parse(item.expiresAt) - Date.now()) <= (1000 * 60 * 60 * 24 * 7));
  const expiredUsers = users.filter((item) => item.expired);

  els.accessUsersSummary.innerHTML = [
    metric("Active logins", String(activeUsers.length), "Can still open the report"),
    metric("Expiring within 7 days", String(expiringSoon.length), "Worth checking before they lock out"),
    metric("Expired logins", String(expiredUsers.length), "No longer usable"),
    metric("Total saved", String(users.length), "Permanent and temporary logins")
  ].join("");

  if (!users.length) {
    els.accessUsersGrid.innerHTML = `
      <article class="card">
        <h3>No saved report logins yet</h3>
        <p>Create the harbour login or a temporary contractor login above. You can always sign in yourself with the admin username and admin password.</p>
      </article>
    `;
    return;
  }

  els.accessUsersGrid.innerHTML = users.map((user) => {
    const expiresDisplay = user.expiresAt
      ? new Date(user.expiresAt).toLocaleString("en-GB")
      : "No expiry";
    const statusLabel = user.expired
      ? "Expired"
      : (user.active ? "Active" : "Disabled");
    return `
      <article class="card admin-access-card" data-access-card="${escapeAttr(user.id)}">
        <div class="admin-board-meta">
          <span class="chip">${escapeHtml(user.label || user.username)}</span>
          <span class="chip">${escapeHtml(statusLabel)}</span>
        </div>
        <div class="admin-grid section-gap">
          <label>Label<input type="text" data-access-field="label" value="${escapeAttr(user.label || user.username)}"></label>
          <label>Username<input type="text" value="${escapeAttr(user.username)}" disabled></label>
          <label>Password reset<input type="text" data-access-field="password" placeholder="Leave blank to keep current"></label>
          <label>Expires at<input type="datetime-local" data-access-field="expiresAt" value="${escapeAttr(datetimeLocalValue(user.expiresAt))}"></label>
          <label class="admin-span-2">Notes<textarea data-access-field="notes" placeholder="Notes for this login">${escapeHtml(user.notes || "")}</textarea></label>
          <label><input type="checkbox" data-access-field="active" ${user.active ? "checked" : ""}> Active</label>
        </div>
        <p class="muted">Current expiry: ${escapeHtml(expiresDisplay)}</p>
        <div class="admin-actions">
          <button class="area-action" type="button" data-access-update="${escapeAttr(user.id)}">Save Login</button>
          <button class="chip" type="button" data-access-delete="${escapeAttr(user.id)}">Delete Login</button>
        </div>
      </article>
    `;
  }).join("");
}

async function refreshAccessUsers(statusCopy = "") {
  const response = await fetch("/api/access-users");
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Could not load report logins.");
  }
  state.accessUsers = payload.users || [];
  renderAccessUsersAdmin();
  if (statusCopy) {
    els.accessUserStatus.innerHTML = detail("Report logins", statusCopy);
  }
}

async function createAccessUser() {
  const username = els.accessUsernameInput.value.trim();
  const password = els.accessPasswordInput.value;
  const label = els.accessLabelInput.value.trim();
  const expiresAt = els.accessExpiresAtInput.value.trim();
  const notes = els.accessNotesInput.value.trim();

  if (!username || !password) {
    els.accessUserStatus.innerHTML = detail("Report logins", "Add at least a username and password before creating a login.");
    return;
  }

  els.accessUserStatus.innerHTML = detail("Report logins", `Creating login ${username}...`);
  const response = await fetch("/api/access-users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, label, expiresAt, notes, active: true })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    els.accessUserStatus.innerHTML = detail("Report logins", payload.error || "Could not create the report login.");
    return;
  }

  els.accessLabelInput.value = "";
  els.accessUsernameInput.value = "";
  els.accessPasswordInput.value = "";
  els.accessExpiresAtInput.value = "";
  els.accessNotesInput.value = "";
  state.accessUsers = payload.users || [];
  renderAccessUsersAdmin();
  els.accessUserStatus.innerHTML = detail("Report logins", "New report login created.");
}

async function updateAccessUser(userId) {
  const card = els.accessUsersGrid.querySelector(`[data-access-card="${CSS.escape(userId)}"]`);
  if (!card) {
    return;
  }

  const payload = {
    id: userId,
    label: card.querySelector('[data-access-field="label"]')?.value.trim() || "",
    password: card.querySelector('[data-access-field="password"]')?.value || "",
    expiresAt: card.querySelector('[data-access-field="expiresAt"]')?.value.trim() || "",
    notes: card.querySelector('[data-access-field="notes"]')?.value.trim() || "",
    active: Boolean(card.querySelector('[data-access-field="active"]')?.checked)
  };

  els.accessUserStatus.innerHTML = detail("Report logins", "Saving login changes...");
  const response = await fetch("/api/access-users/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    els.accessUserStatus.innerHTML = detail("Report logins", body.error || "Could not save login changes.");
    return;
  }

  state.accessUsers = body.users || [];
  renderAccessUsersAdmin();
  els.accessUserStatus.innerHTML = detail("Report logins", "Login updated.");
}

async function deleteAccessUser(userId) {
  if (!window.confirm("Delete this report login?")) {
    return;
  }

  els.accessUserStatus.innerHTML = detail("Report logins", "Deleting login...");
  const response = await fetch("/api/access-users/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    els.accessUserStatus.innerHTML = detail("Report logins", body.error || "Could not delete the report login.");
    return;
  }

  state.accessUsers = body.users || [];
  renderAccessUsersAdmin();
  els.accessUserStatus.innerHTML = detail("Report logins", "Login deleted.");
}

async function signOut() {
  await fetch("/api/site-auth/logout", { method: "POST" }).catch(() => null);
  window.localStorage.removeItem("fsm-admin-mode");
  window.location.href = "/login";
}

function datetimeLocalValue(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function capitalise(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fillSelect(select, options, value) {
  select.innerHTML = options.map(([id, label]) => `<option value="${escapeAttr(id)}">${escapeHtml(label)}</option>`).join("");
  select.value = value;
}

function metric(label, value, subtext) {
  return `<article class="card"><p class="muted">${escapeHtml(label)}</p><h3>${escapeHtml(value)}</h3><p>${escapeHtml(subtext)}</p></article>`;
}

function detail(title, copy) {
  return `<div class="detail-item"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(copy)}</p></div>`;
}

function starterLikeText(value) {
  return /starter|placeholder|reference setup|tbd|example monitoring area/i.test(String(value || ""));
}

function customisedText(value) {
  return typeof value === "string" && value.trim() && !starterLikeText(value);
}

function onboardingStepState({ complete, progress }) {
  if (complete) {
    return "complete";
  }
  if (progress) {
    return "in-progress";
  }
  return "pending";
}

async function deriveProjectOnboarding(project, survey, existingCoverage = null) {
  const areaList = project.projectAreaList || [];
  const coverage = existingCoverage || await buildSurveyCoverage(project, survey);
  const nonPlaceholderAreas = areaList.filter((area) => !starterLikeText(area.title) && !starterLikeText(area.purpose)).length;
  const overrideCount = areaList.filter((area) => Object.keys(areaOverride(project, survey.id, area.id) || {}).length).length;
  const identitySignals = [
    customisedText(project.status),
    customisedText(project.selectorSummary),
    customisedText(project.site?.county)
  ].filter(Boolean).length;

  const steps = [
    {
      title: "Project identity customised",
      status: onboardingStepState({
        complete: identitySignals >= 3,
        progress: identitySignals > 0
      }),
      value: identitySignals >= 3 ? "Ready for live use" : identitySignals > 0 ? `${identitySignals}/3 starter fields replaced` : "Still using scaffold defaults",
      copy: identitySignals >= 3
        ? "Project name, summary, and site metadata have moved beyond the generic starter state."
        : "Replace the remaining starter metadata in project.json so the report reads like a real client project.",
      nextAction: "Update project status, selector summary, and site location fields in project.json."
    },
    {
      title: "Area catalogue defined",
      status: onboardingStepState({
        complete: areaList.length > 1 && nonPlaceholderAreas === areaList.length,
        progress: nonPlaceholderAreas > 0
      }),
      value: nonPlaceholderAreas ? `${nonPlaceholderAreas}/${areaList.length} area definitions customised` : "Starter area only",
      copy: areaList.length > 1 && nonPlaceholderAreas === areaList.length
        ? "The project has a meaningful set of monitoring areas instead of the single placeholder area."
        : "Add the real monitoring reaches and replace any remaining example labels or purposes in areas.json.",
      nextAction: "Expand areas.json with the real estuary reaches and area-specific summaries."
    },
    {
      title: "Repeat survey history ready",
      status: onboardingStepState({
        complete: (project.surveys || []).length >= 2,
        progress: (project.surveys || []).length === 1
      }),
      value: `${(project.surveys || []).length} survey round${(project.surveys || []).length === 1 ? "" : "s"} configured`,
      copy: (project.surveys || []).length >= 2
        ? "The project now has at least one comparable repeat round, so change monitoring can operate normally."
        : project.singleScanMessage,
      nextAction: "Create the second comparable survey round once the next field campaign is ready."
    },
    {
      title: "Survey-specific area notes captured",
      status: onboardingStepState({
        complete: areaList.length > 0 && overrideCount === areaList.length,
        progress: overrideCount > 0
      }),
      value: `${overrideCount}/${areaList.length || 0} areas with survey-specific notes`,
      copy: overrideCount
        ? "Some selected-area context is already tailored to this survey round instead of relying on shared baseline notes."
        : "The selected survey is still using baseline area notes everywhere.",
      nextAction: "Use the admin context editor to save timing, tide, weather, and interpretation notes for each area."
    },
    {
      title: "Survey assets uploaded",
      status: onboardingStepState({
        complete: coverage.totalFiles > 0 && coverage.presentFiles === coverage.totalFiles,
        progress: coverage.presentFiles > 0
      }),
      value: `${coverage.presentFiles}/${coverage.totalFiles} expected files present`,
      copy: coverage.presentFiles === coverage.totalFiles && coverage.totalFiles > 0
        ? "All expected survey imagery files are present for the selected round."
        : "Upload coverage is incomplete for the selected survey, so some compare views will still be missing.",
      nextAction: "Upload the expected ortho, DSM, contour, section-line, and CSV outputs for each area."
    }
  ];

  return {
    completeCount: steps.filter((step) => step.status === "complete").length,
    inProgressCount: steps.filter((step) => step.status === "in-progress").length,
    pendingCount: steps.filter((step) => step.status === "pending").length,
    nextPriority: steps.find((step) => step.status !== "complete") || null,
    steps
  };
}

function renderOnboardingChecklist(summaryEl, detailsEl, onboarding) {
  if (!summaryEl || !detailsEl || !onboarding) {
    return;
  }

  summaryEl.innerHTML = [
    metric("Setup steps complete", String(onboarding.completeCount), "Checklist items fully in place"),
    metric("Setup in progress", String(onboarding.inProgressCount), "Started but not fully complete"),
    metric("Still to do", String(onboarding.pendingCount), "Still using starter or missing data"),
    metric("Next priority", onboarding.nextPriority?.title || "All set", onboarding.nextPriority?.nextAction || "The current project onboarding checklist is complete.")
  ].join("");

  detailsEl.innerHTML = onboarding.steps.map((step) => `
    <article class="card onboarding-card">
      <div class="onboarding-card__meta">
        <h3>${escapeHtml(step.title)}</h3>
        <span class="onboarding-card__status" data-status="${escapeAttr(step.status)}">${escapeHtml(step.status.replace("-", " "))}</span>
      </div>
      <p><strong>${escapeHtml(step.value)}</strong></p>
      <p>${escapeHtml(step.copy)}</p>
      <div class="detail-list">
        ${detail("Next action", step.nextAction)}
      </div>
    </article>
  `).join("");
}

function assetCard(title, copy) {
  return `<article class="card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(copy)}</p></article>`;
}

function sectionInsightCard({ eyebrow, title, summary, body }) {
  return `
    <button
      class="section-insight-card"
      type="button"
      data-section-insight="true"
      data-section-insight-eyebrow="${escapeAttr(eyebrow)}"
      data-section-insight-title="${escapeAttr(title)}"
      data-section-insight-summary="${escapeAttr(summary)}"
      data-section-insight-body="${escapeAttr(body)}"
    >
      <span class="section-insight-card__eyebrow">${escapeHtml(eyebrow)}</span>
      <strong class="section-insight-card__title">${escapeHtml(title)}</strong>
      <span class="section-insight-card__summary">${escapeHtml(summary)}</span>
      <span class="section-insight-card__action">Open detail</span>
    </button>
  `;
}

function openSectionInsightOverlay(eyebrow, title, summary, body, allowHtml = false) {
  els.sectionInsightOverlayEyebrow.textContent = eyebrow;
  els.sectionInsightOverlayTitle.textContent = title;
  els.sectionInsightOverlaySummary.textContent = summary;
  els.sectionInsightOverlayBody.innerHTML = allowHtml ? body : `<p>${escapeHtml(body)}</p>`;
  els.sectionInsightOverlay.classList.remove("hidden");
  els.sectionInsightOverlay.setAttribute("aria-hidden", "false");
}

function closeSectionInsightOverlay() {
  els.sectionInsightOverlay.classList.add("hidden");
  els.sectionInsightOverlay.setAttribute("aria-hidden", "true");
}

function openVolumeImageLightbox(eyebrow, title, caption, src, alt, legendItems = [], rotation = 0) {
  if (!src || !els.volumeImageLightbox) {
    return;
  }
  els.volumeImageLightboxEyebrow.textContent = eyebrow;
  els.volumeImageLightboxTitle.textContent = title;
  els.volumeImageLightboxCaption.textContent = caption;
  els.volumeImageLightboxImage.src = src;
  els.volumeImageLightboxImage.alt = alt;
  state.volumeLightboxRotation = rotation;
  renderVolumeImageLightboxLegend(legendItems);
  els.volumeImageLightbox.classList.remove("hidden");
  els.volumeImageLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("volume-lightbox-open");
  setVolumeImageLightboxZoom(1);
}

function closeVolumeImageLightbox() {
  if (!els.volumeImageLightbox) {
    return;
  }
  els.volumeImageLightbox.classList.add("hidden");
  els.volumeImageLightbox.setAttribute("aria-hidden", "true");
  els.volumeImageLightboxImage.removeAttribute("src");
  state.volumeLightboxRotation = 0;
  renderVolumeImageLightboxLegend([]);
  document.body.classList.remove("volume-lightbox-open");
  state.volumeLightboxZoom = 1;
  state.volumeLightboxPanX = 0;
  state.volumeLightboxPanY = 0;
  state.volumeLightboxIsPanning = false;
  state.volumeLightboxPointerId = null;
  els.volumeImageLightboxViewport?.classList.remove("is-panning");
}

function setVolumeImageLightboxZoom(value) {
  const nextZoom = clamp(value, 1, 4);
  state.volumeLightboxZoom = nextZoom;
  if (nextZoom <= 1) {
    state.volumeLightboxPanX = 0;
    state.volumeLightboxPanY = 0;
  } else {
    clampVolumeImageLightboxPan();
  }
  applyVolumeImageLightboxTransform();
}

function setVolumeImageLightboxPan(x, y) {
  state.volumeLightboxPanX = x;
  state.volumeLightboxPanY = y;
  clampVolumeImageLightboxPan();
  applyVolumeImageLightboxTransform();
}

function clampVolumeImageLightboxPan() {
  if (!els.volumeImageLightboxImage || !els.volumeImageLightboxViewport) {
    return;
  }
  if (state.volumeLightboxZoom <= 1) {
    state.volumeLightboxPanX = 0;
    state.volumeLightboxPanY = 0;
    return;
  }
  const viewportWidth = els.volumeImageLightboxViewport.clientWidth - 28;
  const viewportHeight = els.volumeImageLightboxViewport.clientHeight - 28;
  const imageWidth = els.volumeImageLightboxImage.offsetWidth;
  const imageHeight = els.volumeImageLightboxImage.offsetHeight;
  const maxPanX = Math.max(0, ((imageWidth * state.volumeLightboxZoom) - viewportWidth) / 2);
  const maxPanY = Math.max(0, ((imageHeight * state.volumeLightboxZoom) - viewportHeight) / 2);
  state.volumeLightboxPanX = clamp(state.volumeLightboxPanX, -maxPanX, maxPanX);
  state.volumeLightboxPanY = clamp(state.volumeLightboxPanY, -maxPanY, maxPanY);
}

function applyVolumeImageLightboxTransform() {
  if (!els.volumeImageLightboxImage) {
    return;
  }
  els.volumeImageLightboxImage.style.width = "100%";
  els.volumeImageLightboxImage.style.maxWidth = "100%";
  els.volumeImageLightboxImage.style.maxHeight = "100%";
  els.volumeImageLightboxImage.style.transform = `${state.volumeLightboxRotation ? `rotate(${state.volumeLightboxRotation}deg) ` : ""}translate(${state.volumeLightboxPanX}px, ${state.volumeLightboxPanY}px) scale(${state.volumeLightboxZoom})`.trim();
  els.volumeImageLightboxImage.style.transformOrigin = "center center";
  if (els.volumeImageLightboxViewport) {
    els.volumeImageLightboxViewport.classList.toggle("is-zoomed", state.volumeLightboxZoom > 1);
  }
}

function renderVolumeImageLightboxLegend(items = []) {
  if (!els.volumeImageLightboxLegend) {
    return;
  }
  if (!items.length) {
    els.volumeImageLightboxLegend.classList.add("is-hidden");
    els.volumeImageLightboxLegend.innerHTML = "";
    return;
  }
  els.volumeImageLightboxLegend.classList.remove("is-hidden");
  els.volumeImageLightboxLegend.innerHTML = `
    <div class="volume-image-lightbox__legend-head">
      <p class="eyebrow">Map Legend</p>
      <h4>Trend classes</h4>
    </div>
    <div class="volume-image-lightbox__legend-list">
      ${items.map((item) => `
        <article class="volume-image-lightbox__legend-item">
          <div class="volume-image-lightbox__legend-title">
            <span class="volume-trend-swatch" style="background:${escapeAttr(item.color)};"></span>
            <strong>${escapeHtml(item.label)}</strong>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function fixed(value, digits) {
  return Number(value).toFixed(digits);
}

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

