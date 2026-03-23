import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  useTexture,
  Text,
  Billboard,
} from "@react-three/drei";

import Character3D from "./Character3D";
import BoardAvatar from "./BoardAvatar";
import { useCharacter } from "../../context/CharacterContext";
import { getPlayerId } from "../../utils/playerId";

// ------------------- CONFIG -------------------
const GRID_COLS = 11;
const GRID_ROWS = 6;

const USE_BLENDER_BOARD = true;
const BLENDER_URL = "/models/collectif_board.glb";

// fallback si un joueur n'a pas d'avatarConfig
const USE_CHARACTER_3D = false;

const AVATAR_VISUAL_OFFSET = [0.1, 0.0, -0.06];

const MODEL_MALE_URL = "/models/male_walk/Walking.fbx";
const MODEL_FEMALE_URL = "/models/female_walk/Walking.fbx";

const DEG = Math.PI / 180;
const CHAR_ROT_X = 0 * DEG;
const CHAR_ROT_Y = -90 * DEG;
const CHAR_ROT_Z = 0 * DEG;

const CHAR_LOCAL_OFFSET = [0.0, 0.06, 0.0];
const START_EXTRA_OFFSET = [0.0, 0.0, 0.0];

const ENABLE_SHADOWS = false;

const ICON_BASE = "/icons";
const THEME_ICONS = {
  depart: `${ICON_BASE}/depart.png`,
  arrivee: `${ICON_BASE}/arrivee.png`,
  quiz: `${ICON_BASE}/quiz.png`,
  symbole: `${ICON_BASE}/symbole.png`,
  rituel: `${ICON_BASE}/rituel.png`,
  histoire: `${ICON_BASE}/histoire.png`,
  reglement: `${ICON_BASE}/reglement.png`,
  defi: `${ICON_BASE}/defi.png`,
  evenement: `${ICON_BASE}/evenement.png`,
  augmentation: `${ICON_BASE}/augmentation.png`,
  cabinet: `${ICON_BASE}/cabinet.png`,
};

const ICON_Y_OFFSET = 0.025;
const ICON_SIZE = 0.5;

const ICON_SIZE_BY_KEY = {
  quiz: 0.71,
  augmentation: 0.72,
  cabinet: 0.72,
  depart: 0.76,
  arrivee: 0.76,
};

const ICON_Y_OFFSET_BY_KEY = {
  depart: 0.035,
  arrivee: 0.035,
  augmentation: 0.03,
  cabinet: 0.03,
};

// Caméra fixe de scène
const FIXED_CAMERA_POSITION = new THREE.Vector3(7, 25, 18);
const FIXED_CAMERA_LOOK_AT = new THREE.Vector3(-0.8, 1.2, 0.2);
const FIXED_CAMERA_FOV = 35;

// ------------------- UTILS -------------------
function idxToXZ(i, spacing) {
  const col = i % GRID_COLS;
  const row = Math.floor(i / GRID_COLS);
  const x = (col - (GRID_COLS - 1) / 2) * spacing;
  const z = (row - (GRID_ROWS - 1) / 2) * spacing;
  return [x, z];
}

function normalizeCells(rawCells, size) {
  if (Array.isArray(rawCells)) return rawCells;

  if (rawCells && typeof rawCells === "object") {
    const arr = Object.keys(rawCells)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => rawCells[k]);
    if (arr.length) return arr;
  }

  return Array.from({ length: size }).map((_, i) => ({
    index: i,
    type: i === 0 ? "start" : i === size - 1 ? "arrivee" : "question",
    theme: i === 0 ? "depart" : i === size - 1 ? "arrivee" : "symbole",
  }));
}

function getPlayerPos(room, playerId) {
  const p1 = room?.board?.positions?.[playerId];
  if (Number.isFinite(Number(p1))) return Number(p1);

  const p2 = room?.players?.[playerId]?.pos;
  if (Number.isFinite(Number(p2))) return Number(p2);

  const p3 = room?.players?.[playerId]?.position;
  if (Number.isFinite(Number(p3))) return Number(p3);

  const p4 = room?.players?.[playerId]?.boardPos;
  if (Number.isFinite(Number(p4))) return Number(p4);

  return 0;
}

