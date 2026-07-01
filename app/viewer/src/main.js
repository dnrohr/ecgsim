import * as THREE from "three";
import { baselineWindowForSignal, buildRmsTrace, filterTraces } from "./filtering.js";
import { canRecomputeLeadTraces, recomputeLeadTraces } from "./recompute.js";
import { computeWeightedRegionMembership, mergeWeightedRegions } from "./selection.js";
import { generateTmpSample, tmpParametersFromVectors } from "./tmp-generation.js";
import {
  EDITABLE_PARAMETERS,
  applyTmpEditSnapshot,
  applyWeightedParameterTransaction,
  buildTmpPlotNodes,
  createTmpEditState,
  nodeParameterValue,
  redoLastTransaction,
  resetBeatTransaction,
  resetWeightedParameterTransaction,
  serializeTmpEditState,
  undoLastTransaction,
} from "./tmp-editing.js";

const status = document.querySelector("[data-case-status]");
const shell = document.querySelector("[data-viewer-shell]");
const caseFile = document.querySelector("[data-case-file]");
const caseBundleFile = document.querySelector("[data-case-bundle-file]");
const caseSize = document.querySelector("[data-case-size]");
const caseLeads = document.querySelector("[data-case-leads]");
const caseMarkers = document.querySelector("[data-case-markers]");
const caseUnsupported = document.querySelector("[data-case-unsupported]");
const caseValidation = document.querySelector("[data-case-validation]");
const caseNotice = document.querySelector("[data-case-notice]");
const statusMessage = document.querySelector("[data-status-message]");
const toolbarLeadSystem = document.querySelector("[data-toolbar-lead-system]");
const timeStepBack = document.querySelector("[data-time-step-back]");
const timePlay = document.querySelector("[data-time-play]");
const timeStepForward = document.querySelector("[data-time-step-forward]");
const timeCursor = document.querySelector("[data-time-cursor]");
const timeStatus = document.querySelector("[data-time-status]");
const heartViewport = document.querySelector("[data-heart-viewport]");
const heartMetadata = document.querySelector("[data-heart-metadata]");
const heartSelectionMode = document.querySelector("[data-heart-selection-mode]");
const heartRadius = document.querySelector("[data-heart-radius]");
const heartTransition = document.querySelector("[data-heart-transition]");
const heartSelection = document.querySelector("[data-heart-selection]");
const heartAp = document.querySelector("[data-heart-ap]");
const heartRotate = document.querySelector("[data-heart-rotate]");
const heartSurface = document.querySelector("[data-heart-surface]");
const heartValues = document.querySelector("[data-heart-values]");
const heartWall = document.querySelector("[data-heart-wall]");
const heartTransmural = document.querySelector("[data-heart-transmural]");
const heartSurfaceStatus = document.querySelector("[data-heart-surface-status]");
const thoraxViewport = document.querySelector("[data-thorax-viewport]");
const thoraxMetadata = document.querySelector("[data-thorax-metadata]");
const thoraxAp = document.querySelector("[data-thorax-ap]");
const thoraxRotate = document.querySelector("[data-thorax-rotate]");
const thoraxSurface = document.querySelector("[data-thorax-surface]");
const thoraxScale = document.querySelector("[data-thorax-scale]");
const thoraxElectrodes = document.querySelector("[data-thorax-electrodes]");
const thoraxSurfaceStatus = document.querySelector("[data-thorax-surface-status]");
const thoraxSelection = document.querySelector("[data-thorax-selection]");
const leadsMetadata = document.querySelector("[data-leads-metadata]");
const leadsSystem = document.querySelector("[data-leads-system]");
const leadsFilter = document.querySelector("[data-leads-filter]");
const leadsMeasured = document.querySelector("[data-leads-measured]");
const leadsInitial = document.querySelector("[data-leads-initial]");
const leadsAdapted = document.querySelector("[data-leads-adapted]");
const leadsRms = document.querySelector("[data-leads-rms]");
const leadsGrid = document.querySelector("[data-leads-grid]");
const leadsScale = document.querySelector("[data-leads-scale]");
const leadsStatus = document.querySelector("[data-leads-status]");
const tmpMetadata = document.querySelector("[data-tmp-metadata]");
const tmpShowInitial = document.querySelector("[data-tmp-show-initial]");
const tmpShowAdapted = document.querySelector("[data-tmp-show-adapted]");
const tmpGrid = document.querySelector("[data-tmp-grid]");
const tmpParameter = document.querySelector("[data-tmp-parameter]");
const tmpValue = document.querySelector("[data-tmp-value]");
const tmpDecrement = document.querySelector("[data-tmp-decrement]");
const tmpIncrement = document.querySelector("[data-tmp-increment]");
const tmpApply = document.querySelector("[data-tmp-apply]");
const tmpResetParameter = document.querySelector("[data-tmp-reset-parameter]");
const tmpResetBeat = document.querySelector("[data-tmp-reset-beat]");
const tmpUndo = document.querySelector("[data-tmp-undo]");
const tmpRedo = document.querySelector("[data-tmp-redo]");
const tmpSaveEdits = document.querySelector("[data-tmp-save-edits]");
const tmpLoadEdits = document.querySelector("[data-tmp-load-edits]");
const tmpExportEdits = document.querySelector("[data-tmp-export-edits]");
const tmpImportEdits = document.querySelector("[data-tmp-import-edits]");
const tmpCombineHandlers = document.querySelector("[data-tmp-combine-handlers]");
const tmpKeepApd = document.querySelector("[data-tmp-keep-apd]");
const tmpShowEgm = document.querySelector("[data-tmp-show-egm]");
const tmpParameterStatus = document.querySelector("[data-tmp-parameter-status]");

const selectionState = {
  nodeIndex: -1,
  region: [],
  weightedRegion: [],
  radiusMm: 20,
  transitionMm: 0,
  mode: "replace",
};
let tmpEditState = null;
let tmpCanvas = null;
let supportedCaseManifest = null;
let currentCaseMetadata = null;
let timeTimer = null;
let redrawTimeDependents = () => {};

const timeState = {
  sample: 0,
  sampleCount: 576,
  sampleRateHz: 1000,
  isPlaying: false,
};

function buildGeometry(fixture, { center = false } = {}) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(fixture.points.flat());
  const indices = fixture.triangles.flat();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  if (center) {
    geometry.center();
  }
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}

function createScene(viewport, cameraDistance) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafb);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 10);
  camera.position.set(0, 0, cameraDistance);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  viewport.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c3c8, 2.6));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(2, 3, 4);
  scene.add(keyLight);

  return { scene, camera, renderer };
}

