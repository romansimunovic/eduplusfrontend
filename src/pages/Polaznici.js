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
      console.error("Greška kod dohvata polaznika:", err);
      setError("Neuspješno dohvaćanje podataka o polaznicima.");
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

    const payload = {
      ime,
      prezime,
      email,
      godinaRodenja: parseInt(godinaRodenja),
      spol,
      telefon,
      grad,
      status
    };

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${baseUrl}/api/polaznici/${editId}` : `${baseUrl}/api/polaznici`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Greška kod spremanja polaznika");
        return res.json();
      })
      .then(() => {
        fetchPolaznici();
        setIme(""); setPrezime(""); setEmail(""); setGodinaRodenja("");
        setSpol(""); setTelefon(""); setGrad(""); setStatus("");
        setEditId(null); setError(null);
      })
      .catch(err => {
        console.error("Greška kod spremanja:", err);
        setError("Neuspješno spremanje polaznika.");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Jeste li sigurni da želite obrisati ovog polaznika?")) return;

    fetch(`${baseUrl}/api/polaznici/${id}`, { method: 'DELETE' })
      .then(() => setPolaznici(polaznici.filter(p => p.id !== id)))
      .catch(err => {
        console.error("Greška kod brisanja:", err);
        setError("Neuspješno brisanje polaznika.");
      });
  };

  const handleSort = (key) => {
    const sorted = [...polaznici].sort((a, b) => a[key].localeCompare(b[key]));
    setPolaznici(sorted);
    setSortKey(key);
  };

  const handleEdit = (polaznik) => {
    setIme(polaznik.ime);
    setPrezime(polaznik.prezime);
    setEmail(polaznik.email);
    setGodinaRodenja(polaznik.godinaRodenja);
    setSpol(polaznik.spol);
    setTelefon(polaznik.telefon);
    setGrad(polaznik.grad);
    setStatus(polaznik.status);
    setEditId(polaznik.id);
  };

  const filtriraniPolaznici = polaznici.filter(p =>
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
        <input value={godinaRodenja} onChange={e => setGodinaRodenja(e.target.value)} placeholder="Godina rođenja" type="number" />

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

      <input
        className="search"
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Pretraži polaznike po imenu"
      />

      <select className="sort" onChange={(e) => handleSort(e.target.value)} value={sortKey}>
        <option value="">Sortiraj</option>
        <option value="ime">Po imenu</option>
        <option value="prezime">Po prezimenu</option>
      </select>

      <ul className="list">
        {filtriraniPolaznici.map(p => (
          <li key={p.id}>
            <span>{p.ime} {p.prezime} ({p.email}, {p.godinaRodenja}, {p.grad})</span>
            <div>
              <button onClick={() => handleEdit(p)}>Uredi</button>
              <button onClick={() => handleDelete(p.id)} className="delete">Obriši</button>
            </div>
          </li>
        ))}
      </ul>

      <p className="total">Ukupno: {filtriraniPolaznici.length} polaznika</p>
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