function normalizeThemeKey(theme) {
  return String(theme || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[éèêë]/g, "e")
    .replace(/[àâä]/g, "a")
    .replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o")
    .replace(/[ùûü]/g, "u");
}

function isQuizTheme(theme) {
  const t = normalizeThemeKey(theme);
  return t === "quiz" || t === "mix" || t === "aleatoire" || t === "aléatoire";
}

function themeToColor(theme) {
  const t = normalizeThemeKey(theme);

  if (t === "depart") return new THREE.Color("#B8B8B8");
  if (t === "arrivee") return new THREE.Color("#7D6410");
  if (t === "augmentation") return new THREE.Color("#E6E6E6");
  if (t === "cabinet") return new THREE.Color("#000000");

  if (t === "symbole") return new THREE.Color("#4B1F76");
  if (t === "rituel") return new THREE.Color("#1D3F97");
  if (t === "histoire") return new THREE.Color("#0D5D2A");
  if (t === "reglement") return new THREE.Color("#8F3D12");
  if (t === "defi") return new THREE.Color("#9E1217");

  if (t === "evenement") return new THREE.Color("#CAB79D");
  if (t === "quiz") return new THREE.Color("#FFFFFF");

  return new THREE.Color("#94A3B8");
}

function themeToIconUrl(visualKey) {
  const t = normalizeThemeKey(visualKey);
  if (isQuizTheme(t)) return THEME_ICONS.quiz;
  return THEME_ICONS[t] || null;
}

function baseCaseName(name) {
  return String(name || "").toLowerCase().split(".")[0];
}

function parseCaseInfo(name) {
  const n = baseCaseName(name);
  const match = n.match(/^case_(\d+)_(.+)$/);
  if (!match) return null;

  return {
    index: Number(match[1]),
    rawTheme: match[2],
  };
}

function resolveVisualKeyFromObjectName(name) {
  const info = parseCaseInfo(name);
  if (!info) return null;

  const t = normalizeThemeKey(info.rawTheme);

  if (t === "depart" || t === "start") return "depart";
  if (t === "arrivee" || t === "arrival") return "arrivee";
  if (t === "symbole" || t === "symboles") return "symbole";
  if (t === "rituel" || t === "rituels") return "rituel";
  if (t === "histoire") return "histoire";
  if (t === "defi" || t === "defis") return "defi";
  if (t === "quiz" || t === "aleatoire" || t === "aléatoire" || t === "mix") {
    return "quiz";
  }
  if (t === "evenement" || t === "evenements" || t === "event") return "evenement";
  if (t === "augmentation" || t === "augmentation de salaire") return "augmentation";
  if (t === "cabinet" || t === "cabinet de reflexion") return "cabinet";

  if (
    t === "reglement" ||
    t === "reglements" ||
    t === "constitution" ||
    t === "constitutions" ||
    t === "constitution_reglement" ||
    t === "constitution reglement"
  ) {
    return "reglement";
  }

  return "symbole";
}

function makeQuizTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.95;

  const slices = ["#4B237A", "#1E3A8A", "#14532D", "#7C2D12", "#7F1D1D"];
  const sliceAngle = (Math.PI * 2) / slices.length;
  const startOffset = -30 * DEG;

  for (let i = 0; i < slices.length; i++) {
    const start = startOffset + i * sliceAngle;
    const end = start + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = slices[i];
    ctx.fill();
  }

  const glow = ctx.createRadialGradient(cx, size * 0.35, 0, cx, size * 0.35, size * 0.55);
  glow.addColorStop(0, "rgba(255,255,255,0.16)");
  glow.addColorStop(0.4, "rgba(255,255,255,0.08)");
  glow.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.anisotropy = 8;
  texture.center.set(0.5, 0.5);
  texture.rotation = 0;

  return texture;
}

