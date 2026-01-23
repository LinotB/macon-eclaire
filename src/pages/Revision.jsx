// src/pages/Revision.jsx
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StarField from "../components/ui/StarField";

// 👉 imports des icônes OFFICIELLES
import symbolesIcon from "../assets/themes/symboles.png";
import rituelsIcon from "../assets/themes/rituels.png";
import histoireIcon from "../assets/themes/histoire.png";
import reglementIcon from "../assets/themes/reglement.png";
import defisIcon from "../assets/themes/defis.png";
// optionnel
import mixIcon from "../assets/themes/mix.png";

export default function Revision() {
  const navigate = useNavigate();

  const themes = [
    {
      id: "symboles",
      title: "Symboles",
      subtitle: "2 questions",
      icon: symbolesIcon,
      bg: "from-[#4B237A] to-[#2A1447]",
    },
    {
      id: "rituels",
      title: "Rituels",
      subtitle: "1 question",
      icon: rituelsIcon,
      bg: "from-[#1E3A8A] to-[#0F1F4A]",
    },
    {
      id: "histoire",
      title: "Histoire",
      subtitle: "2 questions",
      icon: histoireIcon,
      bg: "from-[#14532D] to-[#0B2E1A]",
    },
    {
      id: "reglement",
      title: "Constitutions\n& Règlement",
      subtitle: "2 questions",
      icon: reglementIcon,
      bg: "from-[#7C2D12] to-[#3F1708]",
      multiline: true,
    },
    {
      id: "defis",
      title: "Défis",
      subtitle: "2 questions",
      icon: defisIcon,
      bg: "from-[#7F1D1D] to-[#3F0E0E]",
    },
    {
      id: "mix",
      title: "Quiz",
      subtitle: "Aléatoire",
      icon: mixIcon, // si tu ne veux pas d’icône → supprime cette ligne
      bg: "from-[#1F2937] to-[#111827]",
      
    },
  ];

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
            to="/menu"
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] text-xs"
          >
            <ArrowLeft size={16} />
            RETOUR
          </Link>

          <div className="font-display tracking-[0.18em] text-sm">
            MODE <span className="text-[#D4AF37]">RÉVISION</span>
          </div>

          <div className="w-16" />
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Titles */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-6 mb-12"
          >
            <h1 className="font-display text-3xl md:text-4xl tracking-[0.12em] mb-2">
              CHOISISSEZ UNE THÉMATIQUE
            </h1>
            <p className="font-body text-white/60 italic">
              Révisez librement, sans enjeu, avec un feedback immédiat
            </p>
          </motion.div>

          {/* Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {themes.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06 }}
                onClick={() => navigate(`/revision/${t.id}`)}
                className={[
                  "relative rounded-2xl overflow-hidden p-8 text-center",
                  "border border-white/10 hover:border-white/20 transition",
                  "bg-gradient-to-br",
                  t.bg,
                ].join(" ")}
              >
                {/* glow */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_55%)]" />

                {/* tag */}
                {t.tag && (
                  <div className="absolute top-4 right-4 text-[10px] font-display tracking-[0.18em] px-2.5 py-1 rounded-full bg-black/30 border border-white/15">
                    {t.tag}
                  </div>
                )}

                {/* Icon */}
                <div className="relative z-10 mx-auto mb-6 flex items-center justify-center">
                {t.icon ? (
                    <img
                    src={t.icon}
                    alt={t.title}
                    className="w-24 h-24 object-contain"
                    draggable="false"
                    />
                ) : (
                    <span className="text-[#D4AF37] text-2xl">∴</span>
                )}
                </div>


                {/* Text */}
                <div className="relative z-10">
                  <div className="font-display text-lg tracking-[0.08em]">
                    {t.multiline ? (
                      <span className="whitespace-pre-line">{t.title}</span>
                    ) : (
                      t.title
                    )}
                  </div>
                  <div className="font-body text-sm text-white/65 mt-2">
                    {t.subtitle}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