function observeViewport(viewport, camera, renderer, distanceForWidth) {
  const resize = () => {
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    camera.aspect = width / height;
    camera.position.z = distanceForWidth(width);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(viewport);
  resize();
}

function configureTimeState({ sampleCount, sampleRateHz }) {
  stopTimePlayback();
  timeState.sampleCount = Math.max(1, sampleCount);
  timeState.sampleRateHz = sampleRateHz;
  timeState.sample = 0;
  if (timeCursor) {
    timeCursor.min = "0";
    timeCursor.max = String(timeState.sampleCount - 1);
    timeCursor.value = "0";
  }
  syncTimeControls();
}

function setTimeSample(nextSample, { redraw = true } = {}) {
  const clamped = Math.max(0, Math.min(timeState.sampleCount - 1, Math.round(nextSample)));
  timeState.sample = clamped;
  syncTimeControls();
  if (redraw) {
    redrawTimeDependents();
  }
}

function stepTime(deltaSamples) {
  setTimeSample(timeState.sample + deltaSamples);
}

function syncTimeControls() {
  const ms = Math.round((timeState.sample / timeState.sampleRateHz) * 1000);
  const maxMs = Math.round(((timeState.sampleCount - 1) / timeState.sampleRateHz) * 1000);
  if (timeCursor) {
    timeCursor.value = String(timeState.sample);
  }
  if (timeStatus) {
    timeStatus.value = `${ms} ms / ${maxMs} ms`;
  }
  if (timePlay) {
    timePlay.textContent = timeState.isPlaying ? "Pause" : "Play";
  }
}

function startTimePlayback() {
  if (timeState.isPlaying) {
    return;
  }
  timeState.isPlaying = true;
  syncTimeControls();
  timeTimer = window.setInterval(() => {
    const next = timeState.sample >= timeState.sampleCount - 1 ? 0 : timeState.sample + 2;
    setTimeSample(next);
  }, 80);
}

function stopTimePlayback() {
  if (timeTimer) {
    window.clearInterval(timeTimer);
    timeTimer = null;
  }
  timeState.isPlaying = false;
  syncTimeControls();
}

function sampleFromCanvasEvent(canvas, event, leftPaddingPx) {
  const bounds = canvas.getBoundingClientRect();
  const leftPaddingRatio = leftPaddingPx / canvas.width;
  const rightPaddingRatio = 12 / canvas.width;
  const plotLeft = bounds.left + bounds.width * leftPaddingRatio;
  const plotRight = bounds.right - bounds.width * rightPaddingRatio;
  const ratio = Math.max(0, Math.min(1, (event.clientX - plotLeft) / (plotRight - plotLeft)));
  return ratio * (timeState.sampleCount - 1);
}

function mountHeart(fixture, tmpFixture, wallMapping, onSelectionChange) {
  if (
    !heartViewport ||
    !heartMetadata ||
    !heartSelectionMode ||
    !heartRadius ||
    !heartTransition ||
    !heartSelection ||
    !heartAp ||
    !heartSurface ||
    !heartValues ||
    !heartWall ||
    !heartTransmural
  ) {
    throw new Error("Heart viewport did not mount");
  }
  heartViewport.replaceChildren();

  const { scene, camera, renderer } = createScene(heartViewport, 0.32);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selectedNodeIndex = -1;
  let isAutoRotating = true;

  const geometry = buildGeometry(fixture, { center: true });
  const colors = new Float32Array(geometry.getAttribute("position").count * 3);
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0xb3261e,
      roughness: 0.72,
      metalness: 0.04,
      side: THREE.DoubleSide,
      vertexColors: true,
    }),
  );
  mesh.rotation.set(-0.35, 0.2, 0.08);
  scene.add(mesh);

  const regionGeometry = new THREE.BufferGeometry();
  const regionPoints = new THREE.Points(
    regionGeometry,
    new THREE.PointsMaterial({
      color: 0x175c8a,
      size: 0.009,
      sizeAttenuation: true,
      depthTest: false,
    }),
  );
  regionPoints.renderOrder = 2;
  mesh.add(regionPoints);

  const selectedMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.0055, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0xf2b705,
      emissive: 0x5c4100,
      emissiveIntensity: 0.42,
      roughness: 0.45,
    }),
  );
  selectedMarker.visible = false;
  selectedMarker.renderOrder = 3;
  mesh.add(selectedMarker);

  const nodePositions = [];
  const positions = geometry.getAttribute("position");
  for (let index = 0; index < positions.count; index += 1) {
    nodePositions.push(new THREE.Vector3().fromBufferAttribute(positions, index));
  }

  function setMeshRotationAP() {
    mesh.rotation.set(-0.35, 0.2, 0.08);
    renderer.render(scene, camera);
  }

  function valueColor(value, min, span) {
    const ratio = Math.max(0, Math.min(1, (value - min) / span));
    return new THREE.Color().setHSL((1 - ratio) * 0.62, 0.78, 0.48);
  }

  function applySurfaceFunction() {
    const surface = heartSurface.value;
    const valueState = heartValues.value;
    const colorAttribute = geometry.getAttribute("color");
    if (surface === "geometry") {
      for (let index = 0; index < colorAttribute.count; index += 1) {
        colorAttribute.setXYZ(index, 0.7, 0.15, 0.1);
      }
      heartSurfaceStatus.value = "Geometry";
    } else {
      const values = tmpFixture.parameterVectors?.[surface]?.[valueState] ?? [];
      const finite = values.filter((value) => Number.isFinite(value));
      const min = Math.min(...finite);
      const span = Math.max(Math.max(...finite) - min, 1e-9);
      for (let index = 0; index < colorAttribute.count; index += 1) {
        if (index < values.length) {
          const color = valueColor(values[index], min, span);
          colorAttribute.setXYZ(index, color.r, color.g, color.b);
        } else {
          colorAttribute.setXYZ(index, 0.48, 0.52, 0.54);
        }
      }
      const label = heartSurface.selectedOptions[0]?.textContent ?? surface;
      heartSurfaceStatus.value = `${label} / ${valueState}`;
    }
    colorAttribute.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function syncWallMappingControls() {
    const mapping = wallMapping ?? {};
    const canSwitchWall = mapping.supportsEndocardialEpicardialSwitch === true;
    const canUseTransmural = mapping.supportsTransmuralSelection === true;
    const reason = mapping.reason ?? "Wall-side and transmural mapping are unavailable for this case.";
    heartWall.disabled = !canSwitchWall;
    heartTransmural.disabled = !canUseTransmural;
    heartWall.title = canSwitchWall
      ? `${mapping.pairCount ?? 0} endocardial/epicardial node pairs available.`
      : reason;
    heartTransmural.title = canUseTransmural
      ? `${mapping.pairCount ?? 0} transmural node pairs available.`
      : reason;
    heartWall.dataset.mappingStatus = canSwitchWall ? "available" : "unavailable";
    heartTransmural.dataset.mappingStatus = canUseTransmural ? "available" : "unavailable";
  }

  function updateSelection() {
    const radiusMm = Number.parseFloat(heartRadius.value);
    const transitionMm = Number.parseFloat(heartTransition.value);
    const mode = heartSelectionMode.value;
    selectionState.radiusMm = radiusMm;
    selectionState.transitionMm = transitionMm;
    selectionState.mode = mode;
    if (selectedNodeIndex < 0) {
      heartSelection.value = `Node -- / ${radiusMm} mm / ${transitionMm} mm transition / 0 nodes`;
      regionGeometry.setAttribute("position", new THREE.Float32BufferAttribute([], 3));
      selectedMarker.visible = false;
      selectionState.nodeIndex = -1;
      selectionState.region = [];
      selectionState.weightedRegion = [];
      onSelectionChange(selectionState);
      return;
    }

    const nextRegion = computeWeightedRegionMembership(
      fixture.points,
      selectedNodeIndex,
      radiusMm / 1000,
      transitionMm / 1000,
    );
    const region = mergeWeightedRegions(selectionState.weightedRegion, nextRegion, mode);
    selectionState.nodeIndex = selectedNodeIndex;
    selectionState.region = region.map((node) => node.index);
    selectionState.weightedRegion = region.map((node) => ({
      index: node.index,
      weight: node.weight,
      distanceMeters: node.distanceMeters,
    }));
    const regionPositions = [];
    region.forEach(({ index }) => {
      const point = nodePositions[index];
      regionPositions.push(point.x, point.y, point.z);
    });

    selectedMarker.position.copy(nodePositions[selectedNodeIndex]);
    selectedMarker.visible = true;
    regionGeometry.setAttribute("position", new THREE.Float32BufferAttribute(regionPositions, 3));
    regionGeometry.computeBoundingSphere();
    const weightedCount = region.filter((node) => node.weight < 1).length;
    heartSelection.value =
      `Node ${selectedNodeIndex + 1} / ${radiusMm} mm / ${transitionMm} mm transition / ${region.length} nodes / ${weightedCount} weighted`;
    onSelectionChange(selectionState);
  }

  function selectFromPointer(event) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    mesh.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    const [hit] = raycaster.intersectObject(mesh, false);
    const nearest = hit?.face
      ? nearestFaceVertex(hit)
      : nearestProjectedNode(pointer);
    if (nearest < 0) {
      return;
    }
    selectedNodeIndex = nearest;
    isAutoRotating = false;
    updateSelection();
    renderer.render(scene, camera);
  }

  function nearestFaceVertex(hit) {
    const candidates = [hit.face.a, hit.face.b, hit.face.c];
    let nearest = candidates[0];
    let nearestDistance = hit.point.distanceTo(nodePositions[nearest]);
    candidates.slice(1).forEach((candidate) => {
      const distance = hit.point.distanceTo(nodePositions[candidate]);
      if (distance < nearestDistance) {
        nearest = candidate;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function nearestProjectedNode(targetPointer) {
    const projected = new THREE.Vector3();
    let nearest = -1;
    let nearestDistance = 0.035;
    nodePositions.forEach((position, index) => {
      projected.copy(position).applyMatrix4(mesh.matrixWorld).project(camera);
      const dx = projected.x - targetPointer.x;
      const dy = projected.y - targetPointer.y;
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  heartRadius.oninput = updateSelection;
  heartTransition.oninput = updateSelection;
  heartSelectionMode.onchange = () => {
    if (heartSelectionMode.value === "replace") {
      selectionState.weightedRegion = [];
    }
    updateSelection();
  };
  heartAp.onclick = () => {
    isAutoRotating = false;
    if (heartRotate) {
      heartRotate.checked = false;
    }
    setMeshRotationAP();
    if (statusMessage) {
      statusMessage.value = "Heart view reset to AP orientation.";
    }
  };
  heartRotate.onchange = () => {
    isAutoRotating = heartRotate.checked;
  };
  heartSurface.onchange = applySurfaceFunction;
  heartValues.onchange = applySurfaceFunction;
  renderer.domElement.addEventListener("pointerdown", selectFromPointer);
  renderer.domElement.style.cursor = "crosshair";

  observeViewport(heartViewport, camera, renderer, (width) => (width < 480 ? 0.5 : 0.32));

  heartMetadata.value = `${fixture.pointCount} nodes / ${fixture.triangleCount} triangles`;
  heartSurface.value = "geometry";
  heartValues.value = "adapted";
  heartSelectionMode.value = "replace";
  heartTransition.value = "0";
  syncWallMappingControls();
  if (heartRotate) {
    heartRotate.checked = true;
  }
  applySurfaceFunction();
  updateSelection();

  function animate() {
    if (isAutoRotating) {
      mesh.rotation.y += 0.006;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

function mountThorax(fixture, signalFixture, getTmpEditState = () => null) {
  if (
    !thoraxViewport ||
    !thoraxMetadata ||
    !thoraxAp ||
    !thoraxRotate ||
    !thoraxSurface ||
    !thoraxScale ||
    !thoraxSurfaceStatus ||
    !thoraxSelection
  ) {
    throw new Error("Thorax viewport did not mount");
  }
  thoraxViewport.replaceChildren();

  const { scene, camera, renderer } = createScene(thoraxViewport, 0.75);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const group = new THREE.Group();
  const electrodeGroup = new THREE.Group();
  const meshes = new Map();
  let thoraxMesh = null;
  let isAutoRotating = true;
  let selectedNodeIndex = -1;
  const materials = {
    thorax: new THREE.MeshStandardMaterial({
      color: 0x6f8790,
      opacity: 0.18,
      roughness: 0.8,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      vertexColors: true,
    }),
    leftLung: new THREE.MeshStandardMaterial({
      color: 0x2f7d9b,
      opacity: 0.74,
      roughness: 0.76,
      side: THREE.DoubleSide,
      transparent: true,
    }),
    rightLung: new THREE.MeshStandardMaterial({
      color: 0x2f7d9b,
      opacity: 0.74,
      roughness: 0.76,
      side: THREE.DoubleSide,
      transparent: true,
    }),
  };

  for (const [name, meshFixture] of Object.entries(fixture.meshes)) {
    const geometry = buildGeometry(meshFixture);
    if (name === "thorax") {
      const colors = new Float32Array(geometry.getAttribute("position").count * 3);
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }
    const mesh = new THREE.Mesh(geometry, materials[name]);
    meshes.set(name, mesh);
    if (name === "thorax") {
      thoraxMesh = mesh;
    }
    group.add(mesh);
  }

  const selectedMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.009, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0x111111,
      emissive: 0x111111,
      emissiveIntensity: 0.25,
      roughness: 0.38,
    }),
  );
  selectedMarker.visible = false;
  selectedMarker.renderOrder = 4;
  thoraxMesh?.add(selectedMarker);

  const thoraxNodePositions = [];
  if (thoraxMesh) {
    const positions = thoraxMesh.geometry.getAttribute("position");
    for (let index = 0; index < positions.count; index += 1) {
      thoraxNodePositions.push(new THREE.Vector3().fromBufferAttribute(positions, index));
    }
  }

  const bounds = new THREE.Box3().setFromObject(group);
  const center = bounds.getCenter(new THREE.Vector3());
  group.position.sub(center);
  group.rotation.set(-0.2, 0.18, 0);
  group.add(electrodeGroup);
  scene.add(group);

  function electrodeStatusText() {
    const selectedLeadSystem = currentCaseMetadata?.leadSystemDetails?.find(
      (item) => item.name === toolbarLeadSystem?.value,
    );
    const count = selectedLeadSystem?.electrodes?.length ?? selectedLeadSystem?.electrodeCount ?? 0;
    return count > 0
      ? `${count} electrodes`
      : "Electrodes unavailable";
  }

  function updateSurfaceStatus() {
    const scale = Number.parseFloat(thoraxScale.value);
    const label = thoraxSurface.selectedOptions[0]?.textContent ?? "Geometry";
    if (thoraxSurface.value === "measured" && signalFixture?.surfaceMap) {
      const sampleMs = Math.round((timeState.sample / signalFixture.surfaceMap.sampleRateHz) * 1000);
      thoraxSurfaceStatus.value = `${label} / ${scale}% / ${sampleMs} ms`;
      return;
    }
    if (thoraxSurface.value === "adapted" && signalFixture?.transferMatrices?.ventriclesToThorax) {
      const sampleMs = Math.round((timeState.sample / signalFixture.sampleRateHz) * 1000);
      thoraxSurfaceStatus.value = `${label} / ${scale}% / simulated ${sampleMs} ms`;
      return;
    }
    const mapStatus = signalFixture?.surfaceMap ? "measured map available" : "maps unavailable";
    thoraxSurfaceStatus.value = `${label} / ${scale}% / ${mapStatus}`;
  }

  function updateSelectionStatus() {
    const nodeText = selectedNodeIndex >= 0 ? `Node ${selectedNodeIndex + 1}` : "Node --";
    thoraxSelection.value = `${nodeText} / ${electrodeStatusText()} / maps unavailable`;
  }

  function renderThorax() {
    renderer.render(scene, camera);
  }

  function setThoraxRotationAP() {
    group.rotation.set(-0.2, 0.18, 0);
    renderThorax();
  }

  function applyThoraxScale() {
    const scale = Number.parseFloat(thoraxScale.value) / 100;
    group.scale.setScalar(scale);
    updateSurfaceStatus();
    renderThorax();
  }

  function potentialColor(value, min, span) {
    const ratio = Math.max(0, Math.min(1, (value - min) / span));
    return new THREE.Color().setHSL((1 - ratio) * 0.66, 0.82, 0.48);
  }

  function applyGeometryColors() {
    if (!thoraxMesh) {
      return;
    }
    const colorAttribute = thoraxMesh.geometry.getAttribute("color");
    for (let index = 0; index < colorAttribute.count; index += 1) {
      colorAttribute.setXYZ(index, 0.44, 0.53, 0.56);
    }
    colorAttribute.needsUpdate = true;
    materials.thorax.opacity = 0.18;
    materials.thorax.depthWrite = false;
  }

  function applyMeasuredSurfaceMap() {
    if (!thoraxMesh || !signalFixture?.surfaceMap) {
      return;
    }
    const map = signalFixture.surfaceMap;
    const sample = Math.max(0, Math.min(map.sampleCount - 1, timeState.sample));
    const colorAttribute = thoraxMesh.geometry.getAttribute("color");
    const min = map.valueRange.min;
    const span = Math.max(map.valueRange.max - min, 1e-9);
    for (let index = 0; index < colorAttribute.count; index += 1) {
      const value = map.valuesByNode[index]?.[sample];
      if (Number.isFinite(value)) {
        const color = potentialColor(value, min, span);
        colorAttribute.setXYZ(index, color.r, color.g, color.b);
      } else {
        colorAttribute.setXYZ(index, 0.48, 0.52, 0.54);
      }
    }
    colorAttribute.needsUpdate = true;
    materials.thorax.opacity = 0.82;
    materials.thorax.depthWrite = true;
  }

  function applyAdaptedSurfaceMap() {
    const transfer = signalFixture?.transferMatrices?.ventriclesToThorax;
    const state = getTmpEditState();
    if (!thoraxMesh || !transfer || !state) {
      applyGeometryColors();
      return;
    }
    const sample = Math.max(0, Math.min(state.sampleCount - 1, timeState.sample));
    const sourceValues = Array.from({ length: state.nodeCount }, (_, nodeIndex) => (
      generateTmpSample(
        tmpParametersFromVectors(state.parameters, nodeIndex, "adapted"),
        sample,
        state.sampleRateHz,
      )
    ));
    const computedValues = transfer.values.map((row) => (
      row.reduce((sum, coefficient, nodeIndex) => sum + coefficient * sourceValues[nodeIndex], 0)
    ));
    const min = Math.min(...computedValues);
    const max = Math.max(...computedValues);
    const span = Math.max(max - min, 1e-9);
    const colorAttribute = thoraxMesh.geometry.getAttribute("color");
    for (let index = 0; index < colorAttribute.count; index += 1) {
      const value = computedValues[index];
      if (Number.isFinite(value)) {
        const color = potentialColor(value, min, span);
        colorAttribute.setXYZ(index, color.r, color.g, color.b);
      } else {
        colorAttribute.setXYZ(index, 0.48, 0.52, 0.54);
      }
    }
    colorAttribute.needsUpdate = true;
    materials.thorax.opacity = 0.82;
    materials.thorax.depthWrite = true;
  }

  function applyThoraxSurface() {
    if (thoraxSurface.value === "measured" && signalFixture?.surfaceMap) {
      applyMeasuredSurfaceMap();
    } else if (thoraxSurface.value === "adapted" && signalFixture?.transferMatrices?.ventriclesToThorax) {
      applyAdaptedSurfaceMap();
    } else {
      thoraxSurface.value = "geometry";
      applyGeometryColors();
    }
    updateSurfaceStatus();
    renderThorax();
  }

  function syncElectrodeMarkers() {
    electrodeGroup.clear();
    const selectedLeadSystem = currentCaseMetadata?.leadSystemDetails?.find(
      (item) => item.name === toolbarLeadSystem?.value,
    );
    const electrodes = selectedLeadSystem?.electrodes ?? [];
    if (thoraxElectrodes) {
      thoraxElectrodes.disabled = electrodes.length === 0;
      thoraxElectrodes.title = electrodes.length
        ? `${electrodes.length} parsed electrode positions`
        : "No parsed electrode positions for selected lead system.";
    }
    if (thoraxElectrodes?.checked) {
      electrodes.forEach((electrode) => {
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.0075, 14, 10),
          new THREE.MeshStandardMaterial({
            color: 0xf2f4f5,
            emissive: 0x3f4a50,
            emissiveIntensity: 0.25,
            roughness: 0.36,
          }),
        );
        marker.position.set(electrode.position[0], electrode.position[1], electrode.position[2]);
        marker.renderOrder = 5;
        electrodeGroup.add(marker);
      });
    }
    updateSelectionStatus();
    renderThorax();
  }

  function nearestFaceVertex(hit) {
    const candidates = [hit.face.a, hit.face.b, hit.face.c];
    let nearest = candidates[0];
    let nearestDistance = hit.point.distanceTo(thoraxNodePositions[nearest]);
    candidates.slice(1).forEach((candidate) => {
      const distance = hit.point.distanceTo(thoraxNodePositions[candidate]);
      if (distance < nearestDistance) {
        nearest = candidate;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function nearestProjectedThoraxNode(targetPointer) {
    const projected = new THREE.Vector3();
    let nearest = -1;
    let nearestDistance = 0.05;
    thoraxNodePositions.forEach((position, index) => {
      projected.copy(position).applyMatrix4(thoraxMesh.matrixWorld).project(camera);
      const dx = projected.x - targetPointer.x;
      const dy = projected.y - targetPointer.y;
      const distance = dx * dx + dy * dy;
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });
    return nearest;
  }

  function selectThoraxNode(event) {
    if (!thoraxMesh) {
      return;
    }
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    group.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    const [hit] = raycaster.intersectObject(thoraxMesh, false);
    const nearest = hit?.face
      ? nearestFaceVertex(hit)
      : nearestProjectedThoraxNode(pointer);
    if (nearest < 0) {
      return;
    }
    selectedNodeIndex = nearest;
    isAutoRotating = false;
    thoraxRotate.checked = false;
    selectedMarker.position.copy(thoraxNodePositions[selectedNodeIndex]);
    selectedMarker.visible = true;
    updateSelectionStatus();
    if (statusMessage) {
      statusMessage.value = `Thorax node ${selectedNodeIndex + 1} selected.`;
    }
    renderThorax();
  }

  document.querySelectorAll("[data-toggle-mesh]").forEach((toggle) => {
    const mesh = meshes.get(toggle.dataset.toggleMesh);
    if (!mesh) {
      return;
    }
    toggle.checked = true;
    mesh.visible = toggle.checked;
    toggle.onchange = () => {
      mesh.visible = toggle.checked;
      renderThorax();
    };
  });

  const countText = Object.entries(fixture.meshes)
    .map(([name, meshFixture]) => `${name}: ${meshFixture.pointCount}/${meshFixture.triangleCount}`)
    .join(" | ");
  thoraxMetadata.value = countText;
  thoraxSurface.value = "geometry";
  [...thoraxSurface.options].forEach((option) => {
    if (option.value === "measured") {
      option.disabled = !signalFixture?.surfaceMap;
    } else if (option.value === "adapted") {
      option.disabled = !signalFixture?.transferMatrices?.ventriclesToThorax;
    } else if (option.value !== "geometry") {
      option.disabled = true;
    }
  });
  thoraxScale.value = "100";
  thoraxRotate.checked = true;
  if (thoraxElectrodes) {
    thoraxElectrodes.checked = false;
    thoraxElectrodes.title = electrodeStatusText();
    thoraxElectrodes.onchange = syncElectrodeMarkers;
  }
  applyThoraxSurface();
  syncElectrodeMarkers();
  updateSelectionStatus();

  thoraxAp.onclick = () => {
    isAutoRotating = false;
    thoraxRotate.checked = false;
    setThoraxRotationAP();
    if (statusMessage) {
      statusMessage.value = "Thorax view reset to AP orientation.";
    }
  };
  thoraxRotate.onchange = () => {
    isAutoRotating = thoraxRotate.checked;
  };
  thoraxSurface.onchange = () => {
    if (!["measured", "adapted"].includes(thoraxSurface.value)) {
      thoraxSurface.value = "geometry";
    }
    applyThoraxSurface();
    if (statusMessage && thoraxSurface.value === "measured") {
      statusMessage.value = "Measured thorax BSPM map shown at shared time cursor.";
    } else if (statusMessage && thoraxSurface.value === "adapted") {
      statusMessage.value = "Adapted thorax BSPM recomputed from TMP parameters and the transfer matrix candidate.";
    } else if (statusMessage) {
      statusMessage.value = "Thorax BSPM and sensitivity map data are unavailable in current fixtures.";
    }
  };
  thoraxScale.oninput = applyThoraxScale;
  renderer.domElement.addEventListener("pointerdown", selectThoraxNode);
  renderer.domElement.style.cursor = "crosshair";

  observeViewport(thoraxViewport, camera, renderer, (width) => (width < 480 ? 1.05 : 0.75));

  function animate() {
    if (isAutoRotating) {
      group.rotation.y += 0.003;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return {
    redrawThoraxMap: applyThoraxSurface,
    syncLeadSystem: syncElectrodeMarkers,
  };
}

function plotSignals(
  canvas,
  fixture,
  {
    mode = "baseline",
    leadSystem = null,
    scale = 1,
    showGrid = true,
    showRms = false,
    selectedSample = 0,
    tmpState = null,
    showAdapted = false,
  } = {},
) {
  if (!canvas || !leadsMetadata) {
    throw new Error("Leads canvas did not mount");
  }

  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const left = 54;
  const right = 12;
  const top = 18;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const signalSet = leadSystemTraces(fixture, leadSystem, { tmpState, showAdapted });
  const fiducials = fixture.fiducials ?? {};
  const filteredTraces = filterTraces(
    signalSet.traces,
    mode,
    fiducials.baselineStartIndex ?? null,
    fiducials.baselineEndIndex ?? null,
  );
  const traces = showRms
    ? [...filteredTraces, buildRmsTrace(filteredTraces)]
    : filteredTraces;
  const traceCount = traces.length;
  const traceHeight = plotHeight / traceCount;
  const colors = ["#b3261e", "#175c8a", "#6f8790", "#287d5b", "#8a5b13", "#5f4b8b"];

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#f8fafb";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#d9e0e3";
  context.lineWidth = 1;
  context.strokeRect(0.5, 0.5, width - 1, height - 1);

  if (showGrid) {
    context.strokeStyle = "rgba(120, 144, 156, 0.16)";
    context.lineWidth = 1;
    for (let x = left; x <= width - right; x += plotWidth / 10) {
      context.beginPath();
      context.moveTo(x, top);
      context.lineTo(x, height - bottom);
      context.stroke();
    }
    for (let y = top; y <= height - bottom; y += plotHeight / 8) {
      context.beginPath();
      context.moveTo(left, y);
      context.lineTo(width - right, y);
      context.stroke();
    }
  }

  context.font = "12px Segoe UI, Arial, sans-serif";
  context.fillStyle = "#52616b";
  context.textBaseline = "middle";
  if (leadSystem) {
    context.textAlign = "right";
    context.fillText(leadSystem.name, width - right, top - 7);
    context.textAlign = "start";
  }

  for (let traceIndex = 0; traceIndex < traceCount; traceIndex += 1) {
    const trace = traces[traceIndex];
    const values = trace.values;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const centerY = top + traceHeight * (traceIndex + 0.5);
    const amplitude = traceHeight * 0.38 * scale;

    if (showGrid) {
      context.strokeStyle = "rgba(140, 150, 160, 0.22)";
      context.beginPath();
      context.moveTo(left, centerY);
      context.lineTo(width - right, centerY);
      context.stroke();
    }

    context.fillStyle = "#52616b";
    context.fillText(trace.name, 8, centerY);

    context.strokeStyle = trace.name === "RMS" ? "#111111" : colors[traceIndex % colors.length];
    context.lineWidth = 1.8;
    context.beginPath();
    values.forEach((value, sampleIndex) => {
      const x = left + (sampleIndex / (values.length - 1)) * plotWidth;
      const normalized = (value - min) / span - 0.5;
      const y = centerY - normalized * amplitude * 2;
      if (sampleIndex === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.stroke();
  }

  context.strokeStyle = "#78909c";
  context.beginPath();
  context.moveTo(left, height - bottom + 7);
  context.lineTo(width - right, height - bottom + 7);
  context.stroke();

  drawTimeCursor(context, selectedSample, signalSet.sampleCount, left, width - right, top, height - bottom);

  context.fillStyle = "#52616b";
  context.textAlign = "left";
  context.fillText("0 ms", left, height - 12);
  context.textAlign = "right";
  const durationMs = Math.round(((signalSet.sampleCount - 1) / signalSet.sampleRateHz) * 1000);
  context.fillText(`${durationMs} ms`, width - right, height - 12);
  context.textAlign = "start";

  const systemText = leadSystem
    ? `${leadSystem.name}: ${signalSet.traces.length} electrode traces / ${leadSystem.leadCount} leads`
    : `${signalSet.traces.length} representative traces`;
  leadsMetadata.value =
    `${systemText} / plotted ${traces.length} / ${signalSet.sampleCount} samples / ${signalSet.sampleRateHz} Hz / ${mode.toUpperCase()} / ${Math.round(scale * 100)}%`;
  if (leadsStatus) {
    const classification = signalSet.isRecomputed
      ? "adapted ECG recomputed from TMP transfer; WCT/reference lead transform unresolved"
      : "measured/initial classification unavailable";
    leadsStatus.value = `${signalSet.signalKind}; ${filteringStatus(mode, signalSet.sampleCount, fiducials)}; ${classification}`;
  }
}

function filteringStatus(mode, sampleCount, fiducials) {
  if (mode === "dc") {
    return "DC coupling, unfiltered";
  }
  if (mode === "ac") {
    return "AC coupling, time mean removed";
  }
  const window = baselineWindowForSignal(
    sampleCount,
    fiducials?.baselineStartIndex ?? null,
    fiducials?.baselineEndIndex ?? null,
  );
  return window.source === "fiducials"
    ? `Baseline P/T fiducials ${window.startIndex}-${window.endIndex}`
    : "Baseline fallback uses signal endpoints";
}

function leadSystemTraces(fixture, leadSystem, { tmpState = null, showAdapted = false } = {}) {
  if (showAdapted && canRecomputeLeadTraces(fixture, tmpState) && leadSystem?.electrodes?.length) {
    return {
      signalKind: `${leadSystem.name} adapted ECG recompute`,
      sampleCount: tmpState.sampleCount,
      sampleRateHz: tmpState.sampleRateHz,
      isRecomputed: true,
      traces: recomputeLeadTraces(fixture, tmpState, leadSystem, "adapted"),
    };
  }

  if (leadSystem?.electrodes?.length && fixture.surfaceMap?.valuesByNode) {
    return {
      signalKind: `${leadSystem.name} electrode surface potentials`,
      sampleCount: fixture.surfaceMap.sampleCount,
      sampleRateHz: fixture.surfaceMap.sampleRateHz,
      isRecomputed: false,
      traces: leadSystem.electrodes.map((electrode, index) => {
        const nodeIndex = electrode.thoraxNodeIndex ?? index;
        return {
          name: electrode.label ?? `E${index + 1}`,
          sourceRow: nodeIndex,
          values: fixture.surfaceMap.valuesByNode[nodeIndex],
        };
      }),
    };
  }

  return {
    signalKind: fixture.signalKind,
    sampleCount: fixture.columns,
    sampleRateHz: fixture.sampleRateHz,
    isRecomputed: false,
    traces: fixture.traces,
  };
}

function plotTmp(
  canvas,
  fixture,
  {
    showInitial = true,
    showAdapted = true,
    showGrid = true,
    selectedSample = 0,
  } = {},
) {
  if (!canvas || !tmpMetadata) {
    throw new Error("TMP canvas did not mount");
  }

  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const left = 72;
  const right = 12;
  const top = 18;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const nodes = fixture.nodes;
  const nodeCount = nodes.length;
  const laneHeight = plotHeight / nodeCount;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#f8fafb";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#d9e0e3";
  context.lineWidth = 1;
  context.strokeRect(0.5, 0.5, width - 1, height - 1);
  if (showGrid) {
    context.strokeStyle = "rgba(120, 144, 156, 0.16)";
    context.lineWidth = 1;
    for (let x = left; x <= width - right; x += plotWidth / 10) {
      context.beginPath();
      context.moveTo(x, top);
      context.lineTo(x, height - bottom);
      context.stroke();
    }
    for (let y = top; y <= height - bottom; y += plotHeight / 8) {
      context.beginPath();
      context.moveTo(left, y);
      context.lineTo(width - right, y);
      context.stroke();
    }
  }
  context.font = "12px Segoe UI, Arial, sans-serif";
  context.textBaseline = "middle";

  nodes.forEach((node, nodeIndex) => {
    const values = [...node.initial, ...node.adapted];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const centerY = top + laneHeight * (nodeIndex + 0.5);
    const amplitude = laneHeight * 0.38;

    if (showGrid) {
      context.strokeStyle = "rgba(140, 150, 160, 0.22)";
      context.beginPath();
      context.moveTo(left, centerY);
      context.lineTo(width - right, centerY);
      context.stroke();
    }

    context.fillStyle = "#52616b";
    context.fillText(`N${node.sourceNode + 1}`, 8, centerY);

    if (showInitial) {
      drawTmpLine(context, node.initial, min, span, left, plotWidth, centerY, amplitude, "#6f8790", 1.5);
    }
    if (showAdapted) {
      drawTmpLine(context, node.adapted, min, span, left, plotWidth, centerY, amplitude, "#b3261e", 1.9);
    }
  });

  context.strokeStyle = "#78909c";
  context.beginPath();
  context.moveTo(left, height - bottom + 7);
  context.lineTo(width - right, height - bottom + 7);
  context.stroke();
  drawTimeCursor(context, selectedSample, fixture.sampleCount, left, width - right, top, height - bottom);
  context.fillStyle = "#52616b";
  context.textAlign = "left";
  context.fillText("0 ms", left, height - 12);
  context.textAlign = "right";
  const durationMs = Math.round(((fixture.sampleCount - 1) / fixture.sampleRateHz) * 1000);
  context.fillText(`${durationMs} ms`, width - right, height - 12);
  context.textAlign = "start";

  const traceModes = [
    showInitial ? "initial" : null,
    showAdapted ? "adapted" : null,
  ].filter(Boolean).join("+") || "none";
  tmpMetadata.value = `${nodes.length} nodes / ${fixture.sampleCount} samples / ${fixture.sampleRateHz} Hz / ${traceModes}`;
}

function drawTimeCursor(context, selectedSample, sampleCount, left, right, top, bottom) {
  const sample = Math.max(0, Math.min(sampleCount - 1, selectedSample));
  const x = left + (sample / (sampleCount - 1)) * (right - left);
  context.strokeStyle = "#f2b705";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x, top);
  context.lineTo(x, bottom);
  context.stroke();
}

function drawTmpLine(context, values, min, span, left, plotWidth, centerY, amplitude, color, width) {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  values.forEach((value, sampleIndex) => {
    const x = left + (sampleIndex / (values.length - 1)) * plotWidth;
    const normalized = (value - min) / span - 0.5;
    const y = centerY - normalized * amplitude * 2;
    if (sampleIndex === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.stroke();
}

function mountTmpEditing(fixture, onRecompute = () => {}) {
  if (
    !tmpShowInitial ||
    !tmpShowAdapted ||
    !tmpGrid ||
    !tmpParameter ||
    !tmpValue ||
    !tmpDecrement ||
    !tmpIncrement ||
    !tmpApply ||
    !tmpResetParameter ||
    !tmpResetBeat ||
    !tmpUndo ||
    !tmpRedo ||
    !tmpSaveEdits ||
    !tmpLoadEdits ||
    !tmpParameterStatus
  ) {
    throw new Error("TMP editing controls did not mount");
  }

  tmpEditState = createTmpEditState(fixture);
  tmpParameter.replaceChildren();
  EDITABLE_PARAMETERS.forEach((parameter) => {
    const option = document.createElement("option");
    option.value = parameter.id;
    option.textContent = parameter.unit ? `${parameter.label} (${parameter.unit})` : parameter.label;
    tmpParameter.appendChild(option);
  });
  const storedOnlyOption = document.createElement("option");
  storedOnlyOption.value = "depolarizationSlope";
  storedOnlyOption.textContent = "Depol. slope (stored)";
  storedOnlyOption.disabled = true;
  tmpParameter.appendChild(storedOnlyOption);
  [tmpCombineHandlers, tmpKeepApd, tmpShowEgm].forEach((control) => {
    if (!control) {
      return;
    }
    control.checked = false;
    control.disabled = true;
    control.title = "This legacy TMP option is unavailable until the backing data and handlers are implemented.";
  });
  tmpShowInitial.checked = true;
  tmpShowAdapted.checked = true;
  tmpGrid.checked = true;

  function selectedRegion() {
    return selectionState.region.filter((nodeIndex) => nodeIndex >= 0 && nodeIndex < tmpEditState.nodeCount);
  }

  function selectedWeightedRegion() {
    return selectionState.weightedRegion.filter((node) => node.index >= 0 && node.index < tmpEditState.nodeCount);
  }

  function redrawTmp() {
    tmpEditState.selectedNode = selectionState.nodeIndex >= 0 && selectionState.nodeIndex < tmpEditState.nodeCount
      ? selectionState.nodeIndex
      : null;
    plotTmp(tmpCanvas, {
      sampleRateHz: tmpEditState.sampleRateHz,
      sampleCount: tmpEditState.sampleCount,
      nodes: buildTmpPlotNodes(tmpEditState),
    }, {
      showInitial: tmpShowInitial.checked,
      showAdapted: tmpShowAdapted.checked,
      showGrid: tmpGrid.checked,
      selectedSample: timeState.sample,
    });
  }

  function syncControls() {
    const nodes = selectedRegion();
    const weightedNodes = selectedWeightedRegion();
    const parameter = EDITABLE_PARAMETERS.find((item) => item.id === tmpParameter.value) ?? EDITABLE_PARAMETERS[0];
    const canEdit = weightedNodes.length > 0;
    tmpValue.disabled = !canEdit;
    tmpDecrement.disabled = !canEdit;
    tmpIncrement.disabled = !canEdit;
    tmpApply.disabled = !canEdit;
    tmpResetParameter.disabled = !canEdit;
    tmpUndo.disabled = tmpEditState.undoStack.length === 0;
    tmpRedo.disabled = tmpEditState.redoStack.length === 0;
    tmpSaveEdits.disabled = tmpEditState.undoStack.length === 0;
    tmpLoadEdits.disabled = !hasSavedTmpEdits();
    tmpExportEdits.disabled = tmpEditState.undoStack.length === 0;
    tmpImportEdits.disabled = !currentCaseMetadata;
    tmpValue.step = String(parameter.step);
    if (canEdit) {
      const initial = nodeParameterValue(tmpEditState, parameter.id, weightedNodes[0].index, "initial");
      const adapted = nodeParameterValue(tmpEditState, parameter.id, weightedNodes[0].index, "adapted");
      tmpValue.value = adapted === null ? "" : String(Math.round(adapted / parameter.step) * parameter.step);
      const unit = parameter.unit ? ` ${parameter.unit}` : "";
      tmpParameterStatus.value =
        `Initial ${formatParameterValue(initial, parameter.step)}${unit} / adapted ${formatParameterValue(adapted, parameter.step)}${unit} / ${weightedNodes.length} weighted nodes`;
    } else {
      tmpValue.value = "";
      tmpParameterStatus.value = "Select heart node";
    }
    redrawTmp();
    onRecompute();
  }

  function formatParameterValue(value, step) {
    if (value === null) {
      return "--";
    }
    const decimals = step < 1 ? 2 : 0;
    return Number(value).toFixed(decimals);
  }

  function nudgeParameter(direction) {
    const parameter = EDITABLE_PARAMETERS.find((item) => item.id === tmpParameter.value) ?? EDITABLE_PARAMETERS[0];
    const current = Number.parseFloat(tmpValue.value);
    if (!Number.isFinite(current)) {
      return;
    }
    tmpValue.value = String(Math.round((current + direction * parameter.step) / parameter.step) * parameter.step);
    applyWeightedParameterTransaction(tmpEditState, tmpParameter.value, selectedWeightedRegion(), Number.parseFloat(tmpValue.value), selectionMetadata());
    setTmpStatus("TMP parameter edit recorded.");
    syncControls();
  }

  function selectionMetadata() {
    return {
      mode: selectionState.mode === "expand" ? "expandRegion" : "replaceWithPreviousAdapted",
      centerNodeIndex: selectionState.nodeIndex,
      radiusMm: selectionState.radiusMm,
      transitionMm: selectionState.transitionMm,
    };
  }

  function storageKey() {
    return currentCaseMetadata?.sha256
      ? `ecgsim:source-edits:${currentCaseMetadata.sha256}`
      : null;
  }

  function hasSavedTmpEdits() {
    const key = storageKey();
    return key ? window.localStorage.getItem(key) !== null : false;
  }

  function saveTmpEdits() {
    const key = storageKey();
    if (!key) {
      return;
    }
    const snapshot = serializeTmpEditState(tmpEditState, currentCaseMetadata);
    window.localStorage.setItem(key, JSON.stringify(snapshot));
    setTmpStatus("TMP edits saved for this case.");
  }

  function loadTmpEdits() {
    const key = storageKey();
    const stored = key ? window.localStorage.getItem(key) : null;
    if (!stored) {
      setTmpStatus("No saved TMP edits for this case.");
      return;
    }
    applyTmpEditSnapshot(tmpEditState, JSON.parse(stored), currentCaseMetadata);
    setTmpStatus("TMP edits loaded for this case.");
  }

  function exportTmpEditSidecar() {
    const snapshot = serializeTmpEditState(tmpEditState, currentCaseMetadata);
    const fileName = sidecarFileName(currentCaseMetadata);
    downloadTextFile(fileName, JSON.stringify(snapshot, null, 2) + "\n", "application/json");
    setTmpStatus("TMP edit sidecar exported.");
  }

  async function importTmpEditSidecar(file) {
    if (!file) {
      return;
    }
    const snapshot = JSON.parse(await file.text());
    applyTmpEditSnapshot(tmpEditState, snapshot, currentCaseMetadata);
    const key = storageKey();
    if (key) {
      window.localStorage.setItem(key, JSON.stringify(snapshot));
    }
    tmpImportEdits.value = "";
    setTmpStatus("TMP edit sidecar imported.");
  }

  tmpParameter.onchange = syncControls;
  tmpShowInitial.onchange = redrawTmp;
  tmpShowAdapted.onchange = redrawTmp;
  tmpGrid.onchange = redrawTmp;
  tmpDecrement.onclick = () => nudgeParameter(-1);
  tmpIncrement.onclick = () => nudgeParameter(1);
  tmpApply.onclick = () => {
    applyWeightedParameterTransaction(tmpEditState, tmpParameter.value, selectedWeightedRegion(), Number.parseFloat(tmpValue.value), selectionMetadata());
    setTmpStatus("TMP parameter edit recorded.");
    syncControls();
  };
  tmpResetParameter.onclick = () => {
    resetWeightedParameterTransaction(tmpEditState, tmpParameter.value, selectedWeightedRegion(), selectionMetadata());
    setTmpStatus("TMP parameter reset recorded.");
    syncControls();
  };
  tmpResetBeat.onclick = () => {
    resetBeatTransaction(tmpEditState);
    setTmpStatus("TMP beat reset recorded.");
    syncControls();
  };
  tmpUndo.onclick = () => {
    const transaction = undoLastTransaction(tmpEditState);
    if (transaction) {
      setTmpStatus(`Undid ${transaction.kind}.`);
    }
    syncControls();
  };
  tmpRedo.onclick = () => {
    const transaction = redoLastTransaction(tmpEditState);
    if (transaction) {
      setTmpStatus(`Redid ${transaction.kind}.`);
    }
    syncControls();
  };
  tmpSaveEdits.onclick = () => {
    saveTmpEdits();
    syncControls();
  };
  tmpLoadEdits.onclick = () => {
    try {
      loadTmpEdits();
    } catch (error) {
      setTmpStatus(error instanceof Error ? error.message : "Unable to load TMP edits.");
    }
    syncControls();
  };
  tmpExportEdits.onclick = () => {
    exportTmpEditSidecar();
    syncControls();
  };
  tmpImportEdits.onchange = async () => {
    try {
      await importTmpEditSidecar(tmpImportEdits.files?.[0]);
    } catch (error) {
      tmpImportEdits.value = "";
      setTmpStatus(error instanceof Error ? error.message : "Unable to import TMP edit sidecar.");
    }
    syncControls();
  };

  return { syncControls, redrawTmp, getState: () => tmpEditState };
}

function sidecarFileName(metadata) {
  const baseName = metadata?.fileName
    ? metadata.fileName.replace(/\.[^.]+$/, "")
    : "ecgsim-case";
  const safeName = baseName.replace(/[^a-zA-Z0-9._-]+/g, "-") || "ecgsim-case";
  return `${safeName}.source-edits.json`;
}

function downloadTextFile(fileName, text, type) {
  downloadBlobFile(fileName, new Blob([text], { type }));
}

function downloadBlobFile(fileName, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

const VISUAL_EXPORT_TARGETS = {
  heart: { selector: ".heart-viewport canvas", label: "Heart" },
  thorax: { selector: ".thorax-viewport canvas", label: "Thorax" },
  tmp: { selector: "[data-tmp-canvas]", label: "TMP" },
  leads: { selector: "[data-leads-canvas]", label: "Leads" },
};

function mountVisualExportControls() {
  document.querySelectorAll("[data-export-image]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await exportVisualImage(button.dataset.exportImage);
      } catch (error) {
        setTmpStatus(error instanceof Error ? error.message : "Unable to export image.");
      }
    });
  });
  document.querySelectorAll("[data-copy-image]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await copyVisualImage(button.dataset.copyImage);
      } catch (error) {
        setTmpStatus(error instanceof Error ? error.message : "Unable to copy image.");
      }
    });
  });
}

async function exportVisualImage(targetId) {
  const target = visualExportTarget(targetId);
  const blob = await canvasToPngBlob(target.canvas);
  downloadBlobFile(visualExportFileName(targetId), blob);
  setTmpStatus(`${target.label} PNG exported (${target.canvas.width} x ${target.canvas.height}).`);
}

async function copyVisualImage(targetId) {
  const target = visualExportTarget(targetId);
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    setTmpStatus("Clipboard image copy unavailable in this browser.");
    return;
  }
  const blob = await canvasToPngBlob(target.canvas);
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  setTmpStatus(`${target.label} image copied to clipboard.`);
}

function visualExportTarget(targetId) {
  const target = VISUAL_EXPORT_TARGETS[targetId];
  const canvas = target ? document.querySelector(target.selector) : null;
  if (!target || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Visual export target is not available.");
  }
  return { ...target, canvas };
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas could not be encoded as PNG."));
      }
    }, "image/png");
  });
}

function visualExportFileName(targetId) {
  const baseName = currentCaseMetadata?.fileName
    ? currentCaseMetadata.fileName.replace(/\.[^.]+$/, "")
    : "ecgsim-case";
  const safeBase = baseName.replace(/[^a-zA-Z0-9._-]+/g, "-") || "ecgsim-case";
  const safeTarget = String(targetId ?? "view").replace(/[^a-zA-Z0-9._-]+/g, "-") || "view";
  return `${safeBase}-${safeTarget}.png`;
}

function setTmpStatus(message) {
  if (statusMessage) {
    statusMessage.value = message;
  }
}

function updateCaseMetadata(metadata, noticeText) {
  currentCaseMetadata = metadata;
  status.value = metadata.fileName;
  caseSize.textContent = `${metadata.byteSize.toLocaleString()} bytes`;
  caseLeads.textContent = metadata.leadSystems.join(", ");
  caseMarkers.textContent = [
    `PMatrix ${metadata.markerCounts.PMatrix}`,
    `PGeometry ${metadata.markerCounts.PGeometry}`,
    `PLead ${metadata.markerCounts.PLead}`,
    `PVector ${metadata.markerCounts.PVector}`,
  ].join(" / ");
  caseUnsupported.textContent = metadata.unsupportedPayloads.join(", ");
  if (caseValidation) {
    caseValidation.textContent = validationSummaryText(metadata.validation);
    caseValidation.title = validationDetailText(metadata.validation);
  }
  caseNotice.textContent = noticeText ?? `Loaded supported case bundle from ${metadata.source}.`;
  if (toolbarLeadSystem) {
    toolbarLeadSystem.replaceChildren();
    metadata.leadSystems.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      toolbarLeadSystem.appendChild(option);
    });
  }
  if (statusMessage) {
    statusMessage.value = noticeText ?? `Ready: ${metadata.fileName}`;
  }
}

