import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './Home';
import Radionice from './Radionice';
import Polaznici from './Polaznici';
import Prisustva from './Prisustva';
import RadionicaDetalji from './RadionicaDetalji';

import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header-banner">
          <h1>EdukatorPlus</h1>
          <p>Digitalna platforma za evidenciju edukacija, polaznika i prisustva</p>
        </header>

        <nav className="main-nav">
          <ul className="nav-links">
            <li><Link to="/">Početna</Link></li>
            <li><Link to="/radionice">Radionice</Link></li>
            <li><Link to="/polaznici">Polaznici</Link></li>
            <li><Link to="/prisustva">Prisustva</Link></li>
          </ul>
        </nav>

        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/radionice" element={<Radionice />} />
            <Route path="/radionice/:id" element={<RadionicaDetalji />} />
            <Route path="/polaznici" element={<Polaznici />} />
            <Route path="/prisustva" element={<Prisustva />} />
          </Routes>
        </main>

        {/* ToastContainer MORA biti tu za prikaz svih toast poruka u aplikaciji */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