function getWorldCenterAndTop(obj) {
  const box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());

  return {
    center,
    top: new THREE.Vector3(center.x, box.max.y, center.z),
  };
}

// ------------------- THEME ICON -------------------
function ThemeIcon({ url, position, size = ICON_SIZE }) {
  const tex = useTexture(url);

  useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
  }, [tex]);

  if (!tex) return null;

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} renderOrder={20}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={tex}
        transparent
        alphaTest={0.08}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ------------------- HALO -------------------
function ActiveHalo() {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const s = 1 + Math.sin(t * 3) * 0.08;
    ref.current.scale.set(s, s, s);
    ref.current.material.opacity = 0.22 + (Math.sin(t * 3) + 1) * 0.08;
  });

  return (
    <mesh ref={ref} position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.22, 0.34, 48]} />
      <meshBasicMaterial
        color="#D4AF37"
        transparent
        opacity={0.28}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ------------------- NOM JOUEUR -------------------
function PlayerNameTag({ name }) {
  if (!name) return null;

  return (
    <Billboard position={[0, 1.9, 0]} follow>
      <Text
        fontSize={0.12}
        color="#D4AF37"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.006}
        outlineColor="#000000"
        maxWidth={1.1}
      >
        {name}
      </Text>
    </Billboard>
  );
}

// ------------------- BLENDER BOARD -------------------
function BlenderBoard({ url, onReady }) {
  const { scene } = useGLTF(url);
  const sceneClone = useMemo(() => scene.clone(true), [scene]);
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!sceneClone) return;
    if (didInitRef.current) return;

    const quizTexture = makeQuizTexture();

    sceneClone.traverse((o) => {
      if (o?.isMesh) {
        o.visible = true;
        o.frustumCulled = false;
        o.castShadow = false;
        o.receiveShadow = false;

        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.filter(Boolean).forEach((m) => {
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
          m.side = THREE.DoubleSide;
        });
      }
    });

    sceneClone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(sceneClone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    sceneClone.position.sub(center);
    sceneClone.updateMatrixWorld(true);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 30;
    const s = targetSize / maxDim;
    sceneClone.scale.setScalar(s);
    sceneClone.updateMatrixWorld(true);

    const caseEntries = [];

    sceneClone.traverse((o) => {
      if (!o?.name) return;

      const info = parseCaseInfo(o.name);
      if (!info) return;

      const { top } = getWorldCenterAndTop(o);

      caseEntries.push({
        obj: o,
        index: info.index,
        visualKey: resolveVisualKeyFromObjectName(o.name),
        position: top,
      });
    });

    if (!caseEntries.length) {
      console.error("❌ Aucune case case_XX_theme trouvée dans le GLB.");
      onReady?.({ ok: false, data: [] });
      return;
    }

    caseEntries.sort((a, b) => a.index - b.index);

    caseEntries.forEach((entry) => {
      const obj = entry.obj;
      const visualKey = entry.visualKey || "symbole";

      if (!obj.isMesh) return;

      const col = themeToColor(visualKey);
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];

      const cloned = mats.map((m) => {
        if (!m) return m;

        const mm = m.clone();

        if (visualKey === "quiz") {
          mm.map = quizTexture;
          mm.transparent = false;

          if (mm.color) mm.color = new THREE.Color("#ffffff");
          if (mm.emissive) mm.emissive = new THREE.Color("#050505");
          mm.emissiveIntensity = 0.08;
          mm.roughness = 0.88;
          mm.metalness = 0.02;
        } else {
          mm.map = null;

          if (mm.color) mm.color = col.clone();
          if (mm.emissive) mm.emissive = new THREE.Color("#000000");
          mm.emissiveIntensity = 0.0;
          mm.roughness = 0.92;
          mm.metalness = 0.0;
        }

        mm.toneMapped = false;
        mm.needsUpdate = true;
        return mm;
      });

      obj.material = Array.isArray(obj.material) ? cloned : cloned[0];
    });

    didInitRef.current = true;
    onReady?.({ ok: true, data: caseEntries });
  }, [sceneClone, onReady]);

  return sceneClone ? <primitive object={sceneClone} /> : null;
}

