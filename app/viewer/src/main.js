import * as THREE from "three";
import { contourLevels, contourNodeIndexes, divergingRgb, sequentialRgb } from "./color-maps.js";
import { readImportedEcgFile } from "./ecg-import.js";
import { baselineWindowForSignal, buildRmsTrace, filterTraces } from "./filtering.js";
import {
  applyFocusSelection,
  createFocusEditState,
  previewFocusActivation,
  updateFocusParameters,
} from "./focus-editing.js";
import { finiteRange, heartSurfaceValues, tmpAtTimeValues } from "./heart-surfaces.js";
import {
  canRecomputeLeadTraces,
  canUseThoraxTransfer,
  contributionValuesForThoraxNode,
  recomputeLeadTraces,
  recomputeThoraxSurfaceSample,
  sensitivityValuesForSourceNode,
} from "./recompute.js";
import { computeWeightedRegionMembership, mergeWeightedRegions } from "./selection.js";
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
const helpOpen = document.querySelector("[data-help-open]");
const helpClose = document.querySelector("[data-help-close]");
const helpDialog = document.querySelector("[data-help-dialog]");
const helpVersion = document.querySelector("[data-help-version]");
const helpCase = document.querySelector("[data-help-case]");
const helpValidation = document.querySelector("[data-help-validation]");
const helpCases = document.querySelector("[data-help-cases]");
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
const visualModeNavigator = document.querySelector("[data-visual-mode-navigator]");
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
const heartNodeOverlay = document.querySelector("[data-heart-node-overlay]");
const heartSelectionRings = document.querySelector("[data-heart-selection-rings]");
const heartSelection = document.querySelector("[data-heart-selection]");
const heartAp = document.querySelector("[data-heart-ap]");
const heartRotate = document.querySelector("[data-heart-rotate]");
const heartContours = document.querySelector("[data-heart-contours]");
const heartSurface = document.querySelector("[data-heart-surface]");
const heartValues = document.querySelector("[data-heart-values]");
const heartWall = document.querySelector("[data-heart-wall]");
const heartTransmural = document.querySelector("[data-heart-transmural]");
const heartCrossSection = document.querySelector("[data-heart-cross-section]");
const heartCrossSectionPlane = document.querySelector("[data-heart-cross-section-plane]");
const heartCrossSectionStatus = document.querySelector("[data-heart-cross-section-status]");
const heartElectrodes = document.querySelector("[data-heart-electrodes]");
const heartVector = document.querySelector("[data-heart-vector]");
const heartOverlayStatus = document.querySelector("[data-heart-overlay-status]");
const heartSurfaceStatus = document.querySelector("[data-heart-surface-status]");
const heartModeBadge = document.querySelector("[data-heart-mode-badge]");
const heartProvenanceBadge = document.querySelector("[data-heart-provenance-badge]");
const thoraxViewport = document.querySelector("[data-thorax-viewport]");
const thoraxMetadata = document.querySelector("[data-thorax-metadata]");
const thoraxAp = document.querySelector("[data-thorax-ap]");
const thoraxRotate = document.querySelector("[data-thorax-rotate]");
const thoraxContours = document.querySelector("[data-thorax-contours]");
const thoraxLineOnly = document.querySelector("[data-thorax-line-only]");
const thoraxSurface = document.querySelector("[data-thorax-surface]");
const thoraxScale = document.querySelector("[data-thorax-scale]");
const thoraxElectrodes = document.querySelector("[data-thorax-electrodes]");
const thoraxHeartContext = document.querySelector("[data-thorax-heart-context]");
const thoraxLockHeart = document.querySelector("[data-thorax-lock-heart]");
const thoraxSurfaceStatus = document.querySelector("[data-thorax-surface-status]");
const thoraxSelection = document.querySelector("[data-thorax-selection]");
const thoraxElectrodeTarget = document.querySelector("[data-thorax-electrode-target]");
const thoraxTargetElectrode = document.querySelector("[data-thorax-target-electrode]");
const thoraxModeBadge = document.querySelector("[data-thorax-mode-badge]");
const thoraxProvenanceBadge = document.querySelector("[data-thorax-provenance-badge]");
const leadsMetadata = document.querySelector("[data-leads-metadata]");
const leadsSource = document.querySelector("[data-leads-source]");
const leadsSystem = document.querySelector("[data-leads-system]");
const leadsFilter = document.querySelector("[data-leads-filter]");
const leadsMeasured = document.querySelector("[data-leads-measured]");
const leadsInitial = document.querySelector("[data-leads-initial]");
const leadsAdapted = document.querySelector("[data-leads-adapted]");
const leadsRms = document.querySelector("[data-leads-rms]");
const leadsGrid = document.querySelector("[data-leads-grid]");
const leadsImport = document.querySelector("[data-leads-import]");
const leadsScale = document.querySelector("[data-leads-scale]");
const leadsStatus = document.querySelector("[data-leads-status]");
const leadsModeBadge = document.querySelector("[data-leads-mode-badge]");
const leadsProvenanceBadge = document.querySelector("[data-leads-provenance-badge]");
const tmpMetadata = document.querySelector("[data-tmp-metadata]");
const tmpShowInitial = document.querySelector("[data-tmp-show-initial]");
const tmpShowAdapted = document.querySelector("[data-tmp-show-adapted]");
const tmpGrid = document.querySelector("[data-tmp-grid]");
const tmpHandlers = document.querySelector("[data-tmp-handlers]");
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
const tmpModeBadge = document.querySelector("[data-tmp-mode-badge]");
const tmpProvenanceBadge = document.querySelector("[data-tmp-provenance-badge]");
const focusSource = document.querySelector("[data-focus-source]");
const focusUseSelection = document.querySelector("[data-focus-use-selection]");
const focusNode = document.querySelector("[data-focus-node]");
const focusTime = document.querySelector("[data-focus-time]");
const focusVelocity = document.querySelector("[data-focus-velocity]");
const focusPreview = document.querySelector("[data-focus-preview]");
const focusOppositeWall = document.querySelector("[data-focus-opposite-wall]");
const focusWriteRaw = document.querySelector("[data-focus-write-raw]");
const focusStatus = document.querySelector("[data-focus-status]");

const APP_VERSION = "0.1.0";
const BUILD_LABEL = "browser-static";

const selectionState = {
  nodeIndex: -1,
  region: [],
  weightedRegion: [],
  radiusMm: 20,
  transitionMm: 0,
  mode: "replace",
  thoraxNodeIndex: -1,
};
let tmpEditState = null;
let tmpCanvas = null;
let supportedCaseManifest = null;
let currentCaseMetadata = null;
let importedEcgSignals = null;
let timeTimer = null;
let redrawTimeDependents = () => {};

function setPaneBadges(modeElement, provenanceElement, modeText, provenanceText, detailText = provenanceText) {
  if (modeElement) {
    modeElement.value = modeText;
    modeElement.title = modeText;
  }
  if (provenanceElement) {
    provenanceElement.value = provenanceText;
    provenanceElement.title = detailText;
  }
}

function dispatchChange(control) {
  control?.dispatchEvent(new Event("change", { bubbles: true }));
}

function selectControlValue(control, value) {
  if (!control) {
    return false;
  }
  const option = [...control.options].find((item) => item.value === value && !item.disabled);
  if (!option) {
    return false;
  }
  control.value = value;
  dispatchChange(control);
  return true;
}

function scrollPaneIntoView(paneName) {
  document.querySelector(`[data-pane="${paneName}"]`)?.scrollIntoView({
    block: "nearest",
    inline: "nearest",
  });
}

function setCheckboxControl(control, checked) {
  if (!control || control.disabled) {
    return false;
  }
  control.checked = checked;
  dispatchChange(control);
  return true;
}

