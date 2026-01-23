// src/pages/CreateCharacter.jsx
import { useCharacter } from "../context/CharacterContext";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Palette,
  Crown,
  ChevronRight,
  Check,
  Hammer,
  Compass,
  BookOpen,
  Flame,
  ScrollText,
} from "lucide-react";
import StarField from "../components/ui/StarField";

export default function CreateCharacter() {
  const navigate = useNavigate();
  const { setCharacter } = useCharacter();

  // ✅ Étapes : Identité -> Apparence -> Grade -> Rite
  const steps = useMemo(
    () => [
      {
        key: "identity",
        label: "Identité",
        subtitle: "Choisissez votre pseudonyme initiatique",
        icon: User,
      },
      {
        key: "appearance",
        label: "Apparence",
        subtitle: "Créez votre avatar symbolique",
        icon: Palette,
      },
      {
        key: "grade",
        label: "Grade",
        subtitle: "Sélectionnez votre niveau d’avancement",
        icon: Crown,
      },
      {
        key: "rite",
        label: "Rite",
        subtitle: "Choisissez votre rite",
        icon: ScrollText,
      },
    ],
    []
  );

  // ✅ Grades (outils distincts)
  const grades = useMemo(
    () => [
      {
        key: "Apprenti",
        title: "Apprenti",
        subtitle: "Premier pas sur le chemin initiatique",
        toolIcon: Hammer,
        dots: 1,
      },
      {
        key: "Compagnon",
        title: "Compagnon",
        subtitle: "Progression dans l’art royal",
        toolIcon: Compass,
        dots: 2,
      },
      {
        key: "Maître",
        title: "Maître",
        subtitle: "Accomplissement du voyage initiatique",
        toolIcon: Crown,
        dots: 3,
      },
    ],
    []
  );

  // ✅ Rites (simple, sobre)
  const rites = useMemo(
    () => [
      {
        key: "Rite Français",
        title: "RITE FRANÇAIS",
        subtitle: "Sobriété, structure, tradition",
        icon: BookOpen,
      },
      {
        key: "REAA",
        title: "R.E.A.A.",
        subtitle: "Symbolisme riche, progression initiatique",
        icon: Flame,
      },
      {
        key: "Rite Émulation",
        title: "RITE ÉMULATION",
        subtitle: "Rigueur, transmission, pratique",
        icon: ScrollText,
      },
    ],
    []
  );

  const [stepIndex, setStepIndex] = useState(0);

  // Identité
  const [name, setName] = useState("");
  const isValidName = name.trim().length >= 3;

  // Apparence
  const skinTones = ["#F8D7B2", "#F1C08E", "#D8A06A", "#B47A4D", "#8C5A35", "#5A3824"];
  const hairStyles = [
    { key: "classic", label: "Court classique" },
    { key: "wavy", label: "Mi-long ondulé" },
    { key: "shaved", label: "Rasé" },
    { key: "white", label: "Cheveux blancs" },
  ];
  const [skin, setSkin] = useState(skinTones[0]);
  const [hair, setHair] = useState(hairStyles[0].key);

  // Grade
  const [grade, setGrade] = useState(grades[0].key);

  // Rite
  const [rite, setRite] = useState(rites[0].key);

  // ✅ Persist à chaque "Suivant"
  const persist = () => {
    setCharacter((prev) => ({
      ...prev,
      pseudo: name.trim() || prev.pseudo,
      grade: grade || prev.grade,
      rite: rite || prev.rite,
      appearance: {
        ...(prev.appearance || {}),
        skin,
        hair,
      },
    }));
  };

  const next = () => {
    if (stepIndex === 0 && !isValidName) return;

    persist();

    if (stepIndex < steps.length - 1) setStepIndex((s) => s + 1);
    else navigate("/menu");
  };

  const prev = () => {
    if (stepIndex > 0) setStepIndex((s) => s - 1);
    else navigate("/");
  };

  const ActiveStepIcon = steps[stepIndex].icon;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={prev}
            className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors text-xs"
          >
            <ArrowLeft size={16} />
            RETOUR
          </button>

          {/* Steps */}
          <div className="flex items-center gap-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === stepIndex;
              const isDone = i < stepIndex;

              return (
                <div key={s.key} className="flex items-center gap-4">
                  <div
                    className={[
                      "w-10 h-10 rounded-full flex items-center justify-center border transition-colors",
                      "bg-white/5",
                      isActive
                        ? "border-[#D4AF37] text-[#D4AF37]"
                        : isDone
                        ? "border-[#D4AF37]/50 text-[#D4AF37]"
                        : "border-white/10 text-white/35",
                    ].join(" ")}
                    title={s.label}
                    aria-label={s.label}
                  >
                    {isDone ? <Check size={18} /> : <Icon size={18} />}
                  </div>

                  {i !== steps.length - 1 && <div className="w-10 h-px bg-white/10" />}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mt-10 mb-10"
          >
            <h1 className="font-display text-3xl md:text-4xl tracking-[0.12em] mb-2">
              {steps[stepIndex].label}
            </h1>
            <p className="font-body text-white/70 italic">{steps[stepIndex].subtitle}</p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-10"
          >
            {/* STEP 1: Identité */}
            {stepIndex === 0 && (
              <>
                <label className="font-body text-sm text-[#D4AF37]/90">Nom Initiatique</label>

                <div className="mt-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Entrez votre pseudonyme..."
                    className="
                      w-full rounded-md bg-[#0B1120]/60
                      border border-[#D4AF37]/40
                      px-4 py-3 font-body text-white
                      placeholder:text-white/35 outline-none
                      focus:border-[#D4AF37]
                      focus:ring-2 focus:ring-[#D4AF37]/20
                    "
                  />
                  <p className="mt-3 text-xs text-white/45 font-body">
                    Minimum 3 caractères.
                  </p>
                </div>

                <div className="mt-8 rounded-xl border border-white/10 bg-[#0B1120]/35 p-5">
                  <p className="font-body text-sm text-[#D4AF37]/80 italic">
                    “Choisissez-le avec sagesse, car il accompagnera votre voyage initiatique.”
                  </p>
                </div>
              </>
            )}

            {/* STEP 2: Apparence */}
            {stepIndex === 1 && (
              <div className="flex flex-col items-center">
                {/* Avatar preview */}
                <div className="w-28 h-28 rounded-full border border-[#D4AF37]/40 bg-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.12)]">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: skin }}
                    aria-label="Aperçu avatar"
                    title="Aperçu"
                  >
                    <User size={34} className="text-black/45" />
                  </div>
                </div>

                <div className="mt-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-display tracking-[0.12em] text-white/70">
                  TABLIER
                </div>

                <div className="mt-8 w-full">
                  {/* Carnation */}
                  <div>
                    <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-3 text-center">
                      CARNATION
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      {skinTones.map((c) => {
                        const selected = c === skin;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSkin(c)}
                            className={[
                              "w-10 h-10 rounded-full border transition",
                              selected
                                ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20"
                                : "border-white/10 hover:border-white/25",
                            ].join(" ")}
                            style={{ backgroundColor: c }}
                            aria-label="Choisir carnation"
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Coiffure */}
                  <div className="mt-8">
                    <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-3 text-center">
                      COIFFURE
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {hairStyles.map((h) => {
                        const selected = h.key === hair;
                        return (
                          <button
                            key={h.key}
                            type="button"
                            onClick={() => setHair(h.key)}
                            className={[
                              "rounded-md px-4 py-3 border text-sm font-body transition text-center",
                              selected
                                ? "border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]"
                                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20",
                            ].join(" ")}
                          >
                            {h.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Grade */}
            {stepIndex === 2 && (
              <div className="w-full">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37]">
                    <ActiveStepIcon size={22} />
                  </div>
                </div>

                <div className="space-y-4">
                  {grades.map((g) => {
                    const selected = g.key === grade;
                    const ToolIcon = g.toolIcon;

                    return (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => setGrade(g.key)}
                        className={[
                          "w-full text-left rounded-2xl border transition relative overflow-hidden",
                          "bg-[#0B1120]/30",
                          selected
                            ? "border-[#D4AF37]/55 shadow-[0_0_40px_rgba(212,175,55,0.10)]"
                            : "border-white/10 hover:border-white/20",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div
                              className={[
                                "w-12 h-12 rounded-xl flex items-center justify-center border",
                                selected
                                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/35 text-[#D4AF37]"
                                  : "bg-white/5 border-white/10 text-white/70",
                              ].join(" ")}
                            >
                              <ToolIcon size={20} />
                            </div>

                            <div>
                              <div className="font-display tracking-[0.08em] text-lg">
                                {g.title.toUpperCase()}
                              </div>
                              <div className="font-body text-sm text-white/45 mt-1">
                                {g.subtitle}
                              </div>

                              <div className="mt-3 flex items-center gap-1.5">
                                {Array.from({ length: 3 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={[
                                      "w-2 h-2 rounded-full",
                                      i < g.dots ? "bg-[#D4AF37]" : "bg-white/15",
                                    ].join(" ")}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {selected && <Check className="text-[#D4AF37]" size={18} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ✅ STEP 4: Rite */}
            {stepIndex === 3 && (
              <div className="w-full">
                <div className="flex items-center justify-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37]">
                    <ActiveStepIcon size={22} />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {rites.map((r) => {
                    const selected = r.key === rite;
                    const Icon = r.icon;

                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => setRite(r.key)}
                        className={[
                          "text-left rounded-2xl border p-6 transition relative overflow-hidden",
                          "bg-white/5",
                          selected
                            ? "border-[#D4AF37]/55 shadow-[0_0_40px_rgba(212,175,55,0.10)]"
                            : "border-white/10 hover:border-white/20",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-4 border",
                            selected
                              ? "bg-[#D4AF37]/10 border-[#D4AF37]/35 text-[#D4AF37]"
                              : "bg-white/5 border-white/10 text-white/60",
                          ].join(" ")}
                        >
                          <Icon size={22} />
                        </div>

                        <div className="font-display tracking-[0.10em] text-sm mb-2">
                          {r.title}
                        </div>
                        <div className="font-body text-xs text-white/55 leading-relaxed">
                          {r.subtitle}
                        </div>

                        {selected && (
                          <div className="absolute top-4 right-4 text-[#D4AF37]">
                            <Check size={18} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 rounded-xl border border-white/10 bg-[#0B1120]/35 p-5">
                  <p className="font-body text-sm text-white/60 italic">
                    Votre choix permettra d’adapter certains contenus (terminologie,
                    progression, références) tout en gardant l’esprit du jeu.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Footer nav (pas de bouton séparé par étape : on garde le même) */}
          <div className="max-w-3xl mx-auto mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={prev}
              className="inline-flex items-center gap-2 font-display tracking-[0.14em] text-xs text-white/35 hover:text-white/55 transition-colors"
            >
              <ArrowLeft size={14} />
              PRÉCÉDENT
            </button>

            <button
              type="button"
              onClick={next}
              disabled={stepIndex === 0 && !isValidName}
              className={[
                "inline-flex items-center gap-3 px-6 py-3 rounded-md font-display tracking-[0.12em] text-xs transition",
                stepIndex === 0 && !isValidName
                  ? "bg-white/5 text-white/25 border border-white/10 cursor-not-allowed"
                  : "bg-[#D4AF37] text-black hover:brightness-110 shadow-[0_0_28px_rgba(212,175,55,0.18)] border border-[#D4AF37]/30",
              ].join(" ")}
            >
              {stepIndex === steps.length - 1 ? "ENTRER AU MENU" : "SUIVANT"}
              <ChevronRight size={16} />
            </button>
          </div>

          {/* debug optionnel */}
          <div className="max-w-3xl mx-auto mt-6 text-center">
            <Link to="/menu" className="text-xs text-white/25 hover:text-white/40">
              (Aller au menu — debug)
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