function validationSummaryText(validation) {
  if (!validation || typeof validation !== "object") {
    return "Validation unavailable";
  }
  if (validation.status === "supported") {
    return "Supported";
  }
  const unsupportedCount = Number.isFinite(validation.unsupportedPayloadCount)
    ? validation.unsupportedPayloadCount
    : 0;
  const unavailableCount = Array.isArray(validation.unavailableCapabilities)
    ? validation.unavailableCapabilities.length
    : 0;
  return `Partial: ${unsupportedCount} unsupported payload groups / ${unavailableCount} unavailable capabilities`;
}

function validationDetailText(validation) {
  if (!validation || typeof validation !== "object") {
    return "No validation details were included in this bundle.";
  }
  const messages = Array.isArray(validation.messages) ? validation.messages : [];
  const capabilities = Array.isArray(validation.unavailableCapabilities)
    ? validation.unavailableCapabilities
    : [];
  return [...messages, ...capabilities].join(" | ");
}

function selectedLeadSystemDetail() {
  return currentCaseMetadata?.leadSystemDetails?.find((item) => item.name === leadsSystem?.value)
    ?? currentCaseMetadata?.leadSystemDetails?.[0]
    ?? null;
}

function syncLeadSystemOptions() {
  if (!leadsSystem || !currentCaseMetadata) {
    return;
  }

  leadsSystem.replaceChildren();
  currentCaseMetadata.leadSystemDetails.forEach((leadSystem) => {
    const option = document.createElement("option");
    option.value = leadSystem.name;
    option.textContent = leadSystem.name;
    leadsSystem.appendChild(option);
  });
  leadsSystem.value = currentCaseMetadata.leadSystems[0] ?? "";
}

