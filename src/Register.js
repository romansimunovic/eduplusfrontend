import React, { useState } from 'react';
import './pages/App.css';
import { api } from './api';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState('USER');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e?.preventDefault?.();
    setError(null); setSuccess(null);
    if (!email || !password || !role) {
      setError('Sva polja su obavezna.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/auth/register?role=${encodeURIComponent(role)}`, { email, password });
      setSuccess('Uspješna registracija! Preusmjeravam na prijavu…');
      setTimeout(() => navigate('/login', { replace: true }), 800);
    } catch (e2) {
      setError(`Greška pri registraciji. ${e2?.message || ''}`.trim());
    } finally {
      setSubmitting(false);
    }
  };

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
            />
          </label>

          <label>
            Lozinka
            <div className="input-group">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Min. 8 znakova"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" className="ghost-btn" onClick={() => setShowPw(s => !s)}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          <label>
            Uloga
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="USER">Korisnik</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Spremam..." : "Registriraj"}
          </button>
        </form>

        <div className="auth-switch">
          Već imaš račun? <Link to="/login">Prijava</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
