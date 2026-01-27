// src/pages/RevisionQuiz.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Lightbulb } from "lucide-react";
import StarField from "../components/ui/StarField";

import themeSymboles from "../assets/themes/symboles.png";
import themeRituels from "../assets/themes/rituels.png";
import themeHistoire from "../assets/themes/histoire.png";
import themeReglement from "../assets/themes/reglement.png";
import themeDefis from "../assets/themes/defis.png";
import themeMix from "../assets/themes/mix.png";

import pierreOr from "../assets/ui/pierre-or.png";
import DifficultyStones from "../components/ui/DifficultyStones";

const THEME_CONFIG = {
  symboles: {
    label: "SYMBOLE",
    headerFrom: "#5B2A86",
    headerTo: "#2A1447",
    image: themeSymboles,
  },
  rituels: {
    label: "RITUEL",
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
    label: "DÉFI",
    headerFrom: "#7F1D1D",
    headerTo: "#3F0E0E",
    image: themeDefis,
  },
  mix: {
    label: "MIX",
    headerFrom: "#1F2937",
    headerTo: "#0B1220",
    image: themeMix || themeSymboles,
  },
};

// ✅ mini banque d’exemples (avec points 1/2/3)
const BANK = {
  symboles: [
    {
      id: "sym-1",
      title: "QUESTION",
      points: 2,
      question:
        "Que symbolisent principalement l’équerre et le compas en franc-maçonnerie ?",
      answers: [
        "La hiérarchie et le pouvoir au sein de la loge",
        "La mesure, la rectitude et la maîtrise de soi",
        "L’appartenance à un ordre ancien",
        "La transmission des secrets opératifs",
      ],
      correctIndexes: [1],
      feedback:
        "L’équerre et le compas renvoient classiquement à la rectitude, la mesure, l’équilibre et le travail intérieur.",
    },
  ],
  rituels: [
    {
      id: "rit-1",
      title: "QUESTION",
      points: 3,
      question:
        "Dans un cadre rituel, à quoi sert principalement la répétition des gestes et des paroles ?",
      answers: [
        "À accélérer la cérémonie",
        "À créer un cadre symbolique et mémoriel",
        "À divertir l’assemblée",
        "À remplacer l’étude personnelle",
      ],
      correctIndexes: [1],
      feedback:
        "La répétition structure l’attention, renforce la mémoire symbolique et installe un rythme propice à l’intériorisation.",
    },
  ],
  histoire: [
    {
      id: "his-1",
      title: "QUESTION",
      points: 1,
      question:
        "Quel est l’intérêt d’étudier l’histoire des courants initiatiques et des loges ?",
      answers: [
        "Accumuler des dates",
        "Comprendre l’évolution des idées et des pratiques",
        "Remplacer l’expérience vécue",
        "Éviter toute diversité de points de vue",
      ],
      correctIndexes: [1],
      feedback:
        "L’histoire aide à contextualiser les pratiques et à comprendre les influences culturelles et philosophiques au fil du temps.",
    },
  ],
  reglement: [
    {
      id: "reg-1",
      title: "QUESTION",
      points: 2,
      question:
        "À quoi sert principalement un règlement intérieur dans une organisation ?",
      answers: [
        "À décourager les nouveaux",
        "À clarifier le cadre commun et les règles de fonctionnement",
        "À supprimer toute liberté individuelle",
        "À remplacer les décisions collectives",
      ],
      correctIndexes: [1],
      feedback:
        "Un règlement intérieur fixe un cadre clair : rôles, procédures, règles de vie commune et principes de fonctionnement.",
    },
  ],
  defis: [
    {
      id: "def-1",
      title: "DÉFI",
      points: 2,
      question:
        "Choisissez la meilleure réponse : un défi initiatique personnel vise surtout à…",
      answers: [
        "Se comparer aux autres",
        "Travailler une discipline et une introspection concrète",
        "Gagner uniquement des récompenses",
        "Éviter toute remise en question",
      ],
      correctIndexes: [1],
      feedback:
        "L’objectif est l’effort intérieur : discipline, constance, observation de soi et progression personnelle.",
    },
  ],
};

function buildMixBank() {
  return Object.values(BANK).flat();
}