function syncLeadOverlayControls(signalFixture, tmpState) {
  [leadsMeasured, leadsInitial].forEach((control) => {
    if (!control) {
      return;
    }
    control.checked = false;
    control.disabled = true;
    control.title = "Measured and initial signal classification is not available in current fixtures.";
  });
  if (!leadsAdapted) {
    return;
  }
  const canRecompute = canRecomputeLeadTraces(signalFixture, tmpState);
  leadsAdapted.checked = false;
  leadsAdapted.disabled = !canRecompute;
  leadsAdapted.title = canRecompute
    ? "Recompute adapted electrode traces from edited TMP parameters and the ventricles-to-thorax transfer candidate."
    : "Adapted ECG recomputation requires a transfer matrix matching TMP source nodes.";
}

function validateCaseBundle(bundle) {
  if (!bundle || typeof bundle !== "object" || Array.isArray(bundle)) {
    throw new Error("case bundle must be a JSON object");
  }
  const requiredSections = ["caseMetadata", "heart", "thorax", "ecgSignals", "tmpWaveforms"];
  requiredSections.forEach((section) => {
    if (!bundle[section] || typeof bundle[section] !== "object") {
      throw new Error(`case bundle is missing ${section}`);
    }
  });

  const metadata = bundle.caseMetadata;
  if (!metadata.fileName || !Array.isArray(metadata.leadSystems) || !Array.isArray(metadata.leadSystemDetails)) {
    throw new Error("caseMetadata must include fileName, leadSystems, and leadSystemDetails");
  }
  if (!Number.isFinite(metadata.byteSize)) {
    throw new Error("caseMetadata must include byteSize");
  }
  if (!metadata.markerCounts || typeof metadata.markerCounts !== "object") {
    throw new Error("caseMetadata must include markerCounts");
  }
  ["PMatrix", "PGeometry", "PLead", "PVector"].forEach((markerName) => {
    if (!Number.isFinite(metadata.markerCounts[markerName])) {
      throw new Error(`caseMetadata markerCounts must include ${markerName}`);
    }
  });
  if (!Array.isArray(metadata.unsupportedPayloads)) {
    throw new Error("caseMetadata unsupportedPayloads must be an array");
  }
  validateCaseValidation(metadata.validation);

  validateGeometryBundle(bundle.heart, "heart");
  const thoraxMeshes = bundle.thorax.meshes;
  if (!thoraxMeshes || !thoraxMeshes.thorax || !thoraxMeshes.leftLung || !thoraxMeshes.rightLung) {
    throw new Error("thorax must include thorax, leftLung, and rightLung meshes");
  }
  Object.entries(thoraxMeshes).forEach(([name, mesh]) => validateGeometryBundle(mesh, `thorax.${name}`));
  validateSignalBundle(bundle.ecgSignals);
  validateTmpBundle(bundle.tmpWaveforms);
  return bundle;
}

