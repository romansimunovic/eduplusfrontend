import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const baseUrl = "https://eduplusbackend.onrender.com";

function Radionice() {
  const [radionice, setRadionice] = useState([]);
  const [naziv, setNaziv] = useState('');
  const [datum, setDatum] = useState('');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editId, setEditId] = useState(null);

  const fetchRadionice = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/radionice`);
      if (!res.ok) throw new Error("Greška kod dohvaćanja radionica");
      const data = await res.json();
      setRadionice(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Neuspješno dohvaćanje radionica.");
    }
  };

  useEffect(() => {
    fetchRadionice();
  }, []);

  const handleAddOrUpdate = async () => {
    if (!naziv.trim() || !datum) {
      setError("Naziv i datum su obavezni.");
      return;
    }

    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `${baseUrl}/api/radionice/${editId}`
      : `${baseUrl}/api/radionice`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naziv: naziv.trim(),
          datum: datum
        }),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(`Greška: ${errMsg}`);
      }

      await response.json();
      fetchRadionice();
      setNaziv('');
      setDatum('');
      setEditId(null);
      setError(null);
    } catch (err) {
      console.error("Greška kod spremanja radionice:", err);
      setError("Neuspješno spremanje radionice.");
    }
  };

const handleDelete = async (id) => {
  if (!window.confirm("Jeste li sigurni da želite obrisati ovu radionicu?")) return;
  try {
    const res = await fetch(`${baseUrl}/api/radionice/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error("Brisanje nije uspjelo.");

    fetchRadionice(); // ponovno učitavanje liste
  } catch (err) {
    console.error("Greška kod brisanja:", err);
    setError("Neuspješno brisanje radionice.");
  }
};

  const handleEdit = (radionica) => {
    setNaziv(radionica.naziv);
    setDatum(radionica.datum);
    setEditId(radionica.id);
  };

  const handleSort = () => {
    const sorted = [...radionice].sort((a, b) =>
      sortOrder === 'asc'
        ? a.naziv.localeCompare(b.naziv)
        : b.naziv.localeCompare(a.naziv)
    );
    setRadionice(sorted);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filtriraneRadionice = radionice.filter(r =>
    r.naziv.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatirajDatum = (isoDatum) => {
    const [yyyy, mm, dd] = isoDatum.split("-");
    return `${dd}.${mm}.${yyyy}.`;
  };

  return (
    <div className="container">
      <h2>Radionice</h2>
      {error && <p className="error">{error}</p>}

      <div className="flex-row">
        <input
          type="text"
          placeholder="Naziv radionice"
          value={naziv}
          onChange={e => setNaziv(e.target.value)}
        />
        <input
          type="date"
          value={datum}
          onChange={e => setDatum(e.target.value)}
        />
        <button onClick={handleAddOrUpdate}>
          {editId ? "Spremi promjene" : "Dodaj radionicu"}
        </button>
      </div>

      <div className="flex-row">
        <input
          type="text"
          placeholder="Pretraži radionice"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSort}>
          Sortiraj {sortOrder === 'asc' ? '⏶' : '⏷'}
        </button>
      </div>

 <ul>
  {filtriraneRadionice.map(r => (
    <li key={r.id}>
      <Link to={`/radionice/${r.id}`}>
        <strong>{r.naziv}</strong>
      </Link>
      <div style={{ fontStyle: 'italic', color: '#555', marginBottom: '0.3rem' }}>
        {r.opis}
      </div>
      <div>
        📅 {formatirajDatum(r.datum)}
      </div>
      <div>
        <button className="edit" onClick={() => handleEdit(r)}>Uredi</button>
        <button className="delete" onClick={() => handleDelete(r.id)}>Obriši</button>
      </div>
    </li>
  ))}
</ul>

      <p style={{ marginTop: "1rem" }}>Ukupno radionica: {filtriraneRadionice.length}</p>
    </div>
  );
}

export default Radionice;
