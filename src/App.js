import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Polaznici from "./pages/Polaznici";
import Radionice from "./pages/Radionice";
import Prisustva from "./pages/Prisustva";
import Evidencija from "./pages/Evidencija";

export default function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <h1>Edukator+</h1>
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/polaznici" style={{ marginRight: "10px" }}>Polaznici</Link>
          <Link to="/radionice" style={{ marginRight: "10px" }}>Radionice</Link>
          <Link to="/prisustva" style={{ marginRight: "10px" }}>Prisustva</Link>
          <Link to="/evidencija">Evidentiraj</Link>
        </nav>
        <Routes>
          <Route path="/polaznici" element={<Polaznici />} />
          <Route path="/radionice" element={<Radionice />} />
          <Route path="/prisustva" element={<Prisustva />} />
          <Route path="/evidencija" element={<Evidencija />} />
          <Route path="*" element={<div>404 – Stranica ne postoji</div>} />
        </Routes>
      </div>
    </Router>
  );
}
