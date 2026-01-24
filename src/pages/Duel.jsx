// src/pages/Duel.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Swords,
  Trophy,
  Clock,
  Zap,
  Shield,
  Star,
  X,
} from "lucide-react";
import StarField from "../components/ui/StarField";

const DUEL_TYPES = [
  {
    id: "quick",
    name: "DUEL ÉCLAIR",
    description: "5 questions rapides contre l’IA",
    icon: Zap,
    duration: "~3 min",
    reward: "Cosmétique commun",
    gradientFrom: "#B8941F",
    gradientTo: "#D4AF37",
  },
  {
    id: "standard",
    name: "DUEL CLASSIQUE",
    description: "10 questions avec chrono",
    icon: Swords,
    duration: "~8 min",
    reward: "Cosmétique rare",
    gradientFrom: "#1E3A8A",
    gradientTo: "#0F1F4A",
  },
  {
    id: "challenge",
    name: "DÉFI DU MAÎTRE",
    description: "15 questions difficiles",
    icon: Trophy,
    duration: "~15 min",
    reward: "Cosmétique épique",
    gradientFrom: "#5B2A86",
    gradientTo: "#2A1447",
  },
];

// démo locale (tu brancheras plus tard sur ton backend / stats utilisateur)
const REWARDS = [
  { id: 1, name: "Tablier d’Argent", rarity: "rare", unlocked: true },
  { id: 2, name: "Écharpe Dorée", rarity: "epic", unlocked: false },
  { id: 3, name: "Gants Brodés", rarity: "common", unlocked: true },
  { id: 4, name: "Médaillon Ancien", rarity: "legendary", unlocked: false },
];

function rarityStyle(rarity) {
  switch (rarity) {
    case "common":
      return {
        pill: "text-white/60 border-white/10",
        ring: "bg-white/5 border-white/10 text-white/60",
      };
    case "rare":
      return {
        pill: "text-blue-200/80 border-blue-400/25",
        ring: "bg-blue-400/10 border-blue-400/25 text-blue-200",
      };
    case "epic":
      return {
        pill: "text-purple-200/80 border-purple-400/25",
        ring: "bg-purple-400/10 border-purple-400/25 text-purple-200",
      };
    case "legendary":
      return {
        pill: "text-[#D4AF37]/90 border-[#D4AF37]/30",
        ring: "bg-[#D4AF37]/12 border-[#D4AF37]/25 text-[#D4AF37]",
      };
    default:
      return {
        pill: "text-white/60 border-white/10",
        ring: "bg-white/5 border-white/10 text-white/60",
      };
  }
}

