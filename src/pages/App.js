import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Radionice from './Radionice';
import Polaznici from './Polaznici';
import Prisustva from './Prisustva';
import RadionicaDetalji from './RadionicaDetalji';
import Home from './Home';

import './App.css';

function App() {
  return (
    <Router>
      <div className="header-banner">
        <h1>EdukatorPlus</h1>
        <p>Digitalna platforma za evidenciju edukacija, polaznika i prisustva</p>
      </div>

      <nav>
        <ul className="nav-links">
          <li><Link to="/">Početna</Link></li>
          <li><Link to="/radionice">Radionice</Link></li>
          <li><Link to="/polaznici">Polaznici</Link></li>
          <li><Link to="/prisustva">Prisustva</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/radionice" element={<Radionice />} />
        <Route path="/polaznici" element={<Polaznici />} />
        <Route path="/prisustva" element={<Prisustva />} />
        <Route path="/radionice/:id" element={<RadionicaDetalji />} />
      </Routes>
    </Router>
  );
}

export default App;
