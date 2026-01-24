// src/pages/Stats.jsx
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, TrendingUp, Target, Lightbulb } from "lucide-react";
import StarField from "../components/ui/StarField";
import { useCharacter } from "../context/CharacterContext";
import { useProgress } from "../context/ProgressContext";
import RadarChart from "../components/game/RadarChart";

const THEMES = [
  { key: "symboles", label: "Symboles" },
  { key: "rituels", label: "Rituels" },
  { key: "histoire", label: "Histoire" },
  { key: "reglement", label: "Règlement" },
  { key: "defis", label: "Défis" },
];

function pct(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export default function Stats() {
  const navigate = useNavigate();
  const { character } = useCharacter();
  const { stats } = useProgress();

  const pseudo = character?.pseudo || "Initié";
  const grade = character?.grade || "Apprenti";
  const rite = character?.rite || "Rite non défini";

  const themeStats = stats?.answersByTheme || {};
  const modeStats = stats?.answersByMode || {};

  const radarData = useMemo(() => {
    const out = {};
    THEMES.forEach((t) => {
      const st = themeStats[t.key] || { correct: 0, total: 0 };
      out[t.key] = pct(st.correct, st.total);
    });
    return out;
  }, [themeStats]);

  const sortedThemes = useMemo(() => {
    return THEMES.map((t) => {
      const st = themeStats[t.key] || { correct: 0, total: 0 };
      return {
        ...t,
        value: pct(st.correct, st.total),
        correct: st.correct,
        total: st.total,
      };
    }).sort((a, b) => b.value - a.value);
  }, [themeStats]);

  const strengths = sortedThemes.filter((t) => t.value >= 70).slice(0, 3);
  const weaknesses = [...sortedThemes]
    .reverse()
    .filter((t) => t.total > 0 && t.value < 60)
    .slice(0, 3);

  const modes = [
    { key: "collectif", label: "Collectif" },
    { key: "duel", label: "Duel" },
    { key: "revision", label: "Révision" },
    { key: "preparation", label: "Préparation" },
  ];

  const modeCards = useMemo(() => {
    return modes.map((m) => {
      const st = modeStats[m.key] || { correct: 0, total: 0 };
      return {
        ...m,
        correct: st.correct,
        total: st.total,
        value: pct(st.correct, st.total),
      };
    });
  }, [modeStats]);

  const suggestionTheme = weaknesses[0]?.label || strengths[0]?.label || "Symboles";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

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

          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-4 mb-10"
          >
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#D4AF37]/12 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-5">
              <BarChart3 size={22} />
            </div>

            <h1 className="font-display text-3xl md:text-4xl tracking-[0.12em] mb-2">
              PROGRESSION DE <span className="text-[#D4AF37]">{pseudo}</span>
            </h1>
            <p className="font-body text-white/60 italic">
              {rite} · {grade}
            </p>

            <div className="mt-6 h-px w-64 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center"
            >
              <div className="font-display tracking-[0.12em] text-sm text-white/85 mb-5">
                VUE D’ENSEMBLE
              </div>

              <RadarChart data={radarData} size={320} />

              <div className="mt-5 text-xs font-body text-white/45 text-center">
                Plus le polygone est large, plus votre maîtrise est élevée.
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="rounded-2xl p-6 border border-emerald-400/20 bg-gradient-to-br from-emerald-900/25 to-emerald-950/25"
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="text-emerald-400" size={22} />
                  <div className="font-display tracking-[0.10em] text-white/90">
                    VOS FORCES
                  </div>
                </div>

                {strengths.length ? (
                  <div className="space-y-3">
                    {strengths.map((t) => (
                      <div key={t.key} className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-body text-white/80">{t.label}</div>
                          <div className="font-display text-emerald-400">{t.value}%</div>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-black/25 overflow-hidden border border-white/10">
                          <div
                            className="h-full"
                            style={{
                              width: `${t.value}%`,
                              background:
                                "linear-gradient(90deg, rgba(16,185,129,1), rgba(52,211,153,1))",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="font-body text-sm text-white/55">
                    Continuez à jouer : vos forces apparaîtront ici.
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.14 }}
                className="rounded-2xl p-6 border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/10 to-white/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-[#D4AF37]" size={22} />
                  <div className="font-display tracking-[0.10em] text-white/90">
                    AXES DE TRAVAIL
                  </div>
                </div>

                {weaknesses.length ? (
                  <div className="space-y-3">
                    {weaknesses.map((t) => (
                      <div key={t.key} className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center justify-between">
                          <div className="font-body text-white/80">{t.label}</div>
                          <div className="font-display text-[#D4AF37]">{t.value}%</div>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-black/25 overflow-hidden border border-white/10">
                          <div
                            className="h-full"
                            style={{
                              width: `${t.value}%`,
                              background:
                                "linear-gradient(90deg, rgba(184,148,31,1), rgba(212,175,55,1))",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="font-body text-sm text-white/55">
                    Aucun point faible détecté pour le moment.
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="font-display tracking-[0.12em] text-sm text-white/85 mb-5 text-center">
              PERFORMANCE PAR MODE
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modeCards.map((m) => (
                <div
                  key={m.key}
                  className="rounded-2xl border border-white/10 bg-[#0B1120]/35 p-5 text-center"
                >
                  <div className="font-display text-3xl text-[#D4AF37]">{m.value}%</div>
                  <div className="mt-1 font-body text-xs text-white/55">{m.label}</div>
                  <div className="mt-2 font-body text-xs text-white/40">
                    {m.correct}/{m.total} réponses
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            className="mt-8 rounded-2xl p-6 border border-blue-400/20 bg-gradient-to-r from-blue-900/25 to-purple-900/25"
          >
            <div className="flex items-start gap-4">
              <Lightbulb className="text-blue-400 mt-1" size={26} />
              <div>
                <div className="font-display tracking-[0.10em] text-white/90 mb-2">
                  SUGGESTION
                </div>
                <p className="font-body text-sm text-white/65 leading-relaxed">
                  Nous vous conseillons une session sur{" "}
                  <span className="text-[#D4AF37]">{suggestionTheme}</span> en mode Révision.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/revision")}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-display tracking-[0.14em] text-blue-300 hover:text-blue-200"
                >
                  ALLER EN RÉVISION →
                </button>
              </div>
            </div>
          </motion.div>

          <div className="mt-12 text-center opacity-60">
            <div className="h-px w-48 mx-auto bg-white/10 mb-4" />
            <p className="font-display text-xs tracking-[0.28em] text-[#D4AF37]/60">
              ∴ ORDO AB CHAO ∴
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
