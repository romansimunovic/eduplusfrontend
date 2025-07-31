import React, { useEffect, useState } from 'react';
import './App.css';

const baseUrl = "https://eduplusbackend.onrender.com";

function Home() {
  const [radionice, setRadionice] = useState([]);
  const [polaznici, setPolaznici] = useState([]);
  const [prisustva, setPrisustva] = useState({});
  const [selectedRadionica, setSelectedRadionica] = useState(null);

  useEffect(() => {
    fetch(`${baseUrl}/api/radionice`)
      .then(res => res.json())
      .then(data => setRadionice(data))
      .catch(err => console.error("Greška kod dohvaćanja radionica", err));

    fetch(`${baseUrl}/api/polaznici`)
      .then(res => res.json())
      .then(data => setPolaznici(data))
      .catch(err => console.error("Greška kod dohvaćanja polaznika", err));
  }, []);

  const statusCycle = {
    UNKNOWN: 'PRESENT',
    PRESENT: 'ABSENT',
    ABSENT: 'UNKNOWN'
  };

  const handleSelectRadionica = (rad) => {
    setSelectedRadionica(rad);
    if (!prisustva[rad.id]) {
      setPrisustva(prev => ({
        ...prev,
        [rad.id]: {}
      }));
    }
  };

  const handleToggleStatus = (polaznikId) => {
    if (!selectedRadionica) return;

    const radId = selectedRadionica.id;
    const current = prisustva[radId]?.[polaznikId] || 'UNKNOWN';
    const next = statusCycle[current];

    setPrisustva(prev => ({
      ...prev,
      [radId]: {
        ...prev[radId],
        [polaznikId]: next
      }
    }));
  };

  const getColor = (status) => {
    switch (status) {
      case 'PRESENT': return '#d4f7d4'; // zelena
      case 'ABSENT': return '#f8d7da'; // crvena
      default: return '#ffffff'; // bijela
    }
  };

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center' }}>Evidencija prisustva</h2>
      <div className="flex-row" style={{ display: 'flex', gap: '2rem', marginTop: '20px' }}>
        {/* Lijevi stupac – radionice */}
        <div style={{ flex: 1 }}>
          <h3>Radionice</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {radionice.map(r => (
              <li
                key={r.id}
                onClick={() => handleSelectRadionica(r)}
                style={{
                  padding: '10px',
                  marginBottom: '5px',
                  backgroundColor: selectedRadionica?.id === r.id ? '#e8f1fb' : '#f1f1f1',
                  cursor: 'pointer',
                  borderRadius: '5px'
                }}
              >
                {r.naziv}
              </li>
            ))}
          </ul>
        </div>

        {/* Desni stupac – polaznici */}
        <div style={{ flex: 1 }}>
          <h3>Polaznici</h3>
          {selectedRadionica ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {polaznici.map(p => {
                const status = prisustva[selectedRadionica.id]?.[p.id] || 'UNKNOWN';
                return (
                  <li
                    key={p.id}
                    onClick={() => handleToggleStatus(p.id)}
                    style={{
                      padding: '10px',
                      marginBottom: '5px',
                      backgroundColor: getColor(status),
                      cursor: 'pointer',
                      borderRadius: '5px'
                    }}
                  >
                    {p.ime} {p.prezime}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Odaberite radionicu kako biste vidjeli polaznike.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
