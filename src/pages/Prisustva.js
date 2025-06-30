import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Prisustva() {
  const [prisustva, setPrisustva] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [radionice, setRadionice] = useState([]);
  const [polaznikId, setPolaznikId] = useState('');
  const [radionicaId, setRadionicaId] = useState('');
  const [status, setStatus] = useState('PRISUTAN');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes, prRes] = await Promise.all([
          fetch(`${baseUrl}/api/polaznici`),
          fetch(`${baseUrl}/api/radionice`),
          fetch(`${baseUrl}/api/prisustva/view`)
        ]);

        const [polazniciData, radioniceData, prisustvaData] = await Promise.all([
          pRes.ok ? pRes.json() : [],
          rRes.ok ? rRes.json() : [],
          prRes.ok ? prRes.json() : []
        ]);

        setPolaznici(polazniciData);
        setRadionice(radioniceData);
        setPrisustva(prisustvaData);
      } catch (err) {
        setError("Došlo je do greške prilikom dohvaćanja podataka.");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    if (!polaznikId || !radionicaId) {
      setError("Molimo odaberite polaznika i radionicu.");
      return;
    }

    fetch(`${baseUrl}/api/prisustva`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polaznikId, radionicaId, status })
    })
      .then(res => {
        if (!res.ok) throw new Error("Greška kod slanja podataka");
        return res.json();
      })
      .then(() => {
        // Refreshamo prikaz
        return fetch(`${baseUrl}/api/prisustva/view`)
          .then(res => res.json())
          .then(setPrisustva);
      })
      .catch(err => {
        console.error(err);
        setError("Neuspješno dodavanje prisustva.");
      });
  };

  return (
    <div>
      <h2>Prisustva</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <select value={polaznikId} onChange={e => setPolaznikId(e.target.value)}>
          <option value="">Odaberi polaznika</option>
          {polaznici.map(p => (
            <option key={p.id} value={p.id}>{p.ime} {p.prezime}</option>
          ))}
        </select>

        <select value={radionicaId} onChange={e => setRadionicaId(e.target.value)}>
          <option value="">Odaberi radionicu</option>
          {radionice.map(r => (
            <option key={r.id} value={r.id}>{r.naziv}</option>
          ))}
        </select>

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="PRISUTAN">Prisutno</option>
          <option value="ODUSTAO">Odustao</option>
          <option value="IZOSTAO">Izostao</option>
        </select>

        <button onClick={handleAdd}>Dodaj prisustvo</button>
      </div>

      <ul>
        {Array.isArray(prisustva) && prisustva.map((p, index) => (
          <li key={index}>
            {p.polaznikImePrezime} – {p.radionicaNaziv} ({p.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Prisustva;
