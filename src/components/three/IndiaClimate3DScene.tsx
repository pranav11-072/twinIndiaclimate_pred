import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Pre-allocated scratch math objects to ensure zero GC in 60fps render loop
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _color = new THREE.Color();

export type CameraPreset = 'synoptic' | 'satellite' | 'himalayas' | 'monsoon';

export interface IndiaClimate3DSceneProps {
  className?: string;
  onSelectStation?: (stationName: string) => void;
}

/**
 * Procedural Earth & India Texture Generator using HTML5 Canvas (Zero 404 dependencies)
 */
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Oceanic Abyss
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#040b17');
  oceanGrad.addColorStop(0.5, '#07152b');
  oceanGrad.addColorStop(1, '#040b17');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Helper coordinate mapper
  const toX = (lng: number) => ((lng + 180) / 360) * canvas.width;
  const toY = (lat: number) => ((90 - lat) / 180) * canvas.height;

  // 2. Global Continents Outline (Eurasia, Africa, Australia)
  ctx.fillStyle = '#142334';
  ctx.strokeStyle = '#1e3852';
  ctx.lineWidth = 2;

  // Eurasia & Africa simplified landmass backdrop
  ctx.beginPath();
  ctx.moveTo(toX(-18), toY(35)); // West Africa
  ctx.lineTo(toX(50), toY(35));
  ctx.lineTo(toX(60), toY(25));
  ctx.lineTo(toX(70), toY(30));
  ctx.lineTo(toX(120), toY(40));
  ctx.lineTo(toX(140), toY(55));
  ctx.lineTo(toX(100), toY(70));
  ctx.lineTo(toX(20), toY(68));
  ctx.lineTo(toX(-10), toY(50));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. High-Fidelity Indian Subcontinent Landmass
  // Geographic bounds: ~68°E to 98°E, ~8°N to 37°N
  ctx.fillStyle = '#1e382b'; // lush terrestrial base
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 3;

  ctx.beginPath();
  // Kutch / Gujarat
  ctx.moveTo(toX(68.5), toY(23.5));
  ctx.lineTo(toX(70.0), toY(22.0)); // Saurashtra
  ctx.lineTo(toX(72.8), toY(21.0)); // Gulf of Khambhat
  ctx.lineTo(toX(73.0), toY(19.0)); // Mumbai / Konkan
  ctx.lineTo(toX(74.5), toY(15.0)); // Goa
  ctx.lineTo(toX(75.5), toY(12.5)); // Malabar / Karnataka
  ctx.lineTo(toX(77.0), toY(9.0));  // Kerala coast
  ctx.lineTo(toX(77.5), toY(8.1));  // Kanyakumari (Southern Cape)
  ctx.lineTo(toX(78.5), toY(9.2));  // Coromandel
  ctx.lineTo(toX(80.2), toY(13.1)); // Chennai
  ctx.lineTo(toX(82.0), toY(16.5)); // Andhra Pradesh coast
  ctx.lineTo(toX(85.8), toY(19.8)); // Odisha / Chilika
  ctx.lineTo(toX(88.0), toY(21.7)); // Sundarbans delta
  ctx.lineTo(toX(92.0), toY(24.0)); // Northeast / Assam
  ctx.lineTo(toX(95.0), toY(28.0)); // Arunachal Pradesh
  ctx.lineTo(toX(93.0), toY(29.0));
  ctx.lineTo(toX(88.5), toY(27.5)); // Sikkim
  ctx.lineTo(toX(81.0), toY(30.5)); // Uttarakhand
  ctx.lineTo(toX(77.5), toY(32.5)); // Himachal Pradesh
  ctx.lineTo(toX(76.5), toY(35.5)); // Jammu & Kashmir / Ladakh
  ctx.lineTo(toX(74.0), toY(36.8)); // Northern frontier
  ctx.lineTo(toX(72.5), toY(33.0));
  ctx.lineTo(toX(71.0), toY(28.5)); // Rajasthan Thar
  ctx.lineTo(toX(69.0), toY(25.0));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Himalayan Mountain Glaciation (Cryosphere)
  ctx.fillStyle = '#e2f3fd';
  ctx.beginPath();
  ctx.moveTo(toX(74.0), toY(35.5));
  ctx.lineTo(toX(78.0), toY(32.5));
  ctx.lineTo(toX(85.0), toY(28.5));
  ctx.lineTo(toX(93.0), toY(28.2));
  ctx.lineTo(toX(90.0), toY(29.5));
  ctx.lineTo(toX(80.0), toY(33.5));
  ctx.closePath();
  ctx.fill();

  // 5. Western Ghats Biosphere Rainforest corridor
  ctx.fillStyle = '#065f46';
  ctx.beginPath();
  ctx.ellipse(toX(75.5), toY(14.0), 12, 50, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // 6. Thar Desert Arid Basin
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.ellipse(toX(71.5), toY(26.5), 24, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // 7. Grid latitude / longitude lines
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
  ctx.lineWidth = 1;
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = toY(lat);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let lng = -180; lng <= 180; lng += 30) {
    const x = toX(lng);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Cloud Texture Generator (Simulating Monsoon Depression Spiral)
 */
function createProceduralCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const toX = (lng: number) => ((lng + 180) / 360) * canvas.width;
  const toY = (lat: number) => ((90 - lat) / 180) * canvas.height;

  // Monsoon Spiral over Bay of Bengal & Arabian Sea
  const drawCloudVortex = (cx: number, cy: number, radius: number) => {
    for (let r = 0; r < radius; r += 4) {
      const angle = r * 0.15;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 20 + r * 0.2);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      grad.addColorStop(0.5, 'rgba(230, 245, 255, 0.25)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, 20 + r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Cloud spiral 1: Bay of Bengal
  drawCloudVortex(toX(88), toY(18), 70);
  // Cloud spiral 2: Arabian Sea off Western Ghats
  drawCloudVortex(toX(71), toY(15), 60);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Solar Cell Array Texture for Satellite Panels
 */
function createSolarCellTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Deep indigo/navy silicon substrate
  ctx.fillStyle = '#061329';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Solar cell grid
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 1.5;
  const cols = 16;
  const rows = 8;
  const cw = canvas.width / cols;
  const ch = canvas.height / rows;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      ctx.fillStyle = (c + r) % 2 === 0 ? '#0b1d3d' : '#081630';
      ctx.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 4);
      ctx.strokeRect(c * cw + 1, r * ch + 1, cw - 2, ch - 2);

      // Silver collector lines
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(c * cw + cw / 2, r * ch + 2);
      ctx.lineTo(c * cw + cw / 2, (r + 1) * ch - 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Composite 10-Part Procedural Satellite Model: ISRO INSAT-3DR
 * Built as a hierarchical THREE.Group adhering to the 3-12 part procedural model rule.
 */
function createInsatSatelliteModel(): THREE.Group {
  const satelliteGroup = new THREE.Group();
  satelliteGroup.name = 'INSAT-3DR';

  // 1. Primary Silhouette: Hexagonal Bus Body (Brushed Titanium PBR)
  const busGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.4, 6);
  const busMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.18,
  });
  const bus = new THREE.Mesh(busGeo, busMat);
  bus.castShadow = true;
  bus.receiveShadow = true;
  satelliteGroup.add(bus);

  // 2. Accent: Gold Multi-Layer Insulation (MLI) Thermal Blanket Core
  const mliGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.5, 6);
  const mliMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.22,
  });
  const mli = new THREE.Mesh(mliGeo, mliMat);
  mli.position.y = 0.1;
  satelliteGroup.add(mli);

  // 3. Secondary: Atmospheric Sounder & Infrared Imager Optical Barrel (LatheGeometry)
  const sounderPoints: THREE.Vector2[] = [];
  sounderPoints.push(new THREE.Vector2(0, -0.4));
  sounderPoints.push(new THREE.Vector2(0.22, -0.35));
  sounderPoints.push(new THREE.Vector2(0.24, -0.1));
  sounderPoints.push(new THREE.Vector2(0.3, 0.1));
  sounderPoints.push(new THREE.Vector2(0.35, 0.35));
  sounderPoints.push(new THREE.Vector2(0.28, 0.4));
  sounderPoints.push(new THREE.Vector2(0, 0.42));
  const sounderGeo = new THREE.LatheGeometry(sounderPoints, 16);
  const sounderMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.35,
  });
  const sounder = new THREE.Mesh(sounderGeo, sounderMat);
  sounder.rotation.x = Math.PI / 2;
  sounder.position.set(0, -0.2, 0.75);
  satelliteGroup.add(sounder);

  // 4. Accent Detail: Optical Quartz Glass Lens
  const lensGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 24);
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.85,
    transparent: true,
    opacity: 0.9,
    clearcoat: 1.0,
  });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, -0.2, 1.15);
  satelliteGroup.add(lens);

  // 5. Secondary: High-Gain Parabolic Communications Dish (LatheGeometry)
  const dishPoints: THREE.Vector2[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    dishPoints.push(new THREE.Vector2(Math.sin(t * Math.PI * 0.45) * 0.8, -Math.cos(t * Math.PI * 0.45) * 0.25 + 0.25));
  }
  const dishGeo = new THREE.LatheGeometry(dishPoints, 24);
  const dishMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.8,
    roughness: 0.25,
    side: THREE.DoubleSide,
  });
  const dish = new THREE.Mesh(dishGeo, dishMat);
  dish.position.set(0, 0.9, 0);
  dish.rotation.x = -Math.PI / 3;
  dish.castShadow = true;
  satelliteGroup.add(dish);

  // 6. Accent Detail: Antenna Feed Horn Tripod
  const feedGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.3, 8);
  const feedMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.9,
    roughness: 0.2,
  });
  const feed = new THREE.Mesh(feedGeo, feedMat);
  feed.position.set(0, 1.15, -0.2);
  satelliteGroup.add(feed);

  // 7. Secondary: Solar Array Articulated Boom Strut (Tube/Cylinder)
  const boomGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8);
  const boomMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.8,
    roughness: 0.3,
  });
  const boomLeft = new THREE.Mesh(boomGeo, boomMat);
  boomLeft.rotation.z = Math.PI / 2;
  boomLeft.position.x = -1.2;
  satelliteGroup.add(boomLeft);

  const boomRight = new THREE.Mesh(boomGeo, boomMat);
  boomRight.rotation.z = Math.PI / 2;
  boomRight.position.x = 1.2;
  satelliteGroup.add(boomRight);

  // 8. Primary Silhouette: Dual Solar Array Panels with Procedural Silicon Cells
  const solarTex = createSolarCellTexture();
  const panelGeo = new THREE.BoxGeometry(2.4, 0.05, 0.9);
  const panelMat = new THREE.MeshStandardMaterial({
    map: solarTex,
    metalness: 0.4,
    roughness: 0.15,
  });

  const panelLeft = new THREE.Mesh(panelGeo, panelMat);
  panelLeft.position.set(-2.8, 0, 0);
  panelLeft.castShadow = true;
  satelliteGroup.add(panelLeft);

  const panelRight = new THREE.Mesh(panelGeo, panelMat);
  panelRight.position.set(2.8, 0, 0);
  panelRight.castShadow = true;
  satelliteGroup.add(panelRight);

  // 9. Accent Detail: RCS Thruster Pods (4 Clusters)
  const thrusterMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.95,
    roughness: 0.1,
  });
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
    const nozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.18, 8),
      thrusterMat
    );
    nozzle.position.set(Math.cos(angle) * 0.72, -0.65, Math.sin(angle) * 0.72);
    nozzle.rotation.x = Math.PI;
    satelliteGroup.add(nozzle);
  }

  // 10. Accent Detail: Nadir Atmospheric Scanner Beam (Translucent Pulsing Cone)
  const beamGeo = new THREE.ConeGeometry(0.9, 3.2, 16, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.22,
    wireframe: true,
    side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.rotation.x = -Math.PI / 2;
  beam.position.set(0, -0.2, 2.4);
  satelliteGroup.add(beam);

  return satelliteGroup;
}

