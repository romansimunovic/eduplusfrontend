import React, { useEffect, useState } from "react";

function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("https://eduplusbackend.onrender.com/api/polaznici")
      .then(res => res.json())
      .then(setPolaznici);
  }, []);

  const handleDodaj = () => {
    const novi = { ime, prezime, email };
    fetch("https://eduplusbackend.onrender.com/api/polaznici", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novi),
    })
      .then(res => res.json())
      .then(noviPolaznik => {
        setPolaznici(prev => [...prev, noviPolaznik]);
        setIme("");
        setPrezime("");
        setEmail("");
      });
  };

  return (
    <div className="p-4">
      <h2>Polaznici</h2>
      <ul>
        {polaznici.map(p => (
          <li key={p.id}>{p.ime} {p.prezime} - {p.email}</li>
        ))}
      </ul>
      <div className="mt-4">
        <input
          placeholder="Ime"
          value={ime}
          onChange={(e) => setIme(e.target.value)}
        />
        <input
          placeholder="Prezime"
          value={prezime}
          onChange={(e) => setPrezime(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleDodaj}>Dodaj polaznika</button>
      </div>
    </div>
  );
}

export default Polaznici;
