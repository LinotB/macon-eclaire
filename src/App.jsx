// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Onboarding from "./pages/Onboarding";
import Concept from "./pages/Concept";
import CreateCharacter from "./pages/CreateCharacter";
import MainMenu from "./pages/MainMenu";

import GameBoard from "./pages/GameBoard";
import CollectifRoom from "./pages/CollectifRoom";

import Duel from "./pages/Duel";
import DuelPlay from "./pages/DuelPlay";
import DuelResult from "./pages/DuelResult";

import Revision from "./pages/Revision";
import RevisionQuiz from "./pages/RevisionQuiz";

import Preparation from "./pages/Preparation";
import PreparationExam from "./pages/PreparationExam";
import BilanInitiatique from "./pages/BilanInitiatique";
import Profile from "./pages/Profile";

import Stats from "./pages/Stats";
import SettingsPage from "./pages/SettingsPage";

import { db } from "./firebase";
import { ref, set } from "firebase/database";

export default function App() {
  // ✅ TEST TEMPORAIRE : écriture RTDB (à enlever après)
  useEffect(() => {
    (async () => {
      try {
        await set(ref(db, "test"), { ok: true, at: Date.now() });
        console.log("✅ RTDB write OK");
      } catch (e) {
        console.error("❌ RTDB write failed:", e);
      }
    })();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/concept" element={<Concept />} />
      <Route path="/create-character" element={<CreateCharacter />} />
      <Route path="/menu" element={<MainMenu />} />

      {/* ✅ Collectif */}
      <Route path="/game-board" element={<GameBoard />} />
      <Route path="/game-board/:roomId" element={<CollectifRoom />} />

      {/* Duel */}
      <Route path="/duel" element={<Duel />} />
      <Route path="/duel/:duelId" element={<DuelPlay />} />
      <Route path="/duel/:duelId/result" element={<DuelResult />} />

      {/* Autres */}
      <Route path="/bilan" element={<BilanInitiatique />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/stats" element={<Stats />} />
      <Route path="/settings" element={<SettingsPage />} />

      <Route path="/revision" element={<Revision />} />
      <Route path="/revision/:themeId" element={<RevisionQuiz />} />

      <Route path="/preparation" element={<Preparation />} />
      <Route path="/preparation/exam/:examKey" element={<PreparationExam />} />

      <Route path="*" element={<div style={{ color: "white", padding: 40 }}>404</div>} />
    </Routes>
  );
}