/**
 * Composite 7-Part Procedural Climate Radar Tower
 */
function createRadarTowerModel(): THREE.Group {
  const tower = new THREE.Group();
  tower.name = 'DopplerRadarTower';

  // 1. Foundation: Hexagonal Concrete Pad
  const baseGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.15, 6);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.85,
    metalness: 0.1,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.075;
  base.castShadow = true;
  tower.add(base);

  // 2. Structural Steel Lattice Column
  const latticeGeo = new THREE.CylinderGeometry(0.12, 0.24, 0.9, 4);
  const latticeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.25,
    metalness: 0.85,
  });
  const lattice = new THREE.Mesh(latticeGeo, latticeMat);
  lattice.position.y = 0.6;
  lattice.castShadow = true;
  tower.add(lattice);

  // 3. Catwalk Observation Platform
  const deckGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.04, 12);
  const deckMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.8,
  });
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.y = 1.05;
  tower.add(deck);

  // 4. Radar Radome Sphere
  const radomeGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const radomeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.15,
  });
  const radome = new THREE.Mesh(radomeGeo, radomeMat);
  radome.position.y = 1.32;
  radome.castShadow = true;
  tower.add(radome);

  // 5. Accent: Anemometer Wind Cup Mast
  const mastGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6);
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });
  const mast = new THREE.Mesh(mastGeo, mastMat);
  mast.position.set(0.18, 1.25, 0);
  tower.add(mast);

  // 6. Accent: Warning Beacon Light
  const beaconGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.y = 1.58;
  tower.add(beacon);

  // 7. Soft Radial Contact Shadow Grounding Plane (Prevent floating look)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d')!;
  const sGrad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
  sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  sGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
  sGrad.addColorStop(1, 'transparent');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 128, 128);

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  tower.add(shadow);

  return tower;
}

