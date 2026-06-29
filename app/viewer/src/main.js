import * as THREE from "three";
import { computeRegionMembership } from "./selection.js";
import {
  EDITABLE_PARAMETERS,
  applyParameterValue,
  buildTmpPlotNodes,
  createTmpEditState,
  nodeParameterValue,
  resetBeat,
  resetParameter,
} from "./tmp-editing.js";

const status = document.querySelector("[data-case-status]");
const shell = document.querySelector("[data-viewer-shell]");
const caseFile = document.querySelector("[data-case-file]");
const caseSize = document.querySelector("[data-case-size]");
const caseLeads = document.querySelector("[data-case-leads]");
const caseMarkers = document.querySelector("[data-case-markers]");
const caseUnsupported = document.querySelector("[data-case-unsupported]");
const caseNotice = document.querySelector("[data-case-notice]");
const heartViewport = document.querySelector("[data-heart-viewport]");
const heartMetadata = document.querySelector("[data-heart-metadata]");
const heartRadius = document.querySelector("[data-heart-radius]");
const heartSelection = document.querySelector("[data-heart-selection]");
const thoraxViewport = document.querySelector("[data-thorax-viewport]");
const thoraxMetadata = document.querySelector("[data-thorax-metadata]");
const leadsMetadata = document.querySelector("[data-leads-metadata]");
const tmpMetadata = document.querySelector("[data-tmp-metadata]");
const tmpParameter = document.querySelector("[data-tmp-parameter]");
const tmpValue = document.querySelector("[data-tmp-value]");
const tmpApply = document.querySelector("[data-tmp-apply]");
const tmpResetParameter = document.querySelector("[data-tmp-reset-parameter]");
const tmpResetBeat = document.querySelector("[data-tmp-reset-beat]");

const selectionState = {
  nodeIndex: -1,
  region: [],
  radiusMm: 20,
};
let tmpEditState = null;
let tmpCanvas = null;

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

function mountHeart(fixture, onSelectionChange) {
  if (!heartViewport || !heartMetadata || !heartRadius || !heartSelection) {
    throw new Error("Heart viewport did not mount");
  }

  const { scene, camera, renderer } = createScene(heartViewport, 0.32);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selectedNodeIndex = -1;
  let isAutoRotating = true;

  const geometry = buildGeometry(fixture, { center: true });
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color: 0xb3261e,
      roughness: 0.72,
      metalness: 0.04,
      side: THREE.DoubleSide,
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

  function updateSelection() {
    const radiusMm = Number.parseFloat(heartRadius.value);
    selectionState.radiusMm = radiusMm;
    if (selectedNodeIndex < 0) {
      heartSelection.value = `Node -- / ${radiusMm} mm / 0 nodes`;
      regionGeometry.setAttribute("position", new THREE.Float32BufferAttribute([], 3));
      selectedMarker.visible = false;
      selectionState.nodeIndex = -1;
      selectionState.region = [];
      onSelectionChange(selectionState);
      return;
    }

    const region = computeRegionMembership(fixture.points, selectedNodeIndex, radiusMm / 1000);
    selectionState.nodeIndex = selectedNodeIndex;
    selectionState.region = region.map((node) => node.index);
    const regionPositions = [];
    region.forEach(({ index }) => {
      const point = nodePositions[index];
      regionPositions.push(point.x, point.y, point.z);
    });

    selectedMarker.position.copy(nodePositions[selectedNodeIndex]);
    selectedMarker.visible = true;
    regionGeometry.setAttribute("position", new THREE.Float32BufferAttribute(regionPositions, 3));
    regionGeometry.computeBoundingSphere();
    heartSelection.value = `Node ${selectedNodeIndex + 1} / ${radiusMm} mm / ${region.length} nodes`;
    onSelectionChange(selectionState);
  }

  function selectFromPointer(event) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    raycaster.setFromCamera(pointer, camera);
    const [hit] = raycaster.intersectObject(mesh, false);
    if (!hit?.face) {
      return;
    }

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
    selectedNodeIndex = nearest;
    isAutoRotating = false;
    updateSelection();
    renderer.render(scene, camera);
  }

  heartRadius.addEventListener("input", updateSelection);
  renderer.domElement.addEventListener("pointerdown", selectFromPointer);
  renderer.domElement.style.cursor = "crosshair";

  observeViewport(heartViewport, camera, renderer, (width) => (width < 480 ? 0.5 : 0.32));

  heartMetadata.value = `${fixture.pointCount} nodes / ${fixture.triangleCount} triangles`;
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

