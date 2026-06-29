import * as THREE from "three";

const status = document.querySelector("[data-case-status]");
const shell = document.querySelector("[data-viewer-shell]");
const heartViewport = document.querySelector("[data-heart-viewport]");
const heartMetadata = document.querySelector("[data-heart-metadata]");
const thoraxViewport = document.querySelector("[data-thorax-viewport]");
const thoraxMetadata = document.querySelector("[data-thorax-metadata]");

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

function mountHeart(fixture) {
  if (!heartViewport || !heartMetadata) {
    throw new Error("Heart viewport did not mount");
  }

  const { scene, camera, renderer } = createScene(heartViewport, 0.32);

  const mesh = new THREE.Mesh(
    buildGeometry(fixture, { center: true }),
    new THREE.MeshStandardMaterial({
      color: 0xb3261e,
      roughness: 0.72,
      metalness: 0.04,
      side: THREE.DoubleSide,
    }),
  );
  mesh.rotation.set(-0.35, 0.2, 0.08);
  scene.add(mesh);

  observeViewport(heartViewport, camera, renderer, (width) => (width < 480 ? 0.42 : 0.32));

  heartMetadata.value = `${fixture.pointCount} nodes / ${fixture.triangleCount} triangles`;

  function animate() {
    mesh.rotation.y += 0.006;
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

function drawTrace(canvas, color, phase) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  context.strokeStyle = "rgba(140, 150, 160, 0.35)";
  context.lineWidth = 1;
  for (let y = 40; y < height; y += 40) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.beginPath();
  for (let x = 0; x < width; x += 4) {
    const t = x / width;
    const y = height * 0.5 + Math.sin(t * Math.PI * 6 + phase) * 35 * Math.exp(-t * 0.7);
    if (x === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.stroke();
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
  const [heartFixture, thoraxFixture] = await Promise.all([
    loadFixture("./public/fixtures/heart.json"),
    loadFixture("./public/fixtures/thorax.json"),
  ]);
  shell.dataset.ready = "true";
  mountHeart(heartFixture);
  mountThorax(thoraxFixture);
  drawTrace(document.querySelector("[data-tmp-canvas]"), "#b3261e", 0.2);
  drawTrace(document.querySelector("[data-leads-canvas]"), "#175c8a", 1.3);
}

mount();
