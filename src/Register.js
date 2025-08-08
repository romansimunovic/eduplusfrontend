// Lokacija: src/Register.js
import React, { useState } from 'react';
import './pages/App.css';
import { api } from './api';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);

    if (!email || !password || !role) {
      setError('Sva polja su obavezna.');
      return;
    }

    try {
      // backend prima role kao query param
      await api.post(`/api/auth/register?role=${encodeURIComponent(role)}`, { email, password });

      setSuccess('Uspješna registracija korisnika!');
      setEmail('');
      setPassword('');
      setRole('USER');
    } catch (e) {
      setError(`Došlo je do pogreške prilikom registracije. ${e?.message || ''}`.trim());
    }
  };

  return (
    <div className="login-box">
      <h2>Registracija novog korisnika</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Lozinka"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="USER">Korisnik</option>
        <option value="ADMIN">Admin</option>
      </select>

      <button onClick={handleRegister}>Registriraj</button>
    </div>
  );
}

export default Register;
