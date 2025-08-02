// Polaznici.js
import React, { useEffect, useState } from 'react';
import './App.css';

const baseUrl = "https://eduplusbackend.onrender.com";

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
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [editId, setEditId] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const fetchPolaznici = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/polaznici`);
      if (!res.ok) throw new Error("Neuspješno dohvaćanje polaznika");
      const data = await res.json();
      setPolaznici(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Neuspješno dohvaćanje podataka.");
    }
  };

  useEffect(() => {
    fetchPolaznici();
  }, []);

  const handleAddOrUpdate = () => {
    if (!ime || !prezime || !email || !godinaRodenja || !spol || !telefon || !grad || !status) {
      setError("Sva polja su obavezna.");
      return;
    }

    const godina = parseInt(godinaRodenja);
    if (isNaN(godina) || godina < 1900 || godina > new Date().getFullYear()) {
      setError("Godina rođenja nije ispravna.");
      return;
    }

    const payload = { ime, prezime, email, godinaRodenja: godina, spol, telefon, grad, status };

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${baseUrl}/api/polaznici/${editId}` : `${baseUrl}/api/polaznici`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        fetchPolaznici();
        resetForm();
      })
      .catch(() => setError("Greška kod spremanja polaznika."));
  };

  const resetForm = () => {
    setIme(""); setPrezime(""); setEmail(""); setGodinaRodenja("");
    setSpol(""); setTelefon(""); setGrad(""); setStatus("");
    setEditId(null); setError(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Obrisati ovog polaznika?")) return;

    fetch(`${baseUrl}/api/polaznici/${id}`, { method: 'DELETE' })
      .then(() => fetchPolaznici())
      .catch(() => setError("Greška kod brisanja."));
  };

  const handleSort = (key) => {
    const sorted = [...polaznici].sort((a, b) => a[key].localeCompare(b[key]));
    setPolaznici(sorted);
    setSortKey(key);
  };

  const handleEdit = (p) => {
    setIme(p.ime); setPrezime(p.prezime); setEmail(p.email); setGodinaRodenja(p.godinaRodenja);
    setSpol(p.spol); setTelefon(p.telefon); setGrad(p.grad); setStatus(p.status); setEditId(p.id);
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
          <option value="Drugo">Drugo</option>
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

      <input className="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pretraži po imenu" />
      <select className="sort" onChange={e => handleSort(e.target.value)} value={sortKey}>
        <option value="">Sortiraj</option>
        <option value="ime">Po imenu</option>
        <option value="prezime">Po prezimenu</option>
      </select>

      <ul className="list">
        {filtrirani.map(p => (
          <li key={p.id}>
            <span>
          {p.ime} {p.prezime} ({p.email}) — {p.grad}, {p.godinaRodenja} • {p.spol}, {p.status} • 📞 {p.telefon}
            </span>
            <div>
              <button onClick={() => handleEdit(p)}>Uredi</button>
              <button className="delete" onClick={() => handleDelete(p.id)}>Obriši</button>
            </div>
          </li>
        ))}
      </ul>

      <p className="total">Ukupno: {filtrirani.length} polaznika</p>
      <button onClick={() => setShowStats(!showStats)}>
        {showStats ? "Sakrij statistiku" : "Prikaži statistiku"}
      </button>

      {showStats && (
        <div className="stats">
          <p>Rođeni prije 2000.: {polaznici.filter(p => p.godinaRodenja < 2000).length}</p>
          <p>Rođeni 2000. i kasnije: {polaznici.filter(p => p.godinaRodenja >= 2000).length}</p>
        </div>
      )}
    </div>
  );
}

export default Polaznici;
