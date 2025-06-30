import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Evidencija from "./pages/Evidencija";
import Polaznici from "./pages/Polaznici";
import Radionice from "./pages/Radionice";
import Prisustva from "./pages/Prisustva";

function App() {
  return (
    <Router>
      <div style={{ padding: "2rem" }}>
        <h1>EdukatorPlus</h1>
        <nav style={{ marginBottom: "1rem" }}>
          <Link to="/polaznici" style={{ marginRight: "1rem" }}>Polaznici</Link>
          <Link to="/radionice" style={{ marginRight: "1rem" }}>Radionice</Link>
          <Link to="/prisustva" style={{ marginRight: "1rem" }}>Prisustva</Link>
          <Link to="/evidencija">Evidentiraj</Link>
        </nav>
        <Routes>
          <Route path="/polaznici" element={<Polaznici />} />
          <Route path="/radionice" element={<Radionice />} />
          <Route path="/prisustva" element={<Prisustva />} />
          <Route path="/evidencija" element={<Evidencija />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
