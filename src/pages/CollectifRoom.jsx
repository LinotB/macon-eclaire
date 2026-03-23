// src/pages/CollectifRoom.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  listenRoom,
  heartbeat,
  startInitiativePhase,
  rollInitiative,
  lockInitiative,
  requestMoveRoll,
  hostProcessMoveRequest,
  startQuestion,
  submitAnswer,
  finishQuestion,
  pickQuizTheme,
  requestFinishQuestion,
  hostProcessFinishRequest,
} from "../services/rtdb";
import { getPlayerId } from "../utils/playerId";

import themeSymboles from "../assets/themes/symboles.png";
import themeRituels from "../assets/themes/rituels.png";
import themeHistoire from "../assets/themes/histoire.png";
import themeReglement from "../assets/themes/reglement.png";
import themeDefis from "../assets/themes/defis.png";
import themeMix from "../assets/themes/mix.png";

import CollectifBoard3D from "../components/board3d/CollectifBoard3D";
import { getQuestions } from "../data/questions";

const THEME_CONFIG = {
  symboles: {
    label: "SYMBOLES",
    headerFrom: "#5B2A86",
    headerTo: "#2A1447",
    image: themeSymboles,
  },
  rituels: {
    label: "RITUELS",
    headerFrom: "#1E3A8A",
    headerTo: "#0F1F4A",
    image: themeRituels,
  },
  histoire: {
    label: "HISTOIRE",
    headerFrom: "#14532D",
    headerTo: "#0B2E1A",
    image: themeHistoire,
  },
  reglement: {
    label: "CONSTITUTIONS & RÈGLEMENT",
    headerFrom: "#7C2D12",
    headerTo: "#3F1708",
    image: themeReglement,
  },
  defis: {
    label: "DÉFIS",
    headerFrom: "#7F1D1D",
    headerTo: "#3F0E0E",
    image: themeDefis,
  },
  mix: {
    label: "QUIZ SURPRISE",
    headerFrom: "#1F2937",
    headerTo: "#0B1220",
    image: themeMix || themeSymboles,
  },
};

function DifficultyPips({ points = 1 }) {
  const n = Math.max(1, Math.min(3, Number(points) || 1));
  const label = n === 1 ? "FACILE" : n === 2 ? "INTERMÉDIAIRE" : "DIFFICILE";

  return (
    <div className="inline-flex items-center gap-3">
      <div className="inline-flex items-center gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => {
          const active = i < n;
          return (
            <span
              key={i}
              className={[
                "w-2.5 h-2.5 rounded-full border",
                active
                  ? "bg-[#D4AF37] border-[#D4AF37]/50 shadow-[0_0_14px_rgba(212,175,55,0.25)]"
                  : "bg-white/10 border-white/15 opacity-60",
              ].join(" ")}
            />
          );
        })}
      </div>

      <span className="px-2.5 py-1 rounded-full text-[10px] font-display tracking-[0.16em] border border-white/15 bg-black/20 text-white/70">
        {label}
      </span>
    </div>
  );
}

function ActionBanner({ room }) {
  const a = room?.state?.lastAction;
  if (!a) return null;

  const name =
    room?.players?.[a.playerId]?.name || a.playerId?.slice(0, 6) || "—";

  let title = "Dernière action";
  let text = "";

  if (a.type === "question") {
    title = "Résultat";
    if (a.outcome === "correct") text = `✅ ${name} : bonne réponse (+${a.delta})`;
    else if (a.outcome === "no_answer") text = `⏱️ ${name} : pas de réponse (0)`;
    else text = `❌ ${name} : mauvaise réponse (+0)`;
  } else if (a.type === "evenement") {
    title = "Événement";
    text =
      a.delta > 0
        ? `🌪️ ${name} avance de +${a.delta}`
        : `🌪️ ${name} recule de ${a.delta}`;
  } else if (a.type === "augmentation") {
    title = "Augmentation";
    text = `💰 ${name} avance de +1`;
  } else if (a.type === "cabinet") {
    title = "Cabinet de réflexion";
    text = `🕯️ ${name} passe son tour`;
  } else if (a.type === "arrivee") {
    title = "Arrivée";
    text = `🏁 ${name} a gagné !`;
  } else {
    text = `${a.type}`;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 h-full">
      <div className="font-display tracking-[0.12em] text-xs text-white/70">
        {title}
      </div>
      <div className="mt-2 text-sm text-white/85">{text}</div>
    </div>
  );
}

