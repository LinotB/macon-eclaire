import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import GoldenGlow from "../components/ui/GoldenGlow";
import templeHero from "../assets/temple-hero.jpg";

export default function Onboarding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={templeHero}
          alt="Temple maçonnique"
          className="w-full h-full object-cover opacity-40"
        />

        {/* Overlays : ajuste le contraste + donne l'effet “ancien projet” */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-[#0B1120]/55 to-[#0B1120]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.12),transparent_55%)]" />
      </div>

      {/* Golden glow */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <GoldenGlow />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
        {/* Title */}
        <motion.h1
          className="font-display text-4xl md:text-6xl lg:text-7xl tracking-[0.24em] font-normal text-white mb-4"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          <span className="drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]">
            MAÇON{" "}
          </span>
          <span className="text-[#D4AF37] font-normal drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)]">
            ÉCLAIRÉ
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="font-body text-lg md:text-2xl text-white/75 max-w-2xl mb-3 italic leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          Le chemin initiatique vers la Lumière
        </motion.p>

        {/* Quote */}
        <motion.div
          className="max-w-xl mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.65 }}
        >
          <p className="font-body text-[#D4AF37]/90 italic text-lg">
            "V.I.T.R.I.O.L."
          </p>
          <p className="font-body text-white/60 text-sm mt-2 leading-relaxed">
            Visite l'intérieur de la Terre et, en rectifiant, tu trouveras la pierre cachée
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
        >
          <Link to="/create-character">
            <button
              className="
                min-w-[260px]
                px-10 py-4
                rounded-md
                font-display tracking-[0.14em]
                text-sm
                bg-[#D4AF37]
                text-black
                hover:brightness-110
                transition
                shadow-[0_0_34px_rgba(212,175,55,0.22)]
                border border-[#D4AF37]/30
              "
            >
              ENTRER SUR LE CHEMIN
            </button>
          </Link>

          <Link to="/concept">
            <button
              className="
                min-w-[260px]
                px-10 py-4
                rounded-md
                font-display tracking-[0.14em]
                text-sm
                text-[#D4AF37]
                border border-[#D4AF37]/55
                hover:border-[#D4AF37]
                hover:bg-white/5
                transition
                shadow-[0_0_24px_rgba(212,175,55,0.10)]
              "
            >
              DÉCOUVRIR LE CONCEPT
            </button>
          </Link>
        </motion.div>

        {/* Decorative line */}
        <div className="mt-12 flex items-center gap-4 opacity-70">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
          <span className="font-display text-xs text-[#D4AF37]/70 tracking-[0.32em]">
            ∴ ANNO LUCIS MMXXVI ∴
          </span>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
        </div>
      </div>

      {/* Fog bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#0B1120] to-transparent pointer-events-none" />
    </div>
  );
}
