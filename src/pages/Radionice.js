import React, { useEffect, useState } from 'react';

function Radionice() {
  const [radionice, setRadionice] = useState([]);
  const [naziv, setNaziv] = useState('');

  useEffect(() => {
    fetch('/api/radionice')
      .then(res => res.json())
      .then(data => setRadionice(data));
  }, []);

  const handleAdd = () => {
    fetch('/api/radionice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ naziv })
    })
    .then(res => res.json())
    .then(newRadionica => setRadionice([...radionice, newRadionica]));
  };

  return (
    <div>
      <h2>Radionice</h2>
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
