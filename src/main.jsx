import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import { CharacterProvider } from "./context/CharacterContext";
import { ProgressProvider } from "./context/ProgressContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CharacterProvider>
      <ProgressProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ProgressProvider>
    </CharacterProvider>
  </React.StrictMode>
);
