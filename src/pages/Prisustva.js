import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';            // ← važan import (putanja jer je ovaj file u /pages)
import './App.css';

function Prisustva() {
  const [prisustva, setPrisustva] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [radionice, setRadionice] = useState([]);

  const [polaznikId, setPolaznikId] = useState('');
  const [radionicaId, setRadionicaId] = useState('');
  const [status, setStatus] = useState('PRISUTAN');
  const [editId, setEditId] = useState(null);

  const [filterRadionica, setFilterRadionica] = useState('');
  const [searchIme, setSearchIme] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [error, setError] = useState(null);

  const [selectedPolaznikId, setSelectedPolaznikId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [polazniciData, radioniceData, prisustvaData] = await Promise.all([
        api.get('/api/polaznici'),
        api.get('/api/radionice'),
        api.get('/api/prisustva/view'),
      ]);
      setPolaznici(Array.isArray(polazniciData) ? polazniciData : []);
      setRadionice(Array.isArray(radioniceData) ? radioniceData : []);
      setPrisustva(Array.isArray(prisustvaData) ? prisustvaData : []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Greška prilikom dohvaćanja podataka.');
    }
  }

  function handleAddOrUpdate() {
    if (!polaznikId || !radionicaId || !status) {
      setError('Molimo odaberite sve podatke.');
      return;
    }
    setError(null);

    const url = editId ? `/api/prisustva/${editId}` : `/api/prisustva`;
    const call = editId ? api.put : api.post;

    call(url, { polaznikId: Number(polaznikId), radionicaId: Number(radionicaId), status })
      .then(() => api.get('/api/prisustva/view').then(setPrisustva))
      .then(() => {
        setPolaznikId('');
        setRadionicaId('');
        setStatus('PRISUTAN');
        setEditId(null);
      })
      .catch(err => {
        console.error(err);
        setError('Greška kod spremanja prisustva.');
      });
  }

  function handleEdit(prisustvo) {
    const polaznik = polaznici.find(p => `${p.ime} ${p.prezime}` === prisustvo.polaznikImePrezime);
    const radionica = radionice.find(r => r.naziv === prisustvo.radionicaNaziv);
    if (!polaznik || !radionica) return;
    setPolaznikId(polaznik.id);
    setRadionicaId(radionica.id);
    setStatus(prisustvo.status);
    setEditId(prisustvo.id);
  }

  function handleDelete(id) {
    if (!window.confirm('Jeste li sigurni?')) return;
    api.del(`/api/prisustva/${id}`)
      .then(() => setPrisustva(prev => prev.filter(p => p.id !== id)))
      .catch(err => setError('Greška prilikom brisanja prisustva.'));
  }

  function prikaziStatus(val, spol) {
    const jeZensko = (spol || '').toLowerCase().startsWith('ž');
    if (val === 'PRISUTAN') return jeZensko ? 'Prisutna' : 'Prisutan';
    if (val === 'IZOSTAO') return jeZensko ? 'Izostala' : 'Izostao';
    if (val === 'ODUSTAO') return jeZensko ? 'Odustala' : 'Odustao';
    return 'Nepoznato';
  }

  function getColor(val) {
    switch (val) {
      case 'PRISUTAN': return '#c8facc';
      case 'IZOSTAO': return '#ffcaca';
      case 'ODUSTAO': return '#f9f3b6';
      default: return '#ffffff';
    }
  }

  const selectedPolaznik = useMemo(
    () => polaznici.find(p => p.id === selectedPolaznikId) || null,
    [polaznici, selectedPolaznikId]
  );

  const filtrirano = useMemo(() => {
    return prisustva.filter(p => {
      const matchesRadionica = !filterRadionica || p.radionicaNaziv === filterRadionica;
      const matchesSearch = !searchIme || p.polaznikImePrezime.toLowerCase().includes(searchIme.toLowerCase());
      const matchesSelected = !selectedPolaznikId || p.polaznikId === selectedPolaznikId;
      return matchesRadionica && matchesSearch && matchesSelected;
    });
  }, [prisustva, filterRadionica, searchIme, selectedPolaznikId]);

  const sortirano = useMemo(() => {
    if (!sortBy) return filtrirano;
    const safe = [...filtrirano];
    safe.sort((a, b) => {
      const va = a[sortBy] ?? '';
      const vb = b[sortBy] ?? '';
      return String(va).localeCompare(String(vb), 'hr');
    });
    return safe;
  }, [filtrirano, sortBy]);

  const countByStatus = (statusToCount) =>
    prisustva.filter(p => (!selectedPolaznikId || p.polaznikId === selectedPolaznikId) && p.status === statusToCount).length;

  return (
    <div className="container">
      <h2>Prisustva</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Forma za dodavanje/izmjenu */}
      <div className="flex-row">
        <select value={polaznikId} onChange={e => setPolaznikId(e.target.value)}>
          <option value="">Polaznik</option>
          {polaznici.map(p => (
            <option key={p.id} value={p.id}>{p.ime} {p.prezime}</option>
          ))}
        </select>

        <select value={radionicaId} onChange={e => setRadionicaId(e.target.value)}>
          <option value="">Radionica</option>
          {radionice.map(r => (
            <option key={r.id} value={r.id}>{r.naziv}</option>
          ))}
        </select>

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="PRISUTAN">Prisutan</option>
          <option value="IZOSTAO">Izostao</option>
          <option value="ODUSTAO">Odustao</option>
        </select>

        <button onClick={handleAddOrUpdate}>{editId ? 'Spremi' : 'Dodaj'}</button>
      </div>

      {/* Filteri / pretraga */}
      <div className="flex-row">
        <label>Filter:</label>
        <select value={filterRadionica} onChange={e => setFilterRadionica(e.target.value)}>
          <option value="">Sve</option>
          {radionice.map(r => (
            <option key={r.id} value={r.naziv}>{r.naziv}</option>
          ))}
        </select>

        <label>Sort:</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="">Bez</option>
          <option value="polaznikImePrezime">Polaznik</option>
          <option value="radionicaNaziv">Radionica</option>
          <option value="status">Status</option>
        </select>

        <label>Pretraži ime:</label>
        <input
          type="text"
          value={searchIme}
          onChange={e => setSearchIme(e.target.value)}
          placeholder="npr. Ana Horvat"
        />

        {selectedPolaznikId && (
          <button onClick={() => setSelectedPolaznikId(null)}>Prikaži sve</button>
        )}
      </div>

      {/* Statistika za selektiranog */}
      {selectedPolaznik && (
        <div className="stat-box" style={{ marginTop: '15px' }}>
          <h3>Statistika za: {selectedPolaznik.ime} {selectedPolaznik.prezime}</h3>
          <p>Ukupno: {prisustva.filter(p => p.polaznikId === selectedPolaznikId).length}</p>
          <p>Prisutan: {countByStatus('PRISUTAN')}</p>
          <p>Izostao: {countByStatus('IZOSTAO')}</p>
          <p>Odustao: {countByStatus('ODUSTAO')}</p>
        </div>
      )}

      {/* Lista (scrollable) */}
      <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '5px', marginTop: '10px' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sortirano.map((p, i) => {
            const polaznik = polaznici.find(x => `${x.ime} ${x.prezime}` === p.polaznikImePrezime);
            if (!polaznik) return null;
            const spol = polaznik.spol;
            const isSelected = polaznik.id === selectedPolaznikId;

            return (
              <li
                key={`${p.id}-${i}`}
                onClick={() => setSelectedPolaznikId(polaznik.id)}
                style={{
                  backgroundColor: getColor(p.status),
                  padding: '10px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: isSelected ? '2px solid #000' : '1px solid #ccc',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >
                <span>{p.polaznikImePrezime} – {p.radionicaNaziv} ({prikaziStatus(p.status, spol)})</span>
                <span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                  >
                    Uredi
                  </button>{' '}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                  >
                    Obriši
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Prisustva;
