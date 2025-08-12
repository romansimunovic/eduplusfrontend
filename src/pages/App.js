// src/pages/App.js  (DEV branch)
import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

import Home from './Home';
import Polaznici from './Polaznici';
import Radionice from './Radionice';
import RadionicaDetalji from './RadionicaDetalji';
import Prisustva from './Prisustva';

// Login/Register su u src/, a App.js je u src/pages/
import Login from '../Login';
import Register from '../Register';

// --- Guards ---
function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function AdminOnly({ children }) {
  const role = localStorage.getItem('role');
  return role === 'ADMIN' ? children : <Navigate to="/" replace />;
}

// --- Layout ---
function Layout({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const doLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <div>
      <nav className="container" style={{ marginBottom: '1rem' }}>
        <div className="nav-links" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/">Početna</Link>
          <Link to="/radionice">Radionice</Link>
          {/* Admin-only linkovi */}
          {role === 'ADMIN' && (
            <>
              <Link to="/polaznici">Polaznici</Link>
              <Link to="/prisustva">Prisustva</Link>
              <Link to="/register">Dodaj korisnika</Link>
            </>
          )}
          <span style={{ marginLeft: 'auto' }} />
          {token ? (
            <button className="btn btn-outline" onClick={doLogout}>Odjava</button>
          ) : (
            <>
              <Link to="/login">Prijava</Link>
              <Link to="/register">Registracija</Link>
            </>
          )}
        </div>
      </nav>
      {children}
    </div>
  );
}

// --- App (routes) ---
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout><Home /></Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/radionice"
        element={
          <RequireAuth>
            <Layout><Radionice /></Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/radionice/:id"
        element={
          <RequireAuth>
            <Layout><RadionicaDetalji /></Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/polaznici"
        element={
          <RequireAuth>
            <AdminOnly>
              <Layout><Polaznici /></Layout>
            </AdminOnly>
          </RequireAuth>
        }
      />
      <Route
        path="/prisustva"
        element={
          <RequireAuth>
            <AdminOnly>
              <Layout><Prisustva /></Layout>
            </AdminOnly>
          </RequireAuth>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
