import * as THREE from "three";

const status = document.querySelector("[data-case-status]");
const shell = document.querySelector("[data-viewer-shell]");
const heartViewport = document.querySelector("[data-heart-viewport]");
const heartMetadata = document.querySelector("[data-heart-metadata]");

function buildHeartGeometry(fixture) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(fixture.points.flat());
  const indices = fixture.triangles.flat();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.center();
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  return geometry;
}

function mountHeart(fixture) {
  if (!heartViewport || !heartMetadata) {
    throw new Error("Heart viewport did not mount");
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafb);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 10);
  camera.position.set(0, 0, 0.32);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(heartViewport.clientWidth, heartViewport.clientHeight);
  heartViewport.appendChild(renderer.domElement);

  const mesh = new THREE.Mesh(
    buildHeartGeometry(fixture),
    new THREE.MeshStandardMaterial({
      color: 0xb3261e,
      roughness: 0.72,
      metalness: 0.04,
      side: THREE.DoubleSide,
    }),
  );
  mesh.rotation.set(-0.35, 0.2, 0.08);
  scene.add(mesh);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c3c8, 2.6));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(2, 3, 4);
  scene.add(keyLight);

  const resize = () => {
    const width = heartViewport.clientWidth;
    const height = heartViewport.clientHeight;
    camera.aspect = width / height;
    camera.position.z = width < 480 ? 0.42 : 0.32;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(heartViewport);
  resize();

  heartMetadata.value = `${fixture.pointCount} nodes / ${fixture.triangleCount} triangles`;

  function animate() {
    mesh.rotation.y += 0.006;
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
  const heartFixture = await fetch("./public/fixtures/heart.json").then((response) => {
    if (!response.ok) {
      throw new Error(`Unable to load heart fixture: ${response.status}`);
    }
    return response.json();
  });
  shell.dataset.ready = "true";
  mountHeart(heartFixture);
  drawTrace(document.querySelector("[data-tmp-canvas]"), "#b3261e", 0.2);
  drawTrace(document.querySelector("[data-leads-canvas]"), "#175c8a", 1.3);
}

mount();