export default function Duel() {
  const navigate = useNavigate();

  // TODO: brancher sur ton state (CharacterContext / stats du joueur)
  const duelsWon = 3;

  const [selected, setSelected] = useState(null); // duel type object
  const [open, setOpen] = useState(false);

  const progressPct = useMemo(() => Math.min(duelsWon * 10, 100), [duelsWon]);

  const openModal = (duelType) => {
    setSelected(duelType);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setSelected(null);
  };

const startDuel = () => {
  if (!selected) return;
  const id = selected.id; // quick | standard | challenge
  closeModal();
  navigate(`/duel/${id}`);
};


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
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors text-xs"
          >
            <ArrowLeft size={16} />
            RETOUR
          </Link>

          <div className="font-display tracking-[0.18em] text-sm">
            DUEL <span className="text-[#D4AF37]">INITIATIQUE</span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5">
            <Trophy size={16} className="text-[#D4AF37]" />
            <span className="font-display text-xs tracking-[0.12em] text-white/80">
              {duelsWon} VICTOIRES
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-6 mb-12"
          >
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#D4AF37]/12 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-5">
              <Swords size={24} />
            </div>

            <h1 className="font-display text-3xl md:text-4xl tracking-[0.12em] mb-2">
              CHOISISSEZ VOTRE <span className="text-[#D4AF37]">DUEL</span>
            </h1>
            <p className="font-body text-white/60 italic max-w-2xl mx-auto">
              Affrontez l’IA, gagnez des cosmétiques symboliques, et progressez par l’épreuve.
            </p>

            <div className="mt-6 h-px w-64 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Duel list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display tracking-[0.12em] text-sm text-white/80">
                  FORMATS DISPONIBLES
                </h2>
              </div>

              {DUEL_TYPES.map((duel, idx) => {
                const Icon = duel.icon;

                return (
                  <motion.button
                    key={duel.id}
                    type="button"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 + idx * 0.06 }}
                    onClick={() => openModal(duel)}
                    className={[
                      "w-full text-left rounded-2xl border p-6 transition relative overflow-hidden",
                      "bg-white/5 border-white/10 hover:border-[#D4AF37]/25",
                    ].join(" ")}
                  >
                    {/* glow */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_55%)] opacity-60" />

                    <div className="relative z-10 flex items-start gap-5">
                      {/* left icon */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10"
                        style={{
                          background: `linear-gradient(135deg, ${duel.gradientFrom}, ${duel.gradientTo})`,
                        }}
                      >
                        <Icon size={24} className="text-black/85" />
                      </div>

                      {/* text */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-display tracking-[0.10em] text-lg text-white/90">
                              {duel.name}
                            </h3>
                            <p className="font-body text-sm text-white/55 mt-1">
                              {duel.description}
                            </p>
                          </div>

                          <div className="hidden sm:flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-display tracking-[0.12em] text-white/50">
                              <Clock size={14} />
                              {duel.duration}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-xs font-display tracking-[0.12em] text-white/50">
                            <Clock size={14} />
                            {duel.duration}
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs font-display tracking-[0.12em] text-[#D4AF37]/85">
                            <Star size={14} />
                            {duel.reward}
                          </span>
                        </div>

                        <div className="mt-5 inline-flex items-center justify-center px-5 py-3 rounded-md font-display tracking-[0.14em] text-xs bg-[#D4AF37] text-black hover:brightness-110 transition border border-[#D4AF37]/30 shadow-[0_0_28px_rgba(212,175,55,0.18)]">
                          COMMENCER
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Rewards */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/12 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div className="font-display tracking-[0.12em] text-sm text-white/90">
                      RÉCOMPENSES
                    </div>
                    <div className="font-body text-xs text-white/45">
                      Débloquées via les duels
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {REWARDS.map((r) => {
                    const st = rarityStyle(r.rarity);
                    return (
                      <div
                        key={r.id}
                        className={[
                          "rounded-xl border p-4 flex items-center gap-3",
                          r.unlocked ? "bg-[#0B1120]/25" : "bg-[#0B1120]/15 opacity-70",
                          st.pill,
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "w-10 h-10 rounded-lg border flex items-center justify-center",
                            r.unlocked ? st.ring : "bg-white/5 border-white/10 text-white/30",
                          ].join(" ")}
                        >
                          {r.unlocked ? <Star size={16} /> : <Shield size={16} />}
                        </div>

                        <div className="flex-1">
                          <div className="font-body text-sm text-white/80">
                            {r.name}
                          </div>
                          <div className="mt-1">
                            <span
                              className={[
                                "inline-flex items-center px-2 py-1 rounded-full border text-[10px] font-display tracking-[0.12em] capitalize",
                                st.pill,
                              ].join(" ")}
                            >
                              {r.rarity}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/menu")}
                    className="text-xs font-display tracking-[0.14em] text-[#D4AF37]/70 hover:text-[#D4AF37] transition"
                  >
                    (COSMÉTIQUES — À BRANCHER)
                  </button>
                </div>
              </motion.div>

              {/* Progress */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.28 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="font-display tracking-[0.12em] text-sm text-white/90 mb-4">
                  VOTRE PROGRESSION
                </div>

                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-body text-white/50">Duels gagnés</span>
                  <span className="font-display text-[#D4AF37]">{duelsWon}</span>
                </div>

                <div className="h-2 rounded-full bg-black/25 overflow-hidden border border-white/10">
                  <div
                    className="h-full"
                    style={{
                      width: `${progressPct}%`,
                      background:
                        "linear-gradient(90deg, rgba(184,148,31,1), rgba(212,175,55,1))",
                    }}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="font-body text-xs text-white/45">
                    Prochain cosmétique dans{" "}
                    <span className="text-[#D4AF37]/90">
                      {10 - (duelsWon % 10)}
                    </span>{" "}
                    victoires
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {open && selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1120] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]"
            >
              {/* Top */}
              <div
                className="p-6 border-b border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${selected.gradientFrom}, ${selected.gradientTo})`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-black/20 border border-black/20 flex items-center justify-center">
                    <selected.icon size={26} className="text-black/85" />
                  </div>

                  <button
                    onClick={closeModal}
                    className="text-black/70 hover:text-black/90 transition"
                    aria-label="Fermer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="font-display tracking-[0.12em] text-lg text-black/90">
                    {selected.name}
                  </div>
                  <div className="font-body text-sm text-black/70 mt-1">
                    {selected.description}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-white/50">Durée</span>
                    <span className="font-display text-white/85">
                      {selected.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body text-white/50">Récompense</span>
                    <span className="font-display text-[#D4AF37]/90">
                      {selected.reward}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 rounded-md px-4 py-3 border border-white/10 bg-white/5 text-white/70 hover:text-white/85 transition font-display tracking-[0.12em] text-xs"
                  >
                    ANNULER
                  </button>

                  <button
  onClick={() => {
    console.log("✅ CLICK COMMENCER", selected?.id);
    startDuel();
  }}
  className="flex-1 rounded-md px-4 py-3 bg-[#D4AF37] text-black hover:brightness-110 transition font-display tracking-[0.12em] text-xs border border-[#D4AF37]/30 shadow-[0_0_28px_rgba(212,175,55,0.18)]"
>
  COMMENCER
</button>

                </div>

                <p className="mt-5 font-body text-xs text-white/40 italic text-center">
                  “Le duel n’est pas une guerre : c’est une épreuve de maîtrise.”
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
