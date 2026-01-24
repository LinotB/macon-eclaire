// src/pages/DuelResult.jsx
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  Clock,
  RotateCcw,
  Swords,
  ShieldAlert,
} from "lucide-react";
import StarField from "../components/ui/StarField";

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function DuelResult() {
  const { duelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // state envoyé depuis DuelPlay.jsx
  const state = location.state || {};
  const {
    title = "DUEL",
    subtitle = "",
    totalQuestions = 0,
    correctCount = 0,
    wrongCount = 0,
    globalLeft = 0,
    totalSeconds = 0,
    finishedReason = "completed", // "time" | "completed"
  } = state;

  const answered = correctCount + wrongCount;
  const total = totalQuestions || answered || 1;

  const pct = Math.round((correctCount / total) * 100);
  const timeUsed = Math.max(0, (totalSeconds || 0) - (globalLeft || 0));

  // règle simple : victoire si >= 60%
  const won = pct >= 60;

  const headline = won ? "VICTOIRE" : "DÉFAITE";
  const subline = won
    ? "Tu progresses sur le chemin de la maîtrise."
    : "Ne lâche rien : la pierre se taille par l’effort.";

  const reasonLine =
    finishedReason === "time"
      ? "Temps écoulé — le duel s’arrête."
      : "Duel terminé — toutes les questions ont été traitées.";

  // récompenses (placeholder)
  const rewardLabel = won
    ? duelId === "quick"
      ? "Cosmétique commun"
      : duelId === "standard"
      ? "Cosmétique rare"
      : "Cosmétique épique"
    : "Aucune récompense (défaite)";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />

      {/* overlays */}
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
            RÉSULTAT <span className="text-[#D4AF37]">DUEL</span>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-white/50 hover:text-white/75 text-xs"
          >
            MENU
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-[#D4AF37]/18 bg-white/5 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.35)]"
          >
            <div className="px-10 py-10 text-center">
              <div
                className={[
                  "mx-auto w-14 h-14 rounded-2xl border flex items-center justify-center mb-5",
                  won
                    ? "bg-[#D4AF37]/12 border-[#D4AF37]/20 text-[#D4AF37]"
                    : "bg-red-500/10 border-red-500/20 text-red-300",
                ].join(" ")}
              >
                {won ? <Trophy size={22} /> : <ShieldAlert size={22} />}
              </div>

              <div className="font-display tracking-[0.22em] text-2xl text-white/90">
                {title}
              </div>
              {subtitle ? (
                <div className="mt-2 font-body text-white/60 italic">
                  {subtitle}
                </div>
              ) : null}

              <div className="mt-6 h-px w-64 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

              <div className="mt-7">
                <div
                  className={[
                    "font-display tracking-[0.22em] text-3xl",
                    won ? "text-emerald-300" : "text-red-300",
                  ].join(" ")}
                >
                  {headline}
                </div>
                <div className="mt-2 font-body text-white/60 italic">
                  {subline}
                </div>
                <div className="mt-3 font-body text-white/40 text-sm italic">
                  {reasonLine}
                </div>
              </div>

              {/* Stats grid */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-[#0B1120]/35 p-6">
                  <div className="font-display tracking-[0.14em] text-xs text-white/60">
                    BONNES RÉPONSES
                  </div>
                  <div className="mt-2 font-display text-3xl text-emerald-400">
                    {correctCount}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0B1120]/35 p-6">
                  <div className="font-display tracking-[0.14em] text-xs text-white/60">
                    ERREURS / TEMPS ÉCOULÉ
                  </div>
                  <div className="mt-2 font-display text-3xl text-red-400">
                    {wrongCount}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0B1120]/35 p-6">
                  <div className="font-display tracking-[0.14em] text-xs text-white/60">
                    RÉUSSITE
                  </div>
                  <div className="mt-2 font-display text-3xl text-[#D4AF37]">
                    {pct}%
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0B1120]/35 p-6">
                  <div className="font-display tracking-[0.14em] text-xs text-white/60">
                    TEMPS
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <Clock size={16} className="text-[#D4AF37]" />
                    <div className="font-display text-sm text-white/80">
                      restant {fmtTime(globalLeft)} · utilisé {fmtTime(timeUsed)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward */}
              <div className="mt-8 rounded-xl border border-[#D4AF37]/20 bg-[#0B1120]/35 px-6 py-5 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37]">
                    <Swords size={18} />
                  </div>
                  <div>
                    <div className="font-display tracking-[0.14em] text-xs text-white/70">
                      RÉCOMPENSE
                    </div>
                    <div className="mt-1 font-body text-sm text-[#D4AF37]/85">
                      {rewardLabel}
                    </div>
                    <div className="mt-2 font-body text-xs text-white/40 italic">
                      (Tu brancheras plus tard le vrai inventaire / cosmétiques.)
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => navigate(`/duel/${duelId}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-4 font-display tracking-[0.18em] text-sm bg-[#D4AF37] text-black hover:brightness-110 transition shadow-[0_0_36px_rgba(212,175,55,0.18)] border border-[#D4AF37]/30"
                >
                  <RotateCcw size={16} />
                  REJOUER
                </button>

                <Link
                  to="/duel"
                  className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-4 font-display tracking-[0.18em] text-sm bg-white/5 text-white/75 hover:text-white/90 transition border border-white/10"
                >
                  CHANGER DE DUEL
                </Link>

                <Link
                  to="/menu"
                  className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-4 font-display tracking-[0.18em] text-sm bg-white/5 text-white/75 hover:text-white/90 transition border border-white/10"
                >
                  MENU
                </Link>
              </div>

              <p className="mt-6 font-body text-xs text-white/40 italic">
                “La victoire n’est pas l’autre : elle est la maîtrise de soi.”
              </p>
            </div>
          </motion.div>

          {!location.state && (
            <div className="mt-6 text-center text-white/35 font-body text-xs">
              (Astuce : cette page attend des données via navigate state. Reviens
              depuis un duel pour voir le vrai résultat.)
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
