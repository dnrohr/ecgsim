import * as THREE from "three";
import { filterTraces } from "./filtering.js";
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
const statusMessage = document.querySelector("[data-status-message]");
const toolbarLeadSystem = document.querySelector("[data-toolbar-lead-system]");
const heartViewport = document.querySelector("[data-heart-viewport]");
const heartMetadata = document.querySelector("[data-heart-metadata]");
const heartRadius = document.querySelector("[data-heart-radius]");
const heartSelection = document.querySelector("[data-heart-selection]");
const heartAp = document.querySelector("[data-heart-ap]");
const heartRotate = document.querySelector("[data-heart-rotate]");
const heartSurface = document.querySelector("[data-heart-surface]");
const heartValues = document.querySelector("[data-heart-values]");
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
const leadsFilter = document.querySelector("[data-leads-filter]");
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
let supportedCaseManifest = null;
let currentCaseMetadata = null;

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

function mountHeart(fixture, tmpFixture, onSelectionChange) {
  if (
    !heartViewport ||
    !heartMetadata ||
    !heartRadius ||
    !heartSelection ||
    !heartAp ||
    !heartSurface ||
    !heartValues
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

  heartRadius.addEventListener("input", updateSelection);
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

function mountThorax(fixture) {
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
  scene.add(group);

  function electrodeStatusText() {
    const selectedLeadSystem = currentCaseMetadata?.leadSystemDetails?.find(
      (item) => item.name === toolbarLeadSystem?.value,
    );
    const count = selectedLeadSystem?.electrodeCount ?? 0;
    return count > 0
      ? `${count} electrodes parsed; positions unavailable`
      : "Electrodes unavailable";
  }

  function updateSurfaceStatus() {
    const scale = Number.parseFloat(thoraxScale.value);
    const label = thoraxSurface.selectedOptions[0]?.textContent ?? "Geometry";
    const mapStatus = thoraxSurface.value === "geometry" ? "maps unavailable" : "map data unavailable";
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
  thoraxScale.value = "100";
  thoraxRotate.checked = true;
  if (thoraxElectrodes) {
    thoraxElectrodes.checked = false;
    thoraxElectrodes.disabled = true;
    thoraxElectrodes.title = electrodeStatusText();
  }
  updateSurfaceStatus();
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
    thoraxSurface.value = "geometry";
    updateSurfaceStatus();
    if (statusMessage) {
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
}

function plotSignals(canvas, fixture, mode = "baseline") {
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
  const traces = filterTraces(
    fixture.traces,
    mode,
    fixture.baselineStartIndex ?? null,
    fixture.baselineEndIndex ?? null,
  );
  const traceCount = traces.length;
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
    const trace = traces[traceIndex];
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

  leadsMetadata.value =
    `${fixture.traces.length} node leads / ${fixture.columns} samples / ${fixture.sampleRateHz} Hz / ${mode.toUpperCase()}`;
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

  tmpParameter.onchange = syncControls;
  tmpApply.onclick = () => {
    applyParameterValue(tmpEditState, tmpParameter.value, selectedRegion(), Number.parseFloat(tmpValue.value));
    syncControls();
  };
  tmpResetParameter.onclick = () => {
    resetParameter(tmpEditState, tmpParameter.value, selectedRegion());
    syncControls();
  };
  tmpResetBeat.onclick = () => {
    resetBeat(tmpEditState);
    syncControls();
  };

  return { syncControls };
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

function applyCaseBundle(bundle, noticeText) {
  selectionState.nodeIndex = -1;
  selectionState.region = [];
  updateCaseMetadata(bundle.caseMetadata, noticeText);
  tmpCanvas = document.querySelector("[data-tmp-canvas]");
  const tmpEditing = mountTmpEditing(bundle.tmpWaveforms);
  mountHeart(bundle.heart, bundle.tmpWaveforms, () => tmpEditing.syncControls());
  mountThorax(bundle.thorax);
  tmpEditing.syncControls();
  const leadsCanvas = document.querySelector("[data-leads-canvas]");
  const redrawSignals = () => plotSignals(leadsCanvas, bundle.ecgSignals, leadsFilter?.value ?? "baseline");
  leadsFilter.onchange = redrawSignals;
  redrawSignals();
}

async function loadSupportedCaseBundle(entry) {
  const response = await fetch(`./public/fixtures/cases/${entry.bundle}`);
  if (!response.ok) {
    throw new Error(`Unable to load supported case bundle ${entry.bundle}: ${response.status}`);
  }
  return response.json();
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
}

mount();
