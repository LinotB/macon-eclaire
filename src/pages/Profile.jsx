// src/pages/Profile.jsx
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, BarChart3, Award, LogOut, User } from "lucide-react";
import StarField from "../components/ui/StarField";

import { useCharacter } from "../context/CharacterContext";
import { useProgress } from "../context/ProgressContext";

function clamp01(n) {
  return Math.max(0, Math.min(100, n));
}

function pct(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export default function Profile() {
  const navigate = useNavigate();
  const { character } = useCharacter();
  const { stats } = useProgress();

  // ✅ infos utilisateur réelles
  const pseudo = character?.pseudo || "Initié";
  const rite = character?.rite || "Rite non défini";
  const grade = character?.grade || "Apprenti";

  // ✅ avatar (si tu as un champ avatar dans ton character, branche-le ici)
  // ex: const avatarUrl = character?.avatarUrl;
  const avatarUrl = character?.avatarUrl || null;

  // ✅ thématiques officielles
  const themes = useMemo(
    () => [
      { key: "symboles", label: "Symboles" },
      { key: "rituels", label: "Rituels" },
      { key: "histoire", label: "Histoire" },
      { key: "reglement", label: "Constitutions & Règlement" },
      { key: "defis", label: "Défis" },
    ],
    []
  );

  const answersByTheme = stats?.answersByTheme || {};
  const answersByMode = stats?.answersByMode || {};

  // ✅ performance par thème en %
  const performance = useMemo(() => {
    const out = {};
    themes.forEach((t) => {
      const st = answersByTheme[t.key] || { correct: 0, total: 0 };
      out[t.key] = pct(st.correct, st.total);
    });
    return out;
  }, [answersByTheme, themes]);

  // ✅ stats globales
  const globalTotals = useMemo(() => {
    const modeKeys = Object.keys(answersByMode || {});
    let correct = 0;
    let total = 0;
    for (const k of modeKeys) {
      correct += answersByMode[k]?.correct || 0;
      total += answersByMode[k]?.total || 0;
    }
    return { correct, total };
  }, [answersByMode]);

  const userStats = useMemo(() => {
    return {
      parties: stats?.gamesPlayed || 0,
      duelsWon: stats?.duels?.won || 0,
      goodPct: pct(globalTotals.correct, globalTotals.total),
      xp: stats?.experiencePoints || 0, // (si tu n'as pas encore XP, ça restera 0)
    };
  }, [stats, globalTotals]);

  // ✅ initiales avatar fallback
  const initials = (pseudo?.trim()?.[0] || "U").toUpperCase();

  // ✅ grade dots simple (Apprenti=1, Compagnon=2, Maître=3)
  const gradeDots = useMemo(() => {
    const g = (grade || "").toLowerCase();
    if (g.includes("maître")) return 3;
    if (g.includes("compagnon")) return 2;
    return 1;
  }, [grade]);

  const onLogout = () => {
    // Si tu veux vraiment "déconnexion", tu peux vider seulement progress+character
    // localStorage.removeItem("me_progress_v1");
    // localStorage.removeItem("me_character_v1"); // si tu as une clé
    navigate("/");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />

      {/* overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors text-xs"
          >
            <ArrowLeft size={16} />
            RETOUR
          </Link>

          <div className="font-display tracking-[0.18em] text-sm">PROFIL</div>

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
            aria-label="Paramètres"
            title="Paramètres"
          >
            <Settings size={16} className="text-white/60" />
          </button>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Top identity */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center mt-6"
          >
            {/* Avatar */}
            <div className="mx-auto w-[112px] h-[112px] rounded-2xl border border-[#D4AF37]/40 bg-[#0B1120]/35 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.25)]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  draggable="false"
                />
              ) : (
                <>
                  <div className="h-10 bg-[#D4AF37]/70 flex items-center justify-center">
                    <span className="font-display text-3xl text-white/90">
                      {initials}
                    </span>
                  </div>
                  <div className="h-[calc(112px-40px)] flex items-center justify-center text-white/20">
                    <User size={34} />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 text-4xl font-display tracking-[0.04em]">
              {pseudo}
            </div>
            <div className="mt-2 font-body text-[#D4AF37]/70">{rite}</div>

            {/* Grade pill */}
            <div className="mt-6 inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600/90 to-blue-500/80 border border-blue-300/15 shadow-[0_0_50px_rgba(59,130,246,0.18)]">
              <div className="text-white/90">
                <span className="text-xl">∴</span>
              </div>

              <div className="text-left">
                <div className="font-display tracking-[0.06em] text-lg text-white/95">
                  {grade}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span
                      key={i}
                      className={[
                        "w-2.5 h-2.5 rounded-full",
                        i < gradeDots ? "bg-white/80" : "bg-white/25",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats cards 2x2 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <StatCard value={userStats.parties} label="Parties jouées" />
            <StatCard value={userStats.duelsWon} label="Duels gagnés" />
            <StatCard value={`${clamp01(userStats.goodPct)}%`} label="Bonnes réponses" />
            <StatCard value={userStats.xp} label="Points d'expérience" />
          </motion.div>

          {/* Performance par Thématique */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.45 }}
            className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={18} className="text-[#D4AF37]" />
              <div className="font-display tracking-[0.08em] text-lg">
                Performance par Thématique
              </div>
            </div>

            <div className="space-y-5">
              {themes.map((t) => {
                const v = clamp01(performance[t.key] ?? 0);
                const st = answersByTheme[t.key] || { correct: 0, total: 0 };

                return (
                  <div key={t.key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-body text-[#D4AF37]/85">{t.label}</div>
                      <div className="text-right">
                        <div className="font-display text-[#D4AF37]">{v}%</div>
                        <div className="font-body text-[11px] text-white/40">
                          {st.correct}/{st.total} réponses
                        </div>
                      </div>
                    </div>

                    <div className="h-3 rounded-full bg-black/25 overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${v}%`,
                          background:
                            "linear-gradient(90deg, rgba(184,148,31,1), rgba(212,175,55,1))",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Cosmétiques débloqués (placeholder) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.45 }}
            className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award size={18} className="text-[#D4AF37]" />
                <div className="font-display tracking-[0.08em] text-lg">
                  Cosmétiques
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/menu")}
                className="font-display tracking-[0.14em] text-xs text-[#D4AF37]/80 hover:text-[#D4AF37] transition"
              >
                Voir tout
              </button>
            </div>

            <div className="mt-6 text-white/45 font-body text-sm">
              (On branchera les cosmétiques quand on implémente les récompenses du Duel)
            </div>
          </motion.div>

          {/* Déconnexion */}
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-3 font-display tracking-[0.14em] text-sm text-red-400 hover:text-red-300 transition"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-10 text-center">
      <div className="font-display text-5xl text-[#D4AF37]">{value}</div>
      <div className="mt-3 font-body text-white/55">{label}</div>
    </div>
  );
}
