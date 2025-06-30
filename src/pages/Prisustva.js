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
  const [filterRadionica, setFilterRadionica] = useState('');

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

  useEffect(() => {
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
      .then(() => fetchData())
      .catch(err => {
        console.error(err);
        setError("Neuspješno dodavanje prisustva.");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Jeste li sigurni da želite obrisati ovo prisustvo?")) return;

    fetch(`${baseUrl}/api/prisustva/${id}`, {
      method: 'DELETE'
    })
      .then(() => fetchData())
      .catch(err => {
        console.error("Greška prilikom brisanja prisustva.", err);
        setError("Greška prilikom brisanja prisustva.");
      });
  };

  const filtriranaPrisustva = filterRadionica
    ? prisustva.filter(p => p.radionicaNaziv === filterRadionica)
    : prisustva;

  const brojPoStatusu = (status) => filtriranaPrisustva.filter(p => p.status === status).length;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "700px", margin: "0 auto" }}>
      <h2>Prisustva</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
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

      <div style={{ marginBottom: "1rem" }}>
        <label>Filtriraj po radionici: </label>
        <select value={filterRadionica} onChange={e => setFilterRadionica(e.target.value)}>
          <option value="">Sve</option>
          {radionice.map(r => (
            <option key={r.id} value={r.naziv}>{r.naziv}</option>
          ))}
        </select>
      </div>

      <p>Ukupno prisustava: {filtriranaPrisustva.length}</p>
      <p>Prisutnih: {brojPoStatusu("PRISUTAN")} | Izostali: {brojPoStatusu("IZOSTAO")} | Odustali: {brojPoStatusu("ODUSTAO")}</p>

      <ul>
        {Array.isArray(filtriranaPrisustva) && filtriranaPrisustva.map((p, index) => (
          <li key={index}>
            {p.polaznikImePrezime} – {p.radionicaNaziv} ({p.status})
            <button onClick={() => handleDelete(p.id)} style={{ marginLeft: '1rem' }}>Obriši</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Prisustva;
