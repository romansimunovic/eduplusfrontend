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
    fetch(`${baseUrl}/api/prisustva/view`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPrisustva(data);
        else setPrisustva([]);
      });

    fetch(`${baseUrl}/api/polaznici`)
      .then(res => res.json())
      .then(setPolaznici);

    fetch(`${baseUrl}/api/radionice`)
      .then(res => res.json())
      .then(setRadionice);
  }, []);

  const handleAdd = () => {
    fetch(`${baseUrl}/api/prisustva`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        polaznikId: parseInt(polaznikId),
        radionicaId: parseInt(radionicaId),
        status: status
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Greška prilikom dodavanja prisustva.");
        }
        return res.json();
      })
      .then(() => {
        // Osvježi prikaz nakon dodavanja
        return fetch(`${baseUrl}/api/prisustva/view`);
      })
      .then(res => res.json())
      .then(setPrisustva)
      .catch(err => alert(err.message));
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

      {prisustva.length > 0 ? (
        <ul>
          {prisustva.map(p => (
            <li key={p.id}>
              {p.imePrezime} – {p.nazivRadionice} ({p.status})
            </li>
          ))}
        </ul>
      ) : (
        <p>Nema prisustava za prikaz.</p>
      )}
    </div>
  );
}

export default Prisustva;
