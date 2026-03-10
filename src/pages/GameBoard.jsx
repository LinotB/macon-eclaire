// src/pages/GameBoard.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom, seedBoard } from "../services/rtdb";
import { getPlayerId } from "../utils/playerId";
import { useCharacter } from "../context/CharacterContext";

export default function GameBoard() {
  const nav = useNavigate();
  const { character } = useCharacter();

  const playerId = useMemo(() => getPlayerId(), []);
  const [roomId, setRoomId] = useState("");

  // ✅ on envoie TOUT ce qu’il faut à la room
  const player = useMemo(
    () => ({
      name: character?.pseudo || "Initié",
      grade: character?.grade || "Apprenti",
      rite: character?.rite || "",

      // Ancien système (si tu l’utilises encore quelque part)
      avatarUrl: character?.avatarUrl || "",

      // ✅ Nouveau système (avatar créé)
      avatarPng: character?.avatarPng || "", // dataURL PNG
      avatarConfig: character?.avatarConfig || null, // optionnel mais pratique

      // Optionnel: si tu utilises aussi appearance ailleurs
      appearance: character?.appearance || null,
    }),
    [character]
  );

  const onCreate = async () => {
    const id = await createRoom({ hostId: playerId, name: "Partie Collective" });

    // ✅ (optionnel mais conseillé) génère/écrit le plateau complet dans Firebase
    await seedBoard(id);

    // ✅ join avec avatar
    await joinRoom({ roomId: id, playerId, player });

    nav(`/game-board/${id}`);
  };

  const onJoin = async () => {
    const id = roomId.trim();
    if (!id) return;

    // ✅ join avec avatar
    await joinRoom({ roomId: id, playerId, player });

    nav(`/game-board/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="font-display text-3xl">Mode Collectif</h1>

        <button
          onClick={onCreate}
          className="w-full bg-[#D4AF37] text-black rounded-md py-3 font-display tracking-[0.12em]"
        >
          CRÉER UNE PARTIE
        </button>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-white/60 text-sm mb-2">Rejoindre une partie :</div>

          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="ROOM ID (ex: -Nsx...)"
            className="w-full rounded-md bg-black/30 border border-white/10 px-4 py-3 text-white"
          />

          <button
            onClick={onJoin}
            className="mt-3 w-full bg-white/10 hover:bg-white/15 rounded-md py-3 font-display tracking-[0.12em]"
          >
            REJOINDRE
          </button>
        </div>
      </div>
    </div>
  );
}