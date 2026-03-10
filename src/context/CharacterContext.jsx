// src/context/CharacterContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const CharacterContext = createContext(null);

const STORAGE_KEY = "me_character_v1";

const DEFAULT_CHARACTER = {
  pseudo: "",
  rite: "",
  grade: "",

  // ✅ ancien (tu peux le garder si tu veux)
  avatarUrl: "",

  // ✅ nouveau : avatar “créé”
  avatarConfig: null, // JSON (genre, visage, cheveux, etc.)
  avatarPng: "", // dataURL png (image générée)
};

export function CharacterProvider({ children }) {
  const [character, setCharacter] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? { ...DEFAULT_CHARACTER, ...JSON.parse(s) } : DEFAULT_CHARACTER;
    } catch {
      return DEFAULT_CHARACTER;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
  }, [character]);

  return (
    <CharacterContext.Provider value={{ character, setCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("useCharacter must be used inside CharacterProvider");
  return ctx;
}