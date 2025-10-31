import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import Polaznici from "./Polaznici";
import Radionice from "./Radionice";
import Prisustva from "./Prisustva";
import RadionicaDetalji from "./RadionicaDetalji";

function App() {
  return (
    <>
      <nav style={{ padding: 10, background: "#eee", display: "flex", gap: 12 }}>
        <Link to="/"> Početna</Link>
        <Link to="/polaznici"> Polaznici</Link>
        <Link to="/radionice"> Radionice</Link>
        <Link to="/prisustva"> Prisustva</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/polaznici" element={<Polaznici />} />
        <Route path="/radionice" element={<Radionice />} />
        <Route path="/prisustva" element={<Prisustva />} />
        <Route path="/radionice/:id" element={<RadionicaDetalji />} />
      </Routes>
    </>
  );
}

export default App;
