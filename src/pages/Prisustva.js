import React, { useEffect, useState } from 'react';
import './App.css';

const baseUrl = "https://eduplusbackend.onrender.com";

function Prisustva() {
  const [prisustva, setPrisustva] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [radionice, setRadionice] = useState([]);
  const [polaznikId, setPolaznikId] = useState('');
  const [radionicaId, setRadionicaId] = useState('');
  const [status, setStatus] = useState('PRISUTAN');
  const [editId, setEditId] = useState(null);
  const [filterRadionica, setFilterRadionica] = useState('');
  const [searchIme, setSearchIme] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedPolaznikId, setSelectedPolaznikId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, rRes, prRes] = await Promise.all([
        fetch(`${baseUrl}/api/polaznici`),
        fetch(`${baseUrl}/api/radionice`),
        fetch(`${baseUrl}/api/prisustva/view`)
      ]);

      const [polazniciData, radioniceData, prisustvaData] = await Promise.all([
        pRes.json(), rRes.json(), prRes.json()
      ]);

      setPolaznici(polazniciData);
      setRadionice(radioniceData);
      setPrisustva(prisustvaData);
    } catch (err) {
      console.error(err);
      setError("Greška prilikom dohvaćanja podataka.");
    }
  };

  const handleAddOrUpdate = () => {
    if (!polaznikId || !radionicaId || !status) {
      setError("Molimo odaberite sve podatke.");
      return;
    }
    setError(null);

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${baseUrl}/api/prisustva/${editId}` : `${baseUrl}/api/prisustva`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ polaznikId, radionicaId, status })
    })
      .then(res => res.json())
      .then(() => {
        fetch(`${baseUrl}/api/prisustva/view`)
          .then(res => res.json())
          .then(setPrisustva);
        setPolaznikId('');
        setRadionicaId('');
        setStatus('PRISUTAN');
        setEditId(null);
      })
      .catch(err => {
        console.error(err);
        setError("Greška kod spremanja prisustva.");
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
    if (!window.confirm("Jeste li sigurni?")) return;
    fetch(`${baseUrl}/api/prisustva/${id}`, { method: 'DELETE' })
      .then(() => setPrisustva(prev => prev.filter(p => p.id !== id)))
      .catch(err => setError("Greška prilikom brisanja prisustva."));
  };

  const prikaziStatus = (status, spol) => {
    const jeZensko = (spol || '').toLowerCase().startsWith('ž');
    if (status === 'PRISUTAN') return jeZensko ? 'Prisutna' : 'Prisutan';
    if (status === 'IZOSTAO') return jeZensko ? 'Izostala' : 'Izostao';
    if (status === 'ODUSTAO') return jeZensko ? 'Odustala' : 'Odustao';
    return 'Nepoznato';
  };

  const getColor = (status) => {
    switch (status) {
      case 'PRISUTAN': return '#c8facc';
      case 'IZOSTAO': return '#ffcaca';
      case 'ODUSTAO': return '#f9f3b6';
      default: return '#ffffff';
    }
  };

  const filtrirano = prisustva.filter(p => {
    const matchesRadionica = !filterRadionica || p.radionicaNaziv === filterRadionica;
    const matchesSearch = !searchIme || p.polaznikImePrezime.toLowerCase().includes(searchIme.toLowerCase());
    return matchesRadionica && matchesSearch;
  });

  const sortirano = [...filtrirano].sort((a, b) => {
    if (!sortBy) return 0;
    return a[sortBy].localeCompare(b[sortBy]);
  });

  const selectedPolaznik = polaznici.find(p => p.id === selectedPolaznikId);

const countByStatus = (statusToCount) => {
  return prisustva.filter(p =>
    (!selectedPolaznikId || p.polaznikId === selectedPolaznikId) &&
    p.status === statusToCount
  ).length;
};


  return (
    <div className="container">
      <h2>Prisustva</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="flex-row">
        <select value={polaznikId} onChange={e => setPolaznikId(e.target.value)}>
          <option value="">Polaznik</option>
          {polaznici.map(p => (
            <option key={p.id} value={p.id}>{p.ime} {p.prezime}</option>
          ))}
        </select>

        <select value={radionicaId} onChange={e => setRadionicaId(e.target.value)}>
          <option value="">Radionica</option>
          {radionice.map(r => (
            <option key={r.id} value={r.id}>{r.naziv}</option>
          ))}
        </select>

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="PRISUTAN">Prisutan</option>
          <option value="IZOSTAO">Izostao</option>
          <option value="ODUSTAO">Odustao</option>
        </select>

        <button onClick={handleAddOrUpdate}>{editId ? 'Spremi' : 'Dodaj'}</button>
      </div>

      <div className="flex-row">
        <label>Filter:</label>
        <select value={filterRadionica} onChange={e => setFilterRadionica(e.target.value)}>
          <option value="">Sve</option>
          {radionice.map(r => (
            <option key={r.id} value={r.naziv}>{r.naziv}</option>
          ))}
        </select>

        <label>Sort:</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="">Bez</option>
          <option value="polaznikImePrezime">Polaznik</option>
          <option value="radionicaNaziv">Radionica</option>
          <option value="status">Status</option>
        </select>

        <label>Pretraži ime:</label>
        <input type="text" value={searchIme} onChange={e => setSearchIme(e.target.value)} placeholder="npr. Ana Horvat" />
      </div>

      <div style={{ marginTop: "10px" }}>
        <button onClick={() => setShowStats(!showStats)}>
          {showStats ? 'Sakrij statistiku' : 'Prikaži statistiku'}
        </button>
      </div>

      <div style={{ maxHeight: "500px", overflowY: "auto", border: "1px solid #ddd", borderRadius: "8px", padding: "5px", marginTop: "10px" }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {sortirano.map((p, i) => {
            const polaznik = polaznici.find(x => `${x.ime} ${x.prezime}` === p.polaznikImePrezime);
            if (!polaznik) return null;
            const spol = polaznik.spol;
            const isSelected = polaznik.id === selectedPolaznikId;

            return (
              <li key={i}
                  onClick={() => setSelectedPolaznikId(polaznik.id)}
                  style={{
                    backgroundColor: getColor(p.status),
                    padding: "10px",
                    marginBottom: "8px",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: isSelected ? '2px solid #000' : '1px solid #ccc',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    cursor: 'pointer'
                  }}>
                <span>{p.polaznikImePrezime} – {p.radionicaNaziv} ({prikaziStatus(p.status, spol)})</span>
                <span>
                  <button onClick={() => handleEdit(p)}>Uredi</button>{' '}
                  <button onClick={() => handleDelete(p.id)}>Obriši</button>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {showStats && (
  <div className="stat-box">
    {selectedPolaznik && (
      <p><strong>Statistika za:</strong> {selectedPolaznik.ime} {selectedPolaznik.prezime}</p>
    )}
    <p>Ukupno: {
      prisustva.filter(p =>
        !selectedPolaznikId || p.polaznikId === selectedPolaznikId
      ).length
    }</p>
    <p>Prisutan: {countByStatus("PRISUTAN")}</p>
    <p>Izostao: {countByStatus("IZOSTAO")}</p>
    <p>Odustao: {countByStatus("ODUSTAO")}</p>
  </div>
)}

  );
}

export default Prisustva;
