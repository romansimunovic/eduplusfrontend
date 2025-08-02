import React, { useEffect, useState } from 'react';

const baseUrl = "https://eduplusbackend.onrender.com";

function Home() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState([]);
  const [selectedRadionica, setSelectedRadionica] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusCycle = {
    NEPOZNATO: 'PRISUTAN',
    PRISUTAN: 'IZOSTAO',
    IZOSTAO: 'ODUSTAO',
    ODUSTAO: 'NEPOZNATO'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const previousSelectedId = selectedRadionica?.id;
    setLoading(true);

    Promise.all([
      fetch(`${baseUrl}/api/radionice`).then(r => r.json()),
      fetch(`${baseUrl}/api/polaznici`).then(r => r.json()),
      fetch(`${baseUrl}/api/prisustva/view`).then(r => r.json())
    ])
      .then(([radData, polData, prisData]) => {
        setRadionice(radData);
        setPolaznici(polData);
        setPrisustva(prisData);

        const stillExists = radData.find(r => r.id === previousSelectedId);
        setSelectedRadionica(stillExists || radData[0] || null);
      })
      .catch(err => console.error("Greška prilikom dohvaćanja podataka", err))
      .finally(() => setLoading(false));
  };

  const regenerateData = () => {
    setLoading(true);
    fetch(`${baseUrl}/api/dev/seed`, { method: 'POST' })
      .then(() => fetchData())
      .catch(() => alert("Greška prilikom regeneracije podataka."))
      .finally(() => setLoading(false));
  };

  const getStatusForPolaznik = (polaznik, radionica) => {
    const zapis = prisustva.find(p =>
      p.polaznikImePrezime === `${polaznik.ime} ${polaznik.prezime}` &&
      p.radionicaNaziv === radionica.naziv
    );
    return zapis ? zapis.status : 'NEPOZNATO';
  };

  const getStatusLabel = (status, spol) => {
    const jeZensko = spol?.toUpperCase() === 'Ž';
    switch (status) {
      case 'PRISUTAN': return jeZensko ? 'Prisutna' : 'Prisutan';
      case 'IZOSTAO': return jeZensko ? 'Izostala' : 'Izostao';
      case 'ODUSTAO': return jeZensko ? 'Odustala' : 'Odustao';
      case 'NEPOZNATO': default: return 'Nepoznato';
    }
  };

  const handleToggleStatus = (polaznik) => {
    if (!selectedRadionica || !polaznik) return;

    const imePrezime = `${polaznik.ime} ${polaznik.prezime}`;
    const radionicaNaziv = selectedRadionica.naziv;

    const zapis = prisustva.find(p =>
      p.polaznikImePrezime === imePrezime &&
      p.radionicaNaziv === radionicaNaziv
    );

    const currentStatus = zapis ? zapis.status : 'NEPOZNATO';
    const newStatus = statusCycle[currentStatus];

    const payload = {
      polaznikId: polaznik.id,
      radionicaId: selectedRadionica.id,
      status: newStatus
    };

    const isExisting = !!(zapis && zapis.id);
    const endpoint = isExisting ? `${baseUrl}/api/prisustva/${zapis.id}` : `${baseUrl}/api/prisustva`;
    const method = isExisting ? 'PUT' : 'POST';

    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(() => {
        const updated = isExisting
          ? prisustva.map(p => p.id === zapis.id ? { ...p, status: newStatus } : p)
          : [...prisustva, {
              polaznikImePrezime: imePrezime,
              radionicaNaziv: radionicaNaziv,
              status: newStatus,
              rodnoOsjetljivTekst: getStatusLabel(newStatus, polaznik.spol)
            }];
        setPrisustva(updated);
      })
      .catch(err => console.error("Greška kod spremanja prisustva", err));
  };

  const getColor = (status) => {
    switch (status) {
      case 'PRISUTAN': return '#b8e6b8';
      case 'IZOSTAO': return '#f5b5b5';
      case 'ODUSTAO': return '#f0e68c';
      case 'NEPOZNATO': default: return '#ffffff';
    }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>Evidencija prisustva</h2>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={regenerateData}>Generiraj nove podatke</button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Popis svih radionica</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {radionice.map(r => (
              <li
                key={r.id}
                onClick={() => setSelectedRadionica(r)}
                style={{
                  padding: '10px',
                  marginBottom: '8px',
                  backgroundColor: selectedRadionica?.id === r.id ? '#e8f1fb' : '#f1f1f1',
                  cursor: 'pointer',
                  border: selectedRadionica?.id === r.id ? '2px solid #0077cc' : '1px solid #ccc'
                }}
              >
                {r.naziv}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Popis polaznika i polaznica</h3>
          {selectedRadionica ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {polaznici.map(p => {
                const status = getStatusForPolaznik(p, selectedRadionica);
                return (
                  <li
                    key={p.id}
                    onClick={() => handleToggleStatus(p)}
                    style={{
                      padding: '10px',
                      marginBottom: '5px',
                      backgroundColor: getColor(status),
                      cursor: 'pointer',
                      borderRadius: '5px',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{p.ime} {p.prezime}</span>
                    <span style={{ fontStyle: 'italic' }}>
                      ({getStatusLabel(status, p.spol)})
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Odaberite radionicu za prikaz polaznika.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