function validateCaseValidation(validation) {
  if (!validation || typeof validation !== "object") {
    throw new Error("caseMetadata must include validation");
  }
  if (!["supported", "partial", "unsupported"].includes(validation.status)) {
    throw new Error("caseMetadata validation status is invalid");
  }
  if (!Number.isFinite(validation.unsupportedPayloadCount)) {
    throw new Error("caseMetadata validation unsupportedPayloadCount must be numeric");
  }
  if (!Array.isArray(validation.unavailableCapabilities) || !Array.isArray(validation.messages)) {
    throw new Error("caseMetadata validation must include unavailableCapabilities and messages arrays");
  }
}

function validateGeometryBundle(geometry, label) {
  if (!Array.isArray(geometry.points) || !Array.isArray(geometry.triangles)) {
    throw new Error(`${label} geometry must include points and triangles`);
  }
  if (geometry.pointCount !== geometry.points.length || geometry.triangleCount !== geometry.triangles.length) {
    throw new Error(`${label} geometry counts do not match point/triangle arrays`);
  }
}

function validateSignalBundle(signals) {
  if (!Number.isInteger(signals.rows) || !Number.isInteger(signals.columns)) {
    throw new Error("ecgSignals must include integer rows and columns");
  }
  if (!Number.isFinite(signals.sampleRateHz) || signals.sampleRateHz <= 0) {
    throw new Error("ecgSignals must include a positive sampleRateHz");
  }
  if (!Array.isArray(signals.traces) || !signals.traces.length) {
    throw new Error("ecgSignals must include at least one trace");
  }
  if (!signals.surfaceMap || !Array.isArray(signals.surfaceMap.valuesByNode)) {
    throw new Error("ecgSignals must include surfaceMap values");
  }
  if (!signals.fiducials || typeof signals.fiducials.status !== "string") {
    throw new Error("ecgSignals must include fiducial status");
  }
}

