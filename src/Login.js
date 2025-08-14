// Lokacija: src/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './pages/App.css';
import { api } from './api';

// Sigurno dekodiranje JWT (podržava URL-safe Base64 i padding)
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
  const [password, setPassword] = useState(''); // dopuštamo sve znakove
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Backend vraća JSON s { token, ... } ili 401/400 s tekstom
      const res = await api.post('/api/auth/login', {
        email: email.trim(),
        password, // BE smije primiti sve znakove
      });

      // naš api.handle već vraća JSON objekt (ne {data:...})
      const data = res || {};
      if (!data.token) throw new Error('API nije vratio token.');

      const { token } = data;
      const payload = decodeJwt(token);
      const role = (payload && payload.role) || data.role || null;

      localStorage.setItem('token', token);
      if (role) localStorage.setItem('role', role);

      // idi na početnu
      navigate('/', { replace: true });
    } catch (err) {
      const msg = (err?.message || '').trim();
      setError(msg ? `Neispravni podaci za prijavu. ${msg}` : 'Neispravni podaci za prijavu.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <div className="brand">
          <div className="logo-dot" aria-hidden />
          <h1>EduPlus</h1>
          <p className="brand-tag">Evidencije za NGO sektore</p>
        </div>
        <ul className="hero-bullets">
          <li>📚 Upravljanje radionicama i terminima</li>
          <li>👥 Polaznici i kontakti na jednom mjestu</li>
          <li>📊 Brza statistika po radionicama</li>
        </ul>
        <p className="hero-footnote">Tip: registriraj se ili zatraži pristup od admina.</p>
      </div>

      <div className="auth-card">
        <h2>Prijava</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input
              type="email"
              placeholder="ime.prezime@udruga.hr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Lozinka
            <div className="input-group">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Unesi lozinku"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pw-input"
                required
              />
              <button
                type="button"
                className="ghost-btn pw-toggle"
                aria-label={showPw ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                aria-pressed={showPw}
                onClick={() => setShowPw((s) => !s)}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </label>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Prijavljivanje…' : 'Prijavi se'}
          </button>
        </form>

        <div className="auth-switch">
          Nemaš račun? <Link to="/register">Registracija</Link>
        </div>

        <div className="auth-meta">
          <span className="meta-badge">NGO</span>
          <span className="meta-badge">Evidencije</span>
          <span className="meta-badge">EduPlus</span>
        </div>
      </div>
    </div>
  );
}