function normalizeCells(rawCells, size) {
  if (Array.isArray(rawCells)) return rawCells;

  if (rawCells && typeof rawCells === "object") {
    const arr = Object.keys(rawCells)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => rawCells[k]);
    if (arr.length) return arr;
  }

  return Array.from({ length: size }).map((_, i) => ({
    index: i,
    type: i === 0 ? "start" : i === size - 1 ? "arrivee" : "question",
    theme: "symboles",
  }));
}

function difficultyFromCell(cell) {
  const p = Number(cell?.points);
  if (p === 1 || p === 2 || p === 3) return p;
  if (cell?.type === "defi") return 3;
  if (cell?.type === "quiz") return 2;
  if (cell?.type === "question") return 2;
  return 1;
}

function pickUniqueQuestion({ theme, difficulty, usedIdsSet }) {
  const pool = getQuestions({ theme, difficulty, count: 9999, shuffle: true });
  const fresh = pool.find((q) => q?.id && !usedIdsSet.has(String(q.id)));
  if (fresh) return fresh;
  return pool[0] || null;
}

function Pip({ active = false }) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      {active ? <span className="w-3 h-3 rounded-full bg-[#0A1628]" /> : null}
    </div>
  );
}

function DiceFace({ value }) {
  const dotsByValue = {
    1: [[2, 2]],
    2: [
      [1, 1],
      [3, 3],
    ],
    3: [
      [1, 1],
      [2, 2],
      [3, 3],
    ],
    4: [
      [1, 1],
      [3, 1],
      [1, 3],
      [3, 3],
    ],
    5: [
      [1, 1],
      [3, 1],
      [2, 2],
      [1, 3],
      [3, 3],
    ],
    6: [
      [1, 1],
      [3, 1],
      [1, 2],
      [3, 2],
      [1, 3],
      [3, 3],
    ],
  };

  const dots = dotsByValue[value] || [];

  return (
    <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-2">
      {Array.from({ length: 9 }).map((_, idx) => {
        const col = (idx % 3) + 1;
        const row = Math.floor(idx / 3) + 1;
        const active = dots.some(([x, y]) => x === col && y === row);

        return <Pip key={idx} active={active} />;
      })}
    </div>
  );
}

