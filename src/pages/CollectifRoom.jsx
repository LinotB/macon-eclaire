// src/pages/CollectifRoom.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

// thèmes (images)
import themeSymboles from "../assets/themes/symboles.png";
import themeRituels from "../assets/themes/rituels.png";
import themeHistoire from "../assets/themes/histoire.png";
import themeReglement from "../assets/themes/reglement.png";
import themeDefis from "../assets/themes/defis.png";
import themeMix from "../assets/themes/mix.png";

import CollectifBoard3D from "../components/board3d/CollectifBoard3D";

// ✅ banque centralisée
import { getQuestions } from "../data/questions"; // <-- NEW (au lieu de getRandomQuestion)

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
    if (a.outcome === "correct")
      text = `✅ ${name} : bonne réponse (+${a.delta})`;
    else if (a.outcome === "no_answer")
      text = `⏱️ ${name} : pas de réponse (0)`;
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
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="font-display tracking-[0.12em] text-xs text-white/70">
        {title}
      </div>
      <div className="mt-2 text-sm text-white/85">{text}</div>
    </div>
  );
}

/* ✅ Firebase peut stocker "cells" sous forme d'objet (0..65) au lieu d'un array */
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

// ✅ difficulté par case (simple et modifiable)
function difficultyFromCell(cell) {
  const p = Number(cell?.points);
  if (p === 1 || p === 2 || p === 3) return p;

  if (cell?.type === "defi") return 3;
  if (cell?.type === "quiz") return 2;
  if (cell?.type === "question") return 2;

  return 1;
}

// ✅ helper : pioche une question en évitant les doublons
function pickUniqueQuestion({ theme, difficulty, usedIdsSet }) {
  const pool = getQuestions({ theme, difficulty, count: 9999, shuffle: true });

  // 1) essaie d'en trouver une jamais utilisée
  const fresh = pool.find((q) => q?.id && !usedIdsSet.has(String(q.id)));
  if (fresh) return fresh;

  // 2) sinon fallback : accepte une répétition (si banque trop petite)
  return pool[0] || null;
}

