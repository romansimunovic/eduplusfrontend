import React, { useEffect, useState } from "react";
import { api } from "../api/api";

export default function Radionice() {
  const [radionice, setRadionice] = useState([]);
  const [form, setForm] = useState({
    naziv: "",
    datum: "",
    opis: "",
    link: "",
    organizator: "",
    tip: "ONLINE",
    maxPolaznika: "",
    aktivna: true
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRadionice();
  }, []);

  const fetchRadionice = async () => {
    try {
      const res = await api.get("/radionice");
      setRadionice(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Greška prilikom učitavanja radionica.");
    }
  };

  const handleInput = (e) => {
    let { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.naziv.trim() || !form.datum)
      return setError("Naziv i datum su obavezni!");
    const payload = {
      ...form,
      maxPolaznika: form.maxPolaznika ? Number(form.maxPolaznika) : null,
    };
    try {
      if (editId) {
        await api.put(`/radionice/${editId}`, payload);
      } else {
        await api.post("/radionice", payload);
      }
      await fetchRadionice();
      setForm({
        naziv: "",
        datum: "",
        opis: "",
        link: "",
        organizator: "",
        tip: "ONLINE",
        maxPolaznika: "",
        aktivna: true
      });
      setEditId(null);
    } catch {
      setError("Greška kod spremanja.");
    }
  };

  const handleEdit = (r) => {
    setForm({
      naziv: r.naziv || "",
      datum: r.datum || "",
      opis: r.opis || "",
      link: r.link || "",
      organizator: r.organizator || "",
      tip: r.tip || "ONLINE",
      maxPolaznika: r.maxPolaznika || "",
      aktivna: r.aktivna === undefined ? true : r.aktivna
    });
    setEditId(r.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Obrisati radionicu?")) return;
    try {
      await api.delete(`/radionice/${id}`);
      await fetchRadionice();
    } catch {
      setError("Greška kod brisanja.");
    }
  };

  const filtrirane = radionice.filter(r =>
    (r.naziv || '').toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="container">
      <h2>Radionice</h2>
      <form onSubmit={handleSubmit}>
        <input name="naziv" value={form.naziv} onChange={handleInput} placeholder="Naziv radionice" required />
        <input name="datum" type="date" value={form.datum} onChange={handleInput} required />
        <input name="opis" value={form.opis} onChange={handleInput} placeholder="Opis" />
        <input name="organizator" value={form.organizator} onChange={handleInput} placeholder="Organizator" />
        <input name="link" value={form.link} onChange={handleInput} placeholder="Link" />
        <select name="tip" value={form.tip} onChange={handleInput}>
          <option value="ONLINE">Online</option>
          <option value="UŽIVO">Uživo</option>
        </select>
        <input name="maxPolaznika" type="number" min="1" value={form.maxPolaznika} onChange={handleInput} placeholder="Max polaznika" />
        <label>
          <input name="aktivna" type="checkbox" checked={form.aktivna} onChange={handleInput} /> Aktivna
        </label>
        <button type="submit">{editId ? "Spremi promjene" : "Dodaj radionicu"}</button>
        {error && <div className="error">{error}</div>}
      </form>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Pretraži radionice" />
      <ul>
        {filtrirane.map(r => (
          <li key={r.id} style={{ marginBottom: 10, padding: 8, borderRadius: 9, background: "#fcfcfc"}}>
            <strong>{r.naziv}</strong> ({r.datum})<br/>
            <span><b>Opis:</b> {r.opis?.slice(0,60) || "—"} </span><br/>
            <span><b>Tip:</b> {r.tip}, <b>Link:</b> <a href={r.link} target="_blank" rel="noopener">{r.link}</a></span><br/>
            <span><b>Organizator:</b> {r.organizator || '—'} </span><br/>
            <span><b>Polaznika max:</b> {r.maxPolaznika || "—"} </span>
            <span style={{marginLeft:12}}><b>Status:</b> {r.aktivna ? "Aktivna" : "Neaktivna"}</span>
            <br />
            <button onClick={() => handleEdit(r)} style={{marginRight:6}}>Uredi</button>
            <button onClick={() => handleDelete(r.id)}>Obriši</button>
          </li>
        ))}
        {filtrirane.length === 0 && <li>Nema rezultata.</li>}
      </ul>
      <div>Ukupno: {filtrirane.length}</div>
    </div>
  );
}
