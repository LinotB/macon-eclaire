// src/pages/DuelPlay.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Swords } from "lucide-react";
import StarField from "../components/ui/StarField";

// ✅ images officielles des thématiques
import themeSymboles from "../assets/themes/symboles.png";
import themeRituels from "../assets/themes/rituels.png";
import themeHistoire from "../assets/themes/histoire.png";
import themeReglement from "../assets/themes/reglement.png";
import themeDefis from "../assets/themes/defis.png";
import themeMix from "../assets/themes/mix.png";

import { useProgress } from "../context/ProgressContext";
import pierreOr from "../assets/ui/pierre-or.png";

// ✅ banque centralisée
import { getQuestions } from "../data/questions";

// -------------------------
// Config duel
// -------------------------
const DUEL_CONFIG = {
  quick: {
    title: "DUEL ÉCLAIR",
    subtitle: "5 questions rapides contre l’IA",
    totalQuestions: 5,
    seconds: 3 * 60,
    headerFrom: "#B8941F",
    headerTo: "#D4AF37",
  },
  standard: {
    title: "DUEL CLASSIQUE",
    subtitle: "10 questions avec chrono",
    totalQuestions: 10,
    seconds: 8 * 60,
    headerFrom: "#1E3A8A",
    headerTo: "#0F1F4A",
  },
  challenge: {
    title: "DÉFI DU MAÎTRE",
    subtitle: "15 questions difficiles",
    totalQuestions: 15,
    seconds: 15 * 60,
    headerFrom: "#5B2A86",
    headerTo: "#2A1447",
  },
};

// -------------------------
// Config thématiques (couleurs + images)
// -------------------------
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
    image: themeMix,
  },
};

// -------------------------
// Helpers
// -------------------------
function fmtTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * ✅ Rendu difficulté plus élégant:
 * - 1/2/3 pierres
 * - + un petit badge "NIVEAU" à côté
 * - avec halo / opacity progressive
 */
function DifficultyStones({ points = 1, src }) {
  const n = Math.max(1, Math.min(3, Number(points) || 1));

  const label = n === 1 ? "FACILE" : n === 2 ? "INTERMÉDIAIRE" : "DIFFICILE";

  return (
    <div className="inline-flex items-center gap-3">
      <div className="inline-flex items-center gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => {
          const active = i < n;
          return (
            <div
              key={i}
              className={[
                "relative w-6 h-6",
                active ? "opacity-100" : "opacity-25",
              ].join(" ")}
            >
              {active && (
                <div className="absolute inset-0 rounded-full blur-md bg-[#D4AF37]/25" />
              )}
              <img
                src={src}
                alt=""
                className="relative w-6 h-6 object-contain select-none"
                draggable="false"
              />
            </div>
          );
        })}
      </div>

      <div className="hidden md:inline-flex items-center">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-display tracking-[0.16em] border border-white/15 bg-black/20 text-white/70">
          {label}
        </span>
      </div>
    </div>
  );
}

