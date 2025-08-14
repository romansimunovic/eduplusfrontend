// src/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './api';
import './pages/App.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Sva polja su obavezna.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/auth/register?role=${encodeURIComponent(role)}`, {
        email: email.trim(),
        password
      });
      setSuccess('Uspješna registracija! Preusmjeravam...');
      setTimeout(() => navigate('/login', { replace: true }), 700);
    } catch (err) {
      setError('Greška pri registraciji.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h2>Registracija</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleRegister} className="form-grid">
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
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>

          <label>
            Uloga
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="USER">Korisnik</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <button type="submit" disabled={submitting}>
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