function validateTmpBundle(tmp) {
  if (!Number.isInteger(tmp.nodeCount) || !Number.isInteger(tmp.sampleCount)) {
    throw new Error("tmpWaveforms must include integer nodeCount and sampleCount");
  }
  if (!Number.isFinite(tmp.sampleRateHz) || tmp.sampleRateHz <= 0) {
    throw new Error("tmpWaveforms must include a positive sampleRateHz");
  }
  if (!tmp.parameterVectors || typeof tmp.parameterVectors !== "object") {
    throw new Error("tmpWaveforms must include parameterVectors");
  }
  if (!Array.isArray(tmp.nodes) || !tmp.nodes.length) {
    throw new Error("tmpWaveforms must include preview nodes");
  }
}

function applyCaseBundle(bundle, noticeText) {
  validateCaseBundle(bundle);
  selectionState.nodeIndex = -1;
  selectionState.region = [];
  updateCaseMetadata(bundle.caseMetadata, noticeText);
  configureTimeState({
    sampleCount: Math.min(bundle.tmpWaveforms.sampleCount, bundle.ecgSignals.columns),
    sampleRateHz: Math.min(bundle.tmpWaveforms.sampleRateHz, bundle.ecgSignals.sampleRateHz),
  });
  syncLeadSystemOptions();
  if (heartSurface) {
    heartSurface.value = "geometry";
  }
  if (heartValues) {
    heartValues.value = "adapted";
  }
  tmpCanvas = document.querySelector("[data-tmp-canvas]");
  let thoraxView = null;
  let redrawSignals = () => {};
  const tmpEditing = mountTmpEditing(bundle.tmpWaveforms, () => {
    thoraxView?.redrawThoraxMap();
    redrawSignals();
  });
  mountHeart(bundle.heart, bundle.tmpWaveforms, bundle.caseMetadata.wallMapping, () => tmpEditing.syncControls());
  thoraxView = mountThorax(bundle.thorax, bundle.ecgSignals, () => tmpEditing.getState());
  tmpEditing.syncControls();
  syncLeadOverlayControls(bundle.ecgSignals, tmpEditing.getState());
  const leadsCanvas = document.querySelector("[data-leads-canvas]");
  redrawSignals = () => plotSignals(leadsCanvas, bundle.ecgSignals, {
    mode: leadsFilter?.value ?? "baseline",
    leadSystem: selectedLeadSystemDetail(),
    scale: Number.parseFloat(leadsScale?.value ?? "100") / 100,
    showGrid: leadsGrid?.checked ?? true,
    showRms: leadsRms?.checked ?? false,
    selectedSample: timeState.sample,
    tmpState: tmpEditing.getState(),
    showAdapted: leadsAdapted?.checked ?? false,
  });
  if (leadsScale) {
    leadsScale.value = "100";
  }
  if (leadsGrid) {
    leadsGrid.checked = true;
  }
  if (leadsRms) {
    leadsRms.checked = false;
  }
  if (leadsSystem && toolbarLeadSystem) {
    leadsSystem.onchange = () => {
      toolbarLeadSystem.value = leadsSystem.value;
      thoraxView.syncLeadSystem();
      redrawSignals();
    };
  }
  leadsFilter.onchange = redrawSignals;
  if (leadsScale) {
    leadsScale.oninput = redrawSignals;
  }
  if (leadsGrid) {
    leadsGrid.onchange = redrawSignals;
  }
  if (leadsRms) {
    leadsRms.onchange = redrawSignals;
  }
  if (leadsAdapted) {
    leadsAdapted.onchange = redrawSignals;
  }
  redrawTimeDependents = () => {
    redrawSignals();
    tmpEditing.redrawTmp();
    thoraxView.redrawThoraxMap();
    if (statusMessage) {
      statusMessage.value = `Shared time cursor set to ${timeStatus?.value ?? "current sample"}.`;
    }
  };
  if (timeCursor) {
    timeCursor.oninput = () => setTimeSample(Number.parseFloat(timeCursor.value));
  }
  if (timeStepBack) {
    timeStepBack.onclick = () => stepTime(-2);
  }
  if (timeStepForward) {
    timeStepForward.onclick = () => stepTime(2);
  }
  if (timePlay) {
    timePlay.onclick = () => {
      if (timeState.isPlaying) {
        stopTimePlayback();
      } else {
        startTimePlayback();
      }
    };
  }
  tmpCanvas.onpointerdown = (event) => setTimeSample(sampleFromCanvasEvent(tmpCanvas, event, 72));
  tmpCanvas.onkeydown = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      stepTime(event.key === "ArrowLeft" ? -2 : 2);
    }
  };
  leadsCanvas.onpointerdown = (event) => setTimeSample(sampleFromCanvasEvent(leadsCanvas, event, 54));
  leadsCanvas.onkeydown = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      stepTime(event.key === "ArrowLeft" ? -2 : 2);
    }
  };
  redrawSignals();
}

