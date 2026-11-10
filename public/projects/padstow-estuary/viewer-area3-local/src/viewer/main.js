import * as THREE from './vendor/three.module.js?v=3';
import { OrbitControls } from './vendor/OrbitControls.js?v=3';
import { PLYLoader } from './vendor/PLYLoader.js?v=3';

const canvas = document.querySelector('#viewer');
const pageBody = document.body;
const heroTitleEl = document.querySelector('#hero-title');
const heroIntroEl = document.querySelector('#hero-intro');
const surveyPillValueEl = document.querySelector('#survey-pill-value');
const surveyPillSubtextEl = document.querySelector('#survey-pill-subtext');
const areaPillValueEl = document.querySelector('#area-pill-value');
const areaPillSubtextEl = document.querySelector('#area-pill-subtext');
const brandBlockEl = document.querySelector('.brand-block');
const pillStackEl = document.querySelector('.pill-stack');
const panelEl = document.querySelector('.panel');
const dockEl = document.querySelector('.dock');
const areaSelectRowEl = document.querySelector('#area-select-row');
const areaSelectEl = document.querySelector('#area-select');
const comparisonSelectEl = document.querySelector('#comparison-select');
const pairPickerEl = document.querySelector('#pair-picker');
const statusEl = document.querySelector('#status');
const toggleSiteMapEl = document.querySelector('#toggle-site-map');
const toggleGridEl = document.querySelector('#toggle-grid');
const toggleOverlayEl = document.querySelector('#toggle-overlay');
const overlayModeEl = document.querySelector('#overlay-mode');
const pointSizeEl = document.querySelector('#point-size');
const opacityEl = document.querySelector('#opacity');
const probeReadoutEl = document.querySelector('#probe-readout');
const resetCameraEl = document.querySelector('#reset-camera');
const overviewCameraEl = document.querySelector('#overview-camera');
const fullscreenEl = document.querySelector('#fullscreen');
const assetUrl = (path) => new URL(path, path.endsWith('/scene_index.json') ? window.location.href : 'https://hostedsite.vercel.app/').toString();
const embeddedMode =
  new URLSearchParams(window.location.search).get('embed') === '1' ||
  window.self !== window.top;

if (embeddedMode) {
  pageBody.classList.add('is-embedded');
}

window.__viewerBooted = true;
statusEl.textContent = 'Booting viewer...';

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e8edf0');

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.up.set(0, 0, 1);
camera.position.set(0, -220, 180);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = true;
controls.target.set(0, 0, 12);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x6f7b80, 1.2);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(160, -120, 220);
scene.add(dirLight);

const grid = new THREE.GridHelper(900, 24, 0xb8c2c8, 0xd3dbe0);
grid.rotation.x = Math.PI / 2;
grid.position.z = -0.2;
grid.visible = false;
scene.add(grid);

const loader = new PLYLoader();
const textureLoader = new THREE.TextureLoader();
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 4.5;
const pointer = new THREE.Vector2();
const meshes = {
  siteMap: null,
  areaOutline: null,
  overlays: {
    draped: null,
    true_z: null,
  },
};
const geometryData = {
  overlays: {
    draped: null,
    true_z: null,
  },
};
let sceneIndex = null;
let activeArea = null;
let activeDataset = null;
let sceneMetadata = null;
let defaultCamera = {
  position: new THREE.Vector3(0, -220, 180),
  target: new THREE.Vector3(0, 0, 12),
};
let overviewCamera = null;
let dragDistance = 0;
let pointerDown = null;

function setStatus(message) {
  statusEl.textContent = message;
}

function setProbeReadout(message) {
  probeReadoutEl.textContent = message;
}

function createPoints(geometry, options) {
  geometry.computeBoundingBox();
  const material = new THREE.PointsMaterial({
    size: Number(pointSizeEl.value) * options.sizeMultiplier,
    vertexColors: true,
    transparent: true,
    opacity: Number(opacityEl.value) * options.opacityMultiplier,
    sizeAttenuation: true,
  });
  return new THREE.Points(geometry, material);
}

