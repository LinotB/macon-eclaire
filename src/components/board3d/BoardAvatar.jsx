import React, { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import AvatarModel from "../avatar3d/AvatarModel";

function AnimatedAvatarGroup({
  isMoving = false,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.85,
  children,
}) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.getElapsedTime();

    // base
    ref.current.position.x = position[0];
    ref.current.position.z = position[2];
    ref.current.rotation.y = rotation[1];
    ref.current.scale.setScalar(scale);

    if (isMoving) {
      const bounce = Math.abs(Math.sin(t * 10)) * 0.055;
      const pitch = Math.sin(t * 10) * 0.10;
      const roll = Math.sin(t * 10) * 0.06;
      const side = Math.sin(t * 5) * 0.018;

      ref.current.position.y = position[1] + bounce;
      ref.current.position.x = position[0] + side;

      ref.current.rotation.x = rotation[0] + pitch;
      ref.current.rotation.z = rotation[2] + roll;
    } else {
      ref.current.position.y += (position[1] - ref.current.position.y) * 0.18;
      ref.current.position.x += (position[0] - ref.current.position.x) * 0.18;

      ref.current.rotation.x += (rotation[0] - ref.current.rotation.x) * 0.18;
      ref.current.rotation.z += (rotation[2] - ref.current.rotation.z) * 0.18;
    }
  });

  return <group ref={ref}>{children}</group>;
}

export default function BoardAvatar({
  avatarConfig,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.85,
  isMoving = false,
}) {
  if (!avatarConfig) return null;

  return (
    <AnimatedAvatarGroup
      position={position}
      rotation={rotation}
      scale={scale}
      isMoving={isMoving}
    >
      <Suspense fallback={null}>
        <AvatarModel
          gender={avatarConfig.gender || "male"}
          apron={avatarConfig.apron || "Apprenti"}
          neckAdornmentType={avatarConfig.neckAdornmentType || "none"}
          selectedSautoir={
            avatarConfig.selectedSautoir || "Sautoire_couvreur"
          }
        />
      </Suspense>
    </AnimatedAvatarGroup>
  );
}