// ------------------- CAMERA FIXE -------------------
function FixedCameraRig() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.copy(FIXED_CAMERA_POSITION);
    camera.fov = FIXED_CAMERA_FOV;
    camera.near = 0.01;
    camera.far = 5000;
    camera.lookAt(FIXED_CAMERA_LOOK_AT);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

// ------------------- BOARD SCENE -------------------
function BoardScene({
  room,
  cells,
  players,
  boardUrl,
  localAvatarConfig,
  localPlayerId,
}) {
  const spacing = 1.2;

  const [blenderReady, setBlenderReady] = useState(false);
  const blenderPathRef = useRef([]);

  const turnPlayerId = room?.state?.turnPlayerId || room?.meta?.hostId || null;

  const entries = useMemo(() => {
    const ids = players ? Object.keys(players) : [];

    return ids.map((id) => {
      const pl = players?.[id] || {};

      const raw =
        pl.gender ??
        pl.sexe ??
        pl.avatarGender ??
        pl.avatar?.gender ??
        pl.avatarConfig?.gender ??
        "";

      const s = String(raw).trim().toLowerCase();

      const gender =
        s === "female" || s === "femme" || s === "f" || s === "woman" || s === "girl"
          ? "female"
          : "male";

      const playerAvatarConfig =
        pl.avatarConfig ||
        pl.avatar ||
        (id === localPlayerId ? localAvatarConfig : null);

      return {
        id,
        pos: getPlayerPos(room, id),
        gender,
        name: pl?.name || pl?.pseudo || id,
        isLocal: id === localPlayerId,
        isTurn: id === turnPlayerId,
        avatarConfig: playerAvatarConfig,
      };
    });
  }, [players, room, localPlayerId, turnPlayerId, localAvatarConfig]);

  const pawnTargets = useMemo(() => {
    const path = blenderPathRef.current;

    return entries.map((p) => {
      const posIndex = Number(p.pos ?? 0);

      if (USE_BLENDER_BOARD && blenderReady && path[posIndex]?.position) {
        return { ...p, target: path[posIndex].position.clone() };
      }

      const [x, z] = idxToXZ(posIndex, spacing);
      return { ...p, target: new THREE.Vector3(x, 0, z) };
    });
  }, [entries, blenderReady]);

  const iconInstances = useMemo(() => {
    const path = blenderPathRef.current;
    if (!USE_BLENDER_BOARD || !blenderReady || !path?.length) return [];

    const out = [];

    for (let i = 0; i < path.length; i++) {
      const entry = path[i];
      if (!entry?.position) continue;

      const visualKey = entry.visualKey;
      const iconUrl = themeToIconUrl(visualKey);
      if (!iconUrl) continue;

      const iconSize = ICON_SIZE_BY_KEY[visualKey] ?? ICON_SIZE;
      const iconYOffset = ICON_Y_OFFSET_BY_KEY[visualKey] ?? ICON_Y_OFFSET;

      out.push({
        key: `icon-${entry.index}-${iconUrl}`,
        url: iconUrl,
        size: iconSize,
        position: new THREE.Vector3(
          entry.position.x,
          entry.position.y + iconYOffset,
          entry.position.z
        ),
      });
    }

    return out;
  }, [blenderReady]);

  return (
    <>
      <color attach="background" args={["#060A14"]} />

      <ambientLight intensity={0.72} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.15}
        castShadow={ENABLE_SHADOWS}
      />
      <Environment preset="warehouse" />

      <FixedCameraRig />

      <Suspense fallback={null}>
        <BlenderBoard
          url={boardUrl}
          onReady={({ ok, data }) => {
            blenderPathRef.current = data || [];
            setBlenderReady(!!ok);
          }}
        />
      </Suspense>

      {iconInstances.map((ic) => (
        <Suspense key={ic.key} fallback={null}>
          <ThemeIcon url={ic.url} position={ic.position} size={ic.size} />
        </Suspense>
      ))}

      {pawnTargets.map((p) => {
        const extraStartOffset =
          Number(p.pos ?? 0) === 0 ? START_EXTRA_OFFSET : [0, 0, 0];

        const worldPosition = [
          p.target.x + CHAR_LOCAL_OFFSET[0] + extraStartOffset[0],
          (p.target.y ?? 0) + CHAR_LOCAL_OFFSET[1] + extraStartOffset[1],
          p.target.z + CHAR_LOCAL_OFFSET[2] + extraStartOffset[2],
        ];

        return (
          <AnimatedPawn
            key={p.id}
            target={new THREE.Vector3(...worldPosition)}
            rotation={[CHAR_ROT_X, CHAR_ROT_Y, CHAR_ROT_Z]}
            speed={2.8}
          >
            {(isMoving) => (
              <>
                {p.isTurn && <ActiveHalo />}
                <PlayerNameTag name={p.name} />

                {p.avatarConfig ? (
                  <BoardAvatar
                    avatarConfig={p.avatarConfig}
                    position={AVATAR_VISUAL_OFFSET}
                    rotation={[0, 0, 0]}
                    scale={0.95}
                    isMoving={isMoving}
                  />
                ) : USE_CHARACTER_3D ? (
                  <Suspense fallback={null}>
                    <Character3D
                      key={`${p.id}-${p.gender}`}
                      url={p.gender === "female" ? MODEL_FEMALE_URL : MODEL_MALE_URL}
                      isMoving={isMoving}
                      targetHeight={1.55}
                      yOffset={0.0}
                    />
                  </Suspense>
                ) : null}
              </>
            )}
          </AnimatedPawn>
        );
      })}
    </>
  );
}

