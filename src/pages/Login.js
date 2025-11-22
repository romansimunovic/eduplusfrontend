import { useState, useContext } from "react";
import { api } from "../api";
import { AuthContext } from '../AuthContext';
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const resp = await api.post("/auth/login", { email, password });
      if (typeof resp.data === "string" && resp.data.length > 100) {
        setToken(resp.data); // JWT token
        setMsg("Uspješno!");
        navigate("/");
      } else {
        setMsg(resp.data);
      }
    } catch {
      setMsg("Greška kod prijave.");
    }
  }
  return (
    <div className="container">
      <h2>Prijava u sustav</h2>
      <form onSubmit={handleLogin}>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Lozinka" />
        <button type="submit">Prijavi se</button>
        {msg && <div>{msg}</div>}
      </form>
      <div>
        <a href="/register">Nemaš račun? Registriraj se</a>
      </div>
    </div>
  );
}
