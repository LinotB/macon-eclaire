import React, { Suspense } from "react";
import AvatarModel from "../avatar3d/AvatarModel";

export default function BoardAvatar({
  avatarConfig,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.85,
}) {
  if (!avatarConfig) return null;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Suspense fallback={null}>
        <AvatarModel
          gender={avatarConfig.gender || "male"}
          apron={avatarConfig.apron || "Apprenti"}
          neckAdornmentType={avatarConfig.neckAdornmentType || "none"}
          selectedSautoir={avatarConfig.selectedSautoir || "Sautoire_couvreur"}
        />
      </Suspense>
    </group>
  );
}