function mountThorax(fixture) {
  if (!thoraxViewport || !thoraxMetadata) {
    throw new Error("Thorax viewport did not mount");
  }

  const { scene, camera, renderer } = createScene(thoraxViewport, 0.75);
  const group = new THREE.Group();
  const meshes = new Map();
  const materials = {
    thorax: new THREE.MeshStandardMaterial({
      color: 0x6f8790,
      opacity: 0.18,
      roughness: 0.8,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
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
    const mesh = new THREE.Mesh(buildGeometry(meshFixture), materials[name]);
    meshes.set(name, mesh);
    group.add(mesh);
  }

  const bounds = new THREE.Box3().setFromObject(group);
  const center = bounds.getCenter(new THREE.Vector3());
  group.position.sub(center);
  group.rotation.set(-0.2, 0.18, 0);
  scene.add(group);

  document.querySelectorAll("[data-toggle-mesh]").forEach((toggle) => {
    const mesh = meshes.get(toggle.dataset.toggleMesh);
    if (!mesh) {
      return;
    }
    mesh.visible = toggle.checked;
    toggle.addEventListener("change", () => {
      mesh.visible = toggle.checked;
    });
  });

  const countText = Object.entries(fixture.meshes)
    .map(([name, meshFixture]) => `${name}: ${meshFixture.pointCount}/${meshFixture.triangleCount}`)
    .join(" | ");
  thoraxMetadata.value = countText;

  observeViewport(thoraxViewport, camera, renderer, (width) => (width < 480 ? 1.05 : 0.75));

  function animate() {
    group.rotation.y += 0.003;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}

function plotSignals(canvas, fixture) {
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
  const traceCount = fixture.traces.length;
  const traceHeight = plotHeight / traceCount;
  const colors = ["#b3261e", "#175c8a", "#6f8790", "#287d5b", "#8a5b13", "#5f4b8b"];

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#f8fafb";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#d9e0e3";
  context.lineWidth = 1;
  context.strokeRect(0.5, 0.5, width - 1, height - 1);

  context.font = "12px Segoe UI, Arial, sans-serif";
  context.fillStyle = "#52616b";
  context.textBaseline = "middle";

  for (let traceIndex = 0; traceIndex < traceCount; traceIndex += 1) {
    const trace = fixture.traces[traceIndex];
    const values = trace.values;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const centerY = top + traceHeight * (traceIndex + 0.5);
    const amplitude = traceHeight * 0.38;

    context.strokeStyle = "rgba(140, 150, 160, 0.22)";
    context.beginPath();
    context.moveTo(left, centerY);
    context.lineTo(width - right, centerY);
    context.stroke();

    context.fillStyle = "#52616b";
    context.fillText(trace.name, 8, centerY);

    context.strokeStyle = colors[traceIndex % colors.length];
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

  context.fillStyle = "#52616b";
  context.textAlign = "left";
  context.fillText("0 ms", left, height - 12);
  context.textAlign = "right";
  const durationMs = Math.round(((fixture.columns - 1) / fixture.sampleRateHz) * 1000);
  context.fillText(`${durationMs} ms`, width - right, height - 12);
  context.textAlign = "start";

  leadsMetadata.value = `${fixture.traces.length} node leads / ${fixture.columns} samples / ${fixture.sampleRateHz} Hz`;
}

function plotTmp(canvas, fixture) {
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
  context.font = "12px Segoe UI, Arial, sans-serif";
  context.textBaseline = "middle";

  nodes.forEach((node, nodeIndex) => {
    const values = [...node.initial, ...node.adapted];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const centerY = top + laneHeight * (nodeIndex + 0.5);
    const amplitude = laneHeight * 0.38;

    context.strokeStyle = "rgba(140, 150, 160, 0.22)";
    context.beginPath();
    context.moveTo(left, centerY);
    context.lineTo(width - right, centerY);
    context.stroke();

    context.fillStyle = "#52616b";
    context.fillText(`N${node.sourceNode + 1}`, 8, centerY);

    drawTmpLine(context, node.initial, min, span, left, plotWidth, centerY, amplitude, "#6f8790", 1.5);
    drawTmpLine(context, node.adapted, min, span, left, plotWidth, centerY, amplitude, "#b3261e", 1.9);
  });

  context.strokeStyle = "#78909c";
  context.beginPath();
  context.moveTo(left, height - bottom + 7);
  context.lineTo(width - right, height - bottom + 7);
  context.stroke();
  context.fillStyle = "#52616b";
  context.textAlign = "left";
  context.fillText("0 ms", left, height - 12);
  context.textAlign = "right";
  const durationMs = Math.round(((fixture.sampleCount - 1) / fixture.sampleRateHz) * 1000);
  context.fillText(`${durationMs} ms`, width - right, height - 12);
  context.textAlign = "start";

  tmpMetadata.value = `${nodes.length} nodes / ${fixture.sampleCount} samples / ${fixture.sampleRateHz} Hz`;
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

function mountTmpEditing(fixture) {
  if (!tmpParameter || !tmpValue || !tmpApply || !tmpResetParameter || !tmpResetBeat) {
    throw new Error("TMP editing controls did not mount");
  }

  tmpEditState = createTmpEditState(fixture);
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

  function selectedRegion() {
    return selectionState.region.filter((nodeIndex) => nodeIndex >= 0 && nodeIndex < tmpEditState.nodeCount);
  }

  function redrawTmp() {
    tmpEditState.selectedNode = selectionState.nodeIndex >= 0 && selectionState.nodeIndex < tmpEditState.nodeCount
      ? selectionState.nodeIndex
      : null;
    plotTmp(tmpCanvas, {
      sampleRateHz: tmpEditState.sampleRateHz,
      sampleCount: tmpEditState.sampleCount,
      nodes: buildTmpPlotNodes(tmpEditState),
    });
  }

  function syncControls() {
    const nodes = selectedRegion();
    const parameter = EDITABLE_PARAMETERS.find((item) => item.id === tmpParameter.value) ?? EDITABLE_PARAMETERS[0];
    const canEdit = nodes.length > 0;
    tmpValue.disabled = !canEdit;
    tmpApply.disabled = !canEdit;
    tmpResetParameter.disabled = !canEdit;
    tmpValue.step = String(parameter.step);
    if (canEdit) {
      const value = nodeParameterValue(tmpEditState, parameter.id, nodes[0], "adapted");
      tmpValue.value = value === null ? "" : String(Math.round(value / parameter.step) * parameter.step);
    } else {
      tmpValue.value = "";
    }
    redrawTmp();
  }

  tmpParameter.addEventListener("change", syncControls);
  tmpApply.addEventListener("click", () => {
    applyParameterValue(tmpEditState, tmpParameter.value, selectedRegion(), Number.parseFloat(tmpValue.value));
    syncControls();
  });
  tmpResetParameter.addEventListener("click", () => {
    resetParameter(tmpEditState, tmpParameter.value, selectedRegion());
    syncControls();
  });
  tmpResetBeat.addEventListener("click", () => {
    resetBeat(tmpEditState);
    syncControls();
  });

  return { syncControls };
}

function mountCaseMetadata(metadata) {
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
  caseNotice.textContent = `Loaded bundled read-only fixtures from ${metadata.source}.`;

  if (caseFile) {
    caseFile.addEventListener("change", () => {
      const file = caseFile.files?.[0];
      if (!file) {
        return;
      }
      status.value = file.name;
      if (file.name === metadata.fileName && file.size === metadata.byteSize) {
        caseNotice.textContent = `${file.name} matches the bundled fixture metadata; read-only views are active.`;
      } else {
        caseNotice.textContent =
          `${file.name} is not parsed in-browser yet; showing bundled ${metadata.fileName} fixtures.`;
      }
    });
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
  const [caseMetadata, heartFixture, thoraxFixture, ecgFixture, tmpFixture] = await Promise.all([
    loadFixture("./public/fixtures/case-metadata.json"),
    loadFixture("./public/fixtures/heart.json"),
    loadFixture("./public/fixtures/thorax.json"),
    loadFixture("./public/fixtures/ecg-signals.json"),
    loadFixture("./public/fixtures/tmp-waveforms.json"),
  ]);
  shell.dataset.ready = "true";
  mountCaseMetadata(caseMetadata);
  tmpCanvas = document.querySelector("[data-tmp-canvas]");
  const tmpEditing = mountTmpEditing(tmpFixture);
  mountHeart(heartFixture, () => tmpEditing.syncControls());
  mountThorax(thoraxFixture);
  tmpEditing.syncControls();
  plotSignals(document.querySelector("[data-leads-canvas]"), ecgFixture);
}

mount();
