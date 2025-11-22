import React, { useEffect, useState } from 'react';
import { api } from '../api';

function Radionice() {
  const [radionice, setRadionice] = useState([]);
  const [naziv, setNaziv] = useState('');
  const [datum, setDatum] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchRadionice(); }, []);

  const fetchRadionice = async () => {
    try {
      const data = await api.get('/radionice');
      setRadionice(Array.isArray(data.data) ? data.data : []);
      setError("");
    } catch (e) { setError("Greška - backend API nije dostupan."); }
  };

  const handleAdd = async () => {
    if (!naziv.trim() || !datum) { setError('Naziv i datum su obavezni!'); return; }
    try {
      await api.post('/radionice', { naziv: naziv.trim(), datum });
      await fetchRadionice();
      setNaziv(''); setDatum('');
      setError('');
    } catch (e) { setError('Greška kod spremanja radionice.'); }
  };

  return (
    <div className="container">
      <h2>Radionice</h2>
      {error && <p className="error">{error}</p>}
      <input type="text" placeholder="Naziv radionice" value={naziv} onChange={e => setNaziv(e.target.value)} />
      <input type="date" value={datum} onChange={e => setDatum(e.target.value)} />
      <button onClick={handleAdd}>Dodaj radionicu</button>
      <ul>
        {radionice.map(r => (
          <li key={r.id}><strong>{r.naziv}</strong> ({r.datum})</li>
        ))}
      </ul>
      <p>Ukupno: {radionice.length}</p>
    </div>
  );
}
export default Radionice;
