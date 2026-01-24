import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import StarField from "../components/ui/StarField";
import RadarChart from "../components/game/RadarChart";
import {
  ArrowLeft,
  TrendingUp,
  Target,
  Lightbulb,
  BarChart3,
  User,
  Settings,
} from "lucide-react";

export default function BilanInitiatique() {
  const navigate = useNavigate();

  // ✅ Démo : tu brancheras ensuite sur ton vrai state / backend
  const performanceByTheme = {
    symboles: 85,
    rituels: 65,
    histoire: 78,
    philosophie: 55,
    architecture: 70,
    outils: 62,
  };

  const modePerformance = {
    collectif: { correct: 24, total: 30 },
    duel: { correct: 18, total: 25 },
    revision: { correct: 45, total: 50 },
    preparation: { correct: 12, total: 20 },
  };

  const toPct = (c, t) => (t === 0 ? 0 : Math.round((c / t) * 100));

  const strengths = Object.entries(performanceByTheme)
    .filter(([, v]) => v >= 70)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const weaknesses = Object.entries(performanceByTheme)
    .filter(([, v]) => v < 60)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3);

  const suggestedTheme = weaknesses[0]?.[0] ?? "symboles";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />

      {/* overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

      {/* Header + icônes top */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] text-xs"
          >
            <ArrowLeft size={16} />
            RETOUR
          </Link>

          <div className="font-display tracking-[0.18em] text-sm">
            BILAN <span className="text-[#D4AF37]">INITIATIQUE</span>
          </div>

          {/* ✅ Les 3 icônes en haut : profil / stats / réglages */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:border-[#D4AF37]/25 transition flex items-center justify-center text-white/70 hover:text-white/90"
              aria-label="Profil"
              title="Profil"
              type="button"
            >
              <User size={18} />
            </button>

            <button
              onClick={() => navigate("/bilan")}
              className="w-10 h-10 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 transition flex items-center justify-center text-[#D4AF37]"
              aria-label="Bilan"
              title="Bilan"
              type="button"
            >
              <BarChart3 size={18} />
            </button>

            <button
              onClick={() => navigate("/settings")}
              className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:border-[#D4AF37]/25 transition flex items-center justify-center text-white/70 hover:text-white/90"
              aria-label="Réglages"
              title="Réglages"
              type="button"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-4 mb-10"
          >
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#D4AF37]/12 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-5">
              ∴
            </div>

            <h1 className="font-display text-3xl md:text-4xl tracking-[0.12em] mb-2">
              Bilan <span className="text-[#D4AF37]">Initiatique</span>
            </h1>

            <p className="font-body text-white/60 italic">
              “Connais-toi toi-même” — Analyse de votre progression initiatique
            </p>

            <div className="mt-6 h-px w-72 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
          </motion.div>

          {/* Top grid : radar + forces/axes */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Radar card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-[0_0_60px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/12 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div className="font-display tracking-[0.12em] text-sm text-white/90">
                    VOTRE PROGRESSION PAR THÉMATIQUE
                  </div>
                  <div className="font-body text-xs text-white/45">
                    Vue d’ensemble des forces et des zones à renforcer
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <RadarChart data={performanceByTheme} size={360} />
              </div>

              {/* barres rapides sous radar (comme tes PJ) */}
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                {Object.entries(performanceByTheme).slice(0, 6).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-xl border border-white/10 bg-[#0B1120]/25 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display tracking-[0.10em] text-xs text-white/70">
                        {k.toUpperCase()}
                      </span>
                      <span className="font-display text-xs text-[#D4AF37]/90">
                        {v}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-black/25 overflow-hidden border border-white/10">
                      <div
                        className="h-full"
                        style={{
                          width: `${v}%`,
                          background:
                            "linear-gradient(90deg, rgba(184,148,31,1), rgba(212,175,55,1))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Forces */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="rounded-2xl border border-emerald-400/18 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(11,17,32,0.20))] p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
                    <TrendingUp size={18} />
                  </div>
                  <div className="font-display tracking-[0.12em] text-sm text-white/90">
                    VOS FORCES ACTUELLES
                  </div>
                </div>

                {strengths.length === 0 ? (
                  <p className="font-body text-sm text-emerald-100/60">
                    Continuez à jouer pour identifier vos points forts.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {strengths.map(([k, v]) => (
                      <li
                        key={k}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0B1120]/20 px-4 py-3"
                      >
                        <span className="font-body text-sm text-white/80">
                          {k.charAt(0).toUpperCase() + k.slice(1)}
                        </span>
                        <span className="font-display text-sm text-emerald-300">
                          {v}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>

              {/* Axes */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="rounded-2xl border border-[#D4AF37]/18 bg-[linear-gradient(180deg,rgba(212,175,55,0.08),rgba(11,17,32,0.20))] p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/12 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                    <Target size={18} />
                  </div>
                  <div className="font-display tracking-[0.12em] text-sm text-white/90">
                    AXES DE TRAVAIL
                  </div>
                </div>

                {weaknesses.length === 0 ? (
                  <p className="font-body text-sm text-white/60">
                    Excellent ! Aucun axe prioritaire identifié.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {weaknesses.map(([k, v]) => (
                      <div key={k}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-body text-sm text-white/80">
                            {k.charAt(0).toUpperCase() + k.slice(1)}
                          </span>
                          <span className="font-display text-sm text-[#D4AF37]">
                            {v}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-black/25 overflow-hidden border border-white/10">
                          <div
                            className="h-full"
                            style={{
                              width: `${v}%`,
                              background:
                                "linear-gradient(90deg, rgba(148,90,25,1), rgba(212,175,55,0.85))",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigate(`/revision/${suggestedTheme}`)}
                  className="mt-5 w-full rounded-md px-5 py-3 font-display tracking-[0.16em] text-xs bg-[#D4AF37] text-black hover:brightness-110 transition border border-[#D4AF37]/30"
                >
                  TRAVAILLER CES THÉMATIQUES →
                </button>
              </motion.div>
            </div>
          </div>

          {/* Performance par mode */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8"
          >
            <div className="text-center font-display tracking-[0.12em] text-sm text-white/90 mb-6">
              PERFORMANCE PAR MODE
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(modePerformance).map(([mode, d]) => {
                const pct = toPct(d.correct, d.total);
                return (
                  <div
                    key={mode}
                    className="rounded-2xl border border-white/10 bg-[#0B1120]/25 p-5 text-center"
                  >
                    <div className="font-display text-3xl text-[#D4AF37]">
                      {pct}%
                    </div>
                    <div className="mt-1 font-display tracking-[0.12em] text-xs text-white/65 capitalize">
                      {mode}
                    </div>
                    <div className="mt-2 font-body text-xs text-white/45">
                      {d.correct}/{d.total} réponses
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Suggestion personnalisée */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-6 rounded-2xl border border-blue-400/18 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),rgba(124,58,237,0.12))] p-6 md:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-blue-300">
                <Lightbulb size={22} />
              </div>

              <div className="flex-1">
                <div className="font-display tracking-[0.12em] text-sm text-white/90 mb-2">
                  SUGGESTION PERSONNALISÉE
                </div>

                <p className="font-body text-sm text-white/60 leading-relaxed">
                  Nous vous suggérons de consacrer du temps à la thématique{" "}
                  <span className="text-[#D4AF37]/90">
                    “{suggestedTheme}”
                  </span>{" "}
                  en mode Révision, afin de renforcer cette connaissance et
                  d’équilibrer votre progression initiatique.
                </p>

                <button
                  type="button"
                  onClick={() => navigate(`/revision/${suggestedTheme}`)}
                  className="mt-4 inline-flex items-center gap-2 font-display tracking-[0.14em] text-xs text-blue-300 hover:text-blue-200 transition"
                >
                  Approfondir cette thématique <span className="text-base">→</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quote bottom */}
          <div className="text-center mt-10">
            <p className="font-body text-sm text-white/35 italic">
              “La pierre brute se taille jour après jour, avec patience et persévérance.”
            </p>
            <span className="text-[#D4AF37] text-lg mt-4 block">∴</span>
          </div>
        </div>
      </main>
    </div>
  );
}
