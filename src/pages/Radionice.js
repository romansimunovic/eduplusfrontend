import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import { api } from '../api';

function Radionice() {
  const [radionice, setRadionice] = useState([]);
  const [naziv, setNaziv] = useState('');
  const [datum, setDatum] = useState('');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchRadionice();
  }, []);

  const fetchRadionice = async () => {
    try {
      const data = await api.get('/api/radionice');
      setRadionice(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      console.error(e);
      setError(`Neuspješno dohvaćanje radionica. ${e?.message || ''}`.trim());
    }
  };

  const handleAddOrUpdate = async () => {
    if (!naziv.trim() || !datum) {
      setError('Naziv i datum su obavezni.');
      return;
    }

    const path = editId ? `/api/radionice/${editId}` : '/api/radionice';
    const payload = { naziv: naziv.trim(), datum };

    try {
      if (editId) {
        await api.put(path, payload);
      } else {
        await api.post(path, payload);
      }
      await fetchRadionice();
      setNaziv('');
      setDatum('');
      setEditId(null);
      setError(null);
    } catch (e) {
      console.error(e);
      setError(`Neuspješno spremanje radionice. ${e?.message || ''}`.trim());
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Jeste li sigurni da želite obrisati ovu radionicu?')) return;

    try {
      await api.del(`/api/radionice/${id}`);
      await fetchRadionice();
    } catch (e) {
      console.error('Greška kod brisanja:', e);
      setError(`Neuspješno brisanje radionice. ${e?.message || ''}`.trim());
    }
  };

  const handleEdit = (radionica) => {
    setNaziv(radionica.naziv);
    setDatum(radionica.datum);
    setEditId(radionica.id);
  };

  const handleSort = (key) => {
    if (!key) return;

    const sorted = [...radionice];
    if (key === 'datum') {
      sorted.sort((a, b) =>
        sortOrder === 'asc'
          ? new Date(a.datum) - new Date(b.datum)
          : new Date(b.datum) - new Date(a.datum)
      );
    } else {
      sorted.sort((a, b) =>
        sortOrder === 'asc'
          ? String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'hr')
          : String(b[key] ?? '').localeCompare(String(a[key] ?? ''), 'hr')
      );
    }

    setRadionice(sorted);
    setSortKey(key);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filtriraneRadionice = radionice.filter(r =>
    (r.naziv || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatirajDatum = (isoDatum) => {
    if (!isoDatum || !isoDatum.includes('-')) return isoDatum || '';
    const [yyyy, mm, dd] = isoDatum.split('-');
    return `${dd}.${mm}.${yyyy}.`;
    // ako želiš lokalizirano: new Date(isoDatum).toLocaleDateString('hr-HR')
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
          {editId ? 'Spremi promjene' : 'Dodaj radionicu'}
        </button>
      </div>

      <div className="flex-row">
        <input
          type="text"
          placeholder="Pretraži radionice"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={sortKey} onChange={e => handleSort(e.target.value)}>
          <option value="">Sortiraj prema</option>
          <option value="naziv">Naziv</option>
          <option value="datum">Datum</option>
        </select>
        <button onClick={() => handleSort(sortKey)}>
          {sortOrder === 'asc' ? '⏶' : '⏷'}
        </button>
      </div>

      <ul>
        {filtriraneRadionice.map(r => (
          <li key={r.id}>
            <Link to={`/radionice/${r.id}`}>
              <strong>{r.naziv}</strong>
            </Link>
            <div>📅 {formatirajDatum(r.datum)}</div>
            <div>
              <button className="edit" onClick={() => handleEdit(r)}>Uredi</button>
              <button className="delete" onClick={() => handleDelete(r.id)}>Obriši</button>
            </div>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: '1rem' }}>Ukupno radionica: {filtriraneRadionice.length}</p>
    </div>
  );
}

export default Radionice;
