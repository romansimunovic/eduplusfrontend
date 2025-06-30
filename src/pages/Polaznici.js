import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPolaznici = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/polaznici`);
      if (!res.ok) throw new Error("Neuspješan fetch");

      const data = await res.json();
      setPolaznici(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Greška kod dohvata polaznika:", err);
      setError("Greška kod dohvata polaznika.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolaznici();
  }, []);

  const handleAdd = async () => {
    setError(null);

    if (!ime.trim() || !prezime.trim() || !email.trim()) {
      setError("Molimo unesite ime, prezime i email.");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/polaznici`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ime, prezime, email })
      });

      if (!res.ok) throw new Error("Greška kod dodavanja");

      const newPolaznik = await res.json();
      setPolaznici(prev => [...prev, newPolaznik]);
      setIme('');
      setPrezime('');
      setEmail('');
    } catch (err) {
      console.error("Greška kod dodavanja:", err);
      setError("Neuspješno dodavanje polaznika.");
    }
  };

  return (
    <div>
      <h2>Polaznici</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Učitavanje...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <input value={ime} onChange={e => setIme(e.target.value)} placeholder="Ime" />
            <input value={prezime} onChange={e => setPrezime(e.target.value)} placeholder="Prezime" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <button onClick={handleAdd}>Dodaj</button>
          </div>

          <ul>
            {polaznici.map(p => (
              <li key={p.id}>
                {p.ime} {p.prezime} ({p.email})
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Polaznici;
