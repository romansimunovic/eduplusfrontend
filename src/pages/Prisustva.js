import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Prisustva() {
  const [prisustva, setPrisustva] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [radionice, setRadionice] = useState([]);
  const [polaznikId, setPolaznikId] = useState('');
  const [radionicaId, setRadionicaId] = useState('');
  const [status, setStatus] = useState('PRISUTAN');
  const [filterRadionica, setFilterRadionica] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showStats, setShowStats] = useState(false);

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

  const handleAddOrUpdate = () => {
    if (!polaznikId || !radionicaId) {
      setError("Molimo odaberite polaznika i radionicu.");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const url = editId ? `${baseUrl}/api/prisustva/${editId}` : `${baseUrl}/api/prisustva`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polaznikId, radionicaId, status })
    })
      .then(res => {
        if (!res.ok) throw new Error("Greška kod spremanja podataka");
        return res.json();
      })
      .then(() => {
        setPolaznikId('');
        setRadionicaId('');
        setStatus('PRISUTAN');
        setEditId(null);
        setError(null);
        return fetch(`${baseUrl}/api/prisustva/view`).then(res => res.json()).then(setPrisustva);
      })
      .catch(err => {
        console.error(err);
        setError("Greška prilikom dodavanja ili ažuriranja.");
      });
  };

  const handleEdit = (prisustvo) => {
    const polaznik = polaznici.find(p => `${p.ime} ${p.prezime}` === prisustvo.polaznikImePrezime);
    const radionica = radionice.find(r => r.naziv === prisustvo.radionicaNaziv);
    if (!polaznik || !radionica) return;
    setPolaznikId(polaznik.id);
    setRadionicaId(radionica.id);
    setStatus(prisustvo.status);
    setEditId(prisustvo.id);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Jeste li sigurni da želite obrisati ovo prisustvo?")) return;

    fetch(`${baseUrl}/api/prisustva/${id}`, { method: 'DELETE' })
      .then(() => {
        setPrisustva(prisustva.filter(p => p.id !== id));
      })
      .catch(err => {
        console.error(err);
        setError("Greška prilikom brisanja prisustva.");
      });
  };

  const filtriranaPrisustva = filterRadionica
    ? prisustva.filter(p => p.radionicaNaziv === filterRadionica)
    : prisustva;

  const sortiranaPrisustva = [...filtriranaPrisustva].sort((a, b) => {
    if (!sortBy) return 0;
    return a[sortBy].localeCompare(b[sortBy]);
  });

  const brojPoStatusu = (status) =>
    filtriranaPrisustva.filter(p => p.status === status).length;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Prisustva</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
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

        <button onClick={handleAddOrUpdate}>
          {editId ? "Spremi izmjene" : "Dodaj prisustvo"}
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Filtriraj po radionici: </label>
        <select value={filterRadionica} onChange={e => setFilterRadionica(e.target.value)}>
          <option value="">Sve</option>
          {radionice.map(r => (
            <option key={r.id} value={r.naziv}>{r.naziv}</option>
          ))}
        </select>

        <label style={{ marginLeft: "1rem" }}>Sortiraj po: </label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="">Bez sortiranja</option>
          <option value="polaznikImePrezime">Polaznik</option>
          <option value="radionicaNaziv">Radionica</option>
          <option value="status">Status</option>
        </select>
      </div>

      <ul>
        {sortiranaPrisustva.map((p, index) => (
          <li key={index}>
            {p.polaznikImePrezime} – {p.radionicaNaziv} ({p.status})
            <button onClick={() => handleEdit(p)} style={{ marginLeft: '0.5rem' }}>Uredi</button>
            <button onClick={() => handleDelete(p.id)} style={{ marginLeft: '0.5rem' }}>Obriši</button>
          </li>
        ))}
      </ul>

      <button onClick={() => setShowStats(!showStats)} style={{ marginTop: "1rem" }}>
        {showStats ? "Sakrij statistiku" : "Prikaži statistiku"}
      </button>

      {showStats && (
        <div style={{ backgroundColor: "#f1f1f1", padding: "1rem", marginTop: "1rem" }}>
          <p>Ukupno prisustava: {filtriranaPrisustva.length}</p>
          <p>Prisutno: {brojPoStatusu("PRISUTAN")}</p>
          <p>Izostalo: {brojPoStatusu("IZOSTAO")}</p>
          <p>Odustalo: {brojPoStatusu("ODUSTAO")}</p>
        </div>
      )}
    </div>
  );
}

export default Prisustva;
