import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useFBX } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

/**
 * Charge:
 * - un FBX "character" (mesh + skeleton)
 * - un FBX "walk" (animation)
 *
 * Important: Mixamo FBX = souvent très grand => scale petit (0.01 / 0.001)
 */
export default function CharacterPawn({
  modelUrl,
  animUrl,
  scale = 0.01,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  playing = true,
}) {
  const group = useRef();

  // 1) Charger le modèle
  const fbxModel = useFBX(modelUrl);

  // 2) Charger l’anim (un autre FBX Mixamo)
  const fbxAnim = useFBX(animUrl);

  // 3) Cloner le modèle pour éviter les conflits entre joueurs
  const cloned = useMemo(() => SkeletonUtils.clone(fbxModel), [fbxModel]);

  // 4) Récupérer les clips d’anim
  const clips = useMemo(() => {
    // Mixamo met souvent l’anim dans fbxAnim.animations[0]
    return fbxAnim?.animations?.length ? fbxAnim.animations : [];
  }, [fbxAnim]);

  const { actions, names } = useAnimations(clips, group);

  useEffect(() => {
    if (!actions || !names?.length) return;

    // Jouer la 1ère anim (souvent "mixamo.com" ou "Walking")
    const name = names[0];
    const a = actions[name];
    if (!a) return;

    if (playing) {
      a.reset().fadeIn(0.15).play();
    } else {
      a.fadeOut(0.15);
    }

    return () => {
      a.stop();
    };
  }, [actions, names, playing]);

  // Shadows
  useEffect(() => {
    cloned.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) o.material.side = THREE.DoubleSide;
      }
    });
  }, [cloned]);

  // Petit “tick” pour garder l’anim fluide (useAnimations le fait déjà, mais safe)
  useFrame(() => {});

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      <primitive object={cloned} />
    </group>
  );
}