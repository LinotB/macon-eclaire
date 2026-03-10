import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import AvatarModel from "./AvatarModel";

function AvatarScene({ gender, apron, neckAdornmentType, selectedSautoir }) {
  return (
    <>
      <ambientLight intensity={1.15} />

      <directionalLight
        position={[4, 6, 5]}
        intensity={1.35}
        castShadow
      />

      <directionalLight
        position={[-3, 4, 2]}
        intensity={0.55}
      />

      <Environment preset="studio" />

      <Suspense fallback={null}>
        <AvatarModel
          gender={gender}
          apron={apron}
          neckAdornmentType={neckAdornmentType}
          selectedSautoir={selectedSautoir}
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={2.2}
        maxDistance={6}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0.95, 0]}
      />
    </>
  );
}

export default function AvatarPreview3D({
  gender = "male",
  apron = "Apprenti",
  neckAdornmentType = "none",
  selectedSautoir = "Sautoire_couvreur",
}) {
  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-white/10 bg-black/20">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{ position: [0, 1.15, 3.4], fov: 35, near: 0.01, far: 100 }}
      >
        <AvatarScene
          gender={gender}
          apron={apron}
          neckAdornmentType={neckAdornmentType}
          selectedSautoir={selectedSautoir}
        />
      </Canvas>
    </div>
  );
}