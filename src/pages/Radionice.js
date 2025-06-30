import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Radionice() {
  const [radionice, setRadionice] = useState([]);
  const [naziv, setNaziv] = useState('');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRadionice = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/radionice`);
      if (!res.ok) throw new Error("Greška kod dohvaćanja radionica");
      const data = await res.json();
      setRadionice(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Neuspješno dohvaćanje radionica.");
    }
  };

  useEffect(() => {
    fetchRadionice();
  }, []);

  const handleAdd = () => {
    if (!naziv.trim()) {
      setError("Naziv radionice ne smije biti prazan.");
      return;
    }

    fetch(`${baseUrl}/api/radionice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ naziv: naziv.trim() })
    })
      .then(res => {
        if (!res.ok) throw new Error("Greška kod dodavanja radionice");
        return res.json();
      })
      .then(newRadionica => {
        setRadionice([...radionice, newRadionica]);
        setNaziv('');
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError("Neuspješno dodavanje radionice.");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Jeste li sigurni da želite obrisati ovu radionicu?")) return;

    fetch(`${baseUrl}/api/radionice/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setRadionice(radionice.filter(r => r.id !== id));
      })
      .catch(err => {
        console.error(err);
        setError("Neuspješno brisanje radionice.");
      });
  };

  const filtriraneRadionice = radionice.filter(r =>
    r.naziv.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Radionice</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="text"
        placeholder="Naziv nove radionice"
        value={naziv}
        onChange={e => setNaziv(e.target.value)}
      />
      <button onClick={handleAdd}>Dodaj radionicu</button>

      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          placeholder="Pretraži radionice"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <ul>
        {filtriraneRadionice.map(r => (
          <li key={r.id}>
            {r.naziv}
            <button onClick={() => handleDelete(r.id)} style={{ marginLeft: "1rem" }}>Obriši</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Radionice;