async function loadSupportedCaseBundle(entry) {
  const response = await fetch(`./public/fixtures/cases/${entry.bundle}`);
  if (!response.ok) {
    throw new Error(`Unable to load supported case bundle ${entry.bundle}: ${response.status}`);
  }
  return response.json();
}

async function readBundleFile(file) {
  try {
    return JSON.parse(await file.text());
  } catch (error) {
    throw new Error(`bundle JSON could not be parsed: ${error.message}`);
  }
}

async function sha256Hex(file) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function openSelectedCase(file) {
  if (!file || !supportedCaseManifest || !currentCaseMetadata) {
    return;
  }

  const checkingMessage = `Checking ${file.name} against supported case bundles...`;
  caseNotice.textContent = checkingMessage;
  if (statusMessage) {
    statusMessage.value = checkingMessage;
  }
  try {
    const sha256 = await sha256Hex(file);
    const entry = supportedCaseManifest.cases.find(
      (candidate) => candidate.sha256 === sha256 && candidate.byteSize === file.size,
    );
    if (!entry) {
      updateCaseMetadata(
        currentCaseMetadata,
        `${file.name} is not in the supported web bundle manifest; still showing ${currentCaseMetadata.fileName}.`,
      );
      return;
    }
    const bundle = await loadSupportedCaseBundle(entry);
    applyCaseBundle(bundle, `${file.name} loaded from a supported web case bundle.`);
  } catch (error) {
    updateCaseMetadata(
      currentCaseMetadata,
      `${file.name} could not be opened: ${error.message}; still showing ${currentCaseMetadata.fileName}.`,
    );
  }
}

