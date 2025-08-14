// src/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './api';
import './pages/App.css';

function decodeJwt(token) {
  try {
    const base = token.split('.')[1] || '';
    const pad = base.length % 4 === 2 ? '==' : base.length % 4 === 3 ? '=' : '';
    const norm = base.replace(/-/g, '+').replace(/_/g, '/') + pad;
    return JSON.parse(atob(norm));
  } catch {
    return null;
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await api.post('/api/auth/login', {
        email: email.trim(),
        password
      });

      if (!data?.token) throw new Error('API nije vratio token.');

      const payload = decodeJwt(data.token);
      const role = (payload?.role || data.role || '').toUpperCase();

      localStorage.setItem('token', data.token);
      if (role) localStorage.setItem('role', role);

      navigate('/', { replace: true });
    } catch (err) {
      setError('Neispravni podaci za prijavu.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h2>Prijava</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Lozinka
            <div className="input-group">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPw(s => !s)}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Prijavljivanje…' : 'Prijavi se'}
          </button>
        </form>
        <div className="auth-switch">
          Nemaš račun? <Link to="/register">Registracija</Link>
        </div>
      </div>
    </div>
  );
}