function Dice3D({ value = 1, rolling = false, animKey = 0 }) {
  const faceRotation = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: -90 },
    3: { x: -90, y: 0 },
    4: { x: 90, y: 0 },
    5: { x: 0, y: 90 },
    6: { x: 180, y: 0 },
  };

  const finalFace = faceRotation[value] || faceRotation[1];

  const faceClassName =
    "absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 shadow-lg";

  const faceStyle = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  return (
    <div
      className="mx-auto mb-4 w-24 h-24 flex items-center justify-center"
      style={{ perspective: 1000 }}
    >
      <motion.div
        key={`${animKey}-${value}`}
        animate={
          rolling
            ? {
                rotateX: [0, 720, 1440, 2160],
                rotateY: [0, 1080, 2160, 3240],
                rotateZ: [0, 360, 720, 1080],
                y: [0, -18, 0, -8, 0],
                scale: [1, 1.14, 0.98, 1.08, 1],
              }
            : {
                rotateX: finalFace.x,
                rotateY: finalFace.y,
                rotateZ: 0,
                y: 0,
                scale: 1,
              }
        }
        transition={
          rolling
            ? {
                duration: 1.6,
                ease: "linear",
                repeat: Infinity,
              }
            : {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }
        }
        style={{
          width: 72,
          height: 72,
          position: "relative",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <div
          className={faceClassName}
          style={{
            ...faceStyle,
            transform: "translateZ(36px)",
          }}
        >
          <DiceFace value={1} />
        </div>

        <div
          className={faceClassName}
          style={{
            ...faceStyle,
            transform: "rotateY(180deg) translateZ(36px)",
          }}
        >
          <DiceFace value={6} />
        </div>

        <div
          className={faceClassName}
          style={{
            ...faceStyle,
            transform: "rotateY(90deg) translateZ(36px)",
          }}
        >
          <DiceFace value={2} />
        </div>

        <div
          className={faceClassName}
          style={{
            ...faceStyle,
            transform: "rotateY(-90deg) translateZ(36px)",
          }}
        >
          <DiceFace value={5} />
        </div>

        <div
          className={faceClassName}
          style={{
            ...faceStyle,
            transform: "rotateX(90deg) translateZ(36px)",
          }}
        >
          <DiceFace value={3} />
        </div>

        <div
          className={faceClassName}
          style={{
            ...faceStyle,
            transform: "rotateX(-90deg) translateZ(36px)",
          }}
        >
          <DiceFace value={4} />
        </div>
      </motion.div>
    </div>
  );
}

export default function CollectifRoom() {
  const { roomId } = useParams();
  const playerId = useMemo(() => getPlayerId(), []);

  const [room, setRoom] = useState(null);
  const [qLeft, setQLeft] = useState(0);
  const [localPick, setLocalPick] = useState(null);
  const [diceAnimKey, setDiceAnimKey] = useState(0);
  const [isDiceRolling, setIsDiceRolling] = useState(false);

  const finishingRef = useRef(false);
  const startingCardRef = useRef(false);
  const usedQuestionIdsRef = useRef(new Set());
  const prevDiceValueRef = useRef(null);

  useEffect(() => {
    const unsub = listenRoom(roomId, setRoom);
    return unsub;
  }, [roomId]);

  useEffect(() => {
    const t = setInterval(() => heartbeat({ roomId, playerId }), 10000);
    return () => clearInterval(t);
  }, [roomId, playerId]);

  useEffect(() => {
    const status = room?.state?.qStatus || "idle";
    const endsAt = room?.state?.qEndsAt || 0;

    if (status !== "running" || !endsAt) {
      setQLeft(0);
      return;
    }

    const computeLeft = () => Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    setQLeft(computeLeft());

    const interval = setInterval(() => {
      setQLeft(computeLeft());
    }, 250);

    return () => clearInterval(interval);
  }, [room?.state?.qStatus, room?.state?.qEndsAt]);

  useEffect(() => {
    setLocalPick(null);
    finishingRef.current = false;
    startingCardRef.current = false;
  }, [
    room?.state?.qStatus,
    room?.state?.turnPlayerId,
    room?.state?.qEndsAt,
    room?.state?.qCard?.id,
  ]);

  useEffect(() => {
    const id = room?.state?.qCard?.id;
    if (!id) return;
    usedQuestionIdsRef.current.add(String(id));
  }, [room?.state?.qCard?.id]);

  useEffect(() => {
    const status = room?.state?.qStatus || "idle";
    const endsAt = room?.state?.qEndsAt || 0;
    const isHost = room?.meta?.hostId === playerId;

    if (!isHost) return;
    if (status !== "running" || !endsAt) return;

    if (Date.now() >= endsAt) {
      if (finishingRef.current) return;
      finishingRef.current = true;
      finishQuestion(roomId);
    }
  }, [
    roomId,
    playerId,
    room?.meta?.hostId,
    room?.state?.qStatus,
    room?.state?.qEndsAt,
  ]);

  useEffect(() => {
    if (!room) return;
    const isHost = room?.meta?.hostId === playerId;
    const req = room?.state?.moveRequest;

    if (!isHost) return;
    if (!req?.playerId) return;

    hostProcessMoveRequest(roomId);
  }, [room, playerId, roomId]);

  useEffect(() => {
    if (!room) return;

    const isHost = room?.meta?.hostId === playerId;
    const phase = room?.state?.phase;
    const need = room?.state?.actionNeedCard;
    const qStatus = room?.state?.qStatus;
    const cell = room?.state?.currentCell;

    if (!isHost) return;
    if (phase !== "playing") return;
    if (!need) return;
    if (qStatus !== "idle") return;

    if (startingCardRef.current) return;
    startingCardRef.current = true;

    let theme = "symboles";
    if (cell?.type === "quiz") theme = pickQuizTheme();
    else if (cell?.type === "defi") theme = "defis";
    else if (cell?.type === "question") theme = (cell?.theme || "symboles").toLowerCase();

    const difficulty = difficultyFromCell(cell);

    const picked = pickUniqueQuestion({
      theme,
      difficulty,
      usedIdsSet: usedQuestionIdsRef.current,
    });

    const nextCard =
      picked || {
        id: `fallback-${Date.now()}`,
        theme,
        title: "QUESTION",
        points: difficulty,
        question:
          "Aucune question trouvée dans la banque (src/data/questions). Ajoute des questions et relance.",
        answers: ["OK"],
        correctIndexes: [0],
        feedback:
          "Ajoute des questions dans src/data/questions/<theme>.<difficulty>.js",
      };

    const cardWithPoints = {
      ...nextCard,
      theme,
      points: nextCard.points || difficulty,
    };

    if (cardWithPoints?.id) {
      usedQuestionIdsRef.current.add(String(cardWithPoints.id));
    }

    startQuestion(roomId, cardWithPoints, 20);
  }, [room, playerId, roomId]);

  useEffect(() => {
    if (!room) return;
    const isHost = room?.meta?.hostId === playerId;
    const req = room?.state?.finishRequest;

    if (!isHost) return;
    if (!req?.playerId) return;

    hostProcessFinishRequest(roomId);
  }, [room, playerId, roomId]);

  const playersEntries = room?.players ? Object.entries(room.players) : [];
  const positions = room?.board?.positions || {};

  const phase = room?.state?.phase || "lobby";
  const isHost = room?.meta?.hostId === playerId;

  const turnPlayerId = room?.state?.turnPlayerId || room?.meta?.hostId;
  const actorId = room?.state?.currentActorId || turnPlayerId;

  const isMyTurnRoll = turnPlayerId === playerId;
  const isMyTurnAnswer = actorId === playerId;

  const qStatus = room?.state?.qStatus || "idle";
  const card = room?.state?.qCard || null;

  const initiativeRolls = room?.state?.initiativeRolls || {};
  const turnOrder = Array.isArray(room?.state?.turnOrder) ? room.state.turnOrder : [];

  const size = Number(room?.board?.size || 66);
  normalizeCells(room?.board?.cells, size);

  const connectedIds = playersEntries
    .filter(([, p]) => p?.connected)
    .map(([id]) => id);

  const allRolled =
    connectedIds.length > 0 &&
    connectedIds.every((id) => typeof initiativeRolls[id] === "number");

  const themeKey = (card?.theme || "mix").toLowerCase();
  const theme = THEME_CONFIG[themeKey] || THEME_CONFIG.mix;

  const turnStage = room?.state?.turnStage || "roll";

  const canRoll =
    phase === "playing" &&
    isMyTurnRoll &&
    turnStage === "roll" &&
    qStatus === "idle";

  const canAnswer =
    phase === "playing" &&
    qStatus === "running" &&
    isMyTurnAnswer;

  const myInitiative = initiativeRolls[playerId];
  const turnOrderNames = turnOrder.map((id) => {
    const p = room?.players?.[id];
    return { id, name: p?.name || id.slice(0, 6), connected: !!p?.connected };
  });

  const lastMove = room?.state?.lastMove;
  const activeIndex = Number(positions?.[turnPlayerId] ?? 0);
  const diceValue = phase === "initiative" ? myInitiative : lastMove?.die || null;

  useEffect(() => {
    if (typeof diceValue === "number" && diceValue !== prevDiceValueRef.current) {
      prevDiceValueRef.current = diceValue;
      setDiceAnimKey((k) => k + 1);
      setIsDiceRolling(false);
    }
  }, [diceValue]);

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white p-8">
        Chargement…
      </div>
    );
  }

  const startGameFn = async () => {
    if (!isHost) return;
    await startInitiativePhase(roomId);
  };

  const onRollInitiative = async () => {
    if (phase !== "initiative") return;
    await rollInitiative(roomId, playerId);
  };

  const onLockInitiative = async () => {
    if (!isHost) return;
    if (phase !== "initiative") return;
    await lockInitiative(roomId);
  };

  const onRollMove = async () => {
    if (!canRoll) return;
    await requestMoveRoll(roomId, playerId);
  };

  const diceButtonDisabled =
    phase === "lobby" ||
    (phase === "initiative" && typeof myInitiative === "number") ||
    (phase === "playing" && !canRoll);

  const onDiceClick = async () => {
    if (diceButtonDisabled) return;

    setDiceAnimKey((k) => k + 1);
    setIsDiceRolling(true);

    if (phase === "initiative") {
      await onRollInitiative();
      return;
    }

    if (phase === "playing") {
      await onRollMove();
    }
  };

  const pick = (i) => {
    if (!canAnswer) return;
    setLocalPick(i);
  };

  const validate = async () => {
    if (!canAnswer) return;
    if (typeof localPick !== "number") return;

    await submitAnswer(roomId, playerId, localPick);
    await requestFinishQuestion(roomId, playerId);
  };

  const answerClass = (i) => {
    const base =
      "border-white/10 bg-[#0B1120]/35 hover:border-white/20 hover:bg-white/5";
    if (!canAnswer) return "border-white/10 bg-[#0B1120]/35 opacity-70";
    const picked = localPick === i;
    if (picked) return "border-[#D4AF37]/35 bg-[#D4AF37]/10";
    return base;
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-6">
      <div className="max-w-[1500px] mx-auto space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-2xl">PARTIE COLLECTIVE</div>
            <div className="text-white/50 text-sm">RoomId: {roomId}</div>
            <div className="text-white/50 text-sm">Phase: {phase}</div>
            <div className="text-white/50 text-sm">
              Tour :{" "}
              <span className="text-[#D4AF37]">
                {room?.players?.[turnPlayerId]?.name || turnPlayerId}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {phase === "lobby" && isHost && (
              <button
                onClick={startGameFn}
                className="bg-[#D4AF37] text-black rounded-md px-5 py-3 font-display tracking-[0.12em]"
              >
                DÉMARRER (INITIATIVE)
              </button>
            )}

            {phase === "initiative" && isHost && (
              <button
                onClick={onLockInitiative}
                disabled={!allRolled}
                className={[
                  "rounded-md px-5 py-3 font-display tracking-[0.12em] border",
                  !allRolled
                    ? "bg-white/10 text-white/30 cursor-not-allowed border-white/10"
                    : "bg-[#D4AF37] text-black border-[#D4AF37]/30",
                ].join(" ")}
              >
                VALIDER L’ORDRE
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          <div className="space-y-4 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="font-display tracking-[0.12em] text-xs text-white/70 mb-3">
                  JOUEURS
                </div>

                <div className="space-y-2">
                  {playersEntries.map(([id, p]) => {
                    const isTurn = turnPlayerId === id;
                    return (
                      <div key={id} className="flex items-center justify-between text-sm">
                        <div className="text-white/85">
                          {p?.name || "?"}
                          {id === playerId ? (
                            <span className="ml-2 text-[#D4AF37]">• toi</span>
                          ) : null}
                        </div>
                        <div className="text-white/50">
                          pos: {positions[id] ?? 0}
                          {isTurn ? (
                            <span className="ml-2 text-[#D4AF37]">◀</span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="font-display tracking-[0.12em] text-xs text-white/70 mb-3">
                  ORDRE DE JEU
                </div>

                {turnOrderNames.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {turnOrderNames.map((x, idx) => (
                      <span
                        key={x.id}
                        className={[
                          "px-2.5 py-1 rounded-full text-[11px] border",
                          x.id === turnPlayerId
                            ? "bg-[#D4AF37]/15 border-[#D4AF37]/25 text-[#D4AF37]"
                            : "bg-black/20 border-white/10 text-white/70",
                        ].join(" ")}
                      >
                        {idx + 1}. {x.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-white/50">En attente…</div>
                )}
              </div>

              <ActionBanner room={room} />
            </div>

            <CollectifBoard3D room={room} activeIndex={activeIndex} />

            <div className="text-center text-white/35 text-xs">
              {phase === "initiative"
                ? "Chaque joueur lance le dé. Le host valide ensuite l’ordre."
                : phase === "playing" && qStatus === "running"
                ? isMyTurnAnswer
                  ? "C’est ton tour : choisis puis valide."
                  : "Question en cours…"
                : phase === "playing"
                ? isMyTurnRoll
                  ? "C’est ton tour : lance le dé."
                  : "Attends ton tour…"
                : "En attente…"}
            </div>
          </div>

          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#1A2B4A]/50 rounded-2xl p-5 border border-amber-400/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-amber-100 font-light tracking-[0.12em] uppercase text-sm">
                  Lancer le dé
                </h3>

                {typeof diceValue === "number" && (
                  <div className="text-xs text-amber-200/80 bg-amber-500/10 border border-amber-400/20 rounded-full px-3 py-1">
                    Dernier lancer
                  </div>
                )}
              </div>

              <Dice3D
                value={typeof diceValue === "number" ? diceValue : 1}
                rolling={isDiceRolling}
                animKey={diceAnimKey}
              />

              {phase === "playing" ? (
                <button
                  onClick={onDiceClick}
                  disabled={diceButtonDisabled}
                  className="w-full rounded-xl px-4 py-3 bg-gradient-to-r from-amber-900/80 to-amber-700/80 text-amber-100 border border-amber-400/20 hover:from-amber-800/80 hover:to-amber-600/80 disabled:opacity-40 disabled:cursor-not-allowed transition outline-none focus:outline-none focus:ring-0"
                >
                  {canRoll ? "Lancer le dé" : "Attends ton tour"}
                </button>
              ) : phase === "initiative" ? (
                <button
                  onClick={onDiceClick}
                  disabled={diceButtonDisabled}
                  className="w-full rounded-xl px-4 py-3 bg-gradient-to-r from-amber-900/80 to-amber-700/80 text-amber-100 border border-amber-400/20 hover:from-amber-800/80 hover:to-amber-600/80 disabled:opacity-40 disabled:cursor-not-allowed transition outline-none focus:outline-none focus:ring-0"
                >
                  {typeof myInitiative === "number" ? "Dé lancé" : "Lancer le dé"}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full rounded-xl px-4 py-3 bg-white/10 text-white/30 border border-white/10 cursor-not-allowed outline-none focus:outline-none focus:ring-0"
                >
                  En attente…
                </button>
              )}

              <div className="mt-3 text-center text-xs text-white/50">
                {phase === "initiative"
                  ? typeof myInitiative === "number"
                    ? `Ton score d’initiative : ${myInitiative}`
                    : "Lance le dé pour déterminer l’ordre."
                  : phase === "playing"
                  ? isMyTurnRoll
                    ? "C’est ton tour."
                    : "Attends ton tour pour lancer le dé."
                  : "La partie n’a pas encore commencé."}
              </div>
            </motion.div>

            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div
                className="px-6 py-5 border-b border-white/10"
                style={{
                  background: `linear-gradient(180deg, ${theme.headerFrom}, ${theme.headerTo})`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={theme.image}
                      alt={theme.label}
                      className="w-12 h-12 object-contain select-none"
                      draggable="false"
                    />
                    <div>
                      <div className="font-display tracking-[0.18em] text-lg text-white/95">
                        {card?.title || "QUESTION"}
                      </div>
                      <div className="mt-2 font-display tracking-[0.14em] text-xs text-white/70">
                        {theme.label}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <DifficultyPips points={card?.points || 1} />
                    <div className="px-3 py-1 rounded-full border border-white/15 bg-black/20 font-display tracking-[0.14em] text-xs text-white/80">
                      ⏱ {qStatus === "running" ? `${qLeft}s` : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6">
                {phase === "initiative" ? (
                  <div className="text-white/55 font-body text-sm">
                    <div className="mb-2">
                      🎲 Chaque joueur lance le dé (score unique 1 à 6).
                    </div>
                    <div>Le host validera ensuite l’ordre de jeu.</div>
                  </div>
                ) : !card ? (
                  <div className="text-white/55 font-body text-sm">
                    {phase !== "playing"
                      ? "En attente…"
                      : turnStage === "roll"
                      ? isMyTurnRoll
                        ? "C’est ton tour : lance le dé."
                        : "Attends ton tour…"
                      : "Action en cours…"}
                  </div>
                ) : (
                  <>
                    {qStatus !== "running" && (
                      <div className="text-xs text-white/45 mb-2">
                        (Question affichée — en attente)
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="font-body text-base text-white/85 italic"
                    >
                      {card.question}
                    </motion.div>

                    <div className="mt-5 space-y-3">
                      {card.answers.map((a, i) => (
                        <button
                          key={i}
                          onClick={() => pick(i)}
                          disabled={!canAnswer}
                          className={[
                            "w-full text-left rounded-xl border px-4 py-3 transition",
                            "font-body text-sm",
                            answerClass(i),
                            !canAnswer ? "cursor-not-allowed" : "",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="font-display text-[#D4AF37]/80 w-6">
                                {i + 1}.
                              </span>
                              <span className="text-white/80">{a}</span>
                            </div>
                            {localPick === i ? (
                              <span className="text-[#D4AF37] font-display">●</span>
                            ) : null}
                          </div>
                        </button>
                      ))}
                    </div>

                    {isMyTurnAnswer && (
                      <button
                        onClick={validate}
                        disabled={!canAnswer || typeof localPick !== "number"}
                        className={[
                          "mt-5 w-full rounded-md py-3 font-display tracking-[0.12em]",
                          !canAnswer || typeof localPick !== "number"
                            ? "bg-white/10 text-white/30 cursor-not-allowed border border-white/10"
                            : "bg-[#D4AF37] text-black border border-[#D4AF37]/30 hover:brightness-110 shadow-[0_0_26px_rgba(212,175,55,0.18)]",
                        ].join(" ")}
                      >
                        VALIDER
                      </button>
                    )}

                    <div className="mt-3 text-xs text-white/40 font-body">
                      {qStatus !== "running"
                        ? "En attente…"
                        : isMyTurnAnswer
                        ? "Choisis puis valide. Sinon le chrono passera au joueur suivant."
                        : "Ce n’est pas ton tour."}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-white/25 text-xs">
          phase: {phase} · qStatus: {qStatus} · host: {isHost ? "oui" : "non"} ·
          turnStage: {turnStage}
        </div>
      </div>
    </div>
  );
}