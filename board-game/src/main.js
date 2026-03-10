import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/* =========================
   1. SCÈNE
========================= */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

/* =========================
   2. CAMÉRA
========================= */
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, -12, 8);
camera.lookAt(0, 0, 0);

/* =========================
   3. RENDERER
========================= */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/* =========================
   4. LUMIÈRE
========================= */
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, -5, 10);
scene.add(light);

/* =========================
   5. CHARGEMENT DU GLB
========================= */
const loader = new GLTFLoader();

loader.load(
  "/models/collectif_board.gltf",
  (gltf) => {
    console.log("✅ GLB chargé");

    const sceneGLB = gltf.scene;
    scene.add(sceneGLB);

    // 1) Liste tous les noms d'objets contenus dans le GLB
    const names = [];
    sceneGLB.traverse((o) => names.push(o.name));
    console.log("📦 Noms trouvés dans le GLB :", names);

    // 2) Cherche BoardAnchors
    const boardAnchors = sceneGLB.getObjectByName("BoardAnchors");
    if (!boardAnchors) {
      console.error("❌ BoardAnchors introuvable (regarde la liste des noms ci-dessus).");
      return;
    }

    console.log("✅ BoardAnchors trouvé :", boardAnchors.name);
    console.log("✅ Nombre d'objets dans BoardAnchors :", boardAnchors.children.length);

    // 3) Cherche les cases
    const sortedCases = boardAnchors.children
      .filter((obj) => obj.name.startsWith("case_"))
      .sort((a, b) => {
        const aIndex = parseInt(a.name.split("_")[1], 10);
        const bIndex = parseInt(b.name.split("_")[1], 10);
        return aIndex - bIndex;
      });

    console.log("✅ Nombre de cases trouvées :", sortedCases.length);

    // 4) Recentrer la caméra automatiquement sur le plateau (très utile)
    const box = new THREE.Box3().setFromObject(sceneGLB);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    console.log("📐 Taille du plateau :", size);
    console.log("🎯 Centre du plateau :", center);

    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(center.x, center.y - maxDim * 1.5, center.z + maxDim * 0.8);
    camera.lookAt(center);

    // 5) Marqueurs visibles sur les cases
    const markerGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    sortedCases.forEach((c) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(c.position);
      scene.add(marker);
    });
  },
  undefined,
  (error) => {
    console.error("❌ Erreur de chargement GLB", error);
  }
);
