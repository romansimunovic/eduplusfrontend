import React, { useState } from 'react';
import './pages/App.css';
import { api } from './api';
import { Link, useNavigate } from 'react-router-dom';

function Login({ setToken, setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data = await api.post('/api/auth/login', { email, password });
      if (!data?.token) throw new Error('Nedostaje token u odgovoru.');

      const token = data.token;
      let role = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        role = payload?.role || data.role || null;
      } catch {
        role = data.role || null;
      }

      localStorage.setItem('token', token);
      if (role) localStorage.setItem('role', role);
      setToken?.(token);
      if (role) setUserRole?.(role);

      navigate('/', { replace: true }); // ← preusmjeri na Home
    } catch (err) {
      setError(`Neispravni podaci za prijavu. ${err?.message || ''}`.trim());
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
          <li>📚 Upravljanje radionicama i terminima</li>
          <li>👥 Polaznici i kontakti na jednom mjestu</li>
          <li>✅ Prisustva s rodno osjetljivim statusima</li>
          <li>📊 Brze statistike po radionicama</li>
        </ul>
        <p className="hero-footnote">Tip: zatraži registraciju od admina ili otvori “Registracija”.</p>
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
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Lozinka
            <div className="input-group">
              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" className="ghost-btn" onClick={() => setShowPw(s => !s)}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Prijavljivanje..." : "Prijavi se"}
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

export default Login;
