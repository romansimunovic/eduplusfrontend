import React, { useEffect, useState } from "react";

function Radionice() {
  const [radionice, setRadionice] = useState([]);
  const [naziv, setNaziv] = useState("");
  const [opis, setOpis] = useState("");

  useEffect(() => {
    fetch("https://eduplusbackend.onrender.com/api/radionice")
      .then(res => res.json())
      .then(setRadionice);
  }, []);

  const handleDodaj = () => {
    const nova = { naziv, opis };
    fetch("https://eduplusbackend.onrender.com/api/radionice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nova),
    })
      .then(res => res.json())
      .then(novaRadionica => {
        setRadionice(prev => [...prev, novaRadionica]);
        setNaziv("");
        setOpis("");
      });
  };

  return (
    <div className="p-4">
      <h2>Radionice</h2>
      <ul>
        {radionice.map(r => (
          <li key={r.id}>{r.naziv} - {r.opis}</li>
        ))}
      </ul>
      <div className="mt-4">
        <input
          placeholder="Naziv"
          value={naziv}
          onChange={(e) => setNaziv(e.target.value)}
        />
        <input
          placeholder="Opis"
          value={opis}
          onChange={(e) => setOpis(e.target.value)}
        />
        <button onClick={handleDodaj}>Dodaj radionicu</button>
      </div>
    </div>
  );
}

export default Radionice;
