// src/context/ProgressContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ProgressContext = createContext(null);

const STORAGE_KEY = "me_progress_v1";

const empty = {
  answersByTheme: {
    symboles: { correct: 0, total: 0 },
    rituels: { correct: 0, total: 0 },
    histoire: { correct: 0, total: 0 },
    reglement: { correct: 0, total: 0 },
    defis: { correct: 0, total: 0 },
  },
  answersByMode: {
    duel: { correct: 0, total: 0 },
    revision: { correct: 0, total: 0 },
    preparation: { correct: 0, total: 0 },
    collectif: { correct: 0, total: 0 },
  },
  duels: { played: 0, won: 0 },
  gamesPlayed: 0,
};

export function ProgressProvider({ children }) {
  const [raw, setRaw] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : empty;
    } catch {
      return empty;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
  }, [raw]);

  const recordAnswer = ({ theme, mode, isCorrect }) => {
    setRaw((prev) => {
      const next = structuredClone(prev);

      // theme
      if (next.answersByTheme[theme]) {
        next.answersByTheme[theme].total += 1;
        if (isCorrect) next.answersByTheme[theme].correct += 1;
      }

      // mode
      if (next.answersByMode[mode]) {
        next.answersByMode[mode].total += 1;
        if (isCorrect) next.answersByMode[mode].correct += 1;
      }

      return next;
    });
  };

  const recordDuelFinished = ({ won }) => {
    setRaw((prev) => {
      const next = structuredClone(prev);
      next.duels.played += 1;
      if (won) next.duels.won += 1;
      next.gamesPlayed += 1;
      return next;
    });
  };

  const stats = useMemo(() => raw, [raw]);

  return (
    <ProgressContext.Provider value={{ stats, recordAnswer, recordDuelFinished }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