export default function RevisionQuiz() {
  const { themeId } = useParams();
  const navigate = useNavigate();

  const themeKey = (themeId || "").toLowerCase();
  const theme = THEME_CONFIG[themeKey] || THEME_CONFIG.symboles;

  const cards = useMemo(() => {
    if (themeKey === "mix") return buildMixBank();
    return BANK[themeKey] || BANK.symboles;
  }, [themeKey]);

  const [index, setIndex] = useState(0);

  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const card = cards[index];
  const correctSet = useMemo(() => new Set(card.correctIndexes), [card]);

  const resetCard = () => {
    setPicked(null);
    setRevealed(false);
  };

  const restart = () => {
    setIndex(0);
    resetCard();
  };

  const nextCard = () => {
    if (index < cards.length - 1) {
      setIndex((i) => i + 1);
      resetCard();
    } else {
      navigate("/revision");
    }
  };

  const onPick = (i) => {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
  };

  const answerClass = (i) => {
    if (!revealed) {
      return [
        "border-white/10 bg-[#0B1120]/35 hover:border-white/20",
        "hover:bg-white/5",
      ].join(" ");
    }

    const isCorrect = correctSet.has(i);
    const isPicked = picked === i;

    if (isCorrect) {
      return [
        "border-emerald-400/70 bg-emerald-500/12",
        "shadow-[0_0_0_1px_rgba(52,211,153,0.25),0_0_24px_rgba(16,185,129,0.10)]",
      ].join(" ");
    }

    if (isPicked && !isCorrect) {
      return [
        "border-red-400/70 bg-red-500/10",
        "shadow-[0_0_0_1px_rgba(248,113,113,0.22),0_0_22px_rgba(239,68,68,0.10)]",
      ].join(" ");
    }

    return "border-white/10 bg-[#0B1120]/35 opacity-80";
  };

  const progressPct = Math.round(((index + 1) / cards.length) * 100);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

      <header className="relative z-10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/revision"
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] text-xs"
          >
            <ArrowLeft size={16} />
            THÉMATIQUES
          </Link>

          <div className="font-display tracking-[0.18em] text-sm">
            MODE <span className="text-[#D4AF37]">RÉVISION</span>
          </div>

          <button
            onClick={restart}
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-white/50 hover:text-white/75 text-xs"
          >
            <RotateCcw size={16} />
            RECOMMENCER
          </button>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-5xl mx-auto rounded-2xl border border-[#D4AF37]/25 bg-white/5 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.35)]"
          >
            <div
              className="px-10 md:px-12 py-8 md:py-10"
              style={{
                background: `linear-gradient(180deg, ${theme.headerFrom}, ${theme.headerTo})`,
              }}
            >
              {/* ✅ header = gauche (thème) + droite (progress + difficulté) */}
              <div className="flex items-start justify-between gap-8">
                <div className="flex items-start gap-8">
                  <img
                    src={theme.image}
                    alt={theme.label}
                    draggable="false"
                    className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                  />

                  <div>
                    <div className="font-display tracking-[0.22em] text-2xl md:text-3xl">
                      {card.title}
                    </div>

                    <div className="mt-4 h-px w-56 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

                    <div className="mt-4 font-display tracking-[0.18em] text-sm text-white/70">
                      {theme.label}
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-2">
                  <div className="font-display tracking-[0.14em] text-xs text-white/70">
                    CARTE {index + 1} / {cards.length}
                  </div>

                  <div className="font-display text-xs text-white/60">
                    {progressPct}%
                  </div>

                  <DifficultyStones
                    points={card.points || 1}
                    src={pierreOr}
                  />
                </div>
              </div>
            </div>

            <div className="px-10 md:px-12 py-10 md:py-12">
              <div className="font-body text-lg md:text-xl text-white/80 italic mb-8">
                {card.question}
              </div>

              <div className="space-y-4">
                {card.answers.map((a, i) => {
                  const isCorrect = revealed && correctSet.has(i);
                  const isPicked = revealed && picked === i;
                  const showGood = isCorrect;
                  const showBad = isPicked && !isCorrect;

                  return (
                    <button
                      key={i}
                      onClick={() => onPick(i)}
                      className={[
                        "w-full text-left rounded-xl border px-6 py-4 transition",
                        "font-body text-sm md:text-base",
                        answerClass(i),
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="font-display text-[#D4AF37]/80 w-7">
                            {i + 1}.
                          </span>
                          <span className="text-white/80">{a}</span>
                        </div>

                        {showGood && (
                          <span className="text-emerald-300 font-display text-lg">✓</span>
                        )}
                        {showBad && (
                          <span className="text-red-300 font-display text-lg">✗</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-8 rounded-xl border border-[#D4AF37]/25 bg-[#0B1120]/35 px-6 py-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37]">
                      <Lightbulb size={18} />
                    </div>
                    <p className="font-body text-sm text-[#D4AF37]/85">
                      {card.feedback}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="px-10 md:px-12 py-10 bg-gradient-to-b from-transparent to-black/25 border-t border-white/10">
              <button
                onClick={nextCard}
                disabled={!revealed}
                className={[
                  "mx-auto block min-w-[280px] px-10 py-4 rounded-md",
                  "font-display tracking-[0.18em] text-sm",
                  revealed
                    ? "bg-[#D4AF37] text-black hover:brightness-110 shadow-[0_0_36px_rgba(212,175,55,0.22)] border border-[#D4AF37]/30"
                    : "bg-white/5 text-white/25 border border-white/10 cursor-not-allowed",
                ].join(" ")}
              >
                CARTE SUIVANTE
              </button>
            </div>
          </motion.div>

          <div className="max-w-5xl mx-auto mt-6 text-center text-white/35 font-body text-xs">
            Carte {index + 1} / {cards.length}
          </div>
        </div>
      </main>
    </div>
  );
}
