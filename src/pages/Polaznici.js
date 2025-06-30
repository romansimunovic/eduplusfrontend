import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [godinaRođenja, setGodinaRođenja] = useState("");
  const [error, setError] = useState(null);

  const fetchPolaznici = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/polaznici`);
      if (!res.ok) throw new Error("Neuspješno dohvaćanje polaznika");
      const data = await res.json();
      setPolaznici(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Greška kod dohvata polaznika:", err);
      setError("Neuspješno dohvaćanje podataka o polaznicima.");
    }
  };

  useEffect(() => {
    fetchPolaznici();
  }, []);

  const handleAdd = () => {
    if (!ime || !prezime || !email || !godinaRođenja) {
      setError("Sva polja su obavezna.");
      return;
    }

    fetch(`${baseUrl}/api/polaznici`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ime, prezime, email, godinaRođenja: parseInt(godinaRođenja) })
    })
      .then(res => {
        if (!res.ok) throw new Error("Greška kod dodavanja polaznika");
        return res.json();
      })
      .then(newPolaznik => {
        setPolaznici([...polaznici, newPolaznik]);
        setIme("");
        setPrezime("");
        setEmail("");
        setGodinaRođenja("");
        setError(null);
      })
      .catch(err => {
        console.error("Greška kod dodavanja:", err);
        setError("Neuspješno dodavanje polaznika.");
      });
  };

  return (
    <div>
      <h2>Polaznici</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input value={ime} onChange={e => setIme(e.target.value)} placeholder="Ime" />
      <input value={prezime} onChange={e => setPrezime(e.target.value)} placeholder="Prezime" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={godinaRođenja} onChange={e => setGodinaRođenja(e.target.value)} placeholder="Godina rođenja" type="number" />
      <button onClick={handleAdd}>Dodaj</button>

      <ul>
        {polaznici.map(p => (
          <li key={p.id}>{p.ime} {p.prezime} ({p.email}, {p.godinaRođenja})</li>
        ))}
      </ul>
    </div>
  );
}

export default Polaznici;
