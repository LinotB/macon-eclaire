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
   Helpers
   ====================================================== */

function randDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function clampPos(pos, size) {
  const p = Number(pos) || 0;
  const s = Number(size) || 66;
  if (p < 0) return 0;
  if (p > s - 1) return s - 1;
  return p;
}

export function pickQuizTheme() {
  const themes = ["symboles", "rituels", "histoire", "reglement", "defis"];
  return themes[Math.floor(Math.random() * themes.length)];
}

async function nextTurn(roomId, room) {
  const order = Array.isArray(room?.state?.turnOrder) ? room.state.turnOrder : [];
  if (!order.length) return;

  const current = room?.state?.turnPlayerId;
  const idx = order.indexOf(current);
  const nextId = order[(idx + 1) % order.length];

  await update(ref(db, `rooms/${roomId}/state`), {
    turnPlayerId: nextId,
    turnStage: "roll",
    currentActorId: null,
    currentCell: null,
    actionNeedCard: false,
  });
}

/* ======================================================
   ROOM / PRESENCE
   ====================================================== */

export async function createRoom({ hostId, name = "Partie collective" }) {
  const roomRef = push(ref(db, "rooms"));
  const roomId = roomRef.key;

  await set(roomRef, {
    meta: { name, hostId, createdAt: serverTimestamp() },
    players: {},
    board: {
      size: 66,
      positions: {},
      cells: Array.from({ length: 66 }).map((_, i) => ({
        index: i,
        type: i === 0 ? "start" : i === 65 ? "arrivee" : "question",
        theme: "symboles",
      })),
    },
    state: {
      phase: "lobby", // lobby | initiative | playing
      initiativeRolls: {},
      turnOrder: [],
      turnPlayerId: hostId,
      currentActorId: null,

      turnStage: "roll", // roll | action
      currentCell: null,
      actionNeedCard: false,

      qStatus: "idle", // idle | running
      qCard: null,
      qEndsAt: 0,

      // requests consommées par le host
      moveRequest: null,   // { playerId, at }
      finishRequest: null, // { playerId, at }

      lastMove: null,   // { playerId, die, from, to, at }
      lastAction: null, // affichage résultat
    },
    answers: {},
  });

  return roomId;
}

export function listenRoom(roomId, cb) {
  const r = ref(db, `rooms/${roomId}`);
  onValue(r, (s) => cb(s.val()));
  return () => off(r);
}

