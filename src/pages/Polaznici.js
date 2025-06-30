import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [godinaRodjenja, setGodinaRodjenja] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchPolaznici = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/polaznici`);
      const data = await res.json();
      setPolaznici(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Greška kod dohvaćanja polaznika.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPolaznici();
  }, []);

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);

    if (!ime || !prezime || !email || !godinaRodjenja) {
      setError("Sva polja su obavezna.");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/polaznici`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ime,
          prezime,
          email,
          godinaRođenja: parseInt(godinaRodjenja)
        })
      });

      if (!res.ok) throw new Error("Dodavanje nije uspjelo.");
      setIme("");
      setPrezime("");
      setEmail("");
      setGodinaRodjenja("");
      setSuccess("Polaznik uspješno dodan.");
      fetchPolaznici();
    } catch (err) {
      setError("Neuspješno dodavanje polaznika.");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Polaznici</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <input value={ime} onChange={e => setIme(e.target.value)} placeholder="Ime" />
      <input value={prezime} onChange={e => setPrezime(e.target.value)} placeholder="Prezime" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={godinaRodjenja} onChange={e => setGodinaRodjenja(e.target.value)} placeholder="Godina rođenja" type="number" />

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
