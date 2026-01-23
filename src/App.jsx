// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Concept from "./pages/Concept";
import CreateCharacter from "./pages/CreateCharacter";
import MainMenu from "./pages/MainMenu";

import GameBoard from "./pages/GameBoard";
import Duel from "./pages/Duel";

import Revision from "./pages/Revision";
import RevisionQuiz from "./pages/RevisionQuiz"; // ✅ déjà OK

import Preparation from "./pages/Preparation";
import PreparationExam from "./pages/PreparationExam"; // ✅ AJOUT

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/concept" element={<Concept />} />
      <Route path="/create-character" element={<CreateCharacter />} />
      <Route path="/menu" element={<MainMenu />} />

      <Route path="/game-board" element={<GameBoard />} />
      <Route path="/duel" element={<Duel />} />

      {/* ✅ Liste des thématiques */}
      <Route path="/revision" element={<Revision />} />
      {/* ✅ Page questions (thème cliqué ou mix) */}
      <Route path="/revision/:themeId" element={<RevisionQuiz />} />

      {/* ✅ Préparation */}
      <Route path="/preparation" element={<Preparation />} />
      {/* ✅ Examen chronométré */}
      <Route path="/preparation/exam/:examKey" element={<PreparationExam />} />
    </Routes>
  );
}