export async function joinRoom({ roomId, playerId, player }) {
  const r = ref(db, `rooms/${roomId}/players/${playerId}`);
  await set(r, {
    ...player,
    connected: true,
    joinedAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  });

  onDisconnect(r).update({
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

/* ======================================================
   INITIATIVE
   ====================================================== */

export async function startInitiativePhase(roomId) {
  await update(ref(db, `rooms/${roomId}/state`), {
    phase: "initiative",
    initiativeRolls: {},
    turnOrder: [],
    turnStage: "roll",
    currentActorId: null,
    currentCell: null,
    actionNeedCard: false,
    qStatus: "idle",
    qCard: null,
    qEndsAt: 0,
    lastMove: null,
    lastAction: null,
    moveRequest: null,
    finishRequest: null,
  });

  // reset positions & answers
  await set(ref(db, `rooms/${roomId}/board/positions`), {});
  await set(ref(db, `rooms/${roomId}/answers`), {});
}

export async function rollInitiative(roomId, playerId) {
  const die = randDie();

  // Optionnel : empêcher doublons côté client (simple, pas transactionnel)
  const snap = await get(ref(db, `rooms/${roomId}/state/initiativeRolls`));
  const rolls = snap.val() || {};
  const used = new Set(Object.values(rolls));
  if (used.has(die)) {
    // relance jusqu’à valeur libre (max 6 joueurs)
    let d = die;
    let guard = 0;
    while (used.has(d) && guard < 20) {
      d = randDie();
      guard++;
    }
    await update(ref(db, `rooms/${roomId}/state/initiativeRolls`), {
      [playerId]: d,
    });
    return;
  }

  await update(ref(db, `rooms/${roomId}/state/initiativeRolls`), {
    [playerId]: die,
  });
}

export async function lockInitiative(roomId) {
  const snap = await get(ref(db, `rooms/${roomId}/state/initiativeRolls`));
  const rolls = snap.val() || {};

  const ordered = Object.entries(rolls)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  const first = ordered[0] || null;

  await update(ref(db, `rooms/${roomId}/state`), {
    phase: "playing",
    turnOrder: ordered,
    turnPlayerId: first,
    turnStage: "roll",
    currentActorId: null,
    currentCell: null,
    actionNeedCard: false,
    qStatus: "idle",
    qCard: null,
    qEndsAt: 0,
    lastMove: null,
    lastAction: null,
    moveRequest: null,
    finishRequest: null,
  });
}

/* ======================================================
   MOVE REQUEST (dé placement) — le host consomme
   ====================================================== */

export async function requestMoveRoll(roomId, playerId) {
  await update(ref(db, `rooms/${roomId}/state`), {
    moveRequest: { playerId, at: Date.now() },
  });
}

export async function hostProcessMoveRequest(roomId) {
  const snap = await get(ref(db, `rooms/${roomId}`));
  const room = snap.val();
  if (!room) return;

  const state = room.state || {};
  const req = state.moveRequest;
  if (!req?.playerId) return;

  // sécurité : consommer la requête tout de suite
  await update(ref(db, `rooms/${roomId}/state`), { moveRequest: null });

  // vérif tour
  if (state.phase !== "playing") return;
  if (state.turnStage !== "roll") return;
  if (req.playerId !== state.turnPlayerId) return;

  const die = randDie();
  const size = Number(room.board?.size || 66);
  const from = Number(room.board?.positions?.[req.playerId] ?? 0);
  const to = clampPos(from + die, size);

  const cell = Array.isArray(room.board?.cells) ? room.board.cells[to] : null;
  const cellType = cell?.type || "question";

  // appliquer position
  await set(ref(db, `rooms/${roomId}/board/positions/${req.playerId}`), to);

  // cases spéciales immédiates (exemples simples)
  if (cellType === "augmentation") {
    const to2 = clampPos(to + 1, size);
    await set(ref(db, `rooms/${roomId}/board/positions/${req.playerId}`), to2);

    await update(ref(db, `rooms/${roomId}/state`), {
      lastMove: { playerId: req.playerId, die, from, to: to2, at: Date.now() },
      lastAction: { type: "augmentation", playerId: req.playerId, delta: 1, at: Date.now() },
      turnStage: "roll",
      currentActorId: null,
      currentCell: null,
      actionNeedCard: false,
    });

    await nextTurn(roomId, room);
    return;
  }

  if (cellType === "cabinet") {
    await update(ref(db, `rooms/${roomId}/state`), {
      lastMove: { playerId: req.playerId, die, from, to, at: Date.now() },
      lastAction: { type: "cabinet", playerId: req.playerId, delta: 0, at: Date.now() },
      turnStage: "roll",
      currentActorId: null,
      currentCell: null,
      actionNeedCard: false,
    });

    await nextTurn(roomId, room);
    return;
  }

  if (cellType === "evenement") {
    // exemple : aléatoire -2..+2 (hors 0)
    const choices = [-2, -1, 1, 2];
    const delta = choices[Math.floor(Math.random() * choices.length)];
    const to2 = clampPos(to + delta, size);
    await set(ref(db, `rooms/${roomId}/board/positions/${req.playerId}`), to2);

    await update(ref(db, `rooms/${roomId}/state`), {
      lastMove: { playerId: req.playerId, die, from, to: to2, at: Date.now() },
      lastAction: { type: "evenement", playerId: req.playerId, delta, at: Date.now() },
      turnStage: "roll",
      currentActorId: null,
      currentCell: null,
      actionNeedCard: false,
    });

    await nextTurn(roomId, room);
    return;
  }

  // arrivée
  if (cellType === "arrivee") {
    await update(ref(db, `rooms/${roomId}/state`), {
      lastMove: { playerId: req.playerId, die, from, to, at: Date.now() },
      lastAction: { type: "arrivee", playerId: req.playerId, delta: 0, at: Date.now() },
      turnStage: "roll",
      currentActorId: null,
      currentCell: null,
      actionNeedCard: false,
    });
    return; // fin de partie
  }

  // sinon : on doit jouer une carte (question/defi/quiz)
  await update(ref(db, `rooms/${roomId}/state`), {
    lastMove: { playerId: req.playerId, die, from, to, at: Date.now() },
    currentActorId: req.playerId,
    currentCell: cell,
    turnStage: "action",
    actionNeedCard: true,
    // important: ne pas finir la question ici !
  });
}

/* ======================================================
   QUESTIONS
   ====================================================== */

export async function startQuestion(roomId, card, durationSec = 20) {
  const endsAt = Date.now() + durationSec * 1000;

  await update(ref(db, `rooms/${roomId}/state`), {
    qStatus: "running",
    qCard: card,
    qEndsAt: endsAt,
    actionNeedCard: false,
  });

  await set(ref(db, `rooms/${roomId}/answers`), {});
}

export async function submitAnswer(roomId, playerId, picked) {
  await set(ref(db, `rooms/${roomId}/answers/${playerId}`), {
    picked,
    at: serverTimestamp(),
  });
}

/**
 * Le client acteur demande au host de terminer la question
 */
export async function requestFinishQuestion(roomId, playerId) {
  await update(ref(db, `rooms/${roomId}/state`), {
    finishRequest: { playerId, at: Date.now() },
  });
}

/**
 * Le host consomme finishRequest et appelle finishQuestion()
 */
export async function hostProcessFinishRequest(roomId) {
  const snap = await get(ref(db, `rooms/${roomId}/state/finishRequest`));
  const req = snap.val();
  if (!req?.playerId) return;

  // consommer d'abord pour éviter double
  await update(ref(db, `rooms/${roomId}/state`), { finishRequest: null });

  // terminer
  await finishQuestion(roomId);
}

export async function finishQuestion(roomId) {
  const snap = await get(ref(db, `rooms/${roomId}`));
  const room = snap.val();
  if (!room) return;

  const state = room.state || {};
  if (state.qStatus !== "running") return;

  const actorId = state.currentActorId || state.turnPlayerId;
  const card = state.qCard;

  // stop question
  await update(ref(db, `rooms/${roomId}/state`), {
    qStatus: "idle",
    qEndsAt: 0,
    // on garde qCard pour affichage éventuel ou on peut null
    // qCard: null,
  });

  if (!actorId || !card) {
    await nextTurn(roomId, room);
    return;
  }

  const answers = room.answers || {};
  const picked = answers?.[actorId]?.picked;
  const correctIndexes = Array.isArray(card.correctIndexes) ? card.correctIndexes : [];

  // pas répondu
  if (typeof picked !== "number") {
    await update(ref(db, `rooms/${roomId}/state`), {
      lastAction: {
        type: "question",
        outcome: "no_answer",
        delta: 0,
        at: Date.now(),
        playerId: actorId,
        cardId: card.id,
        points: Number(card.points || 1),
      },
      // fin de l'action
      turnStage: "roll",
      currentActorId: null,
      currentCell: null,
      actionNeedCard: false,
      qCard: null,
    });

    await nextTurn(roomId, room);
    return;
  }

  const isCorrect = correctIndexes.includes(picked);

  const size = Number(room.board?.size || 66);
  const currentPos = Number(room.board?.positions?.[actorId] ?? 0);

  let delta = 0;
  if (isCorrect) {
    delta = Number(card.points || 1);
    const to = clampPos(currentPos + delta, size);
    await set(ref(db, `rooms/${roomId}/board/positions/${actorId}`), to);
  }

  await update(ref(db, `rooms/${roomId}/state`), {
    lastAction: {
      type: "question",
      outcome: isCorrect ? "correct" : "wrong",
      delta,
      at: Date.now(),
      playerId: actorId,
      cardId: card.id,
      points: Number(card.points || 1),
    },
    // fin de l'action
    turnStage: "roll",
    currentActorId: null,
    currentCell: null,
    actionNeedCard: false,
    qCard: null,
  });

  await nextTurn(roomId, room);
}
