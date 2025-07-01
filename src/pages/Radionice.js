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

  const handleAddOrUpdate = () => {
    if (!naziv.trim() || !datum) {
      setError("Naziv i datum su obavezni.");
      return;
    }

    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `${baseUrl}/api/radionice/${editId}`
      : `${baseUrl}/api/radionice`;

    const formattedDate = new Date(datum).toISOString().split('T')[0];

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ naziv: naziv.trim(), datum })
    })
      .then(res => {
        if (!res.ok) throw new Error("Greška kod spremanja radionice");
        return res.json();
      })
      .then(() => {
        fetchRadionice();
        setNaziv('');
        setDatum('');
        setEditId(null);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError("Neuspješno spremanje radionice.");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Jeste li sigurni da želite obrisati ovu radionicu?")) return;

    fetch(`${baseUrl}/api/radionice/${id}`, { method: 'DELETE' })
      .then(() => {
        setRadionice(radionice.filter(r => r.id !== id));
      })
      .catch(err => {
        console.error(err);
        setError("Neuspješno brisanje radionice.");
      });
  };

  const handleEdit = (radionica) => {
    setNaziv(radionica.naziv);
    setDatum(radionica.datum);
    setEditId(radionica.id);
  };

  const handleSort = () => {
    const sorted = [...radionice].sort((a, b) => {
      return sortOrder === 'asc'
        ? a.naziv.localeCompare(b.naziv)
        : b.naziv.localeCompare(a.naziv);
    });
    setRadionice(sorted);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filtriraneRadionice = radionice.filter(r =>
    r.naziv.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Link to={`/radionica/${r.id}`}><strong>{r.naziv}</strong></Link> – {r.datum}
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
