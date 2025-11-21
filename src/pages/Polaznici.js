import React, { useState, useEffect, useMemo, useContext } from 'react';
import { api } from '../api';
import { ThemeContext } from './App';

function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const { largeFont } = useContext(ThemeContext);

  useEffect(() => {
    api.get('/api/polaznici')
      .then(data => {
        const sorted = [...(Array.isArray(data) ? data : [])]
          .sort((a, b) => {
            const p1 = String(a.prezime || '').localeCompare(String(b.prezime || ''));
            if (p1 !== 0) return p1;
            return String(a.ime || '').localeCompare(String(b.ime || ''));
          });
        setPolaznici(sorted);
        if (!selectedId && sorted.length) setSelectedId(sorted[0].id);
      })
      .catch(e => setError('Greška kod dohvata polaznika'));
  }, []);

  const list = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (term
      ? polaznici.filter(p => (`${p.ime} ${p.prezime}`).toLowerCase().includes(term))
      : polaznici
    ).sort((a, b) => String(a.prezime).localeCompare(String(b.prezime)));
  }, [polaznici, search]);

  const selected = useMemo(
    () => list.find(p => p.id === selectedId) || null,
    [list, selectedId]
  );

  return (
    <div className="container">
      <h2>Polaznici</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        aria-label="Traži polaznika"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Pretraži ime ili prezime"
        style={{ width: '100%', marginBottom: 8 }}
      />
      <ul>
        {list.map(p => (
          <li
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            style={{
              padding: '10px 16px', cursor: 'pointer',
              background: p.id === selectedId ? '#eaf4ff' : 'white', fontWeight: p.id === selectedId ? 600 : 400
            }}
          >
            <span>{p.prezime} {p.ime}</span>
            <span style={{ color: '#666', fontSize: '0.96em', marginLeft: 8 }}>{p.email}</span>
          </li>
        ))}
        {list.length === 0 && <li>Nema rezultata.</li>}
      </ul>
      <div>
        <h3>Detalji</h3>
        {!selected ? (
          <p>Odaberite polaznika s lijeve strane.</p>
        ) : (
          <div style={{
            border: '1px solid #e3e3e3', borderRadius: 12,
            padding: 16, background: 'white', marginTop: 12,
            fontSize: largeFont ? '1.2em' : '1em'
          }}>
            <div><strong>Ime i prezime:</strong> {selected.ime} {selected.prezime}</div>
            <div><strong>Email:</strong> {selected.email ?? '—'}</div>
            <div><strong>Telefon:</strong> {selected.telefon ?? '—'}</div>
            <div><strong>Grad:</strong> {selected.grad ?? '—'}</div>
            <div><strong>Godina rođenja:</strong> {selected.godinaRodenja ?? '—'}</div>
            <div><strong>Spol:</strong> {selected.spol ?? '—'}</div>
            <div><strong>Status:</strong> {selected.status ?? '—'}</div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Polaznici;
