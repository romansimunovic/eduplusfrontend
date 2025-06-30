import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Radionice() {
  const [radionice, setRadionice] = useState([]);
  const [naziv, setNaziv] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchRadionice = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/radionice`);
      if (!res.ok) throw new Error("Greška kod dohvaćanja radionica.");
      const data = await res.json();
      setRadionice(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Ne mogu dohvatiti radionice.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRadionice();
  }, []);

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);

    if (!naziv.trim()) {
      setError("Unesi naziv radionice.");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/radionice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naziv })
      });

      if (!res.ok) throw new Error("Greška kod dodavanja radionice.");

      await fetchRadionice();
      setNaziv('');
      setSuccess("Radionica uspješno dodana!");
    } catch (err) {
      setError("Neuspješno dodavanje radionice.");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Radionice</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <input
        type="text"
        placeholder="Naziv radionice"
        value={naziv}
        onChange={e => setNaziv(e.target.value)}
      />
      <button onClick={handleAdd}>Dodaj radionicu</button>

      <ul>
        {radionice.map(r => (
          <li key={r.id}>{r.naziv}</li>
        ))}
      </ul>
    </div>
  );
}

export default Radionice;
