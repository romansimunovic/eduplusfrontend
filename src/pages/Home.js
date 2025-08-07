import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Home() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState([]);
  const [selectedRadionica, setSelectedRadionica] = useState(null);
  const [loading, setLoading] = useState(false); // loader za gumb

  const statusCycle = {
    NEPOZNATO: 'PRISUTAN',
    PRISUTAN: 'IZOSTAO',
    IZOSTAO: 'ODUSTAO',
    ODUSTAO: 'NEPOZNATO'
  };

  // 🔔 Ping backend servera da ga "probudimo" kad se frontend pokrene
  useEffect(() => {
    fetch(`${baseUrl}/api/ping`).catch(err =>
      console.warn("Ping failed (vjerojatno backend još spava):", err)
    );
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [radioniceRes, polazniciRes, prisustvaRes] = await Promise.all([
        fetch(`${baseUrl}/api/radionice`).then(res => res.json()),
        fetch(`${baseUrl}/api/polaznici`).then(res => res.json()),
        fetch(`${baseUrl}/api/prisustva`).then(res => res.json())
      ]);
      setRadionice(radioniceRes);
      setPolaznici(polazniciRes);
      setPrisustva(prisustvaRes);
      setSelectedRadionica(radioniceRes[0] || null);
    } catch (err) {
      console.error("Greška pri dohvaćanju podataka:", err);
    }
  };

  const getStatusLabel = (status, spol) => {
    const zensko = (spol || '').toUpperCase() === 'Ž';
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
      case 'ODUSTAO': return '#f9f3b6';
      default: return '#ffffff';
    }
  };

  const handleClick = async (polaznik) => {
    if (!selectedRadionica) return;

    const current = prisustva.find(p =>
      p.polaznikId === polaznik.id && p.radionicaId === selectedRadionica.id
    );

    const currentStatus = current ? current.status : "NEPOZNATO";
    const newStatus = statusCycle[currentStatus];

    const payload = {
      polaznikId: polaznik.id,
      radionicaId: selectedRadionica.id,
      status: newStatus
    };

    const endpoint = current
      ? `${baseUrl}/api/prisustva/${current.id}`
      : `${baseUrl}/api/prisustva`;
    const method = current ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Greška u spremanju statusa");

      setPrisustva(prev => {
        if (current) {
          return prev.map(p =>
            p.id === current.id ? { ...p, status: newStatus } : p
          );
        } else {
          return [...prev, { ...payload, id: Math.random() }];
        }
      });
    } catch (err) {
      console.error("Greška prilikom spremanja:", err);
    }
  };

  const handleGenerateData = async () => {
    setLoading(true);
    try {
      await fetch(`${baseUrl}/api/dev/seed`, { method: "POST" });
      await fetchAll();
    } catch (err) {
      console.error("Greška kod generiranja podataka:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button onClick={handleGenerateData} disabled={loading}>
          {loading ? "Učitavanje..." : "Generiraj nove podatke"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Lijevi stupac - radionice */}
        <div style={{ flex: 1 }}>
          <h3>Popis svih radionica</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {radionice.map(r => (
              <li key={r.id}
                  onClick={() => setSelectedRadionica(r)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: selectedRadionica?.id === r.id ? "#d4ebff" : "#f3f3f3",
                    padding: "10px",
                    marginBottom: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc"
                  }}>
                <strong>{r.naziv}</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* Desni stupac - polaznici */}
        <div style={{ flex: 1 }}>
          <h3>Popis sudionika</h3>
          {selectedRadionica ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {prisustva
                .filter(pr => pr.radionicaId === selectedRadionica.id)
                .map(pr => {
                  const polaznik = polaznici.find(p => p.id === pr.polaznikId);
                  if (!polaznik) return null;

                  return (
                    <li key={polaznik.id}
                        onClick={() => handleClick(polaznik)}
                        style={{
                          backgroundColor: getColor(pr.status),
                          padding: "10px",
                          marginBottom: "8px",
                          borderRadius: "6px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer"
                        }}>
                      <span>{polaznik.ime} {polaznik.prezime}</span>
                      <span style={{ fontStyle: "italic" }}>
                        {getStatusLabel(pr.status, polaznik.spol)}
                      </span>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <p>Odaberi radionicu za prikaz sudionika.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
