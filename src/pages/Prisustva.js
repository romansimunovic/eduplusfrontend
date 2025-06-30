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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, rRes, prRes] = await Promise.all([
          fetch(`${baseUrl}/api/polaznici`),
          fetch(`${baseUrl}/api/radionice`),
          fetch(`${baseUrl}/api/prisustva/view`)
        ]);

        if (!pRes.ok || !rRes.ok || !prRes.ok) {
          throw new Error("Greška kod dohvaćanja podataka.");
        }

        const [polazniciData, radioniceData, prisustvaData] = await Promise.all([
          pRes.json(),
          rRes.json(),
          prRes.json()
        ]);

        setPolaznici(Array.isArray(polazniciData) ? polazniciData : []);
        setRadionice(Array.isArray(radioniceData) ? radioniceData : []);
        setPrisustva(Array.isArray(prisustvaData) ? prisustvaData : []);
      } catch (err) {
        setError("Ne mogu dohvatiti podatke. Provjeri backend.");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);

    if (!polaznikId || !radionicaId || !status) {
      setError("Molimo popunite sva polja.");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/prisustva`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ polaznikId, radionicaId, status })
      });

      if (!res.ok) throw new Error("Greška kod slanja.");

      // osvježavanje liste prisustva
      const refresh = await fetch(`${baseUrl}/api/prisustva/view`);
      if (!refresh.ok) throw new Error("Ne mogu osvježiti prikaz.");
      const data = await refresh.json();
      setPrisustva(Array.isArray(data) ? data : []);

      setPolaznikId('');
      setRadionicaId('');
      setStatus('PRISUTAN');
      setSuccess("Prisustvo uspješno dodano!");
    } catch (err) {
      setError("Neuspješno dodavanje prisustva.");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Prisustva</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

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
        {prisustva.map((p, i) => (
          <li key={i}>{p.polaznikImePrezime} – {p.radionicaNaziv} ({p.status})</li>
        ))}
      </ul>
    </div>
  );
}

export default Prisustva;