async function openSelectedCaseBundle(file) {
  if (!file || !currentCaseMetadata) {
    return;
  }

  const checkingMessage = `Opening generated case bundle ${file.name}...`;
  caseNotice.textContent = checkingMessage;
  if (statusMessage) {
    statusMessage.value = checkingMessage;
  }
  try {
    const bundle = validateCaseBundle(await readBundleFile(file));
    applyCaseBundle(bundle, `${file.name} loaded from a generated case bundle.`);
  } catch (error) {
    updateCaseMetadata(
      currentCaseMetadata,
      `${file.name} could not be opened as a generated case bundle: ${error.message}; still showing ${currentCaseMetadata.fileName}.`,
    );
  }
}

async function mount() {
  if (!shell || !status) {
    throw new Error("Viewer shell did not mount");
  }
  const loadFixture = (path) => fetch(path).then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load fixture ${path}: ${response.status}`);
    }
    return response.json();
  });
  const [caseMetadata, heartFixture, thoraxFixture, ecgFixture, tmpFixture, manifest] = await Promise.all([
    loadFixture("./public/fixtures/case-metadata.json"),
    loadFixture("./public/fixtures/heart.json"),
    loadFixture("./public/fixtures/thorax.json"),
    loadFixture("./public/fixtures/ecg-signals.json"),
    loadFixture("./public/fixtures/tmp-waveforms.json"),
    loadFixture("./public/fixtures/cases/manifest.json"),
  ]);
  supportedCaseManifest = manifest;
  shell.dataset.ready = "true";
  applyCaseBundle(
    {
      caseMetadata,
      heart: heartFixture,
      thorax: thoraxFixture,
      ecgSignals: ecgFixture,
      tmpWaveforms: tmpFixture,
    },
    `Loaded bundled supported case fixture from ${caseMetadata.source}.`,
  );
  caseFile?.addEventListener("change", () => openSelectedCase(caseFile.files?.[0]));
  caseBundleFile?.addEventListener("change", () => openSelectedCaseBundle(caseBundleFile.files?.[0]));
  mountVisualExportControls();
}

mount();
