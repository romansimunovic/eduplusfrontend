// Lokacija: src/Login.js

import React, { useState } from 'react';
import './App.css';

const baseUrl = "https://eduplusbackend.onrender.com";

function Login({ setToken, setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) throw new Error("Prijava nije uspjela");

      const data = await res.json();
      const token = data.token;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role;

      localStorage.setItem("token", token);
      setToken(token);
      setUserRole(role);
    } catch (err) {
      setError("Neispravni podaci za prijavu.");
    }
  };

  return (
    <div className="login-box">
      <h2>Prijava</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Lozinka" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Prijavi se</button>
      </form>
    </div>
  );
}

export default Login;
