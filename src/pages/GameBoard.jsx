import { Link } from "react-router-dom";
export default function GameBoard() {
  return (
    <div style={{ minHeight: "100vh", background: "#0B1120", color: "white", padding: 32 }}>
      <Link to="/menu">← Retour menu</Link>
      <h1 style={{ fontSize: 28, marginTop: 16 }}>Mode Collectif (Plateau)</h1>
      <p>Placeholder. Prochaine étape : intégrer ton plateau + dé + carte.</p>
    </div>
  );
}
