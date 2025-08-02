import React, { useEffect, useState } from 'react';
import './App.css';

const baseUrl = "https://eduplusbackend.onrender.com";

function Home() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState([]);
  const [selectedRadionica, setSelectedRadionica] = useState(null);

  const statusCycle = {
    NEPOZNATO: 'PRISUTAN',
    PRISUTAN: 'IZOSTAO',
    IZOSTAO: 'NEPOZNATO'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch(`${baseUrl}/api/radionice`).then(r => r.json()),
      fetch(`${baseUrl}/api/polaznici`).then(r => r.json()),
      fetch(`${baseUrl}/api/prisustva/view`).then(r => r.json())
    ])
      .then(([radData, polData, prisData]) => {
        setRadionice(radData);
        setPolaznici(polData);
        setPrisustva(prisData);
        if (radData.length > 0) setSelectedRadionica(radData[0]);
      })
      .catch(err => console.error("Greška prilikom dohvaćanja podataka", err));
  };

  const regenerateData = () => {
    fetch(`${baseUrl}/api/dev/seed`, { method: 'POST' })
      .then(() => window.location.reload())
      .catch(() => alert("Greška prilikom regeneracije podataka."));
  };

  const getStatusForPolaznik = (polaznik, radionica) => {
    const zapis = prisustva.find(p =>
      p.polaznikImePrezime === `${polaznik.ime} ${polaznik.prezime}` &&
      p.radionicaNaziv === radionica.naziv
    );
    return zapis ? zapis.status : 'NEPOZNATO';
  };

  const handleToggleStatus = (polaznik) => {
    if (!selectedRadionica) return;

    const imePrezime = `${polaznik.ime} ${polaznik.prezime}`;
    const radionicaNaziv = selectedRadionica.naziv;

    setPrisustva(prev => {
      const novaPrisustva = [...prev];
      const index = novaPrisustva.findIndex(p =>
        p.polaznikImePrezime === imePrezime &&
        p.radionicaNaziv === radionicaNaziv
      );

      if (index !== -1) {
        const trenutni = novaPrisustva[index].status;
        novaPrisustva[index].status = statusCycle[trenutni];
      } else {
        novaPrisustva.push({
          polaznikImePrezime: imePrezime,
          radionicaNaziv: radionicaNaziv,
          status: 'PRISUTAN'
        });
      }

      return novaPrisustva;
    });
  };

  const getColor = (status) => {
    switch (status) {
      case 'PRISUTAN': return '#b8e6b8';
      case 'IZOSTAO': return '#f5b5b5';
      case 'NEPOZNATO': return '#ffffff';
      default: return '#ffffff';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PRISUTAN': return 'Prisutan';
      case 'IZOSTAO': return 'Izostao';
      case 'NEPOZNATO': return 'Ne zna se';
      default: return '';
    }
  };


  const handleSaveStatus = (polaznik, status) => {
  if (!selectedRadionica) return;

  const payload = {
    polaznikId: polaznik.id,
    radionicaId: selectedRadionica.id,
    status: status
  };

  fetch(`${baseUrl}/api/prisustva`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Greška kod spremanja prisustva');
      }
    })
    .catch(err => console.error(err));
};

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center' }}>Evidencija prisustva</h2>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={regenerateData}
          style={{
            backgroundColor: '#ffb347',
            color: '#333',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          🔄 Generiraj nove podatke
        </button>
      </div>

      <div className="flex-row" style={{ display: 'flex', gap: '2rem', marginTop: '20px' }}>
        {/* Lijevi stupac */}
        <div style={{ flex: 1 }}>
          <h3>Popis svih radionica</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {radionice.map(r => (
              <li
                key={r.id}
                onClick={() => setSelectedRadionica(r)}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: selectedRadionica?.id === r.id ? '#e8f1fb' : '#f1f1f1',
                  cursor: 'pointer',
                  borderRadius: '5px',
                  border: selectedRadionica?.id === r.id ? '2px solid #0077cc' : '1px solid #ccc',
                  fontWeight: selectedRadionica?.id === r.id ? 'bold' : 'normal'
                }}
              >
                {r.naziv}
              </li>
            ))}
          </ul>
        </div>

        {/* Desni stupac */}
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
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: '500'
                    }}
                  >
                    <span>{p.ime} {p.prezime}</span>
                    <span style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#555' }}>
                      ({getStatusLabel(status)})
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
