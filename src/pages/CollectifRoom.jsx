// src/pages/CollectifRoom.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  listenRoom,
  heartbeat,
  updateState,
  startQuestion,
  submitAnswer,
  finishQuestion, // ✅ c'est bien finishQuestion
} from "../services/rtdb";
import { getPlayerId } from "../utils/playerId";

// thèmes
import themeSymboles from "../assets/themes/symboles.png";
import themeRituels from "../assets/themes/rituels.png";
import themeHistoire from "../assets/themes/histoire.png";
import themeReglement from "../assets/themes/reglement.png";
import themeDefis from "../assets/themes/defis.png";

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
    label: "MIX",
    headerFrom: "#1F2937",
    headerTo: "#0B1220",
    image: themeSymboles,
  },
};

// mini bank prototype
const BANK = [
  {
    id: "sym-1",
    theme: "symboles",
    title: "QUESTION",
    points: 1,
    question: "Que symbolisent principalement l’équerre et le compas ?",
    answers: [
      "La hiérarchie et le pouvoir",
      "La mesure, la rectitude et la maîtrise de soi",
      "L’appartenance à un ordre ancien",
      "La transmission des secrets opératifs",
    ],
    correctIndexes: [1],
    feedback: "Classiquement : rectitude, mesure, équilibre, travail intérieur.",
  },
  {
    id: "rit-1",
    theme: "rituels",
    title: "QUESTION",
    points: 2,
    question: "À quoi sert surtout la répétition des gestes et paroles ?",
    answers: [
      "À accélérer la cérémonie",
      "À créer un cadre symbolique et mémoriel",
      "À divertir l’assemblée",
      "À remplacer l’étude personnelle",
    ],
    correctIndexes: [1],
    feedback: "Elle structure l’attention et l’intériorisation.",
  },
  {
    id: "his-1",
    theme: "histoire",
    title: "QUESTION",
    points: 3,
    question: "Pourquoi étudier l’histoire des loges ?",
    answers: [
      "Accumuler des dates",
      "Comprendre l’évolution des idées et des pratiques",
      "Remplacer l’expérience vécue",
      "Éviter la diversité",
    ],
    correctIndexes: [1],
    feedback: "Contextualiser les pratiques et influences au fil du temps.",
  },
];

function pickRandomCard() {
  return BANK[Math.floor(Math.random() * BANK.length)];
}

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

