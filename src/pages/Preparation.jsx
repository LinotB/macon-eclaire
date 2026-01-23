// src/pages/Preparation.jsx
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, AlertTriangle } from "lucide-react";
import StarField from "../components/ui/StarField";

// Icône centrale (tu peux mettre celle que tu veux / remplacer par une image)
import themeSymboles from "../assets/themes/symboles.png";

export default function Preparation() {
  const navigate = useNavigate();

  const exams = [
    { key: "apprenti", title: "Examen Apprenti", questions: 10, minutes: 10, dots: 3 },
    { key: "compagnon", title: "Examen Compagnon", questions: 15, minutes: 15, dots: 5 },
    { key: "maitre", title: "Examen Maître", questions: 20, minutes: 20, dots: 7 },
  ];

  const startExam = (examKey) => {
    navigate(`/preparation/exam/${examKey}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />

      {/* overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors text-xs"
          >
            <ArrowLeft size={16} />
            RETOUR
          </Link>

          <div className="font-display tracking-[0.18em] text-sm">
            PRÉPARATION <span className="text-[#D4AF37]">À L’AUGMENTATION</span>
          </div>

          <div className="w-20" />
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-2 mb-10"
          >
            <p className="font-display tracking-[0.18em] text-xs text-white/45 mb-4">
              ∴
            </p>

            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.35)]">
              <img src={themeSymboles} alt="" className="w-8 h-8 object-contain opacity-90" draggable="false" />
            </div>

            <h1 className="mt-6 font-display text-3xl md:text-4xl tracking-[0.12em]">
              Simulation d’Examen
            </h1>
            <p className="mt-3 font-body text-white/60 italic max-w-2xl mx-auto">
              Préparez-vous sérieusement à votre augmentation de grade avec des
              simulations chronométrées.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {exams.map((e, idx) => (
              <motion.div
                key={e.key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 + idx * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 shadow-[0_0_60px_rgba(0,0,0,0.25)]"
              >
                <div className="flex justify-center mb-5">
                  <div className="flex items-center gap-1.5 opacity-90">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <span
                        key={i}
                        className={[
                          "w-1.5 h-1.5 rounded-full",
                          i < e.dots ? "bg-[#D4AF37]" : "bg-white/15",
                        ].join(" ")}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-display tracking-[0.08em] text-lg">
                    {e.title}
                  </h3>
                </div>

                <div className="mt-6 space-y-3 font-body text-sm">
                  <div className="flex items-center justify-between text-white/65">
                    <span className="text-[#D4AF37]/75">Questions</span>
                    <span className="text-white/85">{e.questions}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/65">
                    <span className="text-[#D4AF37]/75">Durée</span>
                    <span className="text-white/85">{e.minutes} min</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => startExam(e.key)}
                  className="mt-7 w-full rounded-md px-4 py-3 bg-[#7A3E16]/85 hover:bg-[#7A3E16] border border-[#D4AF37]/20 text-white font-display tracking-[0.10em] text-sm transition flex items-center justify-center gap-3 shadow-[0_0_26px_rgba(212,175,55,0.10)]"
                >
                  <Play size={16} />
                  Commencer
                </button>
              </motion.div>
            ))}
          </div>

          {/* Warning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="max-w-5xl mx-auto mt-10 rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-r from-[#D4AF37]/10 via-white/5 to-[#D4AF37]/10 px-7 py-5"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#D4AF37]">
                <AlertTriangle size={18} />
              </div>
              <p className="font-body text-sm text-white/70">
                Une fois l’examen commencé, vous ne pourrez pas le quitter.
                Le chronomètre sera actif et les questions s’enchaîneront automatiquement.
                Préparez-vous dans un environnement calme.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
