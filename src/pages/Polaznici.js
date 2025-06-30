import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Polaznici() {
  const [polaznici, setPolaznici] = useState([]);
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [godinaRođenja, setGodinaRođenja] = useState("");
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [editId, setEditId] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const fetchPolaznici = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/polaznici`);
      if (!res.ok) throw new Error("Neuspješno dohvaćanje polaznika");
      const data = await res.json();
      setPolaznici(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Greška kod dohvata polaznika:", err);
      setError("Neuspješno dohvaćanje podataka o polaznicima.");
    }
  };

  useEffect(() => {
    fetchPolaznici();
  }, []);

  const handleAddOrUpdate = () => {
    if (!ime || !prezime || !email || !godinaRođenja) {
      setError("Sva polja su obavezna.");
      return;
    }

    const payload = {
      ime,
      prezime,
      email,
      godinaRođenja: parseInt(godinaRođenja)
    };

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${baseUrl}/api/polaznici/${editId}` : `${baseUrl}/api/polaznici`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Greška kod spremanja polaznika");
        return res.json();
      })
      .then(() => {
        fetchPolaznici();
        setIme("");
        setPrezime("");
        setEmail("");
        setGodinaRođenja("");
        setEditId(null);
        setError(null);
      })
      .catch(err => {
        console.error("Greška kod spremanja:", err);
        setError("Neuspješno spremanje polaznika.");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Jeste li sigurni da želite obrisati ovog polaznika?")) return;

    fetch(`${baseUrl}/api/polaznici/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setPolaznici(polaznici.filter(p => p.id !== id));
      })
      .catch(err => {
        console.error("Greška kod brisanja:", err);
        setError("Neuspješno brisanje polaznika.");
      });
  };

  const handleSort = (key) => {
    const sorted = [...polaznici].sort((a, b) => a[key].localeCompare(b[key]));
    setPolaznici(sorted);
    setSortKey(key);
  };

  const handleEdit = (polaznik) => {
    setIme(polaznik.ime);
    setPrezime(polaznik.prezime);
    setEmail(polaznik.email);
    setGodinaRođenja(polaznik.godinaRođenja);
    setEditId(polaznik.id);
  };

  const filtriraniPolaznici = polaznici.filter(p =>
    `${p.ime} ${p.prezime}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Polaznici</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <input value={ime} onChange={e => setIme(e.target.value)} placeholder="Ime" />
        <input value={prezime} onChange={e => setPrezime(e.target.value)} placeholder="Prezime" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input value={godinaRođenja} onChange={e => setGodinaRođenja(e.target.value)} placeholder="Godina rođenja" type="number" />
        <button onClick={handleAddOrUpdate}>{editId ? "Spremi izmjene" : "Dodaj"}</button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Pretraži polaznike po imenu"
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <select onChange={(e) => handleSort(e.target.value)} value={sortKey}>
          <option value="">Sortiraj</option>
          <option value="ime">Po imenu</option>
          <option value="prezime">Po prezimenu</option>
        </select>
      </div>

      <ul style={{ marginTop: "1rem" }}>
        {filtriraniPolaznici.map(p => (
          <li key={p.id}>
            {p.ime} {p.prezime} ({p.email}, {p.godinaRođenja})
            <button onClick={() => handleEdit(p)} style={{ marginLeft: '0.5rem' }}>Uredi</button>
            <button onClick={() => handleDelete(p.id)} style={{ marginLeft: '0.5rem' }}>Obriši</button>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: "1rem" }}>Ukupno polaznika: {filtriraniPolaznici.length}</p>
      <button onClick={() => setShowStats(!showStats)} style={{ marginTop: "0.5rem" }}>
        {showStats ? "Sakrij statistiku" : "Prikaži statistiku"}
      </button>

      {showStats && (
        <div style={{ marginTop: "1rem", backgroundColor: "#f1f1f1", padding: "1rem" }}>
          <p>Broj polaznika rođenih prije 2000.: {polaznici.filter(p => p.godinaRođenja < 2000).length}</p>
          <p>Broj polaznika rođenih od 2000. nadalje: {polaznici.filter(p => p.godinaRođenja >= 2000).length}</p>
        </div>
      )}
    </div>
  );
}

export default Polaznici;
