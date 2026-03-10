import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Billboard,
  useTexture,
  Text,
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

// Affichage fallback pour les autres joueurs
const USE_CHARACTER_3D = false;

const AVATAR_VISUAL_OFFSET = [0.10, 0.0, -0.06];

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

const ICON_Y_OFFSET = 0.1;
const ICON_SIZE = 0.34;

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
    .replace(/[éèê]/g, "e")
    .replace(/[àâ]/g, "a")
    .replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o")
    .replace(/[ùûü]/g, "u");
}

function isQuizTheme(theme) {
  const t = normalizeThemeKey(theme);
  return t === "quiz" || t === "mix" || t === "aleatoire" || t === "aléatoire";
}

function resolveCellVisualKey(cell) {
  const type = normalizeThemeKey(cell?.type);
  const theme = normalizeThemeKey(cell?.theme);

  // départ / arrivée
  if (type === "start" || theme === "depart") return "depart";
  if (type === "arrivee" || type === "arrival" || theme === "arrivee") return "arrivee";

  // quiz
  if (
    type === "quiz" ||
    theme === "quiz" ||
    theme === "mix" ||
    theme === "aleatoire" ||
    theme === "aléatoire"
  ) {
    return "quiz";
  }

  // défi
  if (type === "defi" || type === "defis" || theme === "defi" || theme === "defis") {
    return "defi";
  }

  // événement
  if (
    type === "evenement" ||
    type === "event" ||
    theme === "evenement" ||
    theme === "evenements" ||
    theme === "event" ||
    theme === "events" ||
    theme === "evt"
  ) {
    return "evenement";
  }

  // augmentation
  if (
    type === "augmentation" ||
    theme === "augmentation" ||
    theme === "augmentation salaire" ||
    theme === "augmentation de salaire" ||
    theme === "augmentationation"
  ) {
    return "augmentation";
  }

  // cabinet
  if (
    type === "cabinet" ||
    theme === "cabinet" ||
    theme === "cabinet reflexion" ||
    theme === "cabinet de reflexion"
  ) {
    return "cabinet";
  }

  // thèmes classiques
  if (theme === "symbole" || theme === "symboles") return "symbole";
  if (theme === "rituel" || theme === "rituels") return "rituel";
  if (theme === "histoire") return "histoire";

  if (
    theme === "constitution" ||
    theme === "constitutions" ||
    theme === "reglement" ||
    theme === "reglements" ||
    theme === "constitution reglement" ||
    theme === "constitution reglement interieur"
  ) {
    return "reglement";
  }

  return "symbole";
}

function themeToColor(theme) {
  const t = normalizeThemeKey(theme);

  if (t === "quiz") return new THREE.Color("#111827");
  if (t === "depart") return new THREE.Color("#8e8f93");
  if (t === "arrivee") return new THREE.Color("#d4af37");
  if (t === "augmentation") return new THREE.Color("#d9d9d9");
  if (t === "cabinet") return new THREE.Color("#2b2b2b");
  if (t === "symbole") return new THREE.Color("#6b3fa0");
  if (t === "histoire") return new THREE.Color("#2f6f2e");
  if (t === "reglement") return new THREE.Color("#d98c1a");
  if (t === "rituel") return new THREE.Color("#3c5e97");
  if (t === "defi") return new THREE.Color("#c0472d");
  if (t === "evenement") return new THREE.Color("#bfc3c9");

  return new THREE.Color("#94a3b8");
}

function themeToEmissive(theme) {
  const t = normalizeThemeKey(theme);

  if (t === "arrivee") return new THREE.Color("#6b4e00");
  if (t === "depart") return new THREE.Color("#1f2937");
  if (t === "quiz") return new THREE.Color("#0b1220");

  return new THREE.Color("#000000");
}

function themeToIconUrl(visualKey) {
  const t = normalizeThemeKey(visualKey);
  if (isQuizTheme(t)) return THEME_ICONS.quiz;
  return THEME_ICONS[t] || null;
}

// ------------------- THEME ICON -------------------
function ThemeIcon({ url, position, size = ICON_SIZE }) {
  const [isValid, setIsValid] = useState(true);
  let tex = null;

  try {
    tex = useTexture(isValid ? url : null);
  } catch (e) {
    if (isValid) {
      console.warn("Icône introuvable :", url, e);
      setIsValid(false);
    }
  }

  useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
  }, [tex]);

  if (!tex || !isValid) return null;

  return (
    <Billboard position={position} follow>
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial
          map={tex}
          transparent
          alphaTest={0.1}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </Billboard>
  );
}

// ------------------- HALO JOUEUR ACTIF -------------------
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

