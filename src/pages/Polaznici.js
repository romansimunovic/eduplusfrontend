import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import './App.css';

function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/api/polaznici');
        // uvijek sortiraj abecedno po prezimenu, pa po imenu
        const sorted = [...(Array.isArray(data) ? data : [])].sort((a, b) => {
          const prezCmp = String(a.prezime || '').localeCompare(String(b.prezime || ''), 'hr', { sensitivity: 'base' });
          if (prezCmp !== 0) return prezCmp;
          return String(a.ime || '').localeCompare(String(b.ime || ''), 'hr', { sensitivity: 'base' });
        });
        setPolaznici(sorted);
        setError(null);
        // automatski odaberi prvog pri prvom učitavanju
        if (sorted.length && !selectedId) setSelectedId(sorted[0].id);
      } catch (e) {
        console.error(e);
        setError('Greška prilikom dohvaćanja podataka.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? polaznici.filter(p => (`${p.ime} ${p.prezime}`).toLowerCase().includes(term))
      : polaznici;
    // osiguraj sort i nakon filtera
    return [...filtered].sort((a, b) => {
      const prezCmp = String(a.prezime || '').localeCompare(String(b.prezime || ''), 'hr', { sensitivity: 'base' });
      if (prezCmp !== 0) return prezCmp;
      return String(a.ime || '').localeCompare(String(b.ime || ''), 'hr', { sensitivity: 'base' });
    });
  }, [polaznici, search]);

  const selected = useMemo(
    () => list.find(p => p.id === selectedId) || polaznici.find(p => p.id === selectedId) || null,
    [list, polaznici, selectedId]
  );

  return (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px' }}>
      <div style={{ gridColumn: '1 / 2' }}>
        <h2>Polaznici</h2>
        {error && <p className="error">{error}</p>}

        <input
          className="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pretraži po imenu ili prezimenu"
          style={{ width: '100%', marginBottom: 8 }}
        />

        <div style={{ maxHeight: 540, overflowY: 'auto', border: '1px solid #e3e3e3', borderRadius: 8 }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {list.map(p => {
              const isActive = p.id === selectedId;
              return (
                <li
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #eee',
                    background: isActive ? '#eaf4ff' : 'white',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <div>{p.prezime} {p.ime}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{p.email}</div>
                </li>
              );
            })}
            {!list.length && (
              <li style={{ padding: 12, color: '#666' }}>Nema rezultata.</li>
            )}
          </ul>
        </div>
      </div>

      <div style={{ gridColumn: '2 / 3' }}>
        <h2>Detalji</h2>
        {!selected ? (
          <p style={{ color: '#666' }}>Odaberite polaznika s lijeve strane.</p>
        ) : (
          <div
            style={{
              border: '1px solid #e3e3e3',
              borderRadius: 12,
              padding: 16,
              background: 'white',
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              rowGap: 10,
              columnGap: 12
            }}
          >
            <div style={{ color: '#666' }}>Ime i prezime</div>
            <div><strong>{selected.ime} {selected.prezime}</strong></div>

            <div style={{ color: '#666' }}>Email</div>
            <div>{selected.email || '—'}</div>

            <div style={{ color: '#666' }}>Telefon</div>
            <div>{selected.telefon || '—'}</div>

            <div style={{ color: '#666' }}>Grad</div>
            <div>{selected.grad || '—'}</div>

            <div style={{ color: '#666' }}>Godina rođenja</div>
            <div>{selected.godinaRodenja ?? '—'}</div>

            <div style={{ color: '#666' }}>Spol</div>
            <div>{selected.spol || '—'}</div>

            <div style={{ color: '#666' }}>Status</div>
            <div>{selected.status || '—'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Polaznici;
