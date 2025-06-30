import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch(`${baseUrl}/api/polaznici`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setPolaznici(data) : setPolaznici([]))
      .catch(err => console.error("Greška kod dohvata polaznika:", err));
  }, []);

  const handleAdd = () => {
    fetch(`${baseUrl}/api/polaznici`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ime, prezime, email })
    })
      .then(res => res.json())
      .then(newPolaznik => setPolaznici([...polaznici, newPolaznik]))
      .catch(err => console.error("Greška kod dodavanja:", err));
  };

  return (
    <div>
      <h2>Polaznici</h2>
      <input value={ime} onChange={e => setIme(e.target.value)} placeholder="Ime" />
      <input value={prezime} onChange={e => setPrezime(e.target.value)} placeholder="Prezime" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <button onClick={handleAdd}>Dodaj</button>
      <ul>
        {polaznici.map(p => (
          <li key={p.id}>{p.ime} {p.prezime} ({p.email})</li>
        ))}
      </ul>
    </div>
  );
}

export default Polaznici;
