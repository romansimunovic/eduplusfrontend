// src/pages/App.js
import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from './Home';
import Polaznici from './Polaznici';
import Radionice from './Radionice';
import RadionicaDetalji from './RadionicaDetalji';
import Prisustva from './Prisustva';
import Login from '../Login';
import Register from '../Register';
import AdminUsers from './AdminUsers'; // ✅ ispravan import

// Dev stranica (učitavamo lijeno; prikaz samo u dev buildu)
const DevData = React.lazy(() =>
  import('./DevData').catch(() => ({ default: () => null }))
);

// Prikaz dev alata samo u dev buildu ili ako forsiraš flagom
const showDev =
  process.env.NODE_ENV !== 'production' ||
  process.env.REACT_APP_DEV_TOOLS === 'true';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  const token = localStorage.getItem('token');
  const role = (localStorage.getItem('role') || '').toUpperCase();
  const isAdmin = role === 'ADMIN';

  const doLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <div>
      <nav className="container" style={{ marginBottom: '1rem' }}>
        <div className="nav-links" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/">Početna</Link>
          <Link to="/radionice">Radionice</Link>
          <Link to="/polaznici">Polaznici</Link>
          <Link to="/prisustva">Prisustva</Link>

          {/* admin link vidljiv samo ADMIN-u */}
          {isAdmin && (
            <>
              <span style={{ opacity: 0.3 }}>|</span>
              <Link to="/admin/users" style={{ fontSize: 13, opacity: 0.95 }}>Admin korisnici</Link>
            </>
          )}

          {/* dev link samo u dev buildu */}
          {showDev && (
            <>
              <span style={{ opacity: 0.3 }}>|</span>
              <Link to="/dev-data" style={{ fontSize: 13, opacity: 0.85 }}>Dev data</Link>
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

      <React.Suspense fallback={<div style={{ padding: 16 }}>Učitavam…</div>}>
        {children}
      </React.Suspense>
    </div>
  );
}

export default function App() {
  const isAdmin = (localStorage.getItem('role') || '').toUpperCase() === 'ADMIN';

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
        path="/polaznici"
        element={
          <RequireAuth>
            <Layout><Polaznici /></Layout>
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
        path="/prisustva"
        element={
          <RequireAuth>
            <Layout><Prisustva /></Layout>
          </RequireAuth>
        }
      />

      {/* Admin-only ruta */}
      <Route
        path="/admin/users"
        element={
          <RequireAuth>
            {isAdmin ? (
              <Layout><AdminUsers /></Layout>
            ) : (
              <Navigate to="/" replace />
            )}
          </RequireAuth>
        }
      />

      {/* Dev-only ruta (vidljiva samo u dev buildu / s REACT_APP_DEV_TOOLS=true) */}
      {showDev && (
        <Route
          path="/dev-data"
          element={
            <RequireAuth>
              <Layout><DevData /></Layout>
            </RequireAuth>
          }
        />
      )}

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
