import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useFBX } from "@react-three/drei";

// ---- Helpers ----
function findBones(root) {
  const bones = [];
  root.traverse((o) => {
    if (o?.isBone) bones.push(o);
  });
  return bones;
}

function pickBone(bones, includesAll = [], includesAny = []) {
  const lowerAll = includesAll.map((s) => s.toLowerCase());
  const lowerAny = includesAny.map((s) => s.toLowerCase());
  return (
    bones.find((b) => {
      const n = b.name.toLowerCase();
      const okAll = lowerAll.every((k) => n.includes(k));
      const okAny = lowerAny.length === 0 ? true : lowerAny.some((k) => n.includes(k));
      return okAll && okAny;
    }) || null
  );
}

function applyIdleArmsDown(arm) {
  const DEG = Math.PI / 180;

  // ✅ réglages
  const IDLE_UPPER_X = 70 * DEG;
  const IDLE_UPPER_Z = 0 * DEG;
  const IDLE_LOWER_X = 0 * DEG;

  if (arm.leftUpper) {
    arm.leftUpper.rotation.set(0, 0, 0);
    arm.leftUpper.rotation.x += IDLE_UPPER_X;
    arm.leftUpper.rotation.z += IDLE_UPPER_Z;
  }
  if (arm.rightUpper) {
    arm.rightUpper.rotation.set(0, 0, 0);
    arm.rightUpper.rotation.x += IDLE_UPPER_X;
    arm.rightUpper.rotation.z -= IDLE_UPPER_Z;
  }
  if (arm.leftLower) {
    arm.leftLower.rotation.set(0, 0, 0);
    arm.leftLower.rotation.x += IDLE_LOWER_X;
  }
  if (arm.rightLower) {
    arm.rightLower.rotation.set(0, 0, 0);
    arm.rightLower.rotation.x += IDLE_LOWER_X;
  }
}

function prepareFbxForRender(fbx) {
  if (!fbx) return;

  // Mesh settings
  fbx.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = true;

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.filter(Boolean).forEach((m) => {
      if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
      m.side = THREE.DoubleSide;

      // parfois FBX => transparence / depth issues
      if (m.transparent) m.depthWrite = false;

      m.needsUpdate = true;
    });
  });
}

export default function Character3D({
  url,
  fallbackUrl = null,         // ✅ si le modèle principal échoue
  scale = 0.04,
  yOffset = 0.15,
  isMoving = false,
  walkSpeed = 1.2,
  debugBones = false,
}) {
  const group = useRef();

  // ✅ on essaye d'abord url, si fail on bascule vers fallbackUrl
  const [activeUrl, setActiveUrl] = useState(url);

  useEffect(() => {
    setActiveUrl(url);
  }, [url]);

  // ✅ try/catch du loader: useFBX throw si ça échoue
  let fbx = null;
  let loadError = null;
  try {
    fbx = useFBX(activeUrl);
  } catch (e) {
    loadError = e;
  }

  // ✅ si échec et fallback disponible => switch
  useEffect(() => {
    if (!loadError) return;

    console.error("❌ FBX load failed:", activeUrl, loadError);

    if (fallbackUrl && activeUrl !== fallbackUrl) {
      console.warn("↩️ fallback to:", fallbackUrl);
      setActiveUrl(fallbackUrl);
    }
  }, [loadError, activeUrl, fallbackUrl]);

  const mixerRef = useRef(null);

  const armRef = useRef({
    leftUpper: null,
    rightUpper: null,
    leftLower: null,
    rightLower: null,
  });

  // ✅ setup FBX + mixer + bones
  useEffect(() => {
    if (!fbx) return;

    prepareFbxForRender(fbx);

    fbx.scale.set(scale, scale, scale);
    fbx.position.y = yOffset;

    mixerRef.current = new THREE.AnimationMixer(fbx);

    const bones = findBones(fbx);

    if (debugBones) {
      console.log("=== BONES for", activeUrl, "===");
      bones.forEach((b) => console.log(b.name));
      console.log("=== /BONES ===");
    }

    const leftUpper =
      pickBone(bones, ["left", "upperarm"]) ||
      pickBone(bones, ["mixamorig", "leftarm"]) ||
      pickBone(bones, ["upperarm"], ["left", "l"]);

    const rightUpper =
      pickBone(bones, ["right", "upperarm"]) ||
      pickBone(bones, ["mixamorig", "rightarm"]) ||
      pickBone(bones, ["upperarm"], ["right", "r"]);

    const leftLower =
      pickBone(bones, ["left", "lowerarm"]) ||
      pickBone(bones, ["left", "forearm"]) ||
      pickBone(bones, ["lowerarm"], ["left", "l"]);

    const rightLower =
      pickBone(bones, ["right", "lowerarm"]) ||
      pickBone(bones, ["right", "forearm"]) ||
      pickBone(bones, ["lowerarm"], ["right", "r"]);

    armRef.current = { leftUpper, rightUpper, leftLower, rightLower };

    return () => {
      mixerRef.current?.stopAllAction();
      mixerRef.current = null;
    };
  }, [fbx, scale, yOffset, debugBones, activeUrl]);

  // ✅ animation: on joue le premier clip si existe
  useEffect(() => {
    if (!fbx) return;
    const clip = fbx.animations?.[0];
    if (!clip || !mixerRef.current) return;

    const action = mixerRef.current.clipAction(clip, group.current);

    if (isMoving) {
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
      action.timeScale = walkSpeed;
    } else {
      action.stop();
    }

    return () => action.stop();
  }, [fbx, isMoving, walkSpeed]);

  useFrame((_, delta) => {
    if (!fbx) return;

    if (isMoving) {
      mixerRef.current?.update(delta);
      return;
    }

    applyIdleArmsDown(armRef.current);
    fbx.updateMatrixWorld(true);
  });

  // ✅ si même le fallback échoue : rien (mais tu verras l’erreur console)
  if (!fbx) return null;

  return <primitive ref={group} object={fbx} />;
}