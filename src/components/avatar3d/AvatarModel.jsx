import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

function collectMeshBounds(root) {
  const box = new THREE.Box3();
  let found = false;

  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.updateWorldMatrix(true, false);
    const objBox = new THREE.Box3().setFromObject(obj);
    if (!objBox.isEmpty()) {
      box.union(objBox);
      found = true;
    }
  });

  return found ? box : null;
}

function setVisibilityByNames(root, names, visible) {
  root.traverse((obj) => {
    if (!obj?.name) return;
    if (names.includes(obj.name)) {
      obj.visible = visible;
    }
  });
}

export default function AvatarModel({
  gender = "male",
  apron = "Apprenti",
  neckAdornmentType = "none",
  selectedSautoir = "Sautoire_couvreur",
}) {
  const url =
    gender === "female"
      ? "/models/avatar/female_base.glb"
      : "/models/avatar/male_base.glb";

  const { scene } = useGLTF(url);

  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((obj) => {
      if (!obj.isMesh) return;

      obj.castShadow = true;
      obj.receiveShadow = true;
      obj.frustumCulled = false;

      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.filter(Boolean).forEach((m) => {
        if (m.map) {
          m.map.colorSpace = THREE.SRGBColorSpace;
          m.map.needsUpdate = true;
        }

        m.side = THREE.DoubleSide;

        if ("roughness" in m) m.roughness = 0.85;
        if ("metalness" in m) m.metalness = 0.02;

        m.needsUpdate = true;
      });
    });

    clone.rotation.set(0, Math.PI / 2, 0);
    clone.position.set(0, -0.02, 0);
    clone.scale.setScalar(1.0);

    clone.updateWorldMatrix(true, true);

    const box = collectMeshBounds(clone);
    if (!box) return clone;

    const center = box.getCenter(new THREE.Vector3());
    clone.position.x -= center.x;
    clone.position.z -= center.z;

    clone.updateWorldMatrix(true, true);

    const box2 = collectMeshBounds(clone);
    if (!box2) return clone;

    clone.position.y -= box2.min.y;

    clone.updateWorldMatrix(true, true);

    const box3 = collectMeshBounds(clone);
    if (!box3) return clone;

    const size3 = box3.getSize(new THREE.Vector3());
    const targetHeight = 1.8;
    const currentHeight = size3.y || 1;
    const s = targetHeight / currentHeight;

    clone.scale.multiplyScalar(s);
    clone.updateWorldMatrix(true, true);

    return clone;
  }, [scene]);

  useEffect(() => {
    if (!model) return;

    const apronNames = [
      "Tablier_Apprenti",
      "Tablier_Compagnon",
      "Tablier_Maitre",
    ];

    const cordonNames = [
      "Cordon_Maitre",
    ];

    const sautoirNames = [
      "Sautoire_couvreur",
      "Sautoire_expert",
      "Sautoire_harmonie",
      "Sautoire_hospitalier",
      "Sautoire_maitre_banquet",
      "Sautoire_maitre_ceremonie",
      "Sautoire_orateur",
      "Sautoire_premier_surveillant",
      "Sautoire_second_surveillant",
      "Sautoire_secretaire",
      "Sautoire_tresorier",
      "Sautoire_VM",
    ];

    setVisibilityByNames(model, apronNames, false);
    setVisibilityByNames(model, cordonNames, false);
    setVisibilityByNames(model, sautoirNames, false);

    if (apron === "Apprenti") {
      setVisibilityByNames(model, ["Tablier_Apprenti"], true);
    } else if (apron === "Compagnon") {
      setVisibilityByNames(model, ["Tablier_Compagnon"], true);
    } else if (apron === "Maitre") {
      setVisibilityByNames(model, ["Tablier_Maitre"], true);
    }

    if (neckAdornmentType === "cordon") {
      setVisibilityByNames(model, ["Cordon_Maitre"], true);
    } else if (neckAdornmentType === "sautoire") {
      setVisibilityByNames(model, [selectedSautoir], true);
    }
  }, [model, apron, neckAdornmentType, selectedSautoir]);

  return <primitive object={model} />;
}

useGLTF.preload("/models/avatar/male_base.glb");
useGLTF.preload("/models/avatar/female_base.glb");