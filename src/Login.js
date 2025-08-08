// Lokacija: src/Login.js
import React, { useState } from 'react';
import './pages/App.css';
import { api } from './api';

function Login({ setToken, setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await api.post('/api/auth/login', { email, password });
      if (!data?.token) throw new Error('Nedostaje token u odgovoru.');

      const token = data.token;

      // decode role iz JWT-a
      let role = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        role = payload?.role || null;
      } catch {
        // fallback: ako backend šalje i role u body-ju
        role = data.role || null;
      }

      localStorage.setItem("token", token);
      if (role) localStorage.setItem("role", role);

      setToken(token);
      if (role) setUserRole(role);
    } catch (err) {
      setError(`Neispravni podaci za prijavu. ${err?.message || ''}`.trim());
    }
  };

  return (
    <div className="login-box">
      <h2>Prijava</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Prijavi se</button>
      </form>
    </div>
  );
}

export default Login;
