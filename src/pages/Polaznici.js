import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [ime, setIme] = useState('');
  const [prezime, setPrezime] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch(`${baseUrl}/api/polaznici`)
      .then(res => res.json())
      .then(data => setPolaznici(data));
  }, []);

  const handleAdd = () => {
    fetch(`${baseUrl}/api/polaznici`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ime, prezime, email })
    })
    .then(res => res.json())
    .then(newPolaznik => setPolaznici([...polaznici, newPolaznik]));
  };

  return (
    <div>
      <h2>Polaznici</h2>
      <input type="text" placeholder="Ime" value={ime} onChange={e => setIme(e.target.value)} />
      <input type="text" placeholder="Prezime" value={prezime} onChange={e => setPrezime(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <button onClick={handleAdd}>Dodaj polaznika</button>
      <ul>
        {polaznici.map(p => (
          <li key={p.id}>{p.ime} {p.prezime} - {p.email}</li>
        ))}
      </ul>
    </div>
  );
}

export default Polaznici;
