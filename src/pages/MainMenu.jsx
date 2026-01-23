import { useCharacter } from "../context/CharacterContext";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  BarChart3,
  Settings,
  Users,
  Swords,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import StarField from "../components/ui/StarField";

export default function MainMenu() {
  const navigate = useNavigate();

  const handleModeSelect = (modeId) => {
    const pageMap = {
      collectif: "/game-board",
      duel: "/duel",
      revision: "/revision",
      preparation: "/preparation",
    };
    navigate(pageMap[modeId]);
  };

  // (plus tard tu brancheras ça à ton state / backend)
  const { character } = useCharacter();

  const pseudo = character.pseudo || "Initié";
  const rite = character.rite || "Rite non défini";
  const grade = character.grade || "Apprenti";


  const stats = [
    { value: "12", label: "Parties" },
    { value: "76%", label: "Réussite" },
    { value: "8", label: "Cosmétiques" },
  ];

  const modes = [
    {
      id: "collectif",
      title: "MODE COLLECTIF",
      desc: "Parcourez le chemin initiatique ensemble sur le plateau sacré. Progression collective et symbolique.",
      featured: true,
      icon: Users,
    },
    {
      id: "duel",
      title: "DUEL INITIATIQUE",
      desc: "Affrontez l’IA ou des défis scénarisés. Gagnez des cosmétiques rares et avantages symboliques.",
      icon: Swords,
    },
    {
      id: "revision",
      title: "RÉVISION LIBRE",
      desc: "Mode libre sans enjeu. Accédez aux cartes par thématique avec feedback immédiat.",
      icon: BookOpen,
    },
    {
      id: "preparation",
      title: "PRÉPARATION À L’AUGMENTATION",
      desc: "Simulations d’examen initiatique. Séries chronométrées par grade pour une préparation approfondie.",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />

      {/* Overlays (même rendu que tes pages) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors text-xs"
          >
            <ArrowLeft size={16} />
            RETOUR
          </Link>

          <div className="font-display tracking-[0.18em] text-sm">
            MAÇON <span className="text-[#D4AF37]">ÉCLAIRÉ</span>
          </div>

          <div className="flex items-center gap-4 text-white/45">
            <button className="hover:text-white/70 transition" aria-label="Profil">
              <User size={18} />
            </button>
            <button className="hover:text-white/70 transition" aria-label="Stats">
              <BarChart3 size={18} />
            </button>
            <button className="hover:text-white/70 transition" aria-label="Paramètres">
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
            className="text-center mt-6 mb-10"
          >
            <h1 className="font-display text-3xl md:text-5xl tracking-[0.12em]">
              BIENVENUE, <span className="text-[#D4AF37]">{grade.toUpperCase()}</span>
            </h1>
            <p className="font-body text-white/60 italic mt-2">
              Choisissez votre voie sur le chemin de la Lumière
            </p>
          </motion.div>

          {/* Bandeau profil */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 flex items-center justify-between mb-10"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37]">
                <User size={18} />
              </div>

              <div>
                <div className="font-display tracking-wide text-sm">{pseudo}</div>
                <div className="font-body text-xs text-white/45">
                  {rite} · {grade}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-10">
              {stats.map((s) => (
                <div key={s.label} className="text-right">
                  <div className="font-display text-[#D4AF37]">{s.value}</div>
                  <div className="font-body text-xs text-white/45">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {modes.map((m, idx) => {
              const Icon = m.icon;
              return (
                <motion.button
                  key={m.id}
                  type="button"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 + idx * 0.06 }}
                  onClick={() => handleModeSelect(m.id)}
                  className={[
                    "text-left rounded-2xl border p-8 relative overflow-hidden transition-colors",
                    "bg-white/5",
                    m.featured
                      ? "border-[#D4AF37]/45 shadow-[0_0_40px_rgba(212,175,55,0.10)]"
                      : "border-white/10 hover:border-white/15",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      {m.featured && (
                        <div className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-display tracking-[0.18em] bg-[#D4AF37] text-black mb-4">
                          PRINCIPAL
                        </div>
                      )}

                      <div
                        className={[
                          "w-12 h-12 rounded-xl flex items-center justify-center mb-5 border",
                          m.featured
                            ? "bg-[#D4AF37]/15 border-[#D4AF37]/25 text-[#D4AF37]"
                            : "bg-white/5 border-white/10 text-white/45",
                        ].join(" ")}
                      >
                        <Icon size={22} />
                      </div>

                      <h3 className="font-display tracking-[0.08em] text-lg mb-3">
                        {m.title}
                      </h3>

                      <p className="font-body text-sm text-white/55 leading-relaxed">
                        {m.desc}
                      </p>

                      <div className="mt-5 inline-flex items-center gap-2 text-[#D4AF37]/80 hover:text-[#D4AF37] font-display tracking-[0.12em] text-xs">
                        ACCÉDER <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>

                  {/* glow subtil */}
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_55%)] opacity-60" />
                </motion.button>
              );
            })}
          </div>

          {/* Défi du jour */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-10 rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/10 via-white/5 to-[#D4AF37]/10 px-8 py-6 text-center"
          >
            <div className="font-display tracking-[0.18em] text-xs text-[#D4AF37]/80 mb-2">
              • DÉFI DU JOUR •
            </div>
            <p className="font-body text-sm text-white/60">
              Complétez 3 questions sur les Symboles pour débloquer le{" "}
              <span className="text-[#D4AF37]/90">Tablier Orné</span>.
            </p>
          </motion.div>

          {/* Motto */}
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
