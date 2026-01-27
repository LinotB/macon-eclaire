// src/services/rtdb.js
import { db } from "../firebase";
import {
  ref,
  set,
  update,
  push,
  onValue,
  off,
  serverTimestamp,
  onDisconnect,
  get,
} from "firebase/database";

/* ======================================================
   ROOM & PRÉSENCE
   ====================================================== */

export async function createRoom({ hostId, name = "Partie collective" }) {
  const roomRef = push(ref(db, "rooms"));
  const roomId = roomRef.key;

  await set(roomRef, {
    meta: {
      name,
      hostId,
      createdAt: serverTimestamp(),
    },
    players: {},
    board: {
      positions: {},
    },
    state: {
      phase: "lobby",      // lobby | playing
      turnPlayerId: hostId,
      qStatus: "idle",     // idle | running
      qCard: null,         // ✅ on garde la dernière carte en idle (donc on ne l'efface pas dans finishQuestion)
      qEndsAt: 0,
    },
    answers: {},
  });

  return roomId;
}

export async function joinRoom({ roomId, playerId, player }) {
  const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);

  await set(playerRef, {
    ...player,
    connected: true,
    joinedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  });

  // présence : si l’onglet ferme => connected false
  onDisconnect(playerRef).update({
    connected: false,
    lastSeen: serverTimestamp(),
  });
}

export async function heartbeat({ roomId, playerId }) {
  await update(ref(db, `rooms/${roomId}/players/${playerId}`), {
    connected: true,
    lastSeen: serverTimestamp(),
  });
}

export function listenRoom(roomId, callback) {
  const roomRef = ref(db, `rooms/${roomId}`);
  onValue(roomRef, (snap) => callback(snap.val()));
  return () => off(roomRef);
}

/* ======================================================
   ÉTAT DU JEU
   ====================================================== */

export async function updateState(roomId, patch) {
  await update(ref(db, `rooms/${roomId}/state`), patch);
}

export async function setPosition(roomId, playerId, pos) {
  await set(ref(db, `rooms/${roomId}/board/positions/${playerId}`), pos);
}

/* ======================================================
   QUESTIONS COLLECTIVES
   ====================================================== */

// 🔹 lancer une question (HOST)
export async function startQuestion(roomId, card, durationSec = 20) {
  const endsAt = Date.now() + durationSec * 1000;

  // state : running + carte + timer
  await update(ref(db, `rooms/${roomId}/state`), {
    qStatus: "running",
    qCard: card,
    qEndsAt: endsAt,
  });

  // reset réponses
  await set(ref(db, `rooms/${roomId}/answers`), {});
}

// 🔹 un joueur choisit une réponse (stockée)
export async function submitAnswer(roomId, playerId, pickedIndex) {
  await set(ref(db, `rooms/${roomId}/answers/${playerId}`), {
    picked: pickedIndex,
    at: serverTimestamp(),
  });
}

// 🔹 fin immédiate (validation ou chrono)
export async function finishQuestion(roomId) {
  const roomRef = ref(db, `rooms/${roomId}`);
  const snap = await get(roomRef);
  const room = snap.val();
  if (!room) return;

  // si déjà idle => rien
  if (room.state?.qStatus !== "running") return;

  // stop question
  // ⚠️ On garde qCard pour afficher la dernière question en idle (comme dans ton JSX)
  await update(ref(db, `rooms/${roomId}/state`), {
    qStatus: "idle",
    qEndsAt: 0,
  });

  // joueur suivant (connectés)
  const playersObj = room.players || {};
  const ids = Object.keys(playersObj).filter((id) => playersObj[id]?.connected);

  if (!ids.length) return;

  const current = room.state?.turnPlayerId;
  const idx = ids.indexOf(current);
  const nextId = ids[(idx + 1) % ids.length];

  await update(ref(db, `rooms/${roomId}/state`), {
    turnPlayerId: nextId,
  });
}
