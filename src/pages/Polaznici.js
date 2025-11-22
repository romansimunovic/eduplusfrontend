import React, { useEffect, useState, useMemo } from "react";
import { api } from "../api/api";

export default function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [form, setForm] = useState({
    ime: "",
    prezime: "",
    email: "",
    telefon: "",
    grad: "",
    status: "",
    godinaRodenja: "",
    spol: "",
    napomena: ""
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPolaznici();
  }, []);

  const fetchPolaznici = async () => {
    try {
      const res = await api.get("/polaznici");
      setPolaznici(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Greška kod učitavanja polaznika.");
    }
  };

  const handleInput = (e) => {
    let { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.ime.trim() || !form.prezime.trim())
      return setError("Ime i prezime su obavezni!");
    const payload = {
      ...form,
      godinaRodenja: form.godinaRodenja ? Number(form.godinaRodenja) : null,
      email: form.email.trim()
    };
    try {
      if (editId) {
        await api.put(`/polaznici/${editId}`, payload);
      } else {
        await api.post("/polaznici", payload);
      }
      await fetchPolaznici();
      setForm({
        ime: "",
        prezime: "",
        email: "",
        telefon: "",
        grad: "",
        status: "",
        godinaRodenja: "",
        spol: "",
        napomena: ""
      });
      setEditId(null);
    } catch {
      setError("Greška kod spremanja polaznika.");
    }
  };

  const handleEdit = (p) => {
    setForm({
      ime: p.ime || "",
      prezime: p.prezime || "",
      email: p.email || "",
      telefon: p.telefon || "",
      grad: p.grad || "",
      status: p.status || "",
      godinaRodenja: p.godinaRodenja || "",
      spol: p.spol || "",
      napomena: p.napomena || ""
    });
    setEditId(p.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Obrisati polaznika?")) return;
    try {
      await api.delete(`/polaznici/${id}`);
      await fetchPolaznici();
    } catch {
      setError("Greška kod brisanja.");
    }
  };

  const filtrirani = useMemo(() => {
    const t = search.trim().toLowerCase();
    return (t
      ? polaznici.filter(p =>
          (`${p.ime} ${p.prezime}`.toLowerCase().includes(t)) ||
          (p.email?.toLowerCase().includes(t)) || (p.grad?.toLowerCase().includes(t))
        )
      : polaznici
    ).sort((a, b) => String(a.prezime).localeCompare(String(b.prezime)));
  }, [polaznici, search]);

  return (
    <div className="container">
      <h2>Polaznici</h2>
      <form onSubmit={handleSubmit}>
        <input name="ime" value={form.ime} onChange={handleInput} placeholder="Ime" required />
        <input name="prezime" value={form.prezime} onChange={handleInput} placeholder="Prezime" required />
        <input name="email" type="email" value={form.email} onChange={handleInput} placeholder="Email" />
        <input name="telefon" value={form.telefon} onChange={handleInput} placeholder="Telefon" />
        <input name="grad" value={form.grad} onChange={handleInput} placeholder="Grad" />
        <input name="status" value={form.status} onChange={handleInput} placeholder="Status (npr. student)" />
        <input name="godinaRodenja" type="number" min="1900" max={new Date().getFullYear()} value={form.godinaRodenja} onChange={handleInput} placeholder="Godina rođenja" />
        <select name="spol" value={form.spol} onChange={handleInput}>
          <option value="">Spol</option>
          <option value="M">Muški</option>
          <option value="Ž">Ženski</option>
          <option value="X">Drugo/Ne želim navesti</option>
        </select>
        <input name="napomena" value={form.napomena} onChange={handleInput} placeholder="Napomena (opcionalno)" />
        <button type="submit">{editId ? "Spremi promjene" : "Dodaj polaznika"}</button>
        {error && <div className="error">{error}</div>}
      </form>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pretraži polaznika" />
      <ul style={{marginTop:20}}>
        {filtrirani.map(p => (
          <li key={p.id} style={{marginBottom:10, padding:8, borderRadius:9, background:"#fcfcfc"}}>
            <strong>{p.prezime} {p.ime}</strong> ({p.email || "—"})
            <br />
            <span><b>Telefon:</b> {p.telefon || "—"}, <b>Grad:</b> {p.grad || "—"}, <b>Godina rođenja:</b> {p.godinaRodenja || "—"}</span><br />
            <span><b>Spol:</b> {p.spol || "—"}, <b>Status:</b> {p.status || "—"}</span><br/>
            <span><b>Napomena:</b> {p.napomena || "—"}</span>
            <br />
            <button onClick={() => handleEdit(p)} style={{marginRight:6}}>Uredi</button>
            <button onClick={() => handleDelete(p.id)}>Obriši</button>
          </li>
        ))}
        {filtrirani.length === 0 && <li>Nema rezultata.</li>}
      </ul>
      <div>Ukupno: {filtrirani.length}</div>
    </div>
  );
}
