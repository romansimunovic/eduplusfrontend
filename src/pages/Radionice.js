import React, { useState, useEffect, useContext } from 'react';
import { Link } from "react-router-dom";
import { api } from '../api';
import { AuthContext } from '../AuthContext';

function Radionice() {
  const [radionice, setRadionice] = useState([]);
  const [naziv, setNaziv] = useState('');
  const [datum, setDatum] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { fetchRadionice(); }, []);

  const fetchRadionice = async () => {
    try {
      const data = await api.get('/api/radionice');
      setRadionice(Array.isArray(data) ? data : []);
    } catch (e) { setError("Neuspješno dohvaćanje."); }
  };

  const handleAddOrUpdate = async () => {
    if (!naziv.trim() || !datum) {
      setError('Naziv i datum su obavezni!');
      return;
    }
    const path = editId ? `/api/radionice/${editId}` : '/api/radionice';
    try {
      if (editId) await api.put(path, { naziv: naziv.trim(), datum });
      else await api.post(path, { naziv: naziv.trim(), datum });
      await fetchRadionice();
      setNaziv(''); setDatum(''); setEditId(null); setError('');
    } catch (e) { setError('Greška!'); }
  };

  const handleEdit = (r) => { setNaziv(r.naziv); setDatum(r.datum); setEditId(r.id); };
  const handleDelete = async (id) => {
    if (!window.confirm('Obrisati radionicu?')) return;
    try { await api.del(`/api/radionice/${id}`); await fetchRadionice(); }
    catch { setError('Greška kod brisanja.'); }
  };

  const filtriraneRadionice = radionice.filter(r =>
    (r.naziv || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h2>Radionice</h2>
      {error && <p className="error">{error}</p>}
      <div>
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
      <div>
        <input
          type="text"
          placeholder="Pretraži radionice"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <ul>
        {filtriraneRadionice.map(r => (
          <li key={r.id}>
            <Link to={`/radionice/${r.id}`}><strong>{r.naziv}</strong></Link> <span>{r.datum}</span>
            <button onClick={() => handleEdit(r)}>Uredi</button>
            <button onClick={() => handleDelete(r.id)}>Obriši</button>
          </li>
        ))}
      </ul>
      <p>Ukupno: {filtriraneRadionice.length}</p>
    </div>
  );
}
export default Radionice;
