import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Prisustva() {
  const [prisustva, setPrisustva] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [radionice, setRadionice] = useState([]);
  const [polaznikId, setPolaznikId] = useState('');
  const [radionicaId, setRadionicaId] = useState('');
  const [status, setStatus] = useState('PRISUTAN');

  useEffect(() => {
    fetch(`${baseUrl}/api/prisustva`).then(res => res.json()).then(setPrisustva);
    fetch(`${baseUrl}/api/polaznici`).then(res => res.json()).then(setPolaznici);
    fetch(`${baseUrl}/api/radionice`).then(res => res.json()).then(setRadionice);
  }, []);

  const handleAdd = () => {
    fetch(`${baseUrl}/api/prisustva`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polaznikId, radionicaId, status })
    })
    .then(res => res.json())
    .then(newPrisustvo => setPrisustva([...prisustva, newPrisustvo]));
  };

  return (
    <div>
      <h2>Prisustva</h2>
      <select value={polaznikId} onChange={e => setPolaznikId(e.target.value)}>
        <option value="">Odaberi polaznika</option>
        {polaznici.map(p => (
          <option key={p.id} value={p.id}>{p.ime} {p.prezime}</option>
        ))}
      </select>
      <select value={radionicaId} onChange={e => setRadionicaId(e.target.value)}>
        <option value="">Odaberi radionicu</option>
        {radionice.map(r => (
          <option key={r.id} value={r.id}>{r.naziv}</option>
        ))}
      </select>
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="PRISUTAN">Prisutno</option>
        <option value="ODUSTAO">Odustao</option>
        <option value="IZOSTAO">Izostao</option>
      </select>
      <button onClick={handleAdd}>Dodaj prisustvo</button>
      <ul>
        {prisustva.map(p => (
          <li key={p.id}>{p.polaznikImePrezime} - {p.radionicaNaziv} ({p.status})</li>
        ))}
      </ul>
    </div>
  );
}

export default Prisustva;
