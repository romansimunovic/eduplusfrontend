import React, { useEffect, useState } from 'react';
import { api } from '../api';

function Prisustva() {
  const [prisustva, setPrisustva] = useState([]);
  const [polaznikId, setPolaznikId] = useState("");
  const [radionicaId, setRadionicaId] = useState("");
  const [status, setStatus] = useState("PRISUTAN");
  const [error, setError] = useState('');
  const [polaznici, setPolaznici] = useState([]);
  const [radionice, setRadionice] = useState([]);

  useEffect(() => {
    api.get('/prisustva').then(res => setPrisustva(Array.isArray(res.data) ? res.data : []));
    api.get('/polaznici').then(res => setPolaznici(Array.isArray(res.data) ? res.data : []));
    api.get('/radionice').then(res => setRadionice(Array.isArray(res.data) ? res.data : []));
  }, []);

  const handleAddPrisustvo = async () => {
    if (!polaznikId || !radionicaId || !status) { setError('Odaberi sve podatke.'); return; }
    try {
      await api.post('/prisustva', { polaznikId: Number(polaznikId), radionicaId: Number(radionicaId), status });
      const resp = await api.get('/prisustva');
      setPrisustva(Array.isArray(resp.data) ? resp.data : []);
      setPolaznikId(""); setRadionicaId(""); setStatus("PRISUTAN"); setError('');
    } catch (e) { setError('Greška kod spremanja.'); }
  };

  return (
    <div className="container">
      <h2>Prisustva</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <select value={polaznikId} onChange={e => setPolaznikId(e.target.value)}>
        <option value="">Polaznik</option>
        {polaznici.map(p => <option key={p.id} value={p.id}>{p.ime} {p.prezime}</option>)}
      </select>
      <select value={radionicaId} onChange={e => setRadionicaId(e.target.value)}>
        <option value="">Radionica</option>
        {radionice.map(r => <option key={r.id} value={r.id}>{r.naziv}</option>)}
      </select>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="PRISUTAN">Prisutan</option>
        <option value="IZOSTAO">Izostao</option>
        <option value="ODUSTAO">Odustao</option>
      </select>
      <button onClick={handleAddPrisustvo}>Dodaj prisustvo</button>
      <ul>
        {prisustva.map(p =>
          <li key={p.id}>{`PolaznikID: ${p.polaznikId}, RadionicaID: ${p.radionicaId}, Status: ${p.status}`}</li>
        )}
      </ul>
    </div>
  );
}
export default Prisustva;