// -------------------------
// Page
// -------------------------
export default function DuelPlay() {
  const { duelId } = useParams();
  const navigate = useNavigate();

  // ✅ Progress context
  const { recordAnswer, recordDuelFinished } = useProgress();

  const cfg = DUEL_CONFIG[duelId] || DUEL_CONFIG.quick;

  // ✅ chrono global
  const [globalLeft, setGlobalLeft] = useState(cfg.seconds);

  // ✅ score
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // ✅ état “fin”
  const [finished, setFinished] = useState(false);
  const [finishedReason, setFinishedReason] = useState("completed"); // "time" | "completed"

  // ✅ évite navigation multiple
  const didNavigate = useRef(false);

  // ✅ évite recordDuelFinished multiple
  const [resultSaved, setResultSaved] = useState(false);

  // ✅ banque de cartes pour CE duel (depuis src/data/questions)
  const cards = useMemo(() => {
    // difficulté: quick=1, standard=2, challenge=3 (tu peux ajuster)
    const difficulty =
      duelId === "quick" ? 1 : duelId === "standard" ? 2 : 3;

    const list = getQuestions({
      theme: "mix", // duel = mix (tu peux mettre une thématique spécifique si besoin)
      difficulty,
      count: cfg.totalQuestions,
      shuffle: true,
    });

    // fallback si ta banque est vide
    if (!list || list.length === 0) {
      return [
        {
          id: `fallback-${Date.now()}`,
          theme: "symboles",
          title: "QUESTION",
          points: 1,
          question:
            "Aucune question trouvée dans la banque (src/data/questions). Ajoute des questions et relance.",
          answers: ["OK"],
          correctIndexes: [0],
          feedback: "Ajoute des questions dans src/data/questions/<theme>.<difficulty>.js",
        },
      ];
    }

    return list;
  }, [cfg.totalQuestions, duelId]);

  const [index, setIndex] = useState(0);
  const card = cards[index];

  // ✅ thème de la carte
  const themeKey = (card?.theme || "mix").toLowerCase();
  const theme = THEME_CONFIG[themeKey] || THEME_CONFIG.mix;

  // ✅ chrono par question
  const perQuestionSeconds = useMemo(() => {
    const raw = Math.floor(cfg.seconds / cfg.totalQuestions);
    return Math.max(10, raw);
  }, [cfg.seconds, cfg.totalQuestions]);

  const [qLeft, setQLeft] = useState(perQuestionSeconds);

  // ✅ choix utilisateur
  const correctSet = useMemo(() => new Set(card?.correctIndexes || []), [card]);
  const isMulti = (card?.correctIndexes || []).length > 1;

  const [pickedIndex, setPickedIndex] = useState(null);
  const [pickedSet, setPickedSet] = useState(() => new Set());
  const [revealed, setRevealed] = useState(false);

  const resetQuestionState = () => {
    setPickedIndex(null);
    setPickedSet(new Set());
    setRevealed(false);
    setQLeft(perQuestionSeconds);
  };

  useEffect(() => {
    resetQuestionState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, perQuestionSeconds]);

  // -------------------------
  // Timer global
  // -------------------------
  useEffect(() => {
    if (finished) return;
    if (globalLeft <= 0) return;

    const t = setInterval(() => setGlobalLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [globalLeft, finished]);

  useEffect(() => {
    if (finished) return;
    if (globalLeft === 0) {
      setFinishedReason("time");
      setFinished(true);
    }
  }, [globalLeft, finished]);

  // -------------------------
  // Timer question
  // -------------------------
  useEffect(() => {
    if (finished) return;
    if (revealed) return;
    if (qLeft <= 0) return;

    const t = setInterval(() => setQLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [qLeft, revealed, finished]);

  // si le temps question tombe à 0 => reveal + next auto
  useEffect(() => {
    if (finished) return;
    if (revealed) return;
    if (qLeft === 0) {
      setRevealed(true);
      setWrongCount((w) => w + 1);

      // ✅ enregistre réponse (timeout => faux)
      recordAnswer({ theme: themeKey, mode: "duel", isCorrect: false });

      const t = setTimeout(() => {
        goNext();
      }, 1600);

      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qLeft, revealed, finished, themeKey, recordAnswer]);

  // -------------------------
  // Navigation question suivante / fin
  // -------------------------
  const goNext = () => {
    if (index < cards.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setFinishedReason("completed");
      setFinished(true);
    }
  };

  // ✅ enregistre la fin du duel 1 seule fois
  useEffect(() => {
    if (!finished || resultSaved) return;

    const total = correctCount + wrongCount;
    const win = total > 0 ? correctCount / total >= 0.6 : false;

    const xpBonus = win ? 50 : 0;

    const rewardId =
      win && duelId === "quick"
        ? "cos_common_1"
        : win && duelId === "standard"
        ? "cos_rare_1"
        : win && duelId === "challenge"
        ? "cos_epic_1"
        : null;

    recordDuelFinished({ won: win, xpBonus, rewardId });
    setResultSaved(true);
  }, [
    finished,
    resultSaved,
    correctCount,
    wrongCount,
    duelId,
    recordDuelFinished,
  ]);

  // ✅ quand finished = true => on va sur la page result
  useEffect(() => {
    if (!finished) return;
    if (didNavigate.current) return;

    didNavigate.current = true;

    navigate(`/duel/${duelId}/result`, {
      replace: true,
      state: {
        title: cfg.title,
        subtitle: cfg.subtitle,
        totalQuestions: cfg.totalQuestions,
        correctCount,
        wrongCount,
        globalLeft,
        totalSeconds: cfg.seconds,
        finishedReason,
      },
    });
  }, [
    finished,
    duelId,
    navigate,
    cfg.title,
    cfg.subtitle,
    cfg.totalQuestions,
    cfg.seconds,
    correctCount,
    wrongCount,
    globalLeft,
    finishedReason,
  ]);

  // -------------------------
  // Validation / scoring
  // -------------------------
  const validateMulti = () => {
    if (revealed) return;

    const user = pickedSet;

    const allCorrectPicked =
      user.size > 0 &&
      user.size === correctSet.size &&
      [...user].every((x) => correctSet.has(x));

    setRevealed(true);

    if (allCorrectPicked) setCorrectCount((c) => c + 1);
    else setWrongCount((w) => w + 1);

    // ✅ enregistre réponse multi
    recordAnswer({ theme: themeKey, mode: "duel", isCorrect: allCorrectPicked });

    setTimeout(() => goNext(), 2200);
  };

  const pickSingle = (i) => {
    if (revealed) return;

    setPickedIndex(i);
    setRevealed(true);

    const ok = correctSet.has(i);

    if (ok) setCorrectCount((c) => c + 1);
    else setWrongCount((w) => w + 1);

    // ✅ enregistre la réponse single
    recordAnswer({ theme: themeKey, mode: "duel", isCorrect: ok });

    setTimeout(() => goNext(), 2000);
  };

  const toggleMulti = (i) => {
    if (revealed) return;
    setPickedSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  // -------------------------
  // Classes réponses (vert/rouge)
  // -------------------------
  const answerClass = (i) => {
    const base = "border-white/10 bg-[#0B1120]/35 hover:border-white/20";

    if (!revealed) {
      if (isMulti && pickedSet.has(i)) {
        return "border-[#D4AF37]/35 bg-[#D4AF37]/10";
      }
      return base;
    }

    const isCorrect = correctSet.has(i);
    const isPicked = isMulti ? pickedSet.has(i) : pickedIndex === i;

    if (isCorrect) return "border-emerald-500/60 bg-emerald-500/15";
    if (isPicked && !isCorrect) return "border-red-500/60 bg-red-500/12";

    return "border-white/10 bg-[#0B1120]/35 opacity-80";
  };

  const progressPct = Math.round(((index + 1) / cfg.totalQuestions) * 100);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/duel"
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors text-xs"
          >
            <ArrowLeft size={16} />
            RETOUR DUELS
          </Link>

          <div className="font-display tracking-[0.18em] text-sm">
            DUEL <span className="text-[#D4AF37]">INITIATIQUE</span>
          </div>

          <div className="inline-flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5">
              <Clock size={16} className="text-[#D4AF37]" />
              <span className="font-display text-xs tracking-[0.12em] text-white/80">
                {fmtTime(globalLeft)}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5">
              <span className="font-display text-xs tracking-[0.12em] text-white/55">
                {qLeft}s
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={card?.id || index}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-5xl mx-auto rounded-2xl border border-[#D4AF37]/18 bg-white/5 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.35)]"
          >
            {/* Header couleur par THÈME */}
            <div
              className="px-10 py-8 border-b border-white/10"
              style={{
                background: `linear-gradient(180deg, ${theme.headerFrom}, ${theme.headerTo})`,
              }}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                  <img
                    src={theme.image}
                    alt={theme.label}
                    className="w-14 h-14 md:w-16 md:h-16 object-contain select-none"
                    draggable="false"
                  />

                  <div>
                    <div className="font-display tracking-[0.22em] text-2xl md:text-3xl text-white/95">
                      {card?.title || "QUESTION"}
                    </div>

                    <div className="mt-3 h-px w-64 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

                    <div className="mt-4 font-display tracking-[0.18em] text-sm text-white/80">
                      {theme.label}
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <div className="font-display tracking-[0.14em] text-xs text-white/70">
                    QUESTION {index + 1} / {cfg.totalQuestions}
                  </div>

                  <div className="font-display text-xs text-white/60">
                    {progressPct}%
                  </div>

                  <DifficultyStones points={card?.points || 1} src={pierreOr} />
                </div>
              </div>

              <div className="mt-6 h-2 rounded-full bg-black/25 overflow-hidden border border-white/10">
                <div
                  className="h-full"
                  style={{
                    width: `${progressPct}%`,
                    background:
                      "linear-gradient(90deg, rgba(184,148,31,1), rgba(212,175,55,1))",
                  }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="px-10 py-10">
              <div className="font-body text-lg md:text-xl text-white/80 italic mb-8">
                {card?.question}
              </div>

              <div className="space-y-4">
                {(card?.answers || []).map((a, i) => {
                  const isCorrect = revealed && correctSet.has(i);
                  const isPicked = revealed
                    ? isMulti
                      ? pickedSet.has(i)
                      : pickedIndex === i
                    : false;

                  const showGood = isCorrect;
                  const showBad = isPicked && !isCorrect;

                  const onClick = () => {
                    if (revealed) return;
                    if (isMulti) toggleMulti(i);
                    else pickSingle(i);
                  };

                  return (
                    <button
                      key={i}
                      onClick={onClick}
                      className={[
                        "w-full text-left rounded-xl border px-6 py-4 transition",
                        "font-body text-sm md:text-base",
                        answerClass(i),
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="font-display text-[#D4AF37]/80 w-6">
                            {i + 1}.
                          </span>
                          <span className="text-white/75">{a}</span>
                        </div>

                        {showGood && (
                          <span className="text-emerald-400 font-display">✓</span>
                        )}
                        {showBad && (
                          <span className="text-red-400 font-display">✗</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* bouton valider pour multi */}
              {isMulti && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={validateMulti}
                    disabled={revealed || pickedSet.size === 0}
                    className={[
                      "min-w-[240px] rounded-md px-10 py-4 font-display tracking-[0.18em] text-sm transition",
                      revealed || pickedSet.size === 0
                        ? "bg-white/5 text-white/25 border border-white/10 cursor-not-allowed"
                        : "bg-[#D4AF37] text-black hover:brightness-110 shadow-[0_0_36px_rgba(212,175,55,0.18)] border border-[#D4AF37]/30",
                    ].join(" ")}
                  >
                    VALIDER
                  </button>
                </div>
              )}

              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-8 rounded-xl border border-[#D4AF37]/20 bg-[#0B1120]/35 px-6 py-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37]">
                      <Swords size={18} />
                    </div>
                    <p className="font-body text-sm text-[#D4AF37]/80">
                      {card?.feedback}
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="mt-8 text-center text-white/35 font-body text-xs">
                (La carte suivante est automatique après réponse / temps écoulé)
              </div>
            </div>
          </motion.div>

          <div className="max-w-5xl mx-auto mt-6 text-center text-white/35 font-body text-xs">
            ✅ {correctCount} bonnes · ❌ {wrongCount} erreurs · ⏱️{" "}
            {fmtTime(globalLeft)}
          </div>
        </div>
      </main>
    </div>
  );
}