function rememberGeometryData(key, geometry) {
  const positions = geometry.getAttribute('position');
  const colors = geometry.getAttribute('color');
  const data = { positions, colors };

  geometryData.overlays[key] = data;
}

function disposeMesh(mesh) {
  if (!mesh) {
    return;
  }
  scene.remove(mesh);
  mesh.geometry?.dispose?.();
  mesh.material?.dispose?.();
}

function clearSceneAssets() {
  disposeMesh(meshes.siteMap);
  disposeMesh(meshes.areaOutline);
  disposeMesh(meshes.overlays.draped);
  disposeMesh(meshes.overlays.true_z);
  meshes.siteMap = null;
  meshes.areaOutline = null;
  meshes.overlays.draped = null;
  meshes.overlays.true_z = null;
  geometryData.overlays.draped = null;
  geometryData.overlays.true_z = null;
}

function updateMaterials() {
  Object.values(meshes.overlays).forEach((overlay) => {
    if (!overlay) {
      return;
    }
    overlay.material.size = Number(pointSizeEl.value) * 1.15;
    overlay.material.opacity = Number(opacityEl.value);
  });
}

function activeOverlayKey() {
  return overlayModeEl.value;
}

function activeOverlay() {
  return meshes.overlays[activeOverlayKey()] ?? null;
}

function updateOverlayVisibility() {
  Object.entries(meshes.overlays).forEach(([key, overlay]) => {
    if (!overlay) {
      return;
    }
    overlay.visible = toggleOverlayEl.checked && key === activeOverlayKey();
  });
}

function updateSceneVisibility() {
  if (meshes.siteMap) {
    meshes.siteMap.visible = toggleSiteMapEl.checked;
  }
  if (meshes.areaOutline) {
    meshes.areaOutline.visible = toggleSiteMapEl.checked;
  }
  grid.visible = toggleGridEl.checked;
  updateOverlayVisibility();
}

function applyCameraFrame(box, mode) {
  if (box.isEmpty()) {
    return;
  }
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const radius = Math.max(size.x, size.y, size.z) * 0.8 || 1;
  const frame = {
    position: new THREE.Vector3(center.x + radius * 0.4, center.y - radius * 1.2, center.z + radius * 0.75),
    target: center.clone(),
  };
  if (mode === 'overview') {
    overviewCamera = frame;
  } else {
    defaultCamera = frame;
  }
}

function frameScene() {
  const overlay = activeOverlay();
  const box = new THREE.Box3();
  if (overlay) {
    box.expandByObject(overlay);
  }
  applyCameraFrame(box, 'default');
}

function frameOverview() {
  const box = new THREE.Box3();
  if (meshes.siteMap) {
    box.expandByObject(meshes.siteMap);
  }
  if (meshes.areaOutline) {
    box.expandByObject(meshes.areaOutline);
  }
  if (box.isEmpty() && activeOverlay()) {
    box.expandByObject(activeOverlay());
  }
  applyCameraFrame(box, 'overview');
}

function applyCameraState(frame) {
  if (!frame) {
    return;
  }
  camera.position.copy(frame.position);
  controls.target.copy(frame.target);
  controls.update();
}

function loadPly(url, options) {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (geometry) => resolve({ points: createPoints(geometry, options), geometry }),
      undefined,
      reject,
    );
  });
}

function loadJson(url) {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    return response.json();
  });
}

