// src/pages/GameRulesCollectif.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import StarField from "../components/ui/StarField";
import {
  ArrowLeft,
  Dices,
  HelpCircle,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  ScrollText,
} from "lucide-react";

export default function GameRulesCollectif() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />

      {/* Overlays (même rendu que tes pages) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <header className="relative z-10 px-6 py-6 border-b border-white/10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors text-xs"
              type="button"
            >
              <ArrowLeft size={16} />
              RETOUR
            </button>

            <div className="font-display tracking-[0.18em] text-sm">
              RÈGLES DU <span className="text-[#D4AF37]">MODE COLLECTIF</span>
            </div>

            <div className="w-24" />
          </div>
        </header>

        <main className="relative z-10 px-6 pb-24 pt-10">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Intro */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="font-display text-2xl md:text-4xl tracking-[0.12em]">
                CHEMIN <span className="text-[#D4AF37]">INITIATIQUE</span>
              </h1>
              <p className="font-body text-white/60 italic mt-2">
                Apprenez, progressez, et avancez votre pierre sur le plateau sacré.
              </p>
            </motion.div>

            {/* DÉROULEMENT */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#D4AF37]/15 via-white/5 to-[#D4AF37]/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37]">
                    <Dices size={18} />
                  </div>
                  <div className="font-display tracking-[0.14em] text-sm">
                    DÉROULEMENT
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 space-y-4">
                <p className="font-body text-white/80">
                  Tous les joueurs démarrent sur la{" "}
                  <span className="text-[#D4AF37] font-semibold">case Départ</span>.
                </p>

                <p className="font-body text-white/70 leading-relaxed">
                  Au début de la partie, chaque joueur{" "}
                  <span className="text-[#D4AF37] font-semibold">lance le dé</span> : l’ordre de jeu est déterminé{" "}
                  <span className="text-[#D4AF37] font-semibold">du plus grand score au plus petit</span>{" "}
                  (les scores doivent être{" "}
                  <span className="text-white font-semibold">uniques</span>).
                </p>

                <div className="h-px w-full bg-white/10 my-2" />

                <p className="font-body text-white/70 leading-relaxed">
                  À ton tour : tu{" "}
                  <span className="text-white font-semibold">lances le dé</span>, tu avances ton pion du nombre indiqué,
                  puis tu joues la case sur laquelle tu arrives (question, défi, quiz surprise, ou case spéciale).
                </p>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <ScrollText className="text-[#D4AF37] mt-0.5" size={18} />
                    <p className="font-body text-white/65 text-sm leading-relaxed">
                      Important : la rotation des tours suit{" "}
                      <span className="text-white font-semibold">l’ordre initial des jets de dé</span>
                      (pas le sens des aiguilles d’une montre).
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* QUESTION */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#5B2A86]/25 via-white/5 to-[#1E3A8A]/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37]">
                    <HelpCircle size={18} />
                  </div>
                  <div className="font-display tracking-[0.14em] text-sm">
                    QUESTION
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 space-y-5">
                <p className="font-body text-white/70 leading-relaxed">
                  Une question est tirée selon la thématique de la case. Le joueur actif a{" "}
                  <span className="text-[#D4AF37] font-semibold">20 secondes</span> pour répondre.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-emerald-300 mt-0.5" size={18} />
                      <div>
                        <div className="font-display tracking-[0.10em] text-sm text-emerald-200">
                          BONNE RÉPONSE
                        </div>
                        <p className="font-body text-white/70 text-sm mt-2 leading-relaxed">
                          Tu avances ton pion du{" "}
                          <span className="text-emerald-200 font-semibold">nombre de points</span> indiqué sur la carte
                          (1, 2 ou 3).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-5">
                    <div className="flex items-start gap-3">
                      <XCircle className="text-red-300 mt-0.5" size={18} />
                      <div>
                        <div className="font-display tracking-[0.10em] text-sm text-red-200">
                          MAUVAISE RÉPONSE / PAS DE RÉPONSE
                        </div>
                        <p className="font-body text-white/70 text-sm mt-2 leading-relaxed">
                          Tu ne bouges pas. Le tour passe au joueur suivant.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-orange-400/25 bg-orange-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-orange-200 mt-0.5" size={18} />
                    <p className="font-body text-white/70 text-sm leading-relaxed">
                      Si une question a plusieurs bonnes réponses, il faut{" "}
                      <span className="text-white font-semibold">toutes les donner</span> pour réussir.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* DÉFI */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#7F1D1D]/25 via-white/5 to-[#B45309]/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37]">
                    <Zap size={18} />
                  </div>
                  <div className="font-display tracking-[0.14em] text-sm">
                    DÉFI
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 space-y-5">
                <p className="font-body text-white/70 leading-relaxed">
                  Un défi est proposé (mime, dessin, posture…). Le défi a aussi un{" "}
                  <span className="text-[#D4AF37] font-semibold">nombre de points</span>.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-5">
                    <div className="font-display tracking-[0.10em] text-sm text-emerald-200">
                      DÉFI RÉUSSI
                    </div>
                    <p className="font-body text-white/70 text-sm mt-2 leading-relaxed">
                      Tu avances ton pion de{" "}
                      <span className="text-emerald-200 font-semibold">+points</span>.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-5">
                    <div className="font-display tracking-[0.10em] text-sm text-red-200">
                      DÉFI RATÉ
                    </div>
                    <p className="font-body text-white/70 text-sm mt-2 leading-relaxed">
                      Tu recules ton pion de{" "}
                      <span className="text-red-200 font-semibold">-points</span>.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="font-body text-white/65 text-sm leading-relaxed">
                    Exemple : un défi à 2 points → +2 si réussi, -2 si raté.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* CASES SPÉCIALES */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#D4AF37]/15 via-white/5 to-[#D4AF37]/10">
                <div className="font-display tracking-[0.14em] text-sm">
                  CASES SPÉCIALES
                </div>
              </div>

              <div className="px-6 py-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="font-display tracking-[0.10em] text-sm text-[#D4AF37] mb-2">
                    CABINET DE RÉFLEXION
                  </div>
                  <p className="font-body text-white/70 text-sm leading-relaxed">
                    Lorsque tu t’arrêtes sur cette case, tu{" "}
                    <span className="text-white font-semibold">passes ton tour</span>.
                    C’est un moment d’introspection : tu ne bouges pas pendant ce tour.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="font-display tracking-[0.10em] text-sm text-[#D4AF37] mb-2">
                    AUGMENTATION DE SALAIRE
                  </div>
                  <p className="font-body text-white/70 text-sm leading-relaxed">
                    Tu bénéficies d’une reconnaissance symbolique. Dans ta version actuelle :
                    <span className="text-white font-semibold"> tu avances immédiatement de +1 case</span>.
                    (Tu pourras réactiver les autres choix plus tard si besoin.)
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="font-display tracking-[0.10em] text-sm text-[#D4AF37] mb-2">
                    ÉVÉNEMENT
                  </div>
                  <p className="font-body text-white/70 text-sm leading-relaxed">
                    Tu tires une carte événement et tu appliques son effet :
                    avancer / reculer, retour au cabinet, passer un tour, etc.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* FIN DE PARTIE */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-emerald-700/25 via-white/5 to-emerald-900/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/25 flex items-center justify-center text-[#D4AF37]">
                    <Flag size={18} />
                  </div>
                  <div className="font-display tracking-[0.14em] text-sm">
                    FIN DE PARTIE
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 space-y-4">
                <p className="font-body text-white/75 leading-relaxed">
                  Quand un joueur atteint (ou dépasse) la case{" "}
                  <span className="text-[#D4AF37] font-semibold">Arrivée</span>, il doit réussir une{" "}
                  <span className="text-white font-semibold">question ultime</span> (catégorie au choix)
                  pour remporter la partie.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-5">
                    <div className="font-display tracking-[0.10em] text-sm text-emerald-200">
                      SI RÉUSSITE
                    </div>
                    <p className="font-body text-white/70 text-sm mt-2">
                      Le joueur remporte la partie.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-5">
                    <div className="font-display tracking-[0.10em] text-sm text-orange-200">
                      SI ÉCHEC
                    </div>
                    <p className="font-body text-white/70 text-sm mt-2 leading-relaxed">
                      On laisse un dernier tour aux autres joueurs. Si quelqu’un atteint l’arrivée
                      et réussit la question ultime, il gagne. Sinon, le premier arrivé gagne.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="text-center pt-2"
            >
              <Link
                to="/game-board"
                className={[
                  "inline-flex items-center justify-center gap-2",
                  "rounded-2xl px-10 py-4",
                  "font-display tracking-[0.14em] text-sm",
                  "bg-[#D4AF37] text-black hover:brightness-110 transition",
                  "shadow-[0_0_40px_rgba(212,175,55,0.15)]",
                ].join(" ")}
              >
                COMMENCER LA PARTIE
                <ArrowLeft className="opacity-0" size={1} />
              </Link>

              <p className="text-gray-500 text-sm mt-6 italic font-body">
                “Que la Lumière guide vos pas sur le chemin initiatique”
              </p>
              <p className="text-[#D4AF37]/60 text-2xl mt-2">∴</p>

              <div className="mt-10 text-center opacity-60">
                <div className="h-px w-48 mx-auto bg-white/10 mb-4" />
                <p className="font-display text-xs tracking-[0.28em] text-[#D4AF37]/60">
                  ∴ ORDO AB CHAO ∴
                </p>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
