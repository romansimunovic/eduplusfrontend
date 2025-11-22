import React, { useEffect, useState } from "react";
import { api } from "../api/api";

export default function Prisustva() {
  const [prisustva, setPrisustva] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [radionice, setRadionice] = useState([]);
  const [form, setForm] = useState({
    polaznikId: "",
    radionicaId: "",
    status: "PRISUTAN"
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [pResp, rResp, prResp] = await Promise.all([
        api.get("/polaznici"), api.get("/radionice"), api.get("/prisustva")
      ]);
      setPolaznici(Array.isArray(pResp.data) ? pResp.data : []);
      setRadionice(Array.isArray(rResp.data) ? rResp.data : []);
      setPrisustva(Array.isArray(prResp.data) ? prResp.data : []);
      setError("");
    } catch { setError("Greška kod učitavanja podataka."); }
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
    if (!form.polaznikId || !form.radionicaId || !form.status)
      return setError("Odaberi sve podatke!");
    const payload = {
      polaznikId: Number(form.polaznikId),
      radionicaId: Number(form.radionicaId),
      status: form.status
    };
    try {
      if (editId) {
        await api.put(`/prisustva/${editId}`, payload);
      } else {
        await api.post("/prisustva", payload);
      }
      await fetchAll();
      setForm({ polaznikId: "", radionicaId: "", status: "PRISUTAN" });
      setEditId(null);
    } catch {
      setError("Greška kod spremanja prisustva.");
    }
  };

  const handleEdit = (p) => {
    setForm({
      polaznikId: p.polaznikId,
      radionicaId: p.radionicaId,
      status: p.status
    });
    setEditId(p.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Obrisati podatak?")) return;
    try {
      await api.delete(`/prisustva/${id}`);
      await fetchAll();
    } catch {
      setError("Greška kod brisanja.");
    }
  };

  // Helper za prikaz imena
  const getPolaznik = id => {
    const p = polaznici.find(x => x.id === id);
    return p ? `${p.ime} ${p.prezime}` : "—";
  };
  const getRadionica = id => {
    const r = radionice.find(x => x.id === id);
    return r ? r.naziv : "—";
  };

  // Filtar po imenu polaznika ili radionice
  const filtrirani = prisustva.filter(p => {
    const polaznikIme = getPolaznik(p.polaznikId).toLowerCase();
    const radionicaNaziv = getRadionica(p.radionicaId).toLowerCase();
    return (
      polaznikIme.includes(search.trim().toLowerCase()) ||
      radionicaNaziv.includes(search.trim().toLowerCase())
    );
  });

  return (
    <div className="container">
      <h2>Prisustva</h2>
      <form onSubmit={handleSubmit}>
        <select
          name="polaznikId"
          value={form.polaznikId}
          onChange={handleInput}
          required
        >
          <option value="">Polaznik...</option>
          {polaznici.map(p => (
            <option key={p.id} value={p.id}>
              {p.ime} {p.prezime}
            </option>
          ))}
        </select>
        <select
          name="radionicaId"
          value={form.radionicaId}
          onChange={handleInput}
          required
        >
          <option value="">Radionica...</option>
          {radionice.map(r => (
            <option key={r.id} value={r.id}>
              {r.naziv}
            </option>
          ))}
        </select>
        <select
          name="status"
          value={form.status}
          onChange={handleInput}
          required
        >
          <option value="PRISUTAN">Prisutan</option>
          <option value="IZOSTAO">Izostao</option>
          <option value="ODUSTAO">Odustao</option>
          <option value="NEPOZNATO">Nepoznato</option>
        </select>
        <button type="submit">{editId ? "Spremi promjene" : "Dodaj prisustvo"}</button>
        {error && <div className="error">{error}</div>}
      </form>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Pretraži polaznika ili radionicu"
        style={{ marginTop: 12, marginBottom: 8, width: "100%" }}
      />
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr style={{ background: "#e3e5fd"}}>
            <th style={{padding:8}}>Polaznik</th>
            <th style={{padding:8}}>Radionica</th>
            <th style={{padding:8}}>Status</th>
            <th style={{padding:8}}>Radnja</th>
          </tr>
        </thead>
        <tbody>
          {filtrirani.map(p => (
            <tr key={p.id} style={{ background: "#f9faff"}}>
              <td style={{padding:8}}>{getPolaznik(p.polaznikId)}</td>
              <td style={{padding:8}}>{getRadionica(p.radionicaId)}</td>
              <td style={{padding:8}}>{p.status}</td>
              <td style={{padding:8}}>
                <button onClick={() => handleEdit(p)} style={{marginRight:6}}>Uredi</button>
                <button onClick={() => handleDelete(p.id)}>Obriši</button>
              </td>
            </tr>
          ))}
          {filtrirani.length === 0 && (
            <tr>
              <td colSpan={4} style={{padding:8}}>Nema rezultata.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{marginTop:12}}>Ukupno: {filtrirani.length}</div>
    </div>
  );
}