function addSiteMap(metadata, path) {
  if (!metadata.site_underlay || !path) {
    return;
  }

  const bounds = metadata.site_underlay.bounds_xy_centered;
  const width = bounds.max[0] - bounds.min[0];
  const height = bounds.max[1] - bounds.min[1];
  const centerX = (bounds.min[0] + bounds.max[0]) / 2;
  const centerY = (bounds.min[1] + bounds.max[1]) / 2;

  const texture = textureLoader.load(assetUrl(`./output/processed/${path}`));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    }),
  );
  plane.position.set(centerX, centerY, -0.35);
  scene.add(plane);
  meshes.siteMap = plane;

  const baseBounds = metadata.bounds;
  const outlinePoints = [
    new THREE.Vector3(baseBounds.min[0], baseBounds.min[1], -0.12),
    new THREE.Vector3(baseBounds.max[0], baseBounds.min[1], -0.12),
    new THREE.Vector3(baseBounds.max[0], baseBounds.max[1], -0.12),
    new THREE.Vector3(baseBounds.min[0], baseBounds.max[1], -0.12),
    new THREE.Vector3(baseBounds.min[0], baseBounds.min[1], -0.12),
  ];
  const outlineGeometry = new THREE.BufferGeometry().setFromPoints(outlinePoints);
  const outline = new THREE.Line(
    outlineGeometry,
    new THREE.LineBasicMaterial({ color: 0x1d2629, transparent: true, opacity: 0.9 }),
  );
  scene.add(outline);
  meshes.areaOutline = outline;
}

function formatNumber(value, digits = 2) {
  return Number(value).toFixed(digits);
}

function updateHeader(dataset, metadata) {
  const viewerTitle = `${metadata.area_label} ${dataset.display_label} Change Viewer`;
  heroTitleEl.textContent = viewerTitle;
  document.title = viewerTitle;
  heroIntroEl.textContent = metadata.description;
  surveyPillValueEl.textContent = dataset.display_label;
  surveyPillSubtextEl.textContent = metadata.terrain_label;
  areaPillValueEl.textContent = metadata.area_label;
  areaPillSubtextEl.textContent = metadata.description;
}

function layoutFloatingPanels() {
  if (!brandBlockEl || !pillStackEl || !panelEl || !dockEl) {
    return;
  }

  if (embeddedMode) {
    const panelTop = 12;
    panelEl.style.top = `${panelTop}px`;
    dockEl.style.top = `${Math.round(panelTop + panelEl.offsetHeight + 10)}px`;
    return;
  }

  if (window.innerWidth <= 1120) {
    panelEl.style.top = '';
    panelEl.style.maxHeight = '';
    panelEl.style.overflowY = '';
    dockEl.style.top = '';
    return;
  }

  const panelTop = Math.round(brandBlockEl.offsetTop + brandBlockEl.offsetHeight + 24);
  panelEl.style.top = `${panelTop}px`;
  panelEl.style.maxHeight = `${Math.max(0, window.innerHeight - panelTop - 14)}px`;
  panelEl.style.overflowY = 'auto';
  dockEl.style.top = `${Math.round(pillStackEl.offsetTop + pillStackEl.offsetHeight + 24)}px`;
}

function probePoint(intersection, sourceKey) {
  if (!sceneMetadata) {
    return;
  }

  const data = geometryData.overlays[sourceKey];
  if (!data) {
    return;
  }

  const index = intersection.index;
  if (index == null) {
    return;
  }

  const x = data.positions.getX(index);
  const y = data.positions.getY(index);
  const z = data.positions.getZ(index);
  const absZ = z + sceneMetadata.origin.z;
  const absX = x + sceneMetadata.origin.x;
  const absY = y + sceneMetadata.origin.y;
  const isGain = data.colors.getZ(index) > data.colors.getX(index);
  const label = isGain ? 'Gain' : 'Loss';
  const drapedData = geometryData.overlays.draped;
  const drapedZ = drapedData ? drapedData.positions.getZ(index) + sceneMetadata.origin.z : null;
  const delta = sourceKey === 'true_z' && drapedZ != null
    ? absZ - drapedZ + sceneMetadata.offset_m
    : null;
  const deltaText =
    sourceKey === 'true_z'
      ? delta == null
        ? ''
        : ` Change ${delta >= 0 ? '+' : ''}${formatNumber(delta)}m.`
      : ' Draped classification view.';
  setProbeReadout(
    `${label} point height ${formatNumber(absZ)}m at X ${formatNumber(absX, 3)}, Y ${formatNumber(absY, 3)}.${deltaText}`
  );
}

