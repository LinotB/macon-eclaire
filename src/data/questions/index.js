// src/data/questions/index.js

import symbolesEasy from "./symboles.easy";
import symbolesMedium from "./symboles.medium";
import symbolesHard from "./symboles.hard";

import rituelsEasy from "./rituels.easy";
import rituelsMedium from "./rituels.medium";
import rituelsHard from "./rituels.hard";

import histoireEasy from "./histoire.easy";
import histoireMedium from "./histoire.medium";
import histoireHard from "./histoire.hard";

import reglementEasy from "./reglement.easy";
import reglementMedium from "./reglement.medium";
import reglementHard from "./reglement.hard";

import defisEasy from "./defis.easy";
import defisMedium from "./defis.medium";
import defisHard from "./defis.hard";

// -------------------------
// Utils
// -------------------------
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clampDifficulty(d) {
  const n = Number(d);
  if (n === 1 || n === 2 || n === 3) return n;
  return 1;
}

function normalizeTheme(theme) {
  const t = String(theme || "").toLowerCase().trim();

  // alias -> mix
  if (["mix", "quiz", "aleatoire", "aléatoire", "random"].includes(t)) return "mix";

  // thèmes officiels
  if (["symboles", "rituels", "histoire", "reglement", "defis"].includes(t)) return t;

  return "symboles";
}

// -------------------------
// BANK centralisée
// -------------------------
const BANK = {
  symboles: { 1: symbolesEasy, 2: symbolesMedium, 3: symbolesHard },
  rituels: { 1: rituelsEasy, 2: rituelsMedium, 3: rituelsHard },
  histoire: { 1: histoireEasy, 2: histoireMedium, 3: histoireHard },
  reglement: { 1: reglementEasy, 2: reglementMedium, 3: reglementHard },
  defis: { 1: defisEasy, 2: defisMedium, 3: defisHard },
};

// -------------------------
// API
// -------------------------
export function getQuestions({
  theme,
  difficulty = 1,
  count = 10,
  shuffle: doShuffle = true,
} = {}) {
  const t = normalizeTheme(theme);
  const d = clampDifficulty(difficulty);

  // mix = toutes les thématiques au même niveau de difficulté
  const pool =
    t === "mix"
      ? [
          ...(BANK.symboles?.[d] || []),
          ...(BANK.rituels?.[d] || []),
          ...(BANK.histoire?.[d] || []),
          ...(BANK.reglement?.[d] || []),
          ...(BANK.defis?.[d] || []),
        ]
      : [...(BANK?.[t]?.[d] || [])];

  const list = doShuffle ? shuffle(pool) : pool;
  return list.slice(0, count);
}

export function getRandomQuestion({ theme, difficulty = 1 } = {}) {
  const list = getQuestions({ theme, difficulty, count: 1, shuffle: true });
  return list[0] || null;
}
