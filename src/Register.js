// Lokacija: src/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './pages/App.css';
import { api } from './api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // dopuštamo sve znakove
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !role) {
      setError('Sva polja su obavezna.');
      return;
    }

    setSubmitting(true);
    try {
      // Primarno: role kao query param (tvoj originalni BE)
      try {
        await api.post(`/api/auth/register?role=${encodeURIComponent(role)}`, {
          email: email.trim(),
          password, // BE smije primiti sve znakove
        });
      } catch {
        // Fallback: role u body-ju (ako BE tako očekuje)
        await api.post('/api/auth/register', {
          email: email.trim(),
          password,
          role,
        });
      }

      setSuccess('Uspješna registracija! Preusmjeravam na prijavu…');
      setTimeout(() => navigate('/login', { replace: true }), 700);
    } catch (err) {
      const msg = (err?.message || '').trim();
      setError(msg ? `Greška pri registraciji: ${msg}` : 'Greška pri registraciji. Pokušaj ponovno.');
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
          <li>🔐 Role-based pristup (ADMIN/USER)</li>
          <li>🧭 Jasna navigacija i pregled</li>
          <li>⚙️ Integracija s vašim procesima</li>
        </ul>
      </div>

      <div className="auth-card">
        <h2>Registracija</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className="form-grid" onSubmit={handleRegister}>
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
                placeholder="Unesi lozinku (može sve znakove)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          <label>
            Uloga
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="USER">Korisnik</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Spremam...' : 'Registriraj'}
          </button>
        </form>

        <div className="auth-switch">
          Već imaš račun? <Link to="/login">Prijava</Link>
        </div>
      </div>
    </div>
  );
}