function handleProbe(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const candidates = [];
  if (meshes.overlays.true_z?.visible) {
    candidates.push({ key: 'true_z', object: meshes.overlays.true_z });
  }
  if (meshes.overlays.draped?.visible) {
    candidates.push({ key: 'draped', object: meshes.overlays.draped });
  }

  let best = null;
  for (const candidate of candidates) {
    const hit = raycaster.intersectObject(candidate.object, false)[0];
    if (!hit) {
      continue;
    }
    if (!best || hit.distance < best.hit.distance) {
      best = { key: candidate.key, hit };
    }
  }

  if (!best) {
    setProbeReadout('Click the terrain or change points to inspect height.');
    return;
  }

  probePoint(best.hit, best.key);
}

window.__viewerDebug = {
  probeAtNormalized(normalizedX, normalizedY) {
    const rect = renderer.domElement.getBoundingClientRect();
    handleProbe({
      clientX: rect.left + rect.width * normalizedX,
      clientY: rect.top + rect.height * normalizedY,
    });
    return probeReadoutEl.textContent;
  },
};

function areaById(areaId) {
  return sceneIndex?.areas?.find((area) => area.id === areaId) ?? null;
}

function datasetById(area, datasetId) {
  return area?.datasets?.find((dataset) => dataset.id === datasetId) ?? null;
}

function populateAreaSelector(index) {
  areaSelectEl.innerHTML = '';
  index.areas.forEach((area) => {
    const option = document.createElement('option');
    option.value = area.id;
    option.textContent = area.label;
    areaSelectEl.append(option);
  });
  areaSelectEl.value = index.default_area_id || index.areas[0]?.id || '';
  areaSelectRowEl.style.display = index.areas.length > 1 ? 'grid' : 'none';
}

function renderPairPicker(area, selectedDatasetId) {
  pairPickerEl.innerHTML = '';
  area.datasets.forEach((dataset) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pair-picker__item';
    button.dataset.datasetId = dataset.id;
    button.setAttribute('role', 'listitem');
    button.setAttribute('aria-pressed', String(dataset.id === selectedDatasetId));
    button.title = dataset.display_label;
    button.innerHTML = `<strong>${dataset.label}</strong><span>${dataset.display_label}</span>`;
    pairPickerEl.append(button);
  });
}

function populateComparisonSelector(area) {
  comparisonSelectEl.innerHTML = '';
  area.datasets.forEach((dataset) => {
    const option = document.createElement('option');
    option.value = dataset.id;
    option.textContent = dataset.display_label;
    comparisonSelectEl.append(option);
  });
  comparisonSelectEl.value = area.default_dataset_id || area.datasets[0]?.id || '';
  renderPairPicker(area, comparisonSelectEl.value);
}

async function loadDataset(areaId, datasetId) {
  const area = areaById(areaId);
  const dataset = datasetById(area, datasetId);
  if (!dataset) {
    throw new Error(`Unknown dataset id: ${datasetId}`);
  }

  activeArea = area;
  activeDataset = dataset;
  comparisonSelectEl.value = dataset.id;
  renderPairPicker(area, dataset.id);
  clearSceneAssets();
  setProbeReadout('Click the terrain or change points to inspect height.');

  setStatus(`Loading ${dataset.display_label} metadata...`);
  const metadata = await loadJson(assetUrl(`./output/processed/${dataset.paths.metadata}`));
  sceneMetadata = metadata;
  updateHeader(dataset, metadata);
  layoutFloatingPanels();

  addSiteMap(metadata, dataset.paths.site_map);

  setStatus(`Loading ${dataset.display_label} draped overlay...`);
  const drapedLoad = await loadPly(assetUrl(`./output/processed/${dataset.paths.draped}`), {
    sizeMultiplier: 1.15,
    opacityMultiplier: 1,
  });
  meshes.overlays.draped = drapedLoad.points;
  rememberGeometryData('draped', drapedLoad.geometry);
  scene.add(meshes.overlays.draped);

  setStatus(`Loading ${dataset.display_label} true elevation overlay...`);
  const trueZLoad = await loadPly(assetUrl(`./output/processed/${dataset.paths.true_z}`), {
    sizeMultiplier: 1.15,
    opacityMultiplier: 1,
  });
  meshes.overlays.true_z = trueZLoad.points;
  rememberGeometryData('true_z', trueZLoad.geometry);
  scene.add(meshes.overlays.true_z);

  updateSceneVisibility();
  updateMaterials();
  frameScene();
  frameOverview();
  applyCameraState(defaultCamera);
  setStatus('Loaded. Drag to orbit, right-drag to pan, scroll to zoom.');
}

