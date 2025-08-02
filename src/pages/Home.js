import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Home() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState([]);
  const [selectedRadionica, setSelectedRadionica] = useState(null);

  const statusCycle = {
    NEPOZNATO: 'PRISUTAN',
    PRISUTAN: 'IZOSTAO',
    IZOSTAO: 'ODUSTAO',
    ODUSTAO: 'NEPOZNATO'
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [r, p, pr] = await Promise.all([
        fetch(`${baseUrl}/api/radionice`).then(res => res.json()),
        fetch(`${baseUrl}/api/polaznici`).then(res => res.json()),
        fetch(`${baseUrl}/api/prisustva/view`).then(res => res.json())
      ]);
      setRadionice(r);
      setPolaznici(p);
      setPrisustva(pr);
      setSelectedRadionica(r[0] || null);
    } catch (err) {
      console.error("Greška pri dohvaćanju podataka", err);
    }
  };

  const getStatus = (polaznik) => {
    const zapis = prisustva.find(p =>
      p.polaznikId === polaznik.id &&
      p.radionicaId === selectedRadionica?.id
    );
    return zapis ? zapis.status : "NEPOZNATO";
  };

  const getStatusLabel = (status, spol) => {
    const zensko = spol?.toLowerCase().startsWith('ž');
    switch (status) {
      case 'PRISUTAN': return zensko ? 'Prisutna' : 'Prisutan';
      case 'IZOSTAO': return zensko ? 'Izostala' : 'Izostao';
      case 'ODUSTAO': return zensko ? 'Odustala' : 'Odustao';
      default: return 'Nepoznato';
    }
  };

  const getColor = (status) => {
    switch (status) {
      case 'PRISUTAN': return '#c8facc';
      case 'IZOSTAO': return '#ffcaca';
      case 'ODUSTAO': return '#f0e68c';
      default: return '#ffffff';
    }
  };

  const handleClick = async (polaznik) => {
    if (!selectedRadionica) return;

    const currentPrisustvo = prisustva.find(p =>
      p.polaznikId === polaznik.id &&
      p.radionicaId === selectedRadionica.id
    );

    const currentStatus = currentPrisustvo ? currentPrisustvo.status : "NEPOZNATO";
    const newStatus = statusCycle[currentStatus];

    const payload = {
      polaznikId: polaznik.id,
      radionicaId: selectedRadionica.id,
      status: newStatus
    };

    const endpoint = currentPrisustvo
      ? `${baseUrl}/api/prisustva/${currentPrisustvo.id}`
      : `${baseUrl}/api/prisustva`;
    const method = currentPrisustvo ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Greška u spremanju prisustva");
      await fetchAll();
    } catch (err) {
      console.error("Greška pri spremanju statusa", err);
    }
  };

  const handleGenerateData = async () => {
    try {
      await fetch(`${baseUrl}/api/seeder`, { method: 'POST' });
      await fetchAll();
    } catch (err) {
      console.error("Greška pri generiranju novih podataka", err);
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Evidencija prisustva</h2>
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button onClick={handleGenerateData}>🔄 Generiraj nove podatke</button>
      </div>

      <div style={{ display: "flex", gap: "2rem", padding: "20px" }}>
        <div style={{ flex: 1 }}>
          <h3>Popis radionica</h3>
          <ul>
            {radionice.map(r => (
              <li key={r.id}
                  onClick={() => setSelectedRadionica(r)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: selectedRadionica?.id === r.id ? "#e0f0ff" : "#f9f9f9",
                    border: "1px solid #ccc",
                    padding: "8px",
                    marginBottom: "5px"
                  }}>
                {r.naziv}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Popis polaznika/polaznica</h3>
          {selectedRadionica ? (
            <ul>
              {polaznici.map(p => {
                const status = getStatus(p);
                return (
                  <li key={p.id}
                      onClick={() => handleClick(p)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: getColor(status),
                        padding: "8px",
                        marginBottom: "5px",
                        display: "flex",
                        justifyContent: "space-between"
                      }}>
                    <span>{p.ime} {p.prezime}</span>
                    <span style={{ fontStyle: "italic" }}>{getStatusLabel(status, p.spol)}</span>
                  </li>
                );
              })}
            </ul>
          ) : <p>Odaberi radionicu</p>}
        </div>
      </div>
    </div>
  );
}

export default Home;