function selectVisualMode(mode) {
  const unavailable = (message) => {
    if (statusMessage) {
      statusMessage.value = message;
    }
  };
  switch (mode) {
    case "heart-geometry":
      scrollPaneIntoView("heart");
      selectControlValue(heartSurface, "geometry");
      break;
    case "heart-depolarization":
      scrollPaneIntoView("heart");
      selectControlValue(heartValues, "adapted");
      selectControlValue(heartSurface, "depolarizationMs");
      break;
    case "heart-ari":
      scrollPaneIntoView("heart");
      selectControlValue(heartValues, "adapted");
      selectControlValue(heartSurface, "ariMs");
      break;
    case "heart-tmp-time":
      scrollPaneIntoView("heart");
      selectControlValue(heartValues, "adapted");
      selectControlValue(heartSurface, "tmpAtTime");
      break;
    case "heart-contribution":
      scrollPaneIntoView("heart");
      if (!selectControlValue(heartSurface, "thoraxContribution")) {
        unavailable("Heart contribution view is unavailable.");
      }
      break;
    case "thorax-geometry":
      scrollPaneIntoView("thorax");
      selectControlValue(thoraxSurface, "geometry");
      break;
    case "thorax-measured":
      scrollPaneIntoView("thorax");
      if (!selectControlValue(thoraxSurface, "measured")) {
        unavailable("Measured thorax BSPM is unavailable for this case.");
      }
      break;
    case "thorax-initial":
      scrollPaneIntoView("thorax");
      if (!selectControlValue(thoraxSurface, "initial")) {
        unavailable("Initial thorax BSPM recompute is unavailable for this case.");
      }
      break;
    case "thorax-adapted":
      scrollPaneIntoView("thorax");
      if (!selectControlValue(thoraxSurface, "adapted")) {
        unavailable("Adapted thorax BSPM recompute is unavailable for this case.");
      }
      break;
    case "thorax-sensitivity":
      scrollPaneIntoView("thorax");
      if (!selectControlValue(thoraxSurface, "sensitivity")) {
        unavailable("Thorax sensitivity view is unavailable for this case.");
      }
      break;
    case "tmp-traces":
      scrollPaneIntoView("tmp");
      setCheckboxControl(tmpShowInitial, true);
      setCheckboxControl(tmpShowAdapted, true);
      setCheckboxControl(tmpGrid, true);
      break;
    case "leads-case":
      scrollPaneIntoView("leads");
      selectControlValue(leadsSource, "case");
      selectControlValue(leadsSystem, currentCaseMetadata?.leadSystems?.[0] ?? "");
      setCheckboxControl(leadsAdapted, false);
      selectControlValue(leadsFilter, "baseline");
      break;
    case "leads-adapted":
      scrollPaneIntoView("leads");
      selectControlValue(leadsSource, "case");
      if (!setCheckboxControl(leadsAdapted, true)) {
        unavailable("Adapted lead ECG recompute is unavailable for this case.");
      }
      break;
    case "leads-vcg":
      scrollPaneIntoView("leads");
      selectControlValue(leadsSource, "case");
      if (!selectControlValue(leadsSystem, "VCG_(Frank)")) {
        unavailable("Frank VCG lead system is unavailable for this case.");
      }
      break;
    default:
      unavailable("Visual mode is unavailable.");
  }
}

const timeState = {
  sample: 0,
  sampleCount: 576,
  sampleRateHz: 1000,
  isPlaying: false,
};

