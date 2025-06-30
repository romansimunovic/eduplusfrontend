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
      if (!res.ok) throw new Error("Neuspješan dohvat radionica.");
      const data = await res.json();
      setRadionice(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Greška prilikom dohvaćanja radionica.");
    }
  };

  useEffect(() => {
    fetchRadionice();
  }, []);

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);

    if (!naziv.trim()) {
      setError("Naziv ne smije biti prazan.");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/radionice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naziv })
      });

      if (!res.ok) throw new Error("Greška prilikom dodavanja radionice.");
      await fetchRadionice();
      setNaziv('');
      setSuccess("Radionica dodana uspješno.");
    } catch (err) {
      console.error(err);
      setError("Dodavanje radionice nije uspjelo.");
    }
  };

  return (
    <div>
      <h2>Radionice</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

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
