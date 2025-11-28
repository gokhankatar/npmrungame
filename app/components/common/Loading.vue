<template>
  <div ref="loader" class="loader">
    <div ref="threeContainer" class="three-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";

const loader = ref<HTMLElement | null>(null);
const threeContainer = ref<HTMLElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let particles: THREE.Points;
let animationId: number;

const particleCount = 8000; // Daha küçük sayı, performans ve boyut için
const basePositions: THREE.Vector3[] = [];
const targetShapes: THREE.Vector3[] = [];
const forceOffsets: THREE.Vector3[] = [];
let currentShape = 0;
let rotationDirection = 1;
let mouseForce = 0;
const mouse = new THREE.Vector2();

onMounted(() => {
  initThree();
  animate();
  const shapeInterval = setInterval(switchShape, 2000);

  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId);
    clearInterval(shapeInterval);
    renderer.dispose();
  });
});

function initThree() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 120; // Kamera biraz daha yakın

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  threeContainer.value?.appendChild(renderer.domElement);

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const pos = randomSphere();
    positions[i3] = pos.x;
    positions[i3 + 1] = pos.y;
    positions[i3 + 2] = pos.z;

    basePositions.push(new THREE.Vector3(pos.x, pos.y, pos.z));
    targetShapes.push(new THREE.Vector3(pos.x, pos.y, pos.z));
    forceOffsets.push(new THREE.Vector3(0, 0, 0));

    colors[i3] = Math.random();
    colors[i3 + 1] = Math.random();
    colors[i3 + 2] = Math.random();
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const sprite = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/sprites/circle.png"
  );
  const material = new THREE.PointsMaterial({
    size: 0.7, // Daha küçük partikül
    map: sprite,
    alphaTest: 0.5,
    transparent: true,
    vertexColors: true,
    opacity: 0.85,
    depthWrite: false,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener("click", (e) => {
    rotationDirection = e.clientX < window.innerWidth / 2 ? -1 : 1;
    mouseForce = 1.2;
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animate() {
  animationId = requestAnimationFrame(animate);
  // @ts-ignore
  const positions = particles.geometry.attributes.position.array as Float32Array;
  // @ts-ignore
  const colors = particles.geometry.attributes.color.array as Float32Array;
  const time = Date.now() * 0.001;

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const base = basePositions[i];
    const target = targetShapes[i];
    const force = forceOffsets[i];
// @ts-ignore
    base.lerp(target, 0.02);

    const floatX = Math.sin(time + i) * 0.5;
    const floatY = Math.cos(time + i * 0.3) * 0.5;
    const floatZ = Math.sin(time + i * 0.5) * 0.5;

    if (mouseForce > 0.01) {
        // @ts-ignore
      const dx = base.x - mouse.x * 80;
      // @ts-ignore
      const dy = base.y - mouse.y * 80;
      // @ts-ignore
      const dz = base.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;
      // @ts-ignore
      force.x += (dx / dist) * mouseForce;
      // @ts-ignore
      force.y += (dy / dist) * mouseForce;
      // @ts-ignore
      force.z += (dz / dist) * mouseForce;
    }

    // @ts-ignore
    force.multiplyScalar(0.94);

    // @ts-ignore
    let px = base.x + floatX + force.x;
    // @ts-ignore
    let py = base.y + floatY + force.y;
    // @ts-ignore
    let pz = base.z + floatZ + force.z;

    const angle = 0.003 * rotationDirection;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const rx = px * cosA - pz * sinA;
    const rz = px * sinA + pz * cosA;

    positions[i3] = rx;
    positions[i3 + 1] = py;
    positions[i3 + 2] = rz;

    colors[i3] = (Math.sin(time + i * 0.2) + 1) / 2;
    colors[i3 + 1] = (Math.cos(time + i * 0.3) + 1) / 2;
    colors[i3 + 2] = (Math.sin(time + i * 0.5) + 1) / 2;
  }

  if (mouseForce > 0.01) mouseForce *= 0.9;

  // @ts-ignore
  particles.geometry.attributes.position.needsUpdate = true;
  // @ts-ignore
  particles.geometry.attributes.color.needsUpdate = true;

  renderer.render(scene, camera);
}

function switchShape() {
  currentShape = (currentShape + 1) % 3;
  for (let i = 0; i < particleCount; i++) {
    let shape;
    if (currentShape === 0) shape = randomSphere();
    else if (currentShape === 1) shape = randomCube();
    else shape = randomTorus();
    // @ts-ignore
    targetShapes[i].set(shape.x, shape.y, shape.z);
  }
}

function randomSphere() {
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 25; 
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
  };
}

function randomCube() {
  const s = 70; 
  return {
    x: (Math.random() - 0.5) * s,
    y: (Math.random() - 0.5) * s,
    z: (Math.random() - 0.5) * s,
  };
}

function randomTorus() {
  const r1 = 40;
  const r2 = 12;
  const u = Math.random() * 2 * Math.PI;
  const v = Math.random() * 2 * Math.PI;
  return {
    x: (r1 + r2 * Math.cos(v)) * Math.cos(u),
    y: (r1 + r2 * Math.cos(v)) * Math.sin(u),
    z: r2 * Math.sin(v),
  };
}
</script>

<style scoped>
* {
  margin: 0;
  overflow: hidden;
}

canvas {
  display: block;
}

.loader {
  position: fixed;
  background: #000 !important;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  -webkit-transition: 0.3s ease opacity;
  transition: 0.3s ease opacity;
}

.loader .wrap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader .loading {
  color: #fff;
  --duration: 1000ms;
  font-family: "Inter Tight", sans-serif;
  font-size: 24px;
  position: relative;
  white-space: nowrap;
  user-select: none;
}

.loader .loading span {
  --x: 0;
  --y: 0;
  --move-y: 0;
  --move-y-s: 0;
  --delay: 0ms;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  text-indent: calc(var(--x) * -1);
  overflow: hidden;
  transform: translate(var(--x), var(--y));
}
.loader .loading.start div {
  opacity: 0;
}
.loader .loading.start span {
  animation: move var(--duration) ease-in-out var(--delay);
}

@keyframes move {
  30% {
    transform: translate(var(--x), var(--move-y));
  }
  82% {
    transform: translate(var(--x), var(--move-y-s));
  }
}
</style>