async function bootViewer() {
  try {
    setStatus('Loading dataset index...');
    sceneIndex = await loadJson(assetUrl('./output/processed/scene_index.json'));
    populateAreaSelector(sceneIndex);
    const initialArea = areaById(areaSelectEl.value);
    populateComparisonSelector(initialArea);
    layoutFloatingPanels();
    await loadDataset(areaSelectEl.value, comparisonSelectEl.value);
  } catch (error) {
    console.error(error);
    setStatus('Unable to load processed datasets. Run `npm run prep:data` first.');
  }
}

toggleSiteMapEl.addEventListener('change', updateSceneVisibility);
toggleGridEl.addEventListener('change', updateSceneVisibility);
toggleOverlayEl.addEventListener('change', updateSceneVisibility);

overlayModeEl.addEventListener('change', () => {
  updateOverlayVisibility();
  frameScene();
  applyCameraState(defaultCamera);
});

areaSelectEl.addEventListener('change', async () => {
  if (!sceneIndex) {
    return;
  }
  const area = areaById(areaSelectEl.value);
  if (!area) {
    return;
  }
  populateComparisonSelector(area);
  try {
    await loadDataset(area.id, comparisonSelectEl.value);
  } catch (error) {
    console.error(error);
    setStatus(`Unable to switch to ${area.label}.`);
  }
});

pairPickerEl.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-dataset-id]');
  if (!button || !activeArea || !sceneIndex) {
    return;
  }
  try {
    await loadDataset(activeArea.id, button.dataset.datasetId);
  } catch (error) {
    console.error(error);
    setStatus(`Unable to switch to ${button.dataset.datasetId}.`);
  }
});

comparisonSelectEl.addEventListener('change', async () => {
  if (!sceneIndex || !activeArea) {
    return;
  }
  try {
    await loadDataset(activeArea.id, comparisonSelectEl.value);
  } catch (error) {
    console.error(error);
    setStatus(`Unable to switch to ${comparisonSelectEl.value}.`);
  }
});

pointSizeEl.addEventListener('input', updateMaterials);
opacityEl.addEventListener('input', updateMaterials);

resetCameraEl.addEventListener('click', () => {
  applyCameraState(defaultCamera);
});

overviewCameraEl.addEventListener('click', () => {
  frameOverview();
  applyCameraState(overviewCamera);
});

fullscreenEl.addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});

canvas.addEventListener('pointerdown', (event) => {
  pointerDown = { x: event.clientX, y: event.clientY };
  dragDistance = 0;
});

canvas.addEventListener('pointermove', (event) => {
  if (!pointerDown) {
    return;
  }
  const dx = event.clientX - pointerDown.x;
  const dy = event.clientY - pointerDown.y;
  dragDistance = Math.max(dragDistance, Math.hypot(dx, dy));
});

canvas.addEventListener('pointerup', (event) => {
  if (pointerDown && dragDistance < 6) {
    handleProbe(event);
  }
  pointerDown = null;
  dragDistance = 0;
});

canvas.addEventListener('pointerleave', () => {
  pointerDown = null;
  dragDistance = 0;
});

canvas.addEventListener('click', (event) => {
  if (dragDistance < 6) {
    handleProbe(event);
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  layoutFloatingPanels();
});

function tick() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

bootViewer();
layoutFloatingPanels();
tick();
