// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Concept from "./pages/Concept";
import CreateCharacter from "./pages/CreateCharacter";
import MainMenu from "./pages/MainMenu";

import GameBoard from "./pages/GameBoard";
import Duel from "./pages/Duel";
import DuelPlay from "./pages/DuelPlay"; // ✅ AJOUT
import DuelResult from "./pages/DuelResult";

import Revision from "./pages/Revision";
import RevisionQuiz from "./pages/RevisionQuiz"; // ✅ déjà OK

import Preparation from "./pages/Preparation";
import PreparationExam from "./pages/PreparationExam"; // ✅ AJOUT
import BilanInitiatique from "./pages/BilanInitiatique";
import Profile from "./pages/Profile";

import Stats from "./pages/Stats";
import SettingsPage from "./pages/SettingsPage";





export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/concept" element={<Concept />} />
      <Route path="/create-character" element={<CreateCharacter />} />
      <Route path="/menu" element={<MainMenu />} />

      <Route path="/game-board" element={<GameBoard />} />
      <Route path="/duel" element={<Duel />} />
      <Route path="/duel/:duelId" element={<DuelPlay />} /> {/* ✅ AJOUT */}
      <Route path="/duel/:duelId/result" element={<DuelResult />} />

      <Route path="/bilan" element={<BilanInitiatique />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/stats" element={<Stats />} />
      <Route path="/settings" element={<SettingsPage />} />



      {/* ✅ Liste des thématiques */}
      <Route path="/revision" element={<Revision />} />
      {/* ✅ Page questions (thème cliqué ou mix) */}
      <Route path="/revision/:themeId" element={<RevisionQuiz />} />

      {/* ✅ Préparation */}
      <Route path="/preparation" element={<Preparation />} />
      {/* ✅ Examen chronométré */}
      <Route path="/preparation/exam/:examKey" element={<PreparationExam />} />
      <Route path="*" element={<div style={{ color: "white", padding: 40 }}>404</div>} />

    </Routes>
  );
}