export default function CollectifRoom() {
  const { roomId } = useParams();
  const playerId = useMemo(() => getPlayerId(), []);

  const [room, setRoom] = useState(null);

  // timer local affiché
  const [qLeft, setQLeft] = useState(0);

  // choix LOCAL (avant validation)
  const [localPick, setLocalPick] = useState(null);

  // anti double finish
  const finishingRef = useRef(false);

  /* =========================
     HOOKS (toujours en haut)
     ========================= */

  // écouter la room
  useEffect(() => {
    const unsub = listenRoom(roomId, setRoom);
    return unsub;
  }, [roomId]);

  // présence
  useEffect(() => {
    const t = setInterval(() => heartbeat({ roomId, playerId }), 10000);
    return () => clearInterval(t);
  }, [roomId, playerId]);

  // timer tick
  useEffect(() => {
    const status = room?.state?.qStatus || "idle";
    const endsAt = room?.state?.qEndsAt || 0;

    if (status !== "running" || !endsAt) {
      setQLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setQLeft(left);
    }, 250);

    return () => clearInterval(interval);
  }, [room?.state?.qStatus, room?.state?.qEndsAt]);

  // reset localPick quand nouvelle question démarre / tour change
  useEffect(() => {
    setLocalPick(null);
    finishingRef.current = false;
  }, [room?.state?.qStatus, room?.state?.turnPlayerId, room?.state?.qEndsAt]);

  // auto-finish si chrono termine (⚠️ 1 seul onglet doit déclencher)
  useEffect(() => {
    const status = room?.state?.qStatus || "idle";
    const endsAt = room?.state?.qEndsAt || 0;

    if (status !== "running" || !endsAt) return;

    if (qLeft === 0) {
      if (finishingRef.current) return;
      finishingRef.current = true;
      finishQuestion(roomId);
    }
  }, [qLeft, roomId, room?.state?.qStatus, room?.state?.qEndsAt]);

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
  const isMyTurn = turnPlayerId === playerId;

  const qStatus = room?.state?.qStatus || "idle";
  const card = room?.state?.qCard || null;

  const themeKey = (card?.theme || "mix").toLowerCase();
  const theme = THEME_CONFIG[themeKey] || THEME_CONFIG.mix;

  const canAnswer = phase === "playing" && qStatus === "running" && isMyTurn;

  // start game
  const startGameFn = async () => {
    if (!isHost) return;

    const firstPlayerId =
      playersEntries.find(([id, p]) => p?.connected)?.[0] ||
      playersEntries[0]?.[0] ||
      room?.meta?.hostId;

    await updateState(roomId, {
      phase: "playing",
      turnPlayerId: firstPlayerId,
      qStatus: "idle",
      qCard: null,
      qEndsAt: 0,
    });
  };

  // host lance question
  const launchQuestion = async () => {
    if (!isHost) return;
    if (phase !== "playing") return;
    if (qStatus !== "idle") return;

    const nextCard = pickRandomCard();
    await startQuestion(roomId, nextCard, 20);
  };

  // choisir (local)
  const pick = (i) => {
    if (!canAnswer) return;
    setLocalPick(i);
  };

  // valider : écrit + termine immédiatement
  const validate = async () => {
    if (!canAnswer) return;
    if (typeof localPick !== "number") return;

    await submitAnswer(roomId, playerId, localPick);

    if (finishingRef.current) return;
    finishingRef.current = true;
    await finishQuestion(roomId);
  };

  // style réponses
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
                {isMyTurn ? "toi" : turnPlayerId}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            {phase === "lobby" && isHost && (
              <button
                onClick={startGameFn}
                className="bg-[#D4AF37] text-black rounded-md px-5 py-3 font-display tracking-[0.12em]"
              >
                DÉMARRER
              </button>
            )}

            <button
              onClick={launchQuestion}
              disabled={!isHost || phase !== "playing" || qStatus !== "idle"}
              className={[
                "rounded-md px-5 py-3 font-display tracking-[0.12em]",
                !isHost || phase !== "playing" || qStatus !== "idle"
                  ? "bg-white/10 text-white/30 cursor-not-allowed"
                  : "bg-[#D4AF37] text-black",
              ].join(" ")}
            >
              LANCER QUESTION
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="grid md:grid-cols-[1.5fr_1fr] gap-6">
          {/* LEFT BOARD */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="font-display tracking-[0.12em] text-sm mb-4">
              PLATEAU
            </div>

            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 30 }).map((_, i) => {
                const cellPlayers = playersEntries
                  .filter(([id]) => (positions[id] ?? 0) === i)
                  .map(([, p]) => p?.name?.[0]?.toUpperCase() || "?");

                return (
                  <div
                    key={i}
                    className="h-11 rounded-md border border-white/10 bg-black/20 flex items-center justify-center text-xs text-white/60"
                    title={`case ${i}`}
                  >
                    {cellPlayers.join("") || i}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-center text-white/35 text-xs">
              {phase === "lobby"
                ? "Le host doit démarrer la partie."
                : qStatus === "running"
                ? isMyTurn
                  ? "C’est ton tour : choisis puis VALIDE."
                  : "Question en cours…"
                : "Le host peut lancer la prochaine question."}
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* players */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="font-display tracking-[0.12em] text-sm mb-4">
                JOUEURS
              </div>
              <div className="space-y-3">
                {playersEntries.map(([id, p]) => (
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
                    </div>
                    <div className="text-white/40 text-sm">
                      pos: {positions[id] ?? 0} {p?.connected ? "🟢" : "⚫️"}
                      {turnPlayerId === id ? (
                        <span className="ml-2 text-[#D4AF37]">◀ tour</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* question */}
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              {/* header thème */}
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

              {/* ✅ IMPORTANT : on affiche la carte dès qu’elle existe, même si qStatus=idle */}
              <div className="px-6 py-6">
                {phase !== "playing" ? (
                  <div className="text-white/55 font-body text-sm">
                    Démarre la partie pour lancer les questions.
                  </div>
                ) : !card ? (
                  <div className="text-white/55 font-body text-sm">
                    {isHost
                      ? "Clique sur “LANCER QUESTION”."
                      : "En attente d’une question…"}
                  </div>
                ) : (
                  <>
                    {qStatus !== "running" && (
                      <div className="text-xs text-white/45 mb-2">
                        (Question affichée — en attente de la prochaine manche)
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
                          title={!isMyTurn ? "Ce n’est pas ton tour" : ""}
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

                    {/* ✅ VALIDER : seulement joueur du tour */}
                    {isMyTurn && (
                      <button
                        onClick={validate}
                        disabled={!canAnswer || typeof localPick !== "number"}
                        className={[
                          "mt-5 w-full rounded-md py-3 font-display tracking-[0.12em]",
                          !canAnswer || typeof localPick !== "number"
                            ? "bg-white/10 text-white/30 cursor-not-allowed border border-white/10"
                            : "bg-[#D4AF37] text-black border border-[#D4AF37]/30 hover:brightness-110 shadow-[0_0_26px_rgba(212,175,55,0.18)]",
                        ].join(" ")}
                        title="Valider ta réponse"
                      >
                        VALIDER
                      </button>
                    )}

                    <div className="mt-3 text-xs text-white/40 font-body">
                      {qStatus !== "running"
                        ? "En attente de la prochaine question…"
                        : isMyTurn
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
          qStatus: {qStatus} · host: {isHost ? "oui" : "non"}
        </div>
      </div>
    </div>
  );
}
