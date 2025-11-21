// src/pages/Register.js
import { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const resp = await api.post("/auth/register", { email, password, ime, prezime });
      setMsg(resp.data);
      if (resp.data.includes("uspješna")) setTimeout(() => navigate("/login"), 1000);
    } catch {
      setMsg("Greška kod registracije.");
    }
  }
  return (
    <div className="container">
      <h2>Registracija</h2>
      <form onSubmit={handleRegister}>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="text" required value={ime} onChange={e => setIme(e.target.value)} placeholder="Ime" />
        <input type="text" required value={prezime} onChange={e => setPrezime(e.target.value)} placeholder="Prezime" />
        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Lozinka" />
        <button type="submit">Registriraj se</button>
        {msg && <div>{msg}</div>}
      </form>
    </div>
  );
}