export const IndiaClimate3DScene: React.FC<IndiaClimate3DSceneProps> = ({
  className = '',
  onSelectStation,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<CameraPreset>('synoptic');
  const [showAtmosphere, setShowAtmosphere] = useState<boolean>(true);
  const [showClouds, setShowClouds] = useState<boolean>(true);
  const [showTelemetryGrid, setShowTelemetryGrid] = useState<boolean>(true);
  const [showStations, setShowStations] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [fps, setFps] = useState<number>(60);

  // Scene references kept in mutable ref to avoid canvas re-creation
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    satellite: THREE.Group;
    earthGroup: THREE.Group;
    clouds: THREE.Mesh;
    atmosphereShell: THREE.Mesh;
    telemetryMesh: THREE.InstancedMesh;
    stationsGroup: THREE.Group;
    isSoftwareGl: boolean;
    targetCameraPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    currentLookAt: THREE.Vector3;
  } | null>(null);

  // Camera preset transitions
  const applyCameraPreset = useCallback((preset: CameraPreset) => {
    setActivePreset(preset);
    if (!sceneRef.current) return;
    const { targetCameraPos, targetLookAt } = sceneRef.current;

    switch (preset) {
      case 'synoptic':
        // Centered high-angle over the Indian subcontinent
        targetCameraPos.set(4, 7, 10);
        targetLookAt.set(1.5, 0.8, 0);
        break;
      case 'satellite':
        // Close-up inspection of ISRO INSAT-3DR satellite
        targetCameraPos.set(0, 11, 4.5);
        targetLookAt.set(0, 8.5, 0);
        break;
      case 'himalayas':
        // Oblique view looking north towards Tibetan plateau and Himalayan ridge
        targetCameraPos.set(2, 5.5, 4.5);
        targetLookAt.set(1.5, 2.2, -0.5);
        break;
      case 'monsoon':
        // Looking up from Indian Ocean over the southern peninsula & Western Ghats
        targetCameraPos.set(2.5, 1.8, 7.5);
        targetLookAt.set(1.6, 0.4, 0.2);
        break;
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL Guard (read from renderer string, never user agent)
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. High-Performance PBR Renderer Setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene, Camera & Atmospheric Deep Space Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040711);
    scene.fog = new THREE.FogExp2(0x040711, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 7, 10);

    // 4. Mandatory Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio PBR 3-Point Lighting Rig (Warm Key + Cool Hemisphere Fill)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 3.2); // Warm sun
    keyLight.position.set(12, 16, 10);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 40;
      keyLight.shadow.camera.left = -8;
      keyLight.shadow.camera.right = 8;
      keyLight.shadow.camera.top = 8;
      keyLight.shadow.camera.bottom = -8;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 1.2); // Cool sky / ground bounce
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.5); // Cyan rim light
    rimLight.position.set(-10, -5, -8);
    scene.add(rimLight);

    // 6. Earth Subcontinent Group
    const earthGroup = new THREE.Group();
    earthGroup.position.set(0, 0, 0);

    // Core Earth Sphere (Radius 4.0)
    const earthTex = createProceduralEarthTexture();
    earthTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const earthGeo = new THREE.SphereGeometry(4.0, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      metalness: 0.1,
      roughness: 0.65,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.receiveShadow = true;
    earthGroup.add(earthMesh);

    // Atmospheric Cloud Layer (Radius 4.08)
    const cloudTex = createProceduralCloudTexture();
    cloudTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const cloudGeo = new THREE.SphereGeometry(4.08, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      roughness: 0.9,
      metalness: 0.0,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(clouds);

    // Outer Atmospheric Glow Shell (Radius 4.22)
    const atmoGeo = new THREE.SphereGeometry(4.22, 32, 32);
    const atmoMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.18,
      roughness: 0.1,
      transmission: 0.6,
      clearcoat: 1.0,
      depthWrite: false,
      side: THREE.BackSide,
    });
    const atmosphereShell = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmosphereShell);

    // 7. InstancedMesh: 120 Spatiotemporal Telemetry Grid Nodes over Subcontinent
    // Latitude ~8° to 36°, Longitude ~68° to 96°
    const nodeCount = 120;
    const nodeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const telemetryMesh = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);

    let idx = 0;
    for (let lat = 10; lat <= 34; lat += 2.5) {
      for (let lng = 70; lng <= 92; lng += 2.8) {
        if (idx >= nodeCount) break;
        // Convert Lat/Lng to 3D Sphere Surface
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const r = 4.09;

        const x = -(r * Math.sin(phi) * Math.cos(theta));
        const z = r * Math.sin(phi) * Math.sin(theta);
        const y = r * Math.cos(phi);

        _vec3A.set(x, y, z);
        _vec3B.set(0, 0, 0); // pointing outwards along normal
        const rotMat = _mat4.lookAt(_vec3A, _vec3B, new THREE.Vector3(0, 1, 0));
        rotMat.setPosition(x, y, z);
        telemetryMesh.setMatrixAt(idx, rotMat);

        // Color coding by climate risk
        if (lat < 16) {
          _color.setHex(0x06b6d4); // Tropical Peninsula
        } else if (lng < 74) {
          _color.setHex(0xf59e0b); // Arid West
        } else if (lat > 30) {
          _color.setHex(0x38bdf8); // Alpine North
        } else {
          _color.setHex(0x10b981); // Gangetic Plain
        }
        telemetryMesh.setColorAt(idx, _color);
        idx++;
      }
    }
    telemetryMesh.instanceMatrix.needsUpdate = true;
    if (telemetryMesh.instanceColor) telemetryMesh.instanceColor.needsUpdate = true;
    earthGroup.add(telemetryMesh);

    // 8. Ground Radar Observatories (4 Key Regional Hubs)
    const stationsGroup = new THREE.Group();
    const hubs = [
      { name: 'IMD New Delhi (Central Node)', lat: 28.6, lng: 77.2 },
      { name: 'ISRO MOSDAC Ahmedabad (Radar Array)', lat: 23.0, lng: 72.5 },
      { name: 'Bengaluru Ground Station (Telemetry)', lat: 12.9, lng: 77.5 },
      { name: 'Guwahati Northeast Doppler Hub', lat: 26.1, lng: 91.7 },
    ];

    hubs.forEach((hub) => {
      const tower = createRadarTowerModel();
      const phi = (90 - hub.lat) * (Math.PI / 180);
      const theta = (hub.lng + 180) * (Math.PI / 180);
      const r = 4.0;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      tower.position.set(x, y, z);
      // Align tower to surface normal
      tower.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, y, z).normalize());
      tower.scale.set(0.35, 0.35, 0.35);
      stationsGroup.add(tower);
    });
    earthGroup.add(stationsGroup);

    scene.add(earthGroup);

    // 9. Hero Subject: ISRO INSAT-3DR Geostationary Climate Satellite
    const satellite = createInsatSatelliteModel();
    satellite.position.set(0, 8.5, 0);
    satellite.scale.set(0.65, 0.65, 0.65);
    scene.add(satellite);

    // Initial orientation: focus on India
    earthGroup.rotation.y = -Math.PI * 0.42;
    earthGroup.rotation.x = 0.25;

    // Track mutable scene state
    const targetCameraPos = new THREE.Vector3(4, 7, 10);
    const targetLookAt = new THREE.Vector3(1.5, 0.8, 0);
    const currentLookAt = new THREE.Vector3(1.5, 0.8, 0);

    sceneRef.current = {
      renderer,
      scene,
      camera,
      satellite,
      earthGroup,
      clouds,
      atmosphereShell,
      telemetryMesh,
      stationsGroup,
      isSoftwareGl,
      targetCameraPos,
      targetLookAt,
      currentLookAt,
    };

    // 10. Mouse Drag Interaction (Damped Orbit)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sceneRef.current) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      earthGroup.rotation.y += dx * 0.005;
      earthGroup.rotation.x += dy * 0.005;
      earthGroup.rotation.x = Math.max(-0.6, Math.min(0.6, earthGroup.rotation.x));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 11. Lossless 60fps Animation Loop with Exponential Damping
    let frameId = 0;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      frameCount++;
      if (now - fpsTimer >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - fpsTimer)));
        frameCount = 0;
        fpsTimer = now;
      }

      // Smooth camera interpolation using exponential damping: 1 - Math.exp(-k * dt)
      const dampFactor = 1 - Math.exp(-4.5 * dt);
      camera.position.lerp(targetCameraPos, dampFactor);
      currentLookAt.lerp(targetLookAt, dampFactor);
      camera.lookAt(currentLookAt);

      // Subtle atmospheric rotation
      clouds.rotation.y += 0.03 * dt * simSpeed;
      if (!isDragging) {
        earthGroup.rotation.y += 0.015 * dt * simSpeed;
      }

      // Satellite orbital oscillation and antenna sweep
      const timeSec = now * 0.001 * simSpeed;
      satellite.position.x = Math.sin(timeSec * 0.4) * 0.8;
      satellite.position.z = Math.cos(timeSec * 0.4) * 0.8;
      satellite.rotation.y = timeSec * 0.2;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(() => {
          frameId = requestAnimationFrame(tick);
        });
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Clean disposal
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      renderer.dispose();
      earthTex.dispose();
      cloudTex.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, [simSpeed]);

  // Synchronize layer visibility props
  useEffect(() => {
    if (!sceneRef.current) return;
    const { clouds, atmosphereShell, telemetryMesh, stationsGroup } = sceneRef.current;
    if (clouds) clouds.visible = showClouds;
    if (atmosphereShell) atmosphereShell.visible = showAtmosphere;
    if (telemetryMesh) telemetryMesh.visible = showTelemetryGrid;
    if (stationsGroup) stationsGroup.visible = showStations;
  }, [showClouds, showAtmosphere, showTelemetryGrid, showStations]);

  return (
    <div className={`relative w-full h-full min-h-[650px] overflow-hidden select-none bg-[#040711] ${className}`}>
      {/* 3D WebGL Canvas Mount Container (Mounted in stable ref outside HUD) */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Top-Left Title Badge (Zero Viewport Occlusion) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 font-mono text-xs shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="font-bold tracking-wider">3D NATIONAL CLIMATE OBSERVATORY</span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
            PBR • {fps} FPS
          </span>
        </div>
        <p className="text-[11px] font-mono text-slate-400 pl-1">
          Coupled Earth System: Subcontinent Mesh • ISRO INSAT-3DR Geostationary Array
        </p>
      </div>

      {/* Floating Collapsible Bottom Control Dock (<= 15% viewport footprint, solid/rgba surfaces) */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-all duration-300 max-w-[94vw] ${
          controlsCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Toggle Tab */}
        <button
          onClick={() => setControlsCollapsed(!controlsCollapsed)}
          className="px-4 py-1 rounded-t-xl bg-[#090d18] border-t border-x border-slate-700/80 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
        >
          <span>{controlsCollapsed ? '▴ Show Observatory Dock' : '▾ Hide Controls (Zen View)'}</span>
        </button>

        {/* Unified Bottom Control Panel */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-3 rounded-2xl bg-[#080d1a]/95 border border-slate-700/90 shadow-2xl text-xs font-mono">
          {/* Camera Presets */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 px-2 font-semibold">VIEW:</span>
            {(
              [
                { id: 'synoptic', label: 'Synoptic India' },
                { id: 'satellite', label: 'INSAT-3DR' },
                { id: 'himalayas', label: 'Himalayas' },
                { id: 'monsoon', label: 'Monsoon Front' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => applyCameraPreset(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                  activePreset === p.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Layer Toggles */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setShowClouds(!showClouds)}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                showClouds
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              Clouds
            </button>
            <button
              onClick={() => setShowAtmosphere(!showAtmosphere)}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                showAtmosphere
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              Atmosphere
            </button>
            <button
              onClick={() => setShowTelemetryGrid(!showTelemetryGrid)}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                showTelemetryGrid
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              Grid Nodes
            </button>
            <button
              onClick={() => setShowStations(!showStations)}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                showStations
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              Radar Towers
            </button>
          </div>

          {/* Simulation Speed */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px]">
            <span className="text-slate-400">SPEED:</span>
            {[0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setSimSpeed(s)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  simSpeed === s ? 'text-cyan-400 font-bold bg-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
