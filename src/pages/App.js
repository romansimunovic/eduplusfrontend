import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from './Home';
import Polaznici from './Polaznici';
import Radionice from './Radionice';
import RadionicaDetalji from './RadionicaDetalji';
import Prisustva from './Prisustva';
import Login from '../Login';
import Register from '../Register';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  const token = localStorage.getItem('token');

  const doLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <div>
      <nav className="container" style={{ marginBottom: '1rem' }}>
        <div className="nav-links">
          <Link to="/">Početna</Link>
          <Link to="/radionice">Radionice</Link>
          <Link to="/polaznici">Polaznici</Link>
          <Link to="/prisustva">Prisustva</Link>
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

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
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

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
