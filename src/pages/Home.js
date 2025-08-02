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
      const [radioniceRes, polazniciRes, prisustvaRes] = await Promise.all([
        fetch(`${baseUrl}/api/radionice`).then(res => res.json()),
        fetch(`${baseUrl}/api/polaznici`).then(res => res.json()),
        fetch(`${baseUrl}/api/prisustva/view`).then(res => res.json())
      ]);
      setRadionice(radioniceRes);
      setPolaznici(polazniciRes);
      setPrisustva(prisustvaRes);
      setSelectedRadionica(radioniceRes[0] || null);
    } catch (err) {
      console.error("Greška pri dohvaćanju podataka:", err);
    }
  };

  const getStatus = (polaznikId) => {
    const zapis = prisustva.find(p => p.polaznikId === polaznikId && p.radionicaId === selectedRadionica?.id);
    return zapis ? zapis.status : "NEPOZNATO";
  };

  const getStatusLabel = (status, spol) => {
    const zensko = spol?.toLowerCase().startsWith("ž");
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

    const current = prisustva.find(p => p.polaznikId === polaznik.id && p.radionicaId === selectedRadionica.id);
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

    const method = current ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Greška u spremanju statusa");
      const updated = [...prisustva];
      if (current) {
        const index = updated.findIndex(p => p.id === current.id);
        updated[index].status = newStatus;
      } else {
        updated.push({ ...payload, id: Math.random() });
      }
      setPrisustva(updated);
    } catch (err) {
      console.error("Greška prilikom spremanja:", err);
    }
  };

  const handleGenerateData = async () => {
    try {
      await fetch(`${baseUrl}/api/seeder`, { method: "POST" });
      await fetchAll();
    } catch (err) {
      console.error("Greška kod generiranja podataka:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>EdukatorPlus – Evidencija prisustva</h2>

      <div style={{ textAlign: "center", margin: "1rem" }}>
        <button onClick={handleGenerateData}>🔄 Generiraj nove podatke</button>
      </div>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Radionice */}
        <div style={{ flex: 1 }}>
          <h3>Radionice (NGO sektor)</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {radionice.map(r => (
              <li key={r.id}
                  onClick={() => setSelectedRadionica(r)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    marginBottom: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    backgroundColor: selectedRadionica?.id === r.id ? "#d4ebff" : "#f3f3f3"
                  }}>
                <strong>{r.naziv}</strong><br />
                <small>{r.opis}</small>
              </li>
            ))}
          </ul>
        </div>

        {/* Polaznici */}
        <div style={{ flex: 1 }}>
          <h3>Sudionici / Sudionice</h3>
          {selectedRadionica ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {polaznici
                .filter(p => prisustva.some(pr => pr.radionicaId === selectedRadionica.id && pr.polaznikId === p.id))
                .map(p => {
                  const status = getStatus(p.id);
                  return (
                    <li key={p.id}
                        onClick={() => handleClick(p)}
                        style={{
                          backgroundColor: getColor(status),
                          padding: "10px",
                          marginBottom: "8px",
                          borderRadius: "6px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer"
                        }}>
                      <span>{p.ime} {p.prezime}</span>
                      <span style={{ fontStyle: "italic" }}>{getStatusLabel(status, p.spol)}</span>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <p>Molimo odaberi radionicu s popisa.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