const linkedOrientationState = {
  locked: false,
  heartRotation: new THREE.Euler(),
  applyThoraxRotation: null,
  applyHeartAp: null,
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

function centerOfPoints(points) {
  const box = new THREE.Box3();
  points.forEach((point) => {
    box.expandByPoint(new THREE.Vector3(point[0], point[1], point[2]));
  });
  return box.getCenter(new THREE.Vector3());
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

function mountHeart(
  fixture,
  tmpFixture,
  wallMapping,
  onSelectionChange,
  getTmpEditState = () => null,
  getContributionValues = () => null,
) {
  if (
    !heartViewport ||
    !heartMetadata ||
    !heartSelectionMode ||
    !heartRadius ||
    !heartTransition ||
    !heartNodeOverlay ||
    !heartSelectionRings ||
    !heartSelection ||
    !heartAp ||
    !heartContours ||
    !heartSurface ||
    !heartValues ||
    !heartWall ||
    !heartTransmural ||
    !heartCrossSection ||
    !heartCrossSectionPlane ||
    !heartCrossSectionStatus ||
    !heartElectrodes ||
    !heartVector ||
    !heartOverlayStatus
  ) {
    throw new Error("Heart viewport did not mount");
  }
  heartViewport.replaceChildren();

  const { scene, camera, renderer } = createScene(heartViewport, 0.32);
  renderer.localClippingEnabled = true;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selectedNodeIndex = -1;
  let isAutoRotating = true;
  const crossSectionPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const heartCenter = centerOfPoints(fixture.points);

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

  const contourGeometry = new THREE.BufferGeometry();
  const contourPoints = new THREE.Points(
    contourGeometry,
    new THREE.PointsMaterial({
      color: 0x111820,
      size: 0.006,
      sizeAttenuation: true,
      depthTest: false,
    }),
  );
  contourPoints.renderOrder = 4;
  mesh.add(contourPoints);

  const nodePositions = [];
  const positions = geometry.getAttribute("position");
  for (let index = 0; index < positions.count; index += 1) {
    nodePositions.push(new THREE.Vector3().fromBufferAttribute(positions, index));
  }

  const nodeOverlayGeometry = new THREE.BufferGeometry();
  const nodeOverlayPositions = [];
  nodePositions.forEach((position) => {
    nodeOverlayPositions.push(position.x, position.y, position.z);
  });
  nodeOverlayGeometry.setAttribute("position", new THREE.Float32BufferAttribute(nodeOverlayPositions, 3));
  const nodeOverlayPoints = new THREE.Points(
    nodeOverlayGeometry,
    new THREE.PointsMaterial({
      color: 0xf8fafb,
      opacity: 0.72,
      size: 0.0036,
      sizeAttenuation: true,
      transparent: true,
      depthTest: false,
    }),
  );
  nodeOverlayPoints.visible = false;
  nodeOverlayPoints.renderOrder = 5;
  mesh.add(nodeOverlayPoints);

  const radiusRing = new THREE.LineLoop(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0xf2b705, depthTest: false, transparent: true, opacity: 0.92 }),
  );
  const transitionRing = new THREE.LineLoop(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x175c8a, depthTest: false, transparent: true, opacity: 0.76 }),
  );
  radiusRing.visible = false;
  transitionRing.visible = false;
  radiusRing.renderOrder = 6;
  transitionRing.renderOrder = 6;
  mesh.add(radiusRing);
  mesh.add(transitionRing);

  const electrodeGroup = new THREE.Group();
  electrodeGroup.renderOrder = 7;
  scene.add(electrodeGroup);

  const vectorGroup = new THREE.Group();
  const vectorPath = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x111820, depthTest: false, linewidth: 2 }),
  );
  const vectorArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 0),
    0.04,
    0xf2b705,
    0.012,
    0.008,
  );
  vectorPath.renderOrder = 8;
  vectorArrow.renderOrder = 9;
  vectorGroup.add(vectorPath);
  vectorGroup.add(vectorArrow);
  vectorGroup.visible = false;
  scene.add(vectorGroup);

  function setMeshRotationAP() {
    mesh.rotation.set(-0.35, 0.2, 0.08);
    publishHeartOrientation();
    renderer.render(scene, camera);
  }

  function publishHeartOrientation() {
    linkedOrientationState.heartRotation.copy(mesh.rotation);
    if (linkedOrientationState.locked) {
      linkedOrientationState.applyThoraxRotation?.(mesh.rotation);
    }
  }

  function syncCrossSectionPlane() {
    const enabled = heartCrossSection.checked;
    const offsetMm = Number.parseFloat(heartCrossSectionPlane.value);
    heartCrossSectionPlane.disabled = !enabled;
    crossSectionPlane.constant = offsetMm / 1000;
    mesh.material.clippingPlanes = enabled ? [crossSectionPlane] : [];
    mesh.material.needsUpdate = true;
    heartCrossSectionStatus.value = enabled ? `Cut ${offsetMm} mm` : "Full heart";
    renderer.render(scene, camera);
  }

  function updateRingGeometry(ring, center, radiusMeters) {
    const segments = 96;
    const points = [];
    for (let index = 0; index < segments; index += 1) {
      const angle = (index / segments) * Math.PI * 2;
      points.push(
        center.x + Math.cos(angle) * radiusMeters,
        center.y + Math.sin(angle) * radiusMeters,
        center.z,
      );
    }
    ring.geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    ring.geometry.computeBoundingSphere();
  }

  function syncSelectionOverlays() {
    nodeOverlayPoints.visible = heartNodeOverlay.checked;
    const showRings = heartSelectionRings.checked && selectedNodeIndex >= 0;
    radiusRing.visible = showRings;
    transitionRing.visible = showRings && selectionState.transitionMm > 0;
    if (showRings) {
      const center = nodePositions[selectedNodeIndex];
      updateRingGeometry(radiusRing, center, selectionState.radiusMm / 1000);
      updateRingGeometry(transitionRing, center, (selectionState.radiusMm + selectionState.transitionMm) / 1000);
    }
    renderer.render(scene, camera);
  }

  function selectedLeadSystemDetailForHeart() {
    const name = toolbarLeadSystem?.value ?? currentCaseMetadata?.leadSystems?.[0];
    return currentCaseMetadata?.leadSystemDetails?.find((item) => item.name === name)
      ?? currentCaseMetadata?.leadSystemDetails?.[0]
      ?? null;
  }

  function syncHeartElectrodes() {
    electrodeGroup.clear();
    const leadSystem = selectedLeadSystemDetailForHeart();
    const electrodes = leadSystem?.electrodes ?? [];
    heartElectrodes.disabled = electrodes.length === 0;
    heartElectrodes.title = electrodes.length
      ? `${electrodes.length} parsed electrode positions for ${leadSystem.name}.`
      : "No parsed electrode positions for selected lead system.";
    if (heartElectrodes.checked && electrodes.length) {
      electrodes.forEach((electrode) => {
        const marker = new THREE.Mesh(
          new THREE.SphereGeometry(0.0065, 14, 10),
          new THREE.MeshStandardMaterial({
            color: 0xd7dde1,
            emissive: 0x2c343a,
            emissiveIntensity: 0.18,
            roughness: 0.42,
          }),
        );
        marker.position.set(
          electrode.position[0] - heartCenter.x,
          electrode.position[1] - heartCenter.y,
          electrode.position[2] - heartCenter.z,
        );
        electrodeGroup.add(marker);
      });
    }
    updateHeartOverlayStatus();
    renderer.render(scene, camera);
  }

  function computedVectorPoints(tmpState) {
    if (!tmpState?.parameters || !nodePositions.length) {
      return [];
    }
    const count = Math.min(nodePositions.length, tmpState.nodeCount);
    const step = Math.max(1, Math.floor(tmpState.sampleCount / 96));
    const points = [];
    for (let sample = 0; sample < tmpState.sampleCount; sample += step) {
      points.push(computedVectorPoint(tmpState, sample, count));
    }
    if ((tmpState.sampleCount - 1) % step !== 0) {
      points.push(computedVectorPoint(tmpState, tmpState.sampleCount - 1, count));
    }
    return points;
  }

  function computedVectorPoint(tmpState, sample, count) {
    const values = tmpAtTimeValues(tmpState, "adapted", sample);
    let mean = 0;
    for (let index = 0; index < count; index += 1) {
      mean += values[index] ?? 0;
    }
    mean /= count || 1;
    const centroid = new THREE.Vector3();
    let weightTotal = 0;
    for (let index = 0; index < count; index += 1) {
      const weight = Math.abs((values[index] ?? mean) - mean);
      centroid.addScaledVector(nodePositions[index], weight);
      weightTotal += weight;
    }
    if (weightTotal > 1e-9) {
      centroid.multiplyScalar(1 / weightTotal);
    }
    return centroid;
  }

  function syncHeartVector() {
    const tmpState = getTmpEditState() ?? createTmpEditState(tmpFixture);
    vectorGroup.visible = heartVector.checked;
    if (heartVector.checked) {
      const points = computedVectorPoints(tmpState);
      vectorPath.geometry.setFromPoints(points);
      const current = computedVectorPoint(tmpState, timeState.sample, Math.min(nodePositions.length, tmpState.nodeCount));
      const direction = current.clone();
      const length = Math.max(0.018, Math.min(0.085, direction.length()));
      if (direction.lengthSq() < 1e-12) {
        direction.set(1, 0, 0);
      } else {
        direction.normalize();
      }
      vectorArrow.position.set(0, 0, 0);
      vectorArrow.setDirection(direction);
      vectorArrow.setLength(length, 0.012, 0.008);
    }
    updateHeartOverlayStatus();
    renderer.render(scene, camera);
  }

  function updateHeartOverlayStatus() {
    const leadSystem = selectedLeadSystemDetailForHeart();
    const parts = [];
    if (heartElectrodes.checked && !heartElectrodes.disabled) {
      parts.push(`${leadSystem?.electrodes?.length ?? 0} electrodes`);
    }
    if (heartVector.checked) {
      parts.push(`TMP vector ${Math.round((timeState.sample / timeState.sampleRateHz) * 1000)} ms`);
    }
    heartOverlayStatus.value = parts.length ? parts.join(" / ") : "Overlays off";
  }

  function valueColor(value, min, span) {
    return new THREE.Color(...sequentialRgb(value, min, span));
  }

  function applySurfaceFunction() {
    const surface = heartSurface.value;
    const valueState = heartValues.value;
    const colorAttribute = geometry.getAttribute("color");
    if (surface === "geometry") {
      for (let index = 0; index < colorAttribute.count; index += 1) {
        colorAttribute.setXYZ(index, 0.7, 0.15, 0.1);
      }
      updateContourOverlay([]);
      heartSurfaceStatus.value = "Geometry";
      setPaneBadges(
        heartModeBadge,
        heartProvenanceBadge,
        "Geometry",
        "Parsed mesh",
        "Parsed PGeometry heart mesh from the loaded ECGSIM case bundle.",
      );
    } else {
      const tmpState = getTmpEditState() ?? createTmpEditState(tmpFixture);
      const contribution = surface === "thoraxContribution" ? getContributionValues() : null;
      const values = contribution?.values ?? heartSurfaceValues(tmpState, surface, valueState, timeState.sample);
      const range = finiteRange(values);
      for (let index = 0; index < colorAttribute.count; index += 1) {
        if (index < values.length) {
          const color = valueColor(values[index], range.min, range.span);
          colorAttribute.setXYZ(index, color.r, color.g, color.b);
        } else {
          colorAttribute.setXYZ(index, 0.48, 0.52, 0.54);
        }
      }
      updateContourOverlay(values, range);
      const label = heartSurface.selectedOptions[0]?.textContent ?? surface;
      if (surface === "tmpAtTime") {
        const sampleMs = Math.round((timeState.sample / tmpState.sampleRateHz) * 1000);
        heartSurfaceStatus.value = `${label} / ${valueState} / ${sampleMs} ms`;
        setPaneBadges(
          heartModeBadge,
          heartProvenanceBadge,
          label,
          `${valueState} TMP`,
          `Generated ${valueState} TMP waveform values at ${sampleMs} ms from source parameters.`,
        );
      } else if (surface === "thoraxContribution") {
        heartSurfaceStatus.value = contribution
          ? `${label} / thorax node ${contribution.thoraxNodeIndex + 1}`
          : `${label} / select thorax node`;
        setPaneBadges(
          heartModeBadge,
          heartProvenanceBadge,
          label,
          contribution ? "Transfer row" : "Select thorax",
          contribution
            ? `Ventricles-to-thorax transfer row for thorax node ${contribution.thoraxNodeIndex + 1}.`
            : "Select a thorax node to map transfer contribution back onto the heart.",
        );
      } else if (surface === "ariMs") {
        heartSurfaceStatus.value = `${label} / ${valueState} / ms`;
        setPaneBadges(
          heartModeBadge,
          heartProvenanceBadge,
          label,
          "Derived ARI",
          `Derived from ${valueState} repolarization minus depolarization source parameters.`,
        );
      } else {
        heartSurfaceStatus.value = `${label} / ${valueState}`;
        setPaneBadges(
          heartModeBadge,
          heartProvenanceBadge,
          label,
          `${valueState} params`,
          `Parsed ${valueState} source-parameter vector from the loaded case bundle.`,
        );
      }
    }
    colorAttribute.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function updateContourOverlay(values, range = { min: 0, max: 0, span: 1 }) {
    if (!heartContours.checked || !values.length) {
      contourGeometry.setAttribute("position", new THREE.Float32BufferAttribute([], 3));
      return;
    }
    const levels = contourLevels(range.min, range.max, 8);
    const indexes = contourNodeIndexes(values, levels, range.span / 32);
    const contourPositions = [];
    indexes.forEach((index) => {
      if (index < nodePositions.length) {
        const position = nodePositions[index];
        contourPositions.push(position.x, position.y, position.z);
      }
    });
    contourGeometry.setAttribute("position", new THREE.Float32BufferAttribute(contourPositions, 3));
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
      syncSelectionOverlays();
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
    syncSelectionOverlays();
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
  heartNodeOverlay.onchange = syncSelectionOverlays;
  heartSelectionRings.onchange = syncSelectionOverlays;
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
  heartContours.onchange = applySurfaceFunction;
  heartCrossSection.onchange = syncCrossSectionPlane;
  heartCrossSectionPlane.oninput = syncCrossSectionPlane;
  heartElectrodes.onchange = syncHeartElectrodes;
  heartVector.onchange = syncHeartVector;
  renderer.domElement.addEventListener("pointerdown", selectFromPointer);
  renderer.domElement.style.cursor = "crosshair";

  observeViewport(heartViewport, camera, renderer, (width) => (width < 480 ? 0.5 : 0.32));
  linkedOrientationState.applyHeartAp = setMeshRotationAP;

  heartMetadata.value = `${fixture.pointCount} nodes / ${fixture.triangleCount} triangles`;
  heartSurface.value = "geometry";
  heartValues.value = "adapted";
  heartSelectionMode.value = "replace";
  heartRadius.value = "20";
  heartTransition.value = "0";
  heartNodeOverlay.checked = false;
  heartSelectionRings.checked = false;
  heartCrossSection.checked = false;
  heartCrossSectionPlane.value = "0";
  heartElectrodes.checked = false;
  heartVector.checked = false;
  syncWallMappingControls();
  if (heartRotate) {
    heartRotate.checked = true;
  }
  heartContours.checked = false;
  publishHeartOrientation();
  syncCrossSectionPlane();
  syncHeartElectrodes();
  syncHeartVector();
  applySurfaceFunction();
  updateSelection();

  function animate() {
    if (isAutoRotating) {
      mesh.rotation.y += 0.006;
      publishHeartOrientation();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return {
    redrawHeartSurface: applySurfaceFunction,
    redrawHeartVector: syncHeartVector,
    syncLeadSystem: syncHeartElectrodes,
  };
}

function mountThorax(fixture, signalFixture, heartFixture, getTmpEditState = () => null, onProbeChange = () => {}) {
  if (
    !thoraxViewport ||
    !thoraxMetadata ||
    !thoraxAp ||
    !thoraxRotate ||
    !thoraxContours ||
    !thoraxLineOnly ||
    !thoraxSurface ||
    !thoraxScale ||
    !thoraxHeartContext ||
    !thoraxLockHeart ||
    !thoraxSurfaceStatus ||
    !thoraxSelection ||
    !thoraxElectrodeTarget ||
    !thoraxTargetElectrode
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

  const heartContextMesh = new THREE.Mesh(
    buildGeometry(heartFixture),
    new THREE.MeshStandardMaterial({
      color: 0xb3261e,
      opacity: 0.68,
      roughness: 0.7,
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  heartContextMesh.visible = false;
  heartContextMesh.renderOrder = 3;
  group.add(heartContextMesh);

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

  const thoraxContourGeometry = new THREE.BufferGeometry();
  const thoraxContourPoints = new THREE.Points(
    thoraxContourGeometry,
    new THREE.PointsMaterial({
      color: 0x111820,
      size: 0.0075,
      sizeAttenuation: true,
      depthTest: false,
    }),
  );
  thoraxContourPoints.renderOrder = 5;
  thoraxMesh?.add(thoraxContourPoints);

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
    const lineSuffix = thoraxLineOnly.checked && thoraxLineOnlyEnabled() ? " / lines only" : "";
    if (thoraxSurface.value === "measured" && signalFixture?.surfaceMap) {
      const sampleMs = Math.round((timeState.sample / signalFixture.surfaceMap.sampleRateHz) * 1000);
      thoraxSurfaceStatus.value = `${label} / ${scale}% / ${sampleMs} ms${lineSuffix}`;
      setPaneBadges(
        thoraxModeBadge,
        thoraxProvenanceBadge,
        label,
        "Case BSPM",
        `Parsed body-surface potential map at ${sampleMs} ms from the loaded case bundle.`,
      );
      return;
    }
    if (["initial", "adapted"].includes(thoraxSurface.value) && canRecomputeLeadTraces(signalFixture, getTmpEditState())) {
      const state = getTmpEditState();
      const sampleMs = Math.round((timeState.sample / state.sampleRateHz) * 1000);
      thoraxSurfaceStatus.value = `${label} / ${scale}% / simulated ${sampleMs} ms${lineSuffix}`;
      setPaneBadges(
        thoraxModeBadge,
        thoraxProvenanceBadge,
        label,
        "Recomputed",
        `Recomputed ${thoraxSurface.value} BSPM at ${sampleMs} ms from TMP parameters and transfer matrix.`,
      );
      return;
    }
    if (thoraxSurface.value === "sensitivity" && canUseThoraxTransfer(signalFixture)) {
      const sourceNode = selectedSensitivitySourceNode();
      thoraxSurfaceStatus.value = `${label} / ${scale}% / source node ${sourceNode + 1}${lineSuffix}`;
      setPaneBadges(
        thoraxModeBadge,
        thoraxProvenanceBadge,
        label,
        "Transfer col",
        `Ventricles-to-thorax transfer-column sensitivity for source node ${sourceNode + 1}.`,
      );
      return;
    }
    const mapStatus = signalFixture?.surfaceMap ? "measured map available" : "maps unavailable";
    thoraxSurfaceStatus.value = `${label} / ${scale}% / ${mapStatus}`;
    setPaneBadges(
      thoraxModeBadge,
      thoraxProvenanceBadge,
      label,
      "Parsed meshes",
      "Parsed thorax and lung PGeometry meshes from the loaded ECGSIM case bundle.",
    );
  }

  function updateSelectionStatus() {
    const nodeText = selectedNodeIndex >= 0 ? `Node ${selectedNodeIndex + 1}` : "Node --";
    thoraxSelection.value = `${nodeText} / ${electrodeStatusText()} / maps unavailable`;
  }

  function selectedLeadSystemForThorax() {
    return currentCaseMetadata?.leadSystemDetails?.find(
      (item) => item.name === toolbarLeadSystem?.value,
    ) ?? currentCaseMetadata?.leadSystemDetails?.[0] ?? null;
  }

  function renderThorax() {
    renderer.render(scene, camera);
  }

  function syncHeartContext() {
    heartContextMesh.visible = thoraxHeartContext.checked;
    renderThorax();
  }

  function setThoraxRotationAP() {
    if (linkedOrientationState.locked) {
      linkedOrientationState.applyHeartAp?.();
      group.rotation.copy(linkedOrientationState.heartRotation);
      renderThorax();
      return;
    }
    group.rotation.set(-0.2, 0.18, 0);
    renderThorax();
  }

  function applyLinkedHeartRotation(rotation) {
    group.rotation.copy(rotation);
    renderThorax();
  }

  function applyThoraxScale() {
    const scale = Number.parseFloat(thoraxScale.value) / 100;
    group.scale.setScalar(scale);
    updateSurfaceStatus();
    renderThorax();
  }

  function potentialColor(value, min, span) {
    const maxAbs = Math.max(Math.abs(min), Math.abs(min + span));
    return new THREE.Color(...divergingRgb(value, maxAbs));
  }

  function applyGeometryColors() {
    if (!thoraxMesh) {
      return;
    }
    const colorAttribute = thoraxMesh.geometry.getAttribute("color");
    for (let index = 0; index < colorAttribute.count; index += 1) {
      colorAttribute.setXYZ(index, 0.44, 0.53, 0.56);
    }
    updateThoraxContours([]);
    colorAttribute.needsUpdate = true;
    materials.thorax.opacity = 0.18;
    materials.thorax.depthWrite = false;
  }

  function thoraxLineOnlyEnabled() {
    return ["measured", "initial", "adapted", "sensitivity"].includes(thoraxSurface.value);
  }

  function syncLineOnlyControl() {
    const enabled = thoraxLineOnlyEnabled();
    thoraxLineOnly.disabled = !enabled;
    thoraxLineOnly.title = enabled
      ? "Show scalar map as contour markers over a neutral thorax surface."
      : "Line-only mode is available for scalar BSPM and sensitivity maps.";
  }

  function applyLineOnlyStyle() {
    if (!thoraxMesh || !thoraxLineOnly.checked || !thoraxLineOnlyEnabled()) {
      return;
    }
    const colorAttribute = thoraxMesh.geometry.getAttribute("color");
    for (let index = 0; index < colorAttribute.count; index += 1) {
      colorAttribute.setXYZ(index, 0.72, 0.77, 0.79);
    }
    colorAttribute.needsUpdate = true;
    materials.thorax.opacity = 0.26;
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
    updateThoraxContours(map.valuesByNode.map((row) => row?.[sample] ?? null), {
      min,
      max: map.valueRange.max,
      span,
    });
    applyLineOnlyStyle();
    colorAttribute.needsUpdate = true;
    if (!thoraxLineOnly.checked) {
      materials.thorax.opacity = 0.82;
      materials.thorax.depthWrite = true;
    }
  }

  function applyComputedSurfaceMap(kind) {
    const state = getTmpEditState();
    if (!thoraxMesh || !canRecomputeLeadTraces(signalFixture, state)) {
      applyGeometryColors();
      return;
    }
    const sample = Math.max(0, Math.min(state.sampleCount - 1, timeState.sample));
    const computedValues = recomputeThoraxSurfaceSample(signalFixture, state, sample, kind);
    applyThoraxValues(computedValues);
  }

  function applySensitivityMap() {
    if (!thoraxMesh || !canUseThoraxTransfer(signalFixture)) {
      applyGeometryColors();
      return;
    }
    applyThoraxValues(sensitivityValuesForSourceNode(signalFixture, selectedSensitivitySourceNode()));
  }

  function selectedSensitivitySourceNode() {
    const transfer = signalFixture?.transferMatrices?.ventriclesToThorax;
    const nodeIndex = selectionState.nodeIndex >= 0 ? selectionState.nodeIndex : 0;
    return Math.max(0, Math.min((transfer?.columns ?? 1) - 1, nodeIndex));
  }

  function applyThoraxValues(computedValues) {
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
    updateThoraxContours(computedValues, { min, max, span });
    applyLineOnlyStyle();
    colorAttribute.needsUpdate = true;
    if (!thoraxLineOnly.checked) {
      materials.thorax.opacity = 0.82;
      materials.thorax.depthWrite = true;
    }
  }

  function updateThoraxContours(values, range = { min: 0, max: 0, span: 1 }) {
    if (!thoraxContours.checked || !values.length) {
      thoraxContourGeometry.setAttribute("position", new THREE.Float32BufferAttribute([], 3));
      return;
    }
    const levels = contourLevels(range.min, range.max, 10);
    const indexes = contourNodeIndexes(values, levels, range.span / 36);
    const contourPositions = [];
    indexes.forEach((index) => {
      if (index < thoraxNodePositions.length) {
        const position = thoraxNodePositions[index];
        contourPositions.push(position.x, position.y, position.z);
      }
    });
    thoraxContourGeometry.setAttribute("position", new THREE.Float32BufferAttribute(contourPositions, 3));
  }

  function applyThoraxSurface() {
    syncLineOnlyControl();
    if (thoraxLineOnly.checked && thoraxLineOnlyEnabled()) {
      thoraxContours.checked = true;
    }
    if (thoraxSurface.value === "measured" && signalFixture?.surfaceMap) {
      applyMeasuredSurfaceMap();
    } else if (thoraxSurface.value === "initial" && canRecomputeLeadTraces(signalFixture, getTmpEditState())) {
      applyComputedSurfaceMap("initial");
    } else if (thoraxSurface.value === "adapted" && canRecomputeLeadTraces(signalFixture, getTmpEditState())) {
      applyComputedSurfaceMap("adapted");
    } else if (thoraxSurface.value === "sensitivity" && canUseThoraxTransfer(signalFixture)) {
      applySensitivityMap();
    } else {
      thoraxSurface.value = "geometry";
      applyGeometryColors();
    }
    updateSurfaceStatus();
    renderThorax();
  }

  function syncElectrodeMarkers() {
    electrodeGroup.clear();
    const selectedLeadSystem = selectedLeadSystemForThorax();
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
    syncElectrodeTargetOptions(electrodes, selectedLeadSystem?.name);
    updateSelectionStatus();
    renderThorax();
  }

  function syncElectrodeTargetOptions(electrodes, leadSystemName = "") {
    thoraxElectrodeTarget.replaceChildren();
    electrodes.forEach((electrode, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${electrode.label ?? `E${index + 1}`} -> node ${(electrode.thoraxNodeIndex ?? index) + 1}`;
      thoraxElectrodeTarget.appendChild(option);
    });
    const hasTargets = electrodes.length > 0;
    thoraxElectrodeTarget.disabled = !hasTargets;
    thoraxTargetElectrode.disabled = !hasTargets;
    thoraxElectrodeTarget.title = hasTargets
      ? `${electrodes.length} parsed ${leadSystemName} electrode targets`
      : "No parsed electrode targets for selected lead system.";
    thoraxTargetElectrode.title = thoraxElectrodeTarget.title;
  }

  function selectThoraxNodeIndex(nodeIndex, message = null) {
    if (!thoraxMesh || nodeIndex < 0 || nodeIndex >= thoraxNodePositions.length) {
      return false;
    }
    selectedNodeIndex = nodeIndex;
    selectionState.thoraxNodeIndex = selectedNodeIndex;
    isAutoRotating = false;
    thoraxRotate.checked = false;
    selectedMarker.position.copy(thoraxNodePositions[selectedNodeIndex]);
    selectedMarker.visible = true;
    updateSelectionStatus();
    if (statusMessage) {
      statusMessage.value = message ?? `Thorax node ${selectedNodeIndex + 1} selected.`;
    }
    onProbeChange(selectionState.thoraxNodeIndex);
    renderThorax();
    return true;
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
    selectThoraxNodeIndex(nearest);
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
    } else if (["initial", "adapted"].includes(option.value)) {
      option.disabled = !canRecomputeLeadTraces(signalFixture, getTmpEditState());
      option.title = option.disabled
        ? "BSPM recompute requires a transfer matrix matching TMP source nodes."
        : "Recomputed from TMP source parameters and the ventricles-to-thorax transfer candidate.";
    } else if (option.value === "sensitivity") {
      option.disabled = !canUseThoraxTransfer(signalFixture);
      option.title = option.disabled
        ? "Sensitivity requires a transfer matrix."
        : "Transfer-column sensitivity map for the selected heart source node.";
    } else if (option.value !== "geometry") {
      option.disabled = true;
    }
  });
  thoraxScale.value = "100";
  thoraxRotate.checked = true;
  thoraxContours.checked = false;
  thoraxLineOnly.checked = false;
  thoraxHeartContext.checked = false;
  thoraxLockHeart.disabled = false;
  thoraxLockHeart.dataset.lockStatus = "available";
  thoraxLockHeart.title = "Lock Thorax orientation to the Heart view.";
  thoraxLockHeart.textContent = "Lock";
  thoraxLockHeart.setAttribute("aria-pressed", "false");
  linkedOrientationState.locked = false;
  linkedOrientationState.applyThoraxRotation = applyLinkedHeartRotation;
  thoraxHeartContext.title = `${heartFixture.pointCount} parsed Heart nodes available as Thorax context.`;
  thoraxHeartContext.onchange = syncHeartContext;
  if (thoraxElectrodes) {
    thoraxElectrodes.checked = false;
    thoraxElectrodes.title = electrodeStatusText();
    thoraxElectrodes.onchange = syncElectrodeMarkers;
  }
  thoraxTargetElectrode.onclick = () => {
    const leadSystem = selectedLeadSystemForThorax();
    const electrode = leadSystem?.electrodes?.[Number.parseInt(thoraxElectrodeTarget.value, 10)];
    const nodeIndex = electrode?.thoraxNodeIndex;
    if (Number.isInteger(nodeIndex)) {
      selectThoraxNodeIndex(
        nodeIndex,
        `Thorax electrode ${electrode.label ?? "target"} selected at node ${nodeIndex + 1}.`,
      );
    }
  };
  applyThoraxSurface();
  syncHeartContext();
  syncElectrodeMarkers();
  updateSelectionStatus();

  thoraxAp.onclick = () => {
    isAutoRotating = false;
    thoraxRotate.checked = false;
    setThoraxRotationAP();
    if (statusMessage) {
      statusMessage.value = linkedOrientationState.locked
        ? "Thorax view locked to Heart AP orientation."
        : "Thorax view reset to AP orientation.";
    }
  };
  thoraxRotate.onchange = () => {
    if (linkedOrientationState.locked && thoraxRotate.checked) {
      thoraxRotate.checked = false;
    }
    isAutoRotating = thoraxRotate.checked && !linkedOrientationState.locked;
  };
  thoraxLockHeart.onclick = () => {
    linkedOrientationState.locked = !linkedOrientationState.locked;
    thoraxLockHeart.setAttribute("aria-pressed", linkedOrientationState.locked ? "true" : "false");
    thoraxLockHeart.textContent = linkedOrientationState.locked ? "Locked" : "Lock";
    if (linkedOrientationState.locked) {
      isAutoRotating = false;
      thoraxRotate.checked = false;
      applyLinkedHeartRotation(linkedOrientationState.heartRotation);
      if (statusMessage) {
        statusMessage.value = "Thorax orientation locked to Heart.";
      }
    } else {
      if (statusMessage) {
        statusMessage.value = "Thorax orientation unlocked from Heart.";
      }
    }
  };
  thoraxContours.onchange = applyThoraxSurface;
  thoraxLineOnly.onchange = applyThoraxSurface;
  thoraxSurface.onchange = () => {
    if (!["measured", "initial", "adapted", "sensitivity"].includes(thoraxSurface.value)) {
      thoraxSurface.value = "geometry";
    }
    applyThoraxSurface();
    if (statusMessage && thoraxSurface.value === "measured") {
      statusMessage.value = "Measured thorax BSPM map shown at shared time cursor.";
    } else if (statusMessage && thoraxSurface.value === "initial") {
      statusMessage.value = "Initial thorax BSPM recomputed from initial TMP parameters and the transfer matrix candidate.";
    } else if (statusMessage && thoraxSurface.value === "adapted") {
      statusMessage.value = "Adapted thorax BSPM recomputed from TMP parameters and the transfer matrix candidate.";
    } else if (statusMessage && thoraxSurface.value === "sensitivity") {
      statusMessage.value = "Thorax sensitivity map shown from the selected source-node transfer column.";
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
    importedSignals = null,
    source = "case",
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
  const signalSet = leadSystemTraces(fixture, leadSystem, {
    tmpState,
    showAdapted,
    importedSignals,
    source,
  });
  const fiducials = signalSet.fiducials ?? fixture.fiducials ?? {};
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
  if (leadSystem && signalSet.source !== "imported") {
    context.textAlign = "right";
    context.fillText(leadSystem.name, width - right, top - 7);
    context.textAlign = "start";
  } else if (signalSet.source === "imported") {
    context.textAlign = "right";
    context.fillText("Imported", width - right, top - 7);
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

  const systemText = signalSet.source === "imported"
    ? `${signalSet.name}: ${signalSet.traces.length} imported traces`
    : leadSystem
    ? `${leadSystem.name}: ${signalSet.traces.length} electrode traces / ${leadSystem.leadCount} leads`
    : `${signalSet.traces.length} representative traces`;
  leadsMetadata.value =
    `${systemText} / plotted ${traces.length} / ${signalSet.sampleCount} samples / ${signalSet.sampleRateHz} Hz / ${mode.toUpperCase()} / ${Math.round(scale * 100)}%`;
  if (leadsStatus) {
    const classification = signalSet.isRecomputed
      ? "adapted ECG recomputed from TMP transfer; WCT/reference lead transform unresolved"
      : signalSet.source === "imported"
      ? "external imported signal; separate from case and recomputed outputs"
      : "measured/initial classification unavailable";
    leadsStatus.value = `${signalSet.signalKind}; ${filteringStatus(mode, signalSet.sampleCount, fiducials)}; ${classification}`;
  }
  const modeText = `${mode.toUpperCase()}${showRms ? "+RMS" : ""}`;
  const provenanceText = signalSet.isRecomputed
    ? "Recomputed"
    : signalSet.source === "imported"
    ? "Imported"
    : "Case signals";
  const provenanceDetail = signalSet.isRecomputed
    ? "Adapted ECG traces recomputed from TMP source parameters and the transfer matrix candidate."
    : signalSet.source === "imported"
    ? "External imported ECG signal, separate from case and recomputed outputs."
    : "Lead traces read from case surface potentials or representative signal fixtures.";
  setPaneBadges(leadsModeBadge, leadsProvenanceBadge, modeText, provenanceText, provenanceDetail);
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

function leadSystemTraces(
  fixture,
  leadSystem,
  {
    tmpState = null,
    showAdapted = false,
    importedSignals = null,
    source = "case",
  } = {},
) {
  if (source === "imported" && importedSignals) {
    return {
      source: "imported",
      signalKind: importedSignals.signalKind,
      name: importedSignals.name,
      sampleCount: importedSignals.columns,
      sampleRateHz: importedSignals.sampleRateHz,
      fiducials: importedSignals.fiducials,
      isRecomputed: false,
      traces: importedSignals.traces,
    };
  }

  if (showAdapted && canRecomputeLeadTraces(fixture, tmpState) && leadSystem?.electrodes?.length) {
    return {
      source: "case",
      signalKind: `${leadSystem.name} adapted ECG recompute`,
      sampleCount: tmpState.sampleCount,
      sampleRateHz: tmpState.sampleRateHz,
      isRecomputed: true,
      traces: recomputeLeadTraces(fixture, tmpState, leadSystem, "adapted"),
    };
  }

  if (leadSystem?.electrodes?.length && fixture.surfaceMap?.valuesByNode) {
    return {
      source: "case",
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
    source: "case",
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
    showHandlers = false,
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
    if (showHandlers && fixture.selectedNode === node.sourceNode) {
      drawTmpHandlers(context, node, min, span, left, plotWidth, centerY, amplitude, fixture.sampleRateHz, fixture.sampleCount);
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
  setPaneBadges(
    tmpModeBadge,
    tmpProvenanceBadge,
    traceModes,
    "Source params",
    "TMP traces generated from parsed source-parameter vectors for preview nodes.",
  );
}

function drawTmpHandlers(context, node, min, span, left, plotWidth, centerY, amplitude, sampleRateHz, sampleCount) {
  const parameters = {
    depolarizationMs: node.parameters?.depolarizationMs?.adapted,
    repolarizationMs: node.parameters?.repolarizationMs?.adapted,
    restingPotential: node.parameters?.restingPotential?.adapted,
    amplitude: node.parameters?.amplitude?.adapted,
  };
  if (!Object.values(parameters).every(Number.isFinite)) {
    return;
  }
  const xForMs = (ms) => {
    const sample = Math.max(0, Math.min(sampleCount - 1, (ms / 1000) * sampleRateHz));
    return left + (sample / (sampleCount - 1)) * plotWidth;
  };
  const yForValue = (value) => centerY - (((value - min) / span - 0.5) * amplitude * 2);
  const depX = xForMs(parameters.depolarizationMs);
  const repX = xForMs(parameters.repolarizationMs);
  const restY = yForValue(parameters.restingPotential);
  const peakY = yForValue(parameters.restingPotential + parameters.amplitude);
  context.save();
  context.strokeStyle = "#111820";
  context.fillStyle = "#f2b705";
  context.lineWidth = 1.4;
  [depX, repX].forEach((x) => {
    context.beginPath();
    context.moveTo(x, centerY - amplitude);
    context.lineTo(x, centerY + amplitude);
    context.stroke();
  });
  [[depX, restY], [repX, peakY]].forEach(([x, y]) => {
    context.beginPath();
    context.arc(x, y, 5, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  });
  context.restore();
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
    !tmpHandlers ||
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
  tmpHandlers.checked = false;

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
      selectedNode: tmpEditState.selectedNode,
      nodes: buildTmpPlotNodes(tmpEditState),
    }, {
      showInitial: tmpShowInitial.checked,
      showAdapted: tmpShowAdapted.checked,
      showGrid: tmpGrid.checked,
      showHandlers: tmpHandlers.checked,
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
  tmpHandlers.onchange = redrawTmp;
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

function mountFocusEditing(metadata, tmpFixture) {
  if (
    !focusSource ||
    !focusUseSelection ||
    !focusNode ||
    !focusTime ||
    !focusVelocity ||
    !focusPreview ||
    !focusOppositeWall ||
    !focusWriteRaw ||
    !focusStatus
  ) {
    throw new Error("Focus editing controls did not mount");
  }

  const state = createFocusEditState(metadata, tmpFixture.nodeCount);
  const controls = [focusNode, focusTime, focusVelocity, focusUseSelection, focusPreview];
  focusSource.replaceChildren();
  const sourceOption = document.createElement("option");
  sourceOption.value = state.source?.sourceId ?? "unavailable";
  sourceOption.textContent = state.source
    ? `${state.source.sourceKind} / ${state.source.entryCount} records`
    : "Unavailable";
  focusSource.appendChild(sourceOption);
  focusSource.disabled = !state.isSupported;
  focusSource.title = state.source?.interpretation ?? state.unavailableReason;

  focusOppositeWall.disabled = true;
  focusOppositeWall.title = "Opposite-wall focus mapping requires decoded wall-pair payloads.";
  focusWriteRaw.disabled = true;
  focusWriteRaw.title = "Raw PActivationConstruction field mutation is disabled until field semantics are confirmed.";

  function syncControls() {
    const canUseSelection = state.isSupported
      && selectionState.nodeIndex >= 0
      && selectionState.nodeIndex < state.nodeCount;
    controls.forEach((control) => {
      control.disabled = !state.isSupported;
    });
    focusUseSelection.disabled = !canUseSelection;
    focusNode.value = state.isSupported ? String(state.focusNode + 1) : "";
    focusTime.value = state.isSupported ? String(roundForDisplay(state.focusTimeMs, 3)) : "";
    focusVelocity.value = state.isSupported ? String(roundForDisplay(state.velocityMmPerMs, 3)) : "";
    if (!state.isSupported) {
      focusStatus.value = state.unavailableReason;
    } else if (state.preview) {
      focusStatus.value =
        `Preview ${state.preview.graph}: node ${state.preview.node + 1}, ` +
        `${roundForDisplay(state.preview.minMs, 2)}-${roundForDisplay(state.preview.maxMs, 2)} ms, ` +
        `${state.preview.reachableCount} nodes`;
    } else {
      focusStatus.value =
        `WPW focus records inspectable; preview route starts at node ${state.focusNode + 1}.`;
    }
  }

  function applyInputsAndPreview() {
    const ok = updateFocusParameters(state, {
      focusNode: focusNode.value,
      focusTimeMs: focusTime.value,
      velocityMmPerMs: focusVelocity.value,
    });
    if (!ok) {
      focusStatus.value = "Focus preview rejected invalid node, time, or velocity.";
      return;
    }
    previewFocusActivation(state);
    setTmpStatus("Focus activation preview recomputed.");
    syncControls();
  }

  focusUseSelection.onclick = () => {
    if (applyFocusSelection(state, selectionState.nodeIndex)) {
      state.preview = null;
      setTmpStatus(`Focus preview node set to heart node ${selectionState.nodeIndex + 1}.`);
    }
    syncControls();
  };
  focusPreview.onclick = applyInputsAndPreview;
  focusNode.onchange = applyInputsAndPreview;
  focusTime.onchange = applyInputsAndPreview;
  focusVelocity.onchange = applyInputsAndPreview;
  syncControls();

  return { syncControls, getState: () => state };
}

function roundForDisplay(value, decimals) {
  if (!Number.isFinite(value)) {
    return "--";
  }
  return Number(value.toFixed(decimals));
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
  document.querySelectorAll("[data-export-movie]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await exportVisualMovie(button.dataset.exportMovie);
      } catch (error) {
        setTmpStatus(error instanceof Error ? error.message : "Unable to export movie.");
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
  downloadBlobFile(visualExportFileName(targetId, "png"), blob);
  setTmpStatus(`${target.label} PNG exported (${target.canvas.width} x ${target.canvas.height}).`);
}

async function exportVisualMovie(targetId) {
  const target = visualExportTarget(targetId);
  if (typeof target.canvas.captureStream !== "function" || typeof MediaRecorder === "undefined") {
    throw new Error("WebM movie export is unavailable in this browser.");
  }
  const mimeType = supportedMovieMimeType();
  if (!mimeType) {
    throw new Error("WebM movie encoding is unavailable in this browser.");
  }

  const originalSample = timeState.sample;
  const frameCount = Math.min(24, Math.max(8, timeState.sampleCount));
  const frameStep = Math.max(1, Math.floor((timeState.sampleCount - 1) / Math.max(1, frameCount - 1)));
  const stream = target.canvas.captureStream(8);
  const chunks = [];
  const recorder = new MediaRecorder(stream, { mimeType });
  const stopped = new Promise((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data?.size) {
        chunks.push(event.data);
      }
    };
    recorder.onerror = () => reject(new Error("Movie recorder failed."));
    recorder.onstop = resolve;
  });

  setTmpStatus(`Recording ${target.label} WebM movie...`);
  recorder.start();
  try {
    for (let frame = 0; frame < frameCount; frame += 1) {
      setTimeSample(Math.min(timeState.sampleCount - 1, frame * frameStep));
      await nextAnimationFrame();
      await delay(120);
    }
  } finally {
    setTimeSample(originalSample);
    recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
  }
  await stopped;
  const blob = new Blob(chunks, { type: mimeType });
  if (blob.size < 1) {
    throw new Error("Movie recorder produced an empty WebM file.");
  }
  downloadBlobFile(visualExportFileName(targetId, "webm"), blob);
  setTmpStatus(`${target.label} WebM movie exported (${frameCount} frames).`);
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

function visualExportFileName(targetId, extension = "png") {
  const baseName = currentCaseMetadata?.fileName
    ? currentCaseMetadata.fileName.replace(/\.[^.]+$/, "")
    : "ecgsim-case";
  const safeBase = baseName.replace(/[^a-zA-Z0-9._-]+/g, "-") || "ecgsim-case";
  const safeTarget = String(targetId ?? "view").replace(/[^a-zA-Z0-9._-]+/g, "-") || "view";
  const safeExtension = String(extension).replace(/[^a-zA-Z0-9]+/g, "") || "png";
  return `${safeBase}-${safeTarget}.${safeExtension}`;
}

function setTmpStatus(message) {
  if (statusMessage) {
    statusMessage.value = message;
  }
}

function supportedMovieMimeType() {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? "";
}

function nextAnimationFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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
  syncHelpContent(metadata);
}

function syncHelpContent(metadata = currentCaseMetadata) {
  if (helpVersion) {
    helpVersion.textContent = `${APP_VERSION} / ${BUILD_LABEL}`;
  }
  if (helpCase) {
    helpCase.textContent = metadata?.fileName ?? "No case loaded";
  }
  if (helpValidation) {
    helpValidation.textContent = metadata?.validation
      ? validationSummaryText(metadata.validation)
      : "Validation unavailable";
  }
  if (helpCases) {
    const names = supportedCaseManifest?.cases?.map((item) => item.fileName) ?? [];
    helpCases.textContent = names.length ? names.join(", ") : "Bundle manifest not loaded";
  }
}

function openHelpDialog() {
  syncHelpContent();
  if (typeof helpDialog?.showModal === "function") {
    helpDialog.showModal();
  } else if (helpDialog) {
    helpDialog.setAttribute("open", "");
  }
  if (statusMessage) {
    statusMessage.value = "Help and references opened.";
  }
}

function closeHelpDialog() {
  if (typeof helpDialog?.close === "function") {
    helpDialog.close();
  } else {
    helpDialog?.removeAttribute("open");
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

function selectedLeadsSource() {
  return leadsSource?.value === "imported" && importedEcgSignals ? "imported" : "case";
}

function selectedThoraxContribution(signalFixture) {
  if (selectionState.thoraxNodeIndex < 0 || !canUseThoraxTransfer(signalFixture)) {
    return null;
  }
  return {
    thoraxNodeIndex: selectionState.thoraxNodeIndex,
    values: contributionValuesForThoraxNode(signalFixture, selectionState.thoraxNodeIndex),
  };
}

function syncImportedEcgControls() {
  if (!leadsSource) {
    return;
  }
  const importedOption = leadsSource.querySelector("option[value='imported']");
  if (importedOption) {
    importedOption.disabled = !importedEcgSignals;
  }
  if (!importedEcgSignals && leadsSource.value === "imported") {
    leadsSource.value = "case";
  }
  if (leadsSystem) {
    leadsSystem.disabled = selectedLeadsSource() === "imported";
  }
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
  selectionState.thoraxNodeIndex = -1;
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
  let heartView = null;
  let thoraxView = null;
  let redrawSignals = () => {};
  let focusEditing = null;
  const tmpEditing = mountTmpEditing(bundle.tmpWaveforms, () => {
    heartView?.redrawHeartSurface();
    heartView?.redrawHeartVector();
    thoraxView?.redrawThoraxMap();
    redrawSignals();
  });
  focusEditing = mountFocusEditing(bundle.caseMetadata, bundle.tmpWaveforms);
  heartView = mountHeart(
    bundle.heart,
    bundle.tmpWaveforms,
    bundle.caseMetadata.wallMapping,
    () => {
      tmpEditing.syncControls();
      focusEditing.syncControls();
      thoraxView?.redrawThoraxMap();
    },
    () => tmpEditing.getState(),
    () => selectedThoraxContribution(bundle.ecgSignals),
  );
  thoraxView = mountThorax(
    bundle.thorax,
    bundle.ecgSignals,
    bundle.heart,
    () => tmpEditing.getState(),
    () => heartView?.redrawHeartSurface(),
  );
  tmpEditing.syncControls();
  focusEditing.syncControls();
  syncLeadOverlayControls(bundle.ecgSignals, tmpEditing.getState());
  syncImportedEcgControls();
  const leadsCanvas = document.querySelector("[data-leads-canvas]");
  redrawSignals = () => plotSignals(leadsCanvas, bundle.ecgSignals, {
    mode: leadsFilter?.value ?? "baseline",
    leadSystem: selectedLeadSystemDetail(),
    importedSignals: importedEcgSignals,
    source: selectedLeadsSource(),
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
  if (leadsSource) {
    leadsSource.value = "case";
    syncImportedEcgControls();
    leadsSource.onchange = () => {
      syncImportedEcgControls();
      redrawSignals();
    };
  }
  if (leadsImport) {
    leadsImport.onchange = async () => {
      await importSelectedEcgSignals(leadsImport.files?.[0], redrawSignals);
    };
  }
  if (leadsSystem && toolbarLeadSystem) {
    leadsSystem.onchange = () => {
      toolbarLeadSystem.value = leadsSystem.value;
      heartView?.syncLeadSystem();
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
    heartView.redrawHeartSurface();
    heartView.redrawHeartVector();
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
  if (visualModeNavigator) {
    visualModeNavigator.value = "heart-geometry";
    visualModeNavigator.onchange = () => selectVisualMode(visualModeNavigator.value);
  }
  redrawSignals();
}

async function importSelectedEcgSignals(file, redrawSignals) {
  if (!file || !currentCaseMetadata) {
    return;
  }
  if (statusMessage) {
    statusMessage.value = `Importing ECG signals from ${file.name}...`;
  }
  try {
    importedEcgSignals = await readImportedEcgFile(file);
    if (leadsSource) {
      leadsSource.value = "imported";
    }
    syncImportedEcgControls();
    redrawSignals();
    if (statusMessage) {
      statusMessage.value = `${file.name} imported as external ECG signals.`;
    }
  } catch (error) {
    syncImportedEcgControls();
    if (statusMessage) {
      statusMessage.value = `${file.name} could not be imported: ${error.message}`;
    }
  }
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
  helpOpen?.addEventListener("click", openHelpDialog);
  helpClose?.addEventListener("click", closeHelpDialog);
  helpDialog?.addEventListener("click", (event) => {
    if (event.target === helpDialog) {
      closeHelpDialog();
    }
  });
  syncHelpContent(caseMetadata);
  mountVisualExportControls();
}

mount();
