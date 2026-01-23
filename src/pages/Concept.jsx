import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Compass,
  Users,
  Swords,
  BookOpen,
  Award,
  Target,
} from "lucide-react";
import StarField from "../components/ui/StarField";

// Images des thématiques
import themeSymboles from "../assets/themes/symboles.png";
import themeRituels from "../assets/themes/rituels.png";
import themeHistoire from "../assets/themes/histoire.png";
import themeReglement from "../assets/themes/reglement.png";
import themeDefis from "../assets/themes/defis.png";

const features = [
  {
    icon: Compass,
    title: "Un But Initiatique",
    description:
      "Progressez de la pierre brute à la pierre cubique à travers un parcours symbolique inspiré du cheminement maçonnique traditionnel.",
  },
  {
    icon: Users,
    title: "Progression Collective",
    description:
      "Jouez avec d'autres frères et sœurs sur un plateau initiatique partagé. Avancez ensemble vers le Temple de la Lumière.",
  },
  {
    icon: Swords,
    title: "Défis Solo",
    description:
      "Affrontez des défis solo pour débloquer des cosmétiques rares et des avantages symboliques uniques.",
  },
  {
    icon: BookOpen,
    title: "Entrainement & Révision",
    description:
      "Révisez librement par thématique avec un feedback immédiat. Apprenez à votre rythme sans enjeu.",
  },
  {
    icon: Target,
    title: "Progression Personnalisé",
    description:
      "Le jeu analyse vos performances et adapte automatiquement le contenu pour renforcer vos points faibles.",
  },
  {
    icon: Award,
    title: "Préparation à l'Augmentation",
    description:
      "Simulez des examens initiatiques avec des séries de questions chronométrées pour vous préparer sérieusement.",
  },
];

const themes = [
  { label: "Symboles", img: themeSymboles, bg: "bg-purple-700/40" },
  { label: "Rituels", img: themeRituels, bg: "bg-blue-700/40" },
  { label: "Histoire", img: themeHistoire, bg: "bg-green-700/40" },
  {
    label: (
      <>
        Constitutions 
        <br />
        & Règlement
      </>
    ),
    img: themeReglement,
    bg: "bg-orange-600/40",
  },
  { label: "Défis", img: themeDefis, bg: "bg-red-700/40" },
];

export default function Concept() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors text-xs"
          >
            <ArrowLeft size={16} />
            RETOUR
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-3xl md:text-4xl tracking-[0.22em] mb-4">
              LE CONCEPT DE <span className="text-[#D4AF37]">MAÇON ÉCLAIRÉ</span>
            </h1>
            <p className="font-body text-lg text-white/70 max-w-3xl mx-auto italic">
              Un jeu initiatique et pédagogique inspiré du cheminement maçonnique,
              pour tailler votre pierre brute vers la Lumière.
            </p>
          </motion.div>

          {/* PLATEAU INITIATIQUE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative rounded-2xl overflow-hidden mb-20 border border-[#D4AF37]/20 bg-gradient-to-br from-[#1A2332] to-[#0F1825]"
          >
            <div className="p-12">
              <p className="font-display text-[#D4AF37] tracking-[0.3em] text-xs mb-4 text-center">
                LE PLATEAU INITIATIQUE
              </p>
              <p className="font-body text-white/65 text-center italic mb-10">
                Du Cabinet de Réflexion au Temple de Salomon
              </p>

              {/* Parcours */}
              <div className="flex items-center justify-between gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-display text-xs text-center">
                    Cabinet de
                    <br />
                    Réflexion
                  </div>
                  <span className="mt-2 text-xs text-white/60">Départ</span>
                </div>

                <div className="flex-1 relative">
                  <div className="h-[3px] bg-[#D4AF37]/60 rounded-full" />
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-display text-xs text-center">
                    Temple de
                    <br />
                    Salomon
                  </div>
                  <span className="mt-2 text-xs text-white/60">Arrivée</span>
                </div>
              </div>

              <p className="mt-10 text-center font-body text-sm text-[#D4AF37]/75 italic">
                V.I.T.R.I.O.L — Visite l'intérieur de la Terre et en Rectifiant tu trouveras la Pierre Cachée
              </p>
            </div>
          </motion.div>

          {/* FEATURES */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="rounded-2xl p-6 bg-white/5 border border-white/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display text-lg mb-2">{f.title}</h3>
                  <p className="font-body text-sm text-white/65">
                    {f.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* THÉMATIQUES */}
          <section className="text-center mt-24 mb-24">
            <h2 className="font-display text-xl md:text-2xl tracking-[0.18em] mb-12">
              THÉMATIQUES EXPLORÉES
            </h2>

            <div className="flex flex-wrap justify-center gap-12">
              {themes.map((t, i) => (
                <div key={i} className="flex flex-col items-center gap-4">
                  <div
                    className={`w-24 h-24 rounded-2xl ${t.bg} border border-white/15 flex items-center justify-center shadow-lg`}
                  >
                    <img
                      src={t.img}
                      alt=""
                      className="w-14 h-14 object-contain"
                      draggable="false"
                    />
                  </div>
                  <div className="font-body text-sm text-[#D4AF37]/90 text-center leading-snug">
                    {t.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CITATION + CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <p className="font-body text-lg text-white/75 italic max-w-3xl mx-auto mb-12">
              ∴ Ce jeu ne juge pas. Il accompagne et guide sur le
              chemin de l'introspection et de la transmission ∴
            </p>

            <Link
              to="/create-character"
              className="inline-flex px-12 py-4 rounded-md font-display tracking-[0.14em] text-sm bg-[#D4AF37] text-black shadow-lg"
            >
              COMMENCER L’AVENTURE
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