// ------------------- PSEUDO JOUEUR -------------------
function PlayerNameTag({ name }) {
  if (!name) return null;

  return (
    <Billboard position={[0, 1.90, 0]} follow>
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

// ------------------- BlenderBoard -------------------
function BlenderBoard({ url, themeByIndex, onReady, onFit }) {
  const { scene } = useGLTF(url);
  const sceneClone = useMemo(() => scene.clone(true), [scene]);
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!sceneClone) return;
    if (didInitRef.current) return;

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

    const box2 = new THREE.Box3().setFromObject(sceneClone);
    const size2 = box2.getSize(new THREE.Vector3());
    const radius = Math.max(size2.x, size2.y, size2.z) || 30;

    const cases = [];
    sceneClone.traverse((o) => {
      if (!o?.name) return;
      const n = o.name.toLowerCase();
      if (!n.startsWith("case_")) return;

      cases.push(o);

      const idx = parseInt(o.name.split("_")[1], 10);
      const visualKey = themeByIndex?.get(idx);

      if (o.isMesh && visualKey != null) {
        const col = themeToColor(visualKey);
        const em = themeToEmissive(visualKey);

        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const cloned = mats.map((m) => {
          if (!m) return m;
          const mm = m.clone();
          mm.map = null;
          if (mm.color) mm.color = col.clone();
          if (mm.emissive) mm.emissive = em.clone();
          mm.emissiveIntensity = 0.18;
          mm.roughness = 0.68;
          mm.metalness = 0.04;
          mm.needsUpdate = true;
          return mm;
        });

        o.material = Array.isArray(o.material) ? cloned : cloned[0];
      }
    });

    if (!cases.length) {
      console.error("❌ Aucun objet case_* trouvé dans le GLB.");
      onReady?.({ ok: false, data: [] });
      onFit?.({ ok: false, radius });
      return;
    }

    cases.sort(
      (a, b) => parseInt(a.name.split("_")[1], 10) - parseInt(b.name.split("_")[1], 10)
    );

    console.log("CASES BLENDER", cases.map((c) => c.name));

    const tmp = new THREE.Vector3();
    const data = cases.map((obj) => {
      const centerPos = obj.getWorldPosition(tmp.clone());
      const caseBox = new THREE.Box3().setFromObject(obj);

      return {
        position: new THREE.Vector3(centerPos.x, caseBox.max.y, centerPos.z),
      };
    });

    didInitRef.current = true;

    onReady?.({ ok: true, data });
    onFit?.({ ok: true, radius });
  }, [sceneClone, themeByIndex, onReady, onFit]);

  return sceneClone ? <primitive object={sceneClone} /> : null;
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
  const controlsRef = useRef();
  const didInitialFitRef = useRef(false);

  const themeByIndex = useMemo(() => {
    const m = new Map();

    (cells || []).forEach((c, i) => {
      const visualKey = resolveCellVisualKey(c);

      console.log("CASE", i, {
        rawType: c?.type,
        rawTheme: c?.theme,
        visualKey,
      });

      m.set(i, visualKey);
    });

    return m;
  }, [cells]);

  const turnPlayerId = room?.state?.turnPlayerId || room?.meta?.hostId || null;

  const entries = useMemo(() => {
    const ids = players ? Object.keys(players) : [];
    return ids.map((id) => {
      const pl = players?.[id] || {};
      const raw = pl.gender ?? pl.sexe ?? pl.avatarGender ?? pl.avatar?.gender ?? "";
      const s = String(raw).trim().toLowerCase();

      const gender =
        s === "female" || s === "femme" || s === "f" || s === "woman" || s === "girl"
          ? "female"
          : "male";

      return {
        id,
        pos: getPlayerPos(room, id),
        gender,
        name: pl?.name || pl?.pseudo || id,
        isLocal: id === localPlayerId,
        isTurn: id === turnPlayerId,
      };
    });
  }, [players, room, localPlayerId, turnPlayerId]);

  const pawnTargets = useMemo(() => {
    const path = blenderPathRef.current;

    return entries.map((p) => {
      const posIndex = Number(p.pos ?? 0);

      if (USE_BLENDER_BOARD && blenderReady && path[posIndex]) {
        return { ...p, target: path[posIndex].clone() };
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
      const pos = path[i];
      if (!pos) continue;

      const visualKey = themeByIndex.get(i);
      const iconUrl = themeToIconUrl(visualKey);
      if (!iconUrl) continue;

      out.push({
        key: `icon-${i}-${iconUrl}`,
        url: iconUrl,
        position: new THREE.Vector3(pos.x, (pos.y ?? 0) + ICON_Y_OFFSET, pos.z),
      });
    }

    return out;
  }, [themeByIndex, blenderReady]);

  return (
    <>
      <color attach="background" args={["#060A14"]} />

      <ambientLight intensity={1.15} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={2.1}
        castShadow={ENABLE_SHADOWS}
      />
      <Environment preset="city" />

      <Suspense fallback={null}>
        <BlenderBoard
          url={boardUrl}
          themeByIndex={themeByIndex}
          onReady={({ ok, data }) => {
            blenderPathRef.current = (data || []).map((d) => d.position);
            setBlenderReady(!!ok);
          }}
          onFit={({ radius }) => {
            if (!controlsRef.current) return;
            if (didInitialFitRef.current) return;

            const r = Math.max(10, Number(radius) || 30);

            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.object.position.set(0, r * 0.72, r * 1.32);
            controlsRef.current.update();

            didInitialFitRef.current = true;
          }}
        />
      </Suspense>

      {iconInstances.map((ic) => (
        <Suspense key={ic.key} fallback={null}>
          <ThemeIcon url={ic.url} position={ic.position} size={ICON_SIZE} />
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
          <group
            key={p.id}
            position={worldPosition}
            rotation={[CHAR_ROT_X, CHAR_ROT_Y, CHAR_ROT_Z]}
          >
            {p.isTurn && <ActiveHalo />}

            <PlayerNameTag name={p.name} />

            {p.isLocal && localAvatarConfig ? (
              <BoardAvatar
                avatarConfig={localAvatarConfig}
                position={AVATAR_VISUAL_OFFSET}
                rotation={[0, 0, 0]}
                scale={0.95}
              />
            ) : USE_CHARACTER_3D ? (
              <Suspense fallback={null}>
                <Character3D
                  key={`${p.id}-${p.gender}`}
                  url={p.gender === "female" ? MODEL_FEMALE_URL : MODEL_MALE_URL}
                  isMoving={false}
                  targetHeight={1.55}
                  yOffset={0.0}
                />
              </Suspense>
            ) : null}
          </group>
        );
      })}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        enableRotate
        enableZoom
        minDistance={5}
        maxDistance={400}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
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
          camera={{ position: [0, 22, 30], fov: 38, near: 0.01, far: 5000 }}
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