import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Home from './Home';
import Radionice from './Radionice';
import Polaznici from './Polaznici';
import Prisustva from './Prisustva';
import RadionicaDetalji from './RadionicaDetalji';
import Login from './Login';
import Register from './Register';

import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setUserRole(null);
  };

  if (loading) return <p>Učitavanje...</p>;

  if (!token || !["ADMIN", "USER"].includes(userRole)) {
    return <Login setToken={setToken} setUserRole={setUserRole} />;
  }

  return (
    <Router>
      <div className="app-container">
        <header className="header-banner">
          <h1>EdukatorPlus</h1>
          <p>Digitalna platforma za evidenciju edukacija, polaznika i prisustva</p>
          <div style={{ float: 'right', textAlign: 'right' }}>
            <p style={{ marginBottom: '4px', fontSize: '0.9em' }}>
              Prijavljen kao: <strong>{userRole}</strong>
            </p>
            <button onClick={handleLogout}>Odjava</button>
          </div>
        </header>

        <nav className="main-nav">
          <ul className="nav-links">
            <li><Link to="/">Početna</Link></li>
            <li><Link to="/radionice">Radionice</Link></li>
            {userRole === "ADMIN" && (
              <>
                <li><Link to="/polaznici">Polaznici</Link></li>
                <li><Link to="/prisustva">Prisustva</Link></li>
                <li><Link to="/register">Dodaj korisnika</Link></li>
              </>
            )}
          </ul>
        </nav>

        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/radionice" element={<Radionice />} />
            <Route path="/radionice/:id" element={<RadionicaDetalji />} />
            {userRole === "ADMIN" && (
              <>
                <Route path="/polaznici" element={<Polaznici />} />
                <Route path="/prisustva" element={<Prisustva />} />
                <Route path="/register" element={<Register />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
