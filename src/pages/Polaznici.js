import React, { useEffect, useState } from 'react';
import './App.css';
import { api } from '../api';

function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [godinaRodenja, setGodinaRodenja] = useState("");
  const [spol, setSpol] = useState("");
  const [telefon, setTelefon] = useState("");
  const [grad, setGrad] = useState("");
  const [status, setStatus] = useState("");
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [selectedPolaznik, setSelectedPolaznik] = useState(null);

  useEffect(() => {
    fetchPolaznici();
  }, []);

  const fetchPolaznici = async () => {
    try {
      const data = await api.get('/api/polaznici');
      setPolaznici(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      setError(`Neuspješno dohvaćanje podataka. ${e?.message || ""}`.trim());
    }
  };

  const handleAddOrUpdate = async () => {
    if (!ime || !prezime || !email || !godinaRodenja || !spol || !telefon || !grad || !status) {
      setError("Sva polja su obavezna.");
      return;
    }

    const godina = parseInt(godinaRodenja, 10);
    if (isNaN(godina) || godina < 1900 || godina > new Date().getFullYear()) {
      setError("Godina rođenja nije ispravna.");
      return;
    }

    const payload = { ime, prezime, email, godinaRodenja: godina, spol, telefon, grad, status };
    const path = editId ? `/api/polaznici/${editId}` : '/api/polaznici';

    try {
      if (editId) {
        await api.put(path, payload);
      } else {
        await api.post(path, payload);
      }
      await fetchPolaznici();
      resetForm();
    } catch (e) {
      setError(`Greška kod spremanja polaznika. ${e?.message || ""}`.trim());
    }
  };

  const resetForm = () => {
    setIme(""); setPrezime(""); setEmail(""); setGodinaRodenja("");
    setSpol(""); setTelefon(""); setGrad(""); setStatus("");
    setEditId(null); setError(null); setSelectedPolaznik(null);
  };

  const handleEdit = (p) => {
    setIme(p.ime); setPrezime(p.prezime); setEmail(p.email);
    setGodinaRodenja(p.godinaRodenja); setSpol(p.spol);
    setTelefon(p.telefon); setGrad(p.grad); setStatus(p.status);
    setEditId(p.id); setSelectedPolaznik(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Obrisati ovog polaznika?")) return;
    try {
      await api.del(`/api/polaznici/${id}`);
      await fetchPolaznici();
    } catch (e) {
      setError(`Greška kod brisanja. ${e?.message || ""}`.trim());
    }
  };

  const handleSort = (key) => {
    const sorted = [...polaznici].sort((a, b) => {
      if (key === "godinaRodenja") return a[key] - b[key];
      return String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'hr');
    });
    setPolaznici(sorted);
    setSortKey(key);
  };

  const filtrirani = polaznici.filter(p =>
    `${p.ime} ${p.prezime}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="polaznici-container">
      <h2>Polaznici</h2>
      {error && <p className="error">{error}</p>}

      <div className="form">
        <input value={ime} onChange={e => setIme(e.target.value)} placeholder="Ime" />
        <input value={prezime} onChange={e => setPrezime(e.target.value)} placeholder="Prezime" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="number" value={godinaRodenja} onChange={e => setGodinaRodenja(e.target.value)} placeholder="Godina rođenja" />

        <select value={spol} onChange={e => setSpol(e.target.value)}>
          <option value="">Odaberi spol</option>
          <option value="M">Muški</option>
          <option value="Ž">Ženski</option>
        </select>

        <input value={telefon} onChange={e => setTelefon(e.target.value)} placeholder="Broj mobitela" />
        <input value={grad} onChange={e => setGrad(e.target.value)} placeholder="Grad" />

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Status</option>
          <option value="student">Student</option>
          <option value="zaposlen">Zaposlen</option>
          <option value="učenik">Učenik</option>
          <option value="nezaposlen">Nezaposlen</option>
        </select>

        <button onClick={handleAddOrUpdate}>
          {editId ? "Spremi izmjene" : "Dodaj"}
        </button>
      </div>

      <input
        className="search"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Pretraži po imenu"
      />

      <select className="sort" onChange={e => handleSort(e.target.value)} value={sortKey}>
        <option value="">Sortiraj</option>
        <option value="ime">Po imenu</option>
        <option value="prezime">Po prezimenu</option>
        <option value="spol">Po spolu</option>
        <option value="grad">Po gradu</option>
        <option value="status">Po statusu</option>
        <option value="godinaRodenja">Po godini rođenja</option>
      </select>

      {selectedPolaznik && (
        <div className="stat-box">
          <h3>📄 Podaci za: {selectedPolaznik.ime} {selectedPolaznik.prezime}</h3>
          <p>📧 Email: {selectedPolaznik.email}</p>
          <p>🎂 Godina rođenja: {selectedPolaznik.godinaRodenja}</p>
          <p>📱 Telefon: {selectedPolaznik.telefon}</p>
          <p>🏙️ Grad: {selectedPolaznik.grad}</p>
          <p>🧬 Spol: {selectedPolaznik.spol === "M" ? "Muški" : "Ženski"}</p>
          <p>🎓 Status: {selectedPolaznik.status}</p>
          <button onClick={() => setSelectedPolaznik(null)}>Prikaži sve</button>
        </div>
      )}

      <ul className="list">
        {filtrirani.map(p => (
          <li
            key={p.id}
            onClick={() => setSelectedPolaznik(p)}
            style={{
              fontWeight: selectedPolaznik?.id === p.id ? 'bold' : 'normal',
              border: selectedPolaznik?.id === p.id ? '2px solid #000' : '1px solid #ccc',
              borderRadius: '6px',
              padding: '6px',
              marginBottom: '6px',
              cursor: 'pointer'
            }}
          >
            <span>
              {p.ime} {p.prezime} ({p.email}) — {p.grad}, {p.godinaRodenja} • {p.spol}, {p.status} • 📞 {p.telefon}
            </span>
            <div>
              <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }}>Uredi</button>
              <button className="delete" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}>Obriši</button>
            </div>
          </li>
        ))}
      </ul>

      <p className="total">Ukupno: {filtrirani.length} polaznika</p>
    </div>
  );
}

export default Polaznici;
