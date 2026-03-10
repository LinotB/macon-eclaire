import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useCharacter } from "../context/CharacterContext";
import AvatarPreview3D from "../components/avatar3d/AvatarPreview3D";

// ✅ Ancien fallback conservé seulement si besoin ailleurs
function getAvatarUrl(grade) {
  if (grade === "Compagnon") return "/avatars/compagnon.png";
  if (grade === "Maître") return "/avatars/maitre.png";
  return "/avatars/apprenti.png";
}

export default function CreateCharacter() {
  const navigate = useNavigate();
  const { setCharacter } = useCharacter();

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
        label: "Parcours",
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

  const apronOptions = useMemo(
    () => [
      { key: "Apprenti", label: "Apprenti" },
      { key: "Compagnon", label: "Compagnon" },
      { key: "Maitre", label: "Maître" },
    ],
    []
  );

  const neckAdornmentTypes = useMemo(
    () => [
      { key: "none", label: "Aucun" },
      { key: "cordon", label: "Cordon" },
      { key: "sautoire", label: "Sautoir" },
    ],
    []
  );

  const sautoirOptions = useMemo(
    () => [
      { key: "Sautoire_couvreur", label: "Couvreur" },
      { key: "Sautoire_expert", label: "Expert" },
      { key: "Sautoire_harmonie", label: "Harmonie" },
      { key: "Sautoire_hospitalier", label: "Hospitalier" },
      { key: "Sautoire_maitre_banquet", label: "Maître des banquets" },
      { key: "Sautoire_maitre_ceremonie", label: "Maître des cérémonies" },
      { key: "Sautoire_orateur", label: "Orateur" },
      { key: "Sautoire_premier_surveillant", label: "Premier surveillant" },
      { key: "Sautoire_second_surveillant", label: "Second surveillant" },
      { key: "Sautoire_secretaire", label: "Secrétaire" },
      { key: "Sautoire_tresorier", label: "Trésorier" },
      { key: "Sautoire_VM", label: "Vénérable Maître" },
    ],
    []
  );

  const [stepIndex, setStepIndex] = useState(0);

  // -------------------------
  // ÉTAPE 1 — IDENTITÉ
  // -------------------------
  const [name, setName] = useState("");
  const isValidName = name.trim().length >= 3;

  // -------------------------
  // ÉTAPE 2 — APPARENCE
  // -------------------------
  const skinTones = [
    "#F8D7B2",
    "#F1C08E",
    "#D8A06A",
    "#B47A4D",
    "#8C5A35",
    "#5A3824",
  ];

  const hairStyles = useMemo(
    () => [
      { key: "classic", label: "Court classique" },
      { key: "wavy", label: "Mi-long ondulé" },
      { key: "shaved", label: "Rasé" },
      { key: "white", label: "Cheveux blancs" },
    ],
    []
  );

  const faceShapes = useMemo(
    () => [
      { key: "round", label: "Rond" },
      { key: "oval", label: "Ovale" },
      { key: "square", label: "Carré" },
    ],
    []
  );

  const hairColors = useMemo(
    () => ["#1f1b16", "#3b2a1a", "#7a4a2a", "#caa26a", "#ffffff"],
    []
  );

  const beards = useMemo(
    () => [
      { key: "none", label: "Aucune" },
      { key: "short", label: "Courte" },
      { key: "full", label: "Pleine" },
    ],
    []
  );

  const mustaches = useMemo(
    () => [
      { key: "none", label: "Aucune" },
      { key: "thin", label: "Fine" },
      { key: "handlebar", label: "Guidon" },
    ],
    []
  );

  const [gender, setGender] = useState("male");
  const [skin, setSkin] = useState(skinTones[0]);
  const [hair, setHair] = useState(hairStyles[0].key);
  const [faceShape, setFaceShape] = useState(faceShapes[0].key);
  const [hairColor, setHairColor] = useState(hairColors[0]);
  const [beard, setBeard] = useState("none");
  const [mustache, setMustache] = useState("none");
  const [apron, setApron] = useState("Apprenti");
  const [neckAdornmentType, setNeckAdornmentType] = useState("none");
  const [selectedSautoir, setSelectedSautoir] = useState("Sautoire_couvreur");

  // -------------------------
  // ÉTAPE 3 — GRADE DE JEU
  // -------------------------
  const [grade, setGrade] = useState(grades[0].key);

  // -------------------------
  // ÉTAPE 4 — RITE
  // -------------------------
  const [rite, setRite] = useState(rites[0].key);

  // -------------------------
  // CONFIG AVATAR (visuelle)
  // -------------------------
  const currentAvatarConfig = useMemo(
    () => ({
      gender,
      faceShape,
      skinTone: skin,
      hairStyle: hair,
      hairColor,
      beard,
      mustache,
      apron,
      neckAdornmentType,
      selectedSautoir,
      grade,
    }),
    [
      gender,
      faceShape,
      skin,
      hair,
      hairColor,
      beard,
      mustache,
      apron,
      neckAdornmentType,
      selectedSautoir,
      grade,
    ]
  );

  // Compat temporaire
  const [avatarPreview, setAvatarPreview] = useState("");
  const [previewErr, setPreviewErr] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const regeneratePreview = useCallback(async () => {
    setPreviewErr("");
    setPreviewLoading(false);
    setAvatarPreview("");
  }, []);

  useEffect(() => {
    if (stepIndex !== 1) return;
    regeneratePreview();
  }, [stepIndex, regeneratePreview]);

  // -------------------------
  // PERSISTENCE
  // -------------------------
  const persist = useCallback(async () => {
    const avatarUrl = getAvatarUrl(grade);

    setCharacter((prev) => ({
      ...prev,
      pseudo: name.trim() || prev.pseudo,
      grade: grade || prev.grade,
      rite: rite || prev.rite,

      // compat éventuelle
      avatarUrl,

      // ✅ config 3D principale
      avatarConfig: currentAvatarConfig,
      avatarPng: "",

      appearance: {
        ...(prev.appearance || {}),
        skin,
        hair,
        gender,
        faceShape,
        hairColor,
        beard,
        mustache,
        apron,
        neckAdornmentType,
        selectedSautoir,
      },
    }));
  }, [
    setCharacter,
    name,
    grade,
    rite,
    currentAvatarConfig,
    skin,
    hair,
    gender,
    faceShape,
    hairColor,
    beard,
    mustache,
    apron,
    neckAdornmentType,
    selectedSautoir,
  ]);

  const next = async () => {
    if (stepIndex === 0 && !isValidName) return;
    await persist();

    if (stepIndex < steps.length - 1) {
      setStepIndex((s) => s + 1);
    } else {
      navigate("/menu");
    }
  };

  const prev = () => {
    if (stepIndex > 0) setStepIndex((s) => s - 1);
    else navigate("/");
  };

  const ActiveStepIcon = steps[stepIndex].icon;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1120] text-white">
      <StarField intensity={45} />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0B1120]/40 to-[#0B1120]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08),transparent_55%)] pointer-events-none" />

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

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-10"
          >
            {/* STEP 1 */}
            {stepIndex === 0 && (
              <>
                <label className="font-body text-sm text-[#D4AF37]/90">
                  Nom Initiatique
                </label>

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
                    Minimum 3 caractères. Choisissez-le avec sagesse, car il accompagnera votre voyage
                    initiatique.
                  </p>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {stepIndex === 1 && (
              <div className="flex flex-col items-center">
                <AvatarPreview3D
                  gender={gender}
                  apron={apron}
                  neckAdornmentType={neckAdornmentType}
                  selectedSautoir={selectedSautoir}
                />

                <div className="mt-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-display tracking-[0.12em] text-white/70">
                  APERÇU 3D {previewLoading ? "…" : ""}
                </div>

                {previewErr ? (
                  <div className="mt-3 text-xs text-red-300">{previewErr}</div>
                ) : null}

                <div className="mt-8 w-full space-y-8">
                  {/* Genre */}
                  <div>
                    <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-3 text-center">
                      GENRE
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGender("male")}
                        className={[
                          "rounded-md px-4 py-3 border text-sm font-body transition text-center",
                          gender === "male"
                            ? "border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]"
                            : "border-white/10 bg-white/5 text-white/60 hover:border-white/20",
                        ].join(" ")}
                      >
                        Homme
                      </button>

                      <button
                        type="button"
                        onClick={() => setGender("female")}
                        className={[
                          "rounded-md px-4 py-3 border text-sm font-body transition text-center",
                          gender === "female"
                            ? "border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]"
                            : "border-white/10 bg-white/5 text-white/60 hover:border-white/20",
                        ].join(" ")}
                      >
                        Femme
                      </button>
                    </div>
                  </div>

                  {/* Tablier */}
                  <div>
                    <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-3 text-center">
                      TABLIER
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {apronOptions.map((a) => {
                        const selected = a.key === apron;
                        return (
                          <button
                            key={a.key}
                            type="button"
                            onClick={() => setApron(a.key)}
                            className={[
                              "rounded-md px-3 py-3 border text-sm font-body transition text-center",
                              selected
                                ? "border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]"
                                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20",
                            ].join(" ")}
                          >
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ornement de cou */}
                  <div>
                    <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-3 text-center">
                      ORNEMENT DE COU
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {neckAdornmentTypes.map((item) => {
                        const selected = item.key === neckAdornmentType;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setNeckAdornmentType(item.key)}
                            className={[
                              "rounded-md px-3 py-3 border text-sm font-body transition text-center",
                              selected
                                ? "border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]"
                                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20",
                            ].join(" ")}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {neckAdornmentType === "sautoire" && (
                    <div>
                      <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-3 text-center">
                        CHOIX DU SAUTOIR
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {sautoirOptions.map((s) => {
                          const selected = s.key === selectedSautoir;
                          return (
                            <button
                              key={s.key}
                              type="button"
                              onClick={() => setSelectedSautoir(s.key)}
                              className={[
                                "rounded-md px-3 py-3 border text-sm font-body transition text-center",
                                selected
                                  ? "border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]"
                                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20",
                              ].join(" ")}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Visage */}
                 {/*  <div>
                    <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-3 text-center">
                      FORME DU VISAGE
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {faceShapes.map((f) => {
                        const selected = f.key === faceShape;
                        return (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => setFaceShape(f.key)}
                            className={[
                              "rounded-md px-3 py-3 border text-sm font-body transition text-center",
                              selected
                                ? "border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]"
                                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20",
                            ].join(" ")}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div> */}

                  {/* Carnation */}
                  {/*<div>
                    <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-3 text-center">
                      CARNATION
                    </div>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
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
                  </div>*/}

                  {/* Coiffure */}
                  {/*<div>
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
                  </div>*/}

                  {/* Couleur cheveux */}
                  {/*<div>
                    <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-3 text-center">
                      COULEUR DES CHEVEUX
                    </div>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {hairColors.map((c) => {
                        const selected = c === hairColor;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setHairColor(c)}
                            className={[
                              "w-10 h-10 rounded-full border transition",
                              selected
                                ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20"
                                : "border-white/10 hover:border-white/25",
                            ].join(" ")}
                            style={{ backgroundColor: c }}
                            aria-label="Choisir couleur cheveux"
                          />
                        );
                      })}
                    </div>
                  </div>*/}

                  {/* Barbe */}
                  {/*<div>
                    <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-3 text-center">
                      BARBE
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {beards.map((b) => {
                        const selected = b.key === beard;
                        return (
                          <button
                            key={b.key}
                            type="button"
                            onClick={() => setBeard(b.key)}
                            className={[
                              "rounded-md px-3 py-3 border text-sm font-body transition text-center",
                              selected
                                ? "border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]"
                                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20",
                            ].join(" ")}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>*/}

                  {/* Moustache */}
                  {/*<div>
                    <div className="font-display tracking-[0.12em] text-xs text-white/60 mb-3 text-center">
                      MOUSTACHE
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {mustaches.map((m) => {
                        const selected = m.key === mustache;
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => setMustache(m.key)}
                            className={[
                              "rounded-md px-3 py-3 border text-sm font-body transition text-center",
                              selected
                                ? "border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]"
                                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20",
                            ].join(" ")}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>*/}

                </div> 
              </div>
            )}

            {/* STEP 3 */}
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

            {/* STEP 4 */}
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
                    Votre choix permettra d’adapter certains contenus tout en gardant
                    l’esprit du jeu.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

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