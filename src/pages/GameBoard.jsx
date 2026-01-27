// src/pages/GameBoard.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "../services/rtdb";
import { getPlayerId } from "../utils/playerId";
import { useCharacter } from "../context/CharacterContext";

export default function GameBoard() {
  const nav = useNavigate();
  const { character } = useCharacter();

  const playerId = useMemo(() => getPlayerId(), []);
  const [roomId, setRoomId] = useState("");

  const player = {
    name: character?.pseudo || "Initié",
    avatarUrl: character?.avatarUrl || "",
    grade: character?.grade || "Apprenti",
  };

  const onCreate = async () => {
    const id = await createRoom({ hostId: playerId, name: "Partie Collective" });
    await joinRoom({ roomId: id, playerId, player });
    nav(`/game-board/${id}`);
  };

  const onJoin = async () => {
    if (!roomId.trim()) return;
    await joinRoom({ roomId: roomId.trim(), playerId, player });
    nav(`/game-board/${roomId.trim()}`);
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