function AnimatedPawn({ target, rotation, children, speed = 2.4 }) {
  const ref = useRef();
  const [isMoving, setIsMoving] = useState(false);

  useFrame((_, delta) => {
    if (!ref.current || !target) return;

    const current = ref.current.position;
    const dist = current.distanceTo(target);

    if (dist > 0.01) {
      const step = Math.min(1, (speed * delta) / dist);
      current.lerp(target, step);
      setIsMoving(true);
    } else {
      current.copy(target);
      if (isMoving) setIsMoving(false);
    }
  });

  return (
    <group ref={ref} rotation={rotation}>
      {typeof children === "function" ? children(isMoving) : children}
    </group>
  );
}

// ------------------- EXPORT -------------------
export default function CollectifBoard3D({ room, className = "" }) {
  const { character } = useCharacter();
  const localPlayerId = useMemo(() => getPlayerId(), []);
  const localAvatarConfig = character?.avatarConfig || null;

  const size = Number(room?.board?.size || 66);
  const cells = useMemo(
    () => normalizeCells(room?.board?.cells, size),
    [room?.board?.cells, size]
  );
  const players = room?.players || {};

  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/5 overflow-hidden",
        className,
      ].join(" ")}
    >
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="font-display tracking-[0.14em] text-xs text-white/70">
          PLATEAU 3D {USE_BLENDER_BOARD ? "(Blender)" : "(prototype)"}
        </div>
      </div>

      <div className="h-[78vh] min-h-[720px]">
        <Canvas
          shadows={ENABLE_SHADOWS}
          camera={{
            position: [12.8, 8.6, 13.8],
            fov: 28,
            near: 0.01,
            far: 5000,
          }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
        >
          <BoardScene
            room={room}
            cells={cells}
            players={players}
            boardUrl={BLENDER_URL}
            localAvatarConfig={localAvatarConfig}
            localPlayerId={localPlayerId}
          />
        </Canvas>
      </div>
    </div>
  );
}

useGLTF.preload(BLENDER_URL);