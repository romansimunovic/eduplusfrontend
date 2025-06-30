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
  const [success, setSuccess] = useState(null);

  const fetchData = async () => {
    setError(null);
    try {
      const [pRes, rRes, prRes] = await Promise.all([
        fetch(`${baseUrl}/api/polaznici`),
        fetch(`${baseUrl}/api/radionice`),
        fetch(`${baseUrl}/api/prisustva/view`)
      ]);

      if (!pRes.ok || !rRes.ok || !prRes.ok) {
        throw new Error("Greška prilikom dohvaćanja podataka.");
      }

      const [polazniciData, radioniceData, prisustvaData] = await Promise.all([
        pRes.json(),
        rRes.json(),
        prRes.json()
      ]);

      setPolaznici(polazniciData);
      setRadionice(radioniceData);
      setPrisustva(prisustvaData);
    } catch (err) {
      setError("Došlo je do greške prilikom učitavanja podataka.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);

    if (!polaznikId || !radionicaId || !status) {
      setError("Sva polja su obavezna.");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/prisustva`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ polaznikId, radionicaId, status })
      });

      if (!res.ok) throw new Error("Greška kod dodavanja prisustva.");

      await fetchData();
      setPolaznikId('');
      setRadionicaId('');
      setStatus('PRISUTAN');
      setSuccess("Prisustvo uspješno dodano.");
    } catch (err) {
      setError("Neuspješno dodavanje prisustva.");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Prisustva</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

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
        {prisustva.map((p, index) => (
          <li key={index}>
            {p.polaznikImePrezime} – {p.radionicaNaziv} ({p.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Prisustva;
