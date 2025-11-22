import React, { useState, useEffect, useMemo, useContext } from 'react';
import { api } from '../api';
import { AuthContext } from '../AuthContext';

function Prisustva() {
  const [prisustva, setPrisustva] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [radionice, setRadionice] = useState([]);
  const [polaznikId, setPolaznikId] = useState('');
  const [radionicaId, setRadionicaId] = useState('');
  const [status, setStatus] = useState('PRISUTAN');
  const [editId, setEditId] = useState(null);
  const [searchIme, setSearchIme] = useState('');
  const [error, setError] = useState('');


  useEffect(() => { fetchData(); }, []);
  async function fetchData() {
    try {
      const [polazniciData, radioniceData, prisustvaData] = await Promise.all([
        api.get('/polaznici'), api.get('/radionice'), api.get('/prisustva/view'),
      ]);
      setPolaznici(Array.isArray(polazniciData) ? polazniciData : []);
      setRadionice(Array.isArray(radioniceData) ? radioniceData : []);
      setPrisustva(Array.isArray(prisustvaData) ? prisustvaData : []);
    } catch (e) { setError('Greška kod dohvata.'); }
  }

  function handleAddOrUpdate() {
    if (!polaznikId || !radionicaId || !status) { setError('Odaberi sve podatke.'); return; }
    setError('');
    const url = editId ? `/prisustva/${editId}` : `/prisustva`;
    const call = editId ? api.put : api.post;
    call(url, { polaznikId: Number(polaznikId), radionicaId: Number(radionicaId), status })
      .then(() => api.get('/prisustva/view').then(setPrisustva))
      .then(() => { setPolaznikId(''); setRadionicaId(''); setStatus('PRISUTAN'); setEditId(null); })
      .catch(() => setError('Greška kod spremanja.'));
  }

  function handleEdit(prisustvo) {
    const polaznik = polaznici.find(p => `${p.ime} ${p.prezime}` === prisustvo.polaznikImePrezime);
    const radionica = radionice.find(r => r.naziv === prisustvo.radionicaNaziv);
    if (!polaznik || !radionica) return;
    setPolaznikId(polaznik.id); setRadionicaId(radionica.id); setStatus(prisustvo.status); setEditId(prisustvo.id);
  }

  function handleDelete(id) {
    if (!window.confirm('Jeste li sigurni?')) return;
    api.del(`prisustva/${id}`).then(() => setPrisustva(prev => prev.filter(p => p.id !== id))).catch(() => setError('Greška kod brisanja.'));
  }

  function prikaziStatus(val, spol) {
    const jeZensko = (spol || '').toLowerCase().startsWith('ž');
    if (val === 'PRISUTAN') return jeZensko ? 'Prisutna' : 'Prisutan';
    if (val === 'IZOSTAO') return jeZensko ? 'Izostala' : 'Izostao';
    if (val === 'ODUSTAO') return jeZensko ? 'Odustala' : 'Odustao';
    return 'Nepoznato';
  }

  const sortirano = useMemo(() =>
    prisustva.filter(
      p => (!searchIme || p.polaznikImePrezime.toLowerCase().includes(searchIme.toLowerCase()))
    ),
    [prisustva, searchIme]
  );

  // Export CSV
  const handleExportCSV = () => {
    const csvRows = [
      "Polaznik,Radionica,Status",
      ...sortirano.map(p => `${p.polaznikImePrezime},${p.radionicaNaziv},${p.status}`)
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prisustva.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <h2>Prisustva</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
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
      <input
        type="text"
        value={searchIme}
        onChange={e => setSearchIme(e.target.value)}
        placeholder="Pretraži ime polaznika"
      />
      <button onClick={handleExportCSV}>Export CSV</button>
      <ul style={{ maxHeight: 400, overflowY: "auto", padding: 0 }}>
        {sortirano.map((p, i) => {
          const polaznik = polaznici.find(x => `${x.ime} ${x.prezime}` === p.polaznikImePrezime);
          if (!polaznik) return null;
          const spol = polaznik.spol;
          return (
            <li key={`${p.id}-${i}`} style={{
              backgroundColor: p.status === 'PRISUTAN' ? '#c8facc' :
                p.status === 'IZOSTAO' ? '#ffcaca' :
                  p.status === 'ODUSTAO' ? '#f9f3b6' : '#fff',
              padding: '10px', borderRadius: 6, marginBottom: 8, display: "flex", justifyContent: "space-between"
            }}>
              <span>{p.polaznikImePrezime} – {p.radionicaNaziv} ({prikaziStatus(p.status, spol)})</span>
              <span>
                <button onClick={() => handleEdit(p)}>Uredi</button>
                <button onClick={() => handleDelete(p.id)}>Obriši</button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default Prisustva;