export default function CollectifRoom() {
  const { roomId } = useParams();
  const playerId = useMemo(() => getPlayerId(), []);

  const [room, setRoom] = useState(null);
  const [qLeft, setQLeft] = useState(0);
  const [localPick, setLocalPick] = useState(null);

  const finishingRef = useRef(false);
  const startingCardRef = useRef(false);

  // ✅ anti-doublon LOCAL (par onglet / par client)
  // Si tu veux l'anti-doublon "partagé" entre tous les joueurs, il faudra stocker un set côté RTDB (je te le fais après si tu veux).
  const usedQuestionIdsRef = useRef(new Set());

  /* =========================
     HOOKS
     ========================= */
  useEffect(() => {
    const unsub = listenRoom(roomId, setRoom);
    return unsub;
  }, [roomId]);

  useEffect(() => {
    const t = setInterval(() => heartbeat({ roomId, playerId }), 10000);
    return () => clearInterval(t);
  }, [roomId, playerId]);

  // timer
  useEffect(() => {
    const status = room?.state?.qStatus || "idle";
    const endsAt = room?.state?.qEndsAt || 0;

    if (status !== "running" || !endsAt) {
      setQLeft(0);
      return;
    }

    const computeLeft = () =>
      Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    setQLeft(computeLeft());

    const interval = setInterval(() => {
      setQLeft(computeLeft());
    }, 250);

    return () => clearInterval(interval);
  }, [room?.state?.qStatus, room?.state?.qEndsAt]);

  // reset pick on new question/turn
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

  // ✅ quand une nouvelle carte arrive dans la room, on marque son id comme "utilisé"
  useEffect(() => {
    const id = room?.state?.qCard?.id;
    if (!id) return;
    usedQuestionIdsRef.current.add(String(id));
  }, [room?.state?.qCard?.id]);

  // host: auto-finish when time is truly over (based on endsAt)
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

  // host: consume moveRequest
  useEffect(() => {
    if (!room) return;
    const isHost = room?.meta?.hostId === playerId;
    const req = room?.state?.moveRequest;

    if (!isHost) return;
    if (!req?.playerId) return;

    hostProcessMoveRequest(roomId);
  }, [room, playerId, roomId]);

  // host: start question when actionNeedCard
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

    // ✅ determine theme + difficulty, puis pioche UNIQUE dans la banque centralisée
    let theme = "symboles";
    if (cell?.type === "quiz") theme = pickQuizTheme(); // souvent "mix" ou un thème
    else if (cell?.type === "defi") theme = "defis";
    else if (cell?.type === "question")
      theme = (cell?.theme || "symboles").toLowerCase();

    const difficulty = difficultyFromCell(cell);

    const picked = pickUniqueQuestion({
      theme,
      difficulty,
      usedIdsSet: usedQuestionIdsRef.current,
    });

    // fallback si banque vide
    const nextCard =
      picked ||
      {
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

    // 🔁 points = difficulté si non défini
    const cardWithPoints = {
      ...nextCard,
      theme,
      points: nextCard.points || difficulty,
    };

    // ✅ marque l'id comme utilisé (pour éviter que le host repioche la même avant que la room reçoive la carte)
    if (cardWithPoints?.id)
      usedQuestionIdsRef.current.add(String(cardWithPoints.id));

    startQuestion(roomId, cardWithPoints, 20);
  }, [room, playerId, roomId]);

  // host: consume finishRequest
  useEffect(() => {
    if (!room) return;
    const isHost = room?.meta?.hostId === playerId;
    const req = room?.state?.finishRequest;

    if (!isHost) return;
    if (!req?.playerId) return;

    hostProcessFinishRequest(roomId);
  }, [room, playerId, roomId]);

  /* =========================
     RENDER
     ========================= */
  if (!room) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white p-8">
        Chargement…
      </div>
    );
  }

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
  const turnOrder = Array.isArray(room?.state?.turnOrder)
    ? room.state.turnOrder
    : [];

  const size = Number(room?.board?.size || 66);
  const cells = normalizeCells(room?.board?.cells, size);

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
    phase === "playing" && qStatus === "running" && isMyTurnAnswer;

  const myInitiative = initiativeRolls[playerId];
  const turnOrderNames = turnOrder.map((id) => {
    const p = room?.players?.[id];
    return { id, name: p?.name || id.slice(0, 6), connected: !!p?.connected };
  });

  const lastMove = room?.state?.lastMove;
  const lastMoveName = lastMove?.playerId
    ? room?.players?.[lastMove.playerId]?.name ||
      lastMove.playerId.slice(0, 6)
    : null;

  const activeIndex = Number(positions?.[turnPlayerId] ?? 0);

  /* =========================
     Actions
     ========================= */
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
      <div className="max-w-6xl mx-auto space-y-5">
        {/* top bar */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-2xl">
              {room.meta?.name || "Partie"}
            </div>
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

            {phase === "initiative" && (
              <>
                <button
                  onClick={onRollInitiative}
                  disabled={typeof myInitiative === "number"}
                  className={[
                    "rounded-md px-5 py-3 font-display tracking-[0.12em] border",
                    typeof myInitiative === "number"
                      ? "bg-white/10 text-white/30 cursor-not-allowed border-white/10"
                      : "bg-[#D4AF37] text-black border-[#D4AF37]/30",
                  ].join(" ")}
                >
                  {typeof myInitiative === "number"
                    ? `DÉ LANCÉ : ${myInitiative}`
                    : "LANCER LE DÉ"}
                </button>

                {isHost && (
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
              </>
            )}

            {phase === "playing" && (
              <button
                onClick={onRollMove}
                disabled={!canRoll}
                className={[
                  "rounded-md px-5 py-3 font-display tracking-[0.12em] border",
                  !canRoll
                    ? "bg-white/10 text-white/30 cursor-not-allowed border-white/10"
                    : "bg-[#D4AF37] text-black border-[#D4AF37]/30",
                ].join(" ")}
              >
                LANCER LE DÉ
              </button>
            )}
          </div>
        </div>

        {/* MAIN */}
        <div className="grid xl:grid-cols-[2.35fr_0.95fr] gap-6">
          {/* LEFT BOARD */}
          <div className="space-y-4">
            {/* Bandeau dé (dernier lancer) */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
              <div className="font-display tracking-[0.12em] text-sm text-white/80">
                PLATEAU (3D)
              </div>

              <div className="text-xs text-white/45 flex items-center gap-3">
                <AnimatePresence mode="popLayout">
                  {lastMove?.die ? (
                    <motion.div
                      key={lastMove.at}
                      initial={{ opacity: 0, y: -8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25 }}
                      className="px-3 py-1 rounded-full border border-white/10 bg-black/20"
                      title="Dernier lancer"
                    >
                      🎲 {lastMoveName} :{" "}
                      <span className="text-[#D4AF37]">{lastMove.die}</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            {/* Plateau 3D */}
            <CollectifBoard3D room={room} activeIndex={activeIndex} />

            {/* Texte d’aide */}
            <div className="text-center text-white/35 text-xs">
              {phase === "initiative"
                ? "Chaque joueur lance le dé (score unique). Le host valide l’ordre."
                : phase === "playing" && qStatus === "running"
                ? isMyTurnAnswer
                  ? "C’est ton tour : choisis puis VALIDE."
                  : "Question en cours…"
                : phase === "playing"
                ? isMyTurnRoll
                  ? "C’est ton tour : lance le dé."
                  : "Attends ton tour…"
                : "En attente…"}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <ActionBanner room={room} />

            {/* players */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="font-display tracking-[0.12em] text-sm mb-4">
                JOUEURS
              </div>

              <div className="space-y-3">
                {playersEntries.map(([id, p]) => {
                  const roll = initiativeRolls[id];
                  const isTurn = turnPlayerId === id;

                  return (
                    <div key={id} className="flex items-center justify-between">
                      <div className="text-white/85">
                        {p?.name || "?"}{" "}
                        <span className="text-white/40">({p?.grade})</span>
                        {id === playerId ? (
                          <span className="ml-2 text-[#D4AF37]">• toi</span>
                        ) : null}
                        {id === room?.meta?.hostId ? (
                          <span className="ml-2 text-white/35">• host</span>
                        ) : null}
                        {phase === "initiative" && typeof roll === "number" ? (
                          <span className="ml-2 text-white/50">• 🎲 {roll}</span>
                        ) : null}
                      </div>

                      <div className="text-white/40 text-sm">
                        pos: {positions[id] ?? 0} {p?.connected ? "🟢" : "⚫️"}
                        {isTurn ? (
                          <span className="ml-2 text-[#D4AF37]">◀ tour</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {turnOrderNames.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-2">
                    ORDRE DE JEU
                  </div>
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
                </div>
              )}
            </div>

            {/* question */}
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
                              <span className="text-[#D4AF37] font-display">
                                ●
                              </span>
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

        {/* debug */}
        <div className="text-center text-white/25 text-xs">
          phase: {phase} · qStatus: {qStatus} · host: {isHost ? "oui" : "non"} ·
          turnStage: {turnStage}
        </div>
      </div>
    </div>
  );
}