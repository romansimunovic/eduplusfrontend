import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Polaznici from "./pages/Polaznici";
import Radionice from "./pages/Radionice";
import Prisustva from "./pages/Prisustva";
import RadionicaDetalji from "./pages/RadionicaDetalji";

<nav style={{ padding: 10, background: "#eee", display: "flex", gap: 12 }}>
  <a href="/">🏠 Početna</a>
  <a href="/polaznici">👥 Polaznici</a>
  <a href="/radionice">📚 Radionice</a>
  <a href="/prisustva">✅ Prisustva</a>
</nav>

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/polaznici" element={<Polaznici />} />
        <Route path="/radionice" element={<Radionice />} />
        <Route path="/prisustva" element={<Prisustva />} />
        <Route path="/radionice/:id" element={<RadionicaDetalji />} />
      </Routes>
    </Router>
  );
}

export